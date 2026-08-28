import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateSystemuserMutation } from "@/features/systemuser/systemuserApiSlice";
import { useUpdateSuperadminMutation } from "@/features/superadmin/superadminApiSlice";
import { motion } from "framer-motion";
import { KeyRound, Eye, EyeOff, ShieldCheck, Loader2 } from "lucide-react";

const getPasswordSchema = (t) =>
  yup.object().shape({
    newPassword: yup
      .string()
      .required(t("settings.passwordRequired"))
      .min(6, t("settings.passwordMin"))
      .max(50, t("settings.passwordMax")),
    confirmPassword: yup
      .string()
      .required(t("settings.confirmPasswordRequired"))
      .oneOf([yup.ref("newPassword")], t("settings.passwordsMustMatch")),
  });

const PasswordSettings = ({ user: userFromApi }) => {
  const { t } = useTranslation();
  const user = userFromApi ?? null;
  const userId = user?.id ?? user?.userId ?? user?.sub;
  const isSuperadmin = user?.role === "SUPER_ADMIN";

  const [updateSystemuser, { isLoading: isUpdatingSystemuser }] = useUpdateSystemuserMutation();
  const [updateSuperadmin, { isLoading: isUpdatingSuperadmin }] = useUpdateSuperadminMutation();
  const isUpdating = isUpdatingSystemuser || isUpdatingSuperadmin;
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(getPasswordSchema(t)),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data) => {
    if (!userId) {
      toast.error(t("settings.userIdNotFound"));
      return;
    }

    try {
      if (isSuperadmin) {
        await updateSuperadmin({
          id: userId,
          password: data.newPassword,
        }).unwrap();
      } else {
        await updateSystemuser({
          id: userId,
          password: data.newPassword,
        }).unwrap();
      }
      toast.success(t("settings.passwordUpdated"));
      reset({ newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(
        err?.data?.message || err?.data?.error || t("settings.passwordUpdateFailed")
      );
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400">
            <KeyRound className="h-6 w-6" />
          </div>
          {t("common.updatePassword")}
        </h2>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Info Card */}
        <div className="xl:col-span-1 space-y-6">
          <div className="p-5 rounded-[24px] bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-lg mb-1">{t("settings.passwordSecurityTip")}</h4>
                <p className="text-sm text-white/80 leading-relaxed">
                  {t("settings.passwordSecurityDesc")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Form */}
        <div className="xl:col-span-2">
          <div className="rounded-[24px] border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1f26] shadow-xl overflow-hidden">
            <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-violet-500" />
                {t("settings.changePassword")}
              </h3>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="ml-1">
                  {t("settings.newPassword")}
                </Label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    placeholder={t("settings.newPasswordPlaceholder")}
                    autoComplete="new-password"
                    className="h-12 pl-12 pr-12 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-black/20"
                    {...register("newPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-sm text-red-500 ml-1">{errors.newPassword.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="ml-1">
                  {t("settings.confirmPassword")}
                </Label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder={t("settings.confirmPasswordPlaceholder")}
                    autoComplete="new-password"
                    className="h-12 pl-12 pr-12 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-black/20"
                    {...register("confirmPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500 ml-1">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isUpdating}
                  className="rounded-xl h-12 px-8 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 font-bold"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("settings.updating")}
                    </>
                  ) : (
                    <>
                      <KeyRound className="mr-2 h-4 w-4" />
                      {t("common.updatePassword")}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PasswordSettings;
