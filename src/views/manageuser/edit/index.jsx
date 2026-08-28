import React, { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import TextField from "@/components/input/TextField";
import { ArrowLeft, Save, UserCog, Shield, Building } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { motion } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { useGetSystemuserQuery, useUpdateSystemuserMutation } from "@/features/systemuser/systemuserApiSlice";

const EditUserPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useTranslation();
  const { data: user, isLoading: isLoadingUser, isError, error } = useGetSystemuserQuery(id, { skip: !id });
  const [updateSystemuser, { isLoading }] = useUpdateSystemuserMutation();

  const editUserSchema = useMemo(
    () =>
      yup.object().shape({
        name: yup
          .string()
          .required(t("manageUsers.validation.nameRequired"))
          .min(2, t("manageUsers.validation.nameMin")),
        companyName: yup
          .string()
          .required(t("manageUsers.validation.companyRequired"))
          .min(2, t("manageUsers.validation.companyMin"))
          .max(100, t("manageUsers.validation.companyMax")),
        email: yup
          .string()
          .required(t("manageUsers.validation.emailRequired"))
          .email(t("manageUsers.validation.emailInvalid")),
        phone: yup
          .string()
          .required(t("manageUsers.validation.phoneRequired")),
        role: yup
          .string()
          .required(t("manageUsers.validation.roleRequired")),
        password: yup
          .string()
          .nullable()
          .transform((value, originalValue) =>
            originalValue === "" ? null : value,
          )
          .min(6, t("manageUsers.validation.passwordMin"))
          .max(50, t("manageUsers.validation.passwordMax")),
        isActive: yup
          .boolean()
          .required(t("manageUsers.validation.statusRequired")),
      }),
    [t],
  );

  const { register, control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(editUserSchema),
    defaultValues: {
      id: "",
      name: "",
      companyName: "",
      email: "",
      phone: "",
      role: "EMPLOYEE",
      password: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (isError) {
      toast.error(
        error?.data?.message ||
          error?.data?.error ||
          t("manageUsers.edit.notFound"),
      );
      navigate("/manage-users");
    }
  }, [isError, error, navigate, t]);

  useEffect(() => {
    if (user) {
      const companyName = user.companyName ?? user.company?.name ?? "";
      reset({
        id: user.id,
        name: user.name || "",
        companyName: companyName || "",
        email: user.email || "",
        phone: user.phone || "",
        role: user.role || "EMPLOYEE",
        password: "",
        isActive: user.isActive ?? true,
      });
    }
  }, [user, reset]);

  const onSubmit = async (data) => {
    try {
      const payload = {
        name: data.name,
        companyName: data.companyName,
        email: data.email,
        phone: data.phone,
        role: data.role,
        isActive: data.isActive,
      };
      if (data.password?.trim()) {
        payload.password = data.password.trim();
      }
      await updateSystemuser({ id, ...payload }).unwrap();
      toast.success(t("manageUsers.edit.updatedSuccess"));
      navigate("/manage-users");
    } catch (err) {
      toast.error(
        err?.data?.message ||
          err?.data?.error ||
          t("manageUsers.edit.updatedFailed"),
      );
    }
  };

  if (isLoadingUser) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="h-8 w-1/3 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
        <div className="h-64 w-full bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (isError || !user) {
    return null;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/manage-users")}
          className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            {t("manageUsers.edit.headerTitle")}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t("manageUsers.edit.headerSubtitle")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-[24px] bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="h-10 w-10 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <UserCog className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t("manageUsers.edit.userInfoTitle")}
              </h3>
            </div>

            <form id="edit-user-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              
              {/* Personal Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <TextField
                  label={t("manageUsers.edit.nameLabel")}
                  placeholder={t("manageUsers.create.namePlaceholder")}
                  register={register}
                  name="name"
                  error={errors.name}
                  className="rounded-xl"
                />
                <TextField
                  label={t("manageUsers.edit.companyLabel")}
                  placeholder={t("manageUsers.create.companyPlaceholder")}
                  register={register}
                  name="companyName"
                  error={errors.companyName}
                  className="rounded-xl"
                  icon={<Building className="h-4 w-4" />}
                />
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <TextField
                  label={t("manageUsers.emailLabel")}
                  type="email"
                  placeholder={t("manageUsers.create.emailPlaceholder")}
                  register={register}
                  name="email"
                  error={errors.email}
                  className="rounded-xl"
                />
                <TextField
                  label={t("manageUsers.phoneLabel")}
                  placeholder={t("manageUsers.create.phonePlaceholder")}
                  register={register}
                  name="phone"
                  error={errors.phone}
                  className="rounded-xl"
                />
              </div>

              {/* Role */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-gray-700 dark:text-gray-300 text-sm font-medium ml-1">
                    {t("manageUsers.create.roleLabel")}
                  </label>
                  <div className="relative">
                    <select
                      {...register("role")}
                      className={`w-full border rounded-xl py-3 pl-4 pr-10 bg-gray-50 dark:bg-[#1a1f26] text-gray-900 dark:text-gray-100 outline-none appearance-none cursor-pointer transition-all duration-200 focus:bg-white dark:focus:bg-[#1a1f26] focus:shadow-sm ${
                        errors.role ? "border-red-500" : "border-gray-200 dark:border-gray-800 focus:border-black dark:focus:border-white"
                      }`}
                    >
                      <option value="EMPLOYEE">
                        {t("manageUsers.roles.employee")}
                      </option>
                      <option value="MANAGER">
                        {t("manageUsers.roles.manager")}
                      </option>
                      <option value="SUPER_ADMIN">
                        {t("manageUsers.roles.superAdmin")}
                      </option>
                      <option value="SYSTEM_OWNER">
                        {t("manageUsers.roles.systemOwner")}
                      </option>
                    </select>
                    <Shield className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                  {errors.role && <span className="text-red-500 text-xs ml-1 font-medium">{errors.role.message}</span>}
                </div>
              </div>

              {/* Password & Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <TextField
                  label={t("manageUsers.edit.passwordLabel")}
                  type="password"
                  placeholder={t("manageUsers.edit.passwordPlaceholder")}
                  register={register}
                  name="password"
                  error={errors.password}
                  className="rounded-xl"
                />
                
                {/* Status Toggle */}
                <div className="flex flex-col gap-2">
                   <label className="text-gray-700 dark:text-gray-300 text-sm font-medium ml-1">
                     {t("manageUsers.create.accountStatusLabel")}
                   </label>
                   <div className="h-[50px] flex items-center px-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#1a1f26]">
                     <Controller
                        name="isActive"
                        control={control}
                        render={({ field }) => (
                          <div className="flex items-center justify-between w-full">
                            <span className={`text-sm ${field.value ? "text-green-600 font-medium" : "text-gray-500"}`}>
                              {field.value
                                ? t("manageUsers.create.activeAccount")
                                : t("manageUsers.create.inactiveAccount")}
                            </span>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </div>
                        )}
                      />
                   </div>
                </div>
              </div>

            </form>
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="lg:col-span-1 space-y-6">
          <div className="sticky top-6 space-y-6">
            <div className="rounded-[24px] bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                {t("manageUsers.edit.actionsTitle")}
              </h3>
              <div className="flex flex-col gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/manage-users")}
                  disabled={isLoading}
                  className="w-full justify-start rounded-xl h-12 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t("common.cancel")}
                </Button>
                <Button
                  type="submit"
                  form="edit-user-form"
                  disabled={isLoading}
                  className="w-full justify-start rounded-xl h-12 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/20 border-0"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isLoading ? t("common.updating") : t("common.saveChanges")}
                </Button>
              </div>
            </div>

            <div className="rounded-[24px] bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-900/10 dark:to-violet-900/10 border border-indigo-100 dark:border-indigo-900/30 p-6">
              <h4 className="font-medium text-indigo-900 dark:text-indigo-200 mb-2">
                {t("manageUsers.rolesCard.title")}
              </h4>
              <ul className="text-sm text-indigo-700 dark:text-indigo-300/80 space-y-2 list-disc pl-4">
                <li>
                  <span className="font-semibold">
                    {t("manageUsers.rolesCard.systemOwnerLabel")}
                  </span>{" "}
                  {t("manageUsers.rolesCard.systemOwnerDesc")}
                </li>
                <li>
                  <span className="font-semibold">
                    {t("manageUsers.rolesCard.superAdminLabel")}
                  </span>{" "}
                  {t("manageUsers.rolesCard.superAdminDesc")}
                </li>
                <li>
                  <span className="font-semibold">
                    {t("manageUsers.rolesCard.managerLabel")}
                  </span>{" "}
                  {t("manageUsers.rolesCard.managerDesc")}
                </li>
                <li>
                  <span className="font-semibold">
                    {t("manageUsers.rolesCard.employeeLabel")}
                  </span>{" "}
                  {t("manageUsers.rolesCard.employeeDesc")}
                </li>
              </ul>
            </div>
            
            <div className="rounded-[24px] bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 p-6">
              <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
                {t("manageUsers.edit.securityNoteTitle")}
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300/80">
                {t("manageUsers.edit.securityNote")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default EditUserPage;
