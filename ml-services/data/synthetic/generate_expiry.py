"""
generate_expiry.py  —  Dataset 3: Batch Expiry & Wastage Log  (~2,000 rows)
Module 3: Expiry Waste Prediction
Target: ~10,000 rows
Columns produced
────────────────
batch_id, drug_name, region, facility_type, manufacture_date, expiry_date,
shelf_life_months, arrival_date, days_to_expiry_on_arrival, initial_quantity,
avg_daily_consumption, demand_forecast_30d, season_on_arrival,
disease_season_flag, quantity_remaining_30d_before_expiry, quantity_wasted,
expired_unused, redistribution_done, redistribution_region

Wastage rules
─────────────
  • 18 % of batches  →  expire with >10 % quantity remaining
  •  5 % of batches  →  expire completely unused
  • Insulin (12 mo shelf life) = highest risk
  • Chloroquine (60 mo)         = lowest risk
"""

import os
import random

import numpy as np
import pandas as pd
from datetime import datetime, timedelta

from constants import (
    DRUGS,
    REGIONS,
    FACILITY_TYPES,
    DISEASE_SEASON_FLAGS,
    SHELF_LIFE_MONTHS,
    QUANTITY_RANGES,
    PROCESSED_DIR,
    get_season,
)

TARGET_BATCHES = 10000


def generate(usage_df=None):
    """Generate Dataset 3 and write to *batch_expiry.csv*.  Returns the DataFrame."""
    np.random.seed(43)
    random.seed(43)

    # ── mean monthly demand per (drug, region) from Dataset 1 ────────────
    if usage_df is None:
        usage_df = pd.read_csv(os.path.join(PROCESSED_DIR, "drug_usage.csv"))

    demand_mean = (
        usage_df
        .groupby(["drug_name", "region"])["quantity_dispensed"]
        .mean()
        .to_dict()
    )

    date_start = datetime(2023, 1, 1)
    date_end   = datetime(2024, 12, 31)
    span_days  = (date_end - date_start).days

    rows      = []
    batch_num = 1

    for _ in range(TARGET_BATCHES):
        drug   = random.choice(DRUGS)
        region = random.choice(list(REGIONS))
        ftype  = random.choice(FACILITY_TYPES)
        shelf  = SHELF_LIFE_MONTHS[drug]

        # ── dates ────────────────────────────────────────────────────────
        mfg_date   = date_start + timedelta(days=random.randint(0, span_days))
        arrival_dt = mfg_date   + timedelta(days=random.randint(15, 90))
        expiry_dt  = mfg_date   + timedelta(days=shelf * 30)
        days_to_exp = (expiry_dt - arrival_dt).days
        if days_to_exp <= 0:
            continue

        # ── quantities ───────────────────────────────────────────────────
        qty_lo, qty_hi = QUANTITY_RANGES[ftype]
        init_qty = random.randint(qty_lo, qty_hi)

        # avg_daily calibrated as a *fraction* of what would be needed to
        # consume the full batch before expiry — this guarantees a mix of
        # fully-consumed and partially-remaining batches.
        ideal_daily = init_qty / max(1, days_to_exp)
        # turnover_factor: 0.3-1.4 → some batches consumed fast, others slow
        turnover_factor = np.random.uniform(0.3, 1.4)
        avg_daily   = max(0.5, ideal_daily * turnover_factor)
        forecast_30 = int(avg_daily * 30)

        # ── season / disease flag on arrival ─────────────────────────────
        season = get_season(arrival_dt.month)
        dsf    = 1 if arrival_dt.month in DISEASE_SEASON_FLAGS[drug] else 0

        # ── remaining qty 30 days before expiry ─────────────────────────
        consume_days    = max(0, days_to_exp - 30)
        consumed        = min(init_qty, int(avg_daily * consume_days * random.uniform(0.85, 1.15)))
        qty_remain_30d  = max(0, init_qty - consumed)

        # ── wastage simulation (feature-driven) ─────────────────────────
        #    quantity_wasted is a deterministic function of observable
        #    features + moderate noise, so a tree model can learn it.
        #
        #    Core idea: waste ≈ remaining_qty × risk_factor
        #      risk_factor depends on:
        #        - shelf_life (shorter → more risk)
        #        - utilisation rate  (low consumption vs qty → more risk)
        #        - disease season flag  (in-season drugs get used faster → less waste)
        #        - facility type (PHCs have smaller throughput → higher waste %)

        # utilisation ratio: what fraction of stock is consumed before expiry?
        total_possible_consumed = avg_daily * days_to_exp
        utilisation_ratio = min(1.0, total_possible_consumed / max(1, init_qty))

        # shelf-life risk: 12 mo → 1.0, 60 mo → 0.0
        shelf_risk = 1.0 - (shelf / 60.0)

        # facility-type risk: smaller facilities waste more proportionally
        ftype_risk = {"Government Hospital": 0.10, "Private Hospital": 0.15,
                      "Primary Health Centre": 0.30, "Pharmacy": 0.25}[ftype]

        # season benefit: drugs arriving in their peak-demand season get used
        season_benefit = 0.15 if dsf else 0.0

        # base waste fraction = how much of the remaining stock expires
        base_waste_frac = (
            0.60 * (1.0 - utilisation_ratio)   # low usage → high waste
          + 0.20 * shelf_risk                   # short shelf → more waste
          + 0.15 * ftype_risk                   # facility throughput effect
          - 0.10 * season_benefit               # peak demand reduces waste
        )
        base_waste_frac = max(0.0, min(1.0, base_waste_frac))

        # apply to remaining quantity with ±15 % noise
        noise = np.random.normal(1.0, 0.15)
        qty_wasted = max(0, int(qty_remain_30d * base_waste_frac * noise))
        qty_wasted = min(qty_wasted, init_qty)  # can't waste more than received

        expired_unused = 1 if qty_wasted >= init_qty * 0.95 else 0

        # ── redistribution ───────────────────────────────────────────────
        redist_done   = 0
        redist_region = None
        if qty_remain_30d > init_qty * 0.15 and random.random() < 0.40:
            redist_done   = 1
            redist_region = random.choice([r for r in REGIONS if r != region])
            qty_wasted    = max(0, int(qty_wasted * random.uniform(0.0, 0.30)))

        batch_id  = f"BATCH_TN_{mfg_date.year}_{batch_num:04d}"
        batch_num += 1

        rows.append({
            "batch_id":                             batch_id,
            "drug_name":                            drug,
            "region":                               region,
            "facility_type":                        ftype,
            "manufacture_date":                     mfg_date.strftime("%Y-%m-%d"),
            "expiry_date":                          expiry_dt.strftime("%Y-%m-%d"),
            "shelf_life_months":                    shelf,
            "arrival_date":                         arrival_dt.strftime("%Y-%m-%d"),
            "days_to_expiry_on_arrival":            days_to_exp,
            "initial_quantity":                     init_qty,
            "avg_daily_consumption":                round(avg_daily, 2),
            "demand_forecast_30d":                  forecast_30,
            "season_on_arrival":                    season,
            "disease_season_flag":                  dsf,
            "quantity_remaining_30d_before_expiry":  qty_remain_30d,
            "quantity_wasted":                      qty_wasted,
            "expired_unused":                       expired_unused,
            "redistribution_done":                  redist_done,
            "redistribution_region":                redist_region,
        })

    df = pd.DataFrame(rows)

    os.makedirs(PROCESSED_DIR, exist_ok=True)
    out = os.path.join(PROCESSED_DIR, "batch_expiry.csv")
    df.to_csv(out, index=False)
    print(f"    batch_expiry.csv       : {len(df):>6,} rows")
    return df


if __name__ == "__main__":
    generate()
