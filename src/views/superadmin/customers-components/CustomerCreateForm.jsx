import React, { useState } from "react";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { Button } from "@/components/ui/button";
import TextField from "@/components/input/TextField";
import ColorPicker from "@/components/input/ColorPicker";
import Dropdown from "@/components/dropdown/dropdown";
import FileUpload from "@/components/input/FileUpload";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
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

const CustomerCreateForm = () => {
    const [open, setOpen] = useState(false);
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
        reset,
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
            reset();
            setSelectedPackage(null);
            setSelectedTheme(null);
            setIsActive(true);
            setLogoFile(null);
            setOpen(false);
        } else {
            toast.error(res?.error?.data?.message || "Failed to create customer");
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button 
                    size="sm" 
                    className="w-full sm:w-auto bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-xl shadow-violet-500/20 border-0 rounded-xl transition-all duration-300 hover:scale-[1.05]"
                >
                    Add Customer
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-4xl p-0 bg-white dark:bg-slate-900 border-0 shadow-2xl rounded-[24px]">
                <DialogHeader className="p-8 pb-0">
                    <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white">Create Customer</DialogTitle>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Add a new customer to the system with full configuration control.</p>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8">
                    {/* Account Information Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                            <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-violet-500 to-indigo-500" />
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight">
                                Account Information
                            </h3>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <TextField
                                label="Name *"
                                placeholder="Customer name"
                                register={register}
                                name="name"
                                error={errors.name}
                                inputClassName="h-12"
                            />
                            <TextField
                                label="Company Name *"
                                placeholder="Company name"
                                register={register}
                                name="companyName"
                                error={errors.companyName}
                                inputClassName="h-12"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <TextField
                                label="Email *"
                                type="email"
                                placeholder="user@example.com"
                                register={register}
                                name="email"
                                error={errors.email}
                                inputClassName="h-12"
                            />
                            <TextField
                                label="Password *"
                                type="password"
                                placeholder="At least 6 characters"
                                register={register}
                                name="password"
                                error={errors.password}
                                inputClassName="h-12"
                            />
                        </div>
                    </div>

                    {/* Contact & Location Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                            <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-violet-500 to-indigo-500" />
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight">
                                Contact & Location
                            </h3>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <TextField
                                label="Phone"
                                type="tel"
                                placeholder="+880XXXXXXXXXX"
                                register={register}
                                name="phone"
                                error={errors.phone}
                                inputClassName="h-12"
                            />
                            <TextField
                                label="Branch Location"
                                placeholder="e.g., Dhaka"
                                register={register}
                                name="branchLocation"
                                error={errors.branchLocation}
                                inputClassName="h-12"
                            />
                        </div>
                    </div>

                    {/* Company Branding Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                            <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-violet-500 to-indigo-500" />
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight">
                                Company Branding
                            </h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 h-full">
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
                            
                            <div className="space-y-6">
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
                                    label="Domain Name *"
                                    placeholder="https://example.com"
                                    register={register}
                                    name="domainName"
                                    error={errors.domainName}
                                    inputClassName="h-12"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
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

                    {/* Package & Payment Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                            <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-violet-500 to-indigo-500" />
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight">
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
                        </div>

                        {selectedPackage?.features && selectedPackage.features.length > 0 && (
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                    Package Features:
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
                    </div>

                    {/* Courier Configuration Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                            <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-violet-500 to-indigo-500" />
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight">
                                Courier Configuration (Optional)
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 pb-2">Pathao Config</p>
                                <div className="space-y-4">
                                    <TextField
                                        label="Client ID"
                                        placeholder="PATHAO_CLIENT_ID"
                                        register={register}
                                        name="pathaoClientId"
                                        error={errors.pathaoClientId}
                                        inputClassName="h-11"
                                    />
                                    <TextField
                                        label="Client Secret"
                                        placeholder="PATHAO_CLIENT_SECRET"
                                        register={register}
                                        name="pathaoClientSecret"
                                        error={errors.pathaoClientSecret}
                                        inputClassName="h-11"
                                    />
                                </div>
                            </div>
                            <div className="space-y-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 pb-2">Steadfast Config</p>
                                <div className="space-y-4">
                                    <TextField
                                        label="API Key"
                                        placeholder="STEADFAST_API_KEY"
                                        register={register}
                                        name="steadfastApiKey"
                                        error={errors.steadfastApiKey}
                                        inputClassName="h-11"
                                    />
                                    <TextField
                                        label="Secret Key"
                                        placeholder="STEADFAST_SECRET_KEY"
                                        register={register}
                                        name="steadfastSecretKey"
                                        error={errors.steadfastSecretKey}
                                        inputClassName="h-11"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notification Configuration Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                            <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-violet-500 to-indigo-500" />
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight">
                                Notification Configuration (Optional)
                            </h3>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <TextField
                                label="Notification Email"
                                type="email"
                                placeholder="notifications@example.com"
                                register={register}
                                name="notificationEmail"
                                error={errors.notificationEmail}
                                inputClassName="h-12"
                            />
                            <TextField
                                label="WhatsApp Number"
                                placeholder="+880XXXXXXXXXX"
                                register={register}
                                name="notificationWhatsapp"
                                error={errors.notificationWhatsapp}
                                inputClassName="h-12"
                            />
                        </div>
                    </div>

                    <DialogFooter className="gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                        <Button
                            type="button"
                            variant="outline"
                            className="rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 h-11 px-6"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading || isUploadingLogo}
                            className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-xl shadow-violet-500/20 border-0 h-11 px-8 transition-all duration-300 hover:scale-[1.02]"
                        >
                            {isLoading || isUploadingLogo ? "Saving..." : "Create Customer"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default CustomerCreateForm;


