"""
ml/utils/data_processing.py — Shared data-loading, cleaning & feature-engineering helpers.
"""

import os
import numpy as np
import pandas as pd
from sklearn.preprocessing import LabelEncoder, StandardScaler

# ── paths ────────────────────────────────────────────────────────────────────
ROOT_DIR      = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA_DIR      = os.path.join(ROOT_DIR, "data", "processed")
MODEL_DIR     = os.path.join(ROOT_DIR, "ml", "models")


# ─────────────────────────────────────────────────────────────────────────────
# Generic helpers
# ─────────────────────────────────────────────────────────────────────────────

def load_csv(name: str) -> pd.DataFrame:
    """Load a CSV from the processed data directory."""
    path = os.path.join(DATA_DIR, name)
    df = pd.read_csv(path)
    print(f"  Loaded {name}: {df.shape[0]:,} rows × {df.shape[1]} cols")
    return df


def drop_id_cols(df: pd.DataFrame, extra: list[str] | None = None) -> pd.DataFrame:
    """Drop UUID / ID / timestamp columns that carry no predictive signal."""
    default = ["record_id", "event_id", "batch_id", "facility_id",
               "sender_facility_id", "receiver_facility_id", "timestamp",
               "manufacture_date", "expiry_date", "arrival_date"]
    to_drop = [c for c in (default + (extra or [])) if c in df.columns]
    return df.drop(columns=to_drop)


def fill_missing(df: pd.DataFrame) -> pd.DataFrame:
    """Fill missing values: median for numeric, 'Unknown' for categorical."""
    for col in df.columns:
        if df[col].isnull().any():
            if df[col].dtype in ("float64", "int64", "float32", "int32"):
                df[col] = df[col].fillna(df[col].median())
            else:
                df[col] = df[col].fillna("Unknown")
    return df


def encode_categoricals(df: pd.DataFrame,
                        columns: list[str] | None = None,
                        encoders: dict | None = None
                        ) -> tuple[pd.DataFrame, dict]:
    """Label-encode the given (or auto-detected) object columns.

    Returns (encoded_df, {col: fitted_encoder}).
    """
    encoders = encoders or {}
    if columns is None:
        columns = df.select_dtypes(include=["object"]).columns.tolist()

    for col in columns:
        if col not in df.columns:
            continue
        if col not in encoders:
            le = LabelEncoder()
            df[col] = le.fit_transform(df[col].astype(str))
            encoders[col] = le
        else:
            le = encoders[col]
            # handle unseen labels gracefully
            known = set(le.classes_)
            df[col] = df[col].astype(str).apply(
                lambda x, _k=known, _le=le: (
                    _le.transform([x])[0] if x in _k else -1
                )
            )
    return df, encoders


def scale_features(df: pd.DataFrame,
                   columns: list[str],
                   scaler: StandardScaler | None = None
                   ) -> tuple[pd.DataFrame, StandardScaler]:
    """StandardScaler on selected numeric columns (fit or transform)."""
    cols = [c for c in columns if c in df.columns]
    if not cols:
        return df, scaler or StandardScaler()
    if scaler is None:
        scaler = StandardScaler()
        df[cols] = scaler.fit_transform(df[cols])
    else:
        df[cols] = scaler.transform(df[cols])
    return df, scaler


# ─────────────────────────────────────────────────────────────────────────────
# Dataset-specific loaders
# ─────────────────────────────────────────────────────────────────────────────

def prepare_demand_data():
    """Return (X_train, X_test, y_train, y_test, encoders, scaler) for demand forecasting."""
    df = load_csv("drug_usage.csv")
    df = drop_id_cols(df, extra=["total_value_inr"])  # derived from target

    df = fill_missing(df)

    # ── interaction features ─────────────────────────────────────────────
    df["opening_close_ratio"] = df["stock_closing"] / df["stock_opening"].replace(0, 1)
    df["season_disease"]      = df["disease_season_flag"] * df["month"]
    df["price_x_opening"]     = df["price_per_unit_inr"] * df["stock_opening"]

    target = "quantity_dispensed"
    y = df[target].copy()
    X = df.drop(columns=[target])

    # encode
    X, encoders = encode_categoricals(X)

    # scale continuous features
    scale_cols = ["lat", "lng", "stock_opening", "stock_closing",
                  "price_per_unit_inr", "past_30d_usage", "past_90d_usage",
                  "opening_close_ratio", "price_x_opening"]
    X, scaler = scale_features(X, scale_cols)

    # train / test split (last 6 months = test)
    mask_test = (X["year"] == 2024) & (X["month"] >= 7)
    X_train, X_test = X[~mask_test], X[mask_test]
    y_train, y_test = y[~mask_test], y[mask_test]

    print(f"  Demand — train {len(X_train):,}  test {len(X_test):,}")
    return X_train, X_test, y_train, y_test, encoders, scaler


def prepare_anomaly_data():
    """Return (X_train, X_test, y_train, y_test, encoders, scaler) for anomaly detection."""
    df = load_csv("stock_movements.csv")
    df = drop_id_cols(df, extra=["anomaly_type"])

    df = fill_missing(df)

    # ── feature engineering ──────────────────────────────────────────────
    df["abs_change"]      = df["quantity_change"].abs()
    df["change_pct"]      = df["quantity_change"] / df["quantity_before"].replace(0, 1)
    df["reconcile_error"] = df["quantity_after"] - (df["quantity_before"] + df["quantity_change"])

    target = "is_anomaly"
    y = df[target].copy()
    X = df.drop(columns=[target])

    X, encoders = encode_categoricals(X)

    scale_cols = ["quantity_before", "quantity_change", "quantity_after",
                  "transfer_duration_hrs", "cumulative_transfers",
                  "quantity_vs_forecast_delta", "abs_change", "change_pct",
                  "reconcile_error"]
    X, scaler = scale_features(X, scale_cols)

    # stratified chronological split: 80/20
    from sklearn.model_selection import train_test_split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    print(f"  Anomaly — train {len(X_train):,}  test {len(X_test):,}")
    return X_train, X_test, y_train, y_test, encoders, scaler


def prepare_expiry_data():
    """Return (X_train, X_test, y_train, y_test, encoders, scaler) for expiry waste prediction."""
    df = load_csv("batch_expiry.csv")
    df = drop_id_cols(df, extra=["redistribution_region", "expired_unused"])

    df = fill_missing(df)

    # ── feature engineering ──────────────────────────────────────────────
    df["consumption_vs_quantity"] = df["avg_daily_consumption"] * df["days_to_expiry_on_arrival"]
    df["utilisation_forecast"]   = df["demand_forecast_30d"] / df["initial_quantity"].replace(0, 1)
    df["remaining_ratio"]        = (df["quantity_remaining_30d_before_expiry"]
                                    / df["initial_quantity"].replace(0, 1))

    target = "quantity_wasted"
    y = df[target].copy()
    X = df.drop(columns=[target])

    X, encoders = encode_categoricals(X)

    scale_cols = ["shelf_life_months", "days_to_expiry_on_arrival",
                  "initial_quantity", "avg_daily_consumption",
                  "demand_forecast_30d", "quantity_remaining_30d_before_expiry",
                  "consumption_vs_quantity", "utilisation_forecast", "remaining_ratio"]
    X, scaler = scale_features(X, scale_cols)

    from sklearn.model_selection import train_test_split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42
    )
    print(f"  Expiry — train {len(X_train):,}  test {len(X_test):,}")
    return X_train, X_test, y_train, y_test, encoders, scaler
