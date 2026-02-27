import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { motion } from "framer-motion";

export default function D3GradeDefaultChart({ data }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!data?.length) return;

    const width = 700;
    const height = 320;
    const margin = { top: 20, right: 20, bottom: 40, left: 56 };

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    const tooltip = d3
      .select(ref.current.parentElement)
      .selectAll(".tooltip-grade-default")
      .data([null])
      .join("div")
      .attr("class", "tooltip-grade-default")
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
      .scaleBand()
      .domain(data.map((d) => d.grade))
      .range([margin.left, width - margin.right])
      .padding(0.2);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.default_rate) * 1.15])
      .nice()
      .range([height - margin.bottom, margin.top]);

    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x))
      .call((g) => g.selectAll("text").attr("fill", "#cbd5e1"))
      .call((g) => g.selectAll("path,line").attr("stroke", "#334155"));

    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).tickFormat(d3.format(".0%")))
      .call((g) => g.selectAll("text").attr("fill", "#cbd5e1"))
      .call((g) => g.selectAll("path,line").attr("stroke", "#334155"));

    const bars = svg
      .append("g")
      .selectAll("rect")
      .data(data)
      .join("rect")
      .attr("x", (d) => x(d.grade))
      .attr("width", x.bandwidth())
      .attr("y", y(0))
      .attr("height", 0)
      .attr("fill", "#0ea5e9")
      .on("mousemove", function (event, d) {
        d3.select(this).attr("fill", "#38bdf8");
        tooltip
          .style("opacity", 1)
          .style("left", `${event.offsetX + 16}px`)
          .style("top", `${event.offsetY - 10}px`)
          .html(
            `<strong>Grade ${d.grade}</strong><br/>Default: ${(d.default_rate * 100).toFixed(2)}%<br/>Loans: ${d3.format(",")(d.count)}`,
          );
      })
      .on("mouseleave", function () {
        d3.select(this).attr("fill", "#0ea5e9");
        tooltip.style("opacity", 0);
      });

    bars
      .transition()
      .duration(700)
      .attr("y", (d) => y(d.default_rate))
      .attr("height", (d) => y(0) - y(d.default_rate));

    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height - 4)
      .attr("fill", "#94a3b8")
      .attr("font-size", 12)
      .attr("text-anchor", "middle")
      .text("Grade");

    svg
      .append("text")
      .attr("x", -height / 2)
      .attr("y", 14)
      .attr("fill", "#94a3b8")
      .attr("font-size", 12)
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .text("Default Rate");
  }, [data]);

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
