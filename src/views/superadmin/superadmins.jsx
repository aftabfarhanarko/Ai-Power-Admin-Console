import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useDeleteSuperadminMutation,
  useGetSuperadminsQuery,
} from "@/features/superadmin/superadminApiSlice";

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

const SuperAdminSuperadminsPage = () => {
  const navigate = useNavigate();
  const { data: superadmins = [], isLoading } = useGetSuperadminsQuery();
  const [deleteSuperadmin, { isLoading: isDeleting }] =
    useDeleteSuperadminMutation();
  const [superadminToDelete, setSuperadminToDelete] = useState(null);
  const [sortBy, setSortBy] = useState("recent");

  const sortedAdmins = useMemo(() => {
    const list = [...superadmins];

    list.sort((left, right) => {
      if (sortBy === "status") {
        return Number(Boolean(right.isActive)) - Number(Boolean(left.isActive));
      }

      if (sortBy === "role") {
        return `${left.role || ""}`.localeCompare(`${right.role || ""}`);
      }

      return new Date(right.updatedAt || right.createdAt || 0) - new Date(left.updatedAt || left.createdAt || 0);
    });

    return list;
  }, [sortBy, superadmins]);

  const confirmDelete = async () => {
    if (!superadminToDelete?.id) return;

    try {
      await deleteSuperadmin(superadminToDelete.id).unwrap();
      toast.success("Super admin deleted successfully");
    } catch (error) {
      console.error("Failed to delete superadmin:", error);
      toast.error("Failed to delete super admin");
    }

    setSuperadminToDelete(null);
  };

  return (
    <div className="max-w-[1440px] mx-auto space-y-8">
      {/* Breadcrumbs and Page Title */}
      <section className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="text-[12px] font-semibold tracking-[0.05em] text-[#3525cd] uppercase">Settings</span>
            <span className="text-[#777587]">/</span>
            <span className="text-[12px] font-semibold tracking-[0.05em] text-[#464555] uppercase font-mono">Super Admin Management</span>
          </div>
          <h1 className="text-[32px] md:text-[48px] font-extrabold tracking-[-0.02em] text-[#1b1b24] leading-tight">
            Super Admins
          </h1>
          <p className="text-[14px] text-[#777587] mt-1">
            Configure global access controls and manage root-level administrator identities.
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          <button className="inline-flex items-center gap-2 rounded-2xl border border-[#c7c4d8] bg-white px-6 py-3 text-[12px] font-semibold tracking-[0.05em] text-[#1b1b24] hover:bg-[#f0ecf9] transition-all">
            <MaterialIcon className="text-lg">filter_list</MaterialIcon>
            <span>Filter</span>
          </button>
          <button
            onClick={() => navigate("/superadmin/superadmins/create")}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#3525cd] px-6 py-3 text-[12px] font-bold text-white shadow-lg shadow-[#3525cd]/20 hover:scale-105 active:scale-95 transition-all"
            type="button"
          >
            <MaterialIcon filled>person_add</MaterialIcon>
            <span>Add New Admin</span>
          </button>
        </div>
      </section>

      {/* Bento Grid Stats */}
      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Super Admins */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#eae6f4] hover:translate-y-[-2px] transition-transform duration-300 flex flex-col justify-between h-[160px]">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-[#e2dfff] rounded-2xl text-[#3525cd]">
              <MaterialIcon className="text-xl">admin_panel_settings</MaterialIcon>
            </div>
            <span className="px-2 py-1 bg-[#10b981]/10 text-[#10b981] text-[10px] font-bold tracking-widest uppercase rounded-lg">+12%</span>
          </div>
          <div>
            <p className="text-[12px] font-semibold text-[#777587] mb-1">Total Super Admins</p>
            <h3 className="text-[32px] font-bold text-[#1b1b24]">{superadmins.length}</h3>
          </div>
        </div>

        {/* Card 2: Active Now */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#eae6f4] hover:translate-y-[-2px] transition-transform duration-300 flex flex-col justify-between h-[160px]">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-[#b7eaff] rounded-2xl text-[#006077]">
              <MaterialIcon className="text-xl">verified_user</MaterialIcon>
            </div>
          </div>
          <div>
            <p className="text-[12px] font-semibold text-[#777587] mb-1">Active Now</p>
            <h3 className="text-[32px] font-bold text-[#1b1b24]">
              {superadmins.filter((a) => a.isActive).length}
            </h3>
          </div>
        </div>

        {/* Card 3: Last Security Audit */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#eae6f4] hover:translate-y-[-2px] transition-transform duration-300 flex flex-col justify-between h-[160px]">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-[#f0dbff] rounded-2xl text-[#6b00b8]">
              <MaterialIcon className="text-xl">security_update_good</MaterialIcon>
            </div>
          </div>
          <div>
            <p className="text-[12px] font-semibold text-[#777587] mb-1">Last Security Audit</p>
            <h3 className="text-[32px] font-bold text-[#1b1b24]">2d Ago</h3>
          </div>
        </div>

        {/* Card 4: Pending Actions */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#eae6f4] hover:translate-y-[-2px] transition-transform duration-300 flex flex-col justify-between h-[160px]">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-[#ffdad6] rounded-2xl text-[#ef4444]">
              <MaterialIcon className="text-xl">gpp_maybe</MaterialIcon>
            </div>
            <span className="px-2 py-1 bg-[#ef4444]/10 text-[#ef4444] text-[10px] font-bold tracking-widest uppercase rounded-lg">High Risk</span>
          </div>
          <div>
            <p className="text-[12px] font-semibold text-[#777587] mb-1">Pending Actions</p>
            <h3 className="text-[32px] font-bold text-[#1b1b24]">3</h3>
          </div>
        </div>
      </section>

      {/* Registry Table List */}
      <div className="bg-white rounded-3xl shadow-sm border border-[#eae6f4] overflow-hidden">
        <div className="px-6 py-4 flex flex-wrap justify-between items-center gap-4 bg-gray-50 border-b border-[#f0ecf9]">
          <h3 className="text-[20px] font-semibold text-[#1b1b24]">Super Admin Registry</h3>
          <div className="flex items-center gap-3">
            <span className="text-[12px] font-semibold text-[#777587] uppercase tracking-[0.05em]">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent border-none font-bold text-[#3525cd] focus:ring-0 cursor-pointer text-sm py-1 pl-1 pr-6"
            >
              <option value="recent">Recent Access</option>
              <option value="role">Role Hierarchy</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#f5f2ff]">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold tracking-[0.1em] text-[#777587] uppercase">Admin ID</th>
                <th className="px-6 py-4 text-[10px] font-bold tracking-[0.1em] text-[#777587] uppercase">Name & Profile</th>
                <th className="px-6 py-4 text-[10px] font-bold tracking-[0.1em] text-[#777587] uppercase">Designation</th>
                <th className="px-6 py-4 text-[10px] font-bold tracking-[0.1em] text-[#777587] uppercase">Role</th>
                <th className="px-6 py-4 text-[10px] font-bold tracking-[0.1em] text-[#777587] uppercase">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold tracking-[0.1em] text-[#777587] uppercase">Created Date</th>
                <th className="px-6 py-4 text-[10px] font-bold tracking-[0.1em] text-[#777587] uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0ecf9]">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-[#777587]">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-[#3525cd] border-t-transparent mr-2"></div>
                    Loading registry...
                  </td>
                </tr>
              ) : sortedAdmins.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-[#777587]">
                    No administrators found in registry.
                  </td>
                </tr>
              ) : (
                sortedAdmins.map((admin) => {
                  const initials = (admin.name || admin.email || "SA")
                    .split(" ")
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((part) => part[0]?.toUpperCase())
                    .join("");

                  const colorClasses = [
                    "bg-[#3525cd]/10 text-[#3525cd]",
                    "bg-[#006780]/10 text-[#006780]",
                    "bg-[#6b00b8]/10 text-[#6b00b8]",
                    "bg-[#ef4444]/10 text-[#ef4444]"
                  ];
                  const avatarBg = colorClasses[admin.id % colorClasses.length];

                  return (
                    <tr key={admin.id} className="hover:bg-[#f5f2ff]/30 transition-colors group">
                      <td className="px-6 py-5 text-sm font-mono text-[#777587]">
                        #SA-{admin.id}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          {admin.photo ? (
                            <img
                              src={admin.photo}
                              alt={admin.name || "Admin"}
                              className="w-10 h-10 rounded-full border border-gray-200 object-cover"
                            />
                          ) : (
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${avatarBg}`}>
                              {initials}
                            </div>
                          )}
                          <div>
                            <p className="text-[14px] font-bold text-[#1b1b24]">{admin.name || "Unknown Admin"}</p>
                            <p className="text-xs text-[#777587]">{admin.email || "-"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-sm text-[#777587]">
                        {admin.designation || "Chief Executive"}
                      </td>
                      <td className="px-6 py-5">
                        <span className="px-3 py-1 bg-[#3525cd]/10 text-[#3525cd] text-[10px] font-bold uppercase rounded-full">
                          {admin.role || "SUPER_ADMIN"}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${admin.isActive ? "bg-[#10b981]" : "bg-gray-400"}`}></span>
                          <span className="text-sm font-semibold text-[#1b1b24]">
                            {admin.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-sm text-[#777587]">
                        {admin.createdAt
                          ? new Date(admin.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "—"}
                      </td>
                      <td className="px-6 py-5 text-right font-semibold">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => navigate(`/superadmin/superadmins/${admin.id}`)}
                            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-900 transition-colors"
                            title="View Details"
                          >
                            <span className="material-symbols-outlined !text-[20px]">visibility</span>
                          </button>
                          <button
                            onClick={() => navigate(`/superadmin/superadmins/edit/${admin.id}`)}
                            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-900 transition-colors"
                            title="Edit Admin"
                          >
                            <span className="material-symbols-outlined !text-[20px]">edit</span>
                          </button>
                          <button
                            onClick={() => setSuperadminToDelete(admin)}
                            className="p-1.5 hover:bg-red-50 rounded-lg text-gray-500 hover:text-red-600 transition-colors"
                            title="Delete Admin"
                          >
                            <span className="material-symbols-outlined !text-[20px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination / Total results count */}
        <div className="p-4 bg-gray-50 border-t border-[#f0ecf9] flex justify-between items-center">
          <span className="text-xs text-[#777587] font-semibold uppercase tracking-wider">
            Displaying {Math.min(sortedAdmins.length, 4)} of {sortedAdmins.length} authorized nodes
          </span>
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-white border border-[#c7c4d8] rounded-xl hover:bg-[#f0ecf9] text-[#777587] hover:text-[#1b1b24] transition-colors disabled:opacity-50" disabled>
              <MaterialIcon className="text-lg">chevron_left</MaterialIcon>
            </button>
            <button className="px-3 py-1 bg-[#3525cd] text-white rounded-xl font-bold">1</button>
            <button className="px-3 py-1 bg-white border border-[#c7c4d8] rounded-xl hover:bg-[#f0ecf9] text-[#777587] hover:text-[#1b1b24] transition-colors disabled:opacity-50" disabled>
              <MaterialIcon className="text-lg">chevron_right</MaterialIcon>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Meta */}
      <section className="mt-8 p-6 border border-dashed border-[#c7c4d8] rounded-3xl bg-white flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="text-[#3525cd]">
            <MaterialIcon className="text-3xl" filled>verified_user</MaterialIcon>
          </div>
          <div>
            <p className="font-bold text-[#1b1b24]">Governance &amp; Compliance</p>
            <p className="text-[#777587] text-sm">All admin changes are logged and audited in accordance with Enterprise Tier protocols.</p>
          </div>
        </div>
        <button
          className="text-[#3525cd] font-bold hover:underline flex items-center gap-2 text-sm"
          onClick={() => toast.success("Accessing system audit logs...")}
        >
          <span>View Audit Logs</span>
          <MaterialIcon className="text-sm">open_in_new</MaterialIcon>
        </button>
      </section>



      {/* Delete Dialog */}
      <Dialog
        open={Boolean(superadminToDelete)}
        onOpenChange={(open) => !open && setSuperadminToDelete(null)}
      >
        <DialogContent className="overflow-hidden rounded-[32px] border border-gray-200 bg-white p-0 text-[#1b1b24] max-w-md mx-auto">
          <div className="border-b border-gray-100 bg-gradient-to-br from-[#ef4444]/5 to-transparent p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl border border-red-200 bg-red-50 text-red-500">
              <MaterialIcon className="text-[32px]">delete</MaterialIcon>
            </div>
            <DialogTitle className="text-2xl font-bold text-[#1b1b24]">
              Delete Super Admin?
            </DialogTitle>
            <DialogDescription className="mt-2 text-[#777587]">
              This permanently removes{" "}
              <span className="font-semibold text-[#1b1b24]">
                {superadminToDelete?.name}
              </span>{" "}
              from the active registry.
            </DialogDescription>
          </div>
          <DialogFooter className="flex gap-3 p-8 sm:justify-center">
            <Button
              variant="outline"
              className="h-12 rounded-2xl border-gray-200 bg-transparent text-[#1b1b24] hover:bg-gray-50 px-6 font-semibold"
              onClick={() => setSuperadminToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              className="h-12 rounded-2xl bg-red-600 text-white hover:bg-red-700 px-6 font-semibold"
              disabled={isDeleting}
              onClick={confirmDelete}
            >
              {isDeleting ? "Deleting..." : "Delete Admin"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SuperAdminSuperadminsPage;
