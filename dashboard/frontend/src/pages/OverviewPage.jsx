import { useEffect } from "react";
import { motion } from "framer-motion";
import KpiCard from "../components/KpiCard";
import D3GradeDefaultChart from "../components/D3GradeDefaultChart";
import D3GradeVolumeChart from "../components/D3GradeVolumeChart";
import { useDashboardStore } from "../store/dashboardStore";

export default function OverviewPage() {
  const {
    loading,
    error,
    overview,
    gradeDefault,
    gradeDistribution,
    modelMeta,
    riskFramework,
    fetchOverviewData,
  } = useDashboardStore();

  useEffect(() => {
    if (!overview) fetchOverviewData();
  }, [overview, fetchOverviewData]);

  if (loading && !overview) {
    return <p className="text-slate-300">Loading dashboard data...</p>;
  }

  if (error) {
    return <p className="text-rose-400">Error: {error}</p>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <section className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <KpiCard
          label="Total Loans"
          value={overview?.total_loans?.toLocaleString() || "-"}
        />
        <KpiCard
          label="Default Rate"
          value={
            overview ? `${(overview.default_rate * 100).toFixed(2)}%` : "-"
          }
        />
        <KpiCard
          label="Avg Loan"
          value={
            overview ? `$${overview.avg_loan_amount.toLocaleString()}` : "-"
          }
        />
        <KpiCard
          label="Avg Int Rate"
          value={overview ? `${overview.avg_interest_rate.toFixed(2)}%` : "-"}
        />
        <KpiCard
          label="Avg DTI"
          value={overview ? overview.avg_dti.toFixed(2) : "-"}
        />
        <KpiCard
          label="Avg Income"
          value={
            overview
              ? `$${Math.round(overview.avg_annual_income).toLocaleString()}`
              : "-"
          }
        />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <h2 className="text-lg font-semibold mb-2">
            Grade-level Default Rates (D3)
          </h2>
          <D3GradeDefaultChart data={gradeDefault} />
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <h2 className="text-lg font-semibold mb-2">
            Grade Volume & Risk Context (2D)
          </h2>
          <D3GradeVolumeChart data={gradeDistribution} />
          <p className="text-xs text-slate-400 mt-2">
            Interactive 2D bars show grade-level loan volume; hover reveals
            count, default rate, and average interest rate.
          </p>
        </div>
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
        <h2 className="text-lg font-semibold mb-3">Risk Framework</h2>
        <ul className="space-y-2 text-sm text-slate-200">
          <li>
            <span className="text-slate-400">Base policy:</span>{" "}
            {riskFramework?.policy}
          </li>
          <li>
            <span className="text-slate-400">Quarterly recalibration:</span>{" "}
            {riskFramework?.quarterly_recalibration}
          </li>
          <li>
            <span className="text-slate-400">
              State + application features:
            </span>{" "}
            {riskFramework?.state_application_features}
          </li>
          <li>
            <span className="text-slate-400">Probability overlay:</span>{" "}
            {riskFramework?.probability_overlay}
          </li>
        </ul>
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 space-y-2">
        <h2 className="text-lg font-semibold">Conclusion of Analysis</h2>
        <p className="text-sm text-slate-300">
          Portfolio behavior is stable on surface metrics, but the underlying
          risk system is drifting: grade remains directionally useful, yet
          calibration, geography, and application-type dispersion show hidden
          instability.
        </p>
        <p className="text-sm text-slate-300">
          Recommended approach is a hybrid: keep grade as base policy and apply
          probability overlay + quarterly recalibration with segment-level
          governance.
        </p>
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
        <h2 className="text-lg font-semibold mb-2">Model Performance</h2>
        <p className="text-sm text-slate-300">
          {modelMeta
            ? `${modelMeta.best_model_name} | ROC-AUC ${modelMeta.roc_auc.toFixed(3)} | Features ${modelMeta.n_features}`
            : "No metadata available"}
        </p>
      </section>
    </motion.div>
  );
}
