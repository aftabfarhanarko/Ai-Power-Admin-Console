import React, { useEffect, useMemo, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu, LogOut, User, Bell, ChevronDown, CheckCircle2, ShieldAlert, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

import { useGetSystemusersQuery } from "@/features/systemuser/systemuserApiSlice";
import { useGetHelpQuery } from "@/features/help/helpApiSlice";
import { superadminLoggedOut } from "@/features/superadminAuth/superadminAuthSlice";

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
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.superadminAuth);
  const [now, setNow] = useState(new Date());
  const isEnterprise = variant === "enterprise";

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Notification state
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Profile menu state
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const searchRef = useRef(null);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Data fetching for search and notifications
  const { data: merchants = [] } = useGetSystemusersQuery();
  const { data: tickets = [] } = useGetHelpQuery();

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtered customer/merchant list for search
  const searchedMerchants = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return merchants.filter((m) =>
      [m.name, m.companyName, m.email, m.companyId]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query)
    ).slice(0, 5);
  }, [searchQuery, merchants]);

  // Active pending notifications from support tickets
  const pendingTickets = useMemo(() => {
    return tickets.filter((t) => t.status === "pending" || !t.status).slice(0, 5);
  }, [tickets]);

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
    const source = user?.name || user?.email || "SA";
    return source
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("") || "SA";
  }, [user]);

  const enterpriseAvatar = user?.avatar || user?.image || user?.photoURL;

  const handleLogout = () => {
    dispatch(superadminLoggedOut());
    toast.success("Logged out successfully");
    navigate("/superadmin/login");
  };

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
                
                {/* Search Bar with Customer List Dropdown */}
                <div ref={searchRef} className="relative hidden md:block">
                  <MaterialIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-[#777587]">search</MaterialIcon>
                  <input
                    type="text"
                    value={searchQuery}
                    onFocus={() => setIsSearchOpen(true)}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setIsSearchOpen(true);
                    }}
                    placeholder="Search customers or stores..."
                    className="w-72 rounded-full border border-transparent bg-[#f5f2ff] py-2 pl-10 pr-4 text-sm text-[#1b1b24] outline-none transition-all focus:border-[#3525cd]/30 focus:bg-white focus:ring-2 focus:ring-[#3525cd]/20"
                  />

                  {/* Customer Search Dropdown */}
                  {isSearchOpen && (
                    <div className="absolute left-0 top-full mt-2 w-80 rounded-2xl border border-[#eae6f4] bg-white p-3 shadow-xl z-50">
                      <div className="flex items-center justify-between px-2 pb-2 border-b border-[#f0ecf9]">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#777587]">Customer Results</span>
                        <span className="text-[10px] font-bold text-[#3525cd]">{searchedMerchants.length} found</span>
                      </div>
                      
                      <div className="mt-2 space-y-1 max-h-60 overflow-y-auto">
                        {searchedMerchants.length > 0 ? (
                          searchedMerchants.map((merchant) => (
                            <div
                              key={merchant.id}
                              onClick={() => {
                                setIsSearchOpen(false);
                                setSearchQuery("");
                                navigate(`/superadmin/customers/${merchant.id}`);
                              }}
                              className="flex items-center justify-between p-2 rounded-xl hover:bg-[#f5f2ff] cursor-pointer transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#e2dfff] flex items-center justify-center text-[#3525cd] text-xs font-bold">
                                  {(merchant.companyName || merchant.name || "C")[0].toUpperCase()}
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-[#1b1b24] line-clamp-1">{merchant.companyName || merchant.name}</p>
                                  <p className="text-[10px] text-[#777587] line-clamp-1">{merchant.email}</p>
                                </div>
                              </div>
                              <ArrowRight className="w-3.5 h-3.5 text-[#777587]" />
                            </div>
                          ))
                        ) : searchQuery.trim() ? (
                          <div className="p-4 text-center text-xs text-[#777587]">No customer found matching "{searchQuery}"</div>
                        ) : (
                          <div className="p-3 text-center text-xs text-[#777587]">Type customer name or email to search...</div>
                        )}
                      </div>

                      <div className="pt-2 mt-2 border-t border-[#f0ecf9]">
                        <button
                          onClick={() => {
                            setIsSearchOpen(false);
                            navigate("/superadmin/customers");
                          }}
                          className="w-full text-center text-xs font-bold text-[#3525cd] hover:underline"
                        >
                          View All Customers &rarr;
                        </button>
                      </div>
                    </div>
                  )}
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
                <a onClick={() => navigate("/superadmin")} className="border-b-2 border-[#3525cd] pb-1 text-[12px] font-bold text-[#3525cd] cursor-pointer">Global View</a>
                <a onClick={() => navigate("/superadmin/website-management")} className="text-[12px] font-bold text-[#464555] hover:text-[#3525cd] cursor-pointer">Marketplace</a>
                <a onClick={() => navigate("/superadmin/usage")} className="text-[12px] font-bold text-[#464555] hover:text-[#3525cd] cursor-pointer">Reports</a>
              </div>

              {/* Notification Button & Popover */}
              <div ref={notifRef} className="relative">
                <button
                  type="button"
                  onClick={() => setIsNotificationsOpen((prev) => !prev)}
                  className="relative p-2 text-[#464555] transition-all hover:text-[#3525cd] rounded-full hover:bg-[#f5f2ff]"
                >
                  <MaterialIcon>notifications</MaterialIcon>
                  {pendingTickets.length > 0 && (
                    <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-[#ef4444] animate-pulse" />
                  )}
                </button>

                {isNotificationsOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-[#eae6f4] bg-white p-3 shadow-xl z-50">
                    <div className="flex items-center justify-between px-2 pb-2 border-b border-[#f0ecf9]">
                      <span className="text-xs font-bold text-[#1b1b24]">Notifications</span>
                      <span className="text-[10px] font-bold bg-[#ef4444]/10 text-[#ef4444] px-2 py-0.5 rounded-full">
                        {pendingTickets.length} Pending
                      </span>
                    </div>

                    <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
                      {pendingTickets.length > 0 ? (
                        pendingTickets.map((t) => (
                          <div
                            key={t.id}
                            onClick={() => {
                              setIsNotificationsOpen(false);
                              navigate(`/superadmin/support`);
                            }}
                            className="p-2.5 rounded-xl bg-gray-50 hover:bg-[#f5f2ff] transition-colors cursor-pointer border border-gray-100"
                          >
                            <div className="flex items-start gap-2">
                              <ShieldAlert className="w-4 h-4 text-[#ef4444] shrink-0 mt-0.5" />
                              <div>
                                <p className="text-xs font-bold text-[#1b1b24] line-clamp-1">{t.issue || "New Merchant Request"}</p>
                                <p className="text-[10px] text-[#777587] mt-0.5">{t.email}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-xs text-[#777587] flex flex-col items-center gap-1">
                          <CheckCircle2 className="w-6 h-6 text-[#10b981]" />
                          <span>All notifications clear! Fleet is nominal.</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 mt-2 border-t border-[#f0ecf9]">
                      <button
                        onClick={() => {
                          setIsNotificationsOpen(false);
                          navigate("/superadmin/support");
                        }}
                        className="w-full text-center text-xs font-bold text-[#3525cd] hover:underline"
                      >
                        Open Support Center &rarr;
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button 
                type="button" 
                onClick={() => navigate("/superadmin/usage")}
                className="p-2 text-[#464555] transition-all hover:text-[#3525cd] rounded-full hover:bg-[#f5f2ff]"
              >
                <MaterialIcon>history</MaterialIcon>
              </button>

              <div className="h-8 w-px bg-[#c7c4d8]/70" />

              {/* Profile Avatar & Dropdown Menu */}
              <div ref={profileRef} className="relative">
                <button
                  type="button"
                  onClick={() => setIsProfileOpen((prev) => !prev)}
                  className="flex items-center gap-2 cursor-pointer focus:outline-none"
                >
                  {enterpriseAvatar ? (
                    <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-[#e2dfff] bg-[#e2dfff]">
                      <img src={enterpriseAvatar} alt="User Avatar" className="h-full w-full object-cover" />
                    </div>
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-[#e2dfff] bg-[#e2dfff] font-bold text-[#3525cd]">
                      {initials}
                    </div>
                  )}
                  <ChevronDown className={`w-4 h-4 text-[#777587] transition-transform ${isProfileOpen ? "rotate-180" : ""}`} />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-[#eae6f4] bg-white p-2 shadow-xl z-50">
                    <div className="px-3 py-2 border-b border-[#f0ecf9]">
                      <p className="text-xs font-bold text-[#1b1b24] line-clamp-1">{user?.name || "Super Admin"}</p>
                      <p className="text-[10px] text-[#777587] line-clamp-1">{user?.email || "admin@squadcart.app"}</p>
                    </div>

                    <div className="py-1 space-y-1">
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          navigate("/superadmin/profile");
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#464555] hover:bg-[#f5f2ff] hover:text-[#3525cd] transition-colors"
                      >
                        <User className="w-4 h-4" />
                        <span>View Profile</span>
                      </button>
                    </div>

                    <div className="pt-1 border-t border-[#f0ecf9]">
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-[#ef4444] hover:bg-[#ffdad6]/40 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
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
        </div>
      </div>
    </header>
  );
};

export default SuperAdminTopNavbar;
