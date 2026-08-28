import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { Menu } from "lucide-react";

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

const SuperAdminTopNavbar = ({ setIsMobileMenuOpen, variant = "dark" }) => {
  const location = useLocation();
  const { user } = useSelector((state) => state.superadminAuth);
  const [now, setNow] = useState(new Date());
  const isEnterprise = variant === "enterprise";

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const pageTitle = useMemo(() => {
    const path = location.pathname;
    if (path === "/superadmin") return "Dashboard";
    if (path.includes("/earnings")) return "Earnings";
    if (path.includes("/customers")) return "Customers";
    if (path.includes("/packages")) return "Packages";
    if (path.includes("/themes")) return "Themes";
    if (path.includes("/support")) return "Support";
    if (path.includes("/usage")) return "Usage";
    if (path.includes("/invoices")) return "Invoices";
    if (path.includes("/website-management")) return "Website";
    if (path.includes("/superadmins")) return "Admins";
    if (path.includes("/profile")) return "Profile";
    return "Command Center";
  }, [location.pathname]);

  const initials = useMemo(() => {
    const source = user?.name || user?.email || "SC";
    return source
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("") || "SC";
  }, [user]);

  const enterpriseAvatar = user?.avatar || user?.image || user?.photoURL;

  return (
    <header className={isEnterprise ? "sticky top-0 right-0 z-40 w-full border-b border-white/70 bg-white/80 shadow-sm backdrop-blur-md" : "w-full"}>
      <div className={isEnterprise ? "flex h-20 items-center justify-between px-8 lg:px-8" : "mb-12 flex items-center justify-between px-4"}>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className={`lg:hidden ${isEnterprise ? "rounded-xl p-2 text-[#777587] hover:bg-[#f0ecf9] hover:text-[#1b1b24]" : "rounded-2xl border border-white/10 bg-white/[0.03] p-2.5 text-[#c9c4d7] transition-colors hover:bg-white/5 hover:text-white"}`}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div>
            {isEnterprise ? (
              <div className="flex items-center gap-8">
                <span className="text-[20px] font-black text-[#1b1b24]">Squadlog Enterprise</span>
                <div className="relative hidden md:block">
                  <MaterialIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-[#777587]">search</MaterialIcon>
                  <input
                    type="text"
                    placeholder="Search operations..."
                    className="w-64 rounded-full border-none bg-[#f5f2ff] py-2 pl-10 pr-4 text-sm text-[#1b1b24] outline-none focus:ring-2 focus:ring-[#3525cd]"
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="mb-1 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#cabeff] shadow-[0_0_10px_#cabeff]" />
                  <span
                    className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#cabeff]"
                    style={{ fontFamily: '"JetBrains Mono", monospace' }}
                  >
                    Live Command Center
                  </span>
                </div>
                <h1 className="text-[32px] font-black tracking-tight text-[#eaf1ff]">
                  {pageTitle}
                </h1>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 md:gap-6">
          {isEnterprise ? (
            <>
              <div className="hidden items-center gap-4 border-r border-[#c7c4d8] px-6 md:flex">
                <a className="border-b-2 border-[#3525cd] pb-1 text-[12px] font-bold text-[#3525cd]">Global View</a>
                <a className="text-[12px] font-bold text-[#464555] hover:text-[#3525cd]">Marketplace</a>
                <a className="text-[12px] font-bold text-[#464555] hover:text-[#3525cd]">Reports</a>
              </div>
              <button type="button" className="relative p-2 text-[#464555] transition-all hover:text-[#3525cd]">
                <MaterialIcon>notifications</MaterialIcon>
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#ef4444]" />
              </button>
              <button type="button" className="p-2 text-[#464555] transition-all hover:text-[#3525cd]">
                <MaterialIcon>history</MaterialIcon>
              </button>
              <div className="h-8 w-px bg-[#c7c4d8]/70" />
              {enterpriseAvatar ? (
                <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-[#e2dfff] bg-[#e2dfff]">
                  <img src={enterpriseAvatar} alt="User Avatar" className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-[#e2dfff] bg-[#e2dfff] font-bold text-[#3525cd]">
                  {initials}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="hidden items-center gap-4 rounded-2xl border border-[#484554]/20 bg-[#23263a]/50 px-6 py-3 md:flex">
                <div className="text-right">
                  <p
                    className="text-[11px] uppercase tracking-[0.08em] text-[#797586]"
                    style={{ fontFamily: '"JetBrains Mono", monospace' }}
                  >
                    System Time
                  </p>
                  <div className="text-xl font-bold tabular-nums text-[#cabeff]">
                    {now.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: false,
                    })}
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.08] bg-[rgba(255,255,255,0.03)] text-[#eaf1ff] shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] backdrop-blur-[20px] transition-colors hover:border-[#6042d6]/40 hover:bg-[rgba(255,255,255,0.05)] hover:text-[#cabeff]"
              >
                <MaterialIcon>notifications</MaterialIcon>
              </button>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#cabeff] to-[#451ebb] text-xs font-bold text-[#1c0062]">
                {initials}
              </div>
            </>
          )}
          {!isEnterprise && (
            <></>
          )}
        </div>
      </div>
    </header>
  );
};

export default SuperAdminTopNavbar;
