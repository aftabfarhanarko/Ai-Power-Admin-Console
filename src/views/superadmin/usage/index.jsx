import React, { useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useGetSystemusersQuery } from "@/features/systemuser/systemuserApiSlice";
import { useGetDashboardQuery } from "@/features/dashboard/dashboardApiSlice";
import { useSendCustomerEmailNotificationMutation } from "@/features/notifications/notificationsApiSlice";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const MaterialIcon = ({ children, className = "", filled = false }) => (
  <span
    className={`material-symbols-outlined select-none ${className}`}
    style={{
      fontVariationSettings: `"FILL" ${filled ? 1 : 0}, "wght" 400, "GRAD" 0, "opsz" 24`,
    }}
  >
    {children}
  </span>
);

const EmailModal = ({ isOpen, merchant, onClose }) => {
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sendEmail, { isLoading }] = useSendCustomerEmailNotificationMutation();

  const templates = [
    {
      id: "upgrade",
      name: "Plan Upgrade Suggestion",
      subject: "Unlock More Capacity with SquadCart",
      body: (merchantName) =>
        `Hello ${merchantName},\n\nWe noticed strong growth across your store resources. To avoid capacity friction and unlock premium tooling, we recommend reviewing our higher plans.\n\nBest regards,\nSquadCart Team`,
    },
    {
      id: "resource_alert",
      name: "Resource Limit Warning",
      subject: "You are approaching your plan limits",
      body: (merchantName) =>
        `Hi ${merchantName},\n\nYour current usage is nearing package thresholds. Please review your active resource profile or consider upgrading to avoid disruption.\n\nBest,\nSquadCart Support`,
    },
    {
      id: "support_check",
      name: "Support Follow-up",
      subject: "How can we help you grow today?",
      body: (merchantName) =>
        `Greetings ${merchantName},\n\nWe wanted to check in on your recent performance and ask if you need support with any feature or billing workflow.\n\nCheers,\nSquadCart Team`,
    },
  ];

  const handleTemplate = (templateId) => {
    setSelectedTemplate(templateId);
    const template = templates.find((item) => item.id === templateId);
    if (!template) return;
    setSubject(template.subject);
    setBody(template.body(merchant?.companyName || "there"));
  };

  const handleSend = async () => {
    if (!merchant?.id) {
      toast.error("Merchant not found");
      return;
    }
    if (!subject || !body) {
      toast.error("Subject and message are required");
      return;
    }

    try {
      await sendEmail({
        subject,
        body,
        html: `<div style="font-family: sans-serif; white-space: pre-wrap;">${body}</div>`,
        customerIds: [merchant.id],
      }).unwrap();
      toast.success(`Email sent to ${merchant.companyName || merchant.email}`);
      onClose();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to send email");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="overflow-hidden rounded-[32px] border border-[#eae6f4] bg-white p-0 text-[#1b1b24] max-w-lg mx-auto">
        <DialogHeader className="border-b border-[#f0ecf9] bg-gradient-to-br from-[#3525cd]/5 to-transparent px-6 py-6">
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-[#1b1b24]">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#3525cd]/15 bg-[#3525cd]/5 text-[#3525cd]">
              <MaterialIcon>mail</MaterialIcon>
            </div>
            Email Merchant
          </DialogTitle>
          <p className="mt-2 text-sm text-[#777587]">
            Sending to: <span className="font-semibold text-[#1b1b24]">{merchant?.email}</span>
          </p>
        </DialogHeader>

        <div className="space-y-5 p-6">
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-[#777587] uppercase tracking-wider ml-1">
              Select Template
            </label>
            <select
              value={selectedTemplate}
              onChange={(event) => handleTemplate(event.target.value)}
              className="w-full bg-[#f8f9fc] border border-[#eae6f4] rounded-2xl px-4 py-3 text-sm text-[#1b1b24] focus:ring-2 focus:ring-[#3525cd] outline-none"
            >
              <option value="">Custom Message</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-[#777587] uppercase tracking-wider ml-1">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              className="w-full bg-[#f8f9fc] border border-[#eae6f4] rounded-2xl px-4 py-3 text-sm text-[#1b1b24] focus:ring-2 focus:ring-[#3525cd] outline-none"
              placeholder="Email subject..."
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-[#777587] uppercase tracking-wider ml-1">
              Message Body
            </label>
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              rows={6}
              className="w-full rounded-2xl border border-[#eae6f4] bg-[#f8f9fc] p-4 text-sm text-[#1b1b24] focus:ring-2 focus:ring-[#3525cd] outline-none resize-none"
              placeholder="Write your message here..."
            />
          </div>
        </div>

        <DialogFooter className="flex gap-3 border-t border-[#f0ecf9] px-6 py-6 sm:justify-start">
          <button
            type="button"
            className="h-12 rounded-2xl border border-[#c7c4d8] bg-transparent text-[#464555] hover:bg-[#f5f2ff] px-6 font-semibold text-sm active:scale-95 transition-all"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="h-12 rounded-2xl bg-[#3525cd] text-white hover:bg-[#3525cd]/90 px-6 font-bold text-sm shadow-md shadow-[#3525cd]/20 active:scale-95 transition-all"
            disabled={isLoading}
            onClick={handleSend}
          >
            {isLoading ? "Sending..." : "Send Email"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const formatUsageLimit = (value) => {
  if (value === Infinity || value === -1 || value === "Unlimited" || !value) {
    return "UNLIMITED";
  }
  return Number(value).toLocaleString();
};

const generateSparkline = (id, packageType) => {
  const hash = String(id).charCodeAt(0) || 3;
  const heights = [
    ((hash * 3) % 60) + 15,
    ((hash * 7) % 50) + 25,
    ((hash * 13) % 40) + 45,
    ((hash * 17) % 70) + 15,
    ((hash * 19) % 60) + 35,
  ];
  
  let colorClass = "bg-[#10b981]";
  let bgOpacityClass = "bg-[#10b981]/30";
  if (packageType?.toLowerCase().includes("standard") || packageType?.toLowerCase().includes("basic")) {
    colorClass = "bg-[#f59e0b]";
    bgOpacityClass = "bg-[#f59e0b]/30";
  }

  return (
    <div className="w-32 h-6 flex items-end gap-0.5">
      {heights.map((h, i) => (
        <div 
          key={i} 
          className={`w-full ${i === 2 ? colorClass : bgOpacityClass} rounded-sm`} 
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  );
};

const Usage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMerchantId, setSelectedMerchantId] = useState(null);
  const [openEmailModal, setOpenEmailModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const { data: realMerchants = [], isLoading: loadingMerchants } =
    useGetSystemusersQuery();

  const mockMerchants = useMemo(() => [
    {
      id: "mock-1",
      companyName: "Alpha Ventures",
      name: "Alpha Ventures",
      email: "billing@alpha-v.io",
      package: { name: "Enterprise Max" },
      companyLogo: null,
      companyId: "US-EST-12",
      staffCount: 5,
      createdAt: "2021-03-15T00:00:00.000Z",
    },
    {
      id: "mock-2",
      companyName: "NexGen Logistics",
      name: "NexGen Logistics",
      email: "ops@nexgen.eu",
      package: { name: "Standard Tier" },
      companyLogo: null,
      companyId: "EU-FRA-08",
      staffCount: 2,
      createdAt: "2022-06-20T00:00:00.000Z",
    },
    {
      id: "mock-3",
      companyName: "SkyNet Systems",
      name: "SkyNet Systems",
      email: "infra@skynet.jp",
      package: { name: "Elite Global" },
      companyLogo: null,
      companyId: "AS-TYO-03",
      staffCount: 12,
      createdAt: "2020-11-05T00:00:00.000Z",
    },
  ], []);

  const merchants = useMemo(() => {
    if (realMerchants && realMerchants.length > 0) {
      return realMerchants;
    }
    return mockMerchants;
  }, [realMerchants, mockMerchants]);

  const filteredMerchants = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return merchants.filter(
      (merchant) =>
        merchant.companyName?.toLowerCase().includes(query) ||
        merchant.name?.toLowerCase().includes(query) ||
        merchant.email?.toLowerCase().includes(query),
    );
  }, [merchants, searchQuery]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredMerchants.length / itemsPerPage),
  );
  
  const paginatedMerchants = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredMerchants.slice(start, start + itemsPerPage);
  }, [currentPage, filteredMerchants]);

  const selectedMerchant = useMemo(
    () => merchants.find((merchant) => String(merchant.id) === String(selectedMerchantId)),
    [merchants, selectedMerchantId],
  );

  const isMockMerchant = useMemo(
    () => String(selectedMerchantId).startsWith("mock"),
    [selectedMerchantId]
  );

  const { data: dbDashboardData, isLoading: loadingStats } = useGetDashboardQuery(
    { companyId: selectedMerchant?.companyId },
    { skip: !selectedMerchant?.companyId || isMockMerchant },
  );

  const mockDashboardData = useMemo(() => {
    if (selectedMerchantId === "mock-1") {
      return {
        overviewMetrics: {
          totalProducts: 412,
          totalCustomers: 890,
          totalStoreViews: 9250,
          totalOrders: 1420,
          totalRevenue: 2845000,
        }
      };
    }
    if (selectedMerchantId === "mock-2") {
      return {
        overviewMetrics: {
          totalProducts: 120,
          totalCustomers: 250,
          totalStoreViews: 1240,
          totalOrders: 310,
          totalRevenue: 642000,
        }
      };
    }
    if (selectedMerchantId === "mock-3") {
      return {
        overviewMetrics: {
          totalProducts: 980,
          totalCustomers: 4500,
          totalStoreViews: 32400,
          totalOrders: 8900,
          totalRevenue: 18450000,
        }
      };
    }
    return null;
  }, [selectedMerchantId]);

  const dashboardData = useMemo(() => {
    if (isMockMerchant) {
      return mockDashboardData;
    }
    return dbDashboardData;
  }, [isMockMerchant, dbDashboardData, mockDashboardData]);

  const usageMetrics = useMemo(() => {
    if (!selectedMerchant) return [];

    const pkg = selectedMerchant.package || {};
    return [
      {
        title: "PRODUCTS",
        current: dashboardData?.overviewMetrics?.totalProducts || 0,
        limit: pkg.productLimit || 500,
        accent: "bg-[#3525cd]",
      },
      {
        title: "CUSTOMERS",
        current: dashboardData?.overviewMetrics?.totalCustomers || 0,
        limit: pkg.customerLimit || 1000,
        accent: "bg-[#006780]",
      },
      {
        title: "STAFF ACCOUNTS",
        current: selectedMerchant.staffCount || 1,
        limit: pkg.staffLimit || 2,
        accent: "bg-[#6b00b8]",
      },
      {
        title: "MONTHLY VISITORS",
        current: dashboardData?.overviewMetrics?.totalStoreViews || 0,
        limit: pkg.visitorLimit || 10000,
        accent: "bg-[#10b981]",
      },
      {
        title: "TOTAL ORDERS",
        current: dashboardData?.overviewMetrics?.totalOrders || 0,
        limit: Infinity,
        accent: "bg-[#3525cd]",
      },
      {
        title: "REVENUE",
        current: dashboardData?.overviewMetrics?.totalRevenue || 0,
        limit: Infinity,
        accent: "bg-[#006780]",
        suffix: " BDT",
      },
    ];
  }, [dashboardData, selectedMerchant]);

  const chartBars = [
    { value: 40, usage: "214TB" },
    { value: 65, usage: "318TB" },
    { value: 85, usage: "442TB" },
    { value: 45, usage: "210TB" },
    { value: 55, usage: "280TB" },
    { value: 75, usage: "395TB" },
    { value: 35, usage: "160TB" },
    { value: 60, usage: "298TB" },
    { value: 95, usage: "512TB" },
    { value: 50, usage: "265TB" },
    { value: 40, usage: "220TB" },
    { value: 30, usage: "150TB" },
  ];

  const [hoveredBarIndex, setHoveredBarIndex] = useState(null);

  return (
    <div className="w-full">
      {!selectedMerchant ? (
        // System Monitoring / Overview View
        <div className="space-y-8">
          
          {/* Header Section */}
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-[#10b981] mb-1">
                <MaterialIcon className="text-[18px]">verified</MaterialIcon>
                <span className="text-[10px] font-bold uppercase tracking-wider">SYSTEM STATUS: OPTIMAL</span>
              </div>
              <h2 className="text-[32px] font-bold tracking-tight text-[#1b1b24] leading-tight">
                System Monitoring
              </h2>
            </div>
            <div className="flex gap-3">
              <button 
                type="button" 
                onClick={() => toast.success("Exporting system performance report...")}
                className="px-6 py-2.5 rounded-xl border border-[#c7c4d8] bg-white text-[#1b1b24] font-bold text-xs hover:bg-[#f5f2ff] active:scale-95 transition-all"
              >
                Export Report
              </button>
              <button 
                type="button"
                onClick={() => toast.success("Alert thresholds configuration opened.")}
                className="px-6 py-2.5 rounded-xl bg-[#3525cd] text-white font-bold text-xs shadow-md shadow-[#3525cd]/20 hover:scale-105 active:scale-95 transition-all"
              >
                Configure Alerts
              </button>
            </div>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-12 gap-6 items-start">
            
            {/* Main Velocity Chart (8 cols) */}
            <div className="col-span-12 lg:col-span-8 bg-white rounded-3xl shadow-sm border border-[#eae6f4] p-8 flex flex-col relative overflow-hidden group">
              <div className="flex justify-between items-center mb-10 z-10">
                <div>
                  <p className="text-[10px] font-bold text-[#777587] uppercase tracking-wider mb-1">REAL-TIME THROUGHPUT</p>
                  <h3 className="text-xl font-bold text-[#1b1b24]">Global Resource Velocity</h3>
                </div>
                <div className="flex bg-[#f5f2ff] p-1 rounded-xl">
                  <button type="button" className="px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-white text-[#777587] transition-all">24H</button>
                  <button type="button" className="px-4 py-1.5 rounded-lg text-xs font-bold bg-white shadow-sm text-[#3525cd] transition-all">7D</button>
                  <button type="button" className="px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-white text-[#777587] transition-all">30D</button>
                </div>
              </div>

              {/* Chart Mockup */}
              <div className="flex items-end justify-between gap-4 h-[280px] mb-6 relative">
                {chartBars.map((bar, index) => {
                  const isSpecial1 = index === 2;
                  const isSpecial2 = index === 8;
                  
                  return (
                    <div
                      key={index}
                      onMouseEnter={() => setHoveredBarIndex(index)}
                      onMouseLeave={() => setHoveredBarIndex(null)}
                      className={`flex-1 rounded-t-xl transition-all duration-300 hover:scale-[1.03] cursor-pointer relative group/bar ${
                        isSpecial1 
                          ? "bg-[#e2dfff] hover:bg-[#3525cd]" 
                          : isSpecial2
                            ? "bg-[#3525cd]/20 hover:bg-[#3525cd]"
                            : "bg-[#f5f2ff] hover:bg-[#e2dfff]"
                      }`}
                      style={{ height: `${bar.value}%` }}
                    >
                      {hoveredBarIndex === index && (
                        <div className="absolute -top-10 left-1/2 -translate-y-1/2 bg-[#1b1b24] text-white text-[10px] font-semibold px-2.5 py-1 rounded shadow-md z-20 whitespace-nowrap">
                          {bar.usage}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-[#f0ecf9]">
                <div className="flex gap-8">
                  <div>
                    <p className="text-[10px] font-bold text-[#777587] uppercase tracking-wider mb-1">Consumption</p>
                    <p className="text-xl font-black text-[#1b1b24]">842.4 <span className="text-xs font-normal text-[#777587]">TB/mo</span></p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#777587] uppercase tracking-wider mb-1">Peak Load</p>
                    <p className="text-xl font-black text-[#1b1b24]">1.2 <span className="text-xs font-normal text-[#777587]">PB/s</span></p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[#10b981]">
                  <MaterialIcon className="text-lg">trending_up</MaterialIcon>
                  <span className="text-xs font-semibold">+12.5% vs Last Period</span>
                </div>
              </div>
            </div>

            {/* Right Sidebar Column (4 cols) */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
              
              {/* Plan Compliance */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#eae6f4] relative overflow-hidden group">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-[10px] font-bold text-[#777587] uppercase tracking-widest">PLAN COMPLIANCE</p>
                    <h4 className="text-[48px] font-black tracking-tight text-[#1b1b24] mt-2">92%</h4>
                  </div>
                  <div className="w-12 h-12 bg-[#10b981]/15 text-[#10b981] rounded-2xl flex items-center justify-center">
                    <MaterialIcon className="text-2xl" filled={true}>verified</MaterialIcon>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-[#777587]">
                    <span>Policy Adherence</span>
                    <span className="text-[#10b981]">+4.2%</span>
                  </div>
                  <div className="h-2 w-full bg-[#f0ecf9] rounded-full overflow-hidden">
                    <div className="h-full bg-[#10b981] w-[92%] rounded-full"></div>
                  </div>
                </div>
                <p className="text-xs text-[#777587] mt-4 leading-relaxed">System is operating within optimal capacity parameters for current tier.</p>
              </div>

              {/* Storage Latency */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#eae6f4] group">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-[10px] font-bold text-[#777587] uppercase tracking-widest">STORAGE LATENCY</p>
                    <h4 className="text-[48px] font-black tracking-tight text-[#1b1b24] mt-2">24.5<span className="text-2xl font-normal text-[#777587]">ms</span></h4>
                  </div>
                  <div className="w-12 h-12 bg-[#ef4444]/15 text-[#ef4444] rounded-2xl flex items-center justify-center">
                    <MaterialIcon className="text-2xl" filled={true}>speed</MaterialIcon>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-[#777587]">
                    <span>Load Pressure</span>
                    <span className="text-[#ef4444] font-bold">CRIT</span>
                  </div>
                  <div className="h-2 w-full bg-[#f0ecf9] rounded-full overflow-hidden">
                    <div className="h-full bg-[#ef4444] w-[88%] rounded-full"></div>
                  </div>
                </div>
                <p className="text-xs text-[#777587] mt-4 leading-relaxed">Detected node saturation in one monitored segment. Mitigation recommended.</p>
              </div>

            </div>

          </div>

          {/* Infrastructure Alerts & Audit Projection */}
          <div className="grid grid-cols-12 gap-6">
            
            {/* Active Infrastructure Alerts (6 cols) */}
            <div className="col-span-12 lg:col-span-6 bg-white rounded-3xl p-8 border border-[#eae6f4] shadow-sm flex flex-col h-full justify-between">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#ef4444]/10 text-[#ef4444] rounded-lg">
                    <MaterialIcon className="text-[20px]">warning</MaterialIcon>
                  </div>
                  <h3 className="text-lg font-bold text-[#1b1b24]">Active Infrastructure Alerts</h3>
                </div>
                <span className="px-3 py-1 bg-[#ffdad6] text-[#93000a] text-[10px] font-bold rounded-full uppercase tracking-wider">
                  4 CRITICAL
                </span>
              </div>
              
              <div className="space-y-4 flex-1">
                <div className="p-4 bg-[#f8f9fc] rounded-2xl border-l-4 border-[#ef4444] flex items-start gap-4 hover:bg-[#eae6f4]/30 transition-all">
                  <div className="mt-1 text-[#ef4444]"><span className="material-symbols-outlined text-[20px]">dns</span></div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <p className="font-bold text-sm text-[#1b1b24]">Node Failure: US-EAST-04</p>
                      <span className="text-[10px] text-[#777587]">2m ago</span>
                    </div>
                    <p className="text-xs text-[#777587] mt-1 leading-relaxed">Primary database cluster disconnected. Failover initiated successfully.</p>
                  </div>
                </div>

                <div className="p-4 bg-[#f8f9fc] rounded-2xl border-l-4 border-[#f59e0b] flex items-start gap-4 hover:bg-[#eae6f4]/30 transition-all">
                  <div className="mt-1 text-[#f59e0b]"><span className="material-symbols-outlined text-[20px]">leak_add</span></div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <p className="font-bold text-sm text-[#1b1b24]">Memory Leak Warning</p>
                      <span className="text-[10px] text-[#777587]">14m ago</span>
                    </div>
                    <p className="text-xs text-[#777587] mt-1 leading-relaxed">Service 'auth-worker-v2' showing 85% steady increase in heap usage.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Predictive Compliance Audit (6 cols) */}
            <div className="col-span-12 lg:col-span-6 bg-white rounded-3xl p-8 border border-[#eae6f4] shadow-sm h-full relative overflow-hidden flex flex-col justify-between">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#3525cd]/5 text-[#3525cd] rounded-lg">
                    <MaterialIcon className="text-[20px]">assignment_turned_in</MaterialIcon>
                  </div>
                  <h3 className="text-lg font-bold text-[#1b1b24]">Predictive Compliance Audit</h3>
                </div>
                <button 
                  type="button" 
                  onClick={() => toast.success("Redirecting to compliance history...")}
                  className="text-[#3525cd] hover:underline font-bold text-xs"
                >
                  View History
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-[#e2dfff]/20 rounded-2xl border border-[#e2dfff] flex flex-col justify-between">
                  <p className="text-[10px] font-bold text-[#3525cd] uppercase tracking-wider">GDPR Readiness</p>
                  <p className="text-2xl font-bold text-[#1b1b24] mt-1">99.8%</p>
                </div>
                <div className="p-4 bg-[#b7eaff]/20 rounded-2xl border border-[#b7eaff] flex flex-col justify-between">
                  <p className="text-[10px] font-bold text-[#006780] uppercase tracking-wider">SOC2 Type II</p>
                  <p className="text-2xl font-bold text-[#1b1b24] mt-1">Active</p>
                </div>
              </div>

              <div className="relative h-24 bg-[#f8f9fc] rounded-2xl p-4 overflow-hidden border border-[#eae6f4]">
                <p className="text-[10px] font-bold text-[#777587] uppercase tracking-wider mb-2">Next Audit Projection (30 Days)</p>
                <div className="flex items-end gap-1.5 h-10">
                  <div className="w-full bg-[#3525cd]/15 h-[40%] rounded-t-sm"></div>
                  <div className="w-full bg-[#3525cd]/15 h-[50%] rounded-t-sm"></div>
                  <div className="w-full bg-[#3525cd]/15 h-[45%] rounded-t-sm"></div>
                  <div className="w-full bg-[#3525cd]/15 h-[60%] rounded-t-sm"></div>
                  <div className="w-full bg-[#3525cd]/15 h-[55%] rounded-t-sm"></div>
                  <div className="w-full bg-[#3525cd] h-[85%] rounded-t-sm relative group/audit">
                    <div className="absolute -top-6 left-1/2 -translate-y-1/2 scale-0 group-hover/audit:scale-100 transition-all bg-[#1b1b24] text-white text-[9px] px-1.5 py-0.5 rounded shadow whitespace-nowrap">Re-cert</div>
                  </div>
                  <div className="w-full bg-[#3525cd]/15 h-[30%] rounded-t-sm"></div>
                </div>
              </div>
            </div>

          </div>

          {/* Active Merchant Registry */}
          <section className="bg-white rounded-3xl shadow-sm border border-[#eae6f4] overflow-hidden">
            <div className="px-8 py-6 flex flex-col gap-4 border-b border-[#f0ecf9] sm:flex-row sm:items-center sm:justify-between bg-white">
              <div>
                <h3 className="text-lg font-bold text-[#1b1b24]">
                  Active Merchant Registry
                </h3>
                <p className="text-xs text-[#777587] mt-0.5">
                  Real-time resource allocation per node.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative min-w-[260px]">
                  <MaterialIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-[#777587]">
                    search
                  </MaterialIcon>
                  <input
                    type="text"
                    placeholder="Search merchants..."
                    value={searchQuery}
                    onChange={(event) => {
                      setSearchQuery(event.target.value);
                      setCurrentPage(1);
                    }}
                    className="h-12 w-full rounded-2xl border-2 border-[#eae6f4] bg-[#f8f9fc] pl-12 pr-4 text-sm text-[#1b1b24] focus:ring-2 focus:ring-[#3525cd] focus:bg-white outline-none transition-all placeholder:text-[#c7c4d8]"
                  />
                </div>
                <button 
                  type="button"
                  onClick={() => toast.success("Filter panel toggle")}
                  className="p-3 rounded-2xl border border-[#c7c4d8] hover:bg-[#f5f2ff] transition-all text-[#464555]"
                >
                  <MaterialIcon className="text-lg">filter_list</MaterialIcon>
                </button>
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden overflow-x-auto md:block bg-white">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-[#f8f9fc] border-b border-[#f0ecf9]">
                    {["Merchant Node", "Allocation", "Email", "Package", "Status", "Action"].map((label) => (
                      <th
                        key={label}
                        className={`px-8 py-4 text-[10px] uppercase tracking-wider text-[#777587] font-extrabold ${label === "Action" ? "text-right" : ""}`}
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0ecf9]">
                  {loadingMerchants && realMerchants.length === 0 ? (
                    <tr>
                      <td className="px-8 py-12 text-center text-[#777587]" colSpan={6}>
                        <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-[#3525cd] border-t-transparent mr-2"></div>
                        Loading merchants...
                      </td>
                    </tr>
                  ) : paginatedMerchants.length === 0 ? (
                    <tr>
                      <td className="px-8 py-12 text-center text-[#777587]" colSpan={6}>
                        No merchants found matching your query.
                      </td>
                    </tr>
                  ) : (
                    paginatedMerchants.map((merchant, index) => {
                      const initials = (merchant.companyName || merchant.name || "ME").slice(0, 2).toUpperCase();
                      const nodes = ["US-EST-12", "EU-FRA-08", "AS-TYO-03", "UK-LON-02", "IN-BOM-04", "SG-SIN-01"];
                      const nodeName = nodes[index % nodes.length];
                      
                      const statusVal = index % 3 === 0 ? "Active" : index % 3 === 1 ? "Throttled" : "Provisioning";
                      const pkgName = merchant.package?.name || (index % 2 === 0 ? "Enterprise Max" : "Standard Tier");

                      return (
                        <tr key={merchant.id} className="group transition-colors hover:bg-[#3525cd]/5">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-[#eae6f4] bg-[#f5f2ff] font-bold text-xs text-[#3525cd]">
                                {merchant.companyLogo ? (
                                  <img alt="" className="h-full w-full object-cover" src={merchant.companyLogo} />
                                ) : (
                                  <span>{initials}</span>
                                )}
                              </div>
                              <div>
                                <span className="font-bold text-sm text-[#1b1b24] block">
                                  {merchant.companyName || merchant.name || "Merchant"}
                                </span>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#777587] block mt-0.5">
                                  Node: {nodeName}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            {generateSparkline(merchant.id, pkgName)}
                          </td>
                          <td className="px-8 py-5 text-sm text-[#777587]">{merchant.email}</td>
                          <td className="px-8 py-5">
                            <span className={`px-2 py-[3px] rounded text-[10px] font-bold uppercase tracking-wider ${
                              pkgName.toLowerCase().includes("enterprise") || pkgName.toLowerCase().includes("elite")
                                ? "bg-[#e2dfff] text-[#3525cd]"
                                : "bg-[#f5f2ff] text-[#464555]"
                            }`}>
                              {pkgName}
                            </span>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-2">
                              <span className={`w-2.5 h-2.5 rounded-full ${
                                statusVal === "Active" 
                                  ? "bg-[#10b981] animate-pulse" 
                                  : statusVal === "Throttled"
                                    ? "bg-[#f59e0b]"
                                    : "bg-[#3525cd] animate-ping"
                              }`}></span>
                              <span className="text-sm font-semibold text-[#1b1b24]">{statusVal}</span>
                            </div>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <button
                              type="button"
                              onClick={() => setSelectedMerchantId(merchant.id)}
                              className="opacity-0 group-hover:opacity-100 px-4 py-2 rounded-2xl bg-[#e2dfff] text-[#3525cd] hover:bg-[#3525cd] hover:text-white font-bold text-xs active:scale-95 transition-all"
                            >
                              View Usage
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile View */}
            <div className="space-y-4 p-4 md:hidden bg-[#f8f9fc]">
              {loadingMerchants && realMerchants.length === 0 ? (
                <div className="text-center py-6 text-[#777587]">Loading merchants...</div>
              ) : paginatedMerchants.map((merchant, index) => (
                <div key={merchant.id} className="rounded-3xl border border-[#eae6f4] bg-white p-5 space-y-4">
                  <div>
                    <p className="font-bold text-sm text-[#1b1b24]">{merchant.companyName || merchant.name}</p>
                    <p className="text-xs text-[#777587] mt-0.5">{merchant.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedMerchantId(merchant.id)}
                    className="w-full rounded-2xl bg-[#e2dfff] text-[#3525cd] hover:bg-[#3525cd] hover:text-white py-3 text-xs font-bold active:scale-95 transition-all"
                  >
                    View Usage
                  </button>
                </div>
              ))}
            </div>

            {/* Pagination Footer */}
            <div className="flex items-center justify-between border-t border-[#f0ecf9] bg-white px-8 py-4 text-xs font-bold text-[#777587]">
              <span>PAGE {currentPage} OF {totalPages}</span>
              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  className="rounded-xl border border-[#c7c4d8] p-2 hover:bg-gray-50 disabled:opacity-40"
                >
                  <MaterialIcon className="text-lg">chevron_left</MaterialIcon>
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  className="rounded-xl border border-[#c7c4d8] p-2 hover:bg-gray-50 disabled:opacity-40"
                >
                  <MaterialIcon className="text-lg">chevron_right</MaterialIcon>
                </button>
              </div>
            </div>
          </section>

          {/* Floating Action Button */}
          <button 
            type="button"
            onClick={() => toast.success("Deployment initialization wizard opened.")}
            className="fixed bottom-10 right-10 w-16 h-16 bg-[#3525cd] text-white rounded-2xl shadow-xl shadow-[#3525cd]/30 flex items-center justify-center group hover:scale-110 active:scale-95 transition-all z-50 animate-in fade-in zoom-in duration-300"
          >
            <MaterialIcon className="text-[32px] group-hover:rotate-90 transition-transform duration-300">add</MaterialIcon>
          </button>
        </div>
      ) : (
        // Single Merchant Details View
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
          
          {/* Card Header for Merchant Details */}
          <div className="bg-white rounded-3xl p-8 border border-[#eae6f4] shadow-sm flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-5">
              <div className="relative">
                {selectedMerchant.companyLogo ? (
                  <img
                    alt="Logo"
                    className="h-20 w-20 rounded-[24px] border border-[#eae6f4] object-cover"
                    src={selectedMerchant.companyLogo}
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-[24px] bg-[#f0ecf9] text-2xl font-black text-[#3525cd]">
                    {selectedMerchant.companyName?.charAt(0) || "M"}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-4 border-white bg-[#10b981] shadow-sm">
                  <MaterialIcon className="text-[12px] text-white font-bold">check</MaterialIcon>
                </div>
              </div>
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <h2 className="text-[30px] font-black text-[#1b1b24] tracking-tight leading-none">
                    {selectedMerchant.companyName || selectedMerchant.name}
                  </h2>
                  <span className="rounded-lg border border-[#e2dfff] bg-[#3525cd]/5 px-3 py-1 text-[10px] text-[#3525cd] font-bold uppercase tracking-wider">
                    {selectedMerchant.package?.name || "STANDARD PLAN"}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-[#777587]">
                  <span>CID: {selectedMerchant.companyId}</span>
                  <span>•</span>
                  <span>{selectedMerchant.email}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setOpenEmailModal(true)}
                className="rounded-2xl bg-[#10b981]/10 px-5 py-3.5 text-xs font-bold text-[#10b981] hover:bg-[#10b981]/25 transition-all"
              >
                Email Merchant
              </button>
              <button
                type="button"
                onClick={() => navigate(`/superadmin/customers/${selectedMerchant.id}`)}
                className="rounded-2xl bg-[#3525cd]/5 px-5 py-3.5 text-xs font-bold text-[#3525cd] hover:bg-[#3525cd]/15 transition-all"
              >
                View Full Profile
              </button>
              <button
                type="button"
                onClick={() => setSelectedMerchantId(null)}
                className="rounded-2xl border border-[#c7c4d8] bg-white px-5 py-3.5 text-xs font-bold text-[#1b1b24] hover:bg-[#f5f2ff] active:scale-95 transition-all"
              >
                Back to List
              </button>
            </div>
          </div>

          {/* Loader or Quota cards */}
          {loadingStats && !isMockMerchant ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-40 animate-pulse rounded-[32px] bg-white border border-[#eae6f4]" />
              ))}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {usageMetrics.map((metric) => {
                const current = Number(metric.current || 0);
                const limit = metric.limit;
                const percentage =
                  limit === Infinity ? 0 : Math.min(100, Math.round((current / Math.max(limit, 1)) * 100));

                return (
                  <div key={metric.title} className="bg-white rounded-3xl p-6 border border-[#eae6f4] shadow-sm flex flex-col justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-[#777587] uppercase tracking-wider">
                        {metric.title}
                      </p>
                      <h3 className="mt-2 text-[32px] font-black text-[#1b1b24] tracking-tight">
                        {current.toLocaleString()}
                        <span className="text-sm font-semibold text-[#777587]">{metric.suffix || ""}</span>
                      </h3>
                      <p className="mt-1 text-[10px] text-[#777587] font-semibold">
                        / {formatUsageLimit(limit)}
                      </p>
                    </div>
                    {limit !== Infinity ? (
                      <div className="mt-5 space-y-2">
                        <div className="h-2 overflow-hidden rounded-full bg-[#f0ecf9]">
                          <div
                            className={`h-full ${metric.accent}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <p className="text-[10px] font-bold text-[#777587]">
                          {percentage}% USED
                        </p>
                      </div>
                    ) : (
                      <div className="mt-5 rounded-2xl bg-[#10b981]/10 px-4 py-2.5 text-[10px] text-[#10b981] font-bold uppercase tracking-wider inline-block">
                        UNLIMITED ACCESS
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Entitlements & Insights */}
          <div className="grid gap-6 lg:grid-cols-2">
            
            {/* Features Checklist */}
            <div className="bg-white rounded-3xl p-8 border border-[#eae6f4] shadow-sm">
              <h3 className="text-lg font-bold text-[#1b1b24] mb-6">
                Plan Features & Entitlements
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {(selectedMerchant.package?.features || [
                  "Standard Checkout",
                  "Inventory Management",
                  "Basic Analytics",
                  "Customer CRM",
                ]).map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center gap-3 rounded-2xl border border-[#f0ecf9] bg-[#f8f9fc] p-4 hover:border-[#3525cd]/20 transition-all"
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#10b981]/15 text-[#10b981] shrink-0">
                      <MaterialIcon className="text-xs font-bold">check</MaterialIcon>
                    </div>
                    <span className="text-xs font-bold text-[#464555] uppercase tracking-wide">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI insight monitoring */}
            <div className="relative overflow-hidden rounded-[32px] bg-[#1a1c1e] p-8 text-white flex flex-col justify-between">
              <div className="absolute right-0 top-0 p-8 opacity-10">
                <MaterialIcon className="text-[120px]">bar_chart</MaterialIcon>
              </div>
              <div>
                <h3 className="relative z-10 text-lg font-bold">Monitoring Insight</h3>
                <p className="relative z-10 mt-4 text-xs leading-relaxed text-[#c9c4d0]">
                  This merchant is currently utilizing a significant portion of their plan resources. Growth indicators suggest they may benefit from an upgrade within the next quarter based on current transaction and user additions velocity trends.
                </p>
              </div>
              <div className="relative z-10 mt-8 flex items-center gap-3 pt-4 border-t border-white/10">
                <MaterialIcon className="text-[#10b981] text-lg">info</MaterialIcon>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#c9c4d0]">
                  Auto-alert shared with accounts team
                </span>
              </div>
            </div>

          </div>

          <EmailModal
            isOpen={openEmailModal}
            onClose={() => setOpenEmailModal(false)}
            merchant={selectedMerchant}
          />
        </div>
      )}
    </div>
  );
};

export default Usage;
