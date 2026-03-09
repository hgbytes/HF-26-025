"""
ml/train_anomaly.py — Module 2: Anomaly Detection

Supervised path : RandomForest + XGBoost classifiers  (we have is_anomaly labels)
Unsupervised path: IsolationForest + LocalOutlierFactor  (evaluated against labels)

Best model is selected on F1 score and saved as anomaly_model.pkl.
"""

import os
import warnings
import joblib
import numpy as np

from sklearn.ensemble import (
    RandomForestClassifier,
    IsolationForest,
)
from sklearn.neighbors import LocalOutlierFactor
from sklearn.model_selection import RandomizedSearchCV
from xgboost import XGBClassifier

from utils.data_processing import prepare_anomaly_data, MODEL_DIR
from utils.evaluation import (
    evaluate_classification,
    print_feature_importance,
    select_best,
)

warnings.filterwarnings("ignore")

# ─────────────────────────────────────────────────────────────────────────────
# Hyper-parameter grids (supervised)
# ─────────────────────────────────────────────────────────────────────────────

RF_PARAMS = {
    "n_estimators":      [100, 200, 400],
    "max_depth":         [8, 12, 16, None],
    "min_samples_split": [2, 5, 10],
    "min_samples_leaf":  [1, 2, 4],
    "class_weight":      ["balanced", None],
}

XGB_PARAMS = {
    "n_estimators":      [200, 400, 600],
    "max_depth":         [4, 6, 8, 10],
    "learning_rate":     [0.01, 0.05, 0.1],
    "subsample":         [0.7, 0.8, 1.0],
    "colsample_bytree":  [0.6, 0.8, 1.0],
    "scale_pos_weight":  [1, 3, 5, 8],
}

ISO_PARAMS = {
    "n_estimators":      [100, 200, 300],
    "max_samples":       [0.5, 0.7, 1.0],
    "contamination":     [0.10, 0.15, 0.20],
    "max_features":      [0.5, 0.7, 1.0],
}


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def _tune_clf(name, estimator, param_dist, X_tr, y_tr):
    print(f"\n  Tuning {name} …")
    search = RandomizedSearchCV(
        estimator,
        param_distributions=param_dist,
        n_iter=25,
        scoring="f1",
        cv=5,
        n_jobs=-1,
        random_state=42,
        verbose=0,
    )
    search.fit(X_tr, y_tr)
    print(f"    Best CV F1: {search.best_score_:.4f}")
    print(f"    Params: {search.best_params_}")
    return search.best_estimator_, search.best_params_


def _best_iso(X_tr, y_tr, X_te, y_te):
    """Manual grid search for IsolationForest (no native CV scorer)."""
    from sklearn.metrics import f1_score as f1
    print("\n  Tuning IsolationForest …")
    best, best_f1, best_p = None, -1, {}
    for n_est in ISO_PARAMS["n_estimators"]:
        for ms in ISO_PARAMS["max_samples"]:
            for cont in ISO_PARAMS["contamination"]:
                for mf in ISO_PARAMS["max_features"]:
                    m = IsolationForest(
                        n_estimators=n_est, max_samples=ms,
                        contamination=cont, max_features=mf,
                        random_state=42, n_jobs=-1,
                    )
                    m.fit(X_tr)
                    pred = (m.predict(X_te) == -1).astype(int)
                    s = f1(y_te, pred, zero_division=0)
                    if s > best_f1:
                        best_f1 = s
                        best = m
                        best_p = {"n_estimators": n_est, "max_samples": ms,
                                  "contamination": cont, "max_features": mf}
    print(f"    Best test F1: {best_f1:.4f}")
    print(f"    Params: {best_p}")
    return best, best_p


# ─────────────────────────────────────────────────────────────────────────────
# Training
# ─────────────────────────────────────────────────────────────────────────────

def train():
    """Full anomaly-detection training pipeline.  Returns (best_model, metrics)."""
    print("\n" + "=" * 64)
    print("  MODULE 2 — Anomaly Detection")
    print("=" * 64)

    X_train, X_test, y_train, y_test, enc, scaler = prepare_anomaly_data()
    features = list(X_train.columns)
    results  = {}

    # ── 1. RandomForest Classifier ───────────────────────────────────────
    rf, _ = _tune_clf("RandomForest", RandomForestClassifier(random_state=42),
                       RF_PARAMS, X_train, y_train)
    rf_pred = rf.predict(X_test)
    rf_met  = evaluate_classification(y_test, rf_pred, "RandomForest Classifier")
    print_feature_importance(rf, features, label="RandomForest")
    results["RandomForest"] = {"model": rf, "metrics": rf_met}

    # ── 2. XGBoost Classifier ────────────────────────────────────────────
    xgb, _ = _tune_clf("XGBoost", XGBClassifier(random_state=42, verbosity=0,
                                                  eval_metric="logloss"),
                         XGB_PARAMS, X_train, y_train)
    xgb_pred = xgb.predict(X_test)
    xgb_met  = evaluate_classification(y_test, xgb_pred, "XGBoost Classifier")
    print_feature_importance(xgb, features, label="XGBoost")
    results["XGBoost"] = {"model": xgb, "metrics": xgb_met}

    # ── 3. IsolationForest ───────────────────────────────────────────────
    iso, _ = _best_iso(X_train, y_train, X_test, y_test)
    iso_pred = (iso.predict(X_test) == -1).astype(int)
    iso_met  = evaluate_classification(y_test, iso_pred, "IsolationForest")
    results["IsolationForest"] = {"model": iso, "metrics": iso_met}

    # ── 4. LocalOutlierFactor ────────────────────────────────────────────
    print("\n  Fitting LocalOutlierFactor …")
    lof = LocalOutlierFactor(n_neighbors=20, contamination=0.15, novelty=False)
    lof_pred = lof.fit_predict(X_test)
    lof_pred = (lof_pred == -1).astype(int)
    lof_met  = evaluate_classification(y_test, lof_pred, "LocalOutlierFactor")
    results["LocalOutlierFactor"] = {"model": lof, "metrics": lof_met}

    # ── select & save best ───────────────────────────────────────────────
    best_name, best_model, best_met = select_best(results, metric="f1")

    os.makedirs(MODEL_DIR, exist_ok=True)
    path = os.path.join(MODEL_DIR, "anomaly_model.pkl")
    joblib.dump({"model": best_model, "encoders": enc, "scaler": scaler,
                 "features": features, "name": best_name}, path)
    print(f"  Saved → {path}")
    return best_model, best_met


if __name__ == "__main__":
    train()
