import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useCreateSuperadminMutation } from "@/features/superadmin/superadminApiSlice";
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
  email: yup
    .string()
    .required("Email is required")
    .email("Please enter a valid email address"),
  designation: yup.string().nullable(),
  photo: yup.string().url("Must be a valid URL").nullable().transform((value, originalValue) => (originalValue === "" ? null : value)),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
  confirmPassword: yup
    .string()
    .required("Please confirm password")
    .oneOf([yup.ref("password")], "Passwords must match"),
});

const SuperAdminSuperadminCreatePage = () => {
  const navigate = useNavigate();
  const [createSuperadmin, { isLoading }] = useCreateSuperadminMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      designation: "",
      photo: "",
      password: "",
      confirmPassword: "",
      permissions: [],
    },
  });

  const onSubmit = async (data) => {
    try {
      const payload = {
        name: data.name,
        email: data.email,
        designation: data.designation || null,
        photo: data.photo || null,
        password: data.password,
        permissions: [], // Default empty array or role-based default permissions
      };

      await createSuperadmin(payload).unwrap();
      toast.success("Super admin created successfully");
      navigate("/superadmin/superadmins");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to create super admin");
    }
  };

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
            <span className="text-[12px] font-semibold tracking-[0.05em] text-[#3525cd] uppercase font-mono">Initialize Admin</span>
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
                Create Super Admin
              </h3>
              <p className="text-[16px] text-[#777587] mt-1 max-w-2xl font-normal leading-relaxed">
                Add a new administrative node with secure credentials to manage root infrastructure operations.
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
            disabled={isLoading}
            className="h-11 px-6 rounded-xl bg-[#3525cd] text-white hover:bg-[#3525cd]/90 transition-all font-semibold shadow-lg shadow-[#3525cd]/20"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 mr-2 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                Creating...
              </>
            ) : (
              "Create Admin"
            )}
          </Button>
        </div>
      </section>

      {/* Main Bento Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left main form card */}
        <div className="lg:col-span-8 bg-white border-2 border-[#eae6f4] rounded-[40px] p-8 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="border-b border-[#f0ecf9] pb-4 mb-6">
              <h4 className="text-[20px] font-semibold text-[#1b1b24] flex items-center gap-2">
                <MaterialIcon className="text-[#3525cd]">admin_panel_settings</MaterialIcon>
                Account Credentials
              </h4>
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

              {/* Email */}
              <TextField
                label="Email *"
                type="email"
                placeholder="Enter email address"
                register={register}
                name="email"
                error={errors.email}
                icon={<Mail size={18} />}
                inputClassName="bg-[#f8f9fc] border-2 border-[#eae6f4] focus:ring-2 focus:ring-[#3525cd]/20 focus:border-[#3525cd] rounded-2xl h-12"
              />

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
              <TextField
                label="Password *"
                type="password"
                placeholder="Enter password (min. 6 characters)"
                register={register}
                name="password"
                error={errors.password}
                icon={<Lock size={18} />}
                inputClassName="bg-[#f8f9fc] border-2 border-[#eae6f4] focus:ring-2 focus:ring-[#3525cd]/20 focus:border-[#3525cd] rounded-2xl h-12"
              />

              {/* Confirm Password */}
              <TextField
                label="Confirm Password *"
                type="password"
                placeholder="Re-enter password"
                register={register}
                name="confirmPassword"
                error={errors.confirmPassword}
                icon={<Lock size={18} />}
                inputClassName="bg-[#f8f9fc] border-2 border-[#eae6f4] focus:ring-2 focus:ring-[#3525cd]/20 focus:border-[#3525cd] rounded-2xl h-12"
              />
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
                Ensure you use a corporate email domain to set up administrative users.
              </li>
              <li>
                Passwords must contain letters, numbers, and symbols to maximize entropy levels.
              </li>
              <li>
                New administrator activity logs will be monitored in real-time under root auditing policies.
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

export default SuperAdminSuperadminCreatePage;
