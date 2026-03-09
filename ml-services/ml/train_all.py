"""
ml/train_all.py — Run the complete ML training pipeline for all 3 modules.

Execution order:
  1. Demand Forecasting   → demand_model.pkl
  2. Anomaly Detection    → anomaly_model.pkl
  3. Expiry Prediction    → expiry_model.pkl

Usage:
    python train_all.py
"""

import sys
import os
import time

# Ensure ml/ directory is on the import path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import train_demand
import train_anomaly
import train_expiry

from utils.data_processing import MODEL_DIR


def main():
    t0 = time.time()

    print("=" * 64)
    print("  Tamil Nadu Medical Inventory — ML Training Pipeline")
    print("=" * 64)

    # ── Module 1 ─────────────────────────────────────────────────────────
    demand_model, demand_met = train_demand.train()

    # ── Module 2 ─────────────────────────────────────────────────────────
    anomaly_model, anomaly_met = train_anomaly.train()

    # ── Module 3 ─────────────────────────────────────────────────────────
    expiry_model, expiry_met = train_expiry.train()

    # ── Summary ──────────────────────────────────────────────────────────
    elapsed = time.time() - t0
    print("\n" + "=" * 64)
    print("  TRAINING COMPLETE")
    print("=" * 64)
    print(f"  Time elapsed: {elapsed:.1f} s\n")

    print("  Demand Forecast  — R²={r2:.4f}  MAE={mae:,.2f}  RMSE={rmse:,.2f}"
          .format(**demand_met))
    print("  Anomaly Detection— F1={f1:.4f}  Prec={precision:.4f}  Rec={recall:.4f}"
          .format(**anomaly_met))
    print("  Expiry Prediction— R²={r2:.4f}  MAE={mae:,.2f}  RMSE={rmse:,.2f}"
          .format(**expiry_met))

    print(f"\n  Saved models in: {MODEL_DIR}")
    for f in os.listdir(MODEL_DIR):
        fpath = os.path.join(MODEL_DIR, f)
        size  = os.path.getsize(fpath) / 1024
        print(f"    {f:<25} {size:>8.1f} KB")
    print("=" * 64)


if __name__ == "__main__":
    main()
