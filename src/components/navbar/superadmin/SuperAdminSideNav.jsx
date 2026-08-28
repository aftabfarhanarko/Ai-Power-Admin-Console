import React, { useMemo, useState, useEffect } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { X, ChevronRight, LogOut } from "lucide-react";
import toast from "react-hot-toast";
import { superadminLoggedOut } from "@/features/superadminAuth/superadminAuthSlice";
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Database,
  Activity,
  Settings,
  Palette,
  Receipt,
  LifeBuoy,
  Shield,
  User,
  AlertTriangle,
  Lock,
} from "lucide-react";

const MaterialIcon = ({
  children,
  className = "",
  filled = false,
  style,
}) => (
  <span
    className={`material-symbols-outlined ${className}`}
    style={{
      fontVariationSettings: `"FILL" ${filled ? 1 : 0}, "wght" 400, "GRAD" 0, "opsz" 24`,
      ...style,
    }}
  >
    {children}
  </span>
);

const isLinkActive = (target, location) => {
  if (!target) return false;
  if (target === "/superadmin") {
    return location.pathname === "/superadmin";
  }
  return (
    location.pathname === target ||
    location.pathname.startsWith(`${target}/`)
  );
};

const SidebarLink = ({ item, onNavigate }) => {
  const location = useLocation();
  const active = isLinkActive(item.to, location);
  const Icon = item.icon;

  return (
    <NavLink
      to={item.to}
      onClick={onNavigate}
      className={`group flex items-center gap-3 rounded-2xl px-4 py-3 transition ${
        active
          ? "bg-[#f2efff] text-[#3525cd] shadow-[inset_0_0_0_1px_rgba(53,37,205,0.08)]"
          : "text-[#5f5f6f] hover:bg-[#faf8ff] hover:text-[#3525cd]"
      }`}
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition ${
          active
            ? "bg-[#3525cd] text-white shadow-[0_8px_16px_rgba(53,37,205,0.22)]"
            : "bg-[#f5f3f9] text-[#777587] group-hover:bg-white group-hover:text-[#3525cd]"
        }`}
      >
        {Icon ? <Icon size={17} strokeWidth={1.8} /> : null}
      </div>
      <span className={`min-w-0 flex-1 truncate text-[14px] ${active ? "font-bold text-[#1b1b24]" : "font-semibold"}`}>
        {item.label}
      </span>
      {active ? (
        <ChevronRight size={16} className="text-[#3525cd]" />
      ) : null}
    </NavLink>
  );
};

const SuperAdminSideNav = ({ isMobileMenuOpen, setIsMobileMenuOpen, variant = "dark" }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.superadminAuth);
  const isEnterprise = variant === "enterprise";
  const [isProfileExpanded, setIsProfileExpanded] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    if (setIsMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  }, [location.pathname, setIsMobileMenuOpen]);

  const initials = useMemo(() => {
    const source = user?.name || user?.email || "SC";
    return source
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("") || "SC";
  }, [user]);

  const handleLogout = () => {
    dispatch(superadminLoggedOut());
    toast.success("Logged out");
    navigate("/superadmin/login");
  };

  const closeMobileMenu = () => {
    if (setIsMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  const enterpriseNavSections = [
    {
      title: "Main",
      items: [
        { label: "Dashboard", to: "/superadmin", icon: LayoutDashboard },
        { label: "Analytics", to: "/superadmin/earnings", icon: BarChart3 },
        { label: "Project Health", to: "/superadmin/usage", icon: Activity },
      ],
    },
    {
      title: "Management",
      items: [
        { label: "Customers", to: "/superadmin/customers", icon: Users },
        { label: "Resource Planning", to: "/superadmin/packages", icon: Database },
        { label: "Invoices", to: "/superadmin/invoices", icon: Receipt },
        { label: "Themes", to: "/superadmin/themes", icon: Palette },
      ],
    },
    {
      title: "Admin",
      items: [
        { label: "Support Tickets", to: "/superadmin/support", icon: LifeBuoy },
        { label: "System Admins", to: "/superadmin/superadmins", icon: Shield },
        { label: "Status & Incidents", to: "/superadmin/status", icon: AlertTriangle },
        { label: "Security & GDPR", to: "/superadmin/security", icon: Lock },
        { label: "Profile", to: "/superadmin/profile", icon: User },
        { label: "Settings", to: "/superadmin/website-management", icon: Settings },
      ],
    },
  ];

  const profileName = user?.name || "Super Admin";
  const profileEmail = user?.email || "admin@squadcart.app";

  if (isEnterprise) {
    return (
      <>
        {/* Mobile Backdrop */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm lg:hidden transition-opacity duration-300"
            onClick={closeMobileMenu}
          />
        )}

        <aside
          className={`fixed inset-y-0 left-0 z-[100] flex h-screen w-[320px] shrink-0 flex-col border-r border-[#ece8f4] bg-[#fcfcfe] shadow-[0_14px_40px_rgba(17,24,39,0.08)] transition-all duration-300 lg:sticky lg:top-0 lg:shadow-none ${
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          {/* Header box */}
          <div className="px-5 py-4">
            <div className="rounded-[22px] border border-[#efebf7] bg-white px-3 py-3 shadow-[0_10px_30px_rgba(17,24,39,0.04)]">
              <div className="flex items-center gap-2.5">
                <Link
                  to="/superadmin"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-2.5"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[18px] bg-[#3525cd] text-white shadow-[0_10px_20px_rgba(53,37,205,0.24)]">
                    <MaterialIcon filled className="text-[20px]">
                      admin_panel_settings
                    </MaterialIcon>
                  </div>
                  <div className="min-w-0 pt-0.5">
                    <h2 className="truncate text-[16px] font-bold leading-tight text-[#1b1b24]">
                      Squadlog
                    </h2>
                    <p className="truncate text-[11px] font-medium leading-tight text-[#8b8a97]">
                      SuperAdmin Console
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Scrollable menu */}
          <div className="flex-1 overflow-y-auto pb-4">
            <div className="space-y-6">
              {enterpriseNavSections.map((section, idx) => (
                <div key={idx} className="space-y-2 px-4">
                  <div className="px-2">
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#9a98a9]">
                      {section.title}
                    </p>
                  </div>
                  <div className="space-y-1">
                    {section.items.map((item) => (
                      <SidebarLink
                        key={item.to}
                        item={item}
                        onNavigate={closeMobileMenu}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Profile card */}
          <div className="px-5 pb-3.5">
            <div className="rounded-[22px] border border-[#efebf7] bg-white p-2 shadow-[0_10px_30px_rgba(17,24,39,0.04)]">
              {!isProfileExpanded ? (
                <div className="rounded-[18px] bg-[#faf8ff] p-1.5">
                  <div className="flex items-start gap-2">
                    <div className="h-9 w-9 overflow-hidden rounded-full border border-[#ece8f4] bg-white flex items-center justify-center font-bold text-[#3525cd] text-xs">
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 pt-0.5">
                          <p className="truncate text-[12px] font-bold leading-tight text-[#1b1b24]">
                            {profileName}
                          </p>
                          <p className="truncate text-[10px] leading-tight text-[#8b8a97]">
                            {profileEmail}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsProfileExpanded(true)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-[#e3deef] bg-white text-[#777587] transition hover:bg-[#f5f2ff] hover:text-[#3525cd]"
                        >
                          <MaterialIcon className="text-[16px]">unfold_more</MaterialIcon>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-1.5 flex items-center justify-between text-[8px] font-semibold text-[#8b8a97]">
                    <span>Platform Load</span>
                    <span>12%</span>
                  </div>
                  <div className="mt-1 h-1 overflow-hidden rounded-full bg-white">
                    <div className="h-full w-[12%] rounded-full bg-[#10b981]" />
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div className="rounded-[18px] bg-[#faf8ff] p-1.5">
                    <div className="flex items-center gap-2">
                      <div className="h-9 w-9 overflow-hidden rounded-full border border-[#ece8f4] bg-white flex items-center justify-center font-bold text-[#3525cd] text-xs">
                        {initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 pt-0.5">
                            <p className="truncate text-[12px] font-bold leading-tight text-[#1b1b24]">
                              {profileName}
                            </p>
                            <p className="truncate text-[10px] leading-tight text-[#8b8a97]">
                              {profileEmail}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setIsProfileExpanded(false)}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-[#e3deef] bg-white text-[#777587] transition hover:bg-[#f5f2ff] hover:text-[#3525cd]"
                          >
                            <MaterialIcon className="text-[16px]">unfold_less</MaterialIcon>
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="mt-1.5 flex items-center justify-between text-[8px] font-semibold text-[#8b8a97]">
                      <span>Platform Load</span>
                      <span>12%</span>
                    </div>
                    <div className="mt-1 h-1 overflow-hidden rounded-full bg-white">
                      <div className="h-full w-[12%] rounded-full bg-[#10b981]" />
                    </div>
                    <div className="mt-2 space-y-1.5 border-t border-[#ece8f4] pt-2">
                      <button
                        type="button"
                        onClick={() => navigate("/superadmin/usage")}
                        className="flex w-full items-center justify-center gap-1.5 rounded-2xl bg-[#3525cd] px-4 py-1.5 text-[12px] font-bold text-white shadow-[0_10px_20px_rgba(53,37,205,0.24)] transition hover:scale-[0.99] border-none cursor-pointer"
                      >
                        <MaterialIcon className="text-[15px]">rocket_launch</MaterialIcon>
                        Run Diagnostics
                      </button>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#ffd9d6] px-4 py-1.5 text-[12px] font-semibold text-[#ef4444] transition hover:bg-[#fff1ef] cursor-pointer"
                      >
                        <LogOut size={15} />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>
      </>
    );
  }

  // Dark variant fallback
  const darkLinks = [
    { label: "Dashboard", to: "/superadmin", icon: "dashboard", end: true },
    { label: "Customers", to: "/superadmin/customers", icon: "group" },
    { label: "Earnings", to: "/superadmin/earnings", icon: "payments" },
    { label: "Packages", to: "/superadmin/packages", icon: "inventory_2" },
  ];

  return (
    <>
      {/* Mobile Backdrop for Dark variant */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={closeMobileMenu}
        />
      )}

      <aside
        className={`group fixed left-0 top-0 z-50 h-[calc(100vh-40px)] w-[80px] overflow-hidden rounded-[24px] border border-white/[0.08] bg-[rgba(255,255,255,0.03)] px-0 py-0 shadow-[0_8px_32px_rgba(0,0,0,0.37)] backdrop-blur-[20px] transition-all duration-300 hover:w-[240px] hover:border-[#6042d6]/40 hover:bg-[rgba(255,255,255,0.05)] lg:flex m-5 ${
          isMobileMenuOpen ? "translate-x-0 !flex" : "-translate-x-full lg:translate-x-0 lg:flex"
        }`}
      >
        <div className="flex h-full w-full flex-col items-center overflow-hidden py-8">
          <div className="mb-12 flex w-full items-center justify-center px-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#451ebb] text-[#e6deff] shadow-lg shadow-[#cabeff]/20">
              <MaterialIcon className="text-3xl" filled>bolt</MaterialIcon>
            </div>
            <div className="ml-4 whitespace-nowrap opacity-0 transition-opacity group-hover:opacity-100">
              <p className="text-xl font-extrabold text-[#eaf1ff]">SquadCart</p>
            </div>
          </div>

          <div className="flex-1 w-full overflow-y-auto px-3">
            <nav className="space-y-4">
              {darkLinks.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={closeMobileMenu}
                  className={({ isActive }) =>
                    `flex items-center gap-4 rounded-2xl p-3.5 transition-all ${
                      isActive
                        ? "bg-[#cabeff]/10 text-[#cabeff]"
                        : "text-[#797586] hover:bg-white/5 hover:text-[#eaf1ff]"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <MaterialIcon className="shrink-0 text-2xl" filled={isActive}>{item.icon}</MaterialIcon>
                      <span className={`whitespace-nowrap transition-opacity opacity-0 group-hover:opacity-100 ${isActive ? "font-bold" : "font-medium"}`}>
                        {item.label}
                      </span>
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="mt-auto w-full px-3">
            <div className="pt-4 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-4 rounded-2xl p-3.5 transition-all text-[#ffb4ab]/70 hover:bg-[#ffb4ab]/5 hover:text-[#ffb4ab]"
              >
                <MaterialIcon className="text-[28px]">logout</MaterialIcon>
                <span className="whitespace-nowrap font-bold transition-opacity opacity-0 group-hover:opacity-100">
                  Exit
                </span>
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default SuperAdminSideNav;
