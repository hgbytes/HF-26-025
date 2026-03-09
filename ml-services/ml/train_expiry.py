"""
ml/train_expiry.py — Module 3: Expiry Waste Prediction

Models: RandomForest Regressor, XGBoost Regressor
Target: quantity_wasted  (regression)
Tuning: RandomizedSearchCV (5-fold CV)
"""

import os
import warnings
import joblib
import numpy as np

from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import RandomizedSearchCV
from xgboost import XGBRegressor

from utils.data_processing import prepare_expiry_data, MODEL_DIR
from utils.evaluation import evaluate_regression, print_feature_importance, select_best

warnings.filterwarnings("ignore")

# ─────────────────────────────────────────────────────────────────────────────
# Hyper-parameter search spaces
# ─────────────────────────────────────────────────────────────────────────────

RF_PARAMS = {
    "n_estimators":      [100, 200, 400, 600],
    "max_depth":         [8, 12, 16, 20, None],
    "min_samples_split": [2, 5, 10],
    "min_samples_leaf":  [1, 2, 4],
    "max_features":      ["sqrt", "log2", 0.5],
}

XGB_PARAMS = {
    "n_estimators":      [200, 400, 600, 800],
    "max_depth":         [4, 6, 8, 10],
    "learning_rate":     [0.01, 0.05, 0.1, 0.2],
    "subsample":         [0.7, 0.8, 0.9, 1.0],
    "colsample_bytree":  [0.6, 0.8, 1.0],
    "min_child_weight":  [1, 3, 5],
    "reg_alpha":         [0, 0.1, 0.5],
    "reg_lambda":        [0.5, 1.0, 2.0],
}


# ─────────────────────────────────────────────────────────────────────────────
# Training
# ─────────────────────────────────────────────────────────────────────────────

def _tune(name, estimator, param_dist, X_tr, y_tr):
    print(f"\n  Tuning {name} …")
    search = RandomizedSearchCV(
        estimator,
        param_distributions=param_dist,
        n_iter=30,
        scoring="neg_mean_absolute_error",
        cv=5,
        n_jobs=-1,
        random_state=42,
        verbose=0,
    )
    search.fit(X_tr, y_tr)
    print(f"    Best CV MAE: {-search.best_score_:,.2f}")
    print(f"    Params: {search.best_params_}")
    return search.best_estimator_, search.best_params_


def train():
    """Full expiry-waste prediction pipeline.  Returns (best_model, metrics)."""
    print("\n" + "=" * 64)
    print("  MODULE 3 — Expiry Waste Prediction")
    print("=" * 64)

    X_train, X_test, y_train, y_test, enc, scaler = prepare_expiry_data()
    features = list(X_train.columns)
    results  = {}

    # ── 1. RandomForest ──────────────────────────────────────────────────
    rf_model, _ = _tune("RandomForest", RandomForestRegressor(random_state=42),
                         RF_PARAMS, X_train, y_train)
    rf_pred = rf_model.predict(X_test)
    rf_met  = evaluate_regression(y_test, rf_pred, "RandomForest Regressor")
    print_feature_importance(rf_model, features, label="RandomForest")
    results["RandomForest"] = {"model": rf_model, "metrics": rf_met}

    # ── 2. XGBoost ───────────────────────────────────────────────────────
    xgb_model, _ = _tune("XGBoost", XGBRegressor(random_state=42, verbosity=0),
                          XGB_PARAMS, X_train, y_train)
    xgb_pred = xgb_model.predict(X_test)
    xgb_met  = evaluate_regression(y_test, xgb_pred, "XGBoost Regressor")
    print_feature_importance(xgb_model, features, label="XGBoost")
    results["XGBoost"] = {"model": xgb_model, "metrics": xgb_met}

    # ── select & save best ───────────────────────────────────────────────
    best_name, best_model, best_met = select_best(results, metric="r2")

    os.makedirs(MODEL_DIR, exist_ok=True)
    path = os.path.join(MODEL_DIR, "expiry_model.pkl")
    joblib.dump({"model": best_model, "encoders": enc, "scaler": scaler,
                 "features": features, "name": best_name}, path)
    print(f"  Saved → {path}")
    return best_model, best_met


if __name__ == "__main__":
    train()
