import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { userDetailsFetched } from "@/features/auth/authSlice";
import { Button } from "@/components/ui/button";
import useImageUpload from "@/hooks/useImageUpload";
import { useUpdateSystemuserMutation } from "@/features/systemuser/systemuserApiSlice";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Camera,
  Save,
  Loader2,
  ShieldCheck,
} from "lucide-react";

const ProfileSettings = ({ user: userFromApi }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const authUser = useSelector((state) => state.auth.user);
  const userId = authUser?.userId || authUser?.sub || authUser?.id;
  const user = userFromApi ?? authUser ?? null;

  const [updateSystemuser, { isLoading: isUpdating }] =
    useUpdateSystemuserMutation();
  const [logoFile, setLogoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const { uploadImage, isUploading } = useImageUpload();

  // Profile form
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      name: "",
      email: "",
      companyName: "",
      phone: "",
      branchLocation: "",
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name || "",
        email: user.email || "",
        companyName: user.companyName || "",
        phone: user.phone || "",
        branchLocation: user.branchLocation || "",
      });
      setLogoFile(null);
      setPreviewUrl(user.companyLogo || null);
    }
  }, [user, reset]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    if (!userId) {
      toast.error(t("settings.userIdNotFound"));
      return;
    }

    try {
      let companyLogo = user?.companyLogo || "";

      // If a file is selected, upload it first
      if (logoFile) {
        const uploadedUrl = await uploadImage(logoFile);
        if (!uploadedUrl) {
          toast.error(t("settings.failedUploadLogo"));
          return;
        }
        companyLogo = uploadedUrl;
      }

      const payload = {
        ...data,
        companyLogo,
      };

      const res = await updateSystemuser({ id: userId, ...payload });
      if (res?.data) {
        toast.success(t("settings.profileUpdated"));
        setLogoFile(null);

        // Update Redux state and localStorage immediately
        dispatch(userDetailsFetched(payload));
      } else {
        toast.error(
          res?.error?.data?.message || t("settings.profileUpdateFailed"),
        );
      }
    } catch (e) {
      toast.error(t("settings.somethingWentWrong"));
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
            <Building className="h-6 w-6" />
          </div>
          {/* {t("settings.companyProfile")} */}
          Company Profile
        </h2>
      </div>

      {!user ? (
        <div className="flex flex-col items-center justify-center h-64 text-center p-6 rounded-[24px] border border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
          <Loader2 className="h-8 w-8 text-violet-500 animate-spin mb-4" />
          <p className="text-black/60 dark:text-white/60">
            {t("settings.loadingUserData")}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Left Column: Brand Identity */}
            <div className="xl:col-span-1 space-y-6">
              <div className="rounded-[24px] border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1f26] shadow-xl overflow-hidden p-6 text-center relative group">
                <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-br from-violet-500/10 to-indigo-500/10 dark:from-violet-500/20 dark:to-indigo-500/20"></div>
                
                <div className="relative z-10 mt-4 mb-4">
                  <div className="w-40 h-40 mx-auto rounded-3xl border-4 border-white dark:border-[#1a1f26] bg-white dark:bg-gray-800 shadow-xl flex items-center justify-center overflow-hidden relative group-hover:shadow-2xl transition-all duration-300">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Company Logo"
                        className="w-full h-full object-contain p-2"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <Building className="w-12 h-12 mb-2" />
                        <span className="text-xs font-medium">No Logo</span>
                      </div>
                    )}
                    
                    {/* Overlay Upload Button */}
                    <label
                      htmlFor="logo-upload"
                      className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-[2px]"
                    >
                      <Camera className="w-8 h-8 text-white mb-2" />
                      <span className="text-white text-xs font-bold uppercase tracking-wider">Change Logo</span>
                      <input
                        type="file"
                        id="logo-upload"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  {user.companyName || "Company Name"}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1.5 mb-6">
                  <MapPin className="w-3.5 h-3.5" />
                  {user.branchLocation || "Location not set"}
                </p>

                <div className="grid grid-cols-2 gap-3 border-t border-gray-100 dark:border-gray-800 pt-6">
                  <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Role</p>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{user.role || "Admin"}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Status</p>
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">Active</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Tips or Info Card could go here */}
              <div className="p-5 rounded-[24px] bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                    <ShieldCheck className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">Business Profile</h4>
                    <p className="text-sm text-white/80 leading-relaxed">
                      Keep your company details up to date to ensure accurate billing and communications.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Form Details */}
            <div className="xl:col-span-2">
              <div className="rounded-[24px] border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1f26] shadow-xl overflow-hidden">
                <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-800">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Building className="w-5 h-5 text-violet-500" />
                    Company Information
                  </h3>
                </div>
                
                <div className="p-6 md:p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Company Name */}
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
                        {t("settings.companyNamePlaceholder")}
                      </label>
                      <div className="relative">
                        <Building className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          {...register("companyName")}
                          placeholder="e.g. Acme Corp"
                          className="w-full h-12 pl-12 pr-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-black/20 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all placeholder:text-gray-400 font-medium"
                        />
                      </div>
                    </div>

                    {/* Branch Location */}
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
                        {t("settings.branchLocationPlaceholder")}
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          {...register("branchLocation")}
                          placeholder="e.g. 123 Business Ave, Tech City"
                          className="w-full h-12 pl-12 pr-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-black/20 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all placeholder:text-gray-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 md:p-8 border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/30">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
                    <User className="w-5 h-5 text-violet-500" />
                    Primary Contact
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Full Name */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
                        {t("settings.fullName")}
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          {...register("name")}
                          placeholder={t("settings.fullName")}
                          className="w-full h-12 pl-12 pr-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-black/20 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all placeholder:text-gray-400"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
                        {t("settings.email")}
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          {...register("email")}
                          type="email"
                          placeholder={t("settings.email")}
                          className="w-full h-12 pl-12 pr-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-black/20 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all placeholder:text-gray-400"
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
                        {t("settings.phone")}
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          {...register("phone")}
                          placeholder={t("settings.phone")}
                          className="w-full h-12 pl-12 pr-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-black/20 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all placeholder:text-gray-400"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-8">
                    <Button
                      type="submit"
                      disabled={isUpdating || isUploading}
                      className="rounded-xl h-12 px-8 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 font-bold"
                    >
                      {isUpdating || isUploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t("settings.updating")}
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          {t("settings.saveChanges")}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}
    </motion.div>
  );
};

export default ProfileSettings;
