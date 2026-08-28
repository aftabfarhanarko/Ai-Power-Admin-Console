import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useGetStatisticsQuery } from "@/features/dashboard/dashboardApiSlice";
import StatisticsChart from "./components/StatisticsChart";
import LiveStatisticsMap from "./components/LiveStatisticsMap";
import TopCustomersTable from "./components/TopCustomersTable";

/**
 * StatisticsPage Component
 * Redesigned to match the "Finexa" reference dashboard.
 */
export default function StatisticsPage() {
  const { t } = useTranslation();
  const authUser = useSelector((s) => s?.auth?.user);
  const { data: statsData } = useGetStatisticsQuery(
    { companyId: authUser?.companyId },
    { skip: !authUser?.companyId }
  );

  // Map day names from API to translated names
  const dayNameMap = {
    'Sun': t("statistics.sun"),
    'Mon': t("statistics.mon"),
    'Tue': t("statistics.tue"),
    'Wed': t("statistics.wed"),
    'Thu': t("statistics.thu"),
    'Fri': t("statistics.fri"),
    'Sat': t("statistics.sat"),
  };

  // Chart Data from API (day names translated)
  const chartData = useMemo(
    () => {
      if (!statsData?.chartData) {
        // Fallback to default data if API data not available
        return [
          { name: t("statistics.mon"), earning: 0, sells: 0, visit: 0 },
          { name: t("statistics.tue"), earning: 0, sells: 0, visit: 0 },
          { name: t("statistics.wed"), earning: 0, sells: 0, visit: 0 },
          { name: t("statistics.thu"), earning: 0, sells: 0, visit: 0 },
          { name: t("statistics.fri"), earning: 0, sells: 0, visit: 0 },
          { name: t("statistics.sat"), earning: 0, sells: 0, visit: 0 },
          { name: t("statistics.sun"), earning: 0, sells: 0, visit: 0 },
        ];
      }
      return statsData.chartData.map((item) => ({
        ...item,
        name: dayNameMap[item.name] || item.name,
      }));
    },
    [statsData?.chartData, t]
  );

  // Country Stats from API (translated)
  const countryStats = useMemo(
    () => {
      if (!statsData?.countryStats) {
        return [
          { country: t("statistics.canada"), users: "0", flag: "🇨🇦" },
          { country: t("statistics.japan"), users: "0", flag: "🇯🇵" },
          { country: t("statistics.usa"), users: "0", flag: "🇺🇸" },
          { country: t("statistics.newZealand"), users: "0", flag: "🇳🇿" },
          { country: t("statistics.india"), users: "0", flag: "🇮🇳" },
          { country: t("statistics.germany"), users: "0", flag: "🇩🇪" },
          { country: t("statistics.denmark"), users: "0", flag: "🇩🇰" },
        ];
      }
      const countryNameMap = {
        'Canada': t("statistics.canada"),
        'Japan': t("statistics.japan"),
        'USA': t("statistics.usa"),
        'New Zealand': t("statistics.newZealand"),
        'India': t("statistics.india"),
        'Germany': t("statistics.germany"),
        'Denmark': t("statistics.denmark"),
      };
      return statsData.countryStats.map((item) => ({
        ...item,
        country: countryNameMap[item.country] || item.country,
      }));
    },
    [statsData?.countryStats, t]
  );

  // Top Client Data from API (product name translated)
  const paymentData = useMemo(
    () => {
      if (!statsData?.paymentData) {
        return [
          {
            id: 1,
            name: "N/A",
            email: "N/A",
            contact: "N/A",
            product: t("statistics.paymentPage"),
            amount: "$ 0",
            avatar: "https://i.pravatar.cc/150?u=default",
          },
        ];
      }
      return statsData.paymentData.map((item) => ({
        ...item,
        product: item.product === 'Payment Page' ? t("statistics.paymentPage") : item.product,
      }));
    },
    [statsData?.paymentData, t]
  );

  // Map Connections (Simulated) - can be passed to LiveStatisticsMap
  const connections = [
    { x1: 20, y1: 30, x2: 45, y2: 35 }, // NA to Europe
    { x1: 45, y1: 35, x2: 75, y2: 40 }, // Europe to Asia
    { x1: 20, y1: 30, x2: 25, y2: 60 }, // NA to SA
    { x1: 45, y1: 35, x2: 50, y2: 65 }, // Europe to Africa
    { x1: 75, y1: 40, x2: 80, y2: 70 }, // Asia to Aus
  ];

  // Calculate total live users from country stats
  const totalLiveUsers = useMemo(() => {
    if (!countryStats || countryStats.length === 0) return 450000;
    return countryStats.reduce((sum, item) => {
      const users = parseFloat(String(item.users || "0").replace(/[^0-9.-]+/g, "")) || 0;
      return sum + users;
    }, 0);
  }, [countryStats]);

  return (
    <div className="p-4 md:p-8 dark:bg-[#0b0f14] min-h-screen font-sans text-[#1A1A1A] dark:text-white">
      {/* --- MIDDLE ROW: Charts & Map --- */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
        {/* Statistics Chart Component */}
        <StatisticsChart chartData={chartData} />

        {/* Live Statistics Map Component */}
        <LiveStatisticsMap
          countryStats={countryStats}
          totalLiveUsers={totalLiveUsers}
          connections={connections}
        />
      </div>

      {/* --- BOTTOM ROW: Top Customers --- */}
      <TopCustomersTable paymentData={paymentData} />
    </div>
  );
}
