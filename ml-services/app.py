import os
import json
import joblib
import numpy as np
import pandas as pd
from flask import Flask, Response
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


def safe_jsonify(data, status=200):
    """Serialize to JSON, converting NaN/Inf to null for valid JSON."""
    body = json.dumps(data, allow_nan=False, default=str)
    return Response(body, status=status, mimetype="application/json")


def sanitize_records(records):
    """Replace NaN / Inf values with None in a list of dicts."""
    for row in records:
        for k, v in row.items():
            if isinstance(v, float) and (np.isnan(v) or np.isinf(v)):
                row[k] = None
    return records

# ── Load trained models once at startup ──────────────────────────────────────
MODEL_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "ml", "models")
DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "processed")

_models = {}

def _load_model(name):
    if name not in _models:
        path = os.path.join(MODEL_DIR, f"{name}_model.pkl")
        if os.path.exists(path):
            _models[name] = joblib.load(path)
    return _models.get(name)


@app.route("/health")
def health():
    loaded = list(_models.keys())
    return safe_jsonify({"status": "ok", "models_loaded": loaded})


# ── Demand Forecasting ───────────────────────────────────────────────────────
@app.route("/forecast")
def forecast():
    bundle = _load_model("demand")
    if not bundle:
        return safe_jsonify({"error": "Demand model not loaded"}, 503)

    model = bundle["model"]
    encoders = bundle["encoders"]
    scaler = bundle["scaler"]
    features = bundle["features"]

    df = pd.read_csv(os.path.join(DATA_DIR, "drug_usage.csv"))

    # Keep latest 6 months for prediction summary
    df_recent = df[(df["year"] == 2024) & (df["month"] >= 7)].copy()
    if df_recent.empty:
        df_recent = df.tail(200).copy()

    # Prepare features matching training pipeline
    df_recent["opening_close_ratio"] = df_recent["stock_closing"] / df_recent["stock_opening"].replace(0, 1)
    df_recent["season_disease"] = df_recent["disease_season_flag"] * df_recent["month"]
    df_recent["price_x_opening"] = df_recent["price_per_unit_inr"] * df_recent["stock_opening"]

    for col in df_recent.select_dtypes(include=["object"]).columns:
        if col in encoders:
            le = encoders[col]
            known = set(le.classes_)
            df_recent[col] = df_recent[col].astype(str).apply(
                lambda x, _k=known, _le=le: _le.transform([x])[0] if x in _k else -1
            )

    # Align columns to training features
    for c in features:
        if c not in df_recent.columns:
            df_recent[c] = 0
    X = df_recent[features]

    preds = model.predict(X)

    # Summarize by drug & region
    df_recent["predicted_demand"] = preds
    summary = (
        df_recent.groupby(["drug_name", "region"] if "drug_name" in df.columns else [])
        .agg(predicted_demand=("predicted_demand", "mean"))
        .reset_index()
    )
    # Decode labels back for readability
    for col in ["drug_name", "region"]:
        if col in encoders and col in summary.columns:
            le = encoders[col]
            safe = summary[col].clip(0, len(le.classes_) - 1).astype(int)
            summary[col] = le.inverse_transform(safe)

    return safe_jsonify({
        "model": {
            "name": bundle.get("name", "demand"),
            "version": bundle.get("version", "1.0"),
            "accuracy": bundle.get("accuracy", None),
            "lastTrained": bundle.get("lastTrained", None),
            "dataPoints": int(len(df_recent)),
        },
        "record_count": len(df_recent),
        "predictions": sanitize_records(summary.round(2).to_dict(orient="records"))
    })


# ── Anomaly Detection ────────────────────────────────────────────────────────
@app.route("/anomalies")
def anomalies():
    bundle = _load_model("anomaly")
    if not bundle:
        return safe_jsonify({"error": "Anomaly model not loaded"}, 503)

    model = bundle["model"]
    encoders = bundle["encoders"]
    scaler = bundle["scaler"]
    features = bundle["features"]

    df = pd.read_csv(os.path.join(DATA_DIR, "stock_movements.csv"))

    # Feature engineering matching training pipeline
    df["abs_change"] = df["quantity_change"].abs()
    df["change_pct"] = df["quantity_change"] / df["quantity_before"].replace(0, 1)
    df["reconcile_error"] = df["quantity_after"] - (df["quantity_before"] + df["quantity_change"])

    for col in df.select_dtypes(include=["object"]).columns:
        if col in encoders:
            le = encoders[col]
            known = set(le.classes_)
            df[col] = df[col].astype(str).apply(
                lambda x, _k=known, _le=le: _le.transform([x])[0] if x in _k else -1
            )

    for c in features:
        if c not in df.columns:
            df[c] = 0
    X = df[features]

    preds = model.predict(X)
    df["predicted_anomaly"] = preds
    flagged = df[df["predicted_anomaly"] == 1]

    return safe_jsonify({
        "model": bundle.get("name", "anomaly"),
        "total_records": len(df),
        "anomalies_detected": int(flagged.shape[0]),
        "anomaly_rate": round(flagged.shape[0] / max(len(df), 1) * 100, 2),
        "sample_anomalies": sanitize_records(flagged.head(20).to_dict(orient="records"))
    })


# ── Expiry Waste Prediction ──────────────────────────────────────────────────
@app.route("/expiry")
def expiry():
    bundle = _load_model("expiry")
    if not bundle:
        return safe_jsonify({"error": "Expiry model not loaded"}, 503)

    model = bundle["model"]
    encoders = bundle["encoders"]
    scaler = bundle["scaler"]
    features = bundle["features"]

    df = pd.read_csv(os.path.join(DATA_DIR, "batch_expiry.csv"))

    # Feature engineering matching training pipeline
    df["consumption_vs_quantity"] = df["avg_daily_consumption"] * df["days_to_expiry_on_arrival"]
    df["utilisation_forecast"] = df["demand_forecast_30d"] / df["initial_quantity"].replace(0, 1)
    df["remaining_ratio"] = df["quantity_remaining_30d_before_expiry"] / df["initial_quantity"].replace(0, 1)

    for col in df.select_dtypes(include=["object"]).columns:
        if col in encoders:
            le = encoders[col]
            known = set(le.classes_)
            df[col] = df[col].astype(str).apply(
                lambda x, _k=known, _le=le: _le.transform([x])[0] if x in _k else -1
            )

    for c in features:
        if c not in df.columns:
            df[c] = 0
    X = df[features]

    preds = model.predict(X)
    df["predicted_waste"] = preds

    # Summarize by drug
    summary = (
        df.groupby("drug_name" if "drug_name" in df.columns else [])
        .agg(
            avg_predicted_waste=("predicted_waste", "mean"),
            total_predicted_waste=("predicted_waste", "sum"),
            batch_count=("predicted_waste", "count"),
        )
        .reset_index()
    )
    if "drug_name" in encoders and "drug_name" in summary.columns:
        le = encoders["drug_name"]
        safe = summary["drug_name"].clip(0, len(le.classes_) - 1).astype(int)
        summary["drug_name"] = le.inverse_transform(safe)

    return safe_jsonify({
        "model": bundle.get("name", "expiry"),
        "total_batches": len(df),
        "predictions": sanitize_records(summary.round(2).to_dict(orient="records"))
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
