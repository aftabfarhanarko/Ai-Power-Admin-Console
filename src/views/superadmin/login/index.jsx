import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Eye, EyeOff, Hexagon, Loader2 } from "lucide-react";

// Hooks and function
import { superadminLoggedIn } from "@/features/superadminAuth/superadminAuthSlice";
import { useSuperadminLoginMutation } from "@/features/superadminAuth/superadminAuthApiSlice";

/**
 * Premium Super Admin Login Page for SquadCart Console.
 * Exact same design as the main LoginPage but dedicated to Super Admin authentication.
 */
const SuperAdminLoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Form handling using react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // RTK Query mutation for superadmin login
  const [superadminLogin, { isLoading }] = useSuperadminLoginMutation();

  /**
   * Handles the superadmin login submission.
   * @param {Object} data - Email and password from the form.
   */
  const onSubmit = async (data) => {
    try {
      const result = await superadminLogin({
        email: data.email,
        password: data.password,
      }).unwrap();
      
      // Verify response structure
      if (result && result.accessToken) {
        dispatch(superadminLoggedIn({
          accessToken: result.accessToken,
          refreshToken: result.refreshToken || null,
          user: result.user || null,
        }));
        toast.success(t("auth.superadminLoginSuccess") || "Super Admin Login Successful!");
        navigate("/superadmin", { replace: true });
      } else {
        toast.error("Login failed: Invalid response from server.");
      }
    } catch (error) {
      console.error("Superadmin login error:", error);
      toast.error(
        error?.data?.message || 
        error?.message || 
        "Invalid email or password!"
      );
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--primary-green)]/30 transition-colors duration-300">
      {/* LEFT SIDE - FORM SECTION */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 md:p-16 lg:p-24 bg-[var(--background)] relative">
        <div className="w-full max-w-md space-y-8">
          {/* Logo Section */}
          <div className="flex items-center gap-2 mb-10">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-[var(--primary-green)] p-2.5 rounded-xl text-black group-hover:rotate-12 transition-all duration-300 shadow-lg shadow-[var(--primary-green)]/20">
                <Hexagon size={26} fill="currentColor" className="text-black" />
              </div>
              <span className="text-2xl font-bold text-[var(--foreground)] tracking-tight">
                SquadCart <span className="text-[var(--primary-green)]">Console</span>
              </span>
            </Link>
          </div>

          {/* Header Texts */}
          <div className="space-y-2">
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl font-bold tracking-tight"
            >
              Super Admin
            </motion.h1>
            <p className="text-[var(--muted-text)] text-sm font-medium">
              Enter your credentials to access the super admin panel.
            </p>
          </div>

          {/* Modern Visual Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--border-color)] to-[var(--border-color)]"></div>
            <div className="w-2 h-2 rounded-full bg-[var(--primary-green)]/40"></div>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent via-[var(--border-color)] to-[var(--border-color)]"></div>
          </div>

          {/* Login Form */}
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold ml-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="username email"
                {...register("email", { required: true })}
                placeholder="superadmin@squadcart.com"
                className={`w-full px-4 py-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--surface)] text-[var(--foreground)] placeholder-[var(--muted-dark)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)]/50 focus:border-[var(--primary-green)] transition-all ${errors.email ? 'border-red-500' : ''}`}
                disabled={isLoading}
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label htmlFor="password" className="block text-sm font-semibold">
                  Password
                </label>
              </div>
              <div className="relative group">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  {...register("password", { required: true })}
                  placeholder="••••••••"
                  className={`w-full px-4 py-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--surface)] text-[var(--foreground)] placeholder-[var(--muted-dark)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)]/50 focus:border-[var(--primary-green)] transition-all ${errors.password ? 'border-red-500' : ''}`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted-dark)] hover:text-[var(--foreground)] transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Auth Info */}
            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-5 h-5 border-2 border-[var(--border-color)] rounded-md bg-[var(--surface)] peer-checked:bg-[var(--primary-green)] peer-checked:border-[var(--primary-green)] transition-all"></div>
                  <svg className="absolute top-0.5 left-0.5 w-4 h-4 text-black opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-[var(--muted-text)] group-hover:text-[var(--foreground)] transition-colors">
                  Keep me logged in
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 px-4 bg-[var(--primary-green)] hover:brightness-110 active:scale-[0.98] text-black font-black text-base rounded-xl shadow-xl shadow-[var(--primary-green-glow)] transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 size={22} className="animate-spin" />
              ) : (
                <>
                  Sign into Admin Panel
                  <Hexagon size={18} fill="currentColor" className="group-hover:rotate-180 transition-transform duration-700" />
                </>
              )}
            </button>
          </form>

          {/* Footer Info */}
          <div className="text-center mt-10">
            <p className="text-xs text-[var(--muted-dark)] uppercase tracking-widest font-bold">
              Secure Infrastructure • Enterprise Ready
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - PREMIUM HERO SECTION */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-[var(--deep-green-start)] via-[#014a30] to-[#0a2a1a] relative overflow-hidden items-center justify-center p-12">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_50%_40%,rgba(57,255,20,0.12),transparent_70%)] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[var(--primary-green)]/10 blur-[100px] rounded-full"></div>
        
        <div className="relative z-10 w-full max-w-lg">
          <div className="mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl xl:text-7xl font-light text-white leading-[1.1] tracking-tight"
            >
              Control <br />
              <span className="font-serif italic font-medium text-[var(--primary-green)]">the Ecosystem</span> <br />
              at full scale
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-6 text-lg text-white/60 font-medium max-w-md"
            >
              Access the master control layer for all merchants and operations across the platform.
            </motion.p>
          </div>

          {/* Premium Glassmorphic Visuals */}
          <div className="relative h-[300px] w-full mt-10">
            {/* Main Dashboard Card Preview */}
            <motion.div
              initial={{ opacity: 0, x: 50, rotate: -2 }}
              animate={{ opacity: 1, x: 0, rotate: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="absolute right-0 top-0 w-[320px] h-[380px] bg-white/10 backdrop-blur-2xl rounded-3xl p-8 border border-white/10 shadow-3xl z-20 flex flex-col justify-between"
            >
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-2xl bg-[var(--primary-green)] flex items-center justify-center shadow-lg shadow-[var(--primary-green)]/30">
                  <Hexagon size={24} className="text-black" fill="currentColor" />
                </div>
                <div className="px-3 py-1 bg-white/10 rounded-full border border-white/10">
                  <span className="text-[10px] font-bold text-white tracking-widest uppercase">Platform Stats</span>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <p className="text-xs text-white/50 mb-1 font-semibold uppercase tracking-wider text-left">Total Ecosystem GMV</p>
                  <h3 className="text-4xl font-black text-white leading-none">৳42.8M</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs font-bold text-[var(--primary-green)] bg-[var(--primary-green)]/10 px-2 py-0.5 rounded">+8.2%</span>
                    <span className="text-[10px] text-white/30 tracking-wide font-medium">Growth vs last period</span>
                  </div>
                </div>

                <div className="space-y-3 pt-6 border-t border-white/5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-white/40 uppercase tracking-tighter">Active Merchants</span>
                    <span className="text-white">1,248</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: "85%" }}
                      transition={{ duration: 1.5, delay: 1 }}
                      className="h-full bg-[var(--primary-green)]"
                    ></motion.div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Smaller floating element */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="absolute -left-10 bottom-0 w-[200px] bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/5 shadow-2xl z-30"
            >
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                  </div>
                  <div>
                    <p className="text-[10px] text-white/40 font-bold uppercase">SuperAdmin Status</p>
                    <p className="text-xs text-white font-bold">Authorized</p>
                  </div>
               </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminLoginPage;
