import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { 
  useGetSuperadminQuery, 
  useUpdateSuperadminMutation 
} from "@/features/superadmin/superadminApiSlice";
import { ArrowLeft, Sparkles, ShieldCheck, Activity, Users, Lock, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import TextField from "@/components/input/TextField";

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

const schema = yup.object().shape({
  name: yup.string().required("Name is required"),
  designation: yup.string().nullable(),
  photo: yup.string().url("Must be a valid URL").nullable().transform((value, originalValue) => (originalValue === "" ? null : value)),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .nullable()
    .transform((value, originalValue) => (originalValue === "" ? null : value)),
  confirmPassword: yup
    .string()
    .when("password", {
      is: (val) => val && val.length > 0,
      then: (schema) =>
        schema
          .required("Please confirm password")
          .oneOf([yup.ref("password")], "Passwords must match"),
      otherwise: (schema) => schema.nullable(),
    }),
});

const SuperAdminSuperadminEditPage = () => {
  const { id } = useParams();
  const numericId = useMemo(() => Number(id), [id]);
  const navigate = useNavigate();

  const { data: superadmin, isLoading: isLoadingData } = useGetSuperadminQuery(numericId, { skip: !numericId });
  const [updateSuperadmin, { isLoading: isUpdating }] = useUpdateSuperadminMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      designation: "",
      photo: "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (superadmin) {
      reset({
        name: superadmin.name || "",
        designation: superadmin.designation || "",
        photo: superadmin.photo || "",
        password: "",
        confirmPassword: "",
      });
    }
  }, [superadmin, reset]);

  const onSubmit = async (data) => {
    try {
      const payload = {
        name: data.name,
        designation: data.designation || null,
        photo: data.photo || null,
        permissions: superadmin?.permissions || [],
      };

      if (data.password && data.password.length > 0) {
        payload.password = data.password;
      }

      await updateSuperadmin({
        id: numericId,
        ...payload,
      }).unwrap();
      toast.success("Super admin updated successfully");
      navigate("/superadmin/superadmins");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update super admin");
    }
  };

  if (isLoadingData) {
    return (
      <div className="max-w-[1440px] mx-auto space-y-8 pb-16">
        <div className="flex items-center justify-center py-20 text-[#777587]">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#3525cd] border-t-transparent mr-2"></div>
          <span>Loading super admin data...</span>
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
            <span className="text-[12px] font-semibold tracking-[0.05em] text-[#3525cd] uppercase font-mono">Edit Admin</span>
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
                Edit Super Admin
              </h3>
              <p className="text-[16px] text-[#777587] mt-1 max-w-2xl font-normal leading-relaxed">
                Update account details, designations, and reset login credentials for this administrative node.
              </p>
            </div>
          </div>
        </div>

        {/* Global actions */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/superadmin/superadmins")}
            className="h-11 px-5 rounded-xl border-[#eae6f4] text-[#1b1b24] hover:bg-[#f8f9fc] transition-all font-semibold"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isUpdating}
            className="h-11 px-6 rounded-xl bg-[#3525cd] text-white hover:bg-[#3525cd]/90 transition-all font-semibold shadow-lg shadow-[#3525cd]/20"
          >
            {isUpdating ? (
              <>
                <div className="w-4 h-4 mr-2 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </section>

      {/* Main Bento Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left main form card */}
        <div className="lg:col-span-8 bg-white border-2 border-[#eae6f4] rounded-[40px] p-8 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="border-b border-[#f0ecf9] pb-4 mb-6 flex justify-between items-center">
              <h4 className="text-[20px] font-semibold text-[#1b1b24] flex items-center gap-2">
                <MaterialIcon className="text-[#3525cd]">admin_panel_settings</MaterialIcon>
                Update Credentials
              </h4>
              <span className="text-xs font-mono text-[#777587] bg-[#eae6f4]/50 px-3 py-1 rounded-full uppercase tracking-wider">
                ID: #{superadmin?.id}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <TextField
                label="Name *"
                placeholder="Enter super admin name"
                register={register}
                name="name"
                error={errors.name}
                icon={<User size={18} />}
                inputClassName="bg-[#f8f9fc] border-2 border-[#eae6f4] focus:ring-2 focus:ring-[#3525cd]/20 focus:border-[#3525cd] rounded-2xl h-12"
              />

              {/* Email (Disabled/Read-only for security) */}
              <div className="flex flex-col gap-2">
                <label className="text-gray-700 dark:text-gray-300 text-sm font-medium ml-1">Email (Immutable)</label>
                <div className="relative opacity-60 cursor-not-allowed">
                  <span className="absolute top-1/2 -translate-y-1/2 left-3 text-gray-400">
                    <Mail size={18} />
                  </span>
                  <input
                    type="email"
                    disabled
                    value={superadmin?.email || ""}
                    className="w-full h-12 pl-11 pr-4 rounded-2xl border-2 border-[#eae6f4] bg-[#eae6f4]/30 text-gray-600 outline-none text-[14px] font-medium"
                  />
                </div>
              </div>

              {/* Designation */}
              <TextField
                label="Designation"
                placeholder="Enter designation (optional)"
                register={register}
                name="designation"
                error={errors.designation}
                icon={<MaterialIcon className="!text-[18px]">badge</MaterialIcon>}
                inputClassName="bg-[#f8f9fc] border-2 border-[#eae6f4] focus:ring-2 focus:ring-[#3525cd]/20 focus:border-[#3525cd] rounded-2xl h-12"
              />

              {/* Photo URL */}
              <TextField
                label="Photo URL"
                placeholder="Enter photo URL (optional)"
                register={register}
                name="photo"
                error={errors.photo}
                icon={<MaterialIcon className="!text-[18px]">link</MaterialIcon>}
                inputClassName="bg-[#f8f9fc] border-2 border-[#eae6f4] focus:ring-2 focus:ring-[#3525cd]/20 focus:border-[#3525cd] rounded-2xl h-12"
              />

              {/* Password */}
              <div className="md:col-span-2 space-y-4 pt-4 border-t border-[#f0ecf9]">
                <div className="bg-[#f8f9fc] p-4 rounded-2xl border border-dashed border-[#c7c4d8]">
                  <p className="text-sm font-medium text-[#464555] flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#3525cd]" />
                    Leave password fields empty to keep the current password.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <TextField
                    label="New Password"
                    type="password"
                    placeholder="Enter new password (optional)"
                    register={register}
                    name="password"
                    error={errors.password}
                    icon={<Lock size={18} />}
                    inputClassName="bg-[#f8f9fc] border-2 border-[#eae6f4] focus:ring-2 focus:ring-[#3525cd]/20 focus:border-[#3525cd] rounded-2xl h-12"
                  />

                  <TextField
                    label="Confirm New Password"
                    type="password"
                    placeholder="Re-enter new password"
                    register={register}
                    name="confirmPassword"
                    error={errors.confirmPassword}
                    icon={<Lock size={18} />}
                    inputClassName="bg-[#f8f9fc] border-2 border-[#eae6f4] focus:ring-2 focus:ring-[#3525cd]/20 focus:border-[#3525cd] rounded-2xl h-12"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Right sidebar column */}
        <div className="lg:col-span-4 space-y-6">
          {/* Security Guidelines Tip Card */}
          <div className="bg-gradient-to-br from-[#3525cd]/5 to-[#3525cd]/10 border-2 border-[#3525cd]/10 rounded-[32px] p-6 text-[#1b1b24]">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-[#3525cd]/10 text-[#3525cd]">
                <Sparkles className="w-5 h-5" />
              </div>
              <h5 className="text-[16px] font-bold text-[#3525cd]">Security Guidelines</h5>
            </div>
            <ul className="space-y-3 text-[13px] text-[#464555] font-medium list-disc list-inside leading-relaxed">
              <li>
                Admin email addresses are locked for security and auditing reasons.
              </li>
              <li>
                Ensure you verify the identity of the administrative node before resetting keys.
              </li>
              <li>
                All alterations will be immediately stamped inside system compliance logs.
              </li>
            </ul>
          </div>

          {/* System Context Indicators */}
          <div className="bg-white border-2 border-[#eae6f4] rounded-[32px] p-6 space-y-6">
            <h5 className="text-[18px] font-bold text-[#1b1b24]">Governance Context</h5>

            {/* Governance status */}
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-[#10b981]/10 text-[#10b981] mt-0.5">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[14px] font-bold text-[#1b1b24]">Audit Level compliance</p>
                <p className="text-[12px] text-[#777587] mt-0.5">
                  Currently verified at <span className="font-bold text-[#10b981]">100% SECURE</span> registry level.
                </p>
              </div>
            </div>

            {/* Access Level indicator */}
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-[#f59e0b]/10 text-[#f59e0b] mt-0.5">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[14px] font-bold text-[#1b1b24]">Privilege Level</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[12px] font-bold text-[#f59e0b] uppercase bg-[#f59e0b]/10 px-2 py-0.5 rounded-md">
                    Full Admin Access
                  </span>
                </div>
              </div>
            </div>

            {/* Active admins counts */}
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-[#3525cd]/10 text-[#3525cd] mt-0.5">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[14px] font-bold text-[#1b1b24]">Registry Members</p>
                <p className="text-[12px] text-[#777587] mt-0.5">
                  Root user cluster access limited to authorized administrative employees.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminSuperadminEditPage;
