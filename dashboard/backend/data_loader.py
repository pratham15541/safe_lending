"""Central data-loading helpers — reads CSVs once and caches in memory."""

from __future__ import annotations
import json, pathlib
import pandas as pd
import numpy as np
import joblib

BASE = pathlib.Path(__file__).resolve().parent.parent.parent   # project root
DATA = BASE / "data"
ARTIFACTS = BASE / "artifacts"
CHARTS = BASE / "charts"


# ── CSV loaders (cached) ────────────────────────────────────────────
_cache: dict[str, pd.DataFrame] = {}
_result_cache: dict[str, list[dict] | dict] = {}


def _load(name: str) -> pd.DataFrame:
    if name not in _cache:
        _cache[name] = pd.read_csv(DATA / name)
    return _cache[name]


def executive_summary() -> list[dict]:
    return _load("executive_summary_table.csv").rename(
        columns={
            "Area": "area",
            "Metric": "metric",
            "Value": "value",
            "Interpretation": "interpretation",
        }
    ).to_dict(orient="records")


def business_qa() -> list[dict]:
    return _load("business_qa_summary.csv").to_dict(orient="records")


def drift_decisions() -> list[dict]:
    return _load("drift_decision_summary.csv").to_dict(orient="records")


def analytical_answers() -> list[dict]:
    return _load("final_analytical_answers.csv").rename(
        columns={"final_question": "question"}
    ).to_dict(orient="records")


# ── Master modeling (sample for charts) ─────────────────────────────
def master_modeling() -> pd.DataFrame:
    return _load("master_modeling.csv")


def grade_default_rates() -> list[dict]:
    df = master_modeling()
    agg = (
        df.groupby("grade")["is_default"]
        .agg(["mean", "count"])
        .reset_index()
        .rename(columns={"mean": "default_rate", "count": "count"})
        .sort_values("grade")
    )
    return agg.to_dict(orient="records")


def state_default_rates() -> list[dict]:
    df = master_modeling()
    agg = (
        df.groupby("addr_state")["is_default"]
        .agg(["mean", "count"])
        .reset_index()
        .rename(columns={"mean": "default_rate", "addr_state": "state", "count": "count"})
        .sort_values("default_rate", ascending=False)
    )
    return agg.to_dict(orient="records")


def overview_stats() -> dict:
    df = master_modeling()
    return {
        "total_loans": int(len(df)),
        "default_rate": round(float(df["is_default"].mean()), 4),
        "avg_loan_amount": round(float(df["loan_amnt"].mean()), 2),
        "avg_interest_rate": round(float(df["int_rate"].mean()), 2),
        "avg_dti": round(float(df["dti"].mean()), 2),
        "avg_annual_income": round(float(df["annual_inc"].mean()), 2),
    }


def grade_distribution() -> list[dict]:
    df = master_modeling()
    agg = (
        df.groupby("grade")
        .agg(
            count=("is_default", "count"),
            default_rate=("is_default", "mean"),
            avg_interest_rate=("int_rate", "mean"),
            avg_loan_amount=("loan_amnt", "mean"),
        )
        .reset_index()
        .sort_values("grade")
    )
    agg["default_rate"] = agg["default_rate"].round(4)
    agg["avg_interest_rate"] = agg["avg_interest_rate"].round(2)
    agg["avg_loan_amount"] = agg["avg_loan_amount"].round(2)
    return agg.to_dict(orient="records")


def quarterly_grade_drift() -> list[dict]:
    cached = _result_cache.get("quarterly_grade_drift")
    if cached is not None:
        return cached

    df = master_modeling().copy()
    if "issue_year" not in df.columns or "issue_month" not in df.columns:
        return []

    df["issue_month"] = pd.to_numeric(df["issue_month"], errors="coerce").fillna(1).astype(int)
    df["issue_year"] = pd.to_numeric(df["issue_year"], errors="coerce").fillna(0).astype(int)
    df = df[df["issue_year"] > 0]

    quarter = ((df["issue_month"] - 1) // 3 + 1).clip(1, 4)
    df["quarter"] = df["issue_year"].astype(str) + "-Q" + quarter.astype(str)

    agg = (
        df.groupby(["quarter", "grade"])["is_default"]
        .agg(["mean", "count"])
        .reset_index()
        .rename(columns={"mean": "default_rate", "count": "count"})
        .sort_values(["quarter", "grade"])
    )
    agg["default_rate"] = agg["default_rate"].round(4)
    result = agg.to_dict(orient="records")
    _result_cache["quarterly_grade_drift"] = result
    return result


def state_application_risk(min_count: int = 1000) -> list[dict]:
    cache_key = f"state_application_risk_{min_count}"
    cached = _result_cache.get(cache_key)
    if cached is not None:
        return cached

    df = master_modeling()
    agg = (
        df.groupby(["addr_state", "application_type"])["is_default"]
        .agg(["mean", "count"])
        .reset_index()
        .rename(
            columns={
                "addr_state": "state",
                "mean": "default_rate",
                "count": "count",
            }
        )
    )
    agg = agg[agg["count"] >= min_count].sort_values("default_rate", ascending=False)
    agg["default_rate"] = agg["default_rate"].round(4)
    result = agg.to_dict(orient="records")
    _result_cache[cache_key] = result
    return result


def quarterly_recalibration_plan() -> list[dict]:
    cached = _result_cache.get("quarterly_recalibration_plan")
    if cached is not None:
        return cached

    drift = quarterly_grade_drift()
    if not drift:
        return []
    frame = pd.DataFrame(drift)

    plans = []
    for quarter, g in frame.groupby("quarter"):
        g = g.sort_values("default_rate")
        g["relative_risk_rank"] = np.arange(1, len(g) + 1)
        median_rate = float(g["default_rate"].median())
        for _, row in g.iterrows():
            recommendation = (
                "Tighten boundary"
                if row["default_rate"] > median_rate * 1.35
                else "No boundary change"
            )
            plans.append(
                {
                    "quarter": quarter,
                    "grade": row["grade"],
                    "observed_default_rate": round(float(row["default_rate"]), 4),
                    "relative_risk_rank": int(row["relative_risk_rank"]),
                    "recommendation": recommendation,
                }
            )
    _result_cache["quarterly_recalibration_plan"] = plans
    return plans


def risk_framework() -> dict:
    return {
        "policy": "Preserve existing grade system as primary tiering signal.",
        "quarterly_recalibration": "Recalculate grade boundaries each quarter from observed grade default-rates and adjust only where drift persists.",
        "state_application_features": "Include state-level and application_type risk overlays in monitoring and pricing governance.",
        "probability_overlay": "Use model probability as a secondary overlay to prioritize reviews, pricing bands, and intervention actions without replacing grade.",
    }


# ── Artifacts ───────────────────────────────────────────────────────
def model_metadata() -> dict:
    with open(ARTIFACTS / "metadata.json") as f:
        return json.load(f)


def feature_columns() -> list[str]:
    with open(ARTIFACTS / "feature_columns.json") as f:
        return json.load(f)


def feature_importance() -> list[dict]:
    model = joblib.load(ARTIFACTS / "best_model.joblib")
    cols = feature_columns()
    importances = model.feature_importances_
    pairs = sorted(zip(cols, importances), key=lambda x: -x[1])
    return [{"feature": f, "importance": round(float(v), 4)} for f, v in pairs]


# ── Prediction ──────────────────────────────────────────────────────
_model = None
_scaler = None
_encoders = None


def _load_model():
    global _model, _scaler, _encoders
    if _model is None:
        _model = joblib.load(ARTIFACTS / "best_model.joblib")
        _scaler = joblib.load(ARTIFACTS / "scaler.joblib")
        _encoders = joblib.load(ARTIFACTS / "label_encoders.joblib")


def predict(data: dict) -> dict:
    _load_model()
    cols = feature_columns()
    row = pd.DataFrame([data])[cols]

    # Encode categorical columns
    for col in row.select_dtypes(include="object").columns:
        if col in _encoders:
            le = _encoders[col]
            val = row[col].iloc[0]
            if val in le.classes_:
                row[col] = le.transform(row[col])
            else:
                row[col] = 0  # unseen category fallback

    # Scale
    row_scaled = _scaler.transform(row)

    # Predict
    proba = float(_model.predict_proba(row_scaled)[0, 1])
    threshold = 0.30
    label = "Default" if proba >= threshold else "Fully Paid"
    return {
        "default_probability": round(proba, 4),
        "prediction": label,
        "threshold": threshold,
    }


# ── Chart listing ───────────────────────────────────────────────────
def chart_list() -> list[dict]:
    charts = sorted(CHARTS.glob("*.png"))
    return [{"filename": c.name, "url": f"/api/charts/{c.name}"} for c in charts]
