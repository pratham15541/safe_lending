import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import api from "../api/client";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const domains = [
  { key: "ALL", label: "All" },
  { key: "A", label: "A. Grade & Risk" },
  { key: "B", label: "B. Borrower Profile" },
  { key: "C", label: "C. Geography" },
  { key: "D", label: "D. Application Type" },
  { key: "E", label: "E. Credit Behavior" },
  { key: "F", label: "F. Loan Performance" },
  { key: "FINAL", label: "Final Conclusions" },
];

const questionCards = [
  {
    id: "Q1",
    domain: "A",
    title: "Q1. Does grade accurately predict default?",
    answer:
      "Yes, directionally. Default rate increases from Grade A to Grade G, but grade is not sufficient alone.",
    shows:
      "Default-rate staircase across grade and sub-grade buckets with monotonic risk progression.",
    determines:
      "Current grading still captures broad risk direction, but fine-grained separation needs support from additional features.",
    charts: ["02_default_rate_by_grade.png", "03_default_rate_by_subgrade.png"],
  },
  {
    id: "Q2",
    domain: "A",
    title: "Q2. Has grade reliability drifted over time?",
    answer:
      "Yes. Temporal grade behavior and calibration gaps indicate drift pressure over time.",
    shows:
      "Grade-by-time default movement plus predicted-vs-observed calibration by grade.",
    determines:
      "Quarterly recalibration is required to keep grade meaning stable.",
    charts: ["05_grade_drift_over_time.png", "20_grade_calibration.png"],
  },
  {
    id: "Q3",
    domain: "A",
    title: "Q3. Is interest rate aligned with risk within grade?",
    answer:
      "Partially. Pricing rises with grade risk, but within-grade rate quartiles still show meaningful default differences.",
    shows:
      "Interest-rate bands by grade and within-grade quartile mispricing heatmap.",
    determines:
      "Some segments are under/over-priced relative to realized risk.",
    charts: [
      "04_interest_rate_by_grade.png",
      "21_mispricing_grade_rate_quartile.png",
    ],
  },
  {
    id: "Q4",
    domain: "B",
    title: "Q4. Similar profile borrowers: debt level impact?",
    answer:
      "Yes. Higher DTI associates with higher default even within comparable grade bands.",
    shows:
      "Default by DTI bins and DTI distributions split by grade and outcome.",
    determines:
      "Debt burden is a live stress signal and should remain in active risk controls.",
    charts: ["07_dti_vs_default.png"],
  },
  {
    id: "Q5",
    domain: "B",
    title: "Q5. Does employment length affect repayment?",
    answer:
      "Weakly. Employment tenure is less predictive than DTI/utilization/inquiries.",
    shows:
      "Employment-length default profile compared with other borrower attributes.",
    determines:
      "Employment length should be secondary in decisioning hierarchy.",
    charts: ["06_borrower_profile_default.png"],
  },
  {
    id: "Q6",
    domain: "B",
    title: "Q6. Higher income always lower default?",
    answer:
      "No. Relationship is non-linear; higher income does not guarantee lower default.",
    shows:
      "Income-decile default curve with flattening at mid/high income levels.",
    determines:
      "Income must be interpreted jointly with debt and utilization, not in isolation.",
    charts: ["06_borrower_profile_default.png"],
  },
  {
    id: "Q7",
    domain: "B",
    title: "Q7. Loan purpose vs default",
    answer:
      "Purpose materially changes risk; some purpose categories default much more.",
    shows: "Purpose-level default ranking across major borrowing intents.",
    determines: "Purpose-specific overlays can improve pricing/review policy.",
    charts: ["06_borrower_profile_default.png"],
  },
  {
    id: "Q8",
    domain: "C",
    title: "Q8. Same grade, different state outcomes?",
    answer:
      "Yes. Same grade loans perform differently by state, including high-spread combinations.",
    shows:
      "State-level map, top/bottom state ranking, and state×grade heatmap.",
    determines:
      "Location risk overlay is necessary for consistent risk calibration.",
    charts: [
      "08_default_rate_by_state_map.png",
      "09_top_bottom_states.png",
      "23_state_grade_default_heatmap.png",
    ],
  },
  {
    id: "Q9",
    domain: "C",
    title: "Q9. Regional risk clusters",
    answer: "Yes. Distinct regional clusters persist across the portfolio.",
    shows: "Geographic concentration of higher/lower default regions.",
    determines:
      "Regional concentration risk should be monitored as an early warning signal.",
    charts: ["08_default_rate_by_state_map.png"],
  },
  {
    id: "Q10",
    domain: "D",
    title: "Q10. Do joint applications default less?",
    answer:
      "No. In this dataset, joint applications default more than individual applications.",
    shows:
      "Side-by-side default rates and grade-split comparison for application types.",
    determines:
      "Application-type must be treated as a direct risk feature, not a neutral field.",
    charts: ["10_joint_vs_individual.png"],
  },
  {
    id: "Q11",
    domain: "D",
    title: "Q11. Joint financial strength vs outcome",
    answer:
      "Joint profiles here show lower median income, higher DTI, and higher default.",
    shows:
      "Income/DTI/default comparison with sample-size context by application type.",
    determines:
      "Joint status is not automatically protective and requires profile-aware treatment.",
    charts: [
      "24_joint_financials_comparison.png",
      "10_joint_vs_individual.png",
    ],
  },
  {
    id: "Q12",
    domain: "E",
    title: "Q12. Delinquency history as predictor",
    answer:
      "Yes. More delinquency history is associated with higher default probability.",
    shows:
      "Delinquency/default relationship and model importance for delinquency features.",
    determines:
      "Historical payment behavior remains a core underwriting signal.",
    charts: ["11_credit_utilization_patterns.png", "18_feature_importance.png"],
  },
  {
    id: "Q13",
    domain: "E",
    title: "Q13. Revolving utilization impact",
    answer:
      "Strong. Higher utilization is consistently linked with default outcomes.",
    shows: "Utilization distribution split by default status.",
    determines:
      "Current revolving stress is a high-priority intervention indicator.",
    charts: ["11_credit_utilization_patterns.png"],
  },
  {
    id: "Q14",
    domain: "E",
    title: "Q14. Account activity signals",
    answer:
      "Yes. Inquiries and account-activity features provide meaningful stress signals.",
    shows: "Inquiry/open-account behavior vs default outcomes.",
    determines:
      "Recent credit-seeking behavior should remain in active review policy.",
    charts: ["11_credit_utilization_patterns.png"],
  },
  {
    id: "Q15",
    domain: "F",
    title: "Q15. Loan status distribution",
    answer:
      "Portfolio includes large active-current share and distinct terminal outcomes.",
    shows: "Portfolio-level status composition across all major loan states.",
    determines:
      "Operationally stable surface metrics can mask deeper segment-level drift.",
    charts: ["01_loan_status_distribution.png"],
  },
  {
    id: "Q16",
    domain: "F",
    title: "Q16. Recovery analysis",
    answer:
      "Recovery behavior varies with risk grade and distressed-loan characteristics.",
    shows: "Average recovery by grade with hardship context.",
    determines:
      "Collections strategy should remain grade-aware and distress-stage aware.",
    charts: ["14_recovery_hardship.png"],
  },
  {
    id: "Q17",
    domain: "F",
    title: "Q17. Hardship and settlement patterns",
    answer:
      "Hardship/settlement flags are strongly associated with default in the terminal-status view.",
    shows:
      "Flag distribution and cross-tabbed default outcomes by hardship/settlement.",
    determines:
      "Distress-program flags are strong late-stage risk markers for intervention workflows.",
    charts: [
      "25_hardship_settlement_vs_default.png",
      "14_recovery_hardship.png",
    ],
  },
  {
    id: "F1",
    domain: "FINAL",
    title: "F1. Is grade still a reliable risk signal?",
    answer:
      "Directionally yes, fully sufficient no. Grade should stay primary, with model overlay.",
    shows:
      "Monotonic grade default behavior and grade-level calibration residuals.",
    determines:
      "Hybrid policy (grade + probability) is currently the strongest practical approach.",
    charts: ["02_default_rate_by_grade.png", "20_grade_calibration.png"],
  },
  {
    id: "F2",
    domain: "FINAL",
    title: "F2. Has grade calibration drifted over time?",
    answer:
      "Yes, with persistent evidence in grade-time and drift summary outputs.",
    shows:
      "Temporal drift curve and drift evidence table exported by modeling pipeline.",
    determines:
      "Quarterly recalibration policy is justified now, not just future-proofing.",
    charts: ["05_grade_drift_over_time.png"],
  },
  {
    id: "F3",
    domain: "FINAL",
    title: "F3. Are segments mispriced?",
    answer: "Yes, particularly within-grade interest quartiles.",
    shows: "Risk dispersion for rate quartiles inside each grade bucket.",
    determines: "Pricing policy requires within-grade refinement.",
    charts: ["21_mispricing_grade_rate_quartile.png"],
  },
  {
    id: "F4",
    domain: "FINAL",
    title: "F4. Hidden instability via geography/application type?",
    answer: "Yes, both dimensions exhibit substantial spread.",
    shows: "State-level map/heatmap plus application-type differentials.",
    determines:
      "Use governance overlays for region and application type in production monitoring.",
    charts: [
      "08_default_rate_by_state_map.png",
      "23_state_grade_default_heatmap.png",
      "24_joint_financials_comparison.png",
    ],
  },
  {
    id: "F5",
    domain: "FINAL",
    title: "F5. Stable or gradually drifting marketplace?",
    answer:
      "Operationally stable on surface metrics, but gradually drifting underneath.",
    shows:
      "Combined signal from drift, calibration, and segment-level divergence.",
    determines:
      "Current condition supports controlled deployment with active drift governance.",
    charts: ["05_grade_drift_over_time.png", "20_grade_calibration.png"],
  },
];

function ChartPreview({ chartUrl, title, onOpen }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full text-left rounded-lg overflow-hidden border border-slate-800 bg-slate-950/60 hover:border-cyan-500/60 transition-colors"
    >
      <img
        src={chartUrl}
        alt={title}
        className="w-full h-64 object-contain bg-slate-950"
      />
      <div className="px-3 py-2 text-xs text-slate-400">
        Click to open larger view
      </div>
    </button>
  );
}

function Lightbox({ isOpen, imageUrl, title, onClose }) {
  const containerRef = useRef(null);
  const dragRef = useRef({ startX: 0, startY: 0, originX: 0, originY: 0 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setPan({ x: 0, y: 0 });
      setIsDragging(false);
    }
  }, [isOpen, imageUrl]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentContainerFullscreen =
        document.fullscreenElement &&
        containerRef.current &&
        (document.fullscreenElement === containerRef.current ||
          containerRef.current.contains(document.fullscreenElement));
      setIsFullscreen(Boolean(isCurrentContainerFullscreen));
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const zoomIn = () => setZoom((prev) => clamp(prev + 0.2, 1, 4));
  const zoomOut = () => {
    setZoom((prev) => {
      const next = clamp(prev - 0.2, 1, 4);
      if (next === 1) setPan({ x: 0, y: 0 });
      return next;
    });
  };
  const resetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const onWheelZoom = (event) => {
    event.preventDefault();
    const delta = event.deltaY < 0 ? 0.12 : -0.12;
    setZoom((prev) => {
      const next = clamp(prev + delta, 1, 4);
      if (next === 1) setPan({ x: 0, y: 0 });
      return next;
    });
  };

  const onDragStart = (event) => {
    if (zoom <= 1) return;
    setIsDragging(true);
    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      originX: pan.x,
      originY: pan.y,
    };
  };

  const onDragMove = (event) => {
    if (!isDragging) return;
    const dx = event.clientX - dragRef.current.startX;
    const dy = event.clientY - dragRef.current.startY;
    setPan({
      x: dragRef.current.originX + dx,
      y: dragRef.current.originY + dy,
    });
  };

  const onDragEnd = () => {
    if (isDragging) {
      setIsDragging(false);
    }
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  };

  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/90 flex items-center justify-center p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={containerRef}
        className="w-full max-w-6xl rounded-xl border border-slate-700 bg-slate-900 p-3"
        onClick={(event) => event.stopPropagation()}
        role="presentation"
      >
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm md:text-base font-semibold text-slate-100">
            {title}
          </h4>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={zoomOut}
              className="rounded-md bg-slate-800 px-3 py-1 text-sm hover:bg-slate-700"
            >
              -
            </button>
            <button
              type="button"
              onClick={resetZoom}
              className="rounded-md bg-slate-800 px-3 py-1 text-sm hover:bg-slate-700"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              type="button"
              onClick={zoomIn}
              className="rounded-md bg-slate-800 px-3 py-1 text-sm hover:bg-slate-700"
            >
              +
            </button>
            <button
              type="button"
              onClick={toggleFullscreen}
              className="rounded-md bg-slate-800 px-3 py-1 text-sm hover:bg-slate-700"
            >
              {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md bg-slate-800 px-3 py-1 text-sm hover:bg-slate-700"
            >
              Close
            </button>
          </div>
        </div>
        <div className="text-xs text-slate-400 mb-2">
          Scroll wheel to zoom (100%–400%) and drag to pan while zoomed.
        </div>
        <div
          className={`h-[78vh] w-full overflow-hidden rounded bg-slate-950 flex items-center justify-center ${
            zoom > 1
              ? isDragging
                ? "cursor-grabbing"
                : "cursor-grab"
              : "cursor-default"
          }`}
          onWheel={onWheelZoom}
          onMouseDown={onDragStart}
          onMouseMove={onDragMove}
          onMouseUp={onDragEnd}
          onMouseLeave={onDragEnd}
        >
          <img
            src={imageUrl}
            alt={title}
            className="max-h-full max-w-full h-auto w-auto object-contain rounded transition-transform duration-100 select-none"
            draggable={false}
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: "center center",
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default function AnalysisPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartMap, setChartMap] = useState({});
  const [activeDomain, setActiveDomain] = useState("ALL");
  const [search, setSearch] = useState("");
  const [selectedCharts, setSelectedCharts] = useState({});
  const [lightbox, setLightbox] = useState({ open: false, url: "", title: "" });

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get("/api/charts");
        const map = {};
        response.data.forEach((item) => {
          map[item.filename] = item.url;
        });
        setChartMap(map);
      } catch (err) {
        setError(err.message || "Failed to load charts");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredCards = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return questionCards.filter((card) => {
      const domainOk = activeDomain === "ALL" || card.domain === activeDomain;
      if (!domainOk) return false;
      if (!needle) return true;
      return (
        card.title.toLowerCase().includes(needle) ||
        card.answer.toLowerCase().includes(needle) ||
        card.shows.toLowerCase().includes(needle) ||
        card.determines.toLowerCase().includes(needle)
      );
    });
  }, [activeDomain, search]);

  const coverageCount = useMemo(() => {
    const core = questionCards.filter((x) => x.id.startsWith("Q")).length;
    const final = questionCards.filter((x) => x.id.startsWith("F")).length;
    return { core, final, total: core + final };
  }, []);

  if (loading) {
    return (
      <p className="text-slate-300">Loading complete analysis coverage...</p>
    );
  }

  if (error) {
    return (
      <p className="text-rose-400">Error loading analysis charts: {error}</p>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
        <h2 className="text-lg font-semibold mb-2">
          Complete Question Coverage — Interactive Analysis
        </h2>
        <p className="text-sm text-slate-300 mb-3">
          This view answers every required question with chart evidence. Each
          chart section includes what it shows and what it determines about
          current portfolio behavior.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div className="rounded-lg bg-slate-950/70 p-3 border border-slate-800">
            <p className="text-slate-400">Core Questions Covered</p>
            <p className="text-xl font-semibold">{coverageCount.core} / 17</p>
          </div>
          <div className="rounded-lg bg-slate-950/70 p-3 border border-slate-800">
            <p className="text-slate-400">Final Conclusions Covered</p>
            <p className="text-xl font-semibold">{coverageCount.final} / 5</p>
          </div>
          <div className="rounded-lg bg-slate-950/70 p-3 border border-slate-800">
            <p className="text-slate-400">Total Coverage Cards</p>
            <p className="text-xl font-semibold">{coverageCount.total}</p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 space-y-2">
        <h2 className="text-lg font-semibold">Problem Given in PDF</h2>
        <p className="text-sm text-slate-300">
          Are borrower characteristics, assigned grades, interest rates, and
          final outcomes still consistently aligned — or is the lending system
          gradually drifting beneath surface stability?
        </p>
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 space-y-2">
        <h2 className="text-lg font-semibold">What and How We Solved It</h2>
        <ol className="list-decimal list-inside text-sm text-slate-300 space-y-1">
          <li>
            Merged and cleaned all provided datasets, then built terminal-status
            modeling target.
          </li>
          <li>
            Answered every domain question with EDA evidence: grade, debt,
            geography, application type, and behavior.
          </li>
          <li>
            Trained 7 ML models and validated discrimination, calibration, and
            threshold tradeoffs.
          </li>
          <li>
            Exported artifacts + evidence tables and connected them to dashboard
            APIs for governance monitoring.
          </li>
        </ol>
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 space-y-2">
        <h2 className="text-lg font-semibold">Conclusion of Analysis</h2>
        <p className="text-sm text-slate-300">
          The system is operationally stable at high level, but evidence shows
          gradual drift in calibration, geographic spread, and segment behavior.
        </p>
        <p className="text-sm text-slate-300">
          Best current strategy: keep grade as base policy, add probability
          overlay, and run quarterly recalibration with state/application
          governance controls.
        </p>
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search question, insight, or determination..."
            className="w-full lg:w-96 rounded-md bg-slate-800 px-3 py-2 text-sm"
          />
          <div className="flex flex-wrap gap-2">
            {domains.map((domain) => (
              <button
                key={domain.key}
                type="button"
                onClick={() => setActiveDomain(domain.key)}
                className={`px-3 py-1.5 rounded-md text-sm border ${
                  activeDomain === domain.key
                    ? "bg-cyan-500/20 border-cyan-500 text-cyan-200"
                    : "bg-slate-900 border-slate-700 text-slate-300"
                }`}
              >
                {domain.label}
              </button>
            ))}
          </div>
        </div>
        <p className="text-xs text-slate-400">
          Showing {filteredCards.length} question cards. Charts are interactive
          via hover details, chart selection, and click-to-expand.
        </p>
      </section>

      <section className="space-y-4">
        {filteredCards.map((card) => {
          const chartIndex = selectedCharts[card.id] || 0;
          const activeChart = card.charts[chartIndex];
          const chartUrl = chartMap[activeChart];

          return (
            <article
              key={card.id}
              className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 space-y-4"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
                <h3 className="text-base font-semibold">{card.title}</h3>
                {card.charts.length > 1 && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-slate-400">Chart</span>
                    <select
                      value={chartIndex}
                      onChange={(event) =>
                        setSelectedCharts((prev) => ({
                          ...prev,
                          [card.id]: Number(event.target.value),
                        }))
                      }
                      className="rounded-md bg-slate-800 px-2 py-1 border border-slate-700"
                    >
                      {card.charts.map((filename, idx) => (
                        <option key={filename} value={idx}>
                          {filename}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <div>
                  {chartUrl ? (
                    <ChartPreview
                      chartUrl={chartUrl}
                      title={`${card.id} — ${activeChart}`}
                      onOpen={() =>
                        setLightbox({
                          open: true,
                          url: chartUrl,
                          title: `${card.title} | ${activeChart}`,
                        })
                      }
                    />
                  ) : (
                    <div className="rounded-lg border border-amber-600/40 bg-amber-900/20 p-4 text-sm text-amber-300">
                      Chart file not found in API catalog: {activeChart}
                    </div>
                  )}
                </div>

                <div className="space-y-3 text-sm">
                  <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3">
                    <p className="text-slate-400 mb-1">Answer</p>
                    <p className="text-slate-100">{card.answer}</p>
                  </div>
                  <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3">
                    <p className="text-slate-400 mb-1">What it shows</p>
                    <p className="text-slate-100">{card.shows}</p>
                  </div>
                  <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3">
                    <p className="text-slate-400 mb-1">
                      What it determines now
                    </p>
                    <p className="text-cyan-200">{card.determines}</p>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      <Lightbox
        isOpen={lightbox.open}
        imageUrl={lightbox.url}
        title={lightbox.title}
        onClose={() => setLightbox({ open: false, url: "", title: "" })}
      />
    </motion.div>
  );
}
