"""
generate_regional.py  —  Dataset 4: Regional Demand Index  (~10,000 rows)
Module 4: Regional Heatmap

Target: ~10,000 rows
  10 regions × 12 drugs × 4 facility_types × 24 months = 11,520 theoretical
  × ~87 % inclusion ≈ 10,022 rows

Columns produced
────────────────
region, lat, lng, drug_name, facility_type, month, year, season,
disease_season_flag, population_est, facility_count,
disease_prevalence_index, total_quantity_demanded, total_quantity_supplied,
supply_gap, demand_per_capita, demand_score
"""

import os
import random

import numpy as np
import pandas as pd

from constants import (
    DRUGS,
    REGIONS,
    FACILITY_TYPES,
    DISEASE_SEASON_FLAGS,
    SEASONALITY_MULTIPLIERS,
    POPULATION_EST,
    FACILITY_COUNT,
    PROCESSED_DIR,
    get_season,
)

INCLUSION_RATE = 0.87


def generate(usage_df=None):
    """Generate Dataset 4 and write to *regional_demand.csv*.  Returns the DataFrame."""
    np.random.seed(45)
    random.seed(45)

    # ── load usage data for aggregation ──────────────────────────────────
    if usage_df is None:
        usage_df = pd.read_csv(os.path.join(PROCESSED_DIR, "drug_usage.csv"))

    rows = []
    for region in REGIONS:
        lat, lng = REGIONS[region]
        pop      = POPULATION_EST[region]
        facs     = FACILITY_COUNT[region]

        for drug in DRUGS:
            for ftype in FACILITY_TYPES:
                for year in (2023, 2024):
                    for month in range(1, 13):
                        if random.random() > INCLUSION_RATE:
                            continue

                        season = get_season(month)
                        dsf    = 1 if month in DISEASE_SEASON_FLAGS[drug] else 0

                        # ── aggregate actual dispensed qty from Dataset 1 ─
                        mask = (
                            (usage_df["drug_name"]    == drug) &
                            (usage_df["region"]       == region) &
                            (usage_df["facility_type"] == ftype) &
                            (usage_df["year"]         == year) &
                            (usage_df["month"]        == month)
                        )
                        sub = usage_df.loc[mask]
                        total_demanded = int(sub["quantity_dispensed"].sum()) if len(sub) else 0

                        # fill gap when combo was dropped
                        if total_demanded == 0:
                            base = random.randint(500, 5000)
                            if dsf:
                                base = int(base * SEASONALITY_MULTIPLIERS[drug])
                            total_demanded = max(100, int(base * np.random.normal(1.0, 0.12)))

                        # supply: 85 %–102 % of demand
                        total_supplied = int(total_demanded * random.uniform(0.85, 1.02))
                        supply_gap     = round(
                            max(0, (total_demanded - total_supplied) / max(1, total_demanded)), 4
                        )
                        dpc = round(total_demanded / pop, 6)

                        # disease prevalence index (0–1)
                        dpi = random.uniform(0.05, 0.35)
                        if dsf:
                            dpi *= SEASONALITY_MULTIPLIERS[drug]
                        dpi = round(min(1.0, dpi), 4)

                        rows.append({
                            "region":                    region,
                            "lat":                       lat,
                            "lng":                       lng,
                            "drug_name":                 drug,
                            "facility_type":             ftype,
                            "month":                     month,
                            "year":                      year,
                            "season":                    season,
                            "disease_season_flag":       dsf,
                            "population_est":            pop,
                            "facility_count":            facs,
                            "disease_prevalence_index":  dpi,
                            "total_quantity_demanded":   total_demanded,
                            "total_quantity_supplied":   total_supplied,
                            "supply_gap":                supply_gap,
                            "demand_per_capita":         dpc,
                            "demand_score":              0.0,
                        })

    df = pd.DataFrame(rows)

    # ── normalize demand_score to [0, 1] ─────────────────────────────────
    lo = df["total_quantity_demanded"].min()
    hi = df["total_quantity_demanded"].max()
    df["demand_score"] = ((df["total_quantity_demanded"] - lo) / max(1, hi - lo)).round(4)

    os.makedirs(PROCESSED_DIR, exist_ok=True)
    out = os.path.join(PROCESSED_DIR, "regional_demand.csv")
    df.to_csv(out, index=False)
    print(f"    regional_demand.csv    : {len(df):>6,} rows")
    return df


if __name__ == "__main__":
    generate()
