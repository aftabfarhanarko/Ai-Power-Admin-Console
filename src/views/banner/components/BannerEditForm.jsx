import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import TextField from "@/components/input/TextField";
import FileUpload from "@/components/input/FileUpload";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { useUpdateBannerMutation } from "@/features/banners/bannersApiSlice";
import useImageUpload from "@/hooks/useImageUpload";
import { useSelector } from "react-redux";
function BannerEditForm({ banner }) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

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
          .required(t("banners.validation.buttonLinkRequired")),
        order: yup
          .number()
          .typeError(t("banners.validation.orderNumber"))
          .integer(t("banners.validation.orderInteger"))
          .min(0, t("banners.validation.orderMin"))
          .required(t("banners.validation.orderRequired")),
        isActive: yup
          .boolean()
          .required(t("banners.validation.statusRequired")),
      }),
    [t],
  );
  const [imageFile, setImageFile] = useState(null);
  const { uploadImage, isUploading } = useImageUpload();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(bannerEditSchema),
    defaultValues: {
      title: banner?.title || "",
      subtitle: banner?.subtitle || "",
      imageUrl: banner?.imageUrl || "",
      buttonText: banner?.buttonText || "",
      buttonLink: banner?.buttonLink || "",
      isActive: Boolean(banner?.isActive),
      order: banner?.order ?? 1,
    },
  });

  const [updateBanner, { isLoading: isUpdating }] = useUpdateBannerMutation();
  const authUser = useSelector((state) => state.auth.user);
  const sanitizeUrl = (u) => (u || "").replace(/`/g, "").trim();

  const onSubmit = async (data) => {
    let imageUrl = sanitizeUrl(data.imageUrl);

    // If a file is selected, upload it first
    if (imageFile) {
      const uploadedUrl = await uploadImage(imageFile);
      if (!uploadedUrl) {
        toast.error(t("banners.failedToUploadImage"));
        return;
      }
      imageUrl = uploadedUrl;
    }

    // If neither file nor URL is provided, show error
    if (!imageUrl) {
      toast.error(t("banners.provideImageUrlOrUpload"));
      return;
    }

    const payload = {
      id: banner?.id,
      title: data.title,
      subtitle: data.subtitle,
      imageUrl: imageUrl,
      buttonText: data.buttonText,
      buttonLink: data.buttonLink,
      isActive: Boolean(data.isActive),
      order: parseInt(data.order, 10) || 0,
    };

    try {
      const params = {
        companyId: authUser?.companyId,
      };
      const res = await updateBanner({ id: banner?.id, body: payload, params });
      if (res?.data) {
        toast.success(t("banners.bannerUpdated"));
        reset();
        setImageFile(null);
        setIsOpen(false);
      } else {
        toast.error(
          res?.error?.data?.message || t("banners.bannerUpdateFailed"),
        );
      }
    } catch {
      toast.error(t("common.failed"));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="bg-[#DCE865] hover:bg-[#DCE865]/90 text-black"
          title={t("common.edit")}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("banners.editBanner")}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 mt-4"
        >
          <TextField
            label={t("banners.titleField")}
            placeholder={t("banners.bannerTitlePlaceholder")}
            register={register}
            name="title"
            error={errors.title}
          />
          <TextField
            label={t("banners.subtitle")}
            placeholder={t("banners.subtitlePlaceholder")}
            register={register}
            name="subtitle"
            error={errors.subtitle}
          />

          <FileUpload
            placeholder={t("banners.chooseImageFile")}
            label={t("banners.uploadImage")}
            name="image"
            accept="image/*"
            onChange={setImageFile}
            value={banner?.imageUrl}
          />

          <div className="text-center text-sm text-black/50 dark:text-white/50">
            {t("banners.orLabel")}
          </div>

          <TextField
            label={t("banners.imageUrl")}
            placeholder={t("banners.imageUrlPlaceholder")}
            register={register}
            name="imageUrl"
            error={errors.imageUrl}
          />

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
          <TextField
            label={t("banners.displayOrder")}
            placeholder={t("banners.orderPlaceholder")}
            register={register}
            name="order"
            type="number"
            error={errors.order}
          />
          <div className="flex flex-col gap-2">
            <label className="text-black/50 dark:text-white/50 text-sm ml-1">
              {t("common.status")}
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                {...register("isActive")}
                className="w-4 h-4 rounded border-black/20 dark:border-white/20"
              />
              <span className="text-sm">{t("common.active")}</span>
            </label>
            {errors.isActive && (
              <span className="text-red-500 text-xs ml-1">
                {errors.isActive.message}
              </span>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              type="button"
              onClick={() => setIsOpen(false)}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isUpdating || isUploading}
              className="bg-[#DCE865] hover:bg-[#DCE865]/90 text-black"
            >
              {isUpdating || isUploading
                ? t("common.processing")
                : t("common.update")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default BannerEditForm;
