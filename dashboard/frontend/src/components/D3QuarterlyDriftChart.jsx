import { useEffect, useMemo, useRef } from "react";
import * as d3 from "d3";
import { motion } from "framer-motion";

export default function D3QuarterlyDriftChart({ data }) {
  const ref = useRef(null);

  const series = useMemo(() => {
    if (!data?.length) return [];
    const grouped = d3.rollups(
      data,
      (v) => d3.mean(v, (d) => d.default_rate),
      (d) => d.quarter,
    );
    return grouped
      .map(([quarter, default_rate]) => ({ quarter, default_rate }))
      .sort((a, b) => a.quarter.localeCompare(b.quarter));
  }, [data]);

  useEffect(() => {
    if (!series.length) return;

    const width = 760;
    const height = 320;
    const margin = { top: 20, right: 20, bottom: 50, left: 56 };

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    const tooltip = d3
      .select(ref.current.parentElement)
      .selectAll(".tooltip-quarterly-drift")
      .data([null])
      .join("div")
      .attr("class", "tooltip-quarterly-drift")
      .style("position", "absolute")
      .style("pointer-events", "none")
      .style("opacity", 0)
      .style("background", "rgba(15,23,42,0.95)")
      .style("color", "#e2e8f0")
      .style("border", "1px solid #334155")
      .style("border-radius", "8px")
      .style("padding", "8px 10px")
      .style("font-size", "12px");

    const x = d3
      .scalePoint()
      .domain(series.map((d) => d.quarter))
      .range([margin.left, width - margin.right]);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(series, (d) => d.default_rate) * 1.2])
      .nice()
      .range([height - margin.bottom, margin.top]);

    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(
        d3.axisBottom(x).tickValues(x.domain().filter((_, i) => i % 2 === 0)),
      )
      .call((g) =>
        g.selectAll("text").attr("fill", "#cbd5e1").attr("font-size", 10),
      )
      .call((g) => g.selectAll("path,line").attr("stroke", "#334155"));

    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).tickFormat(d3.format(".0%")))
      .call((g) => g.selectAll("text").attr("fill", "#cbd5e1"))
      .call((g) => g.selectAll("path,line").attr("stroke", "#334155"));

    const line = d3
      .line()
      .x((d) => x(d.quarter))
      .y((d) => y(d.default_rate));

    svg
      .append("path")
      .datum(series)
      .attr("fill", "none")
      .attr("stroke", "#22d3ee")
      .attr("stroke-width", 2.5)
      .attr("d", line);

    svg
      .append("g")
      .selectAll("circle")
      .data(series)
      .join("circle")
      .attr("cx", (d) => x(d.quarter))
      .attr("cy", (d) => y(d.default_rate))
      .attr("r", 4)
      .attr("fill", "#38bdf8")
      .on("mousemove", function (event, d) {
        d3.select(this).attr("r", 6).attr("fill", "#67e8f9");
        tooltip
          .style("opacity", 1)
          .style("left", `${event.offsetX + 16}px`)
          .style("top", `${event.offsetY - 10}px`)
          .html(
            `<strong>${d.quarter}</strong><br/>Avg default: ${(d.default_rate * 100).toFixed(2)}%`,
          );
      })
      .on("mouseleave", function () {
        d3.select(this).attr("r", 4).attr("fill", "#38bdf8");
        tooltip.style("opacity", 0);
      });
  }, [series]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      <svg ref={ref} className="w-full h-80" />
    </motion.div>
  );
}
