# The Safe Lending — Comprehensive Analysis & ML Modeling

## 1. Project Overview

This project investigates historical loan data from the Lending Club platform (2007–2015) to uncover hidden patterns, assess risk drift, and build predictive machine learning models.

**Core Question (from PDF):**

> _Does the relationship between borrower characteristics, assigned grades, interest rates, and final loan outcomes remain consistent? Or are there patterns beneath the surface that suggest the system's balance may not be as steady as it appears?_

**Answer:** The marketplace appears operationally stable but is **gradually drifting beneath the surface**. Grade remains a directional risk indicator (A→G), but calibration gaps, geographic variation, application-type differences, and within-grade mispricing all point to a system whose assumptions are slowly diverging from borrower reality.

### 1.1 What We Had to Do to Solve the Problem

To answer the PDF question rigorously, the work had to follow a full evidence chain instead of a single model score:

1. Build a clean, merged analytical table from all six raw datasets (`01_data_cleaning.ipynb`), including target construction.
2. Test each behavioral hypothesis from the PDF (grade drift, debt burden, state effects, joint applications, hardship patterns) in EDA (`02_eda.ipynb`).
3. Train and compare multiple ML models (`03_ml_modeling.ipynb`) to quantify signal quality beyond descriptive plots.
4. Validate whether findings are operationally usable by exporting artifacts and exposing dashboard-ready APIs.

### 1.2 Codebase Verification Performed

The final answer is not narrative-only; it is backed by implemented assets and runnable surfaces:

- **Charts verified:** `charts/01` through `charts/25` exist, including drift, calibration, and mispricing visuals.
- **Data exports verified:** `data/final_analytical_answers.csv`, `data/drift_decision_summary.csv`, and `data/executive_summary_table.csv` exist and are populated.
- **Model artifacts verified:** `artifacts/best_model.joblib`, `scaler.joblib`, `label_encoders.joblib`, `feature_columns.json`, `metadata.json`.
- **Model metric verified in artifact:** `metadata.json` reports LightGBM ROC-AUC = `0.7099757399` (~0.710).
- **Backend implementation verified:** `dashboard/backend/main.py` exposes EDA, monitoring, risk-framework, and prediction endpoints.
- **Data wiring verified:** `dashboard/backend/data_loader.py` loads exported data/artifacts and computes monitoring aggregates.
- **Frontend wiring verified:** `dashboard/frontend/src/store/dashboardStore.js` consumes overview + monitoring + model endpoints.

---

## 2. Repository Structure

```
The Safe Lending/
├── notebooks/
│   ├── 01_data_cleaning.ipynb    # Data ingestion, merge, clean, target creation
│   ├── 02_eda.ipynb              # 15-section EDA answering all PDF questions
│   └── 03_ml_modeling.ipynb      # 22-section ML pipeline, 7 models, artifacts
├── data/
│   ├── loan_core.csv             # Raw: loan terms, grade, status
│   ├── borrower_profile.csv      # Raw: income, employment, purpose
│   ├── credit_history.csv        # Raw: delinquencies, bankruptcies
│   ├── account_balances.csv      # Raw: balances, utilization
│   ├── account_activity.csv      # Raw: inquiries, open accounts
│   ├── extra_unassigned.csv      # Raw: misc additional fields
│   ├── master_full.csv           # Cleaned: all 2.26M rows (generated)
│   ├── master_modeling.csv       # Cleaned: terminal-status rows only (generated)
│   ├── business_qa_summary.csv   # Business Q&A answers (generated)
│   ├── drift_decision_summary.csv# Drift evidence table (generated)
│   ├── final_analytical_answers.csv # Final 5 analytical answers (generated)
│   └── executive_summary_table.csv  # One-view executive summary (generated)
├── charts/                       # 26 high-resolution PNG visualizations
│   ├── 01–14: EDA charts
│   ├── 15–22: ML modeling charts
│   └── 23–25: Deep-dive EDA charts
├── artifacts/                    # Production-ready model assets
│   ├── best_model.joblib         # LGBMClassifier (best ROC-AUC)
│   ├── scaler.joblib             # StandardScaler fitted on training data
│   ├── label_encoders.joblib     # 6 LabelEncoders for categorical features
│   ├── feature_columns.json      # 22 feature names in training order
│   └── metadata.json             # Model name, AUC, row counts
├── LCDataDictionary.xlsx         # Lending Club official data dictionary
├── lending_club.pdf              # Original project PDF brief
├── lending_club_extracted.txt    # Extracted text from the PDF
├── doc.md                        # Schema documentation
├── schema.txt                    # Column schema reference
├── submission_checklist.md       # Question-by-question PDF coverage mapping
├── solution.md                   # Full solution document with charts & Q/A
└── Readme.md                     # This file
```

---

## 3. Environment & Setup

| Component     | Version / Detail                                                                                      |
| ------------- | ----------------------------------------------------------------------------------------------------- |
| Python        | 3.11                                                                                                  |
| Environment   | Miniconda (`safe_lending`)                                                                            |
| Key Libraries | pandas, numpy, matplotlib, seaborn, plotly, scikit-learn, xgboost, lightgbm, imbalanced-learn, joblib |

**To reproduce:**

```bash
conda create -n safe_lending python=3.11 -y
conda activate safe_lending
pip install pandas numpy matplotlib seaborn plotly scikit-learn xgboost lightgbm imbalanced-learn openpyxl kaleido joblib
```

**Run order:**

1. `notebooks/01_data_cleaning.ipynb` → generates `master_full.csv` and `master_modeling.csv`
2. `notebooks/02_eda.ipynb` → generates 17 charts answering all PDF questions
3. `notebooks/03_ml_modeling.ipynb` → trains 7 models, generates 9 charts, saves artifacts

---

## 4. Data Cleaning Process (`01_data_cleaning.ipynb`)

| Step                | Detail                                                                                 |
| ------------------- | -------------------------------------------------------------------------------------- |
| **Merge**           | 6 raw CSVs merged via row-index alignment (the `id` column was entirely NaN)           |
| **Shape**           | 2,260,668 rows × 49 columns after merge                                                |
| **Null handling**   | Columns with >90% nulls dropped; numeric nulls → median; categorical nulls → "Unknown" |
| **Target creation** | `is_default = 1` for Charged Off / Default / Late (31+ days); `= 0` for Fully Paid     |
| **Modeling subset** | `master_modeling.csv` filters to terminal statuses only (excludes "Current")           |
| **Type conversion** | `term` → numeric months; `emp_length` → numeric years; dates parsed to year/month      |

**Key data note:** FICO columns (`fico_range_high`, `fico_range_low`) are listed in `LCDataDictionary.xlsx` but are **not present** in any of the provided CSV files.

---

## 5. EDA Summary (`02_eda.ipynb` — 15 Sections, 17 Charts)

| Section | Analysis                                                  | Chart(s)                                                           |
| ------- | --------------------------------------------------------- | ------------------------------------------------------------------ |
| Sec 1   | Loan status distribution                                  | `01_loan_status_distribution.png`                                  |
| Sec 2   | Default rate by grade (A→G monotonic)                     | `02_default_rate_by_grade.png`                                     |
| Sec 3   | Sub-grade default + interest rate by grade                | `03_default_rate_by_subgrade.png`, `04_interest_rate_by_grade.png` |
| Sec 4   | Grade drift over time                                     | `05_grade_drift_over_time.png`                                     |
| Sec 5   | Borrower profile: income, employment, home, purpose       | `06_borrower_profile_default.png`                                  |
| Sec 6   | DTI vs default by grade                                   | `07_dti_vs_default.png`                                            |
| Sec 7   | Geographic: state choropleth + top/bottom 10              | `08_default_rate_by_state_map.png`, `09_top_bottom_states.png`     |
| Sec 8   | Joint vs individual default                               | `10_joint_vs_individual.png`                                       |
| Sec 9   | Credit utilization patterns                               | `11_credit_utilization_patterns.png`                               |
| Sec 10  | Loan amount, term, verification status                    | `12_loan_amount_verification.png`                                  |
| Sec 11  | Correlation heatmap                                       | `13_correlation_heatmap.png`                                       |
| Sec 12  | Recovery & hardship distributions                         | `14_recovery_hardship.png`                                         |
| Sec 13  | **State × Grade heatmap** (Q8 deep-dive)                  | `23_state_grade_default_heatmap.png`                               |
| Sec 14  | **Joint financials comparison** (Q11 deep-dive)           | `24_joint_financials_comparison.png`                               |
| Sec 15  | **Hardship/settlement × default × grade** (Q17 deep-dive) | `25_hardship_settlement_vs_default.png`                            |

---

## 6. ML Modeling Summary (`03_ml_modeling.ipynb` — 22 Sections)

### 6.1 Pipeline

| Step          | Detail                                               |
| ------------- | ---------------------------------------------------- |
| Data          | 200,000 stratified sample from `master_modeling.csv` |
| Features      | 22 features after dropping leaky/post-loan columns   |
| Encoding      | LabelEncoder for 6 categorical columns               |
| Scaling       | StandardScaler on all features                       |
| Class balance | SMOTE on training set only (80/20 split)             |
| Test set      | 40,000 rows, untouched by SMOTE                      |

### 6.2 Models Trained (7 Total)

| Model               | ROC-AUC    | Notes                                  |
| ------------------- | ---------- | -------------------------------------- |
| **LightGBM**        | **0.7100** | Best performer — production model      |
| XGBoost             | ~0.709     | Close second                           |
| Random Forest       | ~0.706     | Solid ensemble                         |
| Logistic Regression | ~0.690     | Baseline                               |
| SVM (RBF)           | ~0.688     | Trained on 40k subset for tractability |
| Decision Tree       | ~0.620     | Prone to overfitting                   |
| KNN                 | ~0.610     | Weakest for this dataset               |

### 6.3 Additional Analyses (Sections 13–22)

- **Threshold tuning** (0.30–0.60) — precision/recall/F1 tradeoffs
- **Inference demo** — load artifacts, score 5 new rows, assign Low/Medium/High risk bands
- **Grade calibration** — actual vs predicted default rate per grade
- **Business Q/A + drift summary** — exported to CSV
- **SVM supplemental** — required 7th model
- **Mispricing diagnostics** — grade × interest-rate quartile heatmap
- **3-fold stratified CV** — confirms LightGBM/XGBoost stability
- **Probability calibration** — Brier score comparison (uncalibrated vs calibrated)
- **Final analytical answers** — 5 programmatic answers to PDF
- **Executive summary table** — one-view deployment recommendation

---

## 7. Key Findings

1. **Grade is directionally correct but not perfectly reliable.** Default rates increase A (6%) → G (51%), but within-grade variation is substantial.
2. **Temporal drift is present.** Grade calibration gaps widen in riskier grades (E/F/G) over time.
3. **Mispricing exists.** Within the same grade, borrowers in the highest interest-rate quartile default more than those in the lowest.
4. **Geographic variation persists.** MS, NE, LA show consistently higher default; DC, ME, WA show lower. State×Grade heatmap confirms this.
5. **Joint applications default more, not less.** 32% default vs 21% for individual, with lower income and higher DTI.
6. **Hardship/settlement flags = 100% default** (by definition of being in the terminal-status dataset).
7. **The marketplace is stable on the surface but gradually drifting beneath.**

---

## 8. How to Tackle the Problem (Action Plan)

The analysis indicates drift can be managed if governance is operationalized. Recommended execution path:

1. **Keep grade as base tiering**, but stop using grade alone for decisions.
2. **Run quarterly recalibration** using realized `grade × quarter` default rates and update boundaries only when drift persists.
3. **Apply probability overlay** from LightGBM for review/pricing bands (do not replace grade, augment it).
4. **Add state + application_type governance layer** for exception monitoring and tighter controls in persistently high-risk segments.
5. **Use threshold policy by objective:** ~0.30–0.40 for higher recall (risk capture), ~0.50 for fewer false positives.
6. **Track drift KPIs continuously:** calibration gap by grade, within-grade rate-quartile dispersion, and state-grade spread.

---

## 9. Verification & Documentation

| Document                            | Purpose                                                                  |
| ----------------------------------- | ------------------------------------------------------------------------ |
| `submission_checklist.md`           | Question-by-question mapping: PDF question → notebook section → chart    |
| `solution.md`                       | Full solution with embedded chart references, detailed Q&A, and findings |
| `data/final_analytical_answers.csv` | 5 machine-generated final answers                                        |
| `data/executive_summary_table.csv`  | One-view model + drift + deployment summary                              |
| `data/business_qa_summary.csv`      | 4 business Q&A pairs                                                     |
| `data/drift_decision_summary.csv`   | 4-row drift evidence table                                               |
