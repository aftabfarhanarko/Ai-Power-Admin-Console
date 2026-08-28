import React, { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ImageIcon,
  X,
  Save,
  Info,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronDown,
  CloudUpload,
  Link as LinkIcon,
  Layers,
} from "lucide-react";
import TextField from "@/components/input/TextField";
import Dropdown from "@/components/dropdown/dropdown";
import {
  useCreateCategoryMutation,
  useGetCategoriesQuery,
} from "@/features/category/categoryApiSlice";
import useImageUpload from "@/hooks/useImageUpload";
import { useSelector } from "react-redux";
import { Switch } from "@/components/ui/switch";

// ============= ANIMATION VARIANTS =============
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100, damping: 15 },
  },
};

const headerVariants = {
  hidden: { y: -20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100, damping: 20 },
  },
};

// ============= PREMIUM COMPONENTS =============
const PremiumCard = ({ children, className = "", hover = true }) => (
  <motion.div
    variants={itemVariants}
    className={`
      bg-white dark:bg-slate-900 
      rounded-[24px] border border-slate-200 dark:border-slate-800
      shadow-sm dark:shadow-none
      overflow-hidden p-6
      transition-all duration-300 ease-out
      ${
        hover
          ? "hover:shadow-xl hover:border-indigo-200 dark:hover:border-indigo-900/50"
          : ""
      }
      ${className}
    `}
  >
    {children}
  </motion.div>
);

const SectionHeader = ({ title, description, className = "" }) => (
  <motion.div variants={itemVariants} className={`mb-6 ${className}`}>
    <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-1 flex items-center gap-2">
      {title}
    </h2>
    {description && (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {description}
      </p>
    )}
  </motion.div>
);

const categorySchema = yup.object().shape({
  name: yup
    .string()
    .required("Category name is required")
    .min(2, "Category name must be at least 2 characters")
    .max(100, "Category name must be less than 100 characters")
    .trim(),
});

function CreateCategoryPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { data: categories = [] } = useGetCategoriesQuery({
    companyId: user?.companyId,
  });

  const [createCategory, { isLoading: isCreating }] =
    useCreateCategoryMutation();
  const { uploadImage, isUploading } = useImageUpload();

  const [selectedParent, setSelectedParent] = useState(null);

  // Image Upload State
  const [uploadType, setUploadType] = useState("file"); // 'file' or 'url'
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");

  const parentOptions = useMemo(
    () => categories.map((cat) => ({ label: cat.name, value: cat.id })),
    [categories],
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(categorySchema),
    defaultValues: {
      name: "",
      isActive: true,
    },
  });

  const isActive = watch("isActive");

  // Memoized preview image
  const previewImage = useMemo(() => {
    if (uploadType === "file" && selectedFile) {
      return URL.createObjectURL(selectedFile);
    }
    if (uploadType === "url" && imageUrl) {
      return imageUrl;
    }
    return null;
  }, [uploadType, selectedFile, imageUrl]);

  const onSubmit = async (data) => {
    let finalPhotoUrl = null;

    if (uploadType === "file" && selectedFile) {
      finalPhotoUrl = await uploadImage(selectedFile);
      if (!finalPhotoUrl) {
        toast.error(t("forms.failedToUploadImage"));
        return;
      }
    } else if (uploadType === "url" && imageUrl) {
      finalPhotoUrl = imageUrl;
    }

    const payload = {
      name: data.name,
      isActive: data.isActive,
      photo: finalPhotoUrl,
      parentId: selectedParent?.value || null,
    };

    const params = {
      companyId: user ? user.companyId : null,
    };

    try {
      const res = await createCategory({ body: payload, params });
      if (res?.data) {
        toast.success(t("forms.categoryCreated"));
        navigate("/categories");
      } else {
        const errorMessage =
          res?.error?.data?.message ||
          res?.error?.data?.error ||
          t("forms.categoryCreateFailed");
        toast.error(errorMessage);
      }
    } catch (error) {
      toast.error(error?.message || t("forms.categoryCreateFailed"));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-20 relative overflow-hidden">
      {/* Background Decoration */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-50/80 via-white/50 to-transparent dark:from-indigo-950/20 dark:via-slate-950/50 dark:to-transparent -z-10"
      />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      {/* ============= STICKY HEADER ============= */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={headerVariants}
        className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60 supports-[backdrop-filter]:bg-white/60"
      >
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                onClick={() => navigate("/categories")}
                className="hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-xl transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </Button>
            </motion.div>
            <div>
              <div className="text-xs font-medium text-indigo-600 dark:text-indigo-400 mb-0.5 flex items-center gap-1.5">
                {t("forms.categoriesManagement")}
                <span className="w-1 h-1 rounded-full bg-indigo-300 dark:bg-indigo-700" />
                {t("forms.newEntry")}
              </div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 tracking-tight">
                {t("forms.createNewCategory")}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => navigate("/categories")}
              className="hidden sm:flex text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              {t("forms.cancel")}
            </Button>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={handleSubmit(onSubmit)}
                disabled={isCreating || isUploading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[140px] shadow-lg shadow-indigo-500/20 rounded-xl h-10 transition-all"
              >
                {isCreating || isUploading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    {t("forms.processing")}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    {t("forms.saveCategory")}
                  </span>
                )}
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-[1600px] mx-auto p-6 pt-8">
        <motion.form
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-12 gap-8"
        >
          {/* ============= LEFT COLUMN (8 cols) ============= */}
          <div className="col-span-12 lg:col-span-8 space-y-8">
            {/* 1. CATEGORY IMAGE */}
            <div>
              <SectionHeader
                title={t("forms.visualIdentity")}
                description={t("forms.visualIdentityDesc")}
              />
              <PremiumCard className="p-0 overflow-visible">
                <div className="p-1.5 bg-slate-100/50 dark:bg-slate-800/50 rounded-t-[24px] border-b border-slate-200 dark:border-slate-700 flex gap-1 mx-6 mt-6 mb-0 w-fit">
                  <button
                    type="button"
                    onClick={() => setUploadType("file")}
                    className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all flex items-center gap-2 ${
                      uploadType === "file"
                        ? "bg-white dark:bg-slate-800 text-indigo-600 shadow-sm ring-1 ring-black/5"
                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 dark:hover:bg-slate-700"
                    }`}
                  >
                    <CloudUpload className="w-4 h-4" />
                    {t("forms.uploadFile")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadType("url")}
                    className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all flex items-center gap-2 ${
                      uploadType === "url"
                        ? "bg-white dark:bg-slate-800 text-indigo-600 shadow-sm ring-1 ring-black/5"
                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 dark:hover:bg-slate-700"
                    }`}
                  >
                    <LinkIcon className="w-4 h-4" />
                    {t("forms.imageUrl")}
                  </button>
                </div>

                <div className="p-6 pt-4">
                  <div className="w-full h-72 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-indigo-200/70 dark:border-slate-700 flex flex-col items-center justify-center text-center relative overflow-hidden group hover:bg-indigo-50/30 transition-all duration-300">
                    {!previewImage ? (
                      uploadType === "file" ? (
                        <>
                          <div className="w-20 h-20 mb-5 bg-white dark:bg-slate-800 rounded-3xl flex items-center justify-center text-indigo-500 shadow-xl shadow-indigo-100 dark:shadow-none group-hover:scale-110 transition-transform duration-300">
                            <ImageIcon className="w-10 h-10" />
                          </div>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                            {t("forms.dropImageHere")}
                          </h3>
                          <p className="text-sm text-slate-500 max-w-xs mx-auto leading-relaxed">
                            {t("forms.imageSupport")}
                          </p>
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
                        </>
                      ) : (
                        <div className="w-full max-w-md px-6 z-10">
                          <div className="w-16 h-16 mb-6 mx-auto bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-indigo-500 shadow-lg">
                            <LinkIcon className="w-8 h-8" />
                          </div>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                            {t("forms.importFromUrl")}
                          </h3>
                          <div className="relative group/input">
                            <input
                              type="text"
                              placeholder={t("forms.imageUrlPlaceholder")}
                              value={imageUrl}
                              onChange={(e) => setImageUrl(e.target.value)}
                              className="w-full pl-4 pr-4 py-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-center font-medium shadow-sm"
                            />
                          </div>
                        </div>
                      )
                    ) : (
                      <div className="absolute inset-0 w-full h-full">
                        <img
                          src={previewImage}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedFile(null);
                              setImageUrl("");
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-white text-red-600 rounded-xl shadow-lg hover:scale-105 transition-transform font-medium"
                          >
                            <X className="w-4 h-4" />
                            {t("forms.removeImage")}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </PremiumCard>
            </div>

            {/* 2. BASIC INFO */}
            <div>
              <SectionHeader
                title={t("forms.basicInformation")}
                description={t("forms.basicInformationDesc")}
              />
              <PremiumCard>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                      {t("forms.categoryNameLabel")} <span className="text-red-500">*</span>
                    </label>
                    <TextField
                      placeholder={t("forms.categoryNamePlaceholder")}
                      register={register}
                      name="name"
                      error={errors.name?.message}
                      inputClassName="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:ring-indigo-500/20 focus:border-indigo-500 h-12 rounded-xl"
                    />
                  </div>
                </div>
              </PremiumCard>
            </div>
          </div>

          {/* ============= RIGHT COLUMN (4 cols) ============= */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            {/* STATUS CARD */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-4 opacity-0">
                Status
              </h3>{" "}
              {/* Spacer for alignment */}
              <PremiumCard className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800/50">
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                  {t("forms.visibilityStatus")}
                </h3>
                <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2.5 rounded-xl transition-colors ${isActive ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"}`}
                    >
                      {isActive ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <AlertCircle className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <span className="block font-semibold text-slate-900 dark:text-slate-200 text-sm">
                        {isActive ? t("forms.published") : t("forms.hidden")}
                      </span>
                      <span className="text-xs text-slate-500">
                        {isActive ? t("forms.visibleInStore") : t("forms.notVisible")}
                      </span>
                    </div>
                  </div>
                  <Switch
                    checked={isActive}
                    onCheckedChange={(checked) => setValue("isActive", checked)}
                    className="data-[state=checked]:bg-emerald-500 scale-90"
                  />
                </div>
              </PremiumCard>
            </div>

            {/* ORGANIZATION CARD */}
            <PremiumCard>
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                {t("forms.organization")}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-2 block ml-1">
                    {t("forms.parentCategory")}
                  </label>
                  <Dropdown
                    name={t("forms.parentCategory")}
                    options={parentOptions}
                    setSelectedOption={setSelectedParent}
                    className="w-full"
                  >
                    <div className="flex items-center justify-between w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-indigo-500 hover:bg-white dark:hover:bg-slate-800 transition-all group">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <Layers className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                        <span
                          className={`text-sm truncate ${
                            selectedParent
                              ? "text-slate-900 dark:text-white font-medium"
                              : "text-slate-400"
                          }`}
                        >
                          {selectedParent?.label || t("forms.noParent")}
                        </span>
                      </div>
                      <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                    </div>
                  </Dropdown>
                </div>
              </div>
            </PremiumCard>

            {/* TIPS CARD */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="bg-gradient-to-br from-indigo-500 to-violet-600 rounded-[24px] p-6 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden group cursor-default"
            >
              <motion.div
                animate={{ rotate: [0, 10, 0] }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"
              >
                <Info className="w-24 h-24" />
              </motion.div>
              <h4 className="font-bold text-white mb-3 flex items-center gap-2 relative z-10">
                <Info className="w-5 h-5 text-indigo-200" />
                {t("forms.quickTips")}
              </h4>
              <ul className="text-sm text-indigo-100 space-y-3 list-disc list-inside relative z-10">
                <li className="leading-relaxed">
                  {t("forms.tip1")}
                </li>
                <li className="leading-relaxed">
                  {t("forms.tip2")}
                </li>
              </ul>
            </motion.div>
          </div>
        </motion.form>
      </div>
    </div>
  );
}

export default CreateCategoryPage;
