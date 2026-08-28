import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Package, 
  Users, 
  ShoppingBag, 
  UserPlus, 
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Eye,
  CreditCard,
  Zap,
  Layout,
  Globe,
  Database
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useGetDashboardQuery } from "@/features/dashboard/dashboardApiSlice";

const UsageCard = ({ title, current, limit, icon: Icon, color, t, suffix = "" }) => {
  const isUnlimited = limit === Infinity || limit === -1 || limit === "Unlimited" || !limit;
  const numLimit = isUnlimited ? 0 : Number(limit);
  const numCurrent = Number(current) || 0;
  const percentage = isUnlimited ? 0 : Math.min((numCurrent / numLimit) * 100, 100);
  const isNearLimit = !isUnlimited && percentage > 85;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white dark:bg-slate-800/40 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-slate-200/20 dark:hover:shadow-none transition-all duration-300 group"
    >
      <div className="flex items-center justify-between mb-5">
        <div className={`p-3 rounded-2xl ${color.bg} ${color.text} transition-transform group-hover:scale-110 duration-300`}>
          <Icon size={24} />
        </div>
        {isNearLimit && (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-full text-[10px] font-black uppercase tracking-wider border border-amber-100 dark:border-amber-800">
            <AlertCircle size={12} />
            Near Limit
          </div>
        )}
      </div>

      <h3 className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">{title}</h3>
      <div className="flex items-baseline gap-1.5 mb-5">
        <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          {numCurrent.toLocaleString()}
          {suffix}
        </span>
        <span className="text-slate-400 dark:text-slate-500 text-sm font-medium">
          / {isUnlimited ? "∞" : numLimit.toLocaleString()}
        </span>
      </div>

      {!isUnlimited ? (
        <>
          <div className="relative h-2 w-full bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              whileInView={{ width: `${percentage}%` }}
              transition={{ duration: 1.2, ease: "circOut" }}
              className={`absolute h-full rounded-full ${isNearLimit ? 'bg-amber-500' : color.bar} transition-colors duration-500`}
            />
          </div>
          
          <div className="mt-3 flex items-center justify-between text-[11px] font-bold uppercase tracking-tight text-slate-400">
            <span>{Math.round(percentage)}% used</span>
            <span>{(numLimit - numCurrent).toLocaleString()} remaining</span>
          </div>
        </>
      ) : (
        <div className="flex items-center gap-2 py-2 px-3 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100/50 dark:border-emerald-800/30">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Unlimited Usage Access</span>
        </div>
      )}
    </motion.div>
  );
};

const UsagePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const authUser = useSelector((state) => state.auth.user);
  
  const { data: dashboardData, isLoading } = useGetDashboardQuery(
    { companyId: authUser?.companyId },
    { skip: !authUser?.companyId }
  );

  const pkg = authUser?.package || {};

  const resourceMetrics = useMemo(() => [
    {
      title: "Total Products",
      current: dashboardData?.overviewMetrics?.totalProducts || 0,
      limit: pkg.productLimit || 500,
      icon: Package,
      color: { bg: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-600 dark:text-blue-400", bar: "bg-blue-500" }
    },
    {
      title: "Customers",
      current: dashboardData?.overviewMetrics?.totalCustomers || 0,
      limit: pkg.customerLimit || 1000,
      icon: Users,
      color: { bg: "bg-violet-50 dark:bg-violet-900/20", text: "text-violet-600 dark:text-violet-400", bar: "bg-violet-500" }
    },
    {
      title: "Staff Accounts",
      current: authUser?.staffCount || 1,
      limit: pkg.staffLimit || 2,
      icon: UserPlus,
      color: { bg: "bg-rose-50 dark:bg-rose-900/20", text: "text-rose-600 dark:text-rose-400", bar: "bg-rose-500" }
    },
    {
      title: "Monthly Visitors",
      current: dashboardData?.overviewMetrics?.totalStoreViews || 0,
      limit: pkg.visitorLimit || 10000,
      icon: Eye,
      color: { bg: "bg-amber-50 dark:bg-amber-900/20", text: "text-amber-600 dark:text-amber-400", bar: "bg-amber-500" }
    }
  ], [dashboardData, authUser, pkg]);

  const trafficMetrics = useMemo(() => [
    {
      title: "Total Revenue",
      current: dashboardData?.overviewMetrics?.totalRevenue || 0,
      limit: Infinity,
      suffix: " BDT",
      icon: CreditCard,
      color: { bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-600 dark:text-emerald-400", bar: "bg-emerald-500" }
    },
    {
      title: "Completed Orders",
      current: dashboardData?.overviewMetrics?.totalOrders || 0,
      limit: Infinity,
      icon: ShoppingBag,
      color: { bg: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-600 dark:text-blue-400", bar: "bg-blue-500" }
    }
  ], [dashboardData]);

  const featureEntitlements = useMemo(() => [
    { title: "AI Daily Insights", enabled: pkg.features?.includes("AI_REPORT"), icon: Zap },
    { title: "Custom Domain", enabled: pkg.features?.includes("CUSTOM_DOMAIN"), icon: Globe },
    { title: "Premium Themes", enabled: pkg.features?.includes("THEME_MANAGEMENT"), icon: Layout },
    { title: "Inventory History", enabled: pkg.features?.includes("INVENTORY_HISTORY"), icon: Database },
  ], [pkg]);

  if (isLoading) {
    return (
      <div className="p-10 space-y-8 max-w-7xl mx-auto">
        <div className="h-20 bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-48 bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-3 border border-violet-100 dark:border-violet-800">
            <ShieldCheck size={12} />
            Resource Center
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-3">
            Usage Monitoring
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg max-w-md leading-relaxed">
            Real‑time tracking of your e‑commerce platform's resource consumption.
          </p>
        </div>
        
        <div className="flex items-center gap-4 bg-white dark:bg-slate-900/40 p-3 pl-4 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/10 dark:shadow-none min-w-[300px]">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-violet-200 dark:shadow-none">
            <Package size={28} />
          </div>
          <div className="flex-1">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">Active Package</p>
            <p className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
              {pkg.name || "Business Plan"}
            </p>
          </div>
          <button 
            onClick={() => navigate('/upgrade-plan')}
            className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all text-violet-600 active:scale-90"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      {/* Core Resource Limits */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Core Resource Limits</h2>
          <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {resourceMetrics.map((metric, idx) => (
            <UsageCard key={idx} {...metric} t={t} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Traffic & Capacity */}
          <div className="space-y-6">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Traffic & Commercials</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {trafficMetrics.map((metric, idx) => (
                <UsageCard key={idx} {...metric} t={t} />
              ))}
            </div>
          </div>

          {/* Feature Entitlements Grid */}
          <div className="bg-white dark:bg-slate-900/20 rounded-[40px] p-8 border border-slate-100 dark:border-slate-800/60 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-[0.02] dark:opacity-[0.05] rotate-12 pointer-events-none">
              <Zap size={240} />
            </div>
            
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3">
              <div className="p-2 bg-violet-600 rounded-xl text-white">
                <ShieldCheck size={20} />
              </div>
              Advanced Capabilities
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {featureEntitlements.map((feature, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={i} 
                  className="flex items-center justify-between p-5 rounded-3xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 group hover:border-violet-200 dark:hover:border-violet-500/30 transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-2xl ${feature.enabled ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'} transition-colors duration-300`}>
                      <feature.icon size={20} />
                    </div>
                    <span className={`text-sm font-bold tracking-tight ${feature.enabled ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400 dark:text-slate-500'}`}>
                      {feature.title}
                    </span>
                  </div>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${feature.enabled ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200 dark:shadow-none' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
                    {feature.enabled ? <ShieldCheck size={14} /> : <div className="w-2 h-2 rounded-full bg-slate-400" />}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Upgrade Prompt Side-Card */}
        <div className="relative group lg:h-full">
          <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-[42px] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-slate-900 rounded-[40px] p-8 text-white h-full flex flex-col justify-between overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-10 -rotate-12 transition-transform duration-500 group-hover:scale-110">
              <TrendingUp size={160} />
            </div>
            
            <div>
              <div className="p-4 bg-white/10 rounded-[28px] w-fit mb-8 shadow-inner">
                <Zap size={32} className="text-violet-400" />
              </div>
              <h2 className="text-3xl font-black mb-4 leading-[1.1] tracking-tight">Expand Your Potential.</h2>
              <p className="text-slate-400 text-base leading-relaxed mb-8 font-medium">
                Running out of limits? Upgrade to unlock <span className="text-white">advanced AI marketing</span>, <span className="text-white">high-performance analytics</span>, and <span className="text-white">dedicated support</span>.
              </p>
            </div>
            
            <button 
              onClick={() => navigate('/upgrade-plan')}
              className="w-full bg-white text-slate-900 py-5 rounded-[24px] font-black shadow-2xl hover:bg-slate-50 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 group-active:scale-95"
            >
              Explore All Plans
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsagePage;
