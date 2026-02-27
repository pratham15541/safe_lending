import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useDashboardStore } from "../store/dashboardStore";

const initialForm = {
  term: 36,
  installment: 300,
  grade: "B",
  application_type: "Individual",
  purpose: "debt_consolidation",
  tot_cur_bal: 50000,
  total_rev_hi_lim: 30000,
  loan_amnt: 10000,
  int_rate: 12,
  sub_grade: "B3",
  home_ownership: "RENT",
  annual_inc: 60000,
  verification_status: "Verified",
  dti: 15,
  delinq_2yrs: 0,
  inq_last_6mths: 1,
  open_acc: 10,
  pub_rec: 0,
  revol_bal: 12000,
  revol_util: 50,
  total_acc: 20,
  emp_length_yrs: 5,
};

const gradeOrder = ["A", "B", "C", "D", "E", "F", "G"];

export default function InferencePage() {
  const runPrediction = useDashboardStore((s) => s.runPrediction);
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const decisionBand = useMemo(() => {
    if (!result) return null;
    const gradeIdx = gradeOrder.indexOf(form.grade);
    const probaBand =
      result.default_probability >= 0.45
        ? "High"
        : result.default_probability >= 0.25
          ? "Medium"
          : "Low";
    const gradeBand = gradeIdx >= 4 ? "High" : gradeIdx >= 2 ? "Medium" : "Low";
    return `Grade risk: ${gradeBand} | Probability risk: ${probaBand}`;
  }, [form.grade, result]);

  const onChange = (key, value) => {
    const numberFields = new Set([
      "term",
      "installment",
      "tot_cur_bal",
      "total_rev_hi_lim",
      "loan_amnt",
      "int_rate",
      "annual_inc",
      "dti",
      "delinq_2yrs",
      "inq_last_6mths",
      "open_acc",
      "pub_rec",
      "revol_bal",
      "revol_util",
      "total_acc",
      "emp_length_yrs",
    ]);
    setForm((prev) => ({
      ...prev,
      [key]: numberFields.has(key) ? Number(value) : value,
    }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const output = await runPrediction(form);
      setResult(output);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-1 xl:grid-cols-2 gap-6"
    >
      <form
        onSubmit={submit}
        className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 space-y-3"
      >
        <h2 className="text-lg font-semibold">Probability Overlay Inference</h2>
        <p className="text-sm text-slate-400">
          Uses probability outputs alongside the existing grade system (not as a
          replacement).
        </p>

        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm">
            Grade
            <select
              className="mt-1 w-full rounded bg-slate-800 px-2 py-2"
              value={form.grade}
              onChange={(e) => onChange("grade", e.target.value)}
            >
              {gradeOrder.map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </label>

          <label className="text-sm">
            Application Type
            <select
              className="mt-1 w-full rounded bg-slate-800 px-2 py-2"
              value={form.application_type}
              onChange={(e) => onChange("application_type", e.target.value)}
            >
              <option>Individual</option>
              <option>Joint App</option>
            </select>
          </label>

          <label className="text-sm">
            Loan Amount
            <input
              className="mt-1 w-full rounded bg-slate-800 px-2 py-2"
              type="number"
              value={form.loan_amnt}
              onChange={(e) => onChange("loan_amnt", e.target.value)}
            />
          </label>

          <label className="text-sm">
            Interest Rate (%)
            <input
              className="mt-1 w-full rounded bg-slate-800 px-2 py-2"
              type="number"
              step="0.1"
              value={form.int_rate}
              onChange={(e) => onChange("int_rate", e.target.value)}
            />
          </label>

          <label className="text-sm">
            Annual Income
            <input
              className="mt-1 w-full rounded bg-slate-800 px-2 py-2"
              type="number"
              value={form.annual_inc}
              onChange={(e) => onChange("annual_inc", e.target.value)}
            />
          </label>

          <label className="text-sm">
            DTI
            <input
              className="mt-1 w-full rounded bg-slate-800 px-2 py-2"
              type="number"
              step="0.1"
              value={form.dti}
              onChange={(e) => onChange("dti", e.target.value)}
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="rounded bg-cyan-500 px-4 py-2 text-slate-950 font-semibold disabled:opacity-60"
        >
          {loading ? "Scoring..." : "Run Inference"}
        </button>

        {error && <p className="text-rose-400 text-sm">{error}</p>}
      </form>

      <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 space-y-3">
        <h3 className="text-lg font-semibold">Decision Output</h3>
        {!result && (
          <p className="text-sm text-slate-400">
            Submit a case to view risk outputs.
          </p>
        )}
        {result && (
          <>
            <p className="text-sm">
              Predicted default probability:{" "}
              <span className="font-semibold">
                {(result.default_probability * 100).toFixed(2)}%
              </span>
            </p>
            <p className="text-sm">
              Threshold:{" "}
              <span className="font-semibold">
                {(result.threshold * 100).toFixed(0)}%
              </span>
            </p>
            <p className="text-sm">
              Class prediction:{" "}
              <span className="font-semibold">{result.prediction}</span>
            </p>
            <p className="text-sm text-cyan-300">{decisionBand}</p>
          </>
        )}
      </section>
    </motion.div>
  );
}
