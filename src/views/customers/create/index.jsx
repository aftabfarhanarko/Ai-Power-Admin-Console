import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Upload,
  User,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  XCircle,
  Camera,
  Save,
  Loader2,
} from "lucide-react";
import TextField from "@/components/input/TextField";
import { useCreateUserMutation } from "@/features/user/userApiSlice";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { Switch } from "@/components/ui/switch"; // Assuming you have a Switch component, or I'll use a standard checkbox styled as switch

function CreateCustomerPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isActive, setIsActive] = useState(true);

  const customerSchema = useMemo(
    () =>
      yup.object().shape({
        name: yup
          .string()
          .required(t("customers.validation.fullNameRequired"))
          .min(2, t("customers.validation.nameMin"))
          .max(100, t("customers.validation.nameMax"))
          .trim(),
        email: yup
          .string()
          .required(t("customers.validation.emailRequired"))
          .email(t("customers.validation.emailInvalid"))
          .trim(),
        phone: yup
          .string()
          .max(20, t("customers.validation.phoneMax"))
          .matches(/^[+\d\s()-]*$/, t("customers.validation.phoneInvalid"))
          .trim(),
        address: yup
          .string()
          .max(500, t("customers.validation.addressMax"))
          .trim(),
      }),
    [t],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(customerSchema),
    mode: "onChange",
  });

  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const authUser = useSelector((state) => state.auth.user);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    const payload = {
      name: data.name,
      email: data.email,
      phone: data.phone || undefined,
      address: data.address || undefined,
      role: "customer",
      isActive: isActive,
      // avatar: avatarPreview // Note: Backend implementation for avatar upload needed
    };

    const params = {
      companyId: authUser?.companyId,
    };

    try {
      const res = await createUser({ body: payload, params });
      if (res?.data) {
        toast.success(t("customers.customerCreated"));
        reset();
        navigate("/customers");
      } else {
        toast.error(
          res?.error?.data?.message || t("customers.customerCreateFailed"),
        );
      }
    } catch (error) {
      console.error("Create customer error:", error);
      toast.error(t("customers.unexpectedError"));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20 font-sans">
      {/* --- Sticky Header --- */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-[#1a1f26]/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/customers")}
              className="rounded-full hover:bg-gray-100 dark:hover:bg-white/10"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-200" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {t("createEdit.createCustomer")}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t("createEdit.createCustomerDesc")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => navigate("/customers")}
              className="hidden sm:flex rounded-xl border-gray-200 dark:border-gray-700"
            >
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleSubmit(onSubmit)}
              disabled={isCreating}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-6 font-semibold shadow-lg shadow-indigo-600/20"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t("common.creating")}...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {t("common.create")}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto p-6 pt-8">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-12 gap-8"
        >
          {/* --- LEFT COLUMN (Main Info) --- */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            {/* Basic Information Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-[#1a1f26] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800"
            >
              <div className="flex items-center gap-3 mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
                <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {t("customers.personalInformation")}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t("customers.basicInfoSubtitle")}
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-8">
                {/* Avatar Upload Area */}
                <div className="flex flex-col items-center gap-4">
                  <div className="relative group cursor-pointer">
                    <div
                      className={`w-32 h-32 rounded-full border-4 border-white dark:border-[#1a1f26] shadow-xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center ${!avatarPreview ? "bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900" : ""}`}
                    >
                      {avatarPreview ? (
                        <img
                          src={avatarPreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-12 h-12 text-gray-400" />
                      )}

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Camera className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={handleAvatarChange}
                    />
                    <div className="absolute bottom-0 right-0 w-8 h-8 bg-indigo-600 rounded-full border-2 border-white dark:border-[#1a1f26] flex items-center justify-center text-white shadow-lg">
                      <Upload className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 text-center max-w-[120px]">
                    {t("customers.allowedImageTypes")}
                  </p>
                </div>

                {/* Fields */}
                <div className="flex-1 space-y-5">
                  <TextField
                    label={t("customers.fullName")}
                    placeholder={t("customers.fullNamePlaceholder")}
                    register={register}
                    name="name"
                    error={errors.name}
                    icon={<User className="w-4 h-4" />}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <TextField
                      label={t("customers.emailAddress")}
                      placeholder={t("customers.emailPlaceholder")}
                      register={register}
                      name="email"
                      type="email"
                      error={errors.email}
                      icon={<Mail className="w-4 h-4" />}
                    />
                    <TextField
                      label={t("customers.phoneNumber")}
                      placeholder={t("customers.phonePlaceholder")}
                      register={register}
                      name="phone"
                      error={errors.phone}
                      icon={<Phone className="w-4 h-4" />}
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Address Information Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-[#1a1f26] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800"
            >
              <div className="flex items-center gap-3 mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
                <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {t("customers.address")}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t("customers.addressSubtitle")}
                  </p>
                </div>
              </div>

              <TextField
                label={t("customers.completeAddress")}
                placeholder={t("customers.addressPlaceholder")}
                register={register}
                name="address"
                error={errors.address}
                multiline={true}
                rows={4}
              />
            </motion.div>
          </div>

          {/* --- RIGHT COLUMN (Sidebar) --- */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            {/* Status Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-[#1a1f26] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 sticky top-28"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
                {t("customers.statusVisibility")}
              </h3>

              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-gray-800">
                  <div className="space-y-0.5">
                    <label className="text-base font-semibold text-gray-900 dark:text-white">
                      {t("customers.accountStatus")}
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {isActive
                        ? t("customers.accountCanLogin")
                        : t("customers.accountDisabled")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded-full ${isActive ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"}`}
                    >
                      {isActive
                        ? t("customers.statusActiveLabel")
                        : t("customers.statusInactiveLabel")}
                    </span>
                    <Switch
                      checked={isActive}
                      onCheckedChange={setIsActive}
                      className="data-[state=checked]:bg-emerald-500"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/20">
                  <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-300 mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    {t("customers.premiumFeaturesTitle")}
                  </h4>
                  <p className="text-xs text-indigo-700 dark:text-indigo-400 leading-relaxed">
                    {t("customers.premiumFeaturesDesc")}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateCustomerPage;
