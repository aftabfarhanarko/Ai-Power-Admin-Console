import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

// components
import SubmitButton from "@/components/buttons/SubmitButton";
import TextField from "@/components/input/TextField";
import Checkbox from "@/components/input/Checkbox";
import ThemeToggle from "@/components/theme/ThemeToggle";

// hooks and function
import { useLoginSystemuserMutation } from "@/features/systemuser/systemuserApiSlice";
import { useSuperadminLoginMutation } from "@/features/superadminAuth/superadminAuthApiSlice";
import { userLoggedIn } from "@/features/auth/authSlice";
import { superadminLoggedIn } from "@/features/superadminAuth/superadminAuthSlice";
import { decodeJWT } from "@/utils/jwt-decoder";

// icons
import { letter, password, bolt } from "@/assets/icons/svgIcons";

const AdminLoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { handleSubmit, register } = useForm();
  const [rememberMe, setRememberMe] = useState(false);
  const [loginSystemuser, { isLoading: loginLoading }] =
    useLoginSystemuserMutation();
  const [superadminLogin, { isLoading: superadminLoading }] =
    useSuperadminLoginMutation();
  const isLoading = loginLoading || superadminLoading;

  const onSubmit = async (data) => {
    try {
      const loginCredential = data.email || data.name;
      if (!data.password) {
        toast.error(t("auth.passwordRequired"));
        return;
      }

      // 1st: Try systemuser login (uses email)
      const loginRes = await loginSystemuser({
        email: loginCredential,
        password: data.password,
      });

      if (loginRes?.data) {
        const responseData = loginRes.data;
        const accessToken =
          responseData?.accessToken || responseData?.data?.accessToken;
        const refreshToken =
          responseData?.refreshToken || responseData?.data?.refreshToken;

        if (accessToken) {
          const { payload } = decodeJWT(accessToken);
          const userRole = payload.role || responseData?.user?.role;

          if (userRole === "SYSTEM_OWNER" || userRole === "EMPLOYEE") {
            dispatch(userLoggedIn({ accessToken, refreshToken, rememberMe }));
            toast.success(t("auth.adminLoginSuccess"));
            navigate("/");
            return;
          }
        }
      }

      // 2nd: Try superadmin login if systemuser failed
      const superadminResult = await superadminLogin({
        email: loginCredential,
        password: data.password,
      }).unwrap();

      let accessToken = null;
      let refreshToken = null;
      let user = null;

      if (superadminResult?.accessToken) {
        accessToken = superadminResult.accessToken;
        refreshToken = superadminResult.refreshToken || null;
        user = superadminResult.user || null;
      }

      if (accessToken) {
        const { payload } = decodeJWT(accessToken);
        if (payload.role === "SUPER_ADMIN") {
          dispatch(superadminLoggedIn({ accessToken, refreshToken, user }));
          toast.success(t("auth.superadminLoginSuccess"));
          navigate("/superadmin");
          return;
        }
      }
    } catch (error) {
      console.error("Login failed:", error);
      toast.error(error?.data?.message || t("auth.loginFailedGeneric"));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl"></div>

      {/* Main container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          {/* Left Side - Login Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="p-8 lg:p-12 flex flex-col justify-center bg-white"
          >
            {/* Header */}
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-600 text-white mb-6">
                <svg
                  className="w-8 h-8"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Get Started
              </h1>
              <p className="text-gray-600">
                Welcome - Let's create your account
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="hi@filianta.com"
                  {...register("email")}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <a
                    href="/forgot-password"
                    className="text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                  >
                    Forgot?
                  </a>
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register("password")}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                />
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                />
                <label
                  htmlFor="rememberMe"
                  className="ml-2 text-sm text-gray-600"
                >
                  Remember me
                </label>
              </div>

              {/* Sign Up Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {isLoading ? t("auth.signingIn") : "Sign up"}
              </motion.button>

              {/* Login Link */}
              <div className="text-center">
                <span className="text-gray-600">Already have an account? </span>
                <a
                  href="/login"
                  className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
                >
                  Log in
                </a>
              </div>
            </form>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                © {new Date().getFullYear()} Acme, All right Reserved
              </p>
            </div>
          </motion.div>

          {/* Right Side - Feature showcase */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-emerald-600 to-emerald-800 text-white relative overflow-hidden"
          >
            {/* Background decorative circles */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>

            {/* Content */}
            <div className="relative z-10">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="text-5xl font-bold leading-tight mb-6">
                  Enter the Future of Payments, today
                </h2>
              </motion.div>
            </div>

            {/* Card Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="relative z-10"
            >
              <div className="bg-white rounded-3xl p-8 shadow-2xl text-gray-900 max-w-sm mx-auto">
                {/* Card header */}
                <div className="flex items-center justify-between mb-8">
                  <svg
                    className="w-8 h-8 text-emerald-600"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                  <div className="text-right">
                    <p className="text-3xl font-bold">12,347.23 $</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Combined balance
                    </p>
                  </div>
                </div>

                {/* Card details */}
                <div className="space-y-6">
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Primary Card</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">2,546.64$</p>
                        <p className="text-xs text-gray-500 mt-1">
                          3495 •••• •••• 6917
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-emerald-600">
                        VISA
                      </p>
                    </div>
                  </div>

                  <button className="w-full text-right text-sm text-emerald-600 hover:text-emerald-700 font-semibold transition-colors">
                    View All →
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Bottom text */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="relative z-10 mt-8"
            >
              <p className="text-sm text-white/70">
                The simplest way to manage your workforce
              </p>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLoginPage;
