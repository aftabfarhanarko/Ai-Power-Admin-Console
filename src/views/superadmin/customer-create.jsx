import React, { useState } from "react";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
    ArrowLeft, 
    Plus, 
    Building2,
    Mail,
    Phone,
    MapPin,
    Globe,
    CreditCard,
    Bell,
    Truck
} from "lucide-react";

import { Button } from "@/components/ui/button";
import TextField from "@/components/input/TextField";
import ColorPicker from "@/components/input/ColorPicker";
import Dropdown from "@/components/dropdown/dropdown";
import FileUpload from "@/components/input/FileUpload";
import { useCreateSystemuserMutation } from "@/features/systemuser/systemuserApiSlice";
import { useGetPackagesQuery } from "@/features/package/packageApiSlice";
import { useGetThemesQuery } from "@/features/theme/themeApiSlice";
import useImageUpload from "@/hooks/useImageUpload";

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
        .required("Password is required")
        .min(6, "Password must be at least 6 characters"),
    companyLogo: yup.string().nullable(),
    phone: yup.string().nullable(),
    branchLocation: yup.string().nullable(),
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

const CustomerCreatePage = () => {
    const navigate = useNavigate();
    const [createSystemuser, { isLoading }] = useCreateSystemuserMutation();
    const { data: packages, isLoading: isLoadingPackages } = useGetPackagesQuery();
    const { data: themes, isLoading: isLoadingThemes } = useGetThemesQuery();
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [selectedTheme, setSelectedTheme] = useState(null);
    const [isActive, setIsActive] = useState(true);
    const [logoFile, setLogoFile] = useState(null);
    const { uploadImage, isUploading: isUploadingLogo } = useImageUpload();

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            name: "",
            companyName: "",
            email: "",
            password: "",
            companyLogo: "",
            phone: "",
            branchLocation: "",
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
        },
    });

    const primaryColor = watch("primaryColor");
    const secondaryColor = watch("secondaryColor");

    // Convert packages to dropdown options
    const packageOptions = packages?.map((pkg) => ({
        label: pkg.name,
        value: pkg.id,
        features: pkg.features,
    })) || [];

    // Convert themes to dropdown options
    const themeOptions = themes?.map((theme) => ({
        label: theme.domainUrl || `Theme #${theme.id}`,
        value: theme.id,
    })) || [];

    const onSubmit = async (data) => {
        // Upload logo if file is selected
        let logoUrl = data.companyLogo || null;
        if (logoFile) {
            logoUrl = await uploadImage(logoFile);
            if (!logoUrl) {
                toast.error("Failed to upload company logo");
                return;
            }
        }

        const paymentInfo = {
            ...(selectedPackage && { packagename: selectedPackage.label }),
        };

        const pathaoConfig = {};
        if (data.pathaoClientId || data.pathaoClientSecret) {
            if (data.pathaoClientId) pathaoConfig.clientId = data.pathaoClientId;
            if (data.pathaoClientSecret) pathaoConfig.clientSecret = data.pathaoClientSecret;
        }

        const steadfastConfig = {};
        if (data.steadfastApiKey || data.steadfastSecretKey) {
            if (data.steadfastApiKey) steadfastConfig.apiKey = data.steadfastApiKey;
            if (data.steadfastSecretKey) steadfastConfig.secretKey = data.steadfastSecretKey;
        }

        const notificationConfig = {};
        if (data.notificationEmail || data.notificationWhatsapp) {
            if (data.notificationEmail) notificationConfig.email = data.notificationEmail;
            if (data.notificationWhatsapp) notificationConfig.whatsapp = data.notificationWhatsapp;
        }

        const payload = {
            name: data.name,
            companyName: data.companyName,
            email: data.email,
            password: data.password,
            isActive,
            ...(logoUrl && { companyLogo: logoUrl }),
            ...(data.phone && { phone: data.phone }),
            ...(data.branchLocation && { branchLocation: data.branchLocation }),
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

        const res = await createSystemuser(payload);
        if (res?.data) {
            toast.success("Customer created successfully");
            navigate("/superadmin/customers");
        } else {
            toast.error(res?.error?.data?.message || "Failed to create customer");
        }
    };

    return (
        <motion.div
            className="space-y-6 pb-12 max-w-[1600px] mx-auto p-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => navigate("/superadmin/customers")}
                        className="rounded-full h-10 w-10 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    </Button>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            Create Customer
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
                            Add a new customer to the system with full configuration control.
                        </p>
                    </div>
                </div>
                <Button
                    onClick={handleSubmit(onSubmit)}
                    disabled={isLoading || isUploadingLogo}
                    className="rounded-xl bg-violet-600 text-white hover:bg-violet-700 shadow-lg shadow-violet-500/20 px-6"
                >
                    {isLoading || isUploadingLogo ? (
                        <>
                            <div className="w-4 h-4 mr-2 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                            Creating...
                        </>
                    ) : (
                        <>
                            <Plus className="w-4 h-4 mr-2" />
                            Create Customer
                        </>
                    )}
                </Button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Left Column - Main Info */}
                <div className="xl:col-span-2 space-y-6">
                    {/* Account Information */}
                    <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-[24px] p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
                            <div className="p-2 rounded-lg bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400">
                                <Building2 className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
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
                            />
                            <TextField
                                label="Company Name *"
                                placeholder="Company name"
                                register={register}
                                name="companyName"
                                error={errors.companyName}
                            />
                            <TextField
                                label="Email *"
                                type="email"
                                placeholder="user@example.com"
                                register={register}
                                name="email"
                                error={errors.email}
                                icon={<Mail className="w-5 h-5" />}
                            />
                            <TextField
                                label="Password *"
                                type="password"
                                placeholder="At least 6 characters"
                                register={register}
                                name="password"
                                error={errors.password}
                            />
                        </div>
                    </motion.div>

                    {/* Contact & Location */}
                    <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-[24px] p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
                            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400">
                                <MapPin className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                                Contact & Location
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
                                icon={<Phone className="w-5 h-5" />}
                            />
                            <TextField
                                label="Branch Location"
                                placeholder="e.g., Dhaka"
                                register={register}
                                name="branchLocation"
                                error={errors.branchLocation}
                                icon={<MapPin className="w-5 h-5" />}
                            />
                        </div>
                    </motion.div>

                    {/* Configurations (Pathao, Steadfast, Notification) */}
                    <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-[24px] p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
                            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400">
                                <Truck className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                                Integrations & Notifications
                            </h3>
                        </div>
                        
                        <div className="space-y-8">
                            {/* Pathao */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                    Pathao Courier Configuration
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <TextField
                                        label="Client ID"
                                        placeholder="Pathao Client ID"
                                        register={register}
                                        name="pathaoClientId"
                                        error={errors.pathaoClientId}
                                    />
                                    <TextField
                                        label="Client Secret"
                                        type="password"
                                        placeholder="Pathao Client Secret"
                                        register={register}
                                        name="pathaoClientSecret"
                                        error={errors.pathaoClientSecret}
                                    />
                                </div>
                            </div>

                            <div className="border-t border-slate-100 dark:border-slate-800" />

                            {/* Steadfast */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                    Steadfast Courier Configuration
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <TextField
                                        label="API Key"
                                        placeholder="Steadfast API Key"
                                        register={register}
                                        name="steadfastApiKey"
                                        error={errors.steadfastApiKey}
                                    />
                                    <TextField
                                        label="Secret Key"
                                        type="password"
                                        placeholder="Steadfast Secret Key"
                                        register={register}
                                        name="steadfastSecretKey"
                                        error={errors.steadfastSecretKey}
                                    />
                                </div>
                            </div>

                            <div className="border-t border-slate-100 dark:border-slate-800" />

                            {/* Notification */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                    Notification Configuration
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <TextField
                                        label="Notification Email"
                                        type="email"
                                        placeholder="notify@example.com"
                                        register={register}
                                        name="notificationEmail"
                                        error={errors.notificationEmail}
                                        icon={<Mail className="w-5 h-5" />}
                                    />
                                    <TextField
                                        label="WhatsApp Number"
                                        placeholder="+880XXXXXXXXXX"
                                        register={register}
                                        name="notificationWhatsapp"
                                        error={errors.notificationWhatsapp}
                                        icon={<Phone className="w-5 h-5" />}
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Right Column - Branding & Package */}
                <div className="space-y-6">
                    {/* Branding */}
                    <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-[24px] p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
                            <div className="p-2 rounded-lg bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400">
                                <Globe className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                                Branding
                            </h3>
                        </div>

                        <div className="space-y-6">
                            <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
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
                                                setValue("companyLogo", reader.result, { shouldValidate: true });
                                            };
                                            reader.readAsDataURL(file);
                                        } else {
                                            setValue("companyLogo", "", { shouldValidate: true });
                                        }
                                    }}
                                    value={logoFile ? URL.createObjectURL(logoFile) : null}
                                />
                            </div>

                            <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    className="w-5 h-5 rounded border-slate-300 text-violet-600 focus:ring-violet-500 transition-all cursor-pointer"
                                    checked={isActive}
                                    onChange={(e) => setIsActive(e.target.checked)}
                                />
                                <label htmlFor="isActive" className="text-sm font-medium cursor-pointer text-slate-700 dark:text-slate-200">
                                    Active Account
                                </label>
                            </div>

                            <TextField
                                label="Domain Name"
                                placeholder="https://example.com"
                                register={register}
                                name="domainName"
                                error={errors.domainName}
                                icon={<Globe className="w-5 h-5" />}
                            />

                            <div className="grid grid-cols-2 gap-4">
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
                        </div>
                    </motion.div>

                    {/* Package Selection */}
                    <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-[24px] p-6 shadow-sm border border-slate-200 dark:border-slate-800 sticky top-6">
                        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
                            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400">
                                <CreditCard className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                                Package & Theme
                            </h3>
                        </div>

                        <div className="space-y-6">
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
                                >
                                    {selectedPackage?.label || (
                                        <span className="text-slate-400 dark:text-slate-500">
                                            {isLoadingPackages ? "Loading packages..." : "Select Package"}
                                        </span>
                                    )}
                                </Dropdown>
                                {errors.packageId && (
                                    <span className="text-rose-500 text-xs ml-1 font-medium">{errors.packageId.message}</span>
                                )}
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Select Theme (Optional)
                                </label>
                                <Dropdown
                                    name="theme"
                                    options={themeOptions}
                                    setSelectedOption={(opt) => {
                                        setSelectedTheme(opt);
                                        setValue("themeId", opt.value, { shouldValidate: true });
                                    }}
                                >
                                    {selectedTheme?.label || (
                                        <span className="text-slate-400 dark:text-slate-500">
                                            {isLoadingThemes ? "Loading themes..." : "Select Theme"}
                                        </span>
                                    )}
                                </Dropdown>
                                {errors.themeId && (
                                    <span className="text-rose-500 text-xs ml-1 font-medium">{errors.themeId.message}</span>
                                )}
                            </div>

                            {selectedPackage?.features && selectedPackage.features.length > 0 && (
                                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                                        Included Features
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedPackage.features.slice(0, 5).map((feature, idx) => (
                                            <span key={idx} className="px-2 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-medium text-slate-600 dark:text-slate-300">
                                                {feature.replace(/_/g, " ")}
                                            </span>
                                        ))}
                                        {selectedPackage.features.length > 5 && (
                                            <span className="px-2 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-medium text-slate-500">
                                                +{selectedPackage.features.length - 5} more
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="pt-4">
                                <Button
                                    onClick={handleSubmit(onSubmit)}
                                    disabled={isLoading || isUploadingLogo}
                                    className="w-full rounded-xl bg-violet-600 text-white hover:bg-violet-700 shadow-lg shadow-violet-500/20 py-6"
                                >
                                    {isLoading || isUploadingLogo ? "Creating..." : "Create Customer"}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => navigate("/superadmin/customers")}
                                    className="w-full mt-3 rounded-xl border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 py-6 text-slate-600 dark:text-slate-400"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};

export default CustomerCreatePage;
