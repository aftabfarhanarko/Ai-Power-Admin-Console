import React from "react";
import { X, Plus, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProductVariantImagesSection({
  variants,
  updateVariant,
}) {
  // Removed early return to ensure section is always visible

  const handleFileChange = (variantId, e, currentImages = []) => {
    if (e.target.files?.length) {
      const newFiles = Array.from(e.target.files).map((file) => ({
        file,
        url: "",
        alt: "",
        isPrimary: false,
      }));
      updateVariant(variantId, "images", [...currentImages, ...newFiles]);
    }
  };

  const handleUrlAdd = (variantId, url, currentImages = []) => {
    if (url?.trim()) {
      updateVariant(variantId, "images", [
        ...currentImages,
        {
          url: url.trim(),
          alt: "",
          isPrimary: false,
          file: null,
        },
      ]);
    }
  };

  const handleRemoveImage = (variantId, imageIndex, currentImages = []) => {
    const newImages = currentImages.filter((_, i) => i !== imageIndex);
    updateVariant(variantId, "images", newImages);
  };

  return (
    <div className="grid grid-cols-12 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
      <div className="col-span-12 lg:col-span-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-50">
          Product Image Variant
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
          Add specific images for each color variant.
        </p>
      </div>
      <div className="col-span-12 lg:col-span-8">
        <div className="space-y-4">
          {(!variants || variants.length === 0) && (
            <div className="p-8 text-center bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No variants added. Please add color variants above to upload
                specific images.
              </p>
            </div>
          )}
          {variants?.map((variant) => (
            <div
              key={variant.id}
              className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-6 h-6 rounded-full border border-slate-200 dark:border-slate-600 shadow-sm"
                  style={{ backgroundColor: variant.color || "#6366f1" }}
                />
                <span className="font-medium text-slate-900 dark:text-slate-50">
                  {variant.name || "Unnamed Variant"}
                </span>
              </div>

              <div className="flex flex-wrap gap-4">
                {/* Upload Button */}
                <div className="w-24 h-24 border-2 border-dashed border-indigo-200 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer hover:bg-indigo-50/50 dark:hover:bg-slate-800 transition-colors relative shrink-0 group">
                  <div className="w-6 h-6 mb-1 text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Plus className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-semibold text-indigo-600">
                    Upload
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) =>
                      handleFileChange(variant.id, e, variant.images || [])
                    }
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>

                {/* Images List */}
                {(variant.images || []).map((img, i) => (
                  <div
                    key={i}
                    className="w-24 h-24 bg-slate-100 rounded-xl relative group overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0"
                  >
                    <img
                      src={img.file ? URL.createObjectURL(img.file) : img.url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveImage(variant.id, i, variant.images)
                        }
                        className="p-1.5 bg-white text-red-600 rounded-lg shadow-sm hover:bg-red-50 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
