import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Search as SearchIcon,
  Filter,
  Plus,
  Inbox,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { StatusBadge, PriorityIcon } from "./HelpComponents";
import { USERS } from "../data";
import { motion } from "framer-motion";

// Premium Stats Card Component (Wave Design)
const StatCard = ({
  title,
  value,
  trend,
  trendDir,
  icon: Icon,
  color,
  bg,
  wave,
}) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="relative bg-white dark:bg-[#1a1f26] rounded-[24px] p-6 shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden group hover:shadow-xl transition-all duration-300"
    >
      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-4">
          <div
            className={`p-3 rounded-xl ${bg} ${color} transition-transform group-hover:scale-110 duration-300`}
          >
            <Icon className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {title}
          </p>
        </div>

        <div>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
            {value}
          </h3>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md border ${
                trendDir === "up"
                  ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-500/20"
                  : "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-500/20"
              }`}
            >
              {trendDir === "up" ? (
                <ArrowUpRight className="w-3.5 h-3.5" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5" />
              )}
              {trend}
            </span>
            <span className="text-xs text-gray-400 font-medium">
              vs last month
            </span>
          </div>
        </div>
      </div>

      {/* Wave Graphic */}
      <div
        className={`absolute bottom-0 right-0 w-24 h-16 opacity-10 group-hover:opacity-20 transition-opacity duration-300 ${wave}`}
      >
        <svg
          viewBox="0 0 100 60"
          fill="currentColor"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          <path d="M0 60 C 20 60, 20 20, 50 20 C 80 20, 80 50, 100 50 L 100 60 Z" />
        </svg>
      </div>
    </motion.div>
  );
};

export default function TicketListView({
  setActiveView,
  activeTab,
  setActiveTab,
  filteredTickets,
  setSelectedTicketId,
  stats: statsFromApi,
  tabCounts: tabCountsFromApi,
  statsLoading,
}) {
  // Pagination & Search State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");

  // Reset page when tab changes
  useEffect(() => {
    setCurrentPage(1);
    setSearchQuery(""); // Optional: Clear search on tab change? User might prefer keeping it. Let's keep it simple and reset for now to avoid confusion.
  }, [activeTab]);

  // Search Logic (support both requesterId/USERS and API ticket.email)
  const searchedTickets = filteredTickets.filter((ticket) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const u = USERS.find((user) => user.id === ticket.requesterId);
    const subject = ticket.subject ?? ticket.issue ?? "";
    const idStr = String(ticket.id ?? "").toLowerCase();
    return (
      idStr.includes(query) ||
      subject.toLowerCase().includes(query) ||
      (u?.name || "").toLowerCase().includes(query) ||
      (u?.company || "").toLowerCase().includes(query) ||
      (ticket.email || "").toLowerCase().includes(query)
    );
  });

  // Pagination Logic
  const totalItems = searchedTickets.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  const currentTickets = searchedTickets.slice(startIndex, endIndex);

  // Generate Page Numbers
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push("...");
        pages.push(totalPages);
      }
    }
    return pages;
  };

  // Stats from API (follow frontend card layout: Total, Pending, Resolved, Open Issues)
  const stats = [
    {
      title: "Total Tickets",
      value: statsLoading ? "—" : String(statsFromApi?.total ?? 0),
      trend: "+12%",
      trendDir: "up",
      icon: Inbox,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-900/20",
      wave: "text-blue-500",
    },
    {
      title: "Pending",
      value: statsLoading ? "—" : String(statsFromApi?.pending ?? 0),
      trend: "+5%",
      trendDir: "up",
      icon: Clock,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-900/20",
      wave: "text-amber-500",
    },
    {
      title: "Resolved",
      value: statsLoading ? "—" : String(statsFromApi?.resolved ?? 0),
      trend: "+8%",
      trendDir: "up",
      icon: CheckCircle,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
      wave: "text-emerald-500",
    },
    {
      title: "Open Issues",
      value: statsLoading ? "—" : String(statsFromApi?.active ?? 0),
      trend: "-2%",
      trendDir: "down",
      icon: AlertCircle,
      color: "text-violet-600 dark:text-violet-400",
      bg: "bg-violet-50 dark:bg-violet-900/20",
      wave: "text-violet-500",
    },
  ];

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {stats.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </motion.div>

      <div className="flex flex-col flex-1 bg-white dark:bg-[#1a1f26] rounded-[24px] border border-gray-200 dark:border-gray-800 overflow-hidden shadow-xl">
        {/* Header */}
        <div className="relative px-8 py-6 border-b border-gray-200 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden">
          {/* Decorative Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-violet-50/50 via-transparent to-transparent dark:from-violet-900/10 pointer-events-none" />

          <div className="relative z-10">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
              Support Tickets
            </h2>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live updates enabled
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-3 flex-1 md:justify-end">
            <div className="relative w-full md:w-80 group">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-violet-500 transition-colors" />
              <input
                type="text"
                placeholder="Search by requester or subject..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full h-12 pl-10 pr-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all shadow-sm"
              />
            </div>
            <Button
              onClick={() => setActiveView("create")}
              className="h-12 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-500/30 px-6 font-semibold transition-all hover:scale-105 hover:shadow-indigo-500/40"
            >
              <Plus className="w-5 h-5 mr-2" /> New Ticket
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-8 pt-4 pb-0 overflow-x-auto">
          <div className="flex items-center gap-2 p-1.5 bg-gray-100/80 dark:bg-gray-800/80 rounded-2xl w-fit backdrop-blur-sm">
            {(tabCountsFromApi?.length
              ? tabCountsFromApi
              : [
                  { id: "active", label: "All Active", count: 0 },
                  { id: "pending", label: "Pending", count: 0 },
                  { id: "in_progress", label: "In progress", count: 0 },
                  { id: "resolved", label: "Resolved", count: 0 },
                ]
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-xl transition-all whitespace-nowrap flex items-center gap-2 relative",
                  activeTab === tab.id
                    ? "bg-white dark:bg-gray-800 text-violet-600 dark:text-violet-400 shadow-md ring-1 ring-black/5 dark:ring-white/10"
                    : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-700/50",
                )}
              >
                {tab.label}
                <span
                  className={cn(
                    "text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px]",
                    activeTab === tab.id
                      ? "bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400",
                  )}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-8 py-4 mt-4 bg-gray-50/80 dark:bg-gray-900/50 border-y border-gray-100 dark:border-gray-800 text-xs font-bold text-gray-500 uppercase tracking-wider min-w-[800px] md:min-w-0">
          <div className="col-span-1 flex items-center justify-center">
            <input
              type="checkbox"
              className="rounded border-gray-300 w-4 h-4 text-violet-600 focus:ring-violet-500"
            />
          </div>
          <div className="col-span-1">ID</div>
          <div className="col-span-3">Requester</div>
          <div className="col-span-2">Priority</div>
          <div className="col-span-3">Subject</div>
          <div className="col-span-2 text-right px-4">Status</div>
        </div>

        {/* Table Rows */}
        <div className="flex-1 overflow-y-auto overflow-x-auto bg-white dark:bg-[#1a1f26]">
          <div className="min-w-[800px] md:min-w-0">
            {currentTickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <SearchIcon className="w-12 h-12 mb-3 opacity-20" />
                <p>No tickets found matching "{searchQuery}"</p>
              </div>
            ) : (
              currentTickets.map((ticket, index) => {
                const u = USERS.find((user) => user.id === ticket.requesterId);
                const subject = ticket.subject ?? ticket.issue ?? "—";
                const priority = ticket.priority ?? "medium";
                const requesterPrimary = u?.company ?? ticket.email ?? "—";
                const requesterSecondary =
                  u?.name ?? (ticket.email ? null : "—");
                return (
                  <motion.div
                    layoutId={ticket.id}
                    key={ticket.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => {
                      setSelectedTicketId(ticket.id);
                      setActiveView("detail");
                    }}
                    className="grid grid-cols-12 gap-4 px-8 py-4 border-b border-gray-50 dark:border-gray-800/50 hover:bg-violet-50/30 dark:hover:bg-violet-900/10 cursor-pointer transition-all items-center group relative"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-violet-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="col-span-1 flex items-center justify-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 w-4 h-4 text-violet-600 focus:ring-violet-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div className="col-span-1 font-bold text-sm text-gray-900 dark:text-white group-hover:text-violet-600 transition-colors">
                      {ticket.id}
                    </div>
                    <div className="col-span-3 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 p-0.5 ring-2 ring-transparent group-hover:ring-violet-200 dark:group-hover:ring-violet-800 transition-all shadow-sm overflow-hidden">
                        {u?.avatar ? (
                          <img
                            src={u.avatar}
                            alt={u?.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 flex items-center justify-center text-xs font-bold">
                            {(requesterPrimary || "?").charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {requesterPrimary}
                        </div>
                        <div className="text-xs text-gray-500 truncate flex items-center gap-1 group-hover:text-violet-500 transition-colors">
                          {requesterSecondary ?? ticket.email ?? "—"}
                        </div>
                      </div>
                    </div>
                    <div className="col-span-2 flex items-center gap-2">
                      <PriorityIcon priority={priority} />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                        {priority}
                      </span>
                    </div>
                    <div className="col-span-3 text-sm font-medium text-gray-600 dark:text-gray-300 truncate group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                      {subject.length > 80
                        ? `${subject.slice(0, 80)}…`
                        : subject}
                    </div>
                    <div className="col-span-2 flex items-center justify-between">
                      <div className="ml-auto px-4 transform group-hover:scale-105 transition-transform">
                        <StatusBadge status={ticket.status} />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-500 font-medium">
              Showing {Math.min(startIndex + 1, totalItems)} to {endIndex} of{" "}
              {totalItems} entries
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Rows:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="text-xs border border-gray-200 dark:border-gray-700 rounded-lg p-1 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-9 w-9 p-0 rounded-xl border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            {getPageNumbers().map((pageNum, idx) =>
              pageNum === "..." ? (
                <span
                  key={`dots-${idx}`}
                  className="text-gray-400 text-xs px-1"
                >
                  ...
                </span>
              ) : (
                <Button
                  key={pageNum}
                  size="sm"
                  className={cn(
                    "h-9 w-9 p-0 rounded-xl font-bold transition-all",
                    currentPage === pageNum
                      ? "bg-violet-600 text-white hover:bg-violet-700 shadow-md shadow-violet-500/20"
                      : "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400",
                  )}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </Button>
              ),
            )}

            <Button
              variant="outline"
              size="sm"
              className="h-9 w-9 p-0 rounded-xl border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
