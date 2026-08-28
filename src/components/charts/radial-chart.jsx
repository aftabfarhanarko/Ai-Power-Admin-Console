import React, { useMemo } from "react";
import Chart from "react-apexcharts";

/**
 * RadialChartComponent
 *
 * Renders a modern semi-circular radial bar chart using ApexCharts.
 * Used for order status (e.g., Paid vs Unpaid).
 *
 * Props:
 * @param {Array} chartData - Array with one object (e.g., [{ paid: 70, unpaid: 30 }])
 * @param {Object} chartConfig - Configuration for colors and labels (paid, unpaid)
 * @param {string} total - Display value in center (e.g., "70%")
 * @param {string} name - Label below total (e.g., "Paid Orders")
 */
export default function RadialChartComponent({
  chartData,
  chartConfig,
  total = "0%",
  name = "Total Amount",
  className = "",
}) {
  const isDark =
    typeof document !== "undefined" &&
    document.documentElement?.classList?.contains("dark");
  const first = chartData?.[0] ?? { paid: 0, unpaid: 0 };
  const paid = Number(first.paid) || 0;
  const unpaid = Number(first.unpaid) || 0;

  const paidColor =
    chartConfig?.paid?.color || (isDark ? "#10b981" : "#059669");
  const unpaidColor =
    chartConfig?.unpaid?.color || (isDark ? "#f59e0b" : "#d97706");

  const series = useMemo(() => [paid, unpaid], [paid, unpaid]);
  const labels = useMemo(
    () => [
      chartConfig?.paid?.label || "Paid",
      chartConfig?.unpaid?.label || "Unpaid",
    ],
    [chartConfig],
  );

  const options = useMemo(
    () => ({
      chart: {
        type: "radialBar",
        fontFamily: "inherit",
        animations: {
          enabled: true,
          easing: "easeinout",
          speed: 800,
        },
      },
      plotOptions: {
        radialBar: {
          startAngle: -135,
          endAngle: 135,
          hollow: {
            size: "55%",
            margin: 0,
          },
          track: {
            background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
            strokeWidth: "100%",
            margin: 0,
          },
          dataLabels: {
            show: true,
            name: {
              show: true,
              fontSize: "12px",
              color: isDark ? "#94a3b8" : "#64748b",
              offsetY: -4,
            },
            value: {
              show: true,
              fontSize: "14px",
              fontWeight: 600,
              color: isDark ? "#f1f5f9" : "#0f172a",
              offsetY: 2,
              formatter: (val) => (val != null ? `${val}%` : ""),
            },
            total: {
              show: true,
              label: name,
              fontSize: "14px",
              fontWeight: 700,
              color: isDark ? "#f1f5f9" : "#0f172a",
              formatter: () => total,
            },
          },
        },
      },
      colors: [paidColor, unpaidColor],
      labels,
      legend: {
        show: true,
        position: "bottom",
        fontSize: "12px",
        labels: {
          colors: isDark ? "#94a3b8" : "#64748b",
        },
      },
      stroke: {
        lineCap: "round",
      },
    }),
    [labels, paidColor, unpaidColor, name, total, isDark],
  );

  return (
    <div className={`mx-auto aspect-square w-full max-w-[320px] ${className}`}>
      <Chart
        options={options}
        series={series}
        type="radialBar"
        height="100%"
        width="100%"
      />
    </div>
  );
}
