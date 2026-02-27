# The Safe Lending — Detailed Project Plan

## 1. Project Overview

**Objective (from PDF):**  
The Lending Club platform operated from 2007–2015 with steady growth. Over time, subtle anomalies appeared:

- Same-grade loans behaved differently across states
- Borrowers with similar credit scores showed different repayment patterns based on debt/employment
- Higher-income applicants sometimes defaulted; moderate-profile borrowers repaid consistently
- Joint vs. individual applications behaved differently even with similar financials

**Core Question:**

> Does the relationship between borrower characteristics, assigned grades, interest rates, and final loan outcomes remain consistent — or are there hidden patterns that suggest the system's balance is drifting?

---

## 2. Data Inventory

| Table                  | Rows      | Columns | Key Fields                                                                                                                                                                                                                                          |
| ---------------------- | --------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `loan_core.csv`        | 2,260,668 | 6       | term, installment, grade, loan_status, disbursement_method                                                                                                                                                                                          |
| `borrower_profile.csv` | 2,260,668 | 7       | annual_inc_joint, emp_title, application_type, purpose, title, zip_code                                                                                                                                                                             |
| `credit_history.csv`   | 2,260,668 | 8       | sec_app_earliest_cr_line, mths_since_last_major_derog, chargeoff_within_12_mths, collections_12_mths_ex_med, pub_rec_bankruptcies, tax_liens, pct_tl_nvr_dlq                                                                                        |
| `account_balances.csv` | 2,260,668 | 11      | revol_bal_joint, tot_cur_bal, tot_hi_cred_lim, total_rev_hi_lim, total_il_high_credit_limit, total_bal_il, all_util, il_util, avg_cur_bal, max_bal_bc                                                                                               |
| `account_activity.csv` | 2,260,668 | 21      | inq_last_12m, inq_fi, open_acc_6m, open_il_12m/24m, open_rv_12m/24m, num_rev_accts, num_bc_tl, num_sats, num_actv_bc_tl, delinquency counts, etc.                                                                                                   |
| `extra_unassigned.csv` | 2,260,668 | 94      | loan_amnt, funded_amnt, int_rate, sub_grade, emp_length, home_ownership, annual_inc, verification_status, issue_d, addr_state, dti, delinq_2yrs, earliest_cr_line, revol_bal, revol_util, total_pymnt, recoveries, hardship/settlement fields, etc. |

**Join Rule:** All tables are 1:1 on `id` (but `id` is ALL NaN — use positional index / row number as implicit join key).

---

## 3. Questions / Analysis Tasks to Answer (Derived from PDF)

### A. Grade & Risk Consistency

1. **Does grade accurately predict default?** — Default rate by grade (A–G) and sub_grade.
2. **Has grade reliability drifted over time?** — Default rate by grade over `issue_d` (year/quarter).
3. **Is interest rate aligned with risk within each grade?** — int_rate distribution by grade, and actual default rate vs. expected.

### B. Borrower Profile vs. Outcomes

4. **Do borrowers with similar credit scores default differently by debt level?** — DTI segments vs. default rate, controlling for grade.
5. **Does employment length affect repayment?** — Default rate by emp_length, grade-adjusted.
6. **Higher income ≠ lower default?** — annual_inc quantiles vs. default rate.
7. **Purpose of loan vs. default** — Default rate by purpose category.

### C. Geographic Variation

8. **Do same-grade loans perform differently across states?** — Default rate by addr_state within each grade.
9. **Regional risk clusters** — Map visualization of default rates by state.

### D. Joint vs. Individual Applications

10. **Do joint applications default less?** — Default rate by application_type (Individual vs. Joint).
11. **Joint financial strength vs. outcome** — annual_inc_joint, dti_joint effect on repayment.

### E. Credit & Account Behavior Patterns

12. **Delinquency history as predictor** — delinq_2yrs, num_accts_ever_120_pd, mths_since_last_delinq vs. default.
13. **Revolving utilization impact** — revol_util, all_util, bc_util vs. default.
14. **Account activity signals** — Recent inquiries, new accounts opened vs. default.

### F. Loan Performance & Recovery

15. **Loan status distribution** — Fully Paid, Charged Off, Current, Default, Late, etc.
16. **Recovery analysis** — recoveries, collection_recovery_fee by grade.
17. **Hardship & settlement patterns** — hardship_flag, debt_settlement_flag distribution and outcome.

---

## 4. ML Models Required

| Model                                      | Purpose                                                    | Type           |
| ------------------------------------------ | ---------------------------------------------------------- | -------------- |
| **Logistic Regression**                    | Baseline binary classifier (default vs. fully paid)        | Classification |
| **Random Forest Classifier**               | Non-linear feature importance, handles mixed features well | Classification |
| **Gradient Boosting (XGBoost / LightGBM)** | Best performance for tabular data, feature importance      | Classification |
| **Decision Tree**                          | Interpretable rules for default prediction                 | Classification |
| **K-Nearest Neighbors (KNN)**              | Alternative non-parametric classifier                      | Classification |
| **Support Vector Machine (SVM)**           | Margin-based classification (on sampled data due to scale) | Classification |

**Target Variable:** `loan_status` → Binary: `1` = Default/Charged Off, `0` = Fully Paid  
**Evaluation Metrics:** Accuracy, Precision, Recall, F1-Score, ROC-AUC, Confusion Matrix

---

## 5. Charts / Visualizations Required

| #   | Chart                                                       | Library             |
| --- | ----------------------------------------------------------- | ------------------- |
| 1   | Default rate by grade (bar chart)                           | Plotly / Matplotlib |
| 2   | Default rate by sub_grade (bar chart)                       | Plotly              |
| 3   | Default rate over time by grade (line chart)                | Plotly              |
| 4   | Interest rate distribution by grade (box plot)              | Plotly / Seaborn    |
| 5   | Default rate by DTI bins (bar chart)                        | Matplotlib          |
| 6   | Default rate by annual income quantiles (bar chart)         | Matplotlib          |
| 7   | Default rate by employment length (bar chart)               | Matplotlib          |
| 8   | Default rate by loan purpose (horizontal bar)               | Matplotlib          |
| 9   | Default rate by state (choropleth map)                      | Plotly              |
| 10  | Default rate: Joint vs. Individual (bar chart)              | Matplotlib          |
| 11  | Loan status distribution (pie / donut chart)                | Plotly              |
| 12  | Correlation heatmap of numeric features                     | Seaborn             |
| 13  | Feature importance from Random Forest / XGBoost (bar chart) | Matplotlib          |
| 14  | ROC curves for all models (line chart)                      | Matplotlib          |
| 15  | Confusion matrices for each model (heatmap)                 | Seaborn             |
| 16  | Revolving utilization vs. default (box plot)                | Seaborn             |
| 17  | Recovery amount by grade (bar chart)                        | Matplotlib          |
| 18  | Hardship & settlement flag distribution (count plot)        | Seaborn             |

---

## 6. Python Tech Stack

| Category                 | Libraries                                                               |
| ------------------------ | ----------------------------------------------------------------------- |
| **Data Manipulation**    | `pandas`, `numpy`                                                       |
| **Visualization**        | `matplotlib`, `seaborn`, `plotly`                                       |
| **ML Modeling**          | `scikit-learn`, `xgboost`, `lightgbm`                                   |
| **ML Utilities**         | `imbalanced-learn` (SMOTE for class imbalance)                          |
| **Feature Engineering**  | `scikit-learn` (LabelEncoder, OneHotEncoder, StandardScaler)            |
| **Model Evaluation**     | `scikit-learn` (classification_report, roc_auc_score, confusion_matrix) |
| **Notebook Environment** | `jupyter`, `ipykernel`                                                  |
| **Misc**                 | `warnings`, `os`, `gc` (memory management for 2.2M rows)                |

---

## 7. Step-by-Step Execution Plan

### Phase 1 — Environment Setup

1. Create miniconda environment: `safe_lending` (Python 3.11)
2. Install all required packages
3. Register Jupyter kernel

### Phase 2 — Data Loading & Cleaning (Notebook 01)

1. Load all 6 CSV files
2. Fix the `id` column (all NaN → generate sequential IDs or use row index)
3. Merge all tables into one master DataFrame using index
4. Handle missing values:
   - Drop columns with >90% nulls (member*id, sec_app*\_ columns, hardship\_\_, settlement\_\*)
   - Impute numeric nulls with median
   - Impute categorical nulls with mode or "Unknown"
5. Convert data types (dates, categoricals)
6. Create binary target: `is_default` (1 if Charged Off/Default/Late, 0 if Fully Paid)
7. Filter to terminal loan statuses only (Fully Paid + Charged Off) for modeling
8. Save cleaned dataset

### Phase 3 — Exploratory Data Analysis (Notebook 02)

1. Loan status distribution
2. Grade & sub_grade analysis
3. Interest rate vs. grade analysis
4. Borrower demographics (income, employment, home ownership)
5. Geographic analysis (state-level default rates)
6. DTI analysis
7. Joint vs. Individual comparison
8. Credit history patterns
9. Temporal trends (issue_d)
10. Correlation analysis

### Phase 4 — Feature Engineering & Modeling (Notebook 03)

1. Feature selection (drop leaky/irrelevant columns)
2. Encode categorical variables
3. Scale numeric features
4. Train-test split (80-20, stratified)
5. Handle class imbalance (SMOTE)
6. Train all 6 models
7. Evaluate with metrics + ROC curves
8. Feature importance analysis
9. Model comparison summary

---

## 8. Expected Deliverables

| #   | Deliverable                        | Format                      |
| --- | ---------------------------------- | --------------------------- |
| 1   | `instruction.md`                   | This plan document          |
| 2   | `notebooks/01_data_cleaning.ipynb` | Jupyter Notebook            |
| 3   | `notebooks/02_eda.ipynb`           | Jupyter Notebook            |
| 4   | `notebooks/03_ml_modeling.ipynb`   | Jupyter Notebook            |
| 5   | `data/master_full.csv`             | Full cleaned merged dataset |
| 6   | `data/master_modeling.csv`         | Modeling-ready subset       |
| 7   | `charts/`                          | All exported visualizations |

---

## 9. Key Data Issues Identified

1. **`id` column is ALL NaN** across every table → Must use row index as join key
2. **`extra_unassigned.csv` has 94 columns** — contains most of the critical features (int_rate, annual_inc, dti, addr_state, issue_d, etc.)
3. **High-null columns** to drop: member*id (100%), sec_app*\_ (~95%), hardship\_\_ (~97%), settlement\_\* (~98%), revol_bal_joint (~95%), annual_inc_joint (~95%)
4. **2.26M rows** — memory management needed (use chunking or downcasting)
5. **Mixed date formats** in issue_d, earliest_cr_line columns
6. **Target class imbalance** likely (most loans are Fully Paid)

## 10. Additional Analysis — Grade Calibration & Risk Drift Validation

To fully answer whether the grading system remained aligned with actual borrower risk over time, we will add calibration and drift validation analysis.

A. Grade Calibration Check

Objective:
Verify whether assigned grades reflect the actual observed default probability.

Method:

Calculate actual default rate per grade (A–G).

Compare average predicted probability (from Logistic / XGBoost model) per grade.

Plot:

Calibration curve (Predicted vs Actual Default Rate)

Bar chart of Expected vs Actual default per grade

Interpretation:

If Grade B historically implied ~10% risk but actual default becomes 18%,
→ Grade calibration drift exists.

If lower grades become closer to higher grades over time,
→ Risk compression or grading misalignment.

B. Temporal Grade Stability Test

Objective:
Check whether grade risk meaning changed over time.

Method:

Compute default rate by:

Grade × Year (or Quarter of issue_d)

Plot line chart:

X-axis: Year

Y-axis: Default Rate

Separate line per grade

Interpretation:

If Grade A default increases significantly over years while others stay stable,
→ Grade signal weakening.

If grade separation narrows over time,
→ Risk differentiation declining.

C. Interest Rate vs Realized Risk Alignment

Objective:
Check whether pricing matches true borrower risk.

Method:

Within each grade:

Segment loans by interest rate quartiles

Compare default rates across quartiles

Interpretation:

If higher interest inside same grade does NOT correspond to higher default,
→ Pricing inefficiency.

If low-rate loans default similarly to high-rate loans,
→ Risk not properly priced.

D. Model-Based Signal Validation

Objective:
Test whether Grade is still a top predictive feature.

Method:

Train ML models.

Extract feature importance.

Compare:

Importance of grade

Importance of DTI, utilization, delinquency, state, income

Interpretation:

If grade importance is low compared to behavioral features,
→ Grading framework may be missing stronger risk signals.

If state or joint application type dominates,
→ Structural risk heterogeneity exists.

---

## 11. Current Execution Status (As of 2026-02-27)

### Completed

1. Environment Setup

- Miniconda environment `safe_lending` created.
- Core packages installed (pandas, numpy, matplotlib, seaborn, plotly, sklearn, xgboost, lightgbm, imbalanced-learn, jupyter, ipykernel).
- Notebook kernel registered.

2. Notebook 01 — Data Cleaning

- Executed end-to-end successfully.
- Generated `data/master_full.csv` and `data/master_modeling.csv`.
- High-null columns (>90%) dropped.
- Target `is_default` created and validated.

3. Notebook 02 — EDA

- Executed all code cells successfully.
- Required analysis charts generated in `charts/`.
- Grade risk, drift patterns, geographic variation, and joint-vs-individual analyses completed.

4. Notebook 03 — ML Modeling

- Executed all code cells successfully.
- Trained 6 models and generated comparison, ROC, confusion matrix, and feature-importance outputs.
- Best ROC-AUC in current sampled run: LightGBM (~0.7100), followed by XGBoost (~0.7056).
- Preprocessing hardened to force zero nulls before scaling/SMOTE.

---

## 12. Remaining Tasks (Continue From Here)

### Priority A — Production Readiness

1. Save Best Model + Preprocessing Artifacts

- Persist:
  - trained best model (LightGBM or XGBoost)
  - scaler
  - label encoders
  - feature column list
- Output folder suggestion: `artifacts/`

Status: ✅ Completed

Outputs:

- `artifacts/best_model.joblib`
- `artifacts/scaler.joblib`
- `artifacts/label_encoders.joblib`
- `artifacts/feature_columns.json`
- `artifacts/metadata.json`

2. Add Inference Section

- Add notebook section to load artifacts and score new borrower rows.
- Return predicted default probability + risk band (Low/Medium/High).

Status: ✅ Completed (Notebook 03, Section 14)

3. Threshold Optimization

- Evaluate thresholds (e.g., 0.30, 0.40, 0.50, 0.60).
- Select operating threshold based on business preference:
  - maximize recall (risk control), or
  - balance precision/recall (portfolio quality).

Status: ✅ Completed (Notebook 03, Section 13)

Current recommendation:

- Threshold ~0.30 for higher recall (risk capture)
- Threshold ~0.50 for higher precision (stricter approvals)

### Priority B — Business Interpretation

4. Convert EDA + ML into Q/A Business Answers

- Prepare concise answers to the PDF prompts:
  - Is grade calibration stable?
  - Are states behaving differently at same grade?
  - Are joint applications materially different?
  - Which variables now explain risk better than grade?

Status: ✅ Completed (Notebook 03, Section 16)

Output:

- `data/business_qa_summary.csv`

5. Add “Drift Decision” Summary Table

- Final table with columns:
  - Evidence
  - Metric/Chart
  - Observation
  - Drift Signal (Yes/No)

Status: ✅ Completed (Notebook 03, Section 16)

Output:

- `data/drift_decision_summary.csv`

### Priority C — Optional Improvements

6. Add Cross-Validation

- Use Stratified K-Fold CV for top 2 models.
- Report mean/std ROC-AUC.

Status: ✅ Completed (Notebook 03, Section 19)

7. Add Probability Calibration

- Calibrate best model probabilities (Platt/Isotonic).
- Compare calibration curves before vs after.

Status: ✅ Completed (Notebook 03, Section 20)

---

## 13. Exact Next Step Sequence

1. Validate saved artifacts on unseen data sample.
2. Convert notebook flow into reusable Python modules/scripts if deployment is needed.
3. Finalize documentation for model monitoring (drift and calibration checks).

---

## 14. Final Analytical Question Completion

All required final analytical questions are explicitly answered in:

- `notebooks/03_ml_modeling.ipynb` (Section 21)
- Output file: `data/final_analytical_answers.csv`

Summary outcome:

- Grade remains directionally useful but not fully sufficient alone.
- Calibration drift is present, especially in higher-risk grades.
- Mispricing signals appear within grade by interest-rate quartiles.
- Application-type and geographic variation indicate hidden instability pockets.
- System is broadly stable but shows gradual underlying drift.
