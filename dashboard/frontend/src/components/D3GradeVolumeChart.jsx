import { useEffect, useRef } from "react";
import * as d3 from "d3";

export default function D3GradeVolumeChart({ data }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!data?.length) return;

    const width = 720;
    const height = 330;
    const margin = { top: 20, right: 20, bottom: 46, left: 70 };

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    const tooltip = d3
      .select(ref.current.parentElement)
      .selectAll(".tooltip-grade-volume")
      .data([null])
      .join("div")
      .attr("class", "tooltip-grade-volume")
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
      .padding(0.22);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.count) * 1.12])
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
      .call(d3.axisLeft(y).ticks(6).tickFormat(d3.format("~s")))
      .call((g) => g.selectAll("text").attr("fill", "#cbd5e1"))
      .call((g) => g.selectAll("path,line").attr("stroke", "#334155"));

    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height - 6)
      .attr("fill", "#94a3b8")
      .attr("font-size", 12)
      .attr("text-anchor", "middle")
      .text("Grade");

    svg
      .append("text")
      .attr("x", -height / 2)
      .attr("y", 18)
      .attr("fill", "#94a3b8")
      .attr("font-size", 12)
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .text("Loan Count");

    const bars = svg
      .append("g")
      .selectAll("rect")
      .data(data)
      .join("rect")
      .attr("x", (d) => x(d.grade))
      .attr("y", y(0))
      .attr("width", x.bandwidth())
      .attr("height", 0)
      .attr("rx", 5)
      .attr("fill", "#14b8a6")
      .on("mousemove", function (event, d) {
        d3.select(this).attr("fill", "#2dd4bf");
        tooltip
          .style("opacity", 1)
          .style("left", `${event.offsetX + 16}px`)
          .style("top", `${event.offsetY - 10}px`)
          .html(
            `<strong>Grade ${d.grade}</strong><br/>Loans: ${d3.format(",")(d.count)}<br/>Default: ${(d.default_rate * 100).toFixed(2)}%<br/>Avg Rate: ${d.avg_interest_rate.toFixed(2)}%`,
          );
      })
      .on("mouseleave", function () {
        d3.select(this).attr("fill", "#14b8a6");
        tooltip.style("opacity", 0);
      });

    bars
      .transition()
      .duration(650)
      .attr("y", (d) => y(d.count))
      .attr("height", (d) => y(0) - y(d.count));
  }, [data]);

  return (
    <div className="relative">
      <svg ref={ref} className="w-full h-80" />
    </div>
  );
}
