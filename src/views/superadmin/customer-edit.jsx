import React, { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { Building2, ArrowLeft, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TextField from "@/components/input/TextField";
import ColorPicker from "@/components/input/ColorPicker";
import FileUpload from "@/components/input/FileUpload";
import {
  useUpdateSystemuserMutation,
  useGetSystemuserQuery,
} from "@/features/systemuser/systemuserApiSlice";
import { useGetPackagesQuery } from "@/features/package/packageApiSlice";
import { useGetThemesQuery } from "@/features/theme/themeApiSlice";
import useImageUpload from "@/hooks/useImageUpload";
import AtomLoader from "@/components/loader/AtomLoader";

const PAYMENT_STATUS_OPTIONS = [
  { label: "Paid", value: "PAID" },
  { label: "Pending", value: "PENDING" },
  { label: "Failed", value: "FAILED" },
  { label: "Refunded", value: "REFUNDED" },
  { label: "Cancelled", value: "CANCELLED" },
];

const PAYMENT_METHOD_OPTIONS = [
  { label: "bKash", value: "BKASH" },
  { label: "Nagad", value: "NAGAD" },
  { label: "Rocket", value: "ROCKET" },
  { label: "Credit Card", value: "CREDIT_CARD" },
  { label: "Debit Card", value: "DEBIT_CARD" },
  { label: "Bank Transfer", value: "BANK_TRANSFER" },
  { label: "Cash on Delivery", value: "CASH_ON_DELIVERY" },
  { label: "Stripe", value: "STRIPE" },
  { label: "PayPal", value: "PAYPAL" },
  { label: "Other", value: "OTHER" },
];

const schema = yup.object().shape({
  name: yup
    .string()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters"),
  companyName: yup
    .string()
    .required("Company name is required")
    .min(2, "Company name must be at least 2 characters"),
  email: yup
    .string()
    .required("Email is required")
    .email("Please enter a valid email address"),
  password: yup
    .string()
    .nullable()
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .test(
      "password-length",
      "Password must be at least 6 characters",
      (value) => !value || value.length >= 6,
    ),
  companyLogo: yup.string().nullable(),
  phone: yup.string().nullable(),
  branchLocation: yup.string().nullable(),
  paymentstatus: yup.string(),
  paymentmethod: yup.string(),
  amount: yup.number().nullable(),
  packageId: yup.number().nullable(),
  themeId: yup.number().nullable(),
  // Pathao Config
  pathaoClientId: yup.string().nullable(),
  pathaoClientSecret: yup.string().nullable(),
  // Steadfast Config
  steadfastApiKey: yup.string().nullable(),
  steadfastSecretKey: yup.string().nullable(),
  // Notification Config
  notificationEmail: yup.string().email("Invalid email").nullable(),
  notificationWhatsapp: yup.string().nullable(),
  domainName: yup.string().nullable(),
  primaryColor: yup
    .string()
    .nullable()
    .matches(/^#[0-9A-F]{6}$/i, {
      message: "Primary color must be a valid hex color (e.g., #FF5733)",
    })
    .transform((value, originalValue) => (originalValue === "" ? null : value)),
  secondaryColor: yup
    .string()
    .nullable()
    .matches(/^#[0-9A-F]{6}$/i, {
      message: "Secondary color must be a valid hex color (e.g., #FF5733)",
    })
    .transform((value, originalValue) => (originalValue === "" ? null : value)),
  extraVisitors: yup.number().nullable().default(0),
  extraOrders: yup.number().nullable().default(0),
  extraProducts: yup.number().nullable().default(0),
  extraStorageGB: yup.number().nullable().default(0),
  extraStaff: yup.number().nullable().default(0),
  extraEmails: yup.number().nullable().default(0),
  extraChats: yup.number().nullable().default(0),
  hasPrioritySupport: yup.boolean().nullable().default(false),
});

const SuperAdminCustomerEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: user, isLoading: isLoadingUser } = useGetSystemuserQuery(id);
  const [updateSystemuser, { isLoading: isUpdating }] =
    useUpdateSystemuserMutation();
  const { data: packages, isLoading: isLoadingPackages } =
    useGetPackagesQuery();
  const { data: themes, isLoading: isLoadingThemes } = useGetThemesQuery();

  const packageOptions = useMemo(() => {
    return (
      packages?.map((pkg) => ({
        label: pkg.name,
        value: pkg.id,
        features: pkg.features,
      })) || []
    );
  }, [packages]);

  const themeOptions = useMemo(() => {
    return (
      themes?.map((theme) => ({
        label: theme.domainUrl || `Theme #${theme.id}`,
        value: theme.id,
      })) || []
    );
  }, [themes]);

  const [isActive, setIsActive] = useState(true);
  const [logoFile, setLogoFile] = useState(null);
  const { uploadImage, isUploading: isUploadingLogo } = useImageUpload();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      id: id,
      name: "",
      companyName: "",
      email: "",
      password: "",
      companyLogo: "",
      phone: "",
      branchLocation: "",
      paymentstatus: "",
      paymentmethod: "",
      amount: "",
      packageId: "",
      themeId: "",
      pathaoClientId: "",
      pathaoClientSecret: "",
      steadfastApiKey: "",
      steadfastSecretKey: "",
      notificationEmail: "",
      notificationWhatsapp: "",
      domainName: "",
      primaryColor: "",
      secondaryColor: "",
      extraVisitors: 0,
      extraOrders: 0,
      extraProducts: 0,
      extraStorageGB: 0,
      extraStaff: 0,
      extraEmails: 0,
      extraChats: 0,
      hasPrioritySupport: false,
    },
  });

  const primaryColor = watch("primaryColor");
  const secondaryColor = watch("secondaryColor");
  const themeId = watch("themeId");
  const packageId = watch("packageId");
  const paymentStatus = watch("paymentstatus");
  const paymentMethod = watch("paymentmethod");

  useEffect(() => {
    if (!user || !packages || !themes) return;

    setIsActive(user?.isActive ?? true);

    reset({
      id: user?.id,
      name: user?.name || "",
      companyName: user?.companyName || "",
      email: user?.email || "",
      password: "",
      companyLogo: user?.companyLogo || "",
      phone: user?.phone || "",
      branchLocation: user?.branchLocation || "",
      paymentstatus: user?.paymentInfo?.paymentstatus || "",
      paymentmethod: user?.paymentInfo?.paymentmethod || "",
      amount: user?.paymentInfo?.amount || "",
      packageId: user?.packageId ? String(user.packageId) : "",
      themeId: user?.themeId ? String(user.themeId) : "",
      pathaoClientId: user?.pathaoConfig?.clientId || "",
      pathaoClientSecret: user?.pathaoConfig?.clientSecret || "",
      steadfastApiKey: user?.steadfastConfig?.apiKey || "",
      steadfastSecretKey: user?.steadfastConfig?.secretKey || "",
      notificationEmail: user?.notificationConfig?.email || "",
      notificationWhatsapp: user?.notificationConfig?.whatsapp || "",
      domainName: user?.domainName || "",
      primaryColor: user?.primaryColor || "",
      secondaryColor: user?.secondaryColor || "",
      extraVisitors: user?.extraVisitors || 0,
      extraOrders: user?.extraOrders || 0,
      extraProducts: user?.extraProducts || 0,
      extraStorageGB: user?.extraStorageGB || 0,
      extraStaff: user?.extraStaff || 0,
      extraEmails: user?.extraEmails || 0,
      extraChats: user?.extraChats || 0,
      hasPrioritySupport: user?.hasPrioritySupport || false,
    });
    setLogoFile(null);
  }, [user, packages, themes, reset]);

  const onSubmit = async (data) => {
    // Upload logo if new file is selected
    let logoUrl = data.companyLogo || user?.companyLogo || null;
    if (logoFile) {
      logoUrl = await uploadImage(logoFile);
      if (!logoUrl) {
        toast.error("Failed to upload company logo");
        return;
      }
    }

    const selectedPackageData = packages?.find(p => p.id === Number(data.packageId));

    const paymentInfo = {
      ...(data.paymentstatus && { paymentstatus: data.paymentstatus }),
      ...(data.paymentmethod && { paymentmethod: data.paymentmethod }),
      ...(data.amount && { amount: parseFloat(data.amount) }),
      ...(selectedPackageData && { packagename: selectedPackageData.name }),
    };

    const pathaoConfig = {};
    if (data.pathaoClientId || data.pathaoClientSecret) {
      if (data.pathaoClientId) pathaoConfig.clientId = data.pathaoClientId;
      if (data.pathaoClientSecret)
        pathaoConfig.clientSecret = data.pathaoClientSecret;
    }

    const steadfastConfig = {};
    if (data.steadfastApiKey || data.steadfastSecretKey) {
      if (data.steadfastApiKey) steadfastConfig.apiKey = data.steadfastApiKey;
      if (data.steadfastSecretKey)
        steadfastConfig.secretKey = data.steadfastSecretKey;
    }

    const notificationConfig = {};
    if (data.notificationEmail || data.notificationWhatsapp) {
      if (data.notificationEmail)
        notificationConfig.email = data.notificationEmail;
      if (data.notificationWhatsapp)
        notificationConfig.whatsapp = data.notificationWhatsapp;
    }

    const payload = {
      id: data.id,
      name: data.name,
      companyName: data.companyName,
      email: data.email,
      isActive,
      ...(logoUrl && { companyLogo: logoUrl }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.branchLocation !== undefined && {
        branchLocation: data.branchLocation,
      }),
      ...(Object.keys(paymentInfo).length > 0 && { paymentInfo }),
      ...(data.packageId && { packageId: parseInt(data.packageId) }),
      ...(data.themeId && { themeId: parseInt(data.themeId) }),
      ...(Object.keys(pathaoConfig).length > 0 && { pathaoConfig }),
      ...(Object.keys(steadfastConfig).length > 0 && { steadfastConfig }),
      ...(Object.keys(notificationConfig).length > 0 && { notificationConfig }),
      ...(data.domainName && { domainName: data.domainName }),
      ...(data.primaryColor && { primaryColor: data.primaryColor }),
      ...(data.secondaryColor && { secondaryColor: data.secondaryColor }),
      extraVisitors: parseInt(data.extraVisitors) || 0,
      extraOrders: parseInt(data.extraOrders) || 0,
      extraProducts: parseInt(data.extraProducts) || 0,
      extraStorageGB: parseInt(data.extraStorageGB) || 0,
    };

    if (data.password) {
      payload.password = data.password;
    }

    const res = await updateSystemuser(payload);
    if (res?.data) {
      toast.success("Customer updated successfully");
      navigate(`/superadmin/customers/${id}`);
    } else {
      toast.error(res?.error?.data?.message || "Failed to update customer");
    }
  };

  if (isLoadingUser || isLoadingPackages || isLoadingThemes) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <AtomLoader />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
          Customer Not Found
        </h2>
        <Button
          onClick={() => navigate("/superadmin/customers")}
          variant="outline"
        >
          Back to Customers
        </Button>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  return (
    <motion.div
      className="space-y-8 pb-12 max-w-[1600px] mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Simple Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <div className="p-2 rounded-xl bg-violet-100 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400">
              <Building2 className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Edit Customer
            </h1>
            <span
              className={`px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider border ${
                isActive
                  ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800"
                  : "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800"
              }`}
            >
              {isActive ? "Active" : "Inactive"}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm md:text-base text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {user?.companyName || user?.name}
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="break-all">{user?.email}</span>
            <span className="hidden sm:inline">•</span>
            <span className="font-mono text-xs md:text-sm bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
              {user?.companyId || user?.id}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            onClick={() => navigate(`/superadmin/customers/${id}`)}
            variant="outline"
            className="rounded-xl flex-1 sm:flex-none"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Details
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-200 dark:shadow-none flex-1 sm:flex-none"
            disabled={isUpdating || isUploadingLogo}
          >
            <Save className="w-4 h-4 mr-2" />
            {isUpdating ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8"
      >
        {/* Left Column - Main Info */}
        <div className="xl:col-span-2 space-y-6 md:space-y-8">
          {/* Account Information */}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-[#1a1f26] rounded-[24px] p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-800"
          >
            <div className="flex items-center gap-3 mb-8 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="h-8 w-1 rounded-full bg-gradient-to-b from-violet-500 to-indigo-500"></div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Account Information
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TextField
                label="Name *"
                placeholder="Customer name"
                register={register}
                name="name"
                error={errors.name}
                inputClassName="h-12 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:border-violet-500 dark:focus:border-violet-500 rounded-xl"
              />
              <TextField
                label="Company Name *"
                placeholder="Company name"
                register={register}
                name="companyName"
                error={errors.companyName}
                inputClassName="h-12 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:border-violet-500 dark:focus:border-violet-500 rounded-xl"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <TextField
                label="Email *"
                type="email"
                placeholder="user@example.com"
                register={register}
                name="email"
                error={errors.email}
                inputClassName="h-12 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:border-violet-500 dark:focus:border-violet-500 rounded-xl"
              />
              <TextField
                label="New Password (optional)"
                type="password"
                placeholder="Leave blank to keep current"
                register={register}
                name="password"
                error={errors.password}
                inputClassName="h-12 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:border-violet-500 dark:focus:border-violet-500 rounded-xl"
              />
            </div>
          </motion.div>

          {/* Contact Details */}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-[#1a1f26] rounded-[24px] p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-800"
          >
            <div className="flex items-center gap-3 mb-8 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="h-8 w-1 rounded-full bg-gradient-to-b from-emerald-500 to-teal-500"></div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Contact Details
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TextField
                label="Phone"
                type="tel"
                placeholder="+880XXXXXXXXXX"
                register={register}
                name="phone"
                error={errors.phone}
                inputClassName="h-12 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:border-violet-500 dark:focus:border-violet-500 rounded-xl"
              />
              <TextField
                label="Branch Location"
                placeholder="e.g., Dhaka"
                register={register}
                name="branchLocation"
                error={errors.branchLocation}
                inputClassName="h-12 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:border-violet-500 dark:focus:border-violet-500 rounded-xl"
              />
              <TextField
                label="Domain Name *"
                placeholder="https://example.com"
                register={register}
                name="domainName"
                error={errors.domainName}
                inputClassName="h-12 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:border-violet-500 dark:focus:border-violet-500 rounded-xl"
              />
            </div>
          </motion.div>

          {/* Addons / Resource Limits */}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-[#1a1f26] rounded-[24px] p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-800"
          >
            <div className="flex items-center gap-3 mb-8 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="h-8 w-1 rounded-full bg-gradient-to-b from-orange-500 to-red-500"></div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Resource Limits & Addons
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <TextField
                label="Extra Visitors"
                type="number"
                placeholder="0"
                register={register}
                name="extraVisitors"
                error={errors.extraVisitors}
                inputClassName="h-12 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:border-violet-500 rounded-xl"
              />
              <TextField
                label="Extra Orders"
                type="number"
                placeholder="0"
                register={register}
                name="extraOrders"
                error={errors.extraOrders}
                inputClassName="h-12 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:border-violet-500 rounded-xl"
              />
              <TextField
                label="Extra Products"
                type="number"
                placeholder="0"
                register={register}
                name="extraProducts"
                error={errors.extraProducts}
                inputClassName="h-12 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:border-violet-500 rounded-xl"
              />
              <TextField
                label="Extra Storage (GB)"
                type="number"
                placeholder="0"
                register={register}
                name="extraStorageGB"
                error={errors.extraStorageGB}
                inputClassName="h-12 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:border-violet-500 rounded-xl"
              />
              <TextField
                label="Extra Staff Seats"
                type="number"
                placeholder="0"
                register={register}
                name="extraStaff"
                error={errors.extraStaff}
                inputClassName="h-12 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:border-violet-500 rounded-xl"
              />
              <TextField
                label="Extra Emails"
                type="number"
                placeholder="0"
                register={register}
                name="extraEmails"
                error={errors.extraEmails}
                inputClassName="h-12 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:border-violet-500 rounded-xl"
              />
              <TextField
                label="Extra Chats"
                type="number"
                placeholder="0"
                register={register}
                name="extraChats"
                error={errors.extraChats}
                inputClassName="h-12 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:border-violet-500 rounded-xl"
              />
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-900 dark:text-slate-300">
                  Priority Support
                </label>
                <Select
                  value={String(watch("hasPrioritySupport"))}
                  onValueChange={(val) => setValue("hasPrioritySupport", val === "true")}
                >
                  <SelectTrigger className="h-12 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:ring-violet-500 rounded-xl">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Enabled</SelectItem>
                    <SelectItem value="false">Disabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
              * These values are added on top of the base package limits. Use these for manual addon assignments or compensation.
            </p>
          </motion.div>

          {/* Integrations */}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-[#1a1f26] rounded-[24px] p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-800"
          >
            <div className="flex items-center gap-3 mb-8 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="h-8 w-1 rounded-full bg-gradient-to-b from-blue-500 to-cyan-500"></div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Integrations
              </h3>
            </div>

            {/* Pathao */}
            <div className="mb-8">
              <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
                Pathao Configuration
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TextField
                  label="Client ID"
                  placeholder="Pathao Client ID"
                  register={register}
                  name="pathaoClientId"
                  inputClassName="h-12 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:border-violet-500 dark:focus:border-violet-500 rounded-xl"
                />
                <TextField
                  label="Client Secret"
                  placeholder="Pathao Client Secret"
                  register={register}
                  name="pathaoClientSecret"
                  type="password"
                  inputClassName="h-12 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:border-violet-500 dark:focus:border-violet-500 rounded-xl"
                />
              </div>
            </div>

            {/* Steadfast */}
            <div className="mb-8">
              <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
                Steadfast Configuration
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TextField
                  label="API Key"
                  placeholder="Steadfast API Key"
                  register={register}
                  name="steadfastApiKey"
                  inputClassName="h-12 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:border-violet-500 dark:focus:border-violet-500 rounded-xl"
                />
                <TextField
                  label="Secret Key"
                  placeholder="Steadfast Secret Key"
                  register={register}
                  name="steadfastSecretKey"
                  type="password"
                  inputClassName="h-12 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:border-violet-500 dark:focus:border-violet-500 rounded-xl"
                />
              </div>
            </div>

            {/* Notification */}
            <div>
              <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
                Notification Config
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TextField
                  label="Notification Email"
                  placeholder="email@example.com"
                  register={register}
                  name="notificationEmail"
                  error={errors.notificationEmail}
                  inputClassName="h-12 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:border-violet-500 dark:focus:border-violet-500 rounded-xl"
                />
                <TextField
                  label="Notification WhatsApp"
                  placeholder="+880XXXXXXXXXX"
                  register={register}
                  name="notificationWhatsapp"
                  inputClassName="h-12 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:border-violet-500 dark:focus:border-violet-500 rounded-xl"
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column - Status & Branding */}
        <div className="space-y-6 md:space-y-8">
          {/* Status Card */}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-[#1a1f26] rounded-[24px] p-6 shadow-sm border border-slate-200 dark:border-slate-800"
          >
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
              Status & Visibility
            </h3>
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">
                  Active Status
                </p>
                <p className="text-sm text-slate-500">
                  Enable or disable customer access
                </p>
              </div>
              <div
                className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-colors duration-300 ${
                  isActive ? "bg-violet-600" : "bg-slate-300 dark:bg-slate-700"
                }`}
                onClick={() => setIsActive(!isActive)}
              >
                <div
                  className={`w-6 h-6 rounded-full bg-white shadow-sm transform transition-transform duration-300 ${
                    isActive ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </div>
            </div>
          </motion.div>

          {/* Branding */}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-[#1a1f26] rounded-[24px] p-6 shadow-sm border border-slate-200 dark:border-slate-800"
          >
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="h-8 w-1 rounded-full bg-gradient-to-b from-orange-500 to-amber-500"></div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Branding
              </h3>
            </div>

            <div className="space-y-6">
              <FileUpload
                label="Company Logo"
                placeholder="Upload company logo"
                accept="image/*"
                onChange={(file) => {
                  setLogoFile(file);
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setValue("companyLogo", reader.result, {
                        shouldValidate: true,
                      });
                    };
                    reader.readAsDataURL(file);
                  } else {
                    setValue("companyLogo", user?.companyLogo || "", {
                      shouldValidate: true,
                    });
                  }
                }}
                value={
                  logoFile ? URL.createObjectURL(logoFile) : user?.companyLogo
                }
                previewContainerClassName="h-32 w-32"
              />

              <div className="grid grid-cols-1 gap-6">
                <ColorPicker
                  label="Primary Color"
                  value={primaryColor}
                  onChange={(color) => setValue("primaryColor", color)}
                  error={errors.primaryColor}
                />
                <ColorPicker
                  label="Secondary Color"
                  value={secondaryColor}
                  onChange={(color) => setValue("secondaryColor", color)}
                  error={errors.secondaryColor}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-900 dark:text-slate-300">
                  Theme
                </label>
                <Select
                  value={themeId}
                  onValueChange={(val) => setValue("themeId", val)}
                >
                  <SelectTrigger className="w-full h-12 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:ring-violet-500 dark:focus:ring-violet-500 rounded-xl">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    {themeOptions.map((option) => (
                      <SelectItem key={option.value} value={String(option.value)}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.div>

          {/* Subscription */}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-[#1a1f26] rounded-[24px] p-6 shadow-sm border border-slate-200 dark:border-slate-800"
          >
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="h-8 w-1 rounded-full bg-gradient-to-b from-purple-500 to-fuchsia-500"></div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Subscription
              </h3>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-900 dark:text-slate-300">
                  Package
                </label>
                <Select
                  value={packageId}
                  onValueChange={(val) => setValue("packageId", val)}
                >
                  <SelectTrigger className="w-full h-12 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:ring-violet-500 dark:focus:ring-violet-500 rounded-xl">
                    <SelectValue placeholder="Select package" />
                  </SelectTrigger>
                  <SelectContent>
                    {packageOptions.map((option) => (
                      <SelectItem key={option.value} value={String(option.value)}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-900 dark:text-slate-300">
                  Payment Status
                </label>
                <Select
                  value={paymentStatus}
                  onValueChange={(val) => setValue("paymentstatus", val)}
                >
                  <SelectTrigger className="w-full h-12 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:ring-violet-500 dark:focus:ring-violet-500 rounded-xl">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-900 dark:text-slate-300">
                  Payment Method
                </label>
                <Select
                  value={paymentMethod}
                  onValueChange={(val) => setValue("paymentmethod", val)}
                >
                  <SelectTrigger className="w-full h-12 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:ring-violet-500 dark:focus:ring-violet-500 rounded-xl">
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHOD_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <TextField
                label="Amount"
                type="number"
                placeholder="0.00"
                register={register}
                name="amount"
                inputClassName="h-12 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:border-violet-500 dark:focus:border-violet-500 rounded-xl"
              />
            </div>
          </motion.div>
        </div>
      </form>
    </motion.div>
  );
};

export default SuperAdminCustomerEditPage;
