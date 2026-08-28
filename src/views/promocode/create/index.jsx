import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Save, 
  Ticket, 
  Percent, 
  CalendarClock, 
  Layout, 
  CheckCircle2,
  XCircle,
  Loader2,
  DollarSign,
  Package,
} from "lucide-react";
import TextField from "@/components/input/TextField";
import Checkbox from "@/components/input/Checkbox";
import Dropdown from "@/components/dropdown/dropdown";
import { useCreatePromocodeMutation } from "@/features/promocode/promocodeApiSlice";
import { motion } from "framer-motion";
import { useGetProductsQuery } from "@/features/product/productApiSlice";

function CreatePromocodePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const authUser = useSelector((state) => state.auth.user);

  const { data: allProducts = [] } = useGetProductsQuery(
    { companyId: authUser?.companyId },
    { skip: !authUser?.companyId }
  );

  const availableProducts = useMemo(
    () =>
      allProducts.filter(
        (p) => p.isActive && p.status === "published"
      ),
    [allProducts]
  );

  const discountTypeOptions = useMemo(
    () => [
      { label: t("promocodes.percentage"), value: "percentage" },
      { label: t("promocodes.fixed"), value: "fixed" },
    ],
    [t]
  );

  const promocodeSchema = useMemo(
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
          .oneOf(["percentage", "fixed"], t("promocodes.validation.discountTypeInvalid")),
        discountValue: yup
          .number()
          .typeError(t("promocodes.validation.discountValueNumber"))
          .required(t("promocodes.validation.discountValueRequired"))
          .positive(t("promocodes.validation.discountValuePositive"))
          .test("max-percentage", t("promocodes.validation.percentageMax"), function (value) {
            const discountType = this.parent.discountType;
            if (discountType === "percentage" && value > 100) {
              return false;
            }
            return true;
          }),
        maxUses: yup
          .number()
          .typeError(t("promocodes.validation.maxUsesNumber"))
          .nullable()
          .transform((value, originalValue) => (originalValue === "" ? null : value))
          .min(1, t("promocodes.validation.maxUsesMin"))
          .integer(t("promocodes.validation.maxUsesInteger")),
        minOrderAmount: yup
          .number()
          .typeError(t("promocodes.validation.minOrderNumber"))
          .nullable()
          .transform((value, originalValue) => (originalValue === "" ? null : value))
          .min(0, t("promocodes.validation.minOrderMin")),
        startsAt: yup.string().nullable().transform((value) => (value === "" ? null : value)),
        expiresAt: yup
          .string()
          .nullable()
          .transform((value) => (value === "" ? null : value))
          .test("after-starts", t("promocodes.validation.expiresAfterStarts"), function (value) {
            const startsAt = this.parent.startsAt;
            if (!value || !startsAt) return true;
            return new Date(value) > new Date(startsAt);
          }),
        // Optional: restrict promocode to specific products
        productIds: yup
          .array()
          .of(yup.number())
          .nullable(),
      }),
    [t]
  );
  const [discountType, setDiscountType] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const { register, handleSubmit, reset, setValue, watch, formState: { errors }, trigger } = useForm({
      resolver: yupResolver(promocodeSchema),
      defaultValues: {
        isActive: true,
        productIds: [],
      }
    });
  const [createPromocode, { isLoading: isCreating }] = useCreatePromocodeMutation();

  const isActive = watch("isActive");

  const handleDiscountTypeChange = (option) => {
    setDiscountType(option);
    setValue("discountType", option?.value || "", { shouldValidate: true });
    trigger("discountValue");
  };

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

  const onSubmit = async (data) => {
    if (!discountType?.value) {
      setValue("discountType", "", { shouldValidate: true });
      return;
    }

    const payload = {
      code: data.code,
      description: data.description || undefined,
      discountType: discountType?.value,
      discountValue: parseFloat(data.discountValue),
      maxUses: data.maxUses ? parseInt(data.maxUses, 10) : undefined,
      minOrderAmount: data.minOrderAmount ? parseFloat(data.minOrderAmount) : undefined,
      startsAt: data.startsAt ? new Date(data.startsAt).toISOString() : undefined,
      expiresAt: data.expiresAt ? new Date(data.expiresAt).toISOString() : undefined,
      isActive: !!data.isActive,
    };

    // Attach selected product IDs if any
    if (selectedProducts.length > 0) {
      payload.productIds = selectedProducts;
    }

    const res = await createPromocode(payload);
    if (res?.data) {
      toast.success(t("promocodes.promocodeCreated"));
      reset();
      setDiscountType(null);
      setSelectedProducts([]);
      navigate("/promocodes");
    } else {
      toast.error(res?.error?.data?.message || t("promocodes.promocodeCreateFailed"));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#111318] p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/promocodes")}
              className="bg-white dark:bg-[#1a1f26] hover:bg-gray-100 dark:hover:bg-gray-800 text-black dark:text-white rounded-xl h-10 w-10 border border-gray-200 dark:border-gray-800 shadow-sm"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                {t("createEdit.createPromocode")}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {t("createEdit.createPromocodeDesc")}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
          {/* Left Column: Main Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* General Info Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-[#1a1f26] rounded-[24px] p-6 border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-100/50 dark:shadow-black/20"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Ticket className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t("promocodes.codeDetails")}
                </h3>
              </div>
              
              <div className="space-y-6">
                <TextField
                  label={t("promocodes.promocodeLabel")}
                  placeholder={t("promocodes.promocodePlaceholder")}
                  register={register}
                  name="code"
                  error={errors.code}
                  className="bg-gray-50 dark:bg-black/20 font-mono"
                />
                <TextField
                  label={t("promocodes.descriptionLabel")}
                  placeholder={t("promocodes.descriptionPlaceholder")}
                  register={register}
                  name="description"
                  error={errors.description}
                  className="bg-gray-50 dark:bg-black/20"
                />
              </div>
            </motion.div>

            {/* Discount Configuration Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-[#1a1f26] rounded-[24px] p-6 border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-100/50 dark:shadow-black/20"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <Percent className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t("promocodes.discountConfiguration")}
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">{t("promocodes.discountType")}</label>
                  <Dropdown
                    name={t("promocodes.discountType")}
                    options={discountTypeOptions}
                    setSelectedOption={handleDiscountTypeChange}
                    className="py-2.5 bg-gray-50 dark:bg-black/20 border-gray-200 dark:border-gray-700 rounded-xl"
                  >
                    {discountType?.label || (
                      <span className="text-gray-500 dark:text-gray-400">Select Type</span>
                    )}
                  </Dropdown>
                  {errors.discountType && (
                    <span className="text-red-500 text-xs ml-1">{errors.discountType.message}</span>
                  )}
                </div>
                
                <TextField
                  label={t("promocodes.discountValue")}
                  placeholder={t("promocodes.discountValuePlaceholder")}
                  register={register}
                  name="discountValue"
                  type="number"
                  step="0.01"
                  error={errors.discountValue}
                  className="bg-gray-50 dark:bg-black/20"
                  icon={discountType?.value === 'percentage' ? <Percent className="w-4 h-4 text-gray-400" /> : <DollarSign className="w-4 h-4 text-gray-400" />}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <TextField
                  label={t("promocodes.minOrderAmount")}
                  placeholder={t("promocodes.minOrderAmountPlaceholder")}
                  register={register}
                  name="minOrderAmount"
                  type="number"
                  step="0.01"
                  error={errors.minOrderAmount}
                  className="bg-gray-50 dark:bg-black/20"
                  icon={<DollarSign className="w-4 h-4 text-gray-400" />}
                />
                <TextField
                  label="Max Uses"
                  placeholder="100 (optional)"
                  register={register}
                  name="maxUses"
                  type="number"
                  error={errors.maxUses}
                  className="bg-gray-50 dark:bg-black/20"
                />
              </div>
            </motion.div>

            {/* Applicable Products Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white dark:bg-[#1a1f26] rounded-[24px] p-6 border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-100/50 dark:shadow-black/20"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <Layout className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t("promocodes.applicableProducts") || "Applicable Products"}
                </h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between bg-white dark:bg-[#1a1f26] p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                  <div>
                    <p className="text-sm text-black/70 dark:text-white/70">
                      {selectedProducts.length}{" "}
                      {t("promocodes.productsSelected") || "products selected"}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleSelectAllProducts}
                    className="text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 font-medium"
                    disabled={availableProducts.length === 0}
                  >
                    {selectedProducts.length === availableProducts.length &&
                    availableProducts.length > 0
                      ? t("promocodes.deselectAll") || "Deselect all"
                      : t("promocodes.selectAll") || "Select all"}
                  </Button>
                </div>

                <div className="min-h-[120px]">
                  {availableProducts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 bg-white dark:bg-[#1a1f26] rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                      <div className="h-12 w-12 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center mb-3">
                        <Package className="h-6 w-6 text-gray-400" />
                      </div>
                      <p className="text-gray-900 dark:text-white font-medium text-sm">
                        {t("promocodes.noAvailableProducts") || "No available products"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 max-w-xs text-center">
                        {t("promocodes.noAvailableProductsHint") ||
                          "Make sure you have active, published products to attach this promocode to."}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {availableProducts.map((product) => {
                        const isSelected = selectedProducts.includes(product.id);
                        const productImage =
                          product.image || product.images?.[0] || product.thumbnail;

                        return (
                          <div
                            key={product.id}
                            onClick={() => handleProductToggle(product.id)}
                            className={`group relative flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-300 border ${
                              isSelected
                                ? "bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-500 shadow-md shadow-indigo-500/10"
                                : "bg-white dark:bg-[#1a1f26] border-gray-100 dark:border-gray-800 hover:border-indigo-200 dark:hover:border-indigo-900/50 hover:shadow-md hover:shadow-indigo-500/5"
                            }`}
                          >
                            <div
                              className={`absolute top-2 right-2 h-5 w-5 rounded-full flex items-center justify-center transition-all duration-300 ${
                                isSelected
                                  ? "bg-indigo-600 text-white scale-100 opacity-100 shadow-md shadow-indigo-500/30"
                                  : "bg-gray-100 dark:bg-gray-800 text-gray-300 scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100"
                              }`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </div>

                            <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex-shrink-0 overflow-hidden border border-gray-200 dark:border-gray-700">
                              {productImage ? (
                                <img
                                  src={productImage}
                                  alt={product.name}
                                  className="h-full w-full object-cover transform transition-transform duration-500 group-hover:scale-110"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center">
                                  <Package className="h-4 w-4 text-gray-400" />
                                </div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0 pr-6">
                              <h4
                                className={`font-semibold text-xs truncate transition-colors ${
                                  isSelected
                                    ? "text-indigo-900 dark:text-indigo-300"
                                    : "text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
                                }`}
                              >
                                {product.name || product.title}
                              </h4>
                              <p className="text-[11px] text-gray-500 mt-0.5">
                                {t("products.sku") || "SKU"}: {product.sku || "-"}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Validity Period Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-[#1a1f26] rounded-[24px] p-6 border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-100/50 dark:shadow-black/20"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400">
                  <CalendarClock className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t("promocodes.validityPeriod")}
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TextField
                  label={t("promocodes.startsAt")}
                  placeholder={t("promocodes.startsAtPlaceholder")}
                  register={register}
                  name="startsAt"
                  type="datetime-local"
                  error={errors.startsAt}
                  className="bg-gray-50 dark:bg-black/20"
                />
                <TextField
                  label={t("promocodes.expiresAt")}
                  placeholder={t("promocodes.expiresAtPlaceholder")}
                  register={register}
                  name="expiresAt"
                  type="datetime-local"
                  error={errors.expiresAt}
                  className="bg-gray-50 dark:bg-black/20"
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
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-black/20 flex items-center justify-between cursor-pointer" onClick={() => setValue('isActive', !isActive)}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${isActive ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>
                      {isActive ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {isActive ? t("common.active") : t("common.inactive")}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {isActive ? t("promocodes.activeByDefault") : t("promocodes.inactiveByDefault")}
                      </p>
                    </div>
                  </div>
                  <Checkbox 
                    className="hidden" 
                    name="isActive" 
                    value={isActive} 
                    setValue={(val) => setValue('isActive', val)} 
                  />
                  <div className={`w-5 h-5 rounded border flex items-center justify-center ${isActive ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 dark:border-gray-600'}`}>
                    {isActive && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-3">
                  <Button 
                    type="submit" 
                    disabled={isCreating} 
                    className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 h-11 rounded-xl"
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("common.creating")}
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        {t("common.create")}
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="ghost" 
                    type="button" 
                    onClick={() => navigate("/promocodes")} 
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

export default CreatePromocodePage;
