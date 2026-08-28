import React, { useEffect, useMemo, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { useGetCurrentSuperadminQuery } from "@/features/superadminAuth/superadminAuthApiSlice";
import { useUpdateSuperadminMutation } from "@/features/superadmin/superadminApiSlice";
import { useUploadMediaMutation } from "@/features/media/mediaApiSlice";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const passwordSchema = yup.object().shape({
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
  confirmPassword: yup
    .string()
    .required("Please confirm password")
    .oneOf([yup.ref("password")], "Passwords must match"),
});

const profileSchema = yup.object().shape({
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  designation: yup.string().nullable(),
  photo: yup.string().nullable(),
  phone: yup.string().nullable(),
  bio: yup.string().nullable(),
});

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "-";

const resolvePermissions = (profileData) => {
  if (profileData?.permissions?.length) return profileData.permissions;

  return [
    "Operational Analytics / Owner",
    "Global Inventory Management / Admin",
    "Financial Audit Logs / Locked",
  ];
};

const resolvePermissionDescription = (name, isLocked) => {
  if (isLocked) {
    return "Requires higher tier executive Tier-2 authorization.";
  }
  const n = name.toLowerCase();
  if (n.includes("analytics")) return "Full access to create, edit, and export operational reports.";
  if (n.includes("inventory") || n.includes("product")) return "Read and write access to enterprise SKU catalog.";
  if (n.includes("audit") || n.includes("financial")) return "Requires executive tier 2 authorization.";
  if (n.includes("order")) return "Full access to view, update, and manage customer orders.";
  if (n.includes("security")) return "Root access to modify role assignments and global settings.";
  if (n.includes("user")) return "Access to view and moderate user account states.";
  if (n.includes("integration")) return "Configure third-party API payloads and sync status.";
  return "Read and write access to platform modules and settings.";
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

const SuperAdminProfilePage = () => {
  const { user } = useSelector((state) => state.superadminAuth);
  const { data: currentSuperadmin, isLoading: isLoadingProfile } =
    useGetCurrentSuperadminQuery();
  const [updateSuperadmin, { isLoading: isUpdating }] =
    useUpdateSuperadminMutation();
  const [uploadMedia, { isLoading: isUploading }] = useUploadMediaMutation();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const fileInputRef = useRef(null);

  const superadminId = user?.id || currentSuperadmin?.id;
  const profileData = currentSuperadmin || user;

  const [initialFirstName, initialLastName] = useMemo(() => {
    const name = currentSuperadmin?.name || user?.name || "";
    const spaceIndex = name.indexOf(" ");
    if (spaceIndex !== -1) {
      return [name.substring(0, spaceIndex), name.substring(spaceIndex + 1)];
    }
    return [name, ""];
  }, [currentSuperadmin, user]);

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    reset: resetProfile,
    watch: watchProfile,
    setValue: setProfileValue,
    formState: { errors: profileErrors },
  } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      firstName: initialFirstName,
      lastName: initialLastName,
      designation: currentSuperadmin?.designation || user?.designation || "",
      photo: currentSuperadmin?.photo || user?.photo || "",
      phone: currentSuperadmin?.phone || user?.phone || "+1 (555) 000-8888",
      bio: currentSuperadmin?.bio || user?.bio || "Leading global operations for Squadlog Enterprise, focusing on workflow automation.",
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm({
    resolver: yupResolver(passwordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (currentSuperadmin) {
      const name = currentSuperadmin.name || "";
      const spaceIndex = name.indexOf(" ");
      let fName = name;
      let lName = "";
      if (spaceIndex !== -1) {
        fName = name.substring(0, spaceIndex);
        lName = name.substring(spaceIndex + 1);
      }
      resetProfile({
        firstName: fName,
        lastName: lName,
        designation: currentSuperadmin.designation || "",
        photo: currentSuperadmin.photo || "",
        phone: currentSuperadmin.phone || "+1 (555) 000-8888",
        bio: currentSuperadmin.bio || "Leading global operations for Squadlog Enterprise, focusing on workflow automation.",
      });
    }
  }, [currentSuperadmin, resetProfile]);

  const protocolItems = useMemo(
    () => resolvePermissions(profileData),
    [profileData],
  );

  const permissionsMapped = useMemo(() => {
    return protocolItems.map((permission, index) => {
      const parts = permission.split("/");
      const name = parts[0]?.trim() || "Permission Block";
      const detail = parts[1]?.trim() || "Read-Write";
      
      const isLocked = detail.toLowerCase().includes("locked") || detail.toLowerCase().includes("no access");
      
      return {
        id: index,
        name,
        detail,
        isLocked,
        description: resolvePermissionDescription(name, isLocked),
      };
    });
  }, [protocolItems]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleRemovePhoto = () => {
    setSelectedFile(null);
    setPreviewUrl("");
    setProfileValue("photo", "");
  };

  const onProfileSubmit = async (data) => {
    if (!superadminId) {
      toast.error("User ID not found");
      return;
    }

    try {
      let photoUrl = data.photo;

      if (selectedFile) {
        const uploadResult = await uploadMedia({ file: selectedFile }).unwrap();

        if (uploadResult?.url || uploadResult?.data?.url) {
          photoUrl = uploadResult.url || uploadResult.data.url;
        } else {
          toast.error("Failed to upload image");
          return;
        }
      }

      await updateSuperadmin({
        id: superadminId,
        name: `${data.firstName} ${data.lastName}`.trim(),
        designation: data.designation || null,
        photo: photoUrl || null,
        phone: data.phone || null,
        bio: data.bio || null,
      }).unwrap();

      toast.success("Profile updated successfully");
      setSelectedFile(null);
      setPreviewUrl("");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update profile");
    }
  };

  const onPasswordSubmit = async (data) => {
    if (!superadminId) {
      toast.error("User ID not found");
      return;
    }

    try {
      await updateSuperadmin({
        id: superadminId,
        password: data.password,
      }).unwrap();

      toast.success("Password updated successfully");
      resetPassword();
      setIsPasswordModalOpen(false);
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update password");
    }
  };

  const discardChanges = () => {
    setSelectedFile(null);
    setPreviewUrl("");
    resetProfile();
    toast.success("Changes discarded");
  };

  if (isLoadingProfile && !profileData) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-[#eae6f4] text-[#777587]">
        <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-[#3525cd] border-t-transparent mr-2"></div>
        Loading operator profile...
      </div>
    );
  }

  const firstNameValue = watchProfile("firstName");
  const lastNameValue = watchProfile("lastName");
  const designationValue = watchProfile("designation");
  const fullName = `${firstNameValue || ""} ${lastNameValue || ""}`.trim() || "Alexander Sterling";
  const avatarSource = previewUrl || watchProfile("photo") || profileData?.photo;

  return (
    <div className="max-w-[1440px] mx-auto space-y-12">
      {/* Page Header */}
      <section className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div>
          <div className="mb-2 flex items-center gap-1.5 text-xs text-[#777587]">
            <span className="font-semibold uppercase tracking-wider text-[#777587]">ACCOUNT</span>
            <MaterialIcon className="text-sm" data-icon="chevron_right">chevron_right</MaterialIcon>
            <span className="font-semibold uppercase tracking-wider text-[#3525cd]">PROFILE SETTINGS</span>
          </div>
          <h2 className="text-[32px] font-bold tracking-tight text-[#1b1b24] leading-tight">
            My Profile
          </h2>
          <p className="text-sm text-[#777587] mt-1">
            Manage your personal information, security, and application permissions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={discardChanges}
            className="px-6 py-3 rounded-2xl border border-[#c7c4d8] bg-white font-bold text-xs text-[#1b1b24] hover:bg-[#f5f2ff] active:scale-95 transition-all"
          >
            Discard Changes
          </button>
          <button 
            type="button"
            onClick={handleSubmitProfile(onProfileSubmit)}
            disabled={isUpdating || isUploading}
            className="px-6 py-3 rounded-2xl bg-[#3525cd] text-white font-bold text-xs shadow-lg shadow-[#3525cd]/20 hover:scale-105 active:scale-95 transition-all"
          >
            {isUpdating || isUploading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </section>

      {/* Hidden File Input */}
      <input 
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Profile Content Grid */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Photo & Basic Info Sidebar (Span 4) */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          
          {/* Photo Card */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-[#eae6f4] flex flex-col items-center text-center">
            <div className="relative group cursor-pointer" onClick={triggerFileSelect}>
              <div className="w-32 h-32 rounded-3xl overflow-hidden shadow-xl ring-4 ring-[#e2dfff]">
                {avatarSource ? (
                  <img 
                    src={avatarSource} 
                    alt="Operator Avatar" 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-[#f0ecf9] text-[#3525cd] flex items-center justify-center font-bold text-3xl">
                    {fullName ? fullName.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) : "SA"}
                  </div>
                )}
              </div>
              <div className="absolute inset-0 bg-[#3525cd]/40 rounded-3xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <MaterialIcon className="text-white text-[32px]">photo_camera</MaterialIcon>
              </div>
              <div className="absolute -bottom-2 -right-2 bg-[#10b981] text-white p-2 rounded-xl shadow-lg border-4 border-white">
                <MaterialIcon className="text-[18px]">check_circle</MaterialIcon>
              </div>
            </div>
            <div className="mt-6">
              <h3 className="text-xl font-bold text-[#1b1b24]">{fullName}</h3>
              <p className="text-xs font-bold text-[#3525cd] mt-1 uppercase tracking-wider">{designationValue || "Operations Director"}</p>
              <p className="text-sm text-[#777587] mt-3">United States • Central Time</p>
            </div>
            <div className="mt-8 flex gap-4 w-full">
              <button 
                type="button"
                onClick={triggerFileSelect}
                className="flex-1 py-2 rounded-xl bg-[#f5f2ff] text-[#1b1b24] font-semibold text-xs border border-[#c7c4d8]/30 hover:border-[#3525cd] hover:bg-[#e2dfff]/20 transition-all"
              >
                Upload New
              </button>
              <button 
                type="button"
                onClick={handleRemovePhoto}
                className="flex-1 py-2 rounded-xl text-[#ef4444] font-semibold text-xs hover:bg-[#ffdad6]/20 transition-all"
              >
                Remove
              </button>
            </div>
          </div>

          {/* Account Summary */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-[#eae6f4]">
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#777587] mb-6">Account Summary</h4>
            <div className="space-y-6">
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#777587]">Member since</span>
                <span className="font-bold text-[#1b1b24]">
                  {profileData?.createdAt ? new Date(profileData.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "March 2021"}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#777587]">Plan type</span>
                <span className="px-2 py-0.5 bg-[#f0dbff] text-[#6b00b8] rounded-md text-[10px] font-bold uppercase">
                  {profileData?.role || "Enterprise Plus"}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#777587]">Last login</span>
                <span className="text-[#1b1b24]">2 hours ago</span>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-[#f0ecf9] flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[#3525cd]">
                <MaterialIcon className="text-[20px]">verified_user</MaterialIcon>
                <span className="text-xs font-bold uppercase tracking-wider">2FA Active</span>
              </div>
              <button 
                type="button"
                onClick={() => setIsPasswordModalOpen(true)}
                className="text-[#3525cd] hover:underline font-bold text-xs"
              >
                Manage Security
              </button>
            </div>
          </div>

        </div>

        {/* Personal Info & Details Forms (Span 8) */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          
          {/* Personal Info Card */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-[#eae6f4]">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 bg-[#e2dfff] rounded-2xl text-[#3525cd]">
                <MaterialIcon>person</MaterialIcon>
              </div>
              <h3 className="text-xl font-bold text-[#1b1b24]">Personal Information</h3>
            </div>
            
            <form onSubmit={handleSubmitProfile(onProfileSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#777587] uppercase tracking-wider ml-1">First Name</label>
                <input 
                  type="text" 
                  {...registerProfile("firstName")}
                  className="w-full px-6 py-4 bg-[#f5f2ff] border-transparent rounded-2xl focus:ring-2 focus:ring-[#3525cd] focus:bg-white focus:border-transparent transition-all text-sm text-[#1b1b24]"
                />
                {profileErrors.firstName && (
                  <p className="text-xs text-red-500 font-semibold">{profileErrors.firstName.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#777587] uppercase tracking-wider ml-1">Last Name</label>
                <input 
                  type="text" 
                  {...registerProfile("lastName")}
                  className="w-full px-6 py-4 bg-[#f5f2ff] border-transparent rounded-2xl focus:ring-2 focus:ring-[#3525cd] focus:bg-white focus:border-transparent transition-all text-sm text-[#1b1b24]"
                />
                {profileErrors.lastName && (
                  <p className="text-xs text-red-500 font-semibold">{profileErrors.lastName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#777587] uppercase tracking-wider ml-1">Email Address</label>
                <input 
                  type="email" 
                  disabled
                  value={profileData?.email || ""}
                  className="w-full px-6 py-4 bg-[#f5f2ff]/60 border-transparent rounded-2xl text-sm text-gray-500 cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#777587] uppercase tracking-wider ml-1">Phone Number</label>
                <input 
                  type="text" 
                  {...registerProfile("phone")}
                  className="w-full px-6 py-4 bg-[#f5f2ff] border-transparent rounded-2xl focus:ring-2 focus:ring-[#3525cd] focus:bg-white focus:border-transparent transition-all text-sm text-[#1b1b24]"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-[#777587] uppercase tracking-wider ml-1">Designation</label>
                <input 
                  type="text" 
                  {...registerProfile("designation")}
                  className="w-full px-6 py-4 bg-[#f5f2ff] border-transparent rounded-2xl focus:ring-2 focus:ring-[#3525cd] focus:bg-white focus:border-transparent transition-all text-sm text-[#1b1b24]"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-[#777587] uppercase tracking-wider ml-1">Bio / Professional Summary</label>
                <textarea 
                  rows="3" 
                  {...registerProfile("bio")}
                  className="w-full px-6 py-4 bg-[#f5f2ff] border-transparent rounded-2xl focus:ring-2 focus:ring-[#3525cd] focus:bg-white focus:border-transparent transition-all text-sm text-[#1b1b24] resize-none"
                />
              </div>
            </form>
          </div>

          {/* Permissions List */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-[#eae6f4]">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-[#b7eaff] rounded-2xl text-[#006780]">
                  <MaterialIcon>vpn_key</MaterialIcon>
                </div>
                <h3 className="text-xl font-bold text-[#1b1b24]">Application Permissions</h3>
              </div>
              <button 
                type="button"
                onClick={() => toast.success("Access request sent to compliance root admins.")}
                className="flex items-center gap-1.5 text-xs font-bold text-[#3525cd] hover:translate-x-1 transition-transform"
              >
                <span>Request Access</span>
                <MaterialIcon className="text-[16px]">open_in_new</MaterialIcon>
              </button>
            </div>

            <div className="space-y-4">
              {permissionsMapped.map((perm) => (
                <div 
                  key={perm.id} 
                  className={`group flex items-center justify-between p-6 border border-[#f0ecf9] rounded-2xl hover:border-[#3525cd]/20 transition-all ${
                    perm.isLocked ? "bg-white opacity-60 grayscale-[0.5]" : "bg-white"
                  }`}
                >
                  <div className="flex items-center gap-6">
                    <div className={`p-2 rounded-full ${
                      perm.isLocked ? "bg-[#464555]/10 text-[#464555]" : "bg-[#10b981]/15 text-[#10b981]"
                    }`}>
                      <MaterialIcon className="text-[20px]">
                        {perm.isLocked ? "lock" : "check"}
                      </MaterialIcon>
                    </div>
                    <div>
                      <h5 className="font-semibold text-sm text-[#1b1b24]">{perm.name}</h5>
                      <p className="text-xs text-[#777587] mt-1">{perm.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <span className={`px-2 py-[2px] rounded text-[10px] font-bold uppercase tracking-wider ${
                      perm.isLocked 
                        ? "bg-[#ffdad6] text-[#93000a]" 
                        : "bg-[#eae6f4] text-[#464555]"
                    }`}>
                      {perm.isLocked ? "NO ACCESS" : perm.detail}
                    </span>
                    {perm.isLocked ? (
                      <button 
                        type="button"
                        className="p-1 text-[#777587] hover:text-[#3525cd] transition-all"
                        onClick={() => toast.success(`Access request initiated for ${perm.name}`)}
                      >
                        <MaterialIcon className="text-lg">arrow_forward</MaterialIcon>
                      </button>
                    ) : (
                      <button 
                        type="button"
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-50 rounded-lg text-[#777587] transition-all"
                        onClick={() => toast.success(`Configuration options for ${perm.name}`)}
                      >
                        <MaterialIcon className="text-lg">more_vert</MaterialIcon>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Decorative footer label */}
      <div className="text-center pt-4 pb-8">
        <p className="text-[10px] font-extrabold uppercase text-[#777587]/40 tracking-[0.2em]">
          SQUADLOG ENTERPRISE V4.2.0 • BUILT FOR PERFORMANCE
        </p>
      </div>

      {/* Change Password Dialog */}
      <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
        <DialogContent className="overflow-hidden rounded-[32px] border border-[#eae6f4] bg-white p-0 text-[#1b1b24] max-w-md mx-auto">
          <DialogHeader className="border-b border-[#f0ecf9] bg-gradient-to-br from-[#3525cd]/5 to-transparent px-6 py-6">
            <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-[#1b1b24]">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#3525cd]/15 bg-[#3525cd]/5 text-[#3525cd]">
                <MaterialIcon>key</MaterialIcon>
              </div>
              Change Password
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="space-y-6 p-6">
            <div className="rounded-2xl border border-[#e2dfff] bg-[#f0ecf9]/20 p-4 text-xs leading-relaxed text-[#777587] font-semibold">
              Ensure your account stays secure by choosing a strong, unique password.
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#777587] uppercase tracking-wider ml-1">New Password</label>
                <input 
                  type="password" 
                  {...registerPassword("password")}
                  placeholder="Enter new password"
                  className="w-full px-6 py-4 bg-[#f5f2ff] border-transparent rounded-2xl focus:ring-2 focus:ring-[#3525cd] focus:bg-white focus:border-transparent transition-all text-sm text-[#1b1b24]"
                />
                {passwordErrors.password && (
                  <p className="text-xs text-red-500 font-semibold">{passwordErrors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#777587] uppercase tracking-wider ml-1">Confirm New Password</label>
                <input 
                  type="password" 
                  {...registerPassword("confirmPassword")}
                  placeholder="Re-enter new password"
                  className="w-full px-6 py-4 bg-[#f5f2ff] border-transparent rounded-2xl focus:ring-2 focus:ring-[#3525cd] focus:bg-white focus:border-transparent transition-all text-sm text-[#1b1b24]"
                />
                {passwordErrors.confirmPassword && (
                  <p className="text-xs text-red-500 font-semibold">{passwordErrors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            <DialogFooter className="flex gap-3 sm:justify-start">
              <button
                type="button"
                className="h-12 rounded-2xl border border-[#c7c4d8] bg-transparent text-[#1b1b24] hover:bg-[#f5f2ff] px-6 font-semibold text-sm active:scale-95 transition-all"
                onClick={() => {
                  resetPassword();
                  setIsPasswordModalOpen(false);
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUpdating}
                className="h-12 rounded-2xl bg-[#3525cd] text-white hover:bg-[#3525cd]/90 px-6 font-semibold text-sm shadow-md shadow-[#3525cd]/20 active:scale-95 transition-all"
              >
                {isUpdating ? "Updating..." : "Update Password"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default SuperAdminProfilePage;
