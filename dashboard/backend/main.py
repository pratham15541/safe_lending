"""Safe Lending Dashboard — FastAPI backend.

Run with:  uvicorn main:app --reload --port 8000
"""

from __future__ import annotations
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import pathlib

from models import (
    SummaryRow, QARow, DriftRow, ChartInfo, ModelMeta,
    GradeDefault, StateDefault, OverviewStats,
    FeatureImportance, PredictionRequest, PredictionResponse,
    GradeDistribution, QuarterlyGradeDrift, StateApplicationRisk,
    RecalibrationRecommendation, RiskFrameworkResponse,
)
import data_loader as dl

# ── App ─────────────────────────────────────────────────────────────
app = FastAPI(
    title="Safe Lending Dashboard API",
    version="1.0.0",
    description="REST API powering the Safe Lending monitoring dashboard.",
)

# ── CORS (allow the Vite dev server) ────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CHARTS_DIR = pathlib.Path(__file__).resolve().parent.parent.parent / "charts"


# ── Routes ──────────────────────────────────────────────────────────

@app.get("/api/summary", response_model=list[SummaryRow])
async def get_summary():
    return dl.executive_summary()


@app.get("/api/qa", response_model=list[QARow])
async def get_qa():
    return dl.business_qa()


@app.get("/api/drift", response_model=list[DriftRow])
async def get_drift():
    return dl.drift_decisions()


@app.get("/api/analytical", response_model=list[QARow])
async def get_analytical():
    return dl.analytical_answers()


@app.get("/api/charts", response_model=list[ChartInfo])
async def list_charts():
    return dl.chart_list()


@app.get("/api/charts/{filename}")
async def get_chart(filename: str):
    path = CHARTS_DIR / filename
    if not path.exists():
        return {"error": "Chart not found"}
    return FileResponse(path, media_type="image/png")


@app.get("/api/model/metadata", response_model=ModelMeta)
async def get_model_metadata():
    return dl.model_metadata()


@app.get("/api/model/features", response_model=list[str])
async def get_model_features():
    return dl.feature_columns()


@app.get("/api/model/importance", response_model=list[FeatureImportance])
async def get_feature_importance():
    return dl.feature_importance()


@app.get("/api/eda/grade-default", response_model=list[GradeDefault])
async def get_grade_default():
    return dl.grade_default_rates()


@app.get("/api/eda/state-default", response_model=list[StateDefault])
async def get_state_default():
    return dl.state_default_rates()


@app.get("/api/eda/overview", response_model=OverviewStats)
async def get_overview():
    return dl.overview_stats()


@app.get("/api/eda/grade-distribution", response_model=list[GradeDistribution])
async def get_grade_distribution():
    return dl.grade_distribution()


@app.get("/api/monitoring/grade-drift", response_model=list[QuarterlyGradeDrift])
async def get_grade_drift():
    return dl.quarterly_grade_drift()


@app.get("/api/monitoring/state-application", response_model=list[StateApplicationRisk])
async def get_state_application():
    return dl.state_application_risk()


@app.get("/api/monitoring/recalibration", response_model=list[RecalibrationRecommendation])
async def get_recalibration():
    return dl.quarterly_recalibration_plan()


@app.get("/api/risk-framework", response_model=RiskFrameworkResponse)
async def get_risk_framework():
    return dl.risk_framework()


@app.post("/api/predict", response_model=PredictionResponse)
async def run_prediction(req: PredictionRequest):
    return dl.predict(req.model_dump())


# ── Health ──────────────────────────────────────────────────────────

@app.get("/api/health")
async def health():
    return {"status": "ok"}
