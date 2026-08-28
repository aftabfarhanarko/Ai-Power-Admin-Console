import React, { useMemo } from "react";
import { useGetEarningsOverviewQuery } from "@/features/earnings/earningsApiSlice";

const pageShellClassName =
  "min-h-screen bg-[#f8f9fc] px-4 py-8 font-['Plus_Jakarta_Sans',sans-serif] text-[#1b1b24] sm:px-6 lg:px-8";

const cardClassName =
  "rounded-[32px] border border-[#e4e1ee]/60 bg-white shadow-sm transition-transform duration-200 hover:-translate-y-1";

const monoClassName =
  "text-[10px] font-bold uppercase tracking-[0.18em] text-[#777587]";

const fallbackPayouts = [
  { label: "Settled: US-West-1", date: "Oct 24, 2023 • ACH Transfer", amount: 42900, status: "Paid" },
  { label: "Pending: EU-Central-1", date: "Oct 26, 2023 • Wire", amount: 89120, status: "Pending" },
  { label: "Settled: ASIA-East-2", date: "Oct 22, 2023 • SWIFT", amount: 12400, status: "Paid" },
];

const fallbackTransactions = [
  {
    id: "#TRX-99201",
    market: "North America Enterprise",
    region: "US",
    date: "Oct 25, 2023, 14:22",
    amount: 12450,
    status: "Completed",
  },
  {
    id: "#TRX-99198",
    market: "European Markets Hub",
    region: "EU",
    date: "Oct 25, 2023, 11:05",
    amount: 8210.5,
    status: "Completed",
  },
  {
    id: "#TRX-99182",
    market: "Asia-Pacific Region",
    region: "JP",
    date: "Oct 24, 2023, 22:50",
    amount: 15000,
    status: "Processing",
  },
  {
    id: "#TRX-99175",
    market: "LATAM Operations",
    region: "BR",
    date: "Oct 24, 2023, 16:12",
    amount: 4520,
    status: "Disputed",
  },
];

const fallbackSeries = [72, 96, 88, 134, 122, 148, 204];

const formatCurrency = (amount, maximumFractionDigits = 0) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits,
  }).format(Number(amount || 0));

const formatCompactNumber = (value) =>
  new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const getArray = (value) => (Array.isArray(value) ? value : []);

const getObject = (value) =>
  value && typeof value === "object" && !Array.isArray(value) ? value : {};

const buildChartPoints = (series) => {
  const maxValue = Math.max(...series, 1);

  return series
    .map((value, index) => {
      const x = (800 / Math.max(series.length - 1, 1)) * index;
      const y = 250 - (Math.max(value, 0) / maxValue) * 170;
      return `${x},${y}`;
    })
    .join(" ");
};

const buildTrendPath = (series) => {
  const maxValue = Math.max(...series, 1);

  return series
    .map((value, index) => {
      const x = (800 / Math.max(series.length - 1, 1)) * index;
      const y = 250 - (Math.max(value, 0) / maxValue) * 170;
      return `${index === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");
};

const statusTone = (status) => {
  const normalized = String(status || "").toLowerCase();
  if (normalized.includes("pending") || normalized.includes("process")) {
    return "bg-[#fef3c7] text-[#d97706]";
  }
  if (normalized.includes("dispute") || normalized.includes("error")) {
    return "bg-[#fee2e2] text-[#ef4444]";
  }
  return "bg-[#dcfce7] text-[#10b981]";
};

const payoutTone = (status) => {
  const normalized = String(status || "").toLowerCase();
  if (normalized.includes("pending")) {
    return {
      wrap: "bg-[#fef3c7]/60 text-[#f59e0b]",
      badge: "bg-[#fef3c7] text-[#d97706]",
      icon: "schedule",
    };
  }
  return {
    wrap: "bg-[#dcfce7]/60 text-[#10b981]",
    badge: "bg-[#dcfce7] text-[#16a34a]",
    icon: "check_circle",
  };
};

const regionTone = (region) => {
  const map = {
    US: "text-[#1b1b24]",
    EU: "text-[#3525cd]",
    JP: "text-[#6b00b8]",
    BR: "text-[#006780]",
  };

  return map[region] || "text-[#1b1b24]";
};

const MaterialIcon = ({ name, filled = false, className = "" }) => (
  <span
    className={`material-symbols-outlined ${className}`.trim()}
    style={{
      fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24`,
    }}
  >
    {name}
  </span>
);

const MetricCard = ({ iconTone, iconName, badge, badgeClassName, label, value, children }) => (
  <div className={`${cardClassName} col-span-12 p-6 md:col-span-3`}>
    <div className="mb-6 flex items-start justify-between">
      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${iconTone}`}>
        <MaterialIcon name={iconName} filled className="text-[22px]" />
      </div>
      <span className={`rounded px-2 py-1 text-[10px] font-bold ${badgeClassName}`}>{badge}</span>
    </div>
    <p className={`${monoClassName} mb-1`}>{label}</p>
    <h3 className="text-[30px] font-semibold tracking-[-0.03em] text-[#1b1b24]">{value}</h3>
    {children}
  </div>
);

export default function SuperAdminEarningsPage() {
  const { data, isLoading } = useGetEarningsOverviewQuery();
  const earnings = getObject(data?.data ?? data);
  const kpis = getObject(earnings.kpis);
  const payoutStatus = getObject(earnings.payoutStatus);

  const totalEarnings =
    kpis.totalEarningsYTD ??
    earnings.totalEarningsYTD ??
    earnings.totalEarnings ??
    earnings.totalRevenue ??
    2482910;
  const averageDailyRevenue =
    kpis.avgDailyRevenue ??
    earnings.avgDailyRevenue ??
    earnings.averageDailyRevenue ??
    earnings.dailyAverage ??
    42105;
  const paidVsPending =
    earnings.paidVsPending ??
    kpis.paidPercentage ??
    earnings.paidPercentage ??
    earnings.collectionRate ??
    94.8;
  const activeMarkets = kpis.activeMarkets ?? earnings.activeMarkets ?? earnings.totalMarkets ?? 12;

  const seriesSource = getArray(earnings.series ?? earnings.chartData ?? earnings.chart ?? earnings.trend);
  const parsedSeries = seriesSource.length
    ? seriesSource.slice(0, 7).map((item) => Number(item?.value ?? item?.totalPNL ?? item ?? 0))
    : fallbackSeries;
  const hasVisibleSeries = parsedSeries.some((value) => Number.isFinite(value) && value > 0);
  const series = hasVisibleSeries ? parsedSeries : fallbackSeries;

  const trendPath = buildTrendPath(series);
  const trendAreaPath = `${buildChartPoints(series)} 800,300 0,300`;
  const svgAreaPath = `M${trendAreaPath}`;
  const derivedPayouts = payoutStatus.clearedPayouts || payoutStatus.scheduledPending || payoutStatus.disputedOnHold
    ? [
        {
          label: "Settled: Recent Cycle",
          date: "Latest cleared settlements",
          amount: Number(payoutStatus.clearedPayouts || 0),
          status: "Paid",
        },
        {
          label: "Pending: Scheduled",
          date: "Upcoming payout queue",
          amount: Number(payoutStatus.scheduledPending || 0),
          status: "Pending",
        },
        {
          label: "On Hold: Disputed",
          date: "Failed or cancelled invoices",
          amount: Number(payoutStatus.disputedOnHold || 0),
          status: "Pending",
        },
      ]
    : [];
  const payouts = getArray(earnings.payouts ?? earnings.recentPayouts).length
    ? getArray(earnings.payouts ?? earnings.recentPayouts)
    : derivedPayouts.length
      ? derivedPayouts
      : fallbackPayouts;
  const transactions = getArray(
    earnings.transactions ?? earnings.recentTransactions ?? earnings.items,
  ).length
    ? getArray(earnings.transactions ?? earnings.recentTransactions ?? earnings.items)
    : fallbackTransactions;

  const tooltipIndex = series.length > 3 ? 3 : Math.max(series.length - 1, 0);
  const tooltipValue = series[tooltipIndex] ?? 0;
  const tooltipX = (800 / Math.max(series.length - 1, 1)) * tooltipIndex;
  const maxValue = Math.max(...series, 1);
  const tooltipY = 250 - (Math.max(tooltipValue, 0) / maxValue) * 170;

  return (
    <div className={pageShellClassName}>
      <div className="mx-auto w-full max-w-[1440px]">
        <section className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="mb-2 text-[32px] font-semibold tracking-[-0.02em] text-[#1b1b24]">
              Revenue Performance
            </h2>
            <p className="max-w-2xl text-[16px] leading-7 text-[#464555]">
              Consolidated earnings across all 12 active markets. Your net revenue is up{" "}
              <span className="font-bold text-[#10b981]">14.2%</span> compared to the previous fiscal quarter.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="inline-flex items-center gap-2 rounded-xl border border-[#c7c4d8] bg-white px-6 py-3 text-[14px] font-bold text-[#1b1b24] transition-all hover:bg-[#f0ecf9]">
              <MaterialIcon name="calendar_today" className="text-[20px]" />
              Last 30 Days
            </button>
            <button className="inline-flex items-center gap-2 rounded-xl bg-[#3525cd] px-6 py-3 text-[14px] font-bold text-white shadow-md transition-all hover:scale-105 active:scale-95">
              <MaterialIcon name="download" className="text-[20px]" />
              Export Data
            </button>
          </div>
        </section>

        <div className="mb-8 grid grid-cols-12 gap-6">
          <MetricCard
            iconTone="bg-[#e2dfff] text-[#3525cd]"
            iconName="payments"
            badge="+12.5%"
            badgeClassName="bg-[#dcfce7]/80 text-[#10b981]"
            label="Total Earnings (YTD)"
            value={isLoading ? "..." : formatCurrency(totalEarnings)}
          />
          <MetricCard
            iconTone="bg-[#b7eaff] text-[#006780]"
            iconName="insights"
            badge="+4.1%"
            badgeClassName="bg-[#dcfce7]/80 text-[#10b981]"
            label="Avg. Daily Revenue"
            value={isLoading ? "..." : formatCurrency(averageDailyRevenue)}
          />
          <MetricCard
            iconTone="bg-[#f0dbff] text-[#6b00b8]"
            iconName="account_balance_wallet"
            badge="Pending: $12k"
            badgeClassName="bg-[#fef3c7]/80 text-[#d97706]"
            label="Paid vs Pending"
            value={isLoading ? "..." : `${Number(paidVsPending).toFixed(1)}%`}
          />
          <MetricCard
            iconTone="bg-[#c3c0ff] text-[#3323cc]"
            iconName="public"
            badge="Steady"
            badgeClassName="bg-[#3525cd]/10 text-[#3525cd]"
            label="Active Markets"
            value={isLoading ? "..." : formatCompactNumber(activeMarkets)}
          />
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className={`${cardClassName} col-span-12 overflow-hidden p-6 lg:col-span-8`}>
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-[24px] font-semibold text-[#1b1b24]">Earnings Trend</h3>
                <p className="text-[14px] text-[#777587]">Daily gross revenue across all segments</p>
              </div>
              <div className="inline-flex rounded-xl bg-[#f0ecf9] p-1">
                <button className="rounded-lg bg-white px-4 py-2 text-[12px] font-bold text-[#1b1b24] shadow-sm">
                  Revenue
                </button>
                <button className="rounded-lg px-4 py-2 text-[12px] font-bold text-[#777587] transition-all hover:bg-[#eae6f4]">
                  Margins
                </button>
              </div>
            </div>

            <div className="relative mt-8 h-80 w-full">
              <svg className="h-full w-full drop-shadow-lg" viewBox="0 0 800 300" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#3525cd" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#3525cd" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={`${svgAreaPath} Z`} fill="url(#chartGradient)" />
                <path
                  d={trendPath}
                  fill="none"
                  stroke="#3525cd"
                  strokeLinecap="round"
                  strokeWidth="4"
                />
                <line x1="0" x2="800" y1="50" y2="50" stroke="#e4e1ee" strokeDasharray="4" />
                <line x1="0" x2="800" y1="150" y2="150" stroke="#e4e1ee" strokeDasharray="4" />
                <line x1="0" x2="800" y1="250" y2="250" stroke="#e4e1ee" strokeDasharray="4" />
                <circle cx={tooltipX} cy={tooltipY} r="6" fill="#3525cd" stroke="white" strokeWidth="2" />
                <circle cx="800" cy={250 - (Math.max(series[series.length - 1], 0) / maxValue) * 170} r="6" fill="#3525cd" stroke="white" strokeWidth="2" />
              </svg>

              <div
                className="glass-panel absolute rounded-xl bg-[#302f39] p-3 text-[#f3effc] shadow-xl"
                style={{
                  left: `calc(${(tooltipX / 800) * 100}% - 40px)`,
                  top: `${Math.max(16, tooltipY - 36)}px`,
                }}
              >
                <p className="text-[10px] font-bold uppercase opacity-70">OCT 14, 2023</p>
                <p className="text-[20px] font-bold">{formatCurrency(tooltipValue * 600, 2)}</p>
              </div>
            </div>

            <div className="mt-6 flex justify-between text-[12px] font-semibold text-[#777587]">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>
          </div>

          <div className={`${cardClassName} col-span-12 flex flex-col overflow-hidden lg:col-span-4`}>
            <div className="border-b border-[#e4e1ee]/60 p-6">
              <h3 className="text-[24px] font-semibold text-[#1b1b24]">Payout Status</h3>
              <p className="text-[14px] text-[#777587]">Latest settlement activities</p>
            </div>
            <div className="flex flex-1 flex-col gap-6 p-6">
              {payouts.map((payout) => {
                const tone = payoutTone(payout.status);
                return (
                  <div
                    key={`${payout.label}-${payout.date}`}
                    className={`flex items-center gap-4 ${String(payout.status).toLowerCase().includes("pending") ? "opacity-75" : ""}`}
                  >
                    <div className={`flex h-12 w-12 items-center justify-center rounded-full ${tone.wrap}`}>
                      <MaterialIcon name={tone.icon} className="text-[22px]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[14px] font-bold text-[#1b1b24]">{payout.label}</p>
                      <p className="text-[12px] text-[#777587]">{payout.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[14px] font-bold text-[#1b1b24]">{formatCurrency(payout.amount)}</p>
                      <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${tone.badge}`}>
                        {payout.status}
                      </span>
                    </div>
                  </div>
                );
              })}

              <button className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#f5f2ff] py-4 font-bold text-[#3525cd] transition-all hover:bg-[#f0ecf9]">
                View All Payouts
                <MaterialIcon name="arrow_forward" className="text-[18px]" />
              </button>
            </div>
          </div>
        </div>

        <section className="mt-8">
          <div className={`${cardClassName} overflow-hidden`}>
            <div className="flex items-center justify-between bg-[#f5f2ff]/60 p-6">
              <h3 className="text-[24px] font-semibold text-[#1b1b24]">Recent Earnings Activities</h3>
              <div className="flex gap-2">
                <button className="rounded-lg border border-[#c7c4d8] p-2 transition-all hover:bg-white">
                  <MaterialIcon name="filter_list" />
                </button>
                <button className="rounded-lg border border-[#c7c4d8] p-2 transition-all hover:bg-white">
                  <MaterialIcon name="more_vert" />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-y border-[#e4e1ee]/60 bg-[#faf8ff]">
                    {[
                      "Transaction ID",
                      "Market / Source",
                      "Date",
                      "Amount",
                      "Status",
                    ].map((label) => (
                      <th
                        key={label}
                        className={`p-6 text-[10px] font-bold uppercase tracking-[0.18em] text-[#777587] ${label === "Amount" ? "text-right" : ""} ${label === "Status" ? "text-center" : ""}`}
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-[14px]">
                  {transactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="border-b border-[#f0ecf9] transition-colors hover:bg-[#f8f9fc]"
                    >
                      <td className="p-6 font-bold text-[#1b1b24]">{transaction.id}</td>
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-[#f0ecf9] text-xs font-bold ${regionTone(transaction.region)}`}>
                            {transaction.region}
                          </div>
                          <span>{transaction.market}</span>
                        </div>
                      </td>
                      <td className="p-6 text-[#777587]">{transaction.date}</td>
                      <td className="p-6 text-right font-bold text-[#3525cd]">
                        {formatCurrency(transaction.amount, 2)}
                      </td>
                      <td className="p-6 text-center">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${statusTone(transaction.status)}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${String(transaction.status).toLowerCase().includes("process") ? "bg-[#f59e0b]" : String(transaction.status).toLowerCase().includes("dispute") ? "bg-[#ef4444]" : "bg-[#10b981]"}`} />
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border-t border-[#f0ecf9] bg-white p-4 text-center">
              <button className="font-bold text-[#3525cd] transition-all hover:underline">
                Download Full Transaction Report (CSV)
              </button>
            </div>
          </div>
        </section>

        <button className="fixed bottom-10 right-10 z-50 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#3525cd] text-white shadow-xl transition-all hover:scale-110 active:scale-95">
          <MaterialIcon name="add" className="text-3xl" />
        </button>
      </div>
    </div>
  );
}
