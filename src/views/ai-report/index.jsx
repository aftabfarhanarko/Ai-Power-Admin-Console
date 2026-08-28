import React from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import {
  useGetAiReportQuery,
  useGetDashboardQuery,
} from "@/features/dashboard/dashboardApiSlice";
import {
  HeaderSection,
  MetricCardsSection,
  ProductivityTrendsChart,
  WorkLifeBalanceGauge,
  AIInsightsSection,
} from "./components";
import { useReportText, useAiReportMetrics } from "./hooks";

const AiReportPage = () => {
  const { i18n } = useTranslation();
  const authUser = useSelector((state) => state.auth.user);
  const currentLang = i18n.language || "en";

  const { data, isLoading, isError } = useGetAiReportQuery(
    { companyId: authUser?.companyId },
    { skip: !authUser?.companyId },
  );

  const { data: dashboardData } = useGetDashboardQuery(
    { companyId: authUser?.companyId },
    { skip: !authUser?.companyId },
  );

  const reportText = useReportText(data, currentLang);
  const {
    displayText,
    paragraphs,
    hasReport,
    reportLang,
    isTranslating,
    isSpeaking,
    handleTranslate,
    handleSpeak,
    handleStopSpeak,
    handleDownloadReport,
  } = reportText;

  const metrics = useAiReportMetrics(dashboardData, currentLang);
  const {
    productivityData,
    productivityColors,
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
  } = metrics;

  return (
    <div className="space-y-6 min-h-screen bg-[#F8F9FC] dark:bg-black/10 p-4 lg:p-10 font-sans text-slate-900 dark:text-slate-100">
      <HeaderSection userName={authUser?.name} />

      <MetricCardsSection
        activeOrders={activeOrders}
        activeOrdersChange={activeOrdersChange}
        activeOrdersIsPositive={activeOrdersIsPositive}
        completedOrders={completedOrders}
        completedOrdersChange={completedOrdersChange}
        completedOrdersIsPositive={completedOrdersIsPositive}
        focusHours={focusHours}
        focusHoursChange={focusHoursChange}
        focusHoursIsPositive={focusHoursIsPositive}
        activityRate={activityRate}
        activityRateChange={activityRateChange}
        activityRateIsPositive={activityRateIsPositive}
        sparklineData1={sparklineData1}
        sparklineData2={sparklineData2}
        sparklineData3={sparklineData3}
        sparklineData4={sparklineData4}
        currentLang={currentLang}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ProductivityTrendsChart
          productivityData={productivityData}
          productivityColors={productivityColors}
          weeklyTotalHours={weeklyTotalHours}
          activityRateChange={activityRateChange}
          activityRateIsPositive={activityRateIsPositive}
          formatTooltipValue={formatTooltipValue}
          formatLabel={formatLabel}
          currentLang={currentLang}
        />

        <WorkLifeBalanceGauge
          gaugeData={gaugeData}
          balanceScore={balanceScore}
          workHours={workHours}
          workHoursChange={activeOrdersChange}
          workHoursIsPositive={activeOrdersIsPositive}
          personalTime={personalTime}
          personalTimeChange={completedOrdersChange}
          personalTimeIsPositive={completedOrdersIsPositive}
          currentLang={currentLang}
        />
      </div>

      <AIInsightsSection
        isLoading={isLoading}
        isError={isError}
        hasReport={hasReport}
        paragraphs={paragraphs}
        displayText={displayText}
        isTranslating={isTranslating}
        reportLang={reportLang}
        isSpeaking={isSpeaking}
        handleTranslate={handleTranslate}
        handleSpeak={handleSpeak}
        handleStopSpeak={handleStopSpeak}
        handleDownloadReport={handleDownloadReport}
      />
    </div>
  );
};

export default AiReportPage;
