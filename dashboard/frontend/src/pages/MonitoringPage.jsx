import { useEffect } from "react";
import { motion } from "framer-motion";
import D3QuarterlyDriftChart from "../components/D3QuarterlyDriftChart";
import D3StateApplicationChart from "../components/D3StateApplicationChart";
import { useDashboardStore } from "../store/dashboardStore";

export default function MonitoringPage() {
  const {
    loading,
    error,
    gradeDrift,
    stateApplication,
    recalibration,
    fetchMonitoringData,
  } = useDashboardStore();

  useEffect(() => {
    if (!gradeDrift.length) fetchMonitoringData();
  }, [gradeDrift.length, fetchMonitoringData]);

  if (loading && !gradeDrift.length) {
    return <p className="text-slate-300">Loading monitoring data...</p>;
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
      <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
        <h2 className="text-lg font-semibold mb-2">
          Active Monitoring: Quarterly Drift (D3)
        </h2>
        <p className="text-sm text-slate-400 mb-3">
          This trend tracks average default-rate movement over quarters to
          detect calibration drift early.
        </p>
        <D3QuarterlyDriftChart data={gradeDrift} />
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
        <h2 className="text-lg font-semibold mb-2">
          State × Application-Type Risk (D3)
        </h2>
        <p className="text-sm text-slate-400 mb-3">
          Incorporates state-level and application-type effects into risk
          governance.
        </p>
        <D3StateApplicationChart data={stateApplication} />
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 overflow-auto">
        <h2 className="text-lg font-semibold mb-3">
          Quarterly Recalibration Recommendations
        </h2>
        <table className="w-full text-sm">
          <thead className="text-slate-400 border-b border-slate-800">
            <tr>
              <th className="text-left py-2">Quarter</th>
              <th className="text-left py-2">Grade</th>
              <th className="text-left py-2">Observed Default</th>
              <th className="text-left py-2">Risk Rank</th>
              <th className="text-left py-2">Recommendation</th>
            </tr>
          </thead>
          <tbody>
            {recalibration.slice(-28).map((row, idx) => (
              <tr
                key={`${row.quarter}-${row.grade}-${idx}`}
                className="border-b border-slate-900"
              >
                <td className="py-2">{row.quarter}</td>
                <td className="py-2">{row.grade}</td>
                <td className="py-2">
                  {(row.observed_default_rate * 100).toFixed(2)}%
                </td>
                <td className="py-2">{row.relative_risk_rank}</td>
                <td className="py-2">{row.recommendation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </motion.div>
  );
}
