# The Safe Lending — Submission Checklist

> A strict, question-by-question mapping of every requirement from the original PDF to the exact notebook sections, code cells, and output artifacts where they are answered.

---

## Part 1: Core PDF Exploratory Questions (17 Questions)

### A. Grade & Risk (Q1–Q3)

| #      | Question from PDF                                     | Notebook & Section            | Code Cell(s)                                                                 | Output Artifacts                                                                                                     | Status            |
| ------ | ----------------------------------------------------- | ----------------------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ----------------- |
| **Q1** | Does grade accurately predict default?                | `02_eda.ipynb` Sec 2          | Cell 4 (exec #3): `grade_default = terminal.groupby('grade')['is_default']…` | `charts/02_default_rate_by_grade.png` — bar chart showing monotonic increase A (6%) → G (51%)                        | ✅ Fully Answered |
|        |                                                       | `02_eda.ipynb` Sec 3          | Cell 6 (exec #4): Sub-grade default rates A1→G5                              | `charts/03_default_rate_by_subgrade.png` — 35 sub-grade bars confirming monotonic trend                              | ✅                |
| **Q2** | Has grade reliability drifted over time?              | `02_eda.ipynb` Sec 4          | Cell 8 (exec #5): `grade_year = terminal.groupby(['issue_year','grade'])…`   | `charts/05_grade_drift_over_time.png` — Plotly line chart, year on x-axis, default rate per grade                    | ✅ Fully Answered |
|        |                                                       | `03_ml_modeling.ipynb` Sec 15 | Cell 25 (exec #14): Grade calibration actual vs predicted                    | `charts/20_grade_calibration.png` — predicted vs actual default per grade                                            | ✅                |
|        |                                                       | `03_ml_modeling.ipynb` Sec 16 | Cell 27 (exec #16): Drift decision summary                                   | `data/drift_decision_summary.csv` — 4 evidence rows, 3/4 flagged "Yes"                                               | ✅                |
| **Q3** | Is interest rate aligned with risk within each grade? | `02_eda.ipynb` Sec 3          | Cell 6 (exec #4): Box plot of int_rate by grade                              | `charts/04_interest_rate_by_grade.png` — box plot showing rate bands widen for lower grades                          | ✅ Fully Answered |
|        |                                                       | `03_ml_modeling.ipynb` Sec 18 | Cell 29 (exec #17): Within-grade rate quartile analysis                      | `charts/21_mispricing_grade_rate_quartile.png` — heatmap showing Q4 borrowers default more than Q1 within same grade | ✅                |

### B. Borrower Profile (Q4–Q7)

| #      | Question from PDF                                                          | Notebook & Section   | Code Cell(s)                                                          | Output Artifacts                                                                                                           | Status            |
| ------ | -------------------------------------------------------------------------- | -------------------- | --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| **Q4** | Do borrowers with similar credit scores default differently by debt level? | `02_eda.ipynb` Sec 6 | Cell 10 (exec #6): DTI bins + box plot by grade/default               | `charts/07_dti_vs_default.png` — (left) bar chart DTI bins vs default rate; (right) box plot DTI by grade × default status | ✅ Fully Answered |
| **Q5** | Does employment length affect repayment?                                   | `02_eda.ipynb` Sec 5 | Cell 9 (exec #5): `emp_default = terminal.groupby('emp_length_yrs')…` | `charts/06_borrower_profile_default.png` — top-right subplot: employment length vs default rate                            | ✅ Fully Answered |
| **Q6** | Higher income ≠ lower default?                                             | `02_eda.ipynb` Sec 5 | Cell 9: Income decile analysis                                        | `charts/06_borrower_profile_default.png` — top-left subplot: income decile vs default rate (non-linear relationship)       | ✅ Fully Answered |
| **Q7** | Purpose of loan vs. default                                                | `02_eda.ipynb` Sec 5 | Cell 9: Purpose breakdown                                             | `charts/06_borrower_profile_default.png` — bottom-right subplot: loan purpose default rates (small business highest)       | ✅ Fully Answered |

### C. Geography (Q8–Q9)

| #      | Question from PDF                                      | Notebook & Section    | Code Cell(s)                                        | Output Artifacts                                                                                                                                          | Status            |
| ------ | ------------------------------------------------------ | --------------------- | --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| **Q8** | Do same-grade loans perform differently across states? | `02_eda.ipynb` Sec 7  | Cell 12 (exec #7): State choropleth + top/bottom 10 | `charts/08_default_rate_by_state_map.png` — US choropleth colored by default rate                                                                         | ✅ Fully Answered |
|        |                                                        |                       |                                                     | `charts/09_top_bottom_states.png` — bar: top 10 vs bottom 10 states                                                                                       | ✅                |
|        |                                                        | `02_eda.ipynb` Sec 13 | Cell 29 (exec #16): State × Grade heatmap           | `charts/23_state_grade_default_heatmap.png` — 49-state × 7-grade heatmap with annotated rates; top-10 worst combos printed (MS-G 65%, LA-G 65%, PA-G 61%) | ✅ Deep-Dive      |
| **Q9** | Regional risk clusters                                 | `02_eda.ipynb` Sec 7  | Cell 12: Choropleth map                             | `charts/08_default_rate_by_state_map.png` — visual clusters: South/Southeast higher, Northwest/Northeast lower                                            | ✅ Fully Answered |

### D. Application Type (Q10–Q11)

| #       | Question from PDF                    | Notebook & Section            | Code Cell(s)                                                   | Output Artifacts                                                                                                                                                                                      | Status            |
| ------- | ------------------------------------ | ----------------------------- | -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| **Q10** | Do joint applications default less?  | `02_eda.ipynb` Sec 8          | Cell 14 (exec #8): Joint vs Individual default rate + by grade | `charts/10_joint_vs_individual.png` — (left) bar: Individual 21% vs Joint 32%; (right) line: per-grade comparison                                                                                     | ✅ Fully Answered |
| **Q11** | Joint financial strength vs. outcome | `02_eda.ipynb` Sec 8 + Sec 14 | Cell 14 + Cell 31 (exec #17)                                   | `charts/10_joint_vs_individual.png` + `charts/24_joint_financials_comparison.png`                                                                                                                     | ✅ Fully Answered |
|         |                                      |                               |                                                                | Joint financials chart shows: income distributions (Joint median $50k vs Individual $65k), DTI (Joint 32 vs Individual 18), default rate with sample sizes (n=25,839 joint vs n=1,306,182 individual) | ✅ Deep-Dive      |

### E. Credit Behavior (Q12–Q14)

| #       | Question from PDF                | Notebook & Section           | Code Cell(s)                                    | Output Artifacts                                                                                                      | Status            |
| ------- | -------------------------------- | ---------------------------- | ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ----------------- |
| **Q12** | Delinquency history as predictor | `02_eda.ipynb` Sec 9         | Cell 16 (exec #9): Delinquency count vs default | `charts/11_credit_utilization_patterns.png` — top-right subplot: delinq_2yrs vs default (clear positive relationship) | ✅ Fully Answered |
|         |                                  | `03_ml_modeling.ipynb` Sec 9 | Feature importance charts                       | `charts/18_feature_importance.png` — delinq_2yrs among top features in XGBoost/LightGBM                               | ✅                |
| **Q13** | Revolving utilization impact     | `02_eda.ipynb` Sec 9         | Cell 16: revol_util box plot by default status  | `charts/11_credit_utilization_patterns.png` — top-left: defaulters have higher median revol_util                      | ✅ Fully Answered |
| **Q14** | Account activity signals         | `02_eda.ipynb` Sec 9         | Cell 16: Open accounts + inquiries vs default   | `charts/11_credit_utilization_patterns.png` — bottom: open_acc bins and inq_last_6mths vs default                     | ✅ Fully Answered |

### F. Loan Outcomes (Q15–Q17)

| #       | Question from PDF              | Notebook & Section             | Code Cell(s)                                           | Output Artifacts                                                                                                                                                                                                                                     | Status                        |
| ------- | ------------------------------ | ------------------------------ | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| **Q15** | Loan status distribution       | `02_eda.ipynb` Sec 1           | Cell 2 (exec #2): Pie + bar chart of all loan statuses | `charts/01_loan_status_distribution.png` — pie: Current 50.3%, Fully Paid 37.0%, Charged Off 9.8%, etc.                                                                                                                                              | ✅ Fully Answered             |
| **Q16** | Recovery analysis              | `02_eda.ipynb` Sec 12          | Cell 22 (exec #12): Average recovery amount by grade   | `charts/14_recovery_hardship.png` — left subplot: recovery amounts by grade (higher grades = higher recovery)                                                                                                                                        | ✅ Fully Answered             |
| **Q17** | Hardship & settlement patterns | `02_eda.ipynb` Sec 12 + Sec 15 | Cell 22 + Cell 33 (exec #18)                           | `charts/14_recovery_hardship.png` — flag distributions + `charts/25_hardship_settlement_vs_default.png` — cross-tab and bar chart showing 100% of hardship_flag=Y and settlement_flag=Y borrowers defaulted; default rates also broken down by grade | ✅ Fully Answered + Deep-Dive |

---

## Part 2: Final Analytical Conclusions (5 Questions)

Generated programmatically in `03_ml_modeling.ipynb` Section 21 and exported to `data/final_analytical_answers.csv`.

| #      | Final Question                                                            | Our Verified Answer                                                                                                                                                          | Key Evidence                                                                                                   |
| ------ | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| **F1** | Does grade still reliably represent risk?                                 | **Yes, directionally — but not perfectly.** A→G default increases monotonically, but calibration gaps and within-grade dispersion mean grade alone is insufficient.          | `02_default_rate_by_grade.png`, `20_grade_calibration.png`                                                     |
| **F2** | Has grade calibration drifted over time?                                  | **Yes.** Predicted vs actual default gaps widen in riskier grades (E/F/G). Drift is evident in temporal plots.                                                               | `05_grade_drift_over_time.png`, `drift_decision_summary.csv`                                                   |
| **F3** | Are some borrower segments systematically mispriced?                      | **Yes.** Within the same grade, borrowers in the highest interest-rate quartile default significantly more than those in the lowest.                                         | `21_mispricing_grade_rate_quartile.png`                                                                        |
| **F4** | Does geographic or application-type variation suggest hidden instability? | **Yes.** State-level variation persists across grades. Joint apps default at 32% vs 21% individual.                                                                          | `08_default_rate_by_state_map.png`, `23_state_grade_default_heatmap.png`, `24_joint_financials_comparison.png` |
| **F5** | Is the marketplace stable — or gradually drifting?                        | **Stable on the surface, gradually drifting beneath.** The system continues to operate, but the assumptions underlying its risk framework are slowly diverging from reality. | `executive_summary_table.csv`                                                                                  |

---

## Part 3: Machine Learning & Modeling Requirements (7 Requirements)

| #      | Requirement                                                           | Where Implemented                                      | Output Artifacts                                                                                                 | Status      |
| ------ | --------------------------------------------------------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- | ----------- |
| **M1** | Train multiple models (Logistic, RF, XGBoost, LightGBM, DT, KNN, SVM) | `03_ml_modeling.ipynb` Sec 5 (6 models) + Sec 17 (SVM) | `charts/15_model_comparison.png`, `charts/16_roc_curves.png`                                                     | ✅ 7 Models |
| **M2** | Handle class imbalance                                                | `03_ml_modeling.ipynb` Sec 4                           | SMOTE applied to training set; test set untouched                                                                | ✅          |
| **M3** | Feature importance analysis                                           | `03_ml_modeling.ipynb` Sec 9                           | `charts/18_feature_importance.png` — top 20 features for XGBoost + LightGBM + RF top-15 printed                  | ✅          |
| **M4** | Threshold tuning                                                      | `03_ml_modeling.ipynb` Sec 13                          | `charts/19_threshold_tuning.png` — precision/recall/F1 curves at thresholds 0.30–0.60                            | ✅          |
| **M5** | Probability calibration                                               | `03_ml_modeling.ipynb` Sec 20                          | `charts/22_calibration_curve.png` — Brier scores: uncalibrated vs calibrated (sigmoid)                           | ✅          |
| **M6** | Cross-validation                                                      | `03_ml_modeling.ipynb` Sec 19                          | 3-fold stratified CV for LightGBM + XGBoost; mean AUC ± std printed                                              | ✅          |
| **M7** | Save production artifacts                                             | `03_ml_modeling.ipynb` Sec 12                          | `artifacts/best_model.joblib`, `scaler.joblib`, `label_encoders.joblib`, `feature_columns.json`, `metadata.json` | ✅          |

---

## Coverage Summary

| Category                 | Questions | Fully Answered | Status      |
| ------------------------ | --------- | -------------- | ----------- |
| Part 1: EDA Questions    | 17        | 17/17          | ✅ Complete |
| Part 2: Final Analytical | 5         | 5/5            | ✅ Complete |
| Part 3: ML Requirements  | 7         | 7/7            | ✅ Complete |
| **Total**                | **29**    | **29/29**      | **✅ 100%** |
