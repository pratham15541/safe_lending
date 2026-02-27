import { useEffect, useMemo, useRef } from "react";
import * as d3 from "d3";

export default function D3StateApplicationChart({ data }) {
  const ref = useRef(null);

  const topRows = useMemo(() => (data || []).slice(0, 12), [data]);

  useEffect(() => {
    if (!topRows.length) return;
    const width = 760;
    const height = 360;
    const margin = { top: 20, right: 24, bottom: 100, left: 56 };

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    const tooltip = d3
      .select(ref.current.parentElement)
      .selectAll(".tooltip-state-application")
      .data([null])
      .join("div")
      .attr("class", "tooltip-state-application")
      .style("position", "absolute")
      .style("pointer-events", "none")
      .style("opacity", 0)
      .style("background", "rgba(15,23,42,0.95)")
      .style("color", "#e2e8f0")
      .style("border", "1px solid #334155")
      .style("border-radius", "8px")
      .style("padding", "8px 10px")
      .style("font-size", "12px");

    const labels = topRows.map((d) => `${d.state}-${d.application_type}`);
    const x = d3
      .scaleBand()
      .domain(labels)
      .range([margin.left, width - margin.right])
      .padding(0.18);
    const y = d3
      .scaleLinear()
      .domain([0, d3.max(topRows, (d) => d.default_rate) * 1.15])
      .nice()
      .range([height - margin.bottom, margin.top]);

    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x))
      .call((g) =>
        g
          .selectAll("text")
          .attr("fill", "#cbd5e1")
          .attr("font-size", 10)
          .attr("transform", "rotate(-30)")
          .style("text-anchor", "end"),
      )
      .call((g) => g.selectAll("path,line").attr("stroke", "#334155"));

    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).tickFormat(d3.format(".0%")))
      .call((g) => g.selectAll("text").attr("fill", "#cbd5e1"))
      .call((g) => g.selectAll("path,line").attr("stroke", "#334155"));

    svg
      .append("g")
      .selectAll("rect")
      .data(topRows)
      .join("rect")
      .attr("x", (d) => x(`${d.state}-${d.application_type}`))
      .attr("width", x.bandwidth())
      .attr("y", (d) => y(d.default_rate))
      .attr("height", (d) => y(0) - y(d.default_rate))
      .attr("fill", "#a78bfa")
      .on("mousemove", function (event, d) {
        d3.select(this).attr("fill", "#c4b5fd");
        tooltip
          .style("opacity", 1)
          .style("left", `${event.offsetX + 16}px`)
          .style("top", `${event.offsetY - 10}px`)
          .html(
            `<strong>${d.state} — ${d.application_type}</strong><br/>Default: ${(d.default_rate * 100).toFixed(2)}%<br/>Loans: ${d3.format(",")(d.count)}`,
          );
      })
      .on("mouseleave", function () {
        d3.select(this).attr("fill", "#a78bfa");
        tooltip.style("opacity", 0);
      });
  }, [topRows]);

  return (
    <div className="relative">
      <svg ref={ref} className="w-full h-96" />
    </div>
  );
}
