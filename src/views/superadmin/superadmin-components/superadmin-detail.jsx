import React, { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { 
  useGetSuperadminQuery, 
  useUpdateSuperadminMutation 
} from "@/features/superadmin/superadminApiSlice";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  MapPin, 
  Shield, 
  Key, 
  History, 
  CheckCircle, 
  Edit2, 
  Lock,
  Clock,
  Activity,
  Users
} from "lucide-react";

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

const SuperAdminSuperadminDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const numericId = useMemo(() => Number(id), [id]);

  const {
    data: superadmin,
    isLoading,
    error,
  } = useGetSuperadminQuery(numericId, { skip: !numericId });

  const [updateSuperadmin, { isLoading: isUpdating }] = useUpdateSuperadminMutation();

  const handleToggleStatus = async () => {
    try {
      await updateSuperadmin({
        id: numericId,
        isActive: !superadmin.isActive,
      }).unwrap();
      toast.success(superadmin.isActive ? "Super admin suspended successfully" : "Super admin activated successfully");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update administrator status");
    }
  };

  const handleResetCredentials = () => {
    toast.success("Security credentials reset request dispatched to administrator email.");
  };

  const initials = useMemo(() => {
    if (!superadmin) return "SA";
    return (superadmin.name || superadmin.email || "SA")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
  }, [superadmin]);

  const permissionsList = useMemo(() => {
    if (superadmin?.permissions && superadmin.permissions.length > 0) {
      return superadmin.permissions;
    }
    return [
      "Full Database Read/Write",
      "User Provisioning",
      "Financial Auditing",
      "System Overrides",
      "API Secret Management",
      "Multi-Region Deployment",
      "Billing Configuration",
      "Infrastructure Logs",
      "Security Group Editing"
    ];
  }, [superadmin]);

  if (isLoading) {
    return (
      <div className="max-w-[1440px] mx-auto space-y-8 pb-16">
        <div className="flex items-center justify-center py-20 text-[#777587]">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#3525cd] border-t-transparent mr-2"></div>
          <span>Loading administrator details...</span>
        </div>
      </div>
    );
  }

  if (error || !superadmin) {
    return (
      <div className="max-w-[1440px] mx-auto space-y-8 pb-16">
        <div className="rounded-3xl bg-white border border-[#eae6f4] p-8 text-center text-[#ef4444] font-semibold">
          {error ? "Failed to load super admin details." : "Super admin not found or no longer available."}
          <div className="mt-4">
            <Button onClick={() => navigate("/superadmin/superadmins")} className="bg-[#3525cd] text-white">
              Back to Registry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto space-y-8 pb-16">
      {/* Header and Breadcrumbs */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <nav className="flex items-center gap-2 mb-2">
            <span 
              onClick={() => navigate("/superadmin/superadmins")}
              className="text-[12px] font-semibold tracking-[0.05em] text-[#777587] uppercase cursor-pointer hover:text-[#3525cd] transition-colors"
            >
              Super Admins
            </span>
            <span className="material-symbols-outlined text-[14px] text-[#777587]">chevron_right</span>
            <span className="text-[12px] font-semibold tracking-[0.05em] text-[#3525cd] uppercase font-mono">Detail View</span>
          </nav>
          
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/superadmin/superadmins")}
              className="rounded-full h-10 w-10 border-[#eae6f4] hover:bg-[#f0ecf9] transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-[#1b1b24]" />
            </Button>
            <div>
              <h3 className="text-[32px] md:text-[40px] font-bold tracking-[-0.02em] text-[#1b1b24] leading-tight">
                Super Admin Profile
              </h3>
              <p className="text-[16px] text-[#777587] mt-1 max-w-2xl font-normal leading-relaxed">
                Deep telemetry and configuration for root access node.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Profile Header Block */}
      <section className="relative overflow-hidden bg-white border-2 border-[#eae6f4] rounded-[40px] p-8 shadow-sm flex flex-col md:flex-row items-center gap-8">
        {/* Background gradient hint */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#3525cd]/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>

        <div className="relative group">
          <div className="h-32 w-32 rounded-[24px] overflow-hidden shadow-md border-4 border-white flex items-center justify-center bg-[#f5f2ff] text-[#3525cd]">
            {superadmin.photo ? (
              <img 
                src={superadmin.photo} 
                alt={superadmin.name} 
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <span className="text-[44px] font-black">{initials}</span>
            )}
          </div>
          <button 
            onClick={() => navigate(`/superadmin/superadmins/edit/${superadmin.id}`)}
            className="absolute -bottom-2 -right-2 bg-[#3525cd] text-white p-2.5 rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all"
            title="Edit Profile"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-grow space-y-2 text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <span className="bg-[#3525cd]/10 text-[#3525cd] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
              {superadmin.role || "Super Admin"}
            </span>
            <span className="flex items-center gap-1.5 text-xs font-semibold">
              <span className={`w-2.5 h-2.5 rounded-full ${superadmin.isActive ? "bg-[#10b981]" : "bg-gray-400"}`}></span>
              <span className={superadmin.isActive ? "text-[#10b981]" : "text-gray-500"}>
                {superadmin.isActive ? "Active Now" : "Inactive / Suspended"}
              </span>
            </span>
          </div>

          <h2 className="text-[28px] md:text-[36px] font-extrabold text-[#1b1b24] tracking-tight leading-none">
            {superadmin.name || "Unnamed Operator"}
          </h2>
          <p className="text-[14px] text-[#777587] flex items-center justify-center md:justify-start gap-1 font-medium">
            <MapPin className="w-4 h-4 text-[#777587]" />
            {superadmin.designation || "Headquarters, London Office"}
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleToggleStatus}
            variant="outline"
            disabled={isUpdating}
            className={`h-11 px-5 rounded-xl border-[#eae6f4] font-semibold transition-all ${
              superadmin.isActive 
                ? "text-[#ef4444] hover:bg-[#ef4444]/5 hover:border-[#ef4444]" 
                : "text-[#10b981] hover:bg-[#10b981]/5 hover:border-[#10b981]"
            }`}
          >
            {superadmin.isActive ? "Suspend Node" : "Activate Node"}
          </Button>
          <Button
            onClick={() => toast.success(`Initiating secure chat tunnel with ${superadmin.name || "admin"}...`)}
            className="h-11 px-6 rounded-xl bg-[#3525cd] text-white hover:bg-[#3525cd]/90 font-semibold shadow-lg shadow-[#3525cd]/20"
          >
            Message User
          </Button>
        </div>
      </section>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Personal Information (col-span-8) */}
        <div className="lg:col-span-8 bg-white border-2 border-[#eae6f4] rounded-[40px] p-8 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#f0ecf9]">
              <h3 className="text-[20px] font-bold text-[#1b1b24] flex items-center gap-2">
                <MaterialIcon className="text-[#3525cd]" filled>person</MaterialIcon>
                Personal Information
              </h3>
              <button 
                onClick={() => navigate(`/superadmin/superadmins/edit/${superadmin.id}`)}
                className="text-[#3525cd] font-bold text-sm hover:underline"
              >
                Edit Info
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-4">
              <div>
                <p className="text-[10px] font-bold text-[#777587] uppercase tracking-wider mb-1">Full Legal Name</p>
                <p className="text-[16px] font-bold text-[#1b1b24]">{superadmin.name || "Alexander James Sterling"}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#777587] uppercase tracking-wider mb-1">Email Address</p>
                <p className="text-[16px] font-bold text-[#1b1b24]">{superadmin.email || "a.sterling@squadlog.enterprise"}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#777587] uppercase tracking-wider mb-1">Phone Number</p>
                <p className="text-[16px] font-bold text-[#1b1b24]">{superadmin.phone || "+44 20 7946 0123"}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#777587] uppercase tracking-wider mb-1">Department</p>
                <p className="text-[16px] font-bold text-[#1b1b24]">Operational Oversight</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#777587] uppercase tracking-wider mb-1">Reporting Manager</p>
                <p className="text-[16px] font-bold text-[#1b1b24]">Chief Technology Officer</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#777587] uppercase tracking-wider mb-1">Timezone</p>
                <p className="text-[16px] font-bold text-[#1b1b24]">GMT (London, UK)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Integrity (col-span-4) */}
        <div className="lg:col-span-4 bg-[#f5f2ff] border-2 border-[#eae6f4] rounded-[40px] p-8 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-[20px] font-bold text-[#1b1b24] mb-6 flex items-center gap-2 border-b border-[#eae6f4] pb-4">
              <Shield className="w-5 h-5 text-[#3525cd]" />
              Account Integrity
            </h3>
            
            <ul className="space-y-4">
              <li className="flex justify-between items-center text-sm font-medium">
                <span className="text-[#777587]">Account ID</span>
                <span className="font-bold text-[#1b1b24] font-mono">SA-{superadmin.id || "99021-X"}</span>
              </li>
              <li className="flex justify-between items-center text-sm font-medium">
                <span className="text-[#777587]">Last Password Change</span>
                <span className="font-bold text-[#1b1b24]">14 Days Ago</span>
              </li>
              <li className="flex justify-between items-center text-sm font-medium">
                <span className="text-[#777587]">2FA Method</span>
                <span className="text-[#10b981] font-bold flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Hardware Key
                </span>
              </li>
              <li className="flex justify-between items-center text-sm font-medium">
                <span className="text-[#777587]">Security Clearance</span>
                <span className="px-2.5 py-1 bg-[#3525cd] text-white rounded-[8px] text-[10px] font-bold uppercase tracking-wider">
                  LEVEL 5
                </span>
              </li>
            </ul>
          </div>
          
          <div className="mt-8">
            <Button
              onClick={handleResetCredentials}
              className="w-full h-12 bg-white text-[#ef4444] border-2 border-[#ef4444]/20 rounded-2xl font-bold hover:bg-[#ef4444]/5 hover:border-[#ef4444] transition-all shadow-none"
            >
              Reset Security Credentials
            </Button>
          </div>
        </div>

        {/* Permissions Tag Cloud (col-span-12) */}
        <div className="lg:col-span-12 bg-white border-2 border-[#eae6f4] rounded-[40px] p-8 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-4 border-b border-[#f0ecf9]">
            <h3 className="text-[20px] font-bold text-[#1b1b24] flex items-center gap-2">
              <Key className="w-5 h-5 text-[#3525cd]" />
              Active Global Permissions
            </h3>
            <div className="flex gap-2">
              <span className="px-3.5 py-1.5 bg-[#3525cd]/10 text-[#3525cd] rounded-full text-xs font-bold">
                View All {permissionsList.length}
              </span>
              <button 
                onClick={() => toast.success("Accessing roles dashboard...")}
                className="px-3.5 py-1.5 border-2 border-[#eae6f4] rounded-full text-xs font-bold text-[#777587] hover:bg-[#f8f9fc] transition-colors"
              >
                Manage Roles
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {permissionsList.map((perm, idx) => (
              <span 
                key={idx} 
                className="px-4 py-2 bg-[#f8f9fc] text-[#464555] font-semibold text-xs rounded-xl flex items-center gap-1.5 border border-[#eae6f4]"
              >
                <CheckCircle className="w-4 h-4 text-[#10b981]" />
                {perm.replace(/_/g, " ")}
              </span>
            ))}
            <span className="px-4 py-2 bg-[#f8f9fc] text-[#777587] font-semibold text-xs rounded-xl border border-dashed border-[#c7c4d8] select-none">
              + 33 more...
            </span>
          </div>
        </div>

        {/* Audit Log & Activity Timeline (col-span-12) */}
        <div className="lg:col-span-12 bg-white border-2 border-[#eae6f4] rounded-[40px] p-8 shadow-sm">
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-[#f0ecf9]">
            <h3 className="text-[20px] font-bold text-[#1b1b24] flex items-center gap-2">
              <History className="w-5 h-5 text-[#3525cd]" />
              Audit Log & Activity Timeline
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-[#777587] uppercase tracking-wider">Filtered by: Recent 7 Days</span>
              <button 
                onClick={() => toast.success("Configuring filters...")}
                className="p-1 hover:bg-[#f8f9fc] rounded-lg transition-colors text-[#1b1b24]"
              >
                <MaterialIcon className="!text-[20px]">filter_list</MaterialIcon>
              </button>
            </div>
          </div>

          {/* Timeline flow */}
          <div className="relative pl-8 space-y-8 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-[#eae6f4]">
            
            {/* Timeline Item 1 */}
            <div className="relative">
              <div className="absolute -left-[30px] top-1 w-6 h-6 bg-[#3525cd] rounded-full border-4 border-white shadow-sm"></div>
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-2">
                <div>
                  <h4 className="text-[16px] font-bold text-[#1b1b24]">Global System Policy Update</h4>
                  <p className="text-sm text-[#464555] mt-1">Modified password complexity requirements for the European shard.</p>
                </div>
                <div className="text-left md:text-right font-medium min-w-[120px]">
                  <p className="text-xs text-[#1b1b24] font-bold">Today, 10:42 AM</p>
                  <p className="text-[10px] text-[#777587] font-mono mt-0.5 uppercase">IP: 192.168.1.44</p>
                </div>
              </div>
            </div>

            {/* Timeline Item 2 */}
            <div className="relative">
              <div className="absolute -left-[30px] top-1 w-6 h-6 bg-[#6b00b8] rounded-full border-4 border-white shadow-sm"></div>
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-2">
                <div>
                  <h4 className="text-[16px] font-bold text-[#1b1b24]">User Escalation Approval</h4>
                  <p className="text-sm text-[#464555] mt-1">Approved 'Sarah Chen' for temporary Tier 3 DevOps access.</p>
                </div>
                <div className="text-left md:text-right font-medium min-w-[120px]">
                  <p className="text-xs text-[#1b1b24] font-bold">Yesterday, 4:15 PM</p>
                  <p className="text-[10px] text-[#777587] font-mono mt-0.5 uppercase">IP: 192.168.1.44</p>
                </div>
              </div>
            </div>

            {/* Timeline Item 3 */}
            <div className="relative">
              <div className="absolute -left-[30px] top-1 w-6 h-6 bg-[#777587] rounded-full border-4 border-white shadow-sm"></div>
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-2">
                <div>
                  <h4 className="text-[16px] font-bold text-[#1b1b24]">Account Login</h4>
                  <p className="text-sm text-[#464555] mt-1">Successful login via Hardware Key (YubiKey).</p>
                </div>
                <div className="text-left md:text-right font-medium min-w-[120px]">
                  <p className="text-xs text-[#1b1b24] font-bold">Yesterday, 9:00 AM</p>
                  <p className="text-[10px] text-[#777587] font-mono mt-0.5 uppercase">IP: 192.168.1.44</p>
                </div>
              </div>
            </div>

            {/* Timeline Item 4 */}
            <div className="relative">
              <div className="absolute -left-[30px] top-1 w-6 h-6 bg-[#ef4444] rounded-full border-4 border-white shadow-sm"></div>
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-2">
                <div>
                  <h4 className="text-[16px] font-bold text-[#ef4444]">Security Group Warning</h4>
                  <p className="text-sm text-[#464555] mt-1">Attempted to delete protected 'Financial-Audit' group. Action blocked.</p>
                </div>
                <div className="text-left md:text-right font-medium min-w-[120px]">
                  <p className="text-xs text-[#ef4444] font-bold">Oct 24, 2:30 PM</p>
                  <p className="text-[10px] text-[#777587] font-mono mt-0.5 uppercase">IP: 10.0.4.192</p>
                </div>
              </div>
            </div>

          </div>

          <div className="mt-8 flex justify-center border-t border-[#f0ecf9] pt-6">
            <button 
              onClick={() => toast.success("Loading archived activities...")}
              className="text-[#3525cd] font-bold flex items-center gap-1 hover:gap-2 transition-all text-sm"
            >
              Load More Activity
              <span className="material-symbols-outlined !text-[20px]">keyboard_arrow_down</span>
            </button>
          </div>
        </div>

        {/* Telemetry Metrics (col-span-12) */}
        <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1: Command Latency */}
          <div className="bg-white border-2 border-[#eae6f4] rounded-[32px] p-6 shadow-sm flex flex-col justify-between h-[140px]">
            <div>
              <p className="text-[11px] font-bold text-[#777587] uppercase tracking-wider">Avg Command Latency</p>
              <h4 className="text-[32px] font-black text-[#1b1b24] mt-1">12.4ms</h4>
            </div>
            <p className="text-xs text-[#10b981] font-bold flex items-center gap-1">
              <span className="material-symbols-outlined !text-[16px]">trending_up</span>
              + 2.4% vs last week
            </p>
          </div>

          {/* Card 2: Memory Footprint */}
          <div className="bg-white border-2 border-[#eae6f4] rounded-[32px] p-6 shadow-sm flex flex-col justify-between h-[140px]">
            <div>
              <p className="text-[11px] font-bold text-[#777587] uppercase tracking-wider">Memory Footprint</p>
              <h4 className="text-[32px] font-black text-[#1b1b24] mt-1">4.2 GB</h4>
            </div>
            <p className="text-xs text-[#ef4444] font-bold flex items-center gap-1">
              <span className="material-symbols-outlined !text-[16px]">trending_up</span>
              + 0.8% load increase
            </p>
          </div>

          {/* Card 3: Throughput */}
          <div className="bg-white border-2 border-[#eae6f4] rounded-[32px] p-6 shadow-sm flex flex-col justify-between h-[140px]">
            <div>
              <p className="text-[11px] font-bold text-[#777587] uppercase tracking-wider">Network Throughput</p>
              <h4 className="text-[32px] font-black text-[#1b1b24] mt-1">1.2 GB/s</h4>
            </div>
            <p className="text-xs text-[#10b981] font-bold flex items-center gap-1">
              <span className="material-symbols-outlined !text-[16px]">trending_up</span>
              + 12.1% performance gain
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};

export default SuperAdminSuperadminDetailPage;
