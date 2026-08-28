import { useMemo } from "react";
import { formatNumber } from "@/utils/banglaFormatter";

const PRODUCTIVITY_COLORS = [
  "#4F46E5",
  "#818CF8",
  "#60A5FA",
  "#2DD4BF",
  "#FB923C",
];

/**
 * Hook that derives all AI report metrics and chart data from dashboard API.
 * Returns productivity data, gauge data, sparklines, metric values, and formatters.
 */
export function useAiReportMetrics(dashboardData, currentLang) {
  const formatTooltipValue = (value) => {
    if (typeof value === "number")
      return formatNumber(value, currentLang, {
        decimals: 1,
        showCommas: false,
      });
    return value;
  };

  const formatLabel = (label) => {
    if (typeof label === "number") return formatNumber(label, currentLang);
    return label;
  };

  return useMemo(() => {
    const dayLabels =
      currentLang === "bn"
        ? ["র", "স", "ম", "ব", "বৃ", "শু", "শ"]
        : ["S", "M", "T", "W", "T", "F", "S"];
    const lineChartData = dashboardData?.lineChartData || [];
    const radialChartData = dashboardData?.radialChartData || [];
    const stats = dashboardData?.stats || [];
    const overviewMetrics = dashboardData?.overviewMetrics || {};
    const recentOrders = dashboardData?.recentOrders || [];

    const totalOrdersCount = overviewMetrics.totalSales || recentOrders.length;
    const paidPercentage = radialChartData[0]?.paid || 0;
    const balanceScore = Math.round(paidPercentage);

    let completedOrders = 0;
    if (paidPercentage > 0 && totalOrdersCount > 0) {
      completedOrders = Math.round((paidPercentage / 100) * totalOrdersCount);
    } else {
      completedOrders = recentOrders.filter(
        (o) =>
          o.isPaid ||
          o.status === "paid" ||
          o.status === "delivered" ||
          o.status === "completed",
      ).length;
    }

    let activeOrders = 0;
    if (totalOrdersCount > 0 && completedOrders >= 0) {
      activeOrders = Math.max(0, totalOrdersCount - completedOrders);
    } else {
      activeOrders = recentOrders.filter(
        (o) =>
          o.status === "pending" ||
          o.status === "processing" ||
          (!o.isPaid &&
            o.status !== "delivered" &&
            o.status !== "cancelled" &&
            o.status !== "refunded"),
      ).length;
    }

    const productivityData =
      lineChartData.length > 0
        ? lineChartData.map((item, index) => {
            const value = item.totalPNL || item.totalOrders || 0;
            const maxValue = Math.max(
              ...lineChartData.map((d) => d.totalPNL || d.totalOrders || 0),
            );
            const normalizedValue =
              maxValue > 0 ? (value / maxValue) * 8 : 0;
            return {
              day: dayLabels[index % 7] || dayLabels[index] || "N",
              hours: normalizedValue,
              fill:
                normalizedValue > 0
                  ? PRODUCTIVITY_COLORS[index % PRODUCTIVITY_COLORS.length]
                  : "#E2E8F0",
            };
          })
        : dayLabels.map((day) => ({
            day,
            hours: 0,
            fill: "#E2E8F0",
          }));

    const totalSegments = 24;
    const filledSegments = Math.round((balanceScore / 100) * totalSegments);
    const gaugeData = Array.from({ length: totalSegments }, (_, i) => ({
      name: i < filledSegments ? "Filled" : "Empty",
      value: 1,
      fill: i < filledSegments ? "#84CC16" : "#E2E8F0",
    }));

    const sparklineData = lineChartData.map((d) => ({
      value: d.totalPNL || d.totalOrders || 0,
    }));
    const fallback = [{ value: 0 }];
    const sparklineData1 =
      sparklineData.length > 0 ? sparklineData : fallback;
    const sparklineData2 =
      sparklineData.length > 0 ? sparklineData : fallback;
    const sparklineData3 =
      sparklineData.length > 0 ? sparklineData : fallback;
    const sparklineData4 =
      sparklineData.length > 0 ? sparklineData : fallback;

    const activeOrdersChange = stats[0]?.delta || "0%";
    const activeOrdersIsPositive = stats[0]?.tone === "green";
    const completedOrdersChange = stats[1]?.delta || "0%";
    const completedOrdersIsPositive = stats[1]?.tone === "green";

    const totalRevenue = overviewMetrics.totalRevenue || 0;
    const focusHours = Math.round(totalRevenue / 100);
    const focusHoursChange = stats[0]?.delta || "0%";
    const focusHoursIsPositive = stats[0]?.tone === "green";

    const activityRate = balanceScore;
    const activityRateChange = stats[1]?.delta || "0%";
    const activityRateIsPositive = stats[1]?.tone === "green";

    const weeklyTotalHours = productivityData.reduce(
      (sum, item) => sum + (item.hours || 0),
      0,
    );
    const workHours = totalOrdersCount * 2;
    const personalTime = Math.max(0, 1245 - workHours);

    return {
      productivityData,
      productivityColors: PRODUCTIVITY_COLORS,
      weeklyTotalHours,
      gaugeData,
      balanceScore,
      workHours,
      personalTime,
      sparklineData1,
      sparklineData2,
      sparklineData3,
      sparklineData4,
      activeOrders,
      activeOrdersChange,
      activeOrdersIsPositive,
      completedOrders,
      completedOrdersChange,
      completedOrdersIsPositive,
      focusHours,
      focusHoursChange,
      focusHoursIsPositive,
      activityRate,
      activityRateChange,
      activityRateIsPositive,
      formatTooltipValue,
      formatLabel,
    };
  }, [dashboardData, currentLang]);
}
