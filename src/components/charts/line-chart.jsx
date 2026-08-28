import React, { useMemo } from "react";
import Chart from "react-apexcharts";
import moment from "moment";

/**
 * LineChartComponent
 *
 * Renders a modern area chart with smooth gradient fill using ApexCharts.
 * Used for visualizing trends over time (e.g., Income Growth).
 *
 * Props:
 * @param {Array} chartData - Array of data points (e.g., [{ month: '2024-01', totalPNL: 1000 }])
 * @param {Object} chartConfig - Configuration object for chart colors and labels
 */
export default function LineChartComponent({ chartData, chartConfig }) {
  const isDark = typeof document !== "undefined" && document.documentElement?.classList?.contains("dark");
  const primaryColor = chartConfig?.desktop?.color || (isDark ? "#8b5cf6" : "#7c3aed");

  const { series, categories } = useMemo(() => {
    const cats = (chartData || []).map((d) => moment(d.month).format("MMM"));
    const vals = (chartData || []).map((d) => d.totalPNL ?? 0);
    const label = chartConfig?.desktop?.label || "Income Growth";
    return {
      series: [{ name: label, data: vals }],
      categories: cats,
    };
  }, [chartData, chartConfig]);

  const options = useMemo(
    () => ({
      chart: {
        type: "area",
        toolbar: { show: false },
        zoom: { enabled: false },
        fontFamily: "inherit",
        animations: {
          enabled: true,
          easing: "easeinout",
          speed: 800,
        },
      },
      colors: [primaryColor],
      dataLabels: { enabled: false },
      stroke: {
        curve: "smooth",
        width: 2.5,
      },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.4,
          opacityTo: 0.05,
          stops: [0, 100],
        },
      },
      xaxis: {
        categories,
        labels: {
          style: {
            colors: isDark ? "#94a3b8" : "#64748b",
            fontSize: "12px",
          },
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: {
          style: {
            colors: isDark ? "#94a3b8" : "#64748b",
            fontSize: "12px",
          },
        },
      },
      grid: {
        borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
        strokeDashArray: 4,
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } },
      },
      tooltip: {
        theme: isDark ? "dark" : "light",
        x: { format: "MMM" },
        y: {
          formatter: (val) => (val != null ? val.toLocaleString() : ""),
        },
      },
    }),
    [categories, primaryColor, isDark]
  );

  if (!chartData?.length) {
    return (
      <div className="h-full w-full min-h-[280px] flex items-center justify-center text-muted-foreground text-sm">
        No data available
      </div>
    );
  }

  return (
    <div className="h-full w-full min-h-[280px]">
      <Chart
        options={options}
        series={series}
        type="area"
        height="100%"
        width="100%"
      />
    </div>
  );
}
