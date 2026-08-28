import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  Loader2,
  Globe,
  Palette,
  ImageIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import TextField from "@/components/input/TextField";
import {
  useGetThemeQuery,
  useUpdateThemeMutation,
} from "@/features/theme/themeApiSlice";
import useImageUpload from "@/hooks/useImageUpload";

const schema = yup.object().shape({
  domainUrl: yup
    .string()
    .url("Please enter a valid URL")
    .nullable()
    .transform((value, originalValue) => (originalValue === "" ? null : value)),
  logo: yup.string().nullable(),
  primaryColorCode: yup
    .string()
    .nullable()
    .matches(/^#[0-9A-F]{6}$/i, {
      message: "Primary color code must be a valid hex color (e.g., #FF5733)",
    })
    .transform((value, originalValue) => (originalValue === "" ? null : value)),
  secondaryColorCode: yup
    .string()
    .nullable()
    .matches(/^#[0-9A-F]{6}$/i, {
      message: "Secondary color code must be a valid hex color (e.g., #FF5733)",
    })
    .transform((value, originalValue) => (originalValue === "" ? null : value)),
});

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const ThemeEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: theme, isLoading: isFetching } = useGetThemeQuery(id);
  const [updateTheme, { isLoading: isUpdating }] = useUpdateThemeMutation();
  const { uploadImage, isUploading } = useImageUpload();
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      domainUrl: "",
      logo: "",
      primaryColorCode: "",
      secondaryColorCode: "",
    },
  });

  const primaryColorCode = watch("primaryColorCode");
  const secondaryColorCode = watch("secondaryColorCode");

  useEffect(() => {
    if (theme) {
      reset({
        domainUrl: theme.domainUrl || "",
        logo: theme.logo || "",
        primaryColorCode: theme.primaryColorCode || "",
        secondaryColorCode: theme.secondaryColorCode || "",
      });
      setLogoPreview(theme.logo || null);
      setLogoFile(null);
    }
  }, [theme, reset]);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setLogoPreview(theme?.logo || null);
      setLogoFile(null);
      setValue("logo", theme?.logo || "");
    }
  };

  const onSubmit = async (data) => {
    let logoUrl = data.logo;

    // Upload logo file if a new one is selected
    if (logoFile) {
      logoUrl = await uploadImage(logoFile);
      if (!logoUrl) {
        toast.error("Failed to upload logo");
        return;
      }
    }

    const payload = {
      id: theme.id,
      ...(data.domainUrl && { domainUrl: data.domainUrl }),
      ...(logoUrl && { logo: logoUrl }),
      ...(data.primaryColorCode && { primaryColorCode: data.primaryColorCode }),
      ...(data.secondaryColorCode && {
        secondaryColorCode: data.secondaryColorCode,
      }),
    };

    const res = await updateTheme(payload);
    if (res?.data) {
      toast.success("Theme updated successfully");
      navigate("/superadmin/themes");
    } else {
      toast.error(res?.error?.data?.message || "Failed to update theme");
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
      </div>
    );
  }

  if (!theme) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] space-y-4">
        <p className="text-red-500">Theme not found</p>
        <Button onClick={() => navigate("/superadmin/themes")}>Go Back</Button>
      </div>
    );
  }

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
            onClick={() => navigate("/superadmin/themes")}
            className="rounded-full h-10 w-10 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Edit Theme
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
              Update branding and visual settings for this theme.
            </p>
          </div>
        </div>
        <Button
          onClick={handleSubmit(onSubmit)}
          disabled={isUpdating || isUploading}
          className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg shadow-indigo-500/20 px-6 transition-all duration-300 hover:scale-[1.02]"
        >
          {isUpdating || isUploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Updating...
            </>
          ) : (
            <>
              <Check className="w-4 h-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Branding */}
        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-slate-900 rounded-[24px] p-6 shadow-sm border border-slate-200 dark:border-slate-800"
        >
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
            <div className="p-2 rounded-lg bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
              Brand Identity
            </h3>
          </div>

          <div className="space-y-7 mb-8">
            <TextField
              label="Domain URL"
              placeholder="https://example.com"
              register={register}
              name="domainUrl"
              error={errors.domainUrl}
              icon={<Globe className="h-4 w-4 text-slate-400" />}
              className="h-11 rounded-xl"
            />

            <div className="space-y-2 mt-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Logo
              </label>
              <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer relative group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                {logoPreview ? (
                  <div className="relative w-full flex justify-center">
                    <img
                      src={logoPreview}
                      alt="Logo Preview"
                      className="h-32 object-contain"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                      <p className="text-white text-sm font-medium flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        Change Logo
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="h-12 w-12 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <ImageIcon className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                      Click to upload logo
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      PNG, JPG up to 2MB
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Colors */}
        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-slate-900 rounded-[24px] p-6 shadow-sm border border-slate-200 dark:border-slate-800"
        >
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400">
              <Palette className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
              Color Scheme
            </h3>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="relative h-12 w-full rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-all hover:scale-[1.01] active:scale-[0.99] group cursor-pointer">
                  <input
                    type="color"
                    value={
                      /^#[0-9A-F]{6}$/i.test(primaryColorCode)
                        ? primaryColorCode
                        : "#000000"
                    }
                    onChange={(e) =>
                      setValue("primaryColorCode", e.target.value, {
                        shouldValidate: true,
                      })
                    }
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div
                    className="w-full h-full flex items-center justify-center transition-colors duration-300"
                    style={{ backgroundColor: primaryColorCode || "#f8fafc" }}
                  >
                    <div className="bg-white/30 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-sm border border-white/20">
                      <span className="text-xs font-semibold text-slate-900 flex items-center gap-2">
                        <Palette className="w-3 h-3" />
                        Pick Color
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="relative h-12 w-full rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-all hover:scale-[1.01] active:scale-[0.99] group cursor-pointer">
                  <input
                    type="color"
                    value={
                      /^#[0-9A-F]{6}$/i.test(secondaryColorCode)
                        ? secondaryColorCode
                        : "#000000"
                    }
                    onChange={(e) =>
                      setValue("secondaryColorCode", e.target.value, {
                        shouldValidate: true,
                      })
                    }
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div
                    className="w-full h-full flex items-center justify-center transition-colors duration-300"
                    style={{ backgroundColor: secondaryColorCode || "#f8fafc" }}
                  >
                    <div className="bg-white/30 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-sm border border-white/20">
                      <span className="text-xs font-semibold text-slate-900 flex items-center gap-2">
                        <Palette className="w-3 h-3" />
                        Pick Color
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                Preview
              </h4>
              <div className="space-y-3">
                <div
                  className="h-10 w-full rounded-lg flex items-center justify-center text-white text-sm font-medium shadow-sm"
                  style={{ backgroundColor: primaryColorCode || "#94a3b8" }}
                >
                  Primary Button
                </div>
                <div className="flex gap-3">
                  <div
                    className="h-10 flex-1 rounded-lg border-2 flex items-center justify-center text-sm font-medium"
                    style={{
                      borderColor: primaryColorCode || "#94a3b8",
                      color: primaryColorCode || "#94a3b8",
                    }}
                  >
                    Outline Button
                  </div>
                  <div
                    className="h-10 flex-1 rounded-lg flex items-center justify-center text-white text-sm font-medium shadow-sm"
                    style={{ backgroundColor: secondaryColorCode || "#64748b" }}
                  >
                    Secondary
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ThemeEditPage;
