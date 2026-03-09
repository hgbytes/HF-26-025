"""
ml/utils/evaluation.py — Model evaluation & feature-importance printing.
"""

import numpy as np
import pandas as pd
from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score,
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report,
)


# ─────────────────────────────────────────────────────────────────────────────
# Regression
# ─────────────────────────────────────────────────────────────────────────────

def evaluate_regression(y_true, y_pred, label: str = "") -> dict:
    """Compute MAE, RMSE, R² and print a summary.  Returns metrics dict."""
    mae  = mean_absolute_error(y_true, y_pred)
    rmse = np.sqrt(mean_squared_error(y_true, y_pred))
    r2   = r2_score(y_true, y_pred)

    print(f"  {label}")
    print(f"    MAE  : {mae:>12,.2f}")
    print(f"    RMSE : {rmse:>12,.2f}")
    print(f"    R²   : {r2:>12.4f}")
    return {"mae": mae, "rmse": rmse, "r2": r2}


# ─────────────────────────────────────────────────────────────────────────────
# Classification / Anomaly
# ─────────────────────────────────────────────────────────────────────────────

def evaluate_classification(y_true, y_pred, label: str = "") -> dict:
    """Compute accuracy, precision, recall, F1 and print a summary."""
    acc  = accuracy_score(y_true, y_pred)
    prec = precision_score(y_true, y_pred, zero_division=0)
    rec  = recall_score(y_true, y_pred, zero_division=0)
    f1   = f1_score(y_true, y_pred, zero_division=0)

    print(f"  {label}")
    print(f"    Accuracy  : {acc:>8.4f}")
    print(f"    Precision : {prec:>8.4f}")
    print(f"    Recall    : {rec:>8.4f}")
    print(f"    F1        : {f1:>8.4f}")
    return {"accuracy": acc, "precision": prec, "recall": rec, "f1": f1}


# ─────────────────────────────────────────────────────────────────────────────
# Feature importance
# ─────────────────────────────────────────────────────────────────────────────

def print_feature_importance(model, feature_names: list[str], top_n: int = 15,
                             label: str = ""):
    """Print a text-based bar chart of feature importances for tree models."""
    if not hasattr(model, "feature_importances_"):
        print(f"  {label} — model has no feature_importances_; skipping.")
        return

    imp = model.feature_importances_
    idx = np.argsort(imp)[::-1][:top_n]

    max_bar = 40
    max_imp = imp[idx[0]] if len(idx) else 1

    print(f"\n  Feature Importance — {label} (top {top_n})")
    print(f"  {'─' * 60}")
    for rank, i in enumerate(idx, 1):
        name = feature_names[i] if i < len(feature_names) else f"feat_{i}"
        bar_len = int(imp[i] / max_imp * max_bar)
        bar = "█" * bar_len
        print(f"  {rank:>3}. {name:<35} {imp[i]:.4f}  {bar}")
    print()


# ─────────────────────────────────────────────────────────────────────────────
# Best-model selector
# ─────────────────────────────────────────────────────────────────────────────

def select_best(results: dict, metric: str = "r2", higher_is_better: bool = True):
    """Pick the best model from {name: {model, metrics}} dict.

    Returns (best_name, best_model, best_metrics).
    """
    best_name  = None
    best_score = -np.inf if higher_is_better else np.inf
    best_model = None
    best_met   = None

    for name, info in results.items():
        score = info["metrics"][metric]
        better = (score > best_score) if higher_is_better else (score < best_score)
        if better:
            best_score = score
            best_name  = name
            best_model = info["model"]
            best_met   = info["metrics"]

    print(f"\n  ★ Best model: {best_name}  ({metric}={best_score:.4f})")
    return best_name, best_model, best_met
