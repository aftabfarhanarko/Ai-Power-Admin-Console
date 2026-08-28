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
  Save,
  Percent,
  Hash,
  DollarSign,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Info,
  Clock,
  Tag,
} from "lucide-react";
import TextField from "@/components/input/TextField";
import Dropdown from "@/components/dropdown/dropdown";
import {
  useUpdatePromocodeMutation,
  useGetPromocodesQuery,
} from "@/features/promocode/promocodeApiSlice";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { useGetProductsQuery } from "@/features/product/productApiSlice";

export default function PromocodeEditPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { data: promocodes = [], isLoading } = useGetPromocodesQuery();
  const promocode = promocodes.find((p) => p.id === parseInt(id));

  const { data: allProducts = [] } = useGetProductsQuery(
    { companyId: user?.companyId },
    { skip: !user?.companyId },
  );

  const availableProducts = useMemo(
    () =>
      allProducts.filter(
        (p) => p.isActive && p.status === "published",
      ),
    [allProducts],
  );

  const discountTypeOptions = useMemo(
    () => [
      { label: t("promocodes.percentage"), value: "percentage", icon: Percent },
      { label: t("promocodes.fixed"), value: "fixed", icon: DollarSign },
    ],
    [t],
  );

  const promocodeEditSchema = useMemo(
    () =>
      yup.object().shape({
        code: yup
          .string()
          .required(t("promocodes.validation.codeRequired"))
          .min(2, t("promocodes.validation.codeMin"))
          .max(50, t("promocodes.validation.codeMax")),
        description: yup
          .string()
          .nullable()
          .transform((value) => (value === "" ? null : value))
          .max(500, t("promocodes.validation.descriptionMax")),
        discountType: yup
          .string()
          .required(t("promocodes.validation.discountTypeRequired"))
          .oneOf(
            ["percentage", "fixed"],
            t("promocodes.validation.discountTypeInvalid"),
          ),
        discountValue: yup
          .number()
          .typeError(t("promocodes.validation.discountValueNumber"))
          .required(t("promocodes.validation.discountValueRequired"))
          .positive(t("promocodes.validation.discountValuePositive"))
          .test(
            "max-percentage",
            t("promocodes.validation.percentageMax"),
            function (value) {
              const discountType = this.parent.discountType;
              if (discountType === "percentage" && value > 100) {
                return false;
              }
              return true;
            },
          ),
        maxUses: yup
          .number()
          .typeError(t("promocodes.validation.maxUsesNumber"))
          .nullable()
          .transform((value, originalValue) =>
            originalValue === "" ? null : value,
          )
          .min(1, t("promocodes.validation.maxUsesMin"))
          .integer(t("promocodes.validation.maxUsesInteger")),
        minOrderAmount: yup
          .number()
          .typeError(t("promocodes.validation.minOrderNumber"))
          .nullable()
          .transform((value, originalValue) =>
            originalValue === "" ? null : value,
          )
          .min(0, t("promocodes.validation.minOrderMin")),
        startsAt: yup
          .string()
          .nullable()
          .transform((value) => (value === "" ? null : value)),
        expiresAt: yup
          .string()
          .nullable()
          .transform((value) => (value === "" ? null : value))
          .test(
            "after-starts",
            t("promocodes.validation.expiresAfterStarts"),
            function (value) {
              const startsAt = this.parent.startsAt;
              if (!value || !startsAt) return true;
              return new Date(value) > new Date(startsAt);
            },
          ),
        isActive: yup
          .boolean()
          .required(t("promocodes.validation.statusRequired")),
      }),
    [t],
  );

  const defaultType = useMemo(() => {
    if (!promocode) return null;
    const val = String(promocode?.discountType).toLowerCase();
    return discountTypeOptions.find((o) => o.value === val) || null;
  }, [promocode, discountTypeOptions]);

  const [discountType, setDiscountType] = useState(defaultType);
  const [selectedProducts, setSelectedProducts] = useState(
    Array.isArray(promocode?.productIds) ? promocode.productIds : [],
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    trigger,
    reset,
    watch,
  } = useForm({
    resolver: yupResolver(promocodeEditSchema),
    defaultValues: {
      code: promocode?.code ?? "",
      description: promocode?.description ?? "",
      discountType: promocode?.discountType ?? "",
      discountValue:
        typeof promocode?.discountValue === "number"
          ? promocode?.discountValue
          : Number(promocode?.discountValue) || "",
      maxUses: promocode?.maxUses != null ? Number(promocode?.maxUses) : "",
      minOrderAmount:
        promocode?.minOrderAmount != null
          ? Number(promocode?.minOrderAmount)
          : "",
      startsAt: promocode?.startsAt
        ? new Date(promocode.startsAt).toISOString().slice(0, 16)
        : "",
      expiresAt: promocode?.expiresAt
        ? new Date(promocode.expiresAt).toISOString().slice(0, 16)
        : "",
      isActive: !!promocode?.isActive,
      productIds: Array.isArray(promocode?.productIds)
        ? promocode.productIds
        : [],
    },
  });

  const isActive = watch("isActive");

  useEffect(() => {
    if (promocode) {
      reset({
        code: promocode.code ?? "",
        description: promocode.description ?? "",
        discountType: promocode.discountType ?? "",
        discountValue:
          typeof promocode.discountValue === "number"
            ? promocode.discountValue
            : Number(promocode.discountValue) || "",
        maxUses: promocode.maxUses != null ? Number(promocode.maxUses) : "",
        minOrderAmount:
          promocode.minOrderAmount != null
            ? Number(promocode.minOrderAmount)
            : "",
        startsAt: promocode.startsAt
          ? new Date(promocode.startsAt).toISOString().slice(0, 16)
          : "",
        expiresAt: promocode.expiresAt
          ? new Date(promocode.expiresAt).toISOString().slice(0, 16)
          : "",
        isActive: !!promocode.isActive,
        productIds: Array.isArray(promocode.productIds)
          ? promocode.productIds
          : [],
      });
      const val = String(promocode.discountType).toLowerCase();
      const found = discountTypeOptions.find((o) => o.value === val);
      setDiscountType(found || null);
      setSelectedProducts(
        Array.isArray(promocode.productIds) ? promocode.productIds : [],
      );
    }
  }, [promocode, reset, discountTypeOptions]);

  const [updatePromocode, { isLoading: isUpdating }] =
    useUpdatePromocodeMutation();

  const handleProductToggle = (productId) => {
    setSelectedProducts((prev) => {
      const newSelection = prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId];
      setValue("productIds", newSelection);
      return newSelection;
    });
  };

  const handleSelectAllProducts = () => {
    if (selectedProducts.length === availableProducts.length) {
      setSelectedProducts([]);
      setValue("productIds", []);
    } else {
      const allIds = availableProducts.map((p) => p.id);
      setSelectedProducts(allIds);
      setValue("productIds", allIds);
    }
  };

  const handleDiscountTypeChange = (option) => {
    setDiscountType(option);
    setValue("discountType", option?.value || "", { shouldValidate: true });
    trigger("discountValue");
  };

  const onSubmit = async (data) => {
    if (!promocode) return;

    if (!discountType?.value) {
      setValue("discountType", "", { shouldValidate: true });
      return;
    }

    const payload = {
      id: promocode.id,
      code: data.code,
      description: data.description ?? undefined,
      discountType: discountType?.value,
      discountValue: parseFloat(data.discountValue),
      maxUses: data.maxUses !== "" ? parseInt(data.maxUses, 10) : undefined,
      minOrderAmount:
        data.minOrderAmount !== ""
          ? parseFloat(data.minOrderAmount)
          : undefined,
      startsAt: data.startsAt
        ? new Date(data.startsAt).toISOString()
        : undefined,
      expiresAt: data.expiresAt
        ? new Date(data.expiresAt).toISOString()
        : undefined,
      isActive: !!data.isActive,
      productIds: selectedProducts,
    };

    const res = await updatePromocode(payload);
    if (res?.data) {
      toast.success(t("promocodes.promocodeUpdated"));
      navigate("/promocodes");
    } else {
      toast.error(
        res?.error?.data?.message || t("promocodes.promocodeUpdateFailed"),
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!promocode) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[24px] bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 p-8 text-center shadow-xl"
      >
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center mb-6">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold mb-2">
          {t("promocodes.promocodeNotFound")}
        </h1>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          {t("promocodes.promocodeNotFoundDesc")}
        </p>
        <Button
          onClick={() => navigate("/promocodes")}
          className="bg-black text-white hover:bg-black/80 rounded-xl px-8 py-6 h-auto text-lg"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          {t("common.backToList")}
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <span
              onClick={() => navigate("/promocodes")}
              className="cursor-pointer hover:text-indigo-500 transition-colors"
            >
              {t("promocodes.title")}
            </span>
            <span>/</span>
            <span className="text-indigo-500 font-medium">
              {t("common.edit")}
            </span>
          </div>
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 dark:from-indigo-400 dark:via-violet-400 dark:to-purple-400 drop-shadow-sm">
            {t("promocodes.editPromocode")}
          </h1>
          <p className="text-gray-500 mt-2 text-lg">
            {t("createEdit.updatePromocode")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => navigate("/promocodes")}
            className="rounded-xl h-12 px-6 border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 transition-all duration-300"
          >
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={isUpdating}
            className="rounded-xl h-12 px-8 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30 transition-all duration-300 transform hover:-translate-y-0.5"
          >
            {isUpdating ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{t("common.updating")}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Save className="w-5 h-5" />
                <span>{t("common.update")}</span>
              </div>
            )}
          </Button>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10"
      >
        {/* Left Column: Main Info */}
        <div className="lg:col-span-2 space-y-8">
          {/* General Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-[#1a1f26] rounded-[24px] p-6 border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-100/50 dark:shadow-black/20"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {t("promocodes.codeDetails")}
                </h3>
                <p className="text-sm text-gray-500">
                  {t("promocodes.codeDetailsDesc")}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 dark:bg-black/20 p-6 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Hash className="h-5 w-5 text-gray-400" />
                  </div>
                  <TextField
                    label={t("promocodes.code")}
                    placeholder={t("promocodes.promocodePlaceholder")}
                    register={register}
                    name="code"
                    error={errors.code}
                    className="pl-10 font-mono uppercase tracking-wider text-lg"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2 ml-1 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Code must be unique and will be converted to uppercase
                  automatically
                </p>
              </div>

              <TextField
                label={t("promocodes.descriptionLabel")}
                placeholder={t("promocodes.descriptionPlaceholder")}
                register={register}
                name="description"
                error={errors.description}
                type="textarea"
              />
            </div>
          </motion.div>

          {/* Discount Configuration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-[#1a1f26] rounded-[24px] p-6 border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-100/50 dark:shadow-black/20"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-2xl bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400">
                <Tag className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {t("promocodes.discountConfiguration")}
                </h3>
                <p className="text-sm text-gray-500">
                  {t("promocodes.discountConfigurationDesc")}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">
                  {t("promocodes.discountType")}
                </label>
                <Dropdown
                  name={t("promocodes.discountType")}
                  options={discountTypeOptions}
                  setSelectedOption={handleDiscountTypeChange}
                  className="w-full"
                >
                  <div className="flex items-center gap-2 w-full">
                    {discountType?.icon && (
                      <discountType.icon className="w-4 h-4 text-gray-500" />
                    )}
                    <span>
                      {discountType?.label || t("promocodes.selectType")}
                    </span>
                  </div>
                </Dropdown>
                {errors.discountType && (
                  <span className="text-red-500 text-xs ml-1 block">
                    {errors.discountType.message}
                  </span>
                )}
              </div>

              <div className="relative">
                <div className="absolute top-8 left-0 pl-4 flex items-center pointer-events-none h-[46px]">
                  {discountType?.value === "percentage" ? (
                    <Percent className="h-5 w-5 text-gray-400" />
                  ) : (
                    <DollarSign className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <TextField
                  label={t("promocodes.discountValue")}
                  placeholder="0.00"
                  register={register}
                  name="discountValue"
                  type="number"
                  error={errors.discountValue}
                  className="pl-10"
                />
              </div>

              <div className="md:col-span-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <h4 className="font-semibold text-sm">
                    {t("promocodes.usageLimits")}
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <TextField
                    label={t("promocodes.minOrderAmount")}
                    placeholder={t("promocodes.minOrderAmountPlaceholder")}
                    register={register}
                    name="minOrderAmount"
                    type="number"
                    error={errors.minOrderAmount}
                    className="bg-gray-50 dark:bg-black/20"
                  />
                  <TextField
                    label={t("promocodes.maxUses")}
                    placeholder={t("promocodes.maxUsesPlaceholder")}
                    register={register}
                    name="maxUses"
                    type="number"
                    error={errors.maxUses}
                    className="bg-gray-50 dark:bg-black/20"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Settings */}
        <div className="lg:col-span-1 space-y-8">
          {/* Status Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-[#1a1f26] rounded-[24px] p-6 border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-100/50 dark:shadow-black/20 sticky top-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className={`p-3 rounded-2xl ${isActive ? "bg-green-50 dark:bg-green-900/20 text-green-600" : "bg-gray-100 dark:bg-gray-800 text-gray-500"}`}
              >
                {isActive ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <XCircle className="w-6 h-6" />
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {t("common.status")}
                </h3>
                <p className="text-sm text-gray-500">
                  {isActive
                    ? t("promocodes.statusActiveText")
                    : t("promocodes.statusInactiveText")}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-black/20 rounded-2xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  {t("promocodes.activeStatusToggleLabel")}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    {...register("isActive")}
                  />
                  <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {t("promocodes.inactiveHint")}
              </p>
            </div>

            <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4 text-gray-400" />
                <h4 className="font-semibold text-sm">
                  {t("promocodes.schedule")}
                </h4>
              </div>
              <div className="space-y-4">
                <TextField
                  label={t("promocodes.startsAt")}
                  register={register}
                  name="startsAt"
                  type="datetime-local"
                  error={errors.startsAt}
                />
                <TextField
                  label={t("promocodes.expiresAt")}
                  register={register}
                  name="expiresAt"
                  type="datetime-local"
                  error={errors.expiresAt}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </form>
    </div>
  );
}
