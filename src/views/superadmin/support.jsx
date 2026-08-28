import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useGetHelpQuery,
  useGetHelpStatsQuery,
  useUpdateHelpMutation,
} from "@/features/help/helpApiSlice";

const TAB_TO_STATUS = {
  active: ["pending", "in_progress"],
  pending: ["pending"],
  in_progress: ["in_progress"],
  resolved: ["resolved"],
};

const statusMeta = {
  pending: {
    label: "Pending",
    badgeClassName: "bg-[#3525cd]/10 text-[#3525cd] border border-[#3525cd]/20",
    dotClassName: "bg-[#3525cd]",
  },
  in_progress: {
    label: "In Progress",
    badgeClassName: "bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/20",
    dotClassName: "bg-[#f59e0b] animate-pulse",
  },
  resolved: {
    label: "Resolved",
    badgeClassName: "bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20",
    dotClassName: "bg-[#10b981]",
  },
};

const priorityMeta = {
  critical: {
    label: "URGENT",
    className: "bg-[#ef4444]/10 text-[#ef4444]",
  },
  high: {
    label: "URGENT",
    className: "bg-[#ef4444]/10 text-[#ef4444]",
  },
  medium: {
    label: "MEDIUM",
    className: "bg-[#006780]/10 text-[#006780]",
  },
  low: {
    label: "LOW",
    className: "bg-[#777587]/10 text-[#777587]",
  },
};

const formatRelativeTime = (value) => {
  if (!value) return "NOW";
  const diffMs = Date.now() - new Date(value).getTime();
  const diffMinutes = Math.max(1, Math.round(diffMs / 60000));
  if (diffMinutes < 60) return `${diffMinutes} mins ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hours ago`;
  return `${Math.round(diffHours / 24)} days ago`;
};

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

const SuperAdminSupportPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("active");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const { data: tickets = [], isLoading, refetch } = useGetHelpQuery();
  const { data: stats, isLoading: statsLoading } = useGetHelpStatsQuery();
  const [updateHelp, { isLoading: isUpdating }] = useUpdateHelpMutation();

  const filteredTickets = useMemo(() => {
    const statuses = TAB_TO_STATUS[activeTab];
    if (!statuses) return tickets;
    return tickets.filter((ticket) => statuses.includes(ticket.status ?? "pending"));
  }, [activeTab, tickets]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const searchedTickets = useMemo(() => {
    if (!searchQuery.trim()) return filteredTickets;

    const query = searchQuery.toLowerCase();
    return filteredTickets.filter((ticket) =>
      [ticket.id, ticket.email, ticket.issue]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [filteredTickets, searchQuery]);

  const totalItems = searchedTickets.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentTickets = searchedTickets.slice(startIndex, endIndex);

  const statsCounts = useMemo(() => {
    const total = tickets.length;
    const pending = tickets.filter((t) => (t.status ?? "pending") === "pending").length;
    const resolved = tickets.filter((t) => t.status === "resolved").length;
    const inProgress = tickets.filter((t) => t.status === "in_progress").length;
    return { total, pending, resolved, inProgress };
  }, [tickets]);

  const tableRows = useMemo(
    () =>
      currentTickets.map((ticket, index) => {
        const normalizedStatus = ticket.status ?? "pending";
        const normalizedPriority = ticket.priority ?? "medium";
        const status = statusMeta[normalizedStatus] || statusMeta.pending;
        const priority = priorityMeta[normalizedPriority] || priorityMeta.medium;

        // Custom store names derived from email to fit mock design
        const emailParts = (ticket.email || "").split("@");
        const baseName = emailParts[0] || "operator";
        const storeName = baseName.charAt(0).toUpperCase() + baseName.slice(1) + " Store";
        const location = index % 2 === 0 ? "Chicago, IL" : "Austin, TX";

        return {
          id: ticket.id,
          subject: ticket.issue || "No subject provided",
          priority,
          status,
          storeName,
          location,
          requester: ticket.email || "Unknown requester",
          timestamp: formatRelativeTime(ticket.updatedAt || ticket.createdAt),
          category: ticket.category || "General",
          ticket,
        };
      }),
    [currentTickets]
  );

  const getAvatarColors = (index) => {
    const sets = [
      { bg: "bg-[#b7eaff]", text: "text-[#001f28]" },
      { bg: "bg-[#f0dbff]", text: "text-[#2c0051]" },
      { bg: "bg-[#eae6f4]", text: "text-[#1b1b24]" },
    ];
    return sets[index % sets.length];
  };



  return (
    <div className="max-w-[1440px] mx-auto space-y-8">
      {/* Support Overview Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <nav className="flex items-center gap-2 mb-2">
            <span className="text-[12px] font-semibold tracking-[0.05em] text-[#3525cd] uppercase">Global Enterprise</span>
            <span className="material-symbols-outlined text-[14px] text-[#777587]">chevron_right</span>
            <span className="text-[12px] font-semibold tracking-[0.05em] text-[#464555] uppercase">Support Monitoring</span>
          </nav>
          <h3 className="text-2xl md:text-3xl font-bold tracking-[-0.02em] text-[#1b1b24] leading-tight">
            Support Operations Overview
          </h3>
          <p className="text-sm text-[#777587] mt-1 max-w-2xl font-normal leading-relaxed">
            Coordinating volume across 24 regional centers and coordinating 12,000+ active sessions.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-[#c7c4d8] rounded-xl bg-white hover:bg-[#f0ecf9] transition-colors text-[12px] font-semibold tracking-[0.05em] text-[#1b1b24]">
            <span className="material-symbols-outlined text-[18px]">calendar_today</span>
            <span>Last 30 Days</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-[#c7c4d8] rounded-xl bg-white hover:bg-[#f0ecf9] transition-colors text-[12px] font-semibold tracking-[0.05em] text-[#1b1b24]">
            <span className="material-symbols-outlined text-[18px]">file_download</span>
            <span>Export PDF</span>
          </button>
        </div>
      </section>

      {/* Summary Metrics Bento Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Tickets */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#eae6f4] hover:translate-y-[-4px] transition-transform duration-300 group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-2xl bg-[#3525cd]/10 text-[#3525cd] group-hover:bg-[#3525cd] group-hover:text-white transition-colors">
              <span className="material-symbols-outlined">confirmation_number</span>
            </div>
            <span className="bg-[#10b981]/10 text-[#10b981] px-2 py-1 rounded-lg text-[12px] font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">trending_up</span> 12%
            </span>
          </div>
          <p className="text-[#777587] text-[12px] font-semibold tracking-[0.05em] uppercase mb-1">Total Tickets</p>
          <h4 className="text-2xl font-semibold tracking-[-0.01em] text-[#1b1b24]">{statsCounts.total}</h4>
          <div className="mt-4 h-1 w-full bg-[#f0ecf9] rounded-full overflow-hidden">
            <div className="h-full bg-[#3525cd]" style={{ width: "75%" }}></div>
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#eae6f4] hover:translate-y-[-4px] transition-transform duration-300 group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-2xl bg-[#f59e0b]/10 text-[#f59e0b] group-hover:bg-[#f59e0b] group-hover:text-white transition-colors">
              <span className="material-symbols-outlined">pending_actions</span>
            </div>
            <span className="bg-[#ef4444]/10 text-[#ef4444] px-2 py-1 rounded-lg text-[12px] font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">trending_up</span> 5%
            </span>
          </div>
          <p className="text-[#777587] text-[12px] font-semibold tracking-[0.05em] uppercase mb-1">Pending Review</p>
          <h4 className="text-2xl font-semibold tracking-[-0.01em] text-[#1b1b24]">{statsCounts.pending}</h4>
          <div className="mt-4 h-1 w-full bg-[#f0ecf9] rounded-full overflow-hidden">
            <div className="h-full bg-[#f59e0b]" style={{ width: "25%" }}></div>
          </div>
        </div>

        {/* Resolved */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#eae6f4] hover:translate-y-[-4px] transition-transform duration-300 group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-2xl bg-[#10b981]/10 text-[#10b981] group-hover:bg-[#10b981] group-hover:text-white transition-colors">
              <span className="material-symbols-outlined">check_circle</span>
            </div>
            <span className="bg-[#10b981]/10 text-[#10b981] px-2 py-1 rounded-lg text-[12px] font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">trending_up</span> 18%
            </span>
          </div>
          <p className="text-[#777587] text-[12px] font-semibold tracking-[0.05em] uppercase mb-1">Resolved Today</p>
          <h4 className="text-2xl font-semibold tracking-[-0.01em] text-[#1b1b24]">{statsCounts.resolved}</h4>
          <div className="mt-4 h-1 w-full bg-[#f0ecf9] rounded-full overflow-hidden">
            <div className="h-full bg-[#10b981]" style={{ width: "85%" }}></div>
          </div>
        </div>

        {/* Open Issues */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#eae6f4] hover:translate-y-[-4px] transition-transform duration-300 group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-2xl bg-[#ef4444]/10 text-[#ef4444] group-hover:bg-[#ef4444] group-hover:text-white transition-colors">
              <span className="material-symbols-outlined">report_problem</span>
            </div>
            <span className="bg-[#10b981]/10 text-[#10b981] px-2 py-1 rounded-lg text-[12px] font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">trending_down</span> 2%
            </span>
          </div>
          <p className="text-[#777587] text-[12px] font-semibold tracking-[0.05em] uppercase mb-1">Open Escalations</p>
          <h4 className="text-[32px] font-semibold tracking-[-0.01em] text-[#1b1b24]">{statsCounts.inProgress}</h4>
          <div className="mt-4 h-1 w-full bg-[#f0ecf9] rounded-full overflow-hidden">
            <div className="h-full bg-[#ef4444]" style={{ width: "10%" }}></div>
          </div>
        </div>
      </section>

      {/* Main Content Area: Tickets & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Tickets Table Section */}
        <div className="lg:col-span-8 bg-white rounded-3xl shadow-sm border border-[#eae6f4] overflow-hidden">
          <div className="p-6 border-b border-[#f0ecf9] flex flex-wrap items-center justify-between gap-4">
            <h5 className="text-[20px] font-semibold text-[#1b1b24]">Support Tickets</h5>
            <div className="flex bg-[#f0ecf9] p-1 rounded-xl gap-1">
              <button
                onClick={() => setActiveTab("active")}
                className={`px-4 py-2 rounded-lg text-[12px] font-semibold transition-all ${
                  activeTab === "active" ? "bg-white text-[#3525cd] shadow-sm" : "text-[#464555] hover:text-[#3525cd]"
                }`}
              >
                All Active
              </button>
              <button
                onClick={() => setActiveTab("pending")}
                className={`px-4 py-2 rounded-lg text-[12px] font-semibold transition-all ${
                  activeTab === "pending" ? "bg-white text-[#3525cd] shadow-sm" : "text-[#464555] hover:text-[#3525cd]"
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setActiveTab("in_progress")}
                className={`px-4 py-2 rounded-lg text-[12px] font-semibold transition-all ${
                  activeTab === "in_progress" ? "bg-white text-[#3525cd] shadow-sm" : "text-[#464555] hover:text-[#3525cd]"
                }`}
              >
                In Progress
              </button>
              <button
                onClick={() => setActiveTab("resolved")}
                className={`px-4 py-2 rounded-lg text-[12px] font-semibold transition-all ${
                  activeTab === "resolved" ? "bg-white text-[#3525cd] shadow-sm" : "text-[#464555] hover:text-[#3525cd]"
                }`}
              >
                Resolved
              </button>
            </div>
          </div>

          <div className="p-4 bg-white flex items-center justify-between border-b border-[#f0ecf9]">
            <div className="relative w-full max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#777587]">search</span>
              <input
                type="text"
                placeholder="Search tickets, stores, or staff..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 pr-4 py-2 w-full bg-[#f0ecf9] rounded-lg border-none text-[14px] outline-none focus:ring-2 focus:ring-[#3525cd]/20 text-[#1b1b24]"
              />
            </div>
            <button
              onClick={() => setSearchQuery("")}
              className="p-2 hover:bg-[#eae6f4] rounded-lg transition-colors text-[#777587]"
              title="Clear search"
            >
              <span className="material-symbols-outlined">tune</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#f5f2ff]">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-bold tracking-[0.1em] text-[#777587] uppercase">Ticket ID</th>
                  <th className="px-6 py-4 text-[10px] font-bold tracking-[0.1em] text-[#777587] uppercase">Customer/Store</th>
                  <th className="px-6 py-4 text-[10px] font-bold tracking-[0.1em] text-[#777587] uppercase">Issue Type</th>
                  <th className="px-6 py-4 text-[10px] font-bold tracking-[0.1em] text-[#777587] uppercase">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold tracking-[0.1em] text-[#777587] uppercase">Priority</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0ecf9]">
                {isLoading ? (
                  <tr>
                    <td className="px-6 py-10 text-center text-[#777587]" colSpan={6}>
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-[#3525cd] border-t-transparent mr-2"></div>
                      Loading ticket registry...
                    </td>
                  </tr>
                ) : tableRows.length === 0 ? (
                  <tr>
                    <td className="px-6 py-10 text-center text-[#777587]" colSpan={6}>
                      No tickets found.
                    </td>
                  </tr>
                ) : (
                  tableRows.map((row, index) => {
                    const avatar = getAvatarColors(index);
                    return (
                      <tr
                        key={row.id}
                        onClick={() => navigate(`/superadmin/support/${row.id}`)}
                        className="hover:bg-[#f5f2ff]/50 transition-colors group cursor-pointer"
                      >
                        <td className="px-6 py-5 font-semibold text-[#3525cd] text-[14px]">
                          #{row.id.substring(0, 8)}
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${avatar.bg} ${avatar.text}`}>
                              {row.storeName.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-[14px] font-semibold text-[#1b1b24]">{row.storeName}</p>
                              <p className="text-[12px] text-[#777587]">{row.location}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-[14px] text-[#1b1b24] max-w-[200px] truncate">
                          <div>
                            <span className="font-semibold text-gray-500 mr-1">{row.category} /</span>
                            {row.subject}
                          </div>
                        </td>
                        <td className="px-6 py-5" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full ${row.status.dotClassName}`} />
                            <select
                              value={row.ticket.status ?? "pending"}
                              disabled={isUpdating}
                              onChange={async (event) => {
                                const newStatus = event.target.value;
                                if (!newStatus || newStatus === row.ticket.status) return;
                                try {
                                  await updateHelp({
                                    id: row.ticket.id,
                                    body: { status: newStatus },
                                  }).unwrap();
                                } catch {}
                              }}
                              className={`rounded-full px-3 py-1 text-[11px] outline-none font-semibold ${row.status.badgeClassName}`}
                            >
                              <option value="pending">Pending</option>
                              <option value="in_progress">In Progress</option>
                              <option value="resolved">Resolved</option>
                            </select>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold ${row.priority.className}`}>
                            {row.priority.label}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <button className="p-2 opacity-0 group-hover:opacity-100 text-[#777587] hover:text-[#3525cd] transition-all">
                            <span className="material-symbols-outlined">more_vert</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="p-6 bg-[#f5f2ff] flex justify-between items-center border-t border-[#f0ecf9]">
            <p className="text-[12px] font-semibold text-[#777587]">
              Showing {totalItems === 0 ? 0 : startIndex + 1} to {endIndex} of {totalItems} tickets
            </p>
            <div className="flex items-center gap-3">
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-[#c7c4d8] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#1b1b24] outline-none"
              >
                <option value={5}>5 rows</option>
                <option value={10}>10 rows</option>
                <option value={20}>20 rows</option>
              </select>

              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-2 border border-[#c7c4d8] rounded-lg bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-2 border border-[#c7c4d8] rounded-lg bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Volume Analysis & Active Experts */}
        <div className="lg:col-span-4 space-y-8">
          {/* Distribution Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-[#eae6f4] p-6">
            <h5 className="text-[20px] font-semibold text-[#1b1b24] mb-6">Volume by Channel</h5>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-[12px] font-semibold text-[#1b1b24] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-[#3525cd]">chat</span>
                    Live Chat
                  </span>
                  <span className="text-[14px] font-bold text-[#1b1b24]">42%</span>
                </div>
                <div className="h-2 bg-[#f0ecf9] rounded-full overflow-hidden">
                  <div className="h-full bg-[#3525cd]" style={{ width: "42%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-[12px] font-semibold text-[#1b1b24] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-[#006780]">mail</span>
                    Email Support
                  </span>
                  <span className="text-[14px] font-bold text-[#1b1b24]">38%</span>
                </div>
                <div className="h-2 bg-[#f0ecf9] rounded-full overflow-hidden">
                  <div className="h-full bg-[#006780]" style={{ width: "38%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-[12px] font-semibold text-[#1b1b24] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-[#6b00b8]">call</span>
                    Phone Support
                  </span>
                  <span className="text-[14px] font-bold text-[#1b1b24]">20%</span>
                </div>
                <div className="h-2 bg-[#f0ecf9] rounded-full overflow-hidden">
                  <div className="h-full bg-[#6b00b8]" style={{ width: "20%" }}></div>
                </div>
              </div>
            </div>
            <button className="w-full mt-6 py-3 rounded-2xl border-2 border-[#3525cd]/10 text-[#3525cd] text-[12px] font-semibold hover:bg-[#3525cd] hover:text-white transition-all">
              View Detailed Insights
            </button>
          </div>

          {/* Active Experts */}
          <div className="bg-white rounded-3xl shadow-sm border border-[#eae6f4] p-6 relative overflow-hidden">
            <div className="absolute top-6 right-6 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#10b981]"></span>
            </div>
            <h5 className="text-[20px] font-semibold text-[#1b1b24] mb-6">Online Staff (84)</h5>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-2 hover:bg-[#f5f2ff] rounded-xl transition-colors cursor-pointer">
                <img
                  alt="Staff Member"
                  className="w-10 h-10 rounded-full object-cover border border-[#eae6f4]"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAitCOHpRJvKMRSvPbcNVc5LKwqivdNoBMUYctBa9ZKWCDFV-umsb6iLT1iCKIQRK08PJ8Llg1v_GSSHGgflZzvPJAOVkEMpNFRQ4aEfV7UPd7tmoKhmutq4-PgDB9UIUS5hrR-NVe-7bu_2INE8tVV8WRYfX9V9Z1Bc8uFfRn6RBYLLiVJIH185tpwkoAW5MSzTWUyOaI9Z7clEtTOsODeE95McCIjy9EGUzF3hhfLNvcZ-Mgr6UO4YsasryzfWttZHIBn4-yrMSk"
                />
                <div className="flex-1">
                  <p className="text-[14px] font-semibold text-[#1b1b24]">Marcus Chen</p>
                  <p className="text-[12px] text-[#10b981] font-semibold">Active • Handling 4 tickets</p>
                </div>
                <span className="material-symbols-outlined text-[#777587]">chat</span>
              </div>

              <div className="flex items-center gap-3 p-2 hover:bg-[#f5f2ff] rounded-xl transition-colors cursor-pointer">
                <img
                  alt="Staff Member"
                  className="w-10 h-10 rounded-full object-cover border border-[#eae6f4]"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAE0yNuVVOePNgxxMxwCdevQGctypQ953udefPE6hwjDv-zMsMieGWd23_wOx0uVKWL25t-dtq-OFcwqDoH8fuLr8vG7WowytIN5TPxeIgYZbEohGl_BFTqskPhocl-2H0B6h2UZml9WZSo3br_CTY5qrqSzXGQM1WOHWG0JvIG1pcxcA9IhGnhmsbQlWQyJdXaxvCRRjLYwVZnJwo8JR1z3mfqwkPR94XFFiexoooHUzYJvawd0LY-Bk1CGULdqAQ7poZ1xkADpFM"
                />
                <div className="flex-1">
                  <p className="text-[14px] font-semibold text-[#1b1b24]">Sarah Jenkins</p>
                  <p className="text-[12px] text-[#10b981] font-semibold">Active • Handling 2 tickets</p>
                </div>
                <span className="material-symbols-outlined text-[#777587]">chat</span>
              </div>

              <div className="flex items-center gap-3 p-2 hover:bg-[#f5f2ff] rounded-xl transition-colors cursor-pointer opacity-60">
                <div className="w-10 h-10 rounded-full bg-[#e4e1ee] flex items-center justify-center font-bold text-[#1b1b24]">RJ</div>
                <div className="flex-1">
                  <p className="text-[14px] font-semibold text-[#1b1b24]">Robert J.</p>
                  <p className="text-[12px] text-[#777587] font-semibold">On Break</p>
                </div>
                <span className="material-symbols-outlined text-[#777587]">schedule</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => navigate("/superadmin/support/create")}
        className="fixed bottom-8 right-8 w-16 h-16 bg-[#3525cd] text-white rounded-3xl shadow-xl shadow-[#3525cd]/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 group"
      >
        <span className="material-symbols-outlined text-3xl group-hover:rotate-90 transition-transform">add</span>
      </button>
    </div>
  );
};

export default SuperAdminSupportPage;
