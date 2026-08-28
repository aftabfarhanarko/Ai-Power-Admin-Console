import React, { useMemo, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Eye, ShoppingBag, Package, DollarSign } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useGetDashboardQuery } from "@/features/dashboard/dashboardApiSlice";
import {
  MetricCard,
  DashboardHeader,
  SalesOverviewChart,
  SubscriberChart,
  SalesDistributionCard,
  IntegrationListCard,
  RecentCustomersCard,
  RecentProductsCard,
  RecentTransactionsCard,
} from "./components";

const DashboardPage = () => {
  const authUser = useSelector((state) => state.auth.user);
  const { t } = useTranslation();
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentDateTime.getHours();
    if (hour >= 5 && hour < 12) return t("dashboard.goodMorning");
    if (hour >= 12 && hour < 17) return t("dashboard.goodAfternoon");
    if (hour >= 17 && hour < 21) return t("dashboard.goodEvening");
    return t("dashboard.goodNight");
  };

  const { data: dashboardData, isLoading } = useGetDashboardQuery(
    { companyId: authUser?.companyId },
    { skip: !authUser?.companyId },
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [loginPage, setLoginPage] = useState(1);
  const [transactionPage, setTransactionPage] = useState(1);
  const [salesFilter, setSalesFilter] = useState("Monthly");
  const [subscriberFilter, setSubscriberFilter] = useState("Weekly");
  const [distributionFilter, setDistributionFilter] = useState("Monthly");
  const itemsPerPage = 5;

  const lineChartData = Array.isArray(dashboardData?.lineChartData)
    ? dashboardData.lineChartData
    : [];
  const sparklineData = lineChartData.map((d) => ({ value: d.totalPNL }));

  const filteredSalesData = useMemo(() => {
    const apiData = dashboardData?.salesOverview?.[salesFilter?.toLowerCase()];
    return (Array.isArray(apiData) ? apiData : []).map((d) => ({
      name: d.name,
      Revenue: d.totalPNL,
    }));
  }, [salesFilter, dashboardData?.salesOverview]);

  const currentSubscriberData = useMemo(() => {
    const apiData =
      dashboardData?.subscriberChart?.[subscriberFilter?.toLowerCase()];
    return Array.isArray(apiData) ? apiData : [];
  }, [subscriberFilter, dashboardData?.subscriberChart]);

  const currentDistributionData = useMemo(() => {
    return Array.isArray(dashboardData?.salesDistribution)
      ? dashboardData.salesDistribution
      : [];
  }, [dashboardData?.salesDistribution]);

  const integrationList = Array.isArray(dashboardData?.integrations)
    ? dashboardData.integrations
    : [];

  const recentLogins = useMemo(() => {
    const apiData = dashboardData?.recentCustomers;
    return (Array.isArray(apiData) ? apiData : []).map((c, i) => ({
      id: c.id || i + 1,
      user: c.user,
      ip: c.ip,
      time: c.time,
    }));
  }, [dashboardData?.recentCustomers]);

  const recentProducts = useMemo(() => {
    return Array.isArray(dashboardData?.recentProducts)
      ? dashboardData.recentProducts
      : [];
  }, [dashboardData?.recentProducts]);

  const recentTransactions = useMemo(() => {
    return Array.isArray(dashboardData?.recentTransactions)
      ? dashboardData.recentTransactions
      : [];
  }, [dashboardData?.recentTransactions]);

  const totalPages = Math.ceil(recentProducts.length / itemsPerPage);
  const totalLoginPages = Math.ceil(recentLogins.length / itemsPerPage);
  const totalTransactionPages = Math.ceil(
    recentTransactions.length / itemsPerPage,
  );

  const totalRevenue =
    dashboardData?.overviewMetrics?.totalRevenue != null
      ? Number(dashboardData.overviewMetrics.totalRevenue).toLocaleString(
          "en-US",
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          },
        )
      : "0.00";

  return (
    <div
      className="p-4 md:p-6 space-y-6 bg-gray-50/50 dark:bg-black/20 min-h-screen"
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      }}
    >
      <DashboardHeader
        currentDateTime={currentDateTime}
        getGreeting={getGreeting}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title={t("dashboard.totalProducts")}
          value={
            dashboardData?.overviewMetrics?.totalProducts?.toLocaleString() ??
            "0"
          }
          change={dashboardData?.stats?.[0]?.delta ?? "0%"}
          changeType={
            dashboardData?.stats?.[0]?.tone === "green"
              ? "increase"
              : "decrease"
          }
          icon={Package}
          iconBgColor="bg-blue-100 dark:bg-blue-500/10"
          iconColor="text-blue-600 dark:text-blue-400"
          sparklineData={sparklineData}
        />
        <MetricCard
          title={t("dashboard.totalSales")}
          value={
            dashboardData?.overviewMetrics?.totalSales?.toLocaleString() ?? "0"
          }
          change={dashboardData?.stats?.[1]?.delta ?? "0%"}
          changeType={
            dashboardData?.stats?.[1]?.tone === "green"
              ? "increase"
              : "decrease"
          }
          icon={ShoppingBag}
          iconBgColor="bg-emerald-100 dark:bg-emerald-500/10"
          iconColor="text-emerald-600 dark:text-emerald-400"
          sparklineData={sparklineData}
        />
        <MetricCard
          title={t("dashboard.totalRevenue")}
          value={
            dashboardData?.overviewMetrics?.totalRevenue != null
              ? `$${Number(
                  dashboardData.overviewMetrics.totalRevenue,
                ).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`
              : "$0.00"
          }
          change={dashboardData?.stats?.[0]?.delta ?? "0%"}
          changeType={
            dashboardData?.stats?.[0]?.tone === "green"
              ? "increase"
              : "decrease"
          }
          icon={DollarSign}
          iconBgColor="bg-rose-100 dark:bg-rose-500/10"
          iconColor="text-rose-600 dark:text-rose-400"
          sparklineData={sparklineData}
        />
        <MetricCard
          title={t("dashboard.totalCustomers")}
          value={
            dashboardData?.overviewMetrics?.totalStoreViews?.toLocaleString() ??
            "0"
          }
          change={dashboardData?.stats?.[1]?.delta ?? "0%"}
          changeType={
            dashboardData?.stats?.[1]?.tone === "green"
              ? "increase"
              : "decrease"
          }
          icon={Eye}
          iconBgColor="bg-purple-100 dark:bg-purple-500/10"
          iconColor="text-purple-600 dark:text-purple-400"
          sparklineData={sparklineData}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SalesOverviewChart
          data={filteredSalesData}
          filter={salesFilter}
          onFilterChange={setSalesFilter}
          totalRevenue={totalRevenue}
          delta={dashboardData?.stats?.[0]?.delta ?? "0%"}
        />
        <SubscriberChart
          data={currentSubscriberData}
          filter={subscriberFilter}
          onFilterChange={setSubscriberFilter}
          totalCustomers={
            dashboardData?.overviewMetrics?.totalStoreViews?.toLocaleString() ??
            "0"
          }
          delta={dashboardData?.stats?.[1]?.delta ?? "0%"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SalesDistributionCard
          data={currentDistributionData}
          filter={distributionFilter}
          onFilterChange={setDistributionFilter}
        />
        <IntegrationListCard data={integrationList} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentCustomersCard
          data={recentLogins}
          currentPage={loginPage}
          totalPages={totalLoginPages}
          itemsPerPage={itemsPerPage}
          onPageChange={setLoginPage}
          isLoading={isLoading}
        />
        <RecentProductsCard
          data={recentProducts}
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          isLoading={isLoading}
        />
        <RecentTransactionsCard
          data={recentTransactions}
          currentPage={transactionPage}
          totalPages={totalTransactionPages}
          itemsPerPage={itemsPerPage}
          onPageChange={setTransactionPage}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default DashboardPage;
