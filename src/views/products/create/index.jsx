import React, { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useCreateProductMutation } from "@/features/product/productApiSlice";
import { useGetCategoriesQuery } from "@/features/category/categoryApiSlice";
import useImageUpload from "@/hooks/useImageUpload";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  ProductFormHeader,
  ProductCoverImageSection,
  ProductImagesSection,
  ProductNameSection,
  ProductCategorySection,
  ProductSizeVariantSection,
  ProductVariantSection,
  ProductVariantImagesSection,
  ProductDescriptionSection,
  ProductShippingSection,
  ProductPricingSection,
  ProductFormActions,
} from "@/pages/products/components/sections";

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
    .positive("Price must be greater than 0"),
  discountPrice: yup
    .number()
    .nullable()
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .typeError("Discount price must be a number")
    .positive("Discount price must be greater than 0")
    .test(
      "less-than-price",
      "Discount price must be less than regular price",
      function (value) {
        const { price } = this.parent;
        if (!value || !price) return true;
        return value < price;
      },
    ),
  stock: yup
    .number()
    .nullable()
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .typeError("Stock must be a number")
    .min(0, "Stock cannot be negative")
    .integer("Stock must be a whole number"),
  weight: yup
    .number()
    .nullable()
    .transform((v, o) => (o === "" ? null : v))
    .min(0),
  length: yup
    .number()
    .nullable()
    .transform((v, o) => (o === "" ? null : v))
    .min(0),
  breadth: yup
    .number()
    .nullable()
    .transform((v, o) => (o === "" ? null : v))
    .min(0),
  width: yup
    .number()
    .nullable()
    .transform((v, o) => (o === "" ? null : v))
    .min(0),
});

function CreateProductPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { data: categories = [] } = useGetCategoriesQuery({
    companyId: user?.companyId,
  });

  const [categoryOption, setCategoryOption] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [saveAsDraft, setSaveAsDraft] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [sizes, setSizes] = useState([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [isAddingSize, setIsAddingSize] = useState(false);
  const [newSizeValue, setNewSizeValue] = useState("");
  const [variants, setVariants] = useState([]);
  const [isAddingVariant, setIsAddingVariant] = useState(false);
  const [newVariantName, setNewVariantName] = useState("");
  const [newVariantColor, setNewVariantColor] = useState("#6366f1");

  const handleAddVariant = useCallback(() => {
    if (newVariantName.trim()) {
      setVariants((prev) => [
        ...prev,
        { name: newVariantName.trim(), color: newVariantColor, id: Date.now() },
      ]);
      setNewVariantName("");
      setNewVariantColor("#6366f1");
      setIsAddingVariant(false);
    }
  }, [newVariantName, newVariantColor]);

  const removeVariant = useCallback((id) => {
    setVariants((prev) => prev.filter((v) => v.id !== id));
  }, []);

  const updateVariant = useCallback((id, field, value) => {
    setVariants((prev) =>
      prev.map((v) => (v.id === id ? { ...v, [field]: value } : v)),
    );
  }, []);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid, isDirty },
  } = useForm({
    resolver: yupResolver(productSchema),
    mode: "onChange",
  });

  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const { uploadImage, isUploading } = useImageUpload();

  const categoryOptions = useMemo(
    () => categories.map((cat) => ({ label: cat.name, value: cat.id })),
    [categories],
  );

  const watchedName = watch("name");

  // ============= MEMOIZED CALLBACKS =============
  const addImage = useCallback(() => {
    setImageFiles((prev) => [
      ...prev,
      { url: "", alt: "", isPrimary: prev.length === 0, file: null },
    ]);
  }, []);

  const removeImage = useCallback((index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateImage = useCallback((index, field, value) => {
    setImageFiles((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }, []);

  // ============= SUBMIT HANDLER =============
  const onSubmit = useCallback(
    async (data, options = {}) => {
      const asDraft = options.asDraft ?? saveAsDraft;
      try {
        // Thumbnail: file upload or URL
        let finalThumbnailUrl = null;
        if (thumbnailFile) {
          try {
            finalThumbnailUrl = await uploadImage(thumbnailFile);
            if (!finalThumbnailUrl) {
              toast.error(t("productForm.failedUploadThumbnail"));
              return;
            }
          } catch (error) {
            console.error("Thumbnail upload error:", error);
            toast.error(t("productForm.failedUploadThumbnail"));
            return;
          }
        } else if (thumbnailUrl?.trim()) {
          finalThumbnailUrl = thumbnailUrl.trim();
        }

        // Upload gallery images
        const uploadedImages = [];
        for (let i = 0; i < imageFiles.length; i++) {
          const img = imageFiles[i];
          if (img.file) {
            try {
              const url = await uploadImage(img.file);
              if (url) {
                uploadedImages.push({
                  url,
                  alt: img.alt || `Product image ${i + 1}`,
                  isPrimary: img.isPrimary || false,
                });
              }
            } catch (error) {
              toast.error(`Failed to upload image ${i + 1}`);
              console.error(`Image ${i + 1} upload error:`, error);
            }
          } else if (img.url) {
            uploadedImages.push({
              url: img.url,
              alt: img.alt || `Product image ${i + 1}`,
              isPrimary: img.isPrimary || false,
            });
          }
        }

        // Ensure at least one primary image
        if (
          uploadedImages.length > 0 &&
          !uploadedImages.some((img) => img.isPrimary)
        ) {
          uploadedImages[0].isPrimary = true;
        }

        // Process variant images
        const processedVariants = [];
        if (variants.length > 0) {
          for (const variant of variants) {
            const variantImages = [];
            if (variant.images && variant.images.length > 0) {
              for (let i = 0; i < variant.images.length; i++) {
                const img = variant.images[i];
                if (img.file) {
                  try {
                    const url = await uploadImage(img.file);
                    if (url) {
                      variantImages.push({
                        url,
                        alt: img.alt || `${variant.name} image ${i + 1}`,
                        isPrimary: img.isPrimary || false,
                      });
                    }
                  } catch (error) {
                    console.error(`Variant image upload error:`, error);
                  }
                } else if (img.url) {
                  variantImages.push({
                    url: img.url,
                    alt: img.alt || `${variant.name} image ${i + 1}`,
                    isPrimary: img.isPrimary || false,
                  });
                }
              }
            }
            processedVariants.push({
              name: variant.name,
              color: variant.color,
              images: variantImages.length > 0 ? variantImages : undefined,
            });
          }
        }

        // Build payload
        const payload = {
          name: data.name.trim(),
          price: parseFloat(data.price) || 0,
          discountPrice: data.discountPrice
            ? parseFloat(data.discountPrice)
            : null,
          description: data.description?.trim() || "",
          images: uploadedImages,
          thumbnail: finalThumbnailUrl || null,
          categoryId: categoryOption?.value || null,
          status: asDraft ? "draft" : "published",
          stock: data.stock ? parseInt(data.stock) : 0,
          sizes: selectedSizes.length > 0 ? selectedSizes : undefined,
          variants:
            processedVariants.length > 0 ? processedVariants : undefined,
          weight: data.weight ? parseFloat(data.weight) : undefined,
          length: data.length ? parseFloat(data.length) : undefined,
          breadth: data.breadth ? parseFloat(data.breadth) : undefined,
          width: data.width ? parseFloat(data.width) : undefined,
          unit: "Piece",
        };

        // Create product
        const params = { companyId: user.companyId };
        const res = await createProduct({ body: payload, params });

        if (res?.data) {
          toast.success(
            asDraft
              ? t("productForm.productSavedAsDraft")
              : t("productForm.productCreated"),
          );
          reset();
          setCategoryOption(null);
          setThumbnailFile(null);
          setThumbnailUrl("");
          setImageFiles([]);
          setImageUrlInput("");
          setSaveAsDraft(false);
          setSelectedSizes([]);
          setVariants([]);
          navigate("/products");
        } else {
          toast.error(
            res?.error?.data?.message || t("productForm.productCreateFailed"),
          );
        }
      } catch (error) {
        console.error("Form submission error:", error);
        toast.error("An unexpected error occurred. Please try again.");
      }
    },
    [
      thumbnailFile,
      thumbnailUrl,
      imageFiles,
      selectedSizes,
      variants,
      uploadImage,
      createProduct,
      user,
      navigate,
      saveAsDraft,
      t,
      reset,
    ],
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <ProductFormHeader
        title={t("productForm.addNewProduct")}
        backLabel={t("productForm.backToProductList")}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8"
      >
        <form
          onSubmit={handleSubmit((d) => onSubmit(d, { asDraft: false }))}
          className="grid grid-cols-12 gap-6 lg:gap-8"
        >
          <div className="col-span-12 lg:col-span-8 space-y-6 lg:space-y-8">
            <ProductCoverImageSection
              thumbnailFile={thumbnailFile}
              thumbnailUrl={thumbnailUrl}
              setThumbnailFile={setThumbnailFile}
              setThumbnailUrl={setThumbnailUrl}
            />
            <ProductImagesSection
              imageFiles={imageFiles}
              setImageFiles={setImageFiles}
              imageUrlInput={imageUrlInput}
              setImageUrlInput={setImageUrlInput}
              removeImage={removeImage}
            />
            <ProductNameSection register={register} errors={errors} />
            <ProductCategorySection
              categoryOptions={categoryOptions}
              categoryOption={categoryOption}
              setCategoryOption={setCategoryOption}
            />
            <ProductSizeVariantSection
              sizes={sizes}
              selectedSizes={selectedSizes}
              setSelectedSizes={setSelectedSizes}
              setSizes={setSizes}
              isAddingSize={isAddingSize}
              setIsAddingSize={setIsAddingSize}
              newSizeValue={newSizeValue}
              setNewSizeValue={setNewSizeValue}
            />
            <ProductVariantSection
              variants={variants}
              updateVariant={updateVariant}
              removeVariant={removeVariant}
              isAddingVariant={isAddingVariant}
              setIsAddingVariant={setIsAddingVariant}
              newVariantName={newVariantName}
              setNewVariantName={setNewVariantName}
              newVariantColor={newVariantColor}
              setNewVariantColor={setNewVariantColor}
              handleAddVariant={handleAddVariant}
            />
            <ProductVariantImagesSection
              variants={variants}
              updateVariant={updateVariant}
            />
            <ProductDescriptionSection
              control={control}
              errors={errors}
              watchedName={watchedName}
            />
            <ProductFormActions
              handleSubmit={handleSubmit}
              onSubmit={onSubmit}
              isUpdating={isCreating}
              isUploading={isUploading}
              isValid={isValid}
              submitLabel={t("productForm.publish")}
              savingLabel={t("productForm.saving")}
            />
          </div>

          <div className="col-span-12 lg:col-span-4 space-y-6 sticky top-24 h-fit">
            <ProductShippingSection register={register} errors={errors} />
            <ProductPricingSection register={register} errors={errors} />
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default CreateProductPage;
