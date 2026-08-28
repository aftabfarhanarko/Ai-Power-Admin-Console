import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Hexagon, 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  Mail, 
  Lock, 
  User, 
  ShieldCheck, 
  Info,
  Globe 
} from "lucide-react";

import { useUserRegisterMutation } from "@/features/auth/authApiSlice";
import AuthPage from "..";

const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  const campaign = searchParams.get("campaign");
  const referId = searchParams.get("referId");

  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [acceptedPolicy, setAcceptedPolicy] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      fullName: "",
      userName: "",
      email: "",
      password: "",
      confirmPassword: "",
    }
  });

  const [userRegister, { isLoading }] = useUserRegisterMutation();

  // Watch fields for live validation
  const emailValue = watch("email");
  const userNameValue = watch("userName");
  const passwordValue = watch("password");
  const confirmPasswordValue = watch("confirmPassword");
  const fullNameValue = watch("fullName");

  // Live password validation checks
  const isMinLength = passwordValue?.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(passwordValue || "");
  const hasNumber = /[0-9]/.test(passwordValue || "");
  const passwordsMatch = passwordValue && passwordValue === confirmPasswordValue;

  const handleNextStep = async () => {
    let fieldsToValidate = [];
    if (currentStep === 1) {
      fieldsToValidate = ["userName", "email"];
    } else if (currentStep === 2) {
      fieldsToValidate = ["password", "confirmPassword"];
    }

    const isValid = await trigger(fieldsToValidate);
    
    // Custom check for step 2 password requirements
    if (currentStep === 2 && (!isMinLength || !hasLetter || !hasNumber || !passwordsMatch)) {
      toast.error("Please meet all security requirements.");
      return;
    }

    if (isValid) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const onSubmit = async (data) => {
    if (!acceptedPolicy) {
      toast.error("Please accept the Terms and Conditions.");
      return;
    }

    const bodyData = {
      fullName: data.fullName,
      userName: data.userName,
      email: data.email,
      password: data.password,
    };

    if (campaign) bodyData.campaign = campaign;
    if (referId) {
      bodyData.referId = referId;
      bodyData.page = "sign-up";
    }

    try {
      const res = await userRegister(bodyData);
      if (res && res.data?.success) {
        toast.success(
          res.data?.data?.message || "Successfully Registered! Verification email sent."
        );
        navigate("/create-account/verify-email");
      } else {
        toast.error(
          res?.error?.data?.message || "Registration failed. Username or email may already be in use."
        );
      }
    } catch (err) {
      toast.error("A network error occurred. Please try again.");
    }
  };

  return (
    <AuthPage title="Let's Get Started" subtitle="Create your high-performance merchant account.">
      <div className="w-full space-y-6">
        {/* Step Progress Bar */}
        <div className="relative flex justify-between items-center max-w-xs mx-auto mb-8">
          {/* Connecting Line */}
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-gray-200 dark:bg-gray-800 -z-10 rounded-full" />
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-[var(--brand-primary)] -z-10 rounded-full transition-all duration-300" 
            style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
          />

          {/* Step Nodes */}
          {[1, 2, 3].map((stepNum) => {
            const isCompleted = currentStep > stepNum;
            const isActive = currentStep === stepNum;
            return (
              <div 
                key={stepNum} 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  isCompleted 
                    ? "bg-[var(--brand-primary)] text-white scale-110 shadow-lg shadow-[var(--brand-primary-glow)]" 
                    : isActive 
                    ? "bg-[var(--brand-primary)] text-white ring-4 ring-[var(--brand-primary-dim)] scale-110" 
                    : "bg-gray-100 dark:bg-[#1a1f26] text-gray-400 dark:text-gray-600 border border-gray-200 dark:border-gray-800"
                }`}
              >
                {isCompleted ? <Check size={14} strokeWidth={3} /> : stepNum}
              </div>
            );
          })}
        </div>

        {/* Form Area */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* Username */}
                <div className="space-y-2">
                  <label htmlFor="userName" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
                    Store Handle (Username)
                  </label>
                  <div className="relative group">
                    <input
                      id="userName"
                      type="text"
                      {...register("userName", { 
                        required: "Username is required",
                        minLength: { value: 3, message: "Minimum 3 characters" }
                      })}
                      placeholder="my-cool-store"
                      className={`w-full pl-11 pr-4 py-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--surface)] text-[var(--foreground)] placeholder-[var(--muted-dark)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/50 focus:border-[var(--brand-primary)] transition-all ${
                        errors.userName ? 'border-red-500' : ''
                      }`}
                    />
                    <Globe size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-dark)] group-focus-within:text-[var(--brand-primary)] transition-colors" />
                  </div>
                  {errors.userName && (
                    <span className="text-red-500 text-xs font-semibold ml-1">{errors.userName.message}</span>
                  )}
                </div>

                {/* Email Address */}
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
                    Work Email Address
                  </label>
                  <div className="relative group">
                    <input
                      id="email"
                      type="email"
                      {...register("email", { 
                        required: "Email is required",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Invalid email address"
                        }
                      })}
                      placeholder="billing@mybrand.com"
                      className={`w-full pl-11 pr-4 py-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--surface)] text-[var(--foreground)] placeholder-[var(--muted-dark)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/50 focus:border-[var(--brand-primary)] transition-all ${
                        errors.email ? 'border-red-500' : ''
                      }`}
                    />
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-dark)] group-focus-within:text-[var(--brand-primary)] transition-colors" />
                  </div>
                  {errors.email && (
                    <span className="text-red-500 text-xs font-semibold ml-1">{errors.email.message}</span>
                  )}
                </div>

                {/* Action Navigation */}
                <button
                  type="button"
                  onClick={handleNextStep}
                  disabled={!userNameValue || !emailValue}
                  className="w-full mt-4 py-4 px-4 bg-[var(--brand-primary)] hover:brightness-110 active:scale-[0.99] text-white font-bold text-base rounded-xl shadow-xl shadow-[var(--brand-primary-glow)] transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue to Security
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* Password */}
                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
                    Choose a Strong Password
                  </label>
                  <div className="relative group">
                    <input
                      id="password"
                      type="password"
                      {...register("password", { required: true })}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--surface)] text-[var(--foreground)] placeholder-[var(--muted-dark)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/50 focus:border-[var(--brand-primary)] transition-all"
                    />
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-dark)] group-focus-within:text-[var(--brand-primary)] transition-colors" />
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
                    Confirm Password
                  </label>
                  <div className="relative group">
                    <input
                      id="confirmPassword"
                      type="password"
                      {...register("confirmPassword", { required: true })}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--surface)] text-[var(--foreground)] placeholder-[var(--muted-dark)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/50 focus:border-[var(--brand-primary)] transition-all"
                    />
                    <ShieldCheck size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-dark)] group-focus-within:text-[var(--brand-primary)] transition-colors" />
                  </div>
                </div>

                {/* Requirements checklist */}
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl space-y-2 border border-gray-100 dark:border-gray-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Security Check</span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1.5 font-medium">
                      <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] ${isMinLength ? "bg-emerald-500 text-white" : "bg-gray-200 dark:bg-gray-800 text-transparent"}`}><Check size={10} strokeWidth={4} /></div>
                      <span className={isMinLength ? "text-gray-900 dark:text-gray-200" : "text-gray-400 dark:text-gray-600"}>At least 8 chars</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-medium">
                      <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] ${hasLetter ? "bg-emerald-500 text-white" : "bg-gray-200 dark:bg-gray-800 text-transparent"}`}><Check size={10} strokeWidth={4} /></div>
                      <span className={hasLetter ? "text-gray-900 dark:text-gray-200" : "text-gray-400 dark:text-gray-600"}>Contains letters</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-medium">
                      <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] ${hasNumber ? "bg-emerald-500 text-white" : "bg-gray-200 dark:bg-gray-800 text-transparent"}`}><Check size={10} strokeWidth={4} /></div>
                      <span className={hasNumber ? "text-gray-900 dark:text-gray-200" : "text-gray-400 dark:text-gray-600"}>Contains numbers</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-medium">
                      <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] ${passwordsMatch ? "bg-emerald-500 text-white" : "bg-gray-200 dark:bg-gray-800 text-transparent"}`}><Check size={10} strokeWidth={4} /></div>
                      <span className={passwordsMatch ? "text-gray-900 dark:text-gray-200" : "text-gray-400 dark:text-gray-600"}>Passwords match</span>
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="w-1/3 py-4 px-4 border border-[var(--border-color)] hover:bg-gray-50 dark:hover:bg-gray-800 active:scale-[0.99] text-gray-700 dark:text-gray-300 font-bold text-base rounded-xl transition-all flex items-center justify-center gap-1.5"
                  >
                    <ChevronLeft size={18} />
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleNextStep}
                    disabled={!passwordValue || !confirmPasswordValue}
                    className="w-2/3 py-4 px-4 bg-[var(--brand-primary)] hover:brightness-110 active:scale-[0.99] text-white font-bold text-base rounded-xl shadow-xl shadow-[var(--brand-primary-glow)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    Continue
                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* Full Name */}
                <div className="space-y-2">
                  <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
                    Your Full Name
                  </label>
                  <div className="relative group">
                    <input
                      id="fullName"
                      type="text"
                      {...register("fullName", { required: "Full name is required" })}
                      placeholder="Sojib Rahman"
                      className={`w-full pl-11 pr-4 py-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--surface)] text-[var(--foreground)] placeholder-[var(--muted-dark)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/50 focus:border-[var(--brand-primary)] transition-all ${
                        errors.fullName ? 'border-red-500' : ''
                      }`}
                    />
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-dark)] group-focus-within:text-[var(--brand-primary)] transition-colors" />
                  </div>
                  {errors.fullName && (
                    <span className="text-red-500 text-xs font-semibold ml-1">{errors.fullName.message}</span>
                  )}
                </div>

                {/* Policies Checkbox */}
                <div className="p-1.5 flex gap-3 text-sm">
                  <label className="flex items-start gap-3 cursor-pointer group mt-1">
                    <div className="relative mt-0.5">
                      <input
                        type="checkbox"
                        checked={acceptedPolicy}
                        onChange={(e) => setAcceptedPolicy(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-5 h-5 border-2 border-[var(--border-color)] rounded-md bg-[var(--surface)] peer-checked:bg-[var(--brand-primary)] peer-checked:border-[var(--brand-primary)] transition-all"></div>
                      <svg className="absolute top-0.5 left-0.5 w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300 leading-normal">
                      Please accept the{" "}
                      <Link to="/privacy-policy" target="_blank" className="text-[var(--brand-primary)] underline hover:text-[var(--brand-primary-hover)]">
                        Privacy Policy
                      </Link>{" "}
                      and{" "}
                      <Link to="/terms-conditions" target="_blank" className="text-[var(--brand-primary)] underline hover:text-[var(--brand-primary-hover)]">
                        Terms of Conditions
                      </Link>
                    </span>
                  </label>
                </div>

                {/* Navigation and Submission */}
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="w-1/3 py-4 px-4 border border-[var(--border-color)] hover:bg-gray-50 dark:hover:bg-gray-800 active:scale-[0.99] text-gray-700 dark:text-gray-300 font-bold text-base rounded-xl transition-all flex items-center justify-center gap-1.5"
                  >
                    <ChevronLeft size={18} />
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={!fullNameValue || !acceptedPolicy || isLoading}
                    className="w-2/3 py-4 px-4 bg-[var(--brand-primary)] hover:brightness-110 active:scale-[0.99] text-white font-black text-base rounded-xl shadow-xl shadow-[var(--brand-primary-glow)] transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        Creating Account...
                      </span>
                    ) : (
                      <>
                        Launch Console
                        <Hexagon size={16} fill="currentColor" className="group-hover:rotate-180 transition-transform duration-700" />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        {/* Footer Navigation */}
        <div className="text-center pt-2 border-t border-gray-100 dark:border-gray-800/60">
          <p className="text-sm text-[var(--muted-text)] font-medium">
            Already have an account?{" "}
            <Link to="/login" className="text-[var(--brand-primary)] hover:underline font-bold">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </AuthPage>
  );
};

export default RegisterPage;