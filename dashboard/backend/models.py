"""Pydantic v2 response models for the Safe Lending dashboard API."""

from __future__ import annotations
from pydantic import BaseModel, Field
from typing import Optional


# ── Executive Summary ────────────────────────────────────────────────
class SummaryRow(BaseModel):
    area: str
    metric: str
    value: str
    interpretation: str


# ── Q&A ──────────────────────────────────────────────────────────────
class QARow(BaseModel):
    question: str
    answer: str


# ── Drift ────────────────────────────────────────────────────────────
class DriftRow(BaseModel):
    evidence: str
    metric_chart: str
    observation: str
    drift_signal: str


# ── Chart listing ────────────────────────────────────────────────────
class ChartInfo(BaseModel):
    filename: str
    url: str


# ── Model metadata ──────────────────────────────────────────────────
class ModelMeta(BaseModel):
    best_model_name: str
    roc_auc: float
    train_rows: int
    test_rows: int
    n_features: int


# ── EDA aggregates ──────────────────────────────────────────────────
class GradeDefault(BaseModel):
    grade: str
    default_rate: float
    count: int


class StateDefault(BaseModel):
    state: str
    default_rate: float
    count: int


class OverviewStats(BaseModel):
    total_loans: int
    default_rate: float
    avg_loan_amount: float
    avg_interest_rate: float
    avg_dti: float
    avg_annual_income: float


class FeatureImportance(BaseModel):
    feature: str
    importance: float


# ── Prediction ──────────────────────────────────────────────────────
class PredictionRequest(BaseModel):
    term: float = Field(default=36)
    installment: float = Field(default=300)
    grade: str = Field(default="B")
    application_type: str = Field(default="Individual")
    purpose: str = Field(default="debt_consolidation")
    tot_cur_bal: float = Field(default=50000)
    total_rev_hi_lim: float = Field(default=30000)
    loan_amnt: float = Field(default=10000)
    int_rate: float = Field(default=12.0)
    sub_grade: str = Field(default="B3")
    home_ownership: str = Field(default="RENT")
    annual_inc: float = Field(default=60000)
    verification_status: str = Field(default="Verified")
    dti: float = Field(default=15.0)
    delinq_2yrs: float = Field(default=0)
    inq_last_6mths: float = Field(default=1)
    open_acc: float = Field(default=10)
    pub_rec: float = Field(default=0)
    revol_bal: float = Field(default=12000)
    revol_util: float = Field(default=50.0)
    total_acc: float = Field(default=20)
    emp_length_yrs: float = Field(default=5)


class PredictionResponse(BaseModel):
    default_probability: float
    prediction: str
    threshold: float = 0.30


# ── Grade distribution for 3D viz ───────────────────────────────────
class GradeDistribution(BaseModel):
    grade: str
    count: int
    default_rate: float
    avg_interest_rate: float
    avg_loan_amount: float


class QuarterlyGradeDrift(BaseModel):
    quarter: str
    grade: str
    default_rate: float
    count: int


class StateApplicationRisk(BaseModel):
    state: str
    application_type: str
    default_rate: float
    count: int


class RecalibrationRecommendation(BaseModel):
    quarter: str
    grade: str
    observed_default_rate: float
    relative_risk_rank: int
    recommendation: str


class RiskFrameworkResponse(BaseModel):
    policy: str
    quarterly_recalibration: str
    state_application_features: str
    probability_overlay: str
