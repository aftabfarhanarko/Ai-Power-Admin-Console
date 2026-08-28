import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Save, 
  ImageIcon, 
  Type, 
  Link as LinkIcon, 
  Layout, 
  CheckCircle2, 
  XCircle 
} from "lucide-react";
import TextField from "@/components/input/TextField";
import FileUpload from "@/components/input/FileUpload";
import { useCreateBannerMutation } from "@/features/banners/bannersApiSlice";
import useImageUpload from "@/hooks/useImageUpload";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";

function CreateBannerPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const bannerSchema = useMemo(
    () =>
      yup.object().shape({
        title: yup
          .string()
          .required(t("banners.validation.titleRequired"))
          .min(2, t("banners.validation.titleMin"))
          .max(200, t("banners.validation.titleMax")),
        subtitle: yup.string().max(500, t("banners.validation.subtitleMax")),
        imageUrl: yup
          .string()
          .nullable()
          .transform((value, originalValue) => (originalValue === "" ? null : value))
          .test("url-or-empty", t("banners.validation.urlOrEmpty"), function (value) {
            if (!value || value.trim() === "") return true;
            try {
              new URL(value);
              return true;
            } catch {
              return false;
            }
          }),
        buttonText: yup.string().max(50, t("banners.validation.buttonTextMax")),
        buttonLink: yup
          .string()
          .nullable()
          .transform((value, originalValue) => (originalValue === "" ? null : value))
          .test("url-or-empty", t("banners.validation.urlOrEmpty"), function (value) {
            if (!value || value.trim() === "") return true;
            try {
              new URL(value);
              return true;
            } catch {
              return false;
            }
          }),
        order: yup
          .number()
          .typeError(t("banners.validation.orderNumber"))
          .integer(t("banners.validation.orderInteger"))
          .min(0, t("banners.validation.orderMin"))
          .required(t("banners.validation.orderRequired")),
        isActive: yup.boolean().required(t("banners.validation.statusRequired")),
      }),
    [t]
  );
  const [imageFile, setImageFile] = useState(null);
  const { uploadImage, isUploading } = useImageUpload();
  const authUser = useSelector((state) => state.auth.user);
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    resolver: yupResolver(bannerSchema),
    defaultValues: {
      title: "",
      subtitle: "",
      imageUrl: "",
      buttonText: "",
      buttonLink: "",
      isActive: true,
      order: 1,
    },
  });

  const [createBanner, { isLoading: isCreating }] = useCreateBannerMutation();

  const isActive = watch("isActive");

  const sanitizeUrl = (u) => (u || "").replace(/`/g, "").trim();

  const onSubmit = async (data) => {
    let imageUrl = sanitizeUrl(data.imageUrl);

    if (imageFile) {
      const uploadedUrl = await uploadImage(imageFile);
      if (!uploadedUrl) {
        toast.error(t("banners.failedToUploadImage"));
        return;
      }
      imageUrl = uploadedUrl;
    }

    if (!imageUrl) {
      toast.error(t("banners.provideImageUrlOrUpload"));
      return;
    }

    const payload = {
      title: data.title,
      subtitle: data.subtitle,
      imageUrl: imageUrl,
      buttonText: data.buttonText,
      buttonLink: data.buttonLink,
      isActive: Boolean(data.isActive),
      order: parseInt(data.order, 10) || 0,
      productId: null,
    };

    const params = { params: { companyId: authUser?.companyId } };
    try {
      const res = await createBanner({ body: payload, params });
      if (res?.data) {
        toast.success(t("banners.bannerCreated"));
        reset();
        setImageFile(null);
        navigate("/banners");
      } else {
        toast.error(res?.error?.data?.message || t("banners.bannerCreateFailed"));
      }
    } catch (err) {
      toast.error(t("common.failed"));
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-[#1a1f26]/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 -mx-6 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/banners")}
            className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
              {t("createEdit.createBanner")}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              {t("createEdit.createBannerDesc") || "Design a new marketing banner for your store"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => navigate("/banners")}
            className="hidden sm:flex rounded-xl border-gray-200 dark:border-gray-700"
          >
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={isCreating || isUploading}
            className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold shadow-lg shadow-blue-500/20"
          >
            {isCreating || isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                {t("common.processing")}
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

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
        {/* Left Column: Main Info */}
        <div className="lg:col-span-2 space-y-8">
          {/* Banner Content Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-[#1a1f26] rounded-[24px] p-6 border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-100/50 dark:shadow-black/20"
          >
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <Type className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {t("banners.bannerContent")}
              </h3>
            </div>
            
            <div className="space-y-6">
              <TextField
                label={t("banners.bannerTitle")}
                placeholder={t("banners.bannerTitlePlaceholder")}
                register={register}
                name="title"
                error={errors.title}
                className="text-lg font-medium"
              />
              <TextField
                label={t("banners.subtitle")}
                placeholder={t("banners.subtitlePlaceholder")}
                register={register}
                name="subtitle"
                error={errors.subtitle}
                className="text-base"
              />
            </div>
          </motion.div>

          {/* Image Upload Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-[#1a1f26] rounded-[24px] p-6 border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-100/50 dark:shadow-black/20"
          >
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="p-2.5 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                <ImageIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {t("banners.bannerImage")}
              </h3>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 dark:bg-black/20 rounded-2xl p-4 border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-blue-500/50 transition-colors">
                <FileUpload
                  placeholder={t("banners.chooseImageFile")}
                  label={t("banners.uploadImage")}
                  name="image"
                  accept="image/*"
                  onChange={setImageFile}
                  value={imageFile}
                />
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200 dark:border-gray-800" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-[#1a1f26] px-2 text-gray-500">
                    {t("banners.orLabel")}
                  </span>
                </div>
              </div>

              <TextField
                label={t("banners.imageUrl")}
                placeholder={t("banners.imageUrlPlaceholder")}
                register={register}
                name="imageUrl"
                error={errors.imageUrl}
              />
            </div>
          </motion.div>

          {/* Call to Action Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-[#1a1f26] rounded-[24px] p-6 border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-100/50 dark:shadow-black/20"
          >
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                <LinkIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {t("banners.callToAction")}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TextField
                label={t("banners.buttonText")}
                placeholder={t("banners.buttonTextPlaceholder")}
                register={register}
                name="buttonText"
                error={errors.buttonText}
              />
              <TextField
                label={t("banners.buttonLink")}
                placeholder={t("banners.buttonLinkPlaceholder")}
                register={register}
                name="buttonLink"
                error={errors.buttonLink}
              />
            </div>
          </motion.div>
        </div>

        {/* Right Column: Settings */}
        <div className="lg:col-span-1 space-y-8">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-[#1a1f26] rounded-[24px] p-6 border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-100/50 dark:shadow-black/20 sticky top-24"
          >
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="p-2.5 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                <Layout className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {t("banners.settings")}
              </h3>
            </div>

            <div className="space-y-6">
              {/* Status Toggle */}
              <div className="bg-gray-50 dark:bg-black/20 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 block">
                  {t("common.status")}
                </label>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isActive ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-gray-400" />
                    )}
                    <span className={`font-semibold ${isActive ? "text-emerald-600 dark:text-emerald-400" : "text-gray-500"}`}>
                      {isActive ? t("common.active") : t("common.disabled")}
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" {...register("isActive")} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                {errors.isActive && (
                  <p className="text-red-500 text-xs mt-2">{errors.isActive.message}</p>
                )}
              </div>

              <TextField
                label={t("banners.displayOrder")}
                placeholder={t("banners.orderPlaceholder")}
                register={register}
                name="order"
                type="number"
                error={errors.order}
              />
            </div>
          </motion.div>
        </div>
      </form>
    </div>
  );
}

export default CreateBannerPage;
