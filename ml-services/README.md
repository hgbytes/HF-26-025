# ML Services — Pharmaceutical Supply Chain Intelligence

End-to-end ML pipeline for **demand forecasting**, **anomaly detection**, and **expiry waste prediction** across Tamil Nadu's healthcare facilities.

## Overview

Generates synthetic pharmaceutical inventory data for **12 drugs × 10 regions × 4 facility types**, then trains optimized ML models to solve three supply-chain problems:

| Problem | Models | Target |
| --- | --- | --- |
| Demand Forecasting | XGBoost, RandomForest, LightGBM | `quantity_dispensed` |
| Anomaly Detection | XGBoost, RandomForest, IsolationForest, LOF | `is_anomaly` |
| Expiry Waste Prediction | XGBoost, RandomForest | `quantity_wasted` |

---

## Project Structure

```text
ml-services/
├── run_all.py                        # Entry point — generates all data
├── requirements.txt
├── data/
│   ├── synthetic/                    # Data generators
│   │   ├── constants.py              # Single source of truth
│   │   ├── generate_usage.py         # Drug usage history
│   │   ├── generate_movements.py     # Stock movements + anomalies
│   │   ├── generate_expiry.py        # Batch expiry & wastage
│   │   ├── generate_regional.py      # Regional demand index
│   │   └── run_all.py               # Generator orchestrator
│   └── processed/                    # Generated CSV outputs
│       ├── drug_usage.csv            ~10K rows × 19 cols
│       ├── stock_movements.csv       ~10K rows × 19 cols
│       ├── batch_expiry.csv          ~10K rows × 19 cols
│       └── regional_demand.csv       ~10K rows × 17 cols
└── ml/
    ├── train_all.py                  # Trains all 3 models
    ├── train_demand.py               # Module 1 — Demand
    ├── train_anomaly.py              # Module 2 — Anomaly
    ├── train_expiry.py               # Module 3 — Expiry
    ├── utils/
    │   ├── data_processing.py        # Load, clean, encode, scale
    │   └── evaluation.py             # Metrics & feature importance
    └── models/                       # Saved .pkl models
```

---

## Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Step 1 — Generate synthetic data (~40K rows)
python run_all.py

# Step 2 — Train all models (~10 min)
cd ml
python train_all.py
```

**Outputs** saved to `ml/models/`:

| File | Description |
| --- | --- |
| `demand_model.pkl` | Best demand forecasting model |
| `anomaly_model.pkl` | Best anomaly detection model |
| `expiry_model.pkl` | Best expiry waste prediction model |

Train individual modules:

```bash
python train_demand.py       # Module 1 only
python train_anomaly.py      # Module 2 only
python train_expiry.py       # Module 3 only
```

---

## Datasets

### 1. Drug Usage History — `drug_usage.csv`

Monthly dispensing records per drug-region-facility (Jan 2023 – Dec 2024).

**Key columns:** `drug_name`, `region`, `facility_type`, `quantity_dispensed` (target), `stock_opening`, `stock_closing`, `disease_season_flag`, `past_30d_usage`, `past_90d_usage`

### 2. Stock Movements — `stock_movements.csv`

Individual stock events with **~15% injected anomalies** across 5 types:

| Type | Description |
| --- | --- |
| 1 | Unexplained stock drop >40% |
| 2 | Same batch transferred 3+ times in 24 hrs |
| 3 | Transfer logged between 11 PM – 4 AM |
| 4 | Receiver facility not in master list |
| 5 | Stock reconciliation mismatch |

**Key columns:** `event_type`, `quantity_before`, `quantity_change`, `quantity_after`, `is_anomaly` (target), `anomaly_type`

### 3. Batch Expiry & Wastage — `batch_expiry.csv`

Per-batch lifecycle from manufacture to expiry.

**Key columns:** `shelf_life_months`, `days_to_expiry_on_arrival`, `avg_daily_consumption`, `quantity_remaining_30d_before_expiry`, `quantity_wasted` (target), `redistribution_done`

### 4. Regional Demand Index — `regional_demand.csv`

Aggregated supply-demand metrics per region-drug-facility-month.

**Key columns:** `population_est`, `disease_prevalence_index`, `total_quantity_demanded`, `supply_gap`, `demand_score`

---

## ML Modules

### Module 1 — Demand Forecasting

| Detail | Value |
| --- | --- |
| Target | `quantity_dispensed` |
| Models | XGBoost, RandomForest, LightGBM |
| Features | `opening_close_ratio`, `season_disease`, `price_x_opening` |
| Split | Time-based (train: Jan 2023 – Jun 2024, test: Jul – Dec 2024) |
| Tuning | RandomizedSearchCV — 30 iters, 5-fold CV |

### Module 2 — Anomaly Detection

| Detail | Value |
| --- | --- |
| Target | `is_anomaly` (binary) |
| Supervised | RandomForest, XGBoost |
| Unsupervised | IsolationForest, LocalOutlierFactor |
| Features | `abs_change`, `change_pct`, `reconcile_error` |
| Split | 80/20 stratified |
| Tuning | RandomizedSearchCV — 30 iters, 5-fold CV, F1 scoring |

### Module 3 — Expiry Waste Prediction

| Detail | Value |
| --- | --- |
| Target | `quantity_wasted` |
| Models | RandomForest, XGBoost |
| Features | `consumption_vs_quantity`, `utilisation_forecast`, `remaining_ratio` |
| Split | 80/20 random |
| Tuning | RandomizedSearchCV — 30 iters, 5-fold CV |

---

## Model Performance

| Module | Best Model | R² | MAE | RMSE | F1 |
| --- | --- | --- | --- | --- | --- |
| Demand Forecast | XGBoost | 0.9632 | 276.68 | 503.89 | — |
| Anomaly Detection | XGBoost | — | — | — | 0.9950 |
| Expiry Prediction | RandomForest | 0.9609 | 21.88 | 57.30 | — |

**Top features per module:**

- **Demand:** `stock_opening` (0.879) → `disease_season_flag` (0.023) → `past_30d_usage` (0.017)
- **Anomaly:** `new_recipient_flag` (0.367) → `event_type` (0.249) → `reconcile_error` (0.195)
- **Expiry:** `quantity_remaining_30d_before_expiry` (0.435) → `redistribution_done` (0.244) → `remaining_ratio` (0.165)

---

## Pipeline Architecture

```text
constants.py (12 drugs, 10 regions, 4 facility types)
       │
       ├── generate_usage.py ──────────┐
       ├── generate_expiry.py ─────────┤
       ├── generate_movements.py ──────┼──→ data/processed/*.csv (~40K rows)
       └── generate_regional.py ───────┘
                                       │
                              data_processing.py
                           (load → clean → encode → scale)
                                       │
                    ┌──────────────────┼──────────────────┐
                    │                  │                   │
             train_demand.py    train_anomaly.py    train_expiry.py
                    │                  │                   │
             demand_model.pkl   anomaly_model.pkl   expiry_model.pkl
```

---

## Tech Stack

| Package | Version |
| --- | --- |
| Python | ≥ 3.10 |
| pandas | 3.0.1 |
| NumPy | 2.3.3 |
| scikit-learn | 1.8.0 |
| XGBoost | 3.2.0 |
| LightGBM | 4.6.0 |
| joblib | 1.5.3 |
