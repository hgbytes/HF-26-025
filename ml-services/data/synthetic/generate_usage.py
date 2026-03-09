"""
generate_usage.py  —  Dataset 1: Drug Usage History  (~3,500 rows)
Module 1: Demand Forecasting
Target: ~10,000 rows
Columns produced
────────────────
record_id, drug_name, region, lat, lng, facility_type, facility_id,
year, month, season, disease_season_flag, quantity_dispensed,
stock_opening, stock_closing, reorder_triggered, price_per_unit_inr,
total_value_inr, past_30d_usage, past_90d_usage
"""

import os
import uuid
import random

import numpy as np
import pandas as pd

from constants import (
    DRUGS,
    REGIONS,
    FACILITY_TYPES,
    DISEASE_SEASON_FLAGS,
    SEASONALITY_MULTIPLIERS,
    PRICE_PER_UNIT_INR,
    QUANTITY_RANGES,
    FACILITY_REGISTRY,
    PROCESSED_DIR,
    get_season,
)

# ~87 % of 480 (drug × region × ftype) combos kept → ≈10,000 rows over 24 months
INCLUSION_RATE = 0.87


def generate():
    """Generate Dataset 1 and write to *drug_usage.csv*.  Returns the DataFrame."""
    np.random.seed(42)
    random.seed(42)

    # ── decide which (drug, region, facility_type) combos are active ─────
    active = []
    for drug in DRUGS:
        for region in REGIONS:
            for ftype in FACILITY_TYPES:
                if random.random() < INCLUSION_RATE:
                    active.append((drug, region, ftype))

    # ── generate monthly records for every active combo ──────────────────
    rows = []
    for drug, region, ftype in active:
        fid         = FACILITY_REGISTRY[(region, ftype)]
        lat, lng    = REGIONS[region]
        price       = PRICE_PER_UNIT_INR[drug]
        qty_lo, qty_hi = QUANTITY_RANGES[ftype]
        base_qty    = random.randint(qty_lo, qty_hi)

        # pre-compute 24 monthly quantities (for lag features)
        monthly = []                       # [(year, month, qty), …]
        for year in (2023, 2024):
            for month in range(1, 13):
                dsf = 1 if month in DISEASE_SEASON_FLAGS[drug] else 0
                qty = base_qty
                if dsf:
                    qty = int(qty * SEASONALITY_MULTIPLIERS[drug])
                # ±15 % random noise
                qty = max(10, int(qty * np.random.normal(1.0, 0.15)))
                monthly.append((year, month, qty))

        for idx, (year, month, qty) in enumerate(monthly):
            season = get_season(month)
            dsf    = 1 if month in DISEASE_SEASON_FLAGS[drug] else 0

            # stock levels
            stock_opening = int(qty * random.uniform(1.5, 3.0))
            received      = int(qty * random.uniform(0.3, 1.2))
            stock_closing = max(0, stock_opening + received - qty)
            reorder       = 1 if stock_closing < 0.20 * stock_opening else 0

            # lag features
            past_30d = monthly[idx - 1][2] if idx >= 1 else 0
            past_90d = sum(m[2] for m in monthly[max(0, idx - 3):idx])

            rows.append({
                "record_id":           str(uuid.uuid4()),
                "drug_name":           drug,
                "region":              region,
                "lat":                 lat,
                "lng":                 lng,
                "facility_type":       ftype,
                "facility_id":         fid,
                "year":                year,
                "month":               month,
                "season":              season,
                "disease_season_flag": dsf,
                "quantity_dispensed":   qty,
                "stock_opening":       stock_opening,
                "stock_closing":       stock_closing,
                "reorder_triggered":   reorder,
                "price_per_unit_inr":  price,
                "total_value_inr":     qty * price,
                "past_30d_usage":      past_30d,
                "past_90d_usage":      past_90d,
            })

    df = pd.DataFrame(rows)

    os.makedirs(PROCESSED_DIR, exist_ok=True)
    out = os.path.join(PROCESSED_DIR, "drug_usage.csv")
    df.to_csv(out, index=False)
    print(f"    drug_usage.csv         : {len(df):>6,} rows")
    return df


# allow standalone execution
if __name__ == "__main__":
    generate()
