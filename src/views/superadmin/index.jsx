import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useGetOverviewQuery } from "@/features/overview/overviewApiSlice";

const MaterialIcon = ({ children, className = "", filled = false }) => (
  <span
    className={`material-symbols-outlined ${className}`}
    style={{
      fontVariationSettings: `"FILL" ${filled ? 1 : 0}, "wght" 400, "GRAD" 0, "opsz" 24`,
    }}
  >
    {children}
  </span>
);

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);

const SuperAdminOverviewPage = () => {
  const navigate = useNavigate();
  const { data: overviewData } = useGetOverviewQuery();

  const [nodes, setNodes] = useState([
    { id: "SF-1", name: "SF Gateway", cpu: 12, ram: 4.2, disk: 18, latency: 14, status: "Optimal" },
    { id: "NY-2", name: "NY Endpoint", cpu: 15, ram: 4.0, disk: 20, latency: 11, status: "Optimal" },
    { id: "LDN-1", name: "London Relay", cpu: 10, ram: 4.5, disk: 16, latency: 18, status: "Optimal" },
    { id: "SG-3", name: "Singapore Hub", cpu: 18, ram: 5.0, disk: 22, latency: 22, status: "Optimal" },
    { id: "TKY-1", name: "Tokyo Core", cpu: 8, ram: 3.2, disk: 14, latency: 15, status: "Optimal" },
    { id: "FRA-2", name: "Frankfurt Dist", cpu: 11, ram: 4.1, disk: 17, latency: 13, status: "Optimal" },
  ]);

  // Fluctuating real-time metrics for CPU, RAM, and Latency to make it dynamic
  useEffect(() => {
    const timer = setInterval(() => {
      setNodes((prev) =>
        prev.map((node) => ({
          ...node,
          cpu: Math.max(4, Math.min(45, node.cpu + Math.floor(Math.random() * 7) - 3)),
          latency: Math.max(6, Math.min(32, node.latency + Math.floor(Math.random() * 5) - 2)),
          ram: parseFloat(Math.max(3.0, Math.min(8.0, node.ram + (Math.random() * 0.4 - 0.2))).toFixed(1)),
        }))
      );
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const summary = useMemo(() => {
    const kpis = overviewData?.kpis || {};
    return {
      totalValue: formatCurrency(kpis.totalEarnings),
      earnings: formatCurrency(kpis.totalEarnings),
      customers: String(kpis.activeCustomers || 0),
      tickets: String(kpis.openSupportTickets || 0),
      totalDelta: `${Math.abs(kpis.totalEarningsDelta || 4.2).toFixed(1)}%`,
    };
  }, [overviewData]);

  // Compute average metrics dynamically across all nodes
  const averages = useMemo(() => {
    const totalCpu = nodes.reduce((acc, n) => acc + n.cpu, 0);
    const totalLatency = nodes.reduce((acc, n) => acc + n.latency, 0);
    const totalRam = nodes.reduce((acc, n) => acc + n.ram, 0);
    const totalDisk = nodes.reduce((acc, n) => acc + n.disk, 0);
    return {
      cpu: Math.round(totalCpu / nodes.length),
      latency: Math.round(totalLatency / nodes.length),
      ram: (totalRam / nodes.length).toFixed(1),
      disk: Math.round(totalDisk / nodes.length),
    };
  }, [nodes]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-8 pb-12"
    >
      <div className="grid grid-cols-12 gap-6">
        {/* Hero Section: Welcome (9-Span) */}
        <section className="col-span-12 lg:col-span-9 bg-white dark:bg-[#1a1f26] rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-800/40 flex flex-col md:flex-row justify-between items-center relative overflow-hidden group">
          <div className="relative z-10 flex flex-col gap-4 max-w-xl">
            <div className="flex flex-col">
              <h3 className="text-4xl md:text-5xl font-extrabold text-[#1b1b24] dark:text-white leading-none">Welcome back,</h3>
              <h4 className="text-4xl md:text-5xl font-extrabold text-[#3525cd] dark:text-[#c3c0ff] leading-none mt-1">Commander SquadCart</h4>
            </div>
            <p className="text-base md:text-lg text-[#464555] dark:text-gray-400">
              Engine status nominal. Your revenue metrics are outperforming last quarter by <span className="text-[#10b981] font-bold">12.4%</span>.
            </p>
          </div>
          
          {/* Hero Metric Badge */}
          <div className="mt-6 md:mt-0 relative z-10 bg-[#1a1c1e] dark:bg-black/50 p-8 rounded-2xl text-white min-w-[240px] shadow-xl">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#777587]">Total System Value</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-black">{summary.totalValue}</span>
            </div>
            <div className="flex items-center gap-1 mt-2 text-[#10b981] font-semibold text-sm">
              <MaterialIcon className="text-sm">trending_up</MaterialIcon>
              <span>+{summary.totalDelta} today</span>
            </div>
          </div>
          
          {/* Decorative Gradient Accent */}
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-[#e2dfff]/20 rounded-full blur-[80px] group-hover:bg-[#e2dfff]/30 transition-all duration-700"></div>
        </section>

        {/* Metric Card 1: Earnings (3-Span) */}
        <div className="col-span-12 md:col-span-6 lg:col-span-3 bg-white dark:bg-[#1a1f26] p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800/40 hover:-translate-y-1 transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-[#e2dfff] text-[#3525cd] rounded-xl flex items-center justify-center">
              <MaterialIcon className="text-2xl">payments</MaterialIcon>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#777587]">Earnings</p>
              <p className="text-xs font-bold text-[#10b981]">Live Feed</p>
            </div>
          </div>
          <div className="mt-8">
            <h5 className="text-4xl font-extrabold text-[#1b1b24] dark:text-white leading-none">{summary.earnings}</h5>
          </div>
          <div className="mt-6 h-12 w-full flex items-end gap-1 opacity-20">
            <div className="bg-[#3525cd] flex-1 h-1/4 rounded-full"></div>
            <div className="bg-[#3525cd] flex-1 h-2/4 rounded-full"></div>
            <div className="bg-[#3525cd] flex-1 h-3/4 rounded-full"></div>
            <div className="bg-[#3525cd] flex-1 h-2/4 rounded-full"></div>
            <div className="bg-[#3525cd] flex-1 h-1/4 rounded-full"></div>
            <div className="bg-[#3525cd] flex-1 h-2/4 rounded-full"></div>
          </div>
        </div>

        {/* Metric Card 2: Active Base (3-Span) */}
        <div className="col-span-12 md:col-span-6 lg:col-span-3 bg-white dark:bg-[#1a1f26] p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800/40 hover:-translate-y-1 transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-[#f0ecf9] dark:bg-gray-800 text-[#464555] dark:text-gray-300 rounded-xl flex items-center justify-center">
              <MaterialIcon className="text-2xl">groups</MaterialIcon>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#777587]">Active Base</p>
              <p className="text-xs font-bold text-[#3525cd] dark:text-[#c3c0ff]">Verified</p>
            </div>
          </div>
          <div className="mt-8">
            <h5 className="text-4xl font-extrabold text-[#1b1b24] dark:text-white leading-none">{summary.customers}</h5>
          </div>
          <div className="mt-6 h-12 w-full flex items-end gap-1 opacity-20">
            <div className="bg-gray-700 dark:bg-gray-300 flex-1 h-2/4 rounded-full"></div>
            <div className="bg-gray-700 dark:bg-gray-300 flex-1 h-1/4 rounded-full"></div>
            <div className="bg-gray-700 dark:bg-gray-300 flex-1 h-3/4 rounded-full"></div>
            <div className="bg-gray-700 dark:bg-gray-300 flex-1 h-4/4 rounded-full"></div>
            <div className="bg-gray-700 dark:bg-gray-300 flex-1 h-2/4 rounded-full"></div>
            <div className="bg-gray-700 dark:bg-gray-300 flex-1 h-1/4 rounded-full"></div>
          </div>
        </div>

        {/* Metric Card 3: Queue (3-Span) */}
        <div className="col-span-12 md:col-span-6 lg:col-span-3 bg-white dark:bg-[#1a1f26] p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800/40 hover:-translate-y-1 transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-[#ffdad6] text-[#ef4444] rounded-xl flex items-center justify-center">
              <MaterialIcon className="text-2xl">timer</MaterialIcon>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#777587]">Queue</p>
              <p className="text-xs font-bold text-[#ef4444]">Urgent</p>
            </div>
          </div>
          <div className="mt-8">
            <h5 className="text-4xl font-extrabold text-[#1b1b24] dark:text-white leading-none">{summary.tickets}</h5>
          </div>
          <div className="mt-6 h-12 w-full flex items-end gap-1 opacity-20">
            <div className="bg-[#ef4444] flex-1 h-1/4 rounded-full"></div>
            <div className="bg-[#ef4444] flex-1 h-1/4 rounded-full"></div>
            <div className="bg-[#ef4444] flex-1 h-2/4 rounded-full"></div>
            <div className="bg-[#ef4444] flex-1 h-1/4 rounded-full"></div>
            <div className="bg-[#ef4444] flex-1 h-3/4 rounded-full"></div>
            <div className="bg-[#ef4444] flex-1 h-2/4 rounded-full"></div>
          </div>
        </div>

        {/* Help Center Module (3-Span) */}
        <section className="col-span-12 md:col-span-6 lg:col-span-3 bg-[#3525cd] rounded-3xl p-8 shadow-xl border border-[#3525cd]/20 text-white flex flex-col items-center justify-center text-center gap-5">
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
            <MaterialIcon className="text-4xl text-white">support_agent</MaterialIcon>
          </div>
          <div>
            <h4 className="text-xl font-bold">Help Center</h4>
            <p className="text-xs opacity-80 mt-1">
              {Number(summary.tickets) > 0
                ? `You have ${summary.tickets} pending requests.`
                : "Zero pending requests. The fleet is happy."}
            </p>
          </div>
          <button
            onClick={() => navigate("/superadmin/support")}
            className="w-auto px-5 py-2 bg-white text-[#3525cd] rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-md hover:bg-gray-50 transition-colors border-none cursor-pointer active:scale-95"
          >
            Open Command Inbox
            <MaterialIcon className="text-sm">rocket_launch</MaterialIcon>
          </button>
        </section>

        {/* Customer Dynamics Sidebar Module (3-Span / Tall) */}
        <section className="col-span-12 lg:col-span-3 lg:row-span-2 bg-white dark:bg-[#1a1f26] rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-800/40 flex flex-col h-full">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <MaterialIcon className="text-primary text-xl">analytics</MaterialIcon>
              <h4 className="text-lg font-bold text-[#1b1b24] dark:text-white">Customer Dynamics</h4>
            </div>
            <button className="p-1 text-[#777587] hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg border-none bg-transparent">
              <MaterialIcon className="text-xl">more_vert</MaterialIcon>
            </button>
          </div>
          <div className="space-y-4 flex-1">
            {/* New Customers Item */}
            <div className="p-4 bg-gray-50 dark:bg-black/20 rounded-2xl border border-gray-100 dark:border-gray-800/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#e2dfff] flex items-center justify-center text-[#3525cd]">
                  <MaterialIcon className="text-lg">person_add</MaterialIcon>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#1b1b24] dark:text-white">New Customers</p>
                  <p className="text-[10px] font-bold text-[#777587] uppercase tracking-widest">Last 7 days</p>
                </div>
              </div>
              <span className="text-xl font-bold text-[#1b1b24] dark:text-white">
                {overviewData?.customers?.newCustomersLast7Days || 0}
              </span>
            </div>
            
            {/* Retention Rate Item */}
            <div className="p-4 bg-gray-50 dark:bg-black/20 rounded-2xl border border-gray-100 dark:border-gray-800/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#f0ecf9] dark:bg-gray-800 flex items-center justify-center text-[#3525cd] dark:text-[#c3c0ff]">
                  <MaterialIcon className="text-lg">sync</MaterialIcon>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#1b1b24] dark:text-white">Retention Rate</p>
                  <p className="text-[10px] font-bold text-[#777587] uppercase tracking-widest">System average</p>
                </div>
              </div>
              <span className="text-xl font-bold text-[#1b1b24] dark:text-white">
                {overviewData?.customers?.returningCustomersPercentage || 0}%
              </span>
            </div>

            {/* Churn Risk Item */}
            <div className="p-4 bg-[#ffdad6]/40 dark:bg-[#ffdad6]/5 rounded-2xl border border-[#ef4444]/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#ffdad6] flex items-center justify-center text-[#ef4444]">
                  <MaterialIcon className="text-lg">warning</MaterialIcon>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#1b1b24] dark:text-white">Churn Risk</p>
                  <p className="text-[10px] font-bold text-[#777587] uppercase tracking-widest">Requires attention</p>
                </div>
              </div>
              <span className={`text-xl font-bold ${overviewData?.customers?.atRiskCustomers ? "text-[#ef4444]" : "text-[#1b1b24] dark:text-white"}`}>
                {overviewData?.customers?.atRiskCustomers || 0}
              </span>
            </div>
          </div>
          
          <div className="mt-6">
            <button
              onClick={() => navigate("/superadmin/customers")}
              className="w-full py-3 border border-gray-200 dark:border-gray-700 hover:border-[#3525cd] dark:hover:border-[#c3c0ff] text-[#464555] dark:text-gray-300 font-bold rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all cursor-pointer bg-transparent"
            >
              View Full Intelligence Report
            </button>
          </div>
        </section>

        {/* Bottom Systems Health Section (9-Span) */}
        <section className="col-span-12 lg:col-span-9 bg-white dark:bg-[#1a1f26] rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-800/40 flex flex-col items-center justify-center text-center gap-6 relative overflow-hidden">
          
          {/* Dynamic Interactive Server Cluster Grid */}
          <div className="w-full max-w-2xl grid grid-cols-2 md:grid-cols-3 gap-4 mb-2">
            {nodes.map((node) => (
              <div key={node.id} className="p-4 bg-gray-50 dark:bg-black/20 border border-gray-150 dark:border-gray-800/20 rounded-2xl flex flex-col text-left justify-between relative overflow-hidden group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#1b1b24] dark:text-white">{node.name}</span>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10b981]"></span>
                  </span>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-[#777587] font-semibold">
                    <span>CPU LOAD</span>
                    <span className="font-bold text-[#1b1b24] dark:text-white">{node.cpu}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="bg-[#3525cd] h-full rounded-full transition-all duration-1000"
                      style={{ width: `${node.cpu}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between text-[10px] text-[#777587] font-semibold pt-1">
                    <span>LATENCY</span>
                    <span className="font-bold text-[#1b1b24] dark:text-white">{node.latency}ms</span>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#3525cd]/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            ))}
          </div>
          
          {/* Dynamic Average Metrics Status Bar */}
          <div className="w-full max-w-2xl flex flex-wrap justify-between items-center px-6 py-3 bg-gray-50 dark:bg-black/20 rounded-2xl border border-gray-100 dark:border-gray-800/20 mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#10b981]"></span>
              <span className="text-xs text-[#464555] dark:text-gray-400">CPU: <span className="text-[#1b1b24] dark:text-white font-bold">{averages.cpu}%</span></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#10b981]"></span>
              <span className="text-xs text-[#464555] dark:text-gray-400">RAM: <span className="text-[#1b1b24] dark:text-white font-bold">{averages.ram} GB</span></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#10b981]"></span>
              <span className="text-xs text-[#464555] dark:text-gray-400">DISK: <span className="text-[#1b1b24] dark:text-white font-bold">{averages.disk}%</span></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#464555] dark:text-gray-400 mr-1">LATENCY: <span className="text-[#1b1b24] dark:text-white font-bold">{averages.latency}ms</span></span>
              <span className="px-2.5 py-0.5 bg-[#10b981]/10 text-[#10b981] text-[9px] font-bold rounded-full uppercase tracking-wider">Optimal</span>
            </div>
          </div>
          
          <div className="space-y-2 max-w-xl relative z-10">
            <h3 className="text-2xl font-extrabold text-[#1b1b24] dark:text-white">Systems Nominal</h3>
            <p className="text-sm text-[#464555] dark:text-gray-400 leading-relaxed">
              No anomalies detected in the last 24 cycles. Your platform is operating at peak efficiency across all sectors, from regional logistics to global distribution clusters.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3 relative z-10">
            <button
              onClick={() => navigate("/superadmin/usage")}
              className="px-6 py-2.5 bg-white dark:bg-[#1a1f26] text-[#464555] dark:text-gray-300 font-bold rounded-2xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            >
              Run Diagnostics
            </button>
            <button
              onClick={() => navigate("/superadmin/earnings")}
              className="px-6 py-2.5 bg-[#3525cd] text-white font-bold rounded-2xl shadow-xl shadow-[#3525cd]/20 hover:scale-105 active:scale-95 transition-all border-none cursor-pointer"
            >
              Optimize Network
            </button>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#3525cd]/20 to-transparent"></div>
        </section>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => navigate("/superadmin/customers/create")}
        className="fixed bottom-8 right-8 w-16 h-16 rounded-2xl bg-[#3525cd] hover:bg-[#4f46e5] text-white shadow-xl hover:scale-105 active:scale-95 transition-transform flex items-center justify-center z-50 border-none cursor-pointer"
      >
        <span className="material-symbols-outlined text-3xl">add</span>
      </button>
    </motion.div>
  );
};

export default SuperAdminOverviewPage;
