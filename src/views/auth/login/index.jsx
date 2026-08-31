import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Eye, EyeOff, Hexagon, Loader2 } from "lucide-react";

// Hooks and function
import { userLoggedIn, userDetailsFetched } from "@/features/auth/authSlice";
import { superadminLoggedIn, superadminLoggedOut } from "@/features/superadminAuth/superadminAuthSlice";
import { useUserLoginMutation } from "@/features/auth/authApiSlice";
import { decodeJWT } from "@/utils/jwt-decoder";

/**
 * Premium Login Page for SquadCart Console.
 */
const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const { isAuthenticated } = useSelector((state) => state.auth);
  const { isAuthenticated: isSuperAdminAuth } = useSelector((state) => state.superadminAuth);

  // Auto-redirect ONLY if user landed on /login with existing active session when page loaded
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      if (isAuthenticated) {
        navigate("/", { replace: true });
      } else if (isSuperAdminAuth) {
        navigate("/superadmin", { replace: true });
      }
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

  const [userLogin, { isLoading }] = useUserLoginMutation();

  /**
   * Handles the login submission cleanly.
   * @param {Object} data - Email and password from the form.
   */
  const onSubmit = async (data) => {
    try {
      const response = await userLogin({
        email: data.email,
        password: data.password,
        rememberMe,
      }).unwrap();

      const accessToken = response?.accessToken || response?.data?.accessToken;
      const refreshToken = response?.refreshToken || response?.data?.refreshToken;
      const user = response?.user || response?.data?.user;

      if (!accessToken) {
        toast.error(t("auth.loginAccessTokenMissing") || "Access token missing.");
        return;
      }

      // Decode token to detect role for unified redirection (Super Admin vs Merchant)
      const { payload } = decodeJWT(accessToken);
      const rawRole = payload?.role || user?.role || "";
      const isSuperAdmin = typeof rawRole === "string" && rawRole.toUpperCase() === "SUPER_ADMIN";

      if (isSuperAdmin) {
        dispatch(superadminLoggedIn({ accessToken, refreshToken, user }));
        toast.success(t("auth.superadminLoginSuccess") || "Welcome Super Admin!");
        window.location.href = "/superadmin";
        return;
      }

      // Merchant login handling
      dispatch(superadminLoggedOut());
      dispatch(userLoggedIn({ accessToken, refreshToken, rememberMe, user }));
      if (user) {
        dispatch(userDetailsFetched(user));
      }
      toast.success(t("auth.loginSuccess") || "Successfully logged in!");

      const from = location.state?.from?.pathname || "/";
      window.location.href = from;
    } catch (error) {
      console.error("Login error:", error);
      toast.error(
        error?.data?.message ||
        error?.message ||
        t("auth.loginFailedTryAgain") ||
        "Login failed. Please check your credentials."
      );
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
                autoComplete="username email"
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
                  autoComplete="current-password"
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
            <div className="absolute -inset-10 bg-[radial-gradient(circle_at_center,rgba(124,92,255,0.12),transparent_70%)] pointer-events-none" />

            {/* Dot navigation bar on the left */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="absolute left-0 top-6 w-[48px] h-[190px] bg-[#111424] rounded-2xl border border-white/10 flex flex-col items-center justify-between py-4 shadow-lg z-10 will-change-transform"
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
              className="absolute right-0 top-0 w-[230px] h-[280px] bg-[#0d0f1c] rounded-2xl p-5 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.4)] z-20 flex flex-col justify-between will-change-transform"
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
