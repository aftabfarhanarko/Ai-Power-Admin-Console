import React from "react";
import { useTranslation } from "react-i18next";
import { Briefcase, CheckSquare, Hourglass, TrendingUp } from "lucide-react";
import { formatNumber, formatPercentage } from "@/utils/banglaFormatter";
import MetricCard from "./MetricCard";

const MetricCardsSection = ({
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
  sparklineData1,
  sparklineData2,
  sparklineData3,
  sparklineData4,
  currentLang,
}) => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title={t("aiReport.activeOrders")}
        value={formatNumber(activeOrders, currentLang)}
        change={activeOrdersChange}
        isPositive={activeOrdersIsPositive}
        icon={Briefcase}
        color="blue"
        chartData={sparklineData1}
      />
      <MetricCard
        title={t("aiReport.completedOrders")}
        value={formatNumber(completedOrders, currentLang)}
        change={completedOrdersChange}
        isPositive={completedOrdersIsPositive}
        icon={CheckSquare}
        color="green"
        chartData={sparklineData2}
      />
      <MetricCard
        title={t("aiReport.focusHours")}
        value={`${formatNumber(focusHours, currentLang)}h`}
        change={focusHoursChange}
        isPositive={focusHoursIsPositive}
        icon={Hourglass}
        color="red"
        chartData={sparklineData3}
      />
      <MetricCard
        title={t("aiReport.activityRate")}
        value={formatPercentage(activityRate, currentLang)}
        change={activityRateChange}
        isPositive={activityRateIsPositive}
        icon={TrendingUp}
        color="purple"
        chartData={sparklineData4}
      />
    </div>
  );
};

export default MetricCardsSection;
