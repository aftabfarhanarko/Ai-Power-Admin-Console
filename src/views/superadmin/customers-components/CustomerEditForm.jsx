import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import TextField from "@/components/input/TextField";
import ColorPicker from "@/components/input/ColorPicker";
import Dropdown from "@/components/dropdown/dropdown";
import FileUpload from "@/components/input/FileUpload";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useUpdateSystemuserMutation } from "@/features/systemuser/systemuserApiSlice";
import { useGetPackagesQuery } from "@/features/package/packageApiSlice";
import { useGetThemesQuery } from "@/features/theme/themeApiSlice";
import useImageUpload from "@/hooks/useImageUpload";

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
});

const CustomerEditForm = ({ user, onClose }) => {
  const [updateSystemuser, { isLoading }] = useUpdateSystemuserMutation();
  const { data: packages, isLoading: isLoadingPackages } =
    useGetPackagesQuery();
  const { data: themes, isLoading: isLoadingThemes } = useGetThemesQuery();
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState(
    user?.paymentInfo?.paymentstatus
      ? PAYMENT_STATUS_OPTIONS.find(
          (opt) => opt.value === user.paymentInfo.paymentstatus,
        )
      : null,
  );
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
    user?.paymentInfo?.paymentmethod
      ? PAYMENT_METHOD_OPTIONS.find(
          (opt) => opt.value === user.paymentInfo.paymentmethod,
        )
      : null,
  );
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [isActive, setIsActive] = useState(user?.isActive ?? true);
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
      packageId: user?.packageId || "",
      pathaoClientId: user?.pathaoConfig?.clientId || "",
      pathaoClientSecret: user?.pathaoConfig?.clientSecret || "",
      steadfastApiKey: user?.steadfastConfig?.apiKey || "",
      steadfastSecretKey: user?.steadfastConfig?.secretKey || "",
      notificationEmail: user?.notificationConfig?.email || "",
      notificationWhatsapp: user?.notificationConfig?.whatsapp || "",
      domainName: user?.domainName || "",
      primaryColor: user?.primaryColor || "",
      secondaryColor: user?.secondaryColor || "",
    },
  });

  const primaryColor = watch("primaryColor");
  const secondaryColor = watch("secondaryColor");

  // Convert packages to dropdown options
  const packageOptions =
    packages?.map((pkg) => ({
      label: pkg.name,
      value: pkg.id,
      features: pkg.features,
    })) || [];

  // Convert themes to dropdown options
  const themeOptions =
    themes?.map((theme) => ({
      label: theme.domainUrl || `Theme #${theme.id}`,
      value: theme.id,
    })) || [];

  useEffect(() => {
    if (!user || !packages || !themes) return;

    const paymentStatus = user?.paymentInfo?.paymentstatus
      ? PAYMENT_STATUS_OPTIONS.find(
          (opt) => opt.value === user.paymentInfo.paymentstatus,
        )
      : null;
    const paymentMethod = user?.paymentInfo?.paymentmethod
      ? PAYMENT_METHOD_OPTIONS.find(
          (opt) => opt.value === user.paymentInfo.paymentmethod,
        )
      : null;

    // Find package from API data
    const packageData = user?.packageId
      ? packages.find((pkg) => pkg.id === user.packageId)
      : null;
    const packageOption = packageData
      ? {
          label: packageData.name,
          value: packageData.id,
          features: packageData.features,
        }
      : null;

    // Find theme from API data
    const themeData = user?.themeId
      ? themes.find((theme) => theme.id === user.themeId)
      : null;
    const themeOption = themeData
      ? {
          label: themeData.domainUrl || `Theme #${themeData.id}`,
          value: themeData.id,
        }
      : null;

    setSelectedPaymentStatus(paymentStatus);
    setSelectedPaymentMethod(paymentMethod);
    setSelectedPackage(packageOption);
    setSelectedTheme(themeOption);
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
      packageId: user?.packageId || "",
      pathaoClientId: user?.pathaoConfig?.clientId || "",
      pathaoClientSecret: user?.pathaoConfig?.clientSecret || "",
      steadfastApiKey: user?.steadfastConfig?.apiKey || "",
      steadfastSecretKey: user?.steadfastConfig?.secretKey || "",
      notificationEmail: user?.notificationConfig?.email || "",
      notificationWhatsapp: user?.notificationConfig?.whatsapp || "",
      domainName: user?.domainName || "",
      primaryColor: user?.primaryColor || "",
      secondaryColor: user?.secondaryColor || "",
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

    const paymentInfo = {
      ...(data.paymentstatus && { paymentstatus: data.paymentstatus }),
      ...(data.paymentmethod && { paymentmethod: data.paymentmethod }),
      ...(data.amount && { amount: parseFloat(data.amount) }),
      ...(selectedPackage && { packagename: selectedPackage.label }),
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
    };

    if (data.password) {
      payload.password = data.password;
    }

    const res = await updateSystemuser(payload);
    if (res?.data) {
      toast.success("Customer updated successfully");
      onClose?.();
    } else {
      toast.error(res?.error?.data?.message || "Failed to update customer");
    }
  };

  return (
    <Dialog open={!!user} onOpenChange={(v) => !v && onClose?.()}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto rounded-[24px] border-0 shadow-2xl p-0 gap-0 bg-white dark:bg-[#0f172a]">
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 md:px-8 md:py-6 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800">
          <div>
            <DialogTitle className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400">
              Edit Customer
            </DialogTitle>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Update customer details and configurations
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onClose?.()}
            className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-x"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </Button>
        </div>

        <motion.form
          onSubmit={handleSubmit(onSubmit)}
          className="p-6 md:p-8 space-y-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Account Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="h-8 w-1 rounded-full bg-gradient-to-b from-violet-500 to-indigo-500"></div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="h-8 w-1 rounded-full bg-gradient-to-b from-violet-500 to-indigo-500"></div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
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
          </div>

          {/* Company Branding */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="h-8 w-1 rounded-full bg-gradient-to-b from-violet-500 to-indigo-500"></div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Company Branding
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ColorPicker
                label="Primary Color"
                value={primaryColor}
                onChange={(color) => setValue("primaryColor", color)}
                error={errors.primaryColor}
                placeholder="#FF5733"
              />
              <ColorPicker
                label="Secondary Color"
                value={secondaryColor}
                onChange={(color) => setValue("secondaryColor", color)}
                error={errors.secondaryColor}
                placeholder="#33FF57"
              />
            </div>
            <FileUpload
              label="Company Logo"
              placeholder="Upload company logo"
              accept="image/*"
              previewContainerClassName="h-32 w-32"
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
                logoFile
                  ? URL.createObjectURL(logoFile)
                  : user?.companyLogo || null
              }
              className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
            />
            <div className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
              <input
                type="checkbox"
                id="isActive"
                className="w-5 h-5 rounded border-slate-300 dark:border-slate-600 text-violet-600 focus:ring-violet-500"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              <label
                htmlFor="isActive"
                className="text-sm font-medium cursor-pointer text-slate-700 dark:text-slate-300 select-none"
              >
                Active Account
              </label>
            </div>
          </div>

          {/* Package & Payment Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="h-8 w-1 rounded-full bg-gradient-to-b from-violet-500 to-indigo-500"></div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Package & Payment Information
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Select Package
                </label>
                <Dropdown
                  name="package"
                  options={packageOptions}
                  setSelectedOption={(opt) => {
                    setSelectedPackage(opt);
                    setValue("packageId", opt.value, { shouldValidate: true });
                  }}
                  className="h-12 w-full"
                >
                  {selectedPackage?.label || (
                    <span className="text-slate-500 dark:text-slate-400">
                      {isLoadingPackages
                        ? "Loading packages..."
                        : "Select Package"}
                    </span>
                  )}
                </Dropdown>
                {errors.packageId && (
                  <span className="text-rose-500 text-xs ml-1">
                    {errors.packageId.message}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Select Theme
                </label>
                <Dropdown
                  name="theme"
                  options={themeOptions}
                  setSelectedOption={(opt) => {
                    setSelectedTheme(opt);
                    setValue("themeId", opt.value, { shouldValidate: true });
                  }}
                  className="h-12 w-full"
                >
                  {selectedTheme?.label || (
                    <span className="text-slate-500 dark:text-slate-400">
                      {isLoadingThemes ? "Loading themes..." : "Select Theme"}
                    </span>
                  )}
                </Dropdown>
                {errors.themeId && (
                  <span className="text-rose-500 text-xs ml-1">
                    {errors.themeId.message}
                  </span>
                )}
              </div>
            </div>

            {selectedPackage?.features &&
              selectedPackage.features.length > 0 && (
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider">
                    Package Features
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedPackage.features.map((feature) => (
                      <span
                        key={feature}
                        className="text-xs px-3 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg font-medium border border-emerald-500/10"
                      >
                        {feature.replace(/_/g, " ")}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Payment Status
                </label>
                <Dropdown
                  name="payment status"
                  options={PAYMENT_STATUS_OPTIONS}
                  setSelectedOption={(opt) => {
                    setSelectedPaymentStatus(opt);
                    setValue("paymentstatus", opt.value, {
                      shouldValidate: true,
                    });
                  }}
                  className="h-12 w-full"
                >
                  {selectedPaymentStatus?.label || (
                    <span className="text-slate-500 dark:text-slate-400">
                      Select Status
                    </span>
                  )}
                </Dropdown>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Payment Method
                </label>
                <Dropdown
                  name="payment method"
                  options={PAYMENT_METHOD_OPTIONS}
                  setSelectedOption={(opt) => {
                    setSelectedPaymentMethod(opt);
                    setValue("paymentmethod", opt.value, {
                      shouldValidate: true,
                    });
                  }}
                  className="h-12 w-full"
                >
                  {selectedPaymentMethod?.label || (
                    <span className="text-slate-500 dark:text-slate-400">
                      Select Method
                    </span>
                  )}
                </Dropdown>
              </div>
            </div>
            <TextField
              label="Amount (BDT)"
              type="number"
              step="0.01"
              placeholder="1999.00"
              register={register}
              name="amount"
              error={errors.amount}
              inputClassName="h-12 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:border-violet-500 dark:focus:border-violet-500 rounded-xl"
            />
          </div>

          {/* Courier Configuration */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="h-8 w-1 rounded-full bg-gradient-to-b from-violet-500 to-indigo-500"></div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Courier Configuration (Optional)
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Pathao Config
                  </p>
                </div>
                <TextField
                  label="Client ID"
                  placeholder="PATHAO_CLIENT_ID"
                  register={register}
                  name="pathaoClientId"
                  error={errors.pathaoClientId}
                  inputClassName="h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                />
                <TextField
                  label="Client Secret"
                  placeholder="PATHAO_CLIENT_SECRET"
                  register={register}
                  name="pathaoClientSecret"
                  error={errors.pathaoClientSecret}
                  inputClassName="h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                />
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-teal-500"></div>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Steadfast Config
                  </p>
                </div>
                <TextField
                  label="API Key"
                  placeholder="STEADFAST_API_KEY"
                  register={register}
                  name="steadfastApiKey"
                  error={errors.steadfastApiKey}
                  inputClassName="h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                />
                <TextField
                  label="Secret Key"
                  placeholder="STEADFAST_SECRET_KEY"
                  register={register}
                  name="steadfastSecretKey"
                  error={errors.steadfastSecretKey}
                  inputClassName="h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Notification Configuration */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="h-8 w-1 rounded-full bg-gradient-to-b from-violet-500 to-indigo-500"></div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Notification Configuration (Optional)
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TextField
                label="Notification Email"
                type="email"
                placeholder="notifications@example.com"
                register={register}
                name="notificationEmail"
                error={errors.notificationEmail}
                inputClassName="h-12 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:border-violet-500 dark:focus:border-violet-500 rounded-xl"
              />
              <TextField
                label="WhatsApp Number"
                placeholder="+880XXXXXXXXXX"
                register={register}
                name="notificationWhatsapp"
                error={errors.notificationWhatsapp}
                inputClassName="h-12 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:border-violet-500 dark:focus:border-violet-500 rounded-xl"
              />
            </div>
          </div>

          <DialogFooter className="gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 h-11 px-6"
              div
              onClick={() => onClose?.()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || isUploadingLogo}
              className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-xl shadow-violet-500/20 border-0 h-11 px-8 transition-all duration-300 hover:scale-[1.02]"
            >
              {isLoading || isUploadingLogo ? "Updating..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </motion.form>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerEditForm;
