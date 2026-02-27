==================================================
FILE: loan_core.csv  |  Columns: 6
Columns: ['id', 'term', 'installment', 'grade', 'loan_status', 'disbursement_method']
Nulls >50%: ['id']

==================================================
FILE: borrower_profile.csv  |  Columns: 7
Columns: ['id', 'annual_inc_joint', 'emp_title', 'application_type', 'purpose', 'title', 'zip_code']
Nulls >50%: ['id', 'annual_inc_joint']

==================================================
FILE: credit_history.csv  |  Columns: 8
Columns: ['id', 'sec_app_earliest_cr_line', 'mths_since_last_major_derog', 'chargeoff_within_12_mths', 'collections_12_mths_ex_med', 'pub_rec_bankruptcies', 'tax_liens', 'pct_tl_nvr_dlq']
Nulls >50%: ['id', 'sec_app_earliest_cr_line', 'mths_since_last_major_derog']

==================================================
FILE: account_balances.csv  |  Columns: 11
Columns: ['id', 'revol_bal_joint', 'tot_cur_bal', 'tot_hi_cred_lim', 'total_rev_hi_lim', 'total_il_high_credit_limit', 'total_bal_il', 'all_util', 'il_util', 'avg_cur_bal', 'max_bal_bc']
Nulls >50%: ['id', 'revol_bal_joint']

==================================================
FILE: account_activity.csv  |  Columns: 21
Columns: ['id', 'inq_last_12m', 'inq_fi', 'open_acc_6m', 'open_il_12m', 'open_il_24m', 'open_rv_12m', 'open_rv_24m', 'num_rev_accts', 'num_op_rev_tl', 'num_bc_tl', 'num_bc_sats', 'num_sats', 'num_tl_op_past_12m', 'num_actv_bc_tl', 'num_actv_rev_tl', 'num_rev_tl_bal_gt_0', 'num_accts_ever_120_pd', 'num_tl_120dpd_2m', 'num_tl_30dpd', 'num_tl_90g_dpd_24m']
Nulls >50%: ['id']

==================================================
FILE: platform_metadata.csv  |  Columns: 3
Columns: ['id', 'desc', 'url']
Nulls >50%: ['id', 'desc', 'url']