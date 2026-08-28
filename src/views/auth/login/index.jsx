import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Eye, EyeOff, Hexagon, Loader2 } from "lucide-react";

// Hooks and function
import { userLoggedIn } from "@/features/auth/authSlice";
import { superadminLoggedIn } from "@/features/superadminAuth/superadminAuthSlice";
import { decodeJWT } from "@/utils/jwt-decoder";

/**
 * Premium Login Page for SquadCart Console.
 * Migrated design from squadcart-frontend with full console logic integration.
 */
const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const { isAuthenticated } = useSelector((state) => state.auth);
  const { isAuthenticated: isSuperAdminAuth } = useSelector((state) => state.superadminAuth);
  const initialAuthSnapshot = useRef({
    merchant: isAuthenticated,
    superadmin: isSuperAdminAuth,
  });

  // Redirect if already logged in
  useEffect(() => {
    // Only auto-redirect when the page opens with an already-authenticated session.
    // Fresh login submits handle navigation directly inside `onSubmit`.
    if (initialAuthSnapshot.current.merchant && isAuthenticated) {
      navigate("/", { replace: true });
    } else if (initialAuthSnapshot.current.superadmin && isSuperAdminAuth) {
      navigate("/superadmin", { replace: true });
    }
  }, [isAuthenticated, isSuperAdminAuth, navigate]);

  // Extract initial email/token from search params if redirecting from registration/email
  const searchParams = new URLSearchParams(location.search);
  const emailParam = searchParams.get("email");

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Form handling using react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: emailParam || "",
      password: "",
    },
  });

  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handles the login submission.
   * @param {Object} data - Email and password from the form.
   */
  const onSubmit = async (data) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          Accept: "application/json",
        },
        body: JSON.stringify({
          ...data,
          rememberMe,
        }),
      });

      const rawPayload = await response.text();
      let responseData = {};

      if (rawPayload) {
        try {
          responseData = JSON.parse(rawPayload);
        } catch {
          responseData = { message: rawPayload };
        }
      }

      if (!response.ok) {
        throw {
          data: responseData,
          message:
            responseData?.message ||
            response.statusText ||
            "Login failed. Please check your credentials.",
        };
      }

      // Backend returns { accessToken, refreshToken, user }
      const accessToken = responseData?.accessToken || responseData?.data?.accessToken;
      const refreshToken = responseData?.refreshToken || responseData?.data?.refreshToken;
      const user = responseData?.user || responseData?.data?.user;

      if (!accessToken) {
        toast.error(t("auth.loginAccessTokenMissing") || "Access token missing.");
        return;
      }

      // 🔍 Decode token to detect role for unified redirection
      const { payload } = decodeJWT(accessToken);
      console.log("[LoginPage] Decoded Payload:", payload);
      
      // Robust role detection: check payload first, then user object, case-insensitive
      const rawRole = payload?.role || user?.role || "";
      console.log("[LoginPage] Detected Raw Role:", rawRole);
      
      const isSuperAdmin = typeof rawRole === 'string' && rawRole.toUpperCase() === "SUPER_ADMIN";
      console.log("[LoginPage] Is Super Admin?", isSuperAdmin);

      if (isSuperAdmin) {
        console.log("[LoginPage] Processing Super Admin login...");
        // Update superadmin auth state
        dispatch(superadminLoggedIn({ accessToken, refreshToken, user }));
        toast.success(t("auth.superadminLoginSuccess") || "Welcome Super Admin!");
        
        // Ensure we go to the superadmin dashboard
        console.log("[LoginPage] Navigating to /superadmin");
        navigate("/superadmin", { replace: true });
        return;
      }

      console.log("[LoginPage] Processing Merchant login...");
      // Update regular merchant auth state
      dispatch(userLoggedIn({ accessToken, refreshToken, rememberMe }));
      toast.success(t("auth.loginSuccess") || "Successfully logged in!");
      
      // Navigate to merchant dashboard or previous location
      const from = location.state?.from?.pathname || "/";
      console.log("[LoginPage] Navigating to:", from);
      navigate(from, { replace: true });
    } catch (error) {
      console.error("Login session error:", error);
      toast.error(
        error?.data?.message || 
        error?.message || 
        t("auth.loginFailedTryAgain") || 
        "Login failed. Please check your credentials."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-[#050816] relative overflow-hidden text-white">
      {/* Background Canvas Overlays */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(124,92,255,0.1),transparent_40%),linear-gradient(180deg,#050816_0%,#080b18_50%,#050816_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:80px_80px] opacity-[0.08]" />
      </div>

      {/* LEFT SIDE - FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 md:p-12 lg:p-16 relative z-10">
        <div className="w-full max-w-[360px] space-y-6">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-6">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-[#7c5cff]/10 p-1.5 rounded-lg text-[#7c5cff] border border-[#7c5cff]/20 group-hover:scale-105 transition-transform">
                <Hexagon size={18} fill="currentColor" className="text-[#7c5cff]" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                SquadCart <span className="text-[#7c5cff] text-[10px] uppercase font-bold ml-1 px-1.5 py-0.5 rounded bg-[#7c5cff]/10 border border-[#7c5cff]/20">Console</span>
              </span>
            </Link>
          </div>

          {/* Header */}
          <div className="space-y-1.5">
            <h1 className="text-2xl font-semibold text-white tracking-tight">
              {t("auth.welcomeBack") || "Welcome Back"}
            </h1>
            <p className="text-white/50 text-xs">
              {t("auth.loginHeaderSubtitle") || "Enter your credentials to access the console."}
            </p>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-white/[0.06] my-4"></div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            {/* Email Field */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-[10px] font-semibold uppercase tracking-wider text-white/40">
                {t("auth.emailLabel") || "Email Address"}
              </label>
              <input
                id="email"
                type="email"
                {...register("email", { required: true })}
                placeholder="hi@squadcart.com"
                className={`w-full px-3 py-2.5 rounded-lg text-sm border bg-white/[0.03] text-white placeholder-white/20 focus:outline-none focus:bg-white/[0.05] focus:border-[#7c5cff] focus:ring-4 focus:ring-[#7c5cff]/10 transition-all ${errors.email ? 'border-red-500/50' : 'border-white/[0.08]'}`}
                disabled={isLoading}
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-[10px] font-semibold uppercase tracking-wider text-white/40">
                  {t("auth.passwordLabel") || "Password"}
                </label>
                <Link to="/forgot-password" className="text-[10px] font-semibold uppercase tracking-wider text-white/40 hover:text-[#7c5cff] transition-colors">
                  {t("auth.forgotPassword") || "Forgot?"}
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register("password", { required: true })}
                  placeholder="••••••••"
                  className={`w-full px-3 py-2.5 rounded-lg text-sm border bg-white/[0.03] text-white placeholder-white/20 focus:outline-none focus:bg-white/[0.05] focus:border-[#7c5cff] focus:ring-4 focus:ring-[#7c5cff]/10 transition-all ${errors.password ? 'border-red-500/50' : 'border-white/[0.08]'}`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Keep me logged in */}
            <div className="flex items-center justify-between py-1">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-4 h-4 border border-white/[0.12] rounded bg-white/[0.02] peer-checked:bg-[#7c5cff] peer-checked:border-[#7c5cff] transition-all"></div>
                  <svg className="absolute top-0 left-0 w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-[11px] font-medium text-white/50 group-hover:text-white transition-colors">
                  {t("auth.rememberMe") || "Keep me logged in"}
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-[#7c5cff] to-[#6366f1] hover:from-[#6c4be0] hover:to-[#4f46e5] text-white font-medium rounded-lg shadow-lg shadow-[#7c5cff]/10 hover:shadow-[#7c5cff]/20 transform transition-all hover:scale-[1.01] active:scale-[0.99] text-sm flex items-center justify-center gap-2 group disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  {t("auth.loginToDashboard") || "Sign into Console"}
                </>
              )}
            </button>
          </form>

          {/* Footer Info */}
          <div className="text-center mt-4">
            <p className="text-[10px] text-white/30 uppercase tracking-widest font-semibold">
              {t("auth.protectedBySecurity") || "Secure Infrastructure • Enterprise Ready"}
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - HERO */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden items-center justify-center p-12 z-10 border-l border-white/[0.04] bg-white/[0.01]">
        <div className="relative z-10 w-full max-w-md">
          <div className="mb-10 text-left">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-3xl md:text-4xl font-light text-white/90 leading-[1.2] tracking-tight"
            >
              Enter <br />
              <span className="font-serif italic font-medium text-[#7c5cff] drop-shadow-[0_0_15px_rgba(124,92,255,0.2)]">the Future</span> <br />
              of Commerce, today
            </motion.h2>
          </div>

          {/* Glassmorphic Cards Container */}
          <div className="relative w-[300px] h-[320px] mx-auto mt-10">
            {/* Background glow orb behind mockups */}
            <div className="absolute -inset-10 bg-[radial-gradient(circle_at_center,rgba(124,92,255,0.12),transparent_70%)] blur-2xl pointer-events-none" />

            {/* Dot navigation bar on the left */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="absolute left-0 top-6 w-[48px] h-[190px] bg-white/[0.03] backdrop-blur-md rounded-2xl border border-white/10 flex flex-col items-center justify-between py-4 shadow-lg z-10"
            >
              <div className="w-7 h-7 rounded-lg bg-[#7c5cff] flex items-center justify-center shadow-[0_0_8px_rgba(124,92,255,0.4)] transform -rotate-12">
                <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
              </div>
              <div className="flex flex-col gap-1.5">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-1 h-1 rounded-full bg-white/30"></div>
                ))}
              </div>
              <div className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center">
                <span className="text-[8px] text-white/60">⚙</span>
              </div>
            </motion.div>

            {/* Visa Card on the right */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="absolute right-0 top-0 w-[230px] h-[280px] bg-[#0d0f1c]/80 backdrop-blur-xl rounded-2xl p-5 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.4)] z-20 flex flex-col justify-between"
            >
              <div className="flex justify-between items-start">
                <Hexagon size={22} className="text-[#7c5cff] rotate-12" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-0.5">৳12,347</h3>
                <p className="text-[10px] text-white/40 mb-4">Combined balance</p>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] font-semibold text-white/80">Primary Card</p>
                    <p className="text-[9px] text-white/50 font-mono mt-0.5">3495 **** **** 6917</p>
                  </div>
                  <p className="text-xs font-bold text-white">৳2,546</p>
                </div>
              </div>
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/10">
                <span className="text-base font-bold text-white/40 italic">VISA</span>
                <button type="button" className="text-[9px] font-medium bg-white/5 border border-white/10 px-2.5 py-1 rounded-full hover:bg-white/10 text-white transition-colors">
                  View All
                </button>
              </div>
            </motion.div>

            {/* Small Floating Hexagon Button overlap */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="absolute left-0 bottom-6 w-[48px] h-[48px] bg-[#7c5cff] rounded-2xl flex items-center justify-center shadow-[0_0_12px_rgba(124,92,255,0.3)] z-30"
            >
              <Hexagon size={18} className="text-white" />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
