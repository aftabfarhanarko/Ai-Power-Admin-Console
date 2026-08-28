import React from "react";
import { useTranslation } from "react-i18next";
import { X, Plus, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProductImagesSection({
  imageFiles,
  setImageFiles,
  imageUrlInput,
  setImageUrlInput,
  removeImage,
}) {
  const { t } = useTranslation();
  
  return (
    <div className="grid grid-cols-12 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
      <div className="col-span-12 lg:col-span-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
          {t("productForm.productImages")} <Info className="w-4 h-4 text-slate-400" />
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
          Make your fashion products look more attractive with 3:4 size photos.
        </p>
      </div>
      <div className="col-span-12 lg:col-span-8">
        <div className="p-6 md:p-8 bg-white dark:bg-slate-900 rounded-[24px] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none transition-all duration-300">
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="w-36 h-36 border-2 border-dashed border-indigo-200 dark:border-indigo-500/20 rounded-[20px] flex flex-col items-center justify-center text-center cursor-pointer hover:bg-indigo-50/50 dark:hover:bg-indigo-500/5 hover:border-indigo-400 dark:hover:border-indigo-500/50 transition-all duration-300 relative shrink-0 group">
              <div className="w-10 h-10 mb-2.5 text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-90 transition-transform duration-300">
                <Plus className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {t("productForm.uploadFile")}
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  if (e.target.files?.length) {
                    const newFiles = Array.from(e.target.files).map((file) => ({
                      file,
                      url: "",
                      alt: "",
                      isPrimary: false,
                    }));
                    setImageFiles((prev) => [...prev, ...newFiles]);
                  }
                }}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
            <div className="flex-1 min-w-[200px] flex gap-3 items-center">
              <input
                type="url"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                placeholder={t("productForm.orPasteImageUrlPlaceholder")}
                className="flex-1 h-12 px-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && imageUrlInput?.trim()) {
                    e.preventDefault();
                    setImageFiles((prev) => [
                      ...prev,
                      {
                        url: imageUrlInput.trim(),
                        alt: "",
                        isPrimary: false,
                        file: null,
                      },
                    ]);
                    setImageUrlInput("");
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  if (imageUrlInput?.trim()) {
                    setImageFiles((prev) => [
                      ...prev,
                      {
                        url: imageUrlInput.trim(),
                        alt: "",
                        isPrimary: false,
                        file: null,
                      },
                    ]);
                    setImageUrlInput("");
                  }
                }}
                disabled={!imageUrlInput?.trim()}
                className="shrink-0 h-12 px-6 rounded-xl border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 font-semibold transition-all"
              >
                {t("productForm.add")}
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            {imageFiles.map(
              (img, i) =>
                (img.file || img.url) && (
                  <div
                    key={i}
                    className="w-36 h-36 bg-slate-100 dark:bg-slate-800 rounded-[20px] relative group overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0 shadow-sm hover:shadow-md transition-all"
                  >
                    <img
                      src={
                        img.file ? URL.createObjectURL(img.file) : img.url
                      }
                      alt=""
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="p-2.5 bg-white text-red-500 rounded-full shadow-lg hover:bg-red-50 hover:scale-110 transition-all"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
