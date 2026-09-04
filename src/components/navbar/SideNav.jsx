import React, { useState, useEffect, useMemo } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { navSections } from "./data";
import { hasPermission } from "@/constants/feature-permission";
import { userLoggedOut } from "@/features/auth/authSlice";
import { useGetCategoriesQuery } from "@/features/category/categoryApiSlice";
import { useGetCurrentUserQuery } from "@/features/auth/authApiSlice";
import {
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  LayoutDashboard,
  LifeBuoy,
  ArrowRight
} from "lucide-react";

/**
 * Filter navigation items based on user permissions.
 */
const getFilteredNav = (user) => {
  if (!user) return [];
  return navSections
    .map((section) => {
      // Direct link section
      if (section.link) {
        if (hasPermission(user, section.permission)) {
          return section;
        }
        return null;
      }

      return {
        id: section.id,
        title: section.title,
        tKey: section.tKey,
        icon: section.icon,
        items: section.items
          .filter(
            (item) =>
              hasPermission(user, item.permission) ||
              (item?.children?.length &&
                item.children.some((child) =>
                  hasPermission(user, child.permission),
                )),
          )
          .map((item) => ({
            label: item.title,
            tKey: item.tKey,
            to: item.link,
            icon: item.icon,
            badge: item.title === "Review" ? "02" : undefined,
            children: item?.children
              ?.filter((child) => hasPermission(user, child.permission))
              ?.map((child) => ({
                label: child.title,
                tKey: child.tKey,
                to: child.link,
                icon: child.icon,
              })),
          }))
          .filter((item) =>
            item.children?.length ? item.children.length > 0 : true,
          ),
      };
    })
    .filter((section) => section && (section.link || section.items.length > 0));
};

/**
 * Single Tree Item Component with L-Curved Branch Line
 */
function TreeItem({ item, isLast, t }) {
  const location = useLocation();
  const [isChildOpen, setIsChildOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  const isActive = item.to?.includes("?")
    ? item.to === location.pathname + location.search
    : item.to && location.pathname.startsWith(item.to);

  // Auto expand child sub-menu if active child inside
  useEffect(() => {
    if (hasChildren) {
      const isAnyChildActive = item.children.some((child) =>
        child.to?.includes("?")
          ? child.to === location.pathname + location.search
          : child.to && location.pathname.startsWith(child.to)
      );
      if (isAnyChildActive) setIsChildOpen(true);
    }
  }, [location.pathname, location.search, hasChildren, item.children]);

  const Icon = item.icon;

  return (
    <div className="relative pl-6 py-0.5">
      {/* Tree Branch L-Line Connector */}
      <div className="absolute left-[-6px] top-0 bottom-0 pointer-events-none">
        {/* Vertical Trunk Line */}
        <div className={`absolute left-0 top-0 ${isLast ? 'h-[18px]' : 'h-full'} w-px bg-slate-200 dark:bg-slate-800`} />
        {/* Curved L-Branch */}
        <div className={`w-3.5 h-[14px] border-l border-b ${isActive ? 'border-purple-600 dark:border-purple-400' : 'border-slate-200 dark:border-slate-800'} rounded-bl-lg -mt-1`} />
      </div>

      {hasChildren ? (
        <div>
          <div
            onClick={() => setIsChildOpen(!isChildOpen)}
            className="flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100/60 dark:hover:bg-slate-800/40 select-none"
          >
            <div className="flex items-center gap-2.5">
              {Icon && <Icon className="w-4 h-4 shrink-0 text-slate-500 dark:text-slate-400" strokeWidth={1.8} />}
              <span className="truncate">{item.tKey ? t(item.tKey) : item.label}</span>
            </div>
            <ChevronRight
              size={14}
              className={`text-slate-400 transition-transform duration-200 ${isChildOpen ? "rotate-90 text-purple-600" : ""}`}
            />
          </div>

          {/* Sub-children Tree */}
          {isChildOpen && (
            <div className="pl-5 relative mt-1">
              {item.children.map((subChild, subIdx) => (
                <TreeItem
                  key={subIdx}
                  item={subChild}
                  isLast={subIdx === item.children.length - 1}
                  t={t}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <NavLink
          to={item.to || "#"}
          className={({ isActive: linkActive }) => {
            const active = item.to?.includes("?")
              ? item.to === location.pathname + location.search
              : linkActive;

            return `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
              active
                ? "bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 font-extrabold shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-slate-800/40"
            }`;
          }}
        >
          {Icon && <Icon className="w-4 h-4 shrink-0 text-slate-500 dark:text-slate-400" strokeWidth={1.8} />}
          <span className="truncate">{item.tKey ? t(item.tKey) : item.label}</span>
          {item.badge && (
            <span className="ml-auto text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300">
              {item.badge}
            </span>
          )}
        </NavLink>
      )}
    </div>
  );
}

/**
 * Collapsible Accordion Section Component
 */
function CollapsibleSection({ section, isCollapsed, t }) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const Icon = section.icon;

  // Auto-expand if child is active
  useEffect(() => {
    const isChildActive = section.items.some((item) => {
      if (item.children) {
        return item.children.some((child) => {
          if (child.to?.includes("?")) {
            return child.to === location.pathname + location.search;
          }
          return child.to && location.pathname.startsWith(child.to);
        });
      }
      if (item.to?.includes("?")) {
        return item.to === location.pathname + location.search;
      }
      return item.to && location.pathname.startsWith(item.to);
    });
    if (isChildActive) setIsOpen(true);
  }, [location.pathname, location.search, section.items]);

  if (isCollapsed) {
    return (
      <div className="mb-2 px-2 flex justify-center group relative">
        <button className="p-2.5 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-500/10 text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
          {Icon && <Icon size={20} strokeWidth={1.8} />}
        </button>
        <div className="absolute left-full top-2 ml-2 bg-slate-900 text-white text-xs px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity font-bold shadow-lg">
          {section.tKey ? t(section.tKey) : section.title}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-1 px-3">
      {/* Section Accordion Header */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer select-none transition-all duration-200 group ${
          isOpen
            ? "text-slate-900 dark:text-white font-extrabold"
            : "text-slate-700 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800/40"
        }`}
      >
        <div className="flex items-center gap-3">
          {Icon && (
            <Icon
              size={19}
              strokeWidth={1.8}
              className={isOpen ? "text-purple-600 dark:text-purple-400" : "text-slate-600 dark:text-slate-400"}
            />
          )}
          <span className="text-[13px] tracking-tight font-black text-slate-900 dark:text-slate-100">
            {section.tKey ? t(section.tKey) : section.title}
          </span>
        </div>
        <ChevronDown
          size={16}
          className={`text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-purple-600 dark:text-purple-400" : ""
          }`}
        />
      </div>

      {/* Tree Line Connector Container */}
      {isOpen && (
        <div className="pl-6 relative mt-1 mb-2">
          {section.items.map((item, index) => (
            <TreeItem
              key={index}
              item={item}
              isLast={index === section.items.length - 1}
              t={t}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * SideNav Main Component
 */
export default function SideNav({ isMobileMenuOpen, setIsMobileMenuOpen }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const { data: user } = useGetCurrentUserQuery();

  const handleLogout = () => {
    dispatch(userLoggedOut());
    window.location.href = "/login";
  };

  useGetCategoriesQuery();
  const nav = useMemo(() => getFilteredNav(user), [user]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-[90] bg-slate-950/60 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-[100] lg:sticky lg:top-0 h-screen 
        ${isCollapsed ? "w-[80px]" : "w-[270px]"} 
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} 
        bg-white dark:bg-[#0c0f17] 
        border-r border-slate-200/80 dark:border-slate-800/80
        flex flex-col transition-all duration-300 ease-in-out shadow-xl lg:shadow-none font-sans`}
      >
        {/* Top Brand Header */}
        <div className={`p-4 sm:p-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/50 ${isCollapsed ? "justify-center" : ""}`}>
          <div className="flex items-center gap-3 min-w-0">
            {user?.companyLogo ? (
              <img
                src={user.companyLogo}
                className="w-9 h-9 object-cover rounded-xl shadow-md shrink-0"
                alt="Logo"
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black shadow-md shadow-purple-500/30 shrink-0">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L15 7H9L12 2ZM4 9H20V12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12V9Z" />
                </svg>
              </div>
            )}
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-black text-base leading-tight text-purple-700 dark:text-purple-400 tracking-tight truncate">
                  SquadCart
                </span>
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest truncate">
                  {user?.storeName || "SMART SYSTEM"}
                </span>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <button
              onClick={toggleSidebar}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors shrink-0"
            >
              <ChevronLeft size={18} />
            </button>
          )}
        </div>

        {/* Dashboard Active Pill Button */}
        <div className="p-3">
          {isCollapsed ? (
            <Link
              to="/"
              className={`p-3 rounded-xl flex items-center justify-center transition-all ${
                location.pathname === "/"
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-500/25"
                  : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <LayoutDashboard size={20} strokeWidth={1.8} />
            </Link>
          ) : (
            <Link
              to="/"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-black text-sm transition-all duration-300 ${
                location.pathname === "/"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-500/25"
                  : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <LayoutDashboard size={19} strokeWidth={2} />
              <span className="tracking-wide">{t("nav.dashboard") || "Dashboard"}</span>
            </Link>
          )}
        </div>

        {/* Navigation Items Scrollable Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar py-2">
          <nav className="flex flex-col gap-0.5">
            {nav.map((section) =>
              section.link ? (
                isCollapsed ? (
                  <div key={section.id} className="mb-2 px-2 flex justify-center group relative">
                    <Link
                      to={section.link}
                      className={`p-2.5 rounded-xl transition-colors ${
                        location.pathname === section.link
                          ? "bg-purple-600 text-white shadow-md"
                          : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      {section.icon && <section.icon size={20} strokeWidth={1.8} />}
                    </Link>
                    <div className="absolute left-full top-2 ml-2 bg-slate-900 text-white text-xs px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity font-bold">
                      {section.tKey ? t(section.tKey) : section.title}
                    </div>
                  </div>
                ) : (
                  <div key={section.id} className="px-3 mb-1">
                    <Link
                      to={section.link}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-black transition-all ${
                        location.pathname === section.link
                          ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800/40"
                      }`}
                    >
                      {section.icon && <section.icon size={19} strokeWidth={1.8} />}
                      <span className="tracking-tight">{section.tKey ? t(section.tKey) : section.title}</span>
                    </Link>
                  </div>
                )
              ) : (
                <CollapsibleSection
                  key={section.id}
                  section={section}
                  isCollapsed={isCollapsed}
                  t={t}
                />
              ),
            )}
          </nav>
        </div>

        {/* Bottom Help Center Card Widget */}
        {!isCollapsed && (
          <div className="px-4 py-2 mt-auto">
            <Link 
              to="/help"
              className="bg-slate-50/90 dark:bg-[#121722] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-3.5 flex items-center gap-3 hover:shadow-md transition-all duration-300 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <LifeBuoy className="w-5 h-5 animate-pulse" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-black text-slate-900 dark:text-white tracking-tight">Need help?</span>
                <span className="text-[11px] font-extrabold text-purple-600 dark:text-purple-400 flex items-center gap-1 group-hover:underline">
                  Go to Help Center <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          </div>
        )}

        {/* Footer Actions */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 font-bold text-xs transition-all ${
              isCollapsed ? "justify-center" : ""
            }`}
          >
            <LogOut size={18} />
            {!isCollapsed && <span>{t("common.logout")}</span>}
          </button>
          
          {isCollapsed && (
            <button
              onClick={toggleSidebar}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
