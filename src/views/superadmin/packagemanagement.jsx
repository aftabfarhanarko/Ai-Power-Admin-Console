import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  useDeletePackageMutation,
  useGetPackagesQuery,
} from "@/features/package/packageApiSlice";

const formatMoney = (amount) =>
  `$${Number(amount || 0).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

const iconCycle = ["package_2", "database", "shield", "widgets"];
const langCycle = ["Node.js", "Python", "Go", "Java"];

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

const PackageManagementPage = () => {
  const navigate = useNavigate();
  const { data: packages = [], isLoading, error } = useGetPackagesQuery();
  const [deletePackage, { isLoading: isDeleting }] = useDeletePackageMutation();
  const [packageToDelete, setPackageToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const stats = useMemo(() => {
    const totalPackages = packages.length;
    const activeDeployments = packages.filter((item) => item.themeId).length;
    const avgYield =
      totalPackages > 0
        ? packages.reduce((sum, item) => sum + Number(item.price || 0), 0) /
          totalPackages
        : 0;

    return {
      total: totalPackages,
      active: activeDeployments,
      avgYield: formatMoney(avgYield),
    };
  }, [packages]);

  const filteredPackages = useMemo(() => {
    if (!searchQuery.trim()) return packages;

    const query = searchQuery.toLowerCase();

    return packages.filter((item) => {
      const haystack = [
        item.name,
        item.description,
        ...(item.features || []).map((feature) => feature.name || feature),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [packages, searchQuery]);

  const rows = useMemo(
    () =>
      filteredPackages.map((item, index) => {
        const features = item.features || [];
        const featureLabels = features
          .slice(0, 2)
          .map((feature) => (typeof feature === "string" ? feature : feature.name))
          .filter(Boolean);
        const remainingCount = Math.max(0, features.length - featureLabels.length);

        const status = item.isFeatured
          ? "Active"
          : item.themeId
          ? "Updating"
          : "Warning";

        const capacity = item.isFeatured ? 64 : item.themeId ? 88 : 22;
        const icon = iconCycle[index % iconCycle.length];
        const lang = langCycle[index % langCycle.length];

        return {
          id: item.id,
          item,
          icon,
          lang,
          title: item.name || "Unnamed Package",
          updatedAt:
            item.updatedAt || item.createdAt
              ? new Date(item.updatedAt || item.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              : "Updated 4h ago",
          featureLabels,
          remainingCount,
          status,
          capacity,
          yieldValue: formatMoney(item.price),
        };
      }),
    [filteredPackages]
  );

  const confirmDelete = async () => {
    if (!packageToDelete?.id) return;
    try {
      const res = await deletePackage(packageToDelete.id);
      if (res?.data || !res?.error) {
        setPackageToDelete(null);
      }
    } catch (err) {
      console.error("Failed to delete package:", err);
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto space-y-8">
      {/* Page Header */}
      <section className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="text-[12px] font-semibold tracking-[0.05em] text-[#3525cd] uppercase">System Assets</span>
            <span className="text-[#777587]">/</span>
            <span className="text-[12px] font-semibold tracking-[0.05em] text-[#464555] uppercase font-mono">Deployment Plans</span>
          </div>
          <h1 className="text-[32px] md:text-[48px] font-extrabold tracking-[-0.02em] text-[#1b1b24] leading-tight">
            Package Management
          </h1>
        </div>

        <div className="flex flex-wrap gap-4">
          <button className="inline-flex items-center gap-2 rounded-2xl border border-[#c7c4d8] bg-white px-6 py-3 text-[12px] font-semibold tracking-[0.05em] text-[#1b1b24] hover:bg-[#f0ecf9] transition-all">
            <MaterialIcon className="text-lg">filter_alt</MaterialIcon>
            <span>Advanced Filters</span>
          </button>
          <button
            onClick={() => navigate("/superadmin/packages/create")}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#3525cd] px-6 py-3 text-[12px] font-bold text-white shadow-lg shadow-[#3525cd]/20 hover:scale-105 active:scale-95 transition-all"
            type="button"
          >
            <MaterialIcon filled>add_circle</MaterialIcon>
            <span>Create Package</span>
          </button>
        </div>
      </section>

      {/* Bento Executive Stats Grid */}
      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Fleet Health */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#eae6f4] hover:translate-y-[-2px] transition-transform duration-300 flex items-center justify-between">
          <div>
            <p className="text-[12px] font-semibold text-[#777587] mb-1">Fleet Health</p>
            <h3 className="text-[32px] font-bold text-[#1b1b24]">98.4%</h3>
            <div className="mt-2 flex items-center gap-1 text-[#10b981]">
              <span className="material-symbols-outlined !text-[16px]">trending_up</span>
              <span className="text-[12px] font-bold">+2.1%</span>
            </div>
          </div>
          <div className="relative w-16 h-16">
            <svg className="w-full h-full" viewBox="0 0 36 36">
              <path className="text-gray-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="100, 100" strokeWidth="3"></path>
              <path className="text-[#3525cd]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="98, 100" strokeLinecap="round" strokeWidth="3"></path>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#3525cd] !text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            </div>
          </div>
        </div>

        {/* Card 2: Success Rate */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#eae6f4] hover:translate-y-[-2px] transition-transform duration-300">
          <p className="text-[12px] font-semibold text-[#777587] mb-1">Success Rate</p>
          <h3 className="text-[32px] font-bold text-[#1b1b24]">99.2%</h3>
          <div className="mt-4 flex items-end gap-2">
            <div className="flex gap-1 h-8 items-end">
              <div className="w-1.5 bg-[#e2dfff] h-[40%] rounded-full"></div>
              <div className="w-1.5 bg-[#e2dfff] h-[60%] rounded-full"></div>
              <div className="w-1.5 bg-[#e2dfff] h-[45%] rounded-full"></div>
              <div className="w-1.5 bg-[#e2dfff] h-[80%] rounded-full"></div>
              <div className="w-1.5 bg-[#3525cd] h-full rounded-full"></div>
            </div>
            <span className="text-[12px] font-bold text-[#10b981] mb-1">Top Tier</span>
          </div>
        </div>

        {/* Card 3: Avg. Deployment Time */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#eae6f4] hover:translate-y-[-2px] transition-transform duration-300">
          <p className="text-[12px] font-semibold text-[#777587] mb-1">Avg. Deployment Time</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-[32px] font-bold text-[#1b1b24]">1m 24s</h3>
            <span className="text-[10px] font-bold bg-[#ffdad6] text-[#ef4444] px-2 py-0.5 rounded-full">-12s</span>
          </div>
          <div className="mt-4 h-8 w-full">
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 20">
              <path className="text-[#3525cd] opacity-30" d="M0 20 Q 25 5, 50 15 T 100 10" fill="none" stroke="currentColor" strokeWidth="2"></path>
            </svg>
          </div>
        </div>

        {/* Card 4: Active Nodes */}
        <div className="bg-[#4f46e5] p-6 rounded-3xl shadow-lg shadow-[#3525cd]/20 text-white hover:translate-y-[-2px] transition-transform duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[12px] font-semibold opacity-80 mb-1">Active Nodes</p>
              <h3 className="text-[32px] font-bold">{stats.active + 1388}</h3>
            </div>
            <div className="p-2 bg-white/20 rounded-xl">
              <span className="material-symbols-outlined !text-[24px]">hub</span>
            </div>
          </div>
          <div className="mt-4 flex -space-x-2">
            <div className="w-6 h-6 rounded-full border-2 border-[#4f46e5] bg-gray-200 text-gray-800 flex items-center justify-center text-[10px] font-bold">UK</div>
            <div className="w-6 h-6 rounded-full border-2 border-[#4f46e5] bg-gray-200 text-gray-800 flex items-center justify-center text-[10px] font-bold">US</div>
            <div className="w-6 h-6 rounded-full border-2 border-[#4f46e5] bg-gray-200 text-gray-800 flex items-center justify-center text-[10px] font-bold">JP</div>
            <div className="w-6 h-6 rounded-full border-2 border-[#4f46e5] bg-gray-200 text-gray-800 flex items-center justify-center text-[10px] font-bold">DE</div>
          </div>
        </div>
      </section>

      {/* Main Performance Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Performance Line Chart Card (col-span-8) */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl shadow-sm border border-[#eae6f4] h-[400px] flex flex-col relative overflow-hidden group">
          <div className="flex justify-between items-center mb-6 relative z-10">
            <div>
              <h4 className="text-[20px] font-semibold text-[#1b1b24]">Deployment Success vs Velocity</h4>
              <p className="text-[14px] text-[#777587]">Aggregate performance metrics over 30 days</p>
            </div>
            <div className="flex bg-[#f0ecf9] rounded-xl p-1 gap-1">
              <button className="px-4 py-1.5 rounded-lg bg-white font-semibold text-[12px] shadow-sm text-[#3525cd]">Monthly</button>
              <button className="px-4 py-1.5 rounded-lg font-semibold text-[12px] text-[#464555] hover:bg-white/40">Weekly</button>
            </div>
          </div>
          <div className="flex-1 relative">
            <div className="absolute inset-x-0 bottom-8 h-48 bg-gradient-to-t from-[#3525cd]/5 to-transparent"></div>
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 300">
              <path className="opacity-10" d="M0,300 L0,200 C150,150 250,280 400,180 C550,80 650,150 800,100 C950,50 1000,80 L1000,300 Z" fill="url(#grad1)"></path>
              <path d="M0,200 C150,150 250,280 400,180 C550,80 650,150 800,100 C950,50 1000,80" fill="none" stroke="#3525cd" strokeLinecap="round" strokeWidth="4"></path>
              <path d="M0,250 C200,230 350,260 500,220 C650,180 800,240 1000,190" fill="none" stroke="#6cd3f7" strokeDasharray="8 4" strokeLinecap="round" strokeWidth="2"></path>
              <defs>
                <linearGradient id="grad1" x1="0%" x2="0%" y1="0%" y2="100%">
                  <stop offset="0%" style={{ stopColor: "#3525cd", stopOpacity: 1 }}></stop>
                  <stop offset="100%" style={{ stopColor: "#3525cd", stopOpacity: 0 }}></stop>
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute bottom-0 inset-x-0 flex justify-between text-[10px] font-bold text-[#777587] uppercase tracking-widest px-4">
              <span>Oct 01</span>
              <span>Oct 08</span>
              <span>Oct 15</span>
              <span>Oct 22</span>
              <span>Oct 30</span>
            </div>
          </div>
        </div>

        {/* AI Insights Strategic Sidebar (col-span-4) */}
        <div className="lg:col-span-4 bg-[#f5f2ff] p-6 rounded-3xl border border-[#3525cd]/20 relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#3525cd]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              <h4 className="text-[20px] font-semibold text-[#1b1b24]">AI Insights</h4>
            </div>
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-2xl shadow-sm border-l-4 border-[#3525cd]">
                <p className="text-[14px] text-gray-700 leading-snug">
                  Package <span className="font-bold">'auth-v3'</span> could be optimized to save <span className="text-[#3525cd] font-bold">12% compute</span> by consolidating dependencies.
                </p>
                <button className="mt-2 text-[#3525cd] font-semibold text-[12px] flex items-center gap-1 hover:underline">
                  <span>Apply Auto-Fix</span>
                  <span className="material-symbols-outlined !text-[14px]">arrow_forward</span>
                </button>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border-l-4 border-[#10b981]">
                <p className="text-[14px] text-gray-700 leading-snug">
                  <span className="text-[#10b981] font-bold">Efficiency Alert:</span> Deployments to 'Region-EU' are 15% faster using the peering logic.
                </p>
              </div>
            </div>
          </div>
          <div className="pt-6 border-t border-gray-200 mt-6">
            <h5 className="text-[10px] font-bold text-[#777587] uppercase tracking-widest mb-3">Deployment Timeline</h5>
            <div className="space-y-4 border-l-2 border-[#e2dfff] ml-2 pl-4">
              <div className="relative">
                <div className="absolute -left-[21px] top-1 w-2 h-2 bg-[#3525cd] rounded-full"></div>
                <p className="text-[12px] font-bold text-[#1b1b24]">System Core v2.4.1</p>
                <p className="text-[10px] text-[#777587]">Deployed 2m ago • Stable</p>
              </div>
              <div className="relative opacity-60">
                <div className="absolute -left-[21px] top-1 w-2 h-2 bg-gray-400 rounded-full"></div>
                <p className="text-[12px] font-semibold text-[#464555]">Data Engine</p>
                <p className="text-[10px] text-[#777587]">Deployed 1h ago • Stable</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Optimized Repository List Table */}
      <section className="bg-white rounded-3xl shadow-sm border border-[#eae6f4] overflow-hidden">
        <div className="px-6 py-4 flex flex-wrap justify-between items-center gap-4 bg-gray-50 border-b border-[#f0ecf9]">
          <h4 className="text-[20px] font-semibold text-[#1b1b24]">Optimized Repository List</h4>
          <div className="flex gap-3">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
              <input
                type="text"
                placeholder="Filter packages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white border border-[#c7c4d8] rounded-xl text-body-md focus:ring-2 focus:ring-primary/20 w-64 text-[#1b1b24]"
              />
            </div>
            <button className="px-4 py-2 bg-white border border-[#c7c4d8] rounded-xl text-[12px] font-semibold text-gray-700 flex items-center gap-2 hover:bg-gray-50 transition-colors">
              <span className="material-symbols-outlined !text-[18px]">filter_list</span>
              <span>Filter</span>
            </button>
            <button className="px-4 py-2 bg-[#3525cd] text-white rounded-xl text-[12px] font-semibold flex items-center gap-2 hover:opacity-90 shadow-md shadow-primary/10 transition-opacity">
              <span className="material-symbols-outlined !text-[18px]">download</span>
              <span>Export Report</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#f5f2ff]">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold tracking-[0.1em] text-[#777587] uppercase">Package Name</th>
                <th className="px-6 py-4 text-[10px] font-bold tracking-[0.1em] text-[#777587] uppercase">Version</th>
                <th className="px-6 py-4 text-[10px] font-bold tracking-[0.1em] text-[#777587] uppercase">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold tracking-[0.1em] text-[#777587] uppercase">Resource Utilization</th>
                <th className="px-6 py-4 text-[10px] font-bold tracking-[0.1em] text-[#777587] uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0ecf9]">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-[#777587]">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-[#3525cd] border-t-transparent mr-2"></div>
                    Loading packages from repository...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-red-500 font-semibold">
                    Failed to load packages. Please check connection.
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-[#777587]">
                    No packages match your search filter.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="hover:bg-[#f5f2ff]/30 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#3525cd]/10 flex items-center justify-center text-[#3525cd]">
                          <span className="material-symbols-outlined !text-[20px]">{row.icon}</span>
                        </div>
                        <div>
                          <p className="text-[14px] font-bold text-[#1b1b24]">{row.title}</p>
                          <p className="text-[10px] text-[#777587] font-semibold">
                            {row.lang} • Last updated {row.updatedAt}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="font-mono bg-gray-150 text-gray-700 px-2 py-0.5 rounded text-xs font-semibold">
                        v2.{row.id}.0
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase ${
                          row.status === "Active"
                            ? "bg-[#10b981]/10 text-[#10b981]"
                            : row.status === "Updating"
                            ? "bg-[#f59e0b]/10 text-[#f59e0b]"
                            : "bg-[#ef4444]/10 text-[#ef4444]"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          row.status === "Active" ? "bg-[#10b981] animate-pulse" : row.status === "Updating" ? "bg-[#f59e0b]" : "bg-[#ef4444]"
                        }`}></span>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="w-48">
                        <div className="flex justify-between mb-1">
                          <span className="text-[10px] font-bold text-[#777587] uppercase">{row.capacity}% capacity</span>
                        </div>
                        <div className="h-1.5 w-full bg-[#f0ecf9] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              row.status === "Active" ? "bg-[#3525cd]" : row.status === "Updating" ? "bg-[#f59e0b]" : "bg-[#ef4444]"
                            }`}
                            style={{ width: `${row.capacity}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => navigate(`/superadmin/packages/${row.id}/edit`)}
                          className="px-3 py-1.5 hover:bg-[#3525cd]/10 text-[#3525cd] rounded-lg text-[12px] font-bold transition-all"
                        >
                          Manage
                        </button>
                        <button
                          onClick={() => navigate(`/superadmin/packages/${row.id}`)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-900 transition-colors"
                          title="Terminal View"
                        >
                          <span className="material-symbols-outlined !text-[20px]">terminal</span>
                        </button>
                        <button
                          onClick={() => setPackageToDelete(row.item)}
                          className="p-1.5 hover:bg-red-50 rounded-lg text-gray-500 hover:text-red-600 transition-colors"
                          title="Delete Package"
                        >
                          <span className="material-symbols-outlined !text-[20px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Import Config Banner Operations */}
      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 pb-12">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#eae6f4] bg-gradient-to-br from-[#3525cd]/5 to-transparent flex flex-col justify-between min-h-[160px]">
          <div>
            <h5 className="text-[20px] font-semibold text-[#1b1b24]">Operational Insights</h5>
            <p className="mt-2 text-sm text-[#777587]">
              The system has identified {packages.length * 2 + 3} packages that can be optimized for lower compute costs without affecting throughput.
            </p>
          </div>
          <button className="mt-4 inline-flex items-center gap-2 text-[11px] font-bold text-[#3525cd] uppercase tracking-wider hover:translate-x-1 transition-transform w-fit">
            <span>Run Optimization Probe</span>
            <MaterialIcon className="text-sm">arrow_forward</MaterialIcon>
          </button>
        </div>

        <div className="relative border-2 border-dashed border-[#3525cd]/30 bg-white hover:bg-[#f5f2ff] hover:border-[#3525cd] p-6 rounded-[32px] transition-all cursor-pointer flex items-center justify-center min-h-[160px] text-center group">
          <div>
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-gray-100 bg-gray-50 group-hover:scale-110 transition-transform">
              <MaterialIcon className="text-gray-500">upload_file</MaterialIcon>
            </div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#777587] font-bold">
              Drop config to import
            </p>
          </div>
        </div>
      </section>

      {/* Delete Dialog */}
      <Dialog
        open={Boolean(packageToDelete)}
        onOpenChange={(open) => !open && setPackageToDelete(null)}
      >
        <DialogContent className="overflow-hidden rounded-[32px] border border-gray-200 bg-white p-0 text-[#1b1b24] max-w-md mx-auto">
          <div className="border-b border-gray-100 bg-gradient-to-br from-[#ef4444]/5 to-transparent p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl border border-red-200 bg-red-50 text-red-500">
              <MaterialIcon className="text-[32px]">delete</MaterialIcon>
            </div>
            <DialogTitle className="text-2xl font-bold text-[#1b1b24]">
              Delete Package?
            </DialogTitle>
            <DialogDescription className="mt-2 text-[#777587]">
              This permanently removes{" "}
              <span className="font-semibold text-[#1b1b24]">{packageToDelete?.name}</span>{" "}
              from the active registry.
            </DialogDescription>
          </div>
          <DialogFooter className="flex gap-3 p-8 sm:justify-center">
            <Button
              variant="outline"
              className="h-12 rounded-2xl border-gray-200 bg-transparent text-[#1b1b24] hover:bg-gray-50 px-6 font-semibold"
              onClick={() => setPackageToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              className="h-12 rounded-2xl bg-red-600 text-white hover:bg-red-700 px-6 font-semibold"
              disabled={isDeleting}
              onClick={confirmDelete}
            >
              {isDeleting ? "Deleting..." : "Delete Package"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PackageManagementPage;
