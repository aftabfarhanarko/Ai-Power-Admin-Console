import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Save, 
  ImageIcon, 
  Type, 
  Link as LinkIcon, 
  Layout, 
  CheckCircle2, 
  XCircle,
  Loader2
} from "lucide-react";
import TextField from "@/components/input/TextField";
import FileUpload from "@/components/input/FileUpload";
import { useUpdateBannerMutation, useGetBannerQuery } from "@/features/banners/bannersApiSlice";
import useImageUpload from "@/hooks/useImageUpload";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import AtomLoader from "@/components/loader/AtomLoader";

function BannerEditPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { data: banner, isLoading: isBannerLoading, isFetching: isBannerFetching } = useGetBannerQuery(parseInt(id));

  const bannerEditSchema = useMemo(
    () =>
      yup.object().shape({
        title: yup
          .string()
          .required(t("banners.validation.titleRequired"))
          .min(2, t("banners.validation.titleMin"))
          .max(200, t("banners.validation.titleMax")),
        subtitle: yup.string().max(500, t("banners.validation.subtitleMax")),
        imageUrl: yup.string(),
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

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    resolver: yupResolver(bannerEditSchema),
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

  const isActive = watch("isActive");

  useEffect(() => {
    if (banner) {
      reset({
        title: banner.title || "",
        subtitle: banner.subtitle || "",
        imageUrl: banner.imageUrl || "",
        buttonText: banner.buttonText || "",
        buttonLink: banner.buttonLink || "",
        isActive: Boolean(banner.isActive),
        order: banner.order ?? 1,
      });
      setImageFile(null); // Clear any previously selected file
    }
  }, [banner, reset]);

  const [updateBanner, { isLoading: isUpdating }] = useUpdateBannerMutation();
  const sanitizeUrl = (u) => (u || "").replace(/`/g, "").trim();

  const onSubmit = async (data) => {
    if (!banner) return;

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
      subtitle: data.subtitle || undefined,
      imageUrl: imageUrl,
      buttonText: data.buttonText || undefined,
      buttonLink: data.buttonLink || undefined,
      isActive: Boolean(data.isActive),
      order: parseInt(data.order, 10) || 0,
    };

    try {
      const params = { companyId: user?.companyId };
      const res = await updateBanner({ id: banner.id, body: payload, params });
      if (res?.data) {
        toast.success(t("banners.bannerUpdated"));
        navigate("/banners");
      } else {
        toast.error(res?.error?.data?.message || t("banners.bannerUpdateFailed"));
      }
    } catch {
      toast.error(t("common.failed"));
    }
  };

  if (isBannerLoading || isBannerFetching) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <AtomLoader />
      </div>
    );
  }

  if (!banner) {
    return (
      <div className="min-h-screen bg-gray-50/50 dark:bg-[#111318] p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/banners")}
              className="bg-white dark:bg-[#1a1f26] hover:bg-gray-100 dark:hover:bg-gray-800 text-black dark:text-white rounded-xl h-10 w-10 border border-gray-200 dark:border-gray-800 shadow-sm"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("banners.bannerNotFound")}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {t("banners.bannerNotFoundDesc")}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#111318] p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/banners")}
              className="bg-white dark:bg-[#1a1f26] hover:bg-gray-100 dark:hover:bg-gray-800 text-black dark:text-white rounded-xl h-10 w-10 border border-gray-200 dark:border-gray-800 shadow-sm"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                {t("banners.editBanner")}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {t("createEdit.updateBanner")}
              </p>
            </div>
          </div>
        </div>

        <form key={banner?.id} onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
          {/* Left Column: Main Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Banner Content Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-[#1a1f26] rounded-[24px] p-6 border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-100/50 dark:shadow-black/20"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Type className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t("banners.bannerContent")}
                </h3>
              </div>
              
              <div className="space-y-6">
                <TextField
                  label={t("banners.titleField")}
                  placeholder={t("banners.bannerTitlePlaceholder")}
                  register={register}
                  name="title"
                  error={errors.title}
                  className="bg-gray-50 dark:bg-black/20"
                />
                <TextField
                  label={t("banners.subtitle")}
                  placeholder={t("banners.subtitlePlaceholder")}
                  register={register}
                  name="subtitle"
                  error={errors.subtitle}
                  className="bg-gray-50 dark:bg-black/20"
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <TextField
                    label={t("banners.buttonText")}
                    placeholder={t("banners.buttonTextPlaceholder")}
                    register={register}
                    name="buttonText"
                    error={errors.buttonText}
                    className="bg-gray-50 dark:bg-black/20"
                  />
                  <TextField
                    label={t("banners.buttonLink")}
                    placeholder={t("banners.buttonLinkPlaceholder")}
                    register={register}
                    name="buttonLink"
                    error={errors.buttonLink}
                    icon={<LinkIcon className="w-4 h-4 text-gray-400" />}
                    className="bg-gray-50 dark:bg-black/20"
                  />
                </div>
              </div>
            </motion.div>

            {/* Media Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-[#1a1f26] rounded-[24px] p-6 border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-100/50 dark:shadow-black/20"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t("banners.bannerImage")}
                </h3>
              </div>

              <div className="space-y-6">
                <FileUpload
                  placeholder={t("banners.chooseImageFile")}
                  label={t("banners.uploadImage")}
                  name="image"
                  accept="image/*"
                  onChange={setImageFile}
                  value={watch("imageUrl") || banner?.imageUrl}
                />

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-200 dark:border-gray-800" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-[#1a1f26] px-2 text-gray-500 dark:text-gray-400">
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
                  className="bg-gray-50 dark:bg-black/20"
                  icon={<LinkIcon className="w-4 h-4 text-gray-400" />}
                />
              </div>
            </motion.div>
          </div>

          {/* Right Column: Settings */}
          <div className="lg:col-span-1 space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-[#1a1f26] rounded-[24px] p-6 border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-100/50 dark:shadow-black/20 sticky top-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Layout className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t("common.status")}
                </h3>
              </div>

              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-black/20 space-y-4">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t("banners.displayOrder")}
                  </label>
                  <TextField
                    placeholder={t("banners.orderPlaceholder")}
                    register={register}
                    name="order"
                    type="number"
                    error={errors.order}
                    className="bg-white dark:bg-[#111318]"
                  />
                </div>

                <div className="p-4 rounded-xl bg-gray-50 dark:bg-black/20 flex items-center justify-between cursor-pointer" onClick={() => document.getElementById('isActive-checkbox').click()}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${isActive ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>
                      {isActive ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {isActive ? t("common.active") : t("common.inactive")}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {isActive ? t("banners.visibleToUsers") : t("banners.hiddenFromUsers")}
                      </p>
                    </div>
                  </div>
                  <input 
                    id="isActive-checkbox"
                    type="checkbox" 
                    {...register("isActive")} 
                    className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700" 
                  />
                </div>
                {errors.isActive && (
                  <span className="text-red-500 text-xs ml-1">{errors.isActive.message}</span>
                )}

                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-3">
                  <Button 
                    type="submit" 
                    disabled={isUpdating || isUploading} 
                    className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 h-11 rounded-xl"
                  >
                    {isUpdating || isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("common.processing")}
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        {t("common.update")}
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="ghost" 
                    type="button" 
                    onClick={() => navigate("/banners")} 
                    className="w-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 h-11 rounded-xl"
                  >
                    {t("common.cancel")}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BannerEditPage;
