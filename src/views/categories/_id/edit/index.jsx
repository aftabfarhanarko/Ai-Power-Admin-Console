import React, { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ImageIcon,
  X,
  Save,
  Info,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import TextField from "@/components/input/TextField";
import Dropdown from "@/components/dropdown/dropdown";
import {
  useUpdateCategoryMutation,
  useGetCategoriesQuery,
} from "@/features/category/categoryApiSlice";
import useImageUpload from "@/hooks/useImageUpload";
import { useSelector } from "react-redux";
import { Switch } from "@/components/ui/switch";

const categoryEditSchema = yup.object().shape({
  name: yup
    .string()
    .required("Category name is required")
    .min(2, "Category name must be at least 2 characters")
    .max(100, "Category name must be less than 100 characters")
    .trim(),
});

const CategoryEditPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { data: categories = [] } = useGetCategoriesQuery({
    companyId: user?.companyId,
  });
  const category = categories.find((c) => c.id === parseInt(id));
  const [updateCategory, { isLoading: isUpdating }] =
    useUpdateCategoryMutation();
  const [selectedParent, setSelectedParent] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const { uploadImage, isUploading } = useImageUpload();

  const parentOptions = useMemo(
    () =>
      categories
        .filter((c) => c.id !== parseInt(id))
        .map((cat) => ({ label: cat.name, value: cat.id })),
    [categories, id],
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(categoryEditSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      isActive: false,
    },
  });

  // Load category data
  useEffect(() => {
    if (category) {
      setValue("name", category.name);
      setValue("isActive", category.isActive);

      if (category.parent?.id) {
        const found = parentOptions.find((p) => p.value === category.parent.id);
        setSelectedParent(found || null);
      }
    }
  }, [category, parentOptions, setValue]);

  const onSubmit = async (data) => {
    if (!category) return;

    let photoUrl = category?.photo || null;

    if (selectedFile) {
      photoUrl = await uploadImage(selectedFile);
      if (!photoUrl) {
        return;
      }
    }

    const payload = {
      name: data.name,
      isActive: data.isActive,
      photo: photoUrl,
      parentId: selectedParent?.value || null,
    };

    const params = {
      companyId: user?.companyId,
    };
    const res = await updateCategory({
      id: category.id,
      body: payload,
      params,
    });
    if (res?.data) {
      toast.success(t("forms.categoryUpdated"));
      navigate("/categories");
    } else {
      toast.error(res?.error?.data?.message || t("forms.categoryUpdateFailed"));
    }
  };

  const isActive = watch("isActive");

  if (!category) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t("forms.categoryNotFound")}
          </h1>
          <Button onClick={() => navigate("/categories")} className="mt-4">
            {t("forms.goBack")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
      {/* ============= STATIC HEADER ============= */}
      <div className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/categories")}
              className="hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </Button>
            <div>
              <div className="text-xs text-slate-500 font-medium">
                {t("forms.backToCategories")}
              </div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50">
                {t("createEdit.editCategory")}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => navigate("/categories")}
              className="hidden sm:flex"
            >
              {t("forms.cancel")}
            </Button>
            <Button
              onClick={handleSubmit(onSubmit)}
              disabled={isUpdating || isUploading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[120px] shadow-lg shadow-indigo-500/20"
            >
              {isUpdating || isUploading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  {t("forms.saving")}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  {t("forms.saveChanges")}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto p-6 pt-8">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-12 gap-8"
        >
          {/* ============= LEFT COLUMN (8 cols) ============= */}
          <div className="col-span-12 lg:col-span-8 space-y-8">
            {/* 1. CATEGORY IMAGE */}
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 lg:col-span-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-50">
                  {t("forms.categoryImage")}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  {t("forms.categoryImageDesc")}
                </p>
              </div>
              <div className="col-span-12 lg:col-span-8">
                <div className="w-full h-64 bg-white dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-indigo-200 dark:border-slate-700 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-indigo-50/50 transition-colors group relative overflow-hidden shadow-sm">
                  {!selectedFile && !category.photo ? (
                    <>
                      <div className="w-16 h-16 mb-4 bg-indigo-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform duration-300">
                        <ImageIcon className="w-8 h-8" />
                      </div>
                      <h3 className="text-lg font-semibold text-indigo-600 mb-1">
                        {t("forms.uploadImage")}
                      </h3>
                      <p className="text-sm text-slate-400">
                        {t("forms.dragDropOrClick")}
                      </p>
                    </>
                  ) : (
                    <div className="absolute inset-0 w-full h-full group">
                      <img
                        src={
                          selectedFile
                            ? URL.createObjectURL(selectedFile)
                            : category.photo
                        }
                        alt="Category"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <p className="text-white font-medium bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm">
                          {t("forms.clickToChange")}
                        </p>
                      </div>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setSelectedFile(e.target.files[0]);
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  {(selectedFile || category.photo) && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                        // Note: We can't easily clear the existing photo without API support for delete,
                        // but this clears the *newly selected* file.
                        // If user wants to remove existing photo, we might need a specific 'remove' action if API supports it.
                        // For now, this just resets the selection.
                      }}
                      className="absolute top-4 right-4 p-2 bg-white text-slate-400 hover:text-red-500 rounded-full shadow-lg hover:shadow-xl transition-all z-20"
                      title={t("forms.removeSelection")}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* 2. CATEGORY DETAILS */}
            <div className="grid grid-cols-12 gap-6 pt-8 border-t border-slate-200 dark:border-slate-800">
              <div className="col-span-12 lg:col-span-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                  {t("forms.categoryDetails")}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  {t("forms.categoryDetailsDesc")}
                </p>
              </div>
              <div className="col-span-12 lg:col-span-8 space-y-6">
                {/* Name Input */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {t("forms.categoryNameLabel")} <span className="text-red-500">*</span>
                  </label>
                  <TextField
                    placeholder={t("forms.categoryNamePlaceholderEdit")}
                    register={register}
                    name="name"
                    error={errors.name?.message}
                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                {/* Parent Category */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {t("forms.parentCategory")}
                  </label>
                  <Dropdown
                    name={t("forms.parentCategory")}
                    options={parentOptions}
                    setSelectedOption={setSelectedParent}
                    className="w-full"
                  >
                    <div className="flex items-center justify-between w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-indigo-500 transition-colors">
                      <span
                        className={
                          selectedParent
                            ? "text-slate-900 dark:text-white"
                            : "text-slate-400"
                        }
                      >
                        {selectedParent?.label ||
                          t("forms.selectParentCategoryOptional")}
                      </span>
                    </div>
                  </Dropdown>
                  <p className="text-xs text-slate-500">
                    {t("forms.parentCategoryHint")}
                  </p>
                </div>
              </div>
            </div>

            {/* 3. STATUS & VISIBILITY */}
            <div className="grid grid-cols-12 gap-6 pt-8 border-t border-slate-200 dark:border-slate-800">
              <div className="col-span-12 lg:col-span-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-50">
                  {t("forms.statusVisibility")}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  {t("forms.statusVisibilityDesc")}
                </p>
              </div>
              <div className="col-span-12 lg:col-span-8">
                <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between group hover:border-indigo-500/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3 rounded-xl ${isActive ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"}`}
                    >
                      {isActive ? (
                        <CheckCircle2 className="w-6 h-6" />
                      ) : (
                        <AlertCircle className="w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white">
                        {isActive ? t("forms.active") : t("forms.inactive")}
                      </h4>
                      <p className="text-sm text-slate-500">
                        {isActive
                          ? t("forms.categoryVisibleToCustomers")
                          : t("forms.categoryHiddenFromStore")}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={isActive}
                    onCheckedChange={(checked) => setValue("isActive", checked)}
                    className="data-[state=checked]:bg-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ============= RIGHT COLUMN / SIDEBAR (Optional - kept empty or for future use) ============= */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            {/* You could put summary or other widgets here if needed, but the design requested was mainly the form style */}
            {/* For now we leave it empty or add a help card */}
            <div className="bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl p-6 border border-indigo-100 dark:border-indigo-500/20">
              <h4 className="font-bold text-indigo-900 dark:text-indigo-100 mb-2 flex items-center gap-2">
                <Info className="w-5 h-5" />
                {t("forms.tips")}
              </h4>
              <ul className="text-sm text-indigo-800 dark:text-indigo-200 space-y-2 list-disc list-inside">
                <li>{t("forms.tip1Edit")}</li>
                <li>{t("forms.tip2Edit")}</li>
                <li>{t("forms.tip3Edit")}</li>
              </ul>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryEditPage;
