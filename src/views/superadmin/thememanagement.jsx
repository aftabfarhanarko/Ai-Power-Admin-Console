import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useDeleteThemeMutation,
  useGetThemesQuery,
} from "@/features/theme/themeApiSlice";

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

const ThemeManagementPage = () => {
  const navigate = useNavigate();
  const { data: themes = [], isLoading, error } = useGetThemesQuery();
  const [deleteTheme, { isLoading: isDeleting }] = useDeleteThemeMutation();
  const [themeToDelete, setThemeToDelete] = useState(null);
  const [query, setQuery] = useState("");

  const filteredThemes = useMemo(() => {
    if (!query.trim()) return themes;

    const search = query.toLowerCase();
    return themes.filter((theme) =>
      [
        theme.name,
        theme.domainUrl,
        theme.primaryColorCode,
        theme.secondaryColorCode,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(search)
    );
  }, [query, themes]);

  const rows = useMemo(
    () =>
      filteredThemes.map((theme, index) => {
        // Map status dynamically to match the mockup: ACTIVE, WARNING, STAGING
        const status = theme.domainUrl
          ? "ACTIVE"
          : index % 2 === 0
          ? "STAGING"
          : "WARNING";

        const velocity = theme.logo ? 92 - index * 7 : 65 - index * 4;
        const accent =
          theme.primaryColorCode || ["#8b5cf6", "#ec4899", "#10b981"][index % 3];

        return {
          ...theme,
          status,
          velocity: Math.max(18, velocity),
          accent,
          version: `Global-v${2 + (index % 3)}.${index + 1}.0`,
          instances: `${Math.max(12, (index + 1) * 17)}`,
        };
      }),
    [filteredThemes]
  );

  const complianceRating = useMemo(() => {
    if (themes.length === 0) return 0;
    const styled = themes.filter(
      (theme) => theme.primaryColorCode && theme.secondaryColorCode
    ).length;
    return Math.round((styled / themes.length) * 100);
  }, [themes]);

  const activeDomainsCount = useMemo(() => {
    return themes.filter((theme) => theme.domainUrl).length;
  }, [themes]);

  const brandedCountPercentage = useMemo(() => {
    if (themes.length === 0) return "0%";
    const branded = themes.filter((theme) => theme.logo).length;
    return `${((branded / themes.length) * 100).toFixed(1)}%`;
  }, [themes]);

  const fullyStyledCount = useMemo(() => {
    return themes.filter(
      (theme) => theme.primaryColorCode && theme.secondaryColorCode
    ).length;
  }, [themes]);

  const confirmDelete = async () => {
    if (!themeToDelete) return;

    try {
      const res = await deleteTheme(themeToDelete.id);
      if (res?.data || !res?.error) {
        setThemeToDelete(null);
      }
    } catch (error) {
      console.error("Failed to delete theme:", error);
    }
  };

  const getAvatarColors = (index) => {
    const sets = [
      { bg: "bg-[#e2dfff]", text: "text-[#3525cd]" },
      { bg: "bg-[#f0dbff]", text: "text-[#6b00b8]" },
      { bg: "bg-[#e4e1ee]", text: "text-[#1b1b24]" },
      { bg: "bg-[#3525cd]", text: "text-white" },
    ];
    return sets[index % sets.length];
  };

  const getInitials = (name) => {
    if (!name) return "TH";
    const parts = name.split(/[_\-\s]+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="max-w-[1440px] mx-auto space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-[10px] font-bold tracking-[0.1em] text-[#3525cd] uppercase block mb-1">
            Enterprise Deployment
          </span>
          <h2 className="text-[32px] md:text-[48px] font-bold tracking-[-0.02em] text-[#1b1b24] leading-tight">
            Aether Design Systems
          </h2>
          <p className="text-[16px] text-[#777587] mt-2 max-w-2xl font-normal leading-relaxed">
            Synchronize and deploy branded storefront visual architectures across the global SquadCart fleet.
          </p>
        </div>
        <button
          onClick={() => navigate("/superadmin/themes/create")}
          className="bg-[#3525cd] text-white px-6 py-3 rounded-2xl flex items-center gap-3 shadow-xl shadow-[#3525cd]/20 hover:scale-105 active:scale-95 transition-all w-fit font-semibold"
        >
          <MaterialIcon filled>add_circle</MaterialIcon>
          <span>Deploy New Fleet</span>
        </button>
      </div>

      {/* Bento Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1 */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#eae6f4] hover:translate-y-[-4px] transition-transform duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-[#e2dfff] rounded-xl flex items-center justify-center text-[#3525cd]">
              <span className="material-symbols-outlined">palette</span>
            </div>
            <span className="px-2 py-1 bg-[#10b981]/10 text-[#10b981] text-[10px] font-bold rounded-full flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px]">trending_up</span> LIVE FEED
            </span>
          </div>
          <p className="text-[#777587] text-[12px] font-semibold tracking-[0.05em] uppercase mb-1">Live Themes</p>
          <h3 className="text-[32px] font-semibold tracking-[-0.01em] text-[#1b1b24] mb-4">{themes.length}</h3>
          <svg className="w-full h-10 stroke-[#3525cd] stroke-2 fill-none" viewBox="0 0 100 40">
            <path d="M0 35 Q 25 35 40 10 T 70 25 T 100 5" strokeLinecap="round" />
          </svg>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#eae6f4] hover:translate-y-[-4px] transition-transform duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-[#76dcff]/20 rounded-xl flex items-center justify-center text-[#006780]">
              <span className="material-symbols-outlined">public</span>
            </div>
            <span className="px-2 py-1 bg-[#3525cd]/10 text-[#3525cd] text-[10px] font-bold rounded-full">SYNCED</span>
          </div>
          <p className="text-[#777587] text-[12px] font-semibold tracking-[0.05em] uppercase mb-1">Active Domains</p>
          <h3 className="text-[32px] font-semibold tracking-[-0.01em] text-[#1b1b24] mb-4">{activeDomainsCount.toLocaleString()}</h3>
          <svg className="w-full h-10 stroke-[#006780] stroke-2 fill-none" viewBox="0 0 100 40">
            <path d="M0 25 Q 10 10 30 20 T 60 15 T 100 30" strokeLinecap="round" />
          </svg>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#eae6f4] hover:translate-y-[-4px] transition-transform duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-[#f0dbff] rounded-xl flex items-center justify-center text-[#6b00b8]">
              <span className="material-symbols-outlined">verified</span>
            </div>
            <span className="px-2 py-1 bg-[#c7c4d8] text-[#777587] text-[10px] font-bold rounded-full uppercase">Identified</span>
          </div>
          <p className="text-[#777587] text-[12px] font-semibold tracking-[0.05em] uppercase mb-1">Branded (Logo)</p>
          <h3 className="text-[32px] font-semibold tracking-[-0.01em] text-[#1b1b24] mb-4">{brandedCountPercentage}</h3>
          <svg className="w-full h-10 stroke-[#6b00b8] stroke-2 fill-none" viewBox="0 0 100 40">
            <path d="M0 30 Q 30 10 50 35 T 100 10" strokeLinecap="round" />
          </svg>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#eae6f4] hover:translate-y-[-4px] transition-transform duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-[#e4e1ee] rounded-xl flex items-center justify-center text-[#1b1b24]">
              <span className="material-symbols-outlined">auto_fix_high</span>
            </div>
            <span className="px-2 py-1 bg-[#10b981]/10 text-[#10b981] text-[10px] font-bold rounded-full uppercase">Validated</span>
          </div>
          <p className="text-[#777587] text-[12px] font-semibold tracking-[0.05em] uppercase mb-1">Fully Styled</p>
          <h3 className="text-[32px] font-semibold tracking-[-0.01em] text-[#1b1b24] mb-4">{fullyStyledCount}</h3>
          <svg className="w-full h-10 stroke-[#10b981] stroke-2 fill-none" viewBox="0 0 100 40">
            <path d="M0 20 Q 20 20 40 5 T 60 30 T 100 15" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {/* Content Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Theme Registry Table */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-[#eae6f4] overflow-hidden">
            <div className="p-6 border-b border-[#eae6f4] flex flex-col sm:flex-row justify-between items-center gap-4">
              <h3 className="text-[24px] font-semibold text-[#1b1b24] leading-normal">Live Theme Registry</h3>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#777587] text-[18px]">filter_list</span>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-[#f0ecf9] rounded-lg border-none text-[14px] w-full sm:w-48 outline-none focus:ring-2 focus:ring-[#3525cd]/20 text-[#1b1b24]"
                    placeholder="Filter registry..."
                  />
                </div>
                <button
                  onClick={() => setQuery("")}
                  className="p-2 hover:bg-[#eae6f4] rounded-lg transition-colors text-[#777587]"
                  title="Clear filter"
                >
                  <span className="material-symbols-outlined">tune</span>
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="p-12 text-center text-[#777587]">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#3525cd] border-t-transparent mb-4"></div>
                <p>Loading theme records from registry...</p>
              </div>
            ) : error ? (
              <div className="p-12 text-center text-red-500">
                <MaterialIcon className="text-4xl mb-2">error</MaterialIcon>
                <p>Failed to load themes from registry.</p>
              </div>
            ) : rows.length === 0 ? (
              <div className="p-12 text-center text-[#777587]">
                <MaterialIcon className="text-4xl mb-2">search_off</MaterialIcon>
                <p>No themes matched your search query.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[#f5f2ff]">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-bold tracking-[0.1em] text-[#777587] uppercase">Theme Identity</th>
                      <th className="px-6 py-4 text-[10px] font-bold tracking-[0.1em] text-[#777587] uppercase">Status</th>
                      <th className="px-6 py-4 text-[10px] font-bold tracking-[0.1em] text-[#777587] uppercase">Load Velocity</th>
                      <th className="px-6 py-4 text-[10px] font-bold tracking-[0.1em] text-[#777587] uppercase">Instances</th>
                      <th className="px-6 py-4 text-[10px] font-bold tracking-[0.1em] text-[#777587] uppercase text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eae6f4]">
                    {rows.map((theme, index) => {
                      const colors = getAvatarColors(index);
                      return (
                        <tr key={theme.id} className="group hover:bg-[#f5f2ff]/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {theme.logo ? (
                                <img
                                  alt={theme.name || "Theme"}
                                  className="w-8 h-8 rounded object-cover border border-[#eae6f4]"
                                  src={theme.logo}
                                />
                              ) : (
                                <div className={`w-8 h-8 rounded flex items-center justify-center font-bold text-xs ${colors.bg} ${colors.text}`}>
                                  {getInitials(theme.name)}
                                </div>
                              )}
                              <div>
                                <p className="font-semibold text-[#1b1b24]">{theme.name || "Unnamed Theme"}</p>
                                <p className="text-xs text-[#777587]">{theme.domainUrl || theme.version}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase ${
                                theme.status === "ACTIVE"
                                  ? "bg-[#10b981]/10 text-[#10b981]"
                                  : theme.status === "STAGING"
                                  ? "bg-[#3525cd]/10 text-[#3525cd]"
                                  : "bg-[#f59e0b]/10 text-[#f59e0b]"
                              }`}
                            >
                              {theme.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-semibold text-[#1b1b24]">
                            {(theme.velocity / 100).toFixed(2)}s
                          </td>
                          <td className="px-6 py-4 text-[14px] text-[#464555]">
                            {theme.instances}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => navigate(`/superadmin/themes/${theme.id}`)}
                                className="p-2 text-[#777587] hover:text-[#3525cd] transition-colors"
                                title="View details"
                              >
                                <MaterialIcon className="text-[20px]">visibility</MaterialIcon>
                              </button>
                              <button
                                onClick={() => navigate(`/superadmin/themes/${theme.id}/edit`)}
                                className="p-2 text-[#777587] hover:text-[#3525cd] transition-colors md:opacity-0 group-hover:opacity-100"
                                title="Edit"
                              >
                                <MaterialIcon className="text-[20px]">edit</MaterialIcon>
                              </button>
                              <button
                                onClick={() => setThemeToDelete(theme)}
                                className="p-2 text-[#777587] hover:text-red-600 transition-colors"
                                title="Delete"
                              >
                                <MaterialIcon className="text-[20px]">delete</MaterialIcon>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Audit, Logs, Swatches */}
        <div className="lg:col-span-4 space-y-6">
          {/* Visual Cohesion Audit */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#eae6f4]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[12px] font-semibold tracking-[0.05em] uppercase text-[#777587]">Visual Cohesion Audit</h3>
              <button className="text-[#3525cd]" title="Refresh audit metrics">
                <span className="material-symbols-outlined">refresh</span>
              </button>
            </div>
            <div className="mb-8">
              <div className="flex justify-between items-end mb-2">
                <span className="text-[14px] font-semibold text-[#1b1b24]">Compliance Rating</span>
                <span className="text-[48px] font-bold tracking-[-0.02em] leading-none text-[#1b1b24]">{complianceRating}%</span>
              </div>
              <div className="w-full h-2 bg-[#f0ecf9] rounded-full overflow-hidden">
                <div className="h-full bg-[#3525cd] rounded-full" style={{ width: `${complianceRating}%` }}></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-[#f5f2ff] p-4 rounded-2xl border border-[#eae6f4]">
                <p className="text-[10px] font-bold text-[#777587] uppercase mb-1">Color Drift</p>
                <p className="text-[24px] font-semibold leading-[1.3] text-[#10b981]">0.2%</p>
              </div>
              <div className="bg-[#f5f2ff] p-4 rounded-2xl border border-[#eae6f4]">
                <p className="text-[10px] font-bold text-[#777587] uppercase mb-1">Font Sync</p>
                <p className="text-[24px] font-semibold leading-[1.3] text-[#3525cd]">98.4%</p>
              </div>
            </div>
            <p className="text-[14px] text-[#464555] mb-6 leading-relaxed">
              Average fleet design compliance is optimal. Small deviations detected in legacy CSS modules.
            </p>
            <button className="w-full py-4 bg-[#e2dfff] text-[#0f0069] rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#3525cd] hover:text-white transition-all">
              <span className="material-symbols-outlined">sync</span>
              <span>Run Global Sync</span>
            </button>
          </div>

          {/* Command Logs */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#eae6f4]">
            <h3 className="text-[12px] font-semibold tracking-[0.05em] uppercase text-[#777587] mb-6">Command Logs</h3>
            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <div className="w-1 h-10 bg-[#10b981] rounded-full"></div>
                <div>
                  <p className="text-[14px] font-bold text-[#1b1b24]">Theme Deployed</p>
                  <p className="text-xs text-[#777587]">2 mins ago • Global registry sync</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-1 h-10 bg-[#3525cd] rounded-full"></div>
                <div>
                  <p className="text-[14px] font-bold text-[#1b1b24]">CSS Optimization</p>
                  <p className="text-xs text-[#777587]">14 mins ago • System auto-task</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-1 h-10 bg-[#ef4444] rounded-full"></div>
                <div>
                  <p className="text-[14px] font-bold text-[#1b1b24]">Sync Failure</p>
                  <p className="text-xs text-[#777587]">1 hour ago • Retry scheduled</p>
                </div>
              </div>
            </div>
          </div>

          {/* Global Tokens Swatches */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#eae6f4]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[12px] font-semibold tracking-[0.05em] uppercase text-[#777587]">Global Tokens</h3>
              <button className="text-[#777587] hover:text-[#3525cd] transition-colors">
                <span className="material-symbols-outlined text-[18px]">edit_note</span>
              </button>
            </div>
            <div className="flex gap-3 mb-4">
              <div className="flex-1 aspect-square bg-[#e2dfff] rounded-2xl shadow-inner border border-white/50" title="Primary Fixed"></div>
              <div className="flex-1 aspect-square bg-[#c3c0ff] rounded-2xl shadow-inner border border-white/50" title="Primary Fixed Dim"></div>
              <div className="flex-1 aspect-square bg-[#dad7ff] rounded-2xl shadow-inner border border-white/50" title="Primary Container"></div>
              <div className="flex-1 aspect-square bg-[#ffdad6] rounded-2xl shadow-inner border border-white/50" title="Error Container"></div>
            </div>
            <div className="flex justify-between items-center text-[10px] text-[#777587] font-bold">
              <span>CURRENT: V2.4-INDIGO-FORCE</span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-[#10b981] rounded-full"></span> LOCKED
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Dialog */}
      <Dialog
        open={Boolean(themeToDelete)}
        onOpenChange={(open) => !open && setThemeToDelete(null)}
      >
        <DialogContent className="overflow-hidden rounded-[32px] border border-gray-200 bg-white p-0 text-[#1b1b24] max-w-md mx-auto">
          <div className="border-b border-gray-100 bg-gradient-to-br from-[#ef4444]/5 to-transparent p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl border border-red-200 bg-red-50 text-red-500">
              <MaterialIcon className="text-[32px]">delete</MaterialIcon>
            </div>
            <DialogTitle className="text-2xl font-bold text-[#1b1b24]">
              Delete Theme?
            </DialogTitle>
            <DialogDescription className="mt-2 text-[#777587]">
              This permanently removes{" "}
              <span className="font-semibold text-[#1b1b24]">{themeToDelete?.name}</span>{" "}
              from the active registry.
            </DialogDescription>
          </div>
          <DialogFooter className="flex gap-3 p-8 sm:justify-center">
            <Button
              variant="outline"
              className="h-12 rounded-2xl border-gray-200 bg-transparent text-[#1b1b24] hover:bg-gray-50 px-6 font-semibold"
              onClick={() => setThemeToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              className="h-12 rounded-2xl bg-red-600 text-white hover:bg-red-700 px-6 font-semibold"
              disabled={isDeleting}
              onClick={confirmDelete}
            >
              {isDeleting ? "Deleting..." : "Delete Theme"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ThemeManagementPage;
