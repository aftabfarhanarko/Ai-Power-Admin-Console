import React, { useState, useMemo, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Pencil, X, Plus } from "lucide-react";
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
import { useUpdateProductMutation } from "@/features/product/productApiSlice";
import useImageUpload from "@/hooks/useImageUpload";
import FileUpload from "@/components/input/FileUpload";
import DescriptionInputWithAI from "@/components/input/DescriptionInputWithAI";
import { useSelector } from "react-redux";

// Yup validation schema
const productEditSchema = yup.object().shape({
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

export default function ProductEditForm({ product, categoryOptions = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const defaultCategory = useMemo(() => {
    const id = product?.category?.id ?? product?.categoryId;
    const found = categoryOptions.find((c) => c.value === id);
    return found || null;
  }, [product, categoryOptions]);

  const [selectedCategory, setSelectedCategory] = useState(defaultCategory);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const { uploadImage, isUploading } = useImageUpload();
  const { user } = useSelector((state) => state.auth);
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(productEditSchema),
    mode: "onChange",
    defaultValues: {
      name: product?.name ?? product?.title ?? "",
      price:
        typeof product?.price === "number"
          ? product?.price
          : Number(product?.price) || "",
      discountPrice:
        typeof product?.discountPrice === "number"
          ? product?.discountPrice
          : product?.discountPrice
            ? Number(product?.discountPrice)
            : "",
      description: product?.description ?? "",
      thumbnail: product?.thumbnail ?? "",
    },
  });

  useEffect(() => {
    if (product?.images && Array.isArray(product.images)) {
      setImageFiles(
        product.images.map((img) => ({
          url: img.url || "",
          alt: img.alt || "",
          isPrimary: img.isPrimary || false,
          file: null,
        }))
      );
    }
    if (product?.thumbnail) {
      setThumbnailFile(product.thumbnail);
    }
  }, [product]);

  const addImage = () => {
    setImageFiles([...imageFiles, { url: "", alt: "", isPrimary: imageFiles.length === 0, file: null }]);
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

  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

  const onSubmit = async (data) => {
    let thumbnailUrl = data.thumbnail || null;
    if (thumbnailFile && typeof thumbnailFile === "object") {
      thumbnailUrl = await uploadImage(thumbnailFile);
      if (!thumbnailUrl) {
        toast.error("Failed to upload thumbnail");
        return;
      }
    }

    // Upload all new image files and preserve existing URLs
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

    if (!selectedCategory?.value) {
      toast.error("Category is required");
      return;
    }
    if (!user?.companyId) {
      toast.error("Missing company context");
      return;
    }

    const payload = {
      name: data.name?.trim(),
      price: parseFloat(data.price) || 0,
      discountPrice: data.discountPrice ? parseFloat(data.discountPrice) : undefined,
      description: data.description?.trim() || "",
      images: uploadedImages,
      thumbnail: thumbnailUrl || undefined,
      categoryId: Number(selectedCategory.value),
    };

    const params = { companyId: user.companyId };
    const res = await updateProduct({ id: product.id, body: payload, params });
    if (res?.data) {
      toast.success("Product updated");
      setIsOpen(false);
    } else {
      toast.error(res?.error?.data?.message || "Failed to update product");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400"
          title="Edit"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 mt-4">
          {/* Basic Information Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
              <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
                Basic Information
              </h3>
            </div>
            <TextField
              label="Product Name *"
              placeholder="Enter product name"
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
                  label="Description"
                  placeholder="Enter product description"
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
                Pricing
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <TextField
                label="Price *"
                placeholder="0.00"
                register={register}
                name="price"
                type="number"
                step="0.01"
                error={errors.price?.message}
              />
              <TextField
                label="Discount Price"
                placeholder="0.00 (optional)"
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
                Product Images
              </h3>
            </div>
            <FileUpload
              placeholder="Choose thumbnail (optional)"
              label="Thumbnail"
              register={register}
              name="thumbnail"
              accept="image/*"
              onChange={setThumbnailFile}
              value={thumbnailFile}
            />

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-black/50 dark:text-white/50 text-sm ml-1">Gallery Images</label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addImage}
                className="flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                Add Image
              </Button>
            </div>
            <div className="space-y-3">
              {imageFiles.map((img, index) => (
                <div key={index} className="border border-black/5 dark:border-gray-800 p-3 rounded-md space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-black/70 dark:text-white/70">
                      Image {index + 1}
                    </span>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        name={`primary_${index}`}
                        value={img.isPrimary}
                        setValue={() => setPrimaryImage(index)}
                      >
                        Primary
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
                      placeholder="Or enter image URL"
                      value={img.url || ""}
                      onChange={(e) => updateImage(index, "url", e.target.value)}
                      className="border border-black/5 dark:border-gray-800 py-2.5 px-4 bg-gray-50 dark:bg-[#1a1f26] w-full outline-none focus:border-green-300/50 dark:focus:border-green-300/50 dark:text-white/90"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Alt text (optional)"
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
                  No images added. Click "Add Image" to add product images.
                </p>
              )}
            </div>
            </div>
          </div>

          {/* Category Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
              <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
                Category & Classification
              </h3>
            </div>
            <Dropdown
              name="Category"
              options={categoryOptions}
              setSelectedOption={setSelectedCategory}
              className="py-2"
            >
              {selectedCategory?.label || (
                <span className="text-black/50 dark:text-white/50">Select Category</span>
              )}
            </Dropdown>
          </div>

          <DialogFooter>
            <Button variant="ghost" type="button" className="bg-red-600 hover:bg-red-700 text-white dark:bg-red-600 dark:hover:bg-red-700" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isUpdating || isUploading}>
              {isUpdating || isUploading ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog >
  );
}