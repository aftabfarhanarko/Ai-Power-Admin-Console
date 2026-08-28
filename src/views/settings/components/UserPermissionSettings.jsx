import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Plus,
  Shield,
  Users,
  Lock,
} from "lucide-react";
import { useGetSystemusersQuery } from "@/features/systemuser/systemuserApiSlice";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const UserPermissionSettings = () => {
  const { data: apiData, isLoading } = useGetSystemusersQuery();
  const rawList = apiData?.data ?? apiData ?? [];

  // State for pagination and search
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedRows, setSelectedRows] = useState([]);

  // Process data
  const users = Array.isArray(rawList)
    ? rawList.map((u) => ({
        id: String(u.id),
        name: u.name ?? "—",
        email: u.email ?? "—",
        date: u.createdAt
          ? new Date(u.createdAt).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          : "—",
        role: u.role ? u.role.replace(/_/g, " ") : "—",
        status: "Active", // Mock status since API might not return it
        avatar: u.companyLogo ?? u.photo ?? null,
      }))
    : [];

  // Filter logic
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredUsers.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedRows(currentData.map((user) => user.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (id, checked) => {
    if (checked) {
      setSelectedRows([...selectedRows, id]);
    } else {
      setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-10 w-10 border-2 border-violet-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400">
              <Shield className="h-6 w-6" />
            </div>
            User Permissions
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 ml-14">
            Manage system access, roles, and user permissions efficiently.
          </p>
        </div>
      </div>

      {/* Stats Grid (Optional but adds "Premium" feel) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-[24px] bg-white dark:bg-[#1a1f26] border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">
              +12%
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {users.length}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Total Users
          </p>
        </div>
        <div className="p-6 rounded-[24px] bg-white dark:bg-[#1a1f26] border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400">
              <Shield className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400">
              Active
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {users.length}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Active Roles
          </p>
        </div>
        <div className="p-6 rounded-[24px] bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
              <Lock className="w-5 h-5 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white">Admin</h3>
          <p className="text-sm text-white/80">Primary Access Level</p>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="rounded-[24px] border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1f26] shadow-xl overflow-hidden">
        {/* Toolbar */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search users, roles, email..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset to page 1 on search
              }}
              className="pl-10 h-10 bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-violet-500/20"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="h-10 rounded-xl border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button
              variant="outline"
              className="h-10 rounded-xl border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50/50 dark:bg-gray-900/50">
              <TableRow className="border-b border-gray-100 dark:border-gray-800 hover:bg-transparent">
                <TableHead className="w-[50px] pl-6">
                  <Checkbox
                    checked={
                      currentData.length > 0 &&
                      selectedRows.length === currentData.length
                    }
                    onCheckedChange={handleSelectAll}
                    className="rounded border-gray-300 data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600"
                  />
                </TableHead>
                <TableHead className="w-[80px] text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  No
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-gray-700">
                    Employee Name
                    <ChevronDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Email Address
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Created Date
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Access Level
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentData.length > 0 ? (
                currentData.map((user, index) => (
                  <TableRow
                    key={user.id}
                    className="hover:bg-violet-50/50 dark:hover:bg-violet-900/10 border-b border-gray-50 dark:border-gray-800/50 transition-colors"
                  >
                    <TableCell className="pl-6">
                      <Checkbox
                        checked={selectedRows.includes(user.id)}
                        onCheckedChange={(checked) =>
                          handleSelectRow(user.id, checked)
                        }
                        className="rounded border-gray-300 data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600"
                      />
                    </TableCell>
                    <TableCell className="font-medium text-gray-500 text-sm">
                      #{startIndex + index + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="h-10 w-10 border-2 border-white dark:border-gray-800 shadow-sm">
                            <AvatarImage
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                            />
                            <AvatarFallback className="bg-violet-100 text-violet-600">
                              {user.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-gray-800"></span>
                        </div>
                        <div>
                          <span className="block font-semibold text-gray-900 dark:text-gray-100 text-sm">
                            {user.name}
                          </span>
                          <span className="block text-xs text-gray-500">
                            ID: {user.id.substring(0, 8)}...
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-300 font-medium text-sm">
                      {user.email}
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-300 text-sm">
                      {user.date}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300 capitalize border border-violet-200 dark:border-violet-800">
                        {user.role}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Active
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-40 rounded-xl"
                        >
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem className="cursor-pointer">
                            Edit Permissions
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer">
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50">
                            Revoke Access
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <p>No users found matching "{searchQuery}"</p>
                      <Button
                        variant="link"
                        onClick={() => setSearchQuery("")}
                        className="text-violet-600 font-medium mt-1"
                      >
                        Clear search
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/30 gap-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing{" "}
            <span className="font-medium text-gray-900 dark:text-white">
              {startIndex + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium text-gray-900 dark:text-white">
              {Math.min(startIndex + itemsPerPage, filteredUsers.length)}
            </span>{" "}
            of{" "}
            <span className="font-medium text-gray-900 dark:text-white">
              {filteredUsers.length}
            </span>{" "}
            entries
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-9 w-9 rounded-lg border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 hover:text-violet-600 disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Logic to show pages around current page could be complex, keeping it simple for now
              // or just showing first 5. For a real world app, we'd use a proper pagination range generator.
              // Let's just show up to 5 pages for this demo.
              let pageNum = i + 1;
              if (totalPages > 5 && currentPage > 3) {
                pageNum = currentPage - 2 + i;
                if (pageNum > totalPages) pageNum = totalPages - (4 - i);
              }

              if (pageNum <= 0) return null;

              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                  className={`h-9 w-9 rounded-lg font-medium ${
                    currentPage === pageNum
                      ? "bg-violet-600 text-white shadow-md shadow-violet-500/20 hover:bg-violet-700"
                      : "text-gray-600 hover:bg-white dark:hover:bg-gray-800 dark:text-gray-400"
                  }`}
                >
                  {pageNum}
                </Button>
              );
            })}

            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="h-9 w-9 rounded-lg border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 hover:text-violet-600 disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default UserPermissionSettings;
