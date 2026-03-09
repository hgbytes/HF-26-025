"""
run_all.py  —  Generate all four Tamil Nadu Medical Inventory datasets
in the correct dependency order.

Dependency graph
────────────────
  Dataset 1  (Usage)    ──►  Dataset 3  (Expiry)    ──►  Dataset 2  (Movements)
  Dataset 1  (Usage)    ──►  Dataset 4  (Regional)

Output directory:  data/processed/
"""

import os
import sys
import time

# ensure this directory is on the import path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import generate_usage
import generate_expiry
import generate_movements
import generate_regional

from constants import PROCESSED_DIR


def main():
    t0 = time.time()

    print("=" * 64)
    print("  Tamil Nadu Medical Inventory — Synthetic Data Generation")
    print("=" * 64)
    print(f"  Output → {PROCESSED_DIR}\n")

    # ── 1. Drug Usage History (no dependencies) ──────────────────────────
    print("[1/4] Drug Usage History …")
    df_usage = generate_usage.generate()

    # ── 2. Batch Expiry & Wastage (depends on Dataset 1) ────────────────
    print("\n[2/4] Batch Expiry & Wastage Log …")
    df_expiry = generate_expiry.generate(usage_df=df_usage)

    # ── 3. Stock Movements & Transfers (depends on Dataset 3) ───────────
    print("\n[3/4] Stock Movement & Transfer Log …")
    df_movements = generate_movements.generate(expiry_df=df_expiry)

    # ── 4. Regional Demand Index (depends on Dataset 1) ─────────────────
    print("\n[4/4] Regional Demand Index …")
    df_regional = generate_regional.generate(usage_df=df_usage)

    # ── summary ──────────────────────────────────────────────────────────
    elapsed = time.time() - t0
    total   = len(df_usage) + len(df_expiry) + len(df_movements) + len(df_regional)

    print("\n" + "=" * 64)
    print(f"  Completed in {elapsed:.1f} s")
    print()
    print(f"    drug_usage.csv         : {len(df_usage):>6,} rows")
    print(f"    batch_expiry.csv       : {len(df_expiry):>6,} rows")
    print(f"    stock_movements.csv    : {len(df_movements):>6,} rows")
    print(f"    regional_demand.csv    : {len(df_regional):>6,} rows")
    print(f"    {'─' * 40}")
    print(f"    TOTAL                  : {total:>6,} rows")
    print("=" * 64)


if __name__ == "__main__":
    main()
