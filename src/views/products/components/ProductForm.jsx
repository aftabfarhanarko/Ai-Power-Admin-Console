import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import TextField from "@/components/input/TextField";
import Checkbox from "@/components/input/Checkbox";
import Dropdown from "@/components/dropdown/dropdown";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useCreateProductMutation } from "@/features/product/productApiSlice";
import useImageUpload from "@/hooks/useImageUpload";
import FileUpload from "@/components/input/FileUpload";
import DescriptionInputWithAI from "@/components/input/DescriptionInputWithAI";
import { X, Plus } from "lucide-react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

// Yup validation schema
const productSchema = yup.object().shape({
  name: yup
    .string()
    .required("Product name is required")
    .min(2, "Product name must be at least 2 characters")
    .max(200, "Product name must be less than 200 characters")
    .trim(),
  description: yup
    .string()
    .max(2000, "Description must be less than 2000 characters")
    .trim(),
  price: yup
    .number()
    .typeError("Price must be a number")
    .required("Price is required")
    .positive("Price must be greater than 0")
    .test('decimal-places', 'Price can have at most 2 decimal places', (value) => {
      if (value === undefined || value === null) return true;
      return /^\d+(\.\d{1,2})?$/.test(value.toString());
    }),
  discountPrice: yup
    .number()
    .nullable()
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .typeError("Discount price must be a number")
    .positive("Discount price must be greater than 0")
    .test('less-than-price', 'Discount price must be less than regular price', function(value) {
      const { price } = this.parent;
      if (!value || !price) return true;
      return value < price;
    })
    .test('decimal-places', 'Discount price can have at most 2 decimal places', (value) => {
      if (value === undefined || value === null) return true;
      return /^\d+(\.\d{1,2})?$/.test(value.toString());
    }),
});

function ProductForm({ categoryOptions = [] }) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [categoryOption, setCategoryOption] = useState(null);
  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(productSchema),
    mode: "onChange",
  });
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const { uploadImage, isUploading } = useImageUpload();
  const { user } = useSelector((state) => state.auth);
  const addImage = () => {
    setImageFiles([...imageFiles, { url: "", alt: "", isPrimary: imageFiles.length === 0 }]);
  };

  const removeImage = (index) => {
    setImageFiles(imageFiles.filter((_, i) => i !== index));
  };

  const updateImage = (index, field, value) => {
    const updated = [...imageFiles];
    updated[index] = { ...updated[index], [field]: value };
    setImageFiles(updated);
  };

  const setPrimaryImage = (index) => {
    setImageFiles(imageFiles.map((img, i) => ({ ...img, isPrimary: i === index })));
  };

  const onSubmit = async (data) => {
    let thumbnailUrl = null;
    if (thumbnailFile) {
      thumbnailUrl = await uploadImage(thumbnailFile);
      if (!thumbnailUrl) {
        toast.error("Failed to upload thumbnail");
        return;
      }
    }

    // Upload all image files
    const uploadedImages = [];
    for (let i = 0; i < imageFiles.length; i++) {
      const img = imageFiles[i];
      if (img.file) {
        const url = await uploadImage(img.file);
        if (url) {
          uploadedImages.push({
            url,
            alt: img.alt || `Product image ${i + 1}`,
            isPrimary: img.isPrimary || false,
          });
        }
      } else if (img.url) {
        uploadedImages.push({
          url: img.url,
          alt: img.alt || `Product image ${i + 1}`,
          isPrimary: img.isPrimary || false,
        });
      }
    }

    // Ensure at least one image is primary
    if (uploadedImages.length > 0 && !uploadedImages.some((img) => img.isPrimary)) {
      uploadedImages[0].isPrimary = true;
    }

    const payload = {
      name: data.name,
      price: parseFloat(data.price) || 0,
      discountPrice: data.discountPrice ? parseFloat(data.discountPrice) : null,
      description: data.description || "",
      images: uploadedImages,
      thumbnail: thumbnailUrl || null,
      category: categoryOption?.value || null,
    };

    const params = { companyId: user.companyId };
    const res = await createProduct({ body: payload, params });
    if (res?.data) {
      toast.success("Product created");
      reset();
      setCategoryOption(null);
      setThumbnailFile(null);
      setImageFiles([]);
      setIsOpen(false);
    } else {
      toast.error(res?.error?.data?.message || "Failed to create product");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm">{t("products.addProduct")}</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("createEdit.createProduct")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 mt-4">
          {/* Basic Information Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
              <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
                {t("products.basicInformation")}
              </h3>
            </div>
            <TextField
              label={`${t("productForm.productName")} *`}
              placeholder={t("productForm.productNamePlaceholder")}
              register={register}
              name="name"
              error={errors.name?.message}
            />
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <DescriptionInputWithAI
                  {...field}
                  label={t("productForm.description")}
                  placeholder={t("productForm.descriptionPlaceholder")}
                  rows={4}
                  error={errors.description?.message}
                  type="product"
                  title={watch("name")}
                />
              )}
            />
          </div>

          {/* Pricing Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
              <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
                {t("productForm.pricing")}
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <TextField
                label={`${t("productForm.price")} *`}
                placeholder={t("productForm.pricePlaceholder")}
                register={register}
                name="price"
                type="number"
                step="0.01"
                error={errors.price?.message}
              />
              <TextField
                label={t("productForm.discountPrice")}
                placeholder={t("productForm.priceOptionalPlaceholder")}
                register={register}
                name="discountPrice"
                type="number"
                step="0.01"
                error={errors.discountPrice?.message}
              />
            </div>
          </div>

          {/* Images Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
              <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
                {t("productForm.productImages")}
              </h3>
            </div>
            <FileUpload
              placeholder={t("productForm.chooseThumbnail")}
              label={t("productForm.thumbnail")}
              register={register}
              name="thumbnail"
              accept="image/*"
              onChange={setThumbnailFile}
              value={thumbnailFile}
            />

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-black/50 dark:text-white/50 text-sm ml-1">
                  {t("productForm.galleryImages")}
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addImage}
                  className="flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  {t("common.addImage")}
                </Button>
              </div>
              <div className="space-y-3">
                {imageFiles.map((img, index) => (
                  <div key={index} className="border border-black/5 dark:border-gray-800 p-3 rounded-md space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-black/70 dark:text-white/70">
                        {t("productForm.imageNumber", { num: index + 1 })}
                      </span>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          name={`primary_${index}`}
                          value={img.isPrimary}
                          setValue={() => setPrimaryImage(index)}
                        >
                          {t("productForm.primary")}
                        </Checkbox>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeImage(index)}
                          className="h-8 w-8 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            updateImage(index, "file", file);
                          }
                        }}
                        className="text-sm border border-black/5 dark:border-gray-800 py-2 px-3 bg-gray-50 dark:bg-[#1a1f26] w-full outline-none focus:border-green-300/50 dark:focus:border-green-300/50 dark:text-white/90"
                      />
                      <input
                        type="text"
                        placeholder={t("productForm.orEnterImageUrl")}
                        value={img.url || ""}
                        onChange={(e) => updateImage(index, "url", e.target.value)}
                        className="border border-black/5 dark:border-gray-800 py-2.5 px-4 bg-gray-50 dark:bg-[#1a1f26] w-full outline-none focus:border-green-300/50 dark:focus:border-green-300/50 dark:text-white/90"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder={t("productForm.altTextPlaceholder")}
                      value={img.alt || ""}
                      onChange={(e) => updateImage(index, "alt", e.target.value)}
                      className="border border-black/5 dark:border-gray-800 py-2.5 px-4 bg-gray-50 dark:bg-[#1a1f26] w-full outline-none focus:border-green-300/50 dark:focus:border-green-300/50 dark:text-white/90"
                    />
                    {img.file && (
                      <div className="mt-2">
                        <img
                          src={URL.createObjectURL(img.file)}
                          alt="Preview"
                          className="w-full h-32 object-cover rounded"
                        />
                      </div>
                    )}
                    {img.url && !img.file && (
                      <div className="mt-2">
                        <img
                          src={img.url}
                          alt="Preview"
                          className="w-full h-32 object-cover rounded"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))}
                {imageFiles.length === 0 && (
                  <p className="text-sm text-black/50 dark:text-white/50 text-center py-4">
                    {t("common.noImagesAdded")}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Category Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
              <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
                {t("productForm.categoryClassification")}
              </h3>
            </div>
            <Dropdown
              name="Category"
              options={categoryOptions}
              setSelectedOption={setCategoryOption}
              className="py-2"
            >
              {categoryOption?.label || (
                <span className="text-black/50 dark:text-white/50">
                  {t("productForm.selectCategory")}
                </span>
              )}
            </Dropdown>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              type="button"
              onClick={() => setIsOpen(false)}
              className="bg-red-600 hover:bg-red-700 text-white dark:bg-red-600 dark:hover:bg-red-700"
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={isCreating || isUploading}>
              {isCreating || isUploading
                ? t("common.creating")
                : t("common.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default ProductForm;