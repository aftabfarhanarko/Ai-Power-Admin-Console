import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import TextField from "@/components/input/TextField";
import Checkbox from "@/components/input/Checkbox";
import Dropdown from "@/components/dropdown/dropdown";
import { useSelector } from "react-redux";
import { Package, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useCreatePromocodeMutation } from "@/features/promocode/promocodeApiSlice";
import { useGetProductsQuery } from "@/features/product/productApiSlice";

function PromocodeForm() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [discountType, setDiscountType] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);

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
        startsAt: yup
          .string()
          .nullable()
          .transform((value) => (value === "" ? null : value)),
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
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
    trigger,
  } = useForm({
    resolver: yupResolver(promocodeSchema),
    defaultValues: {
      productIds: [],
    },
  });
  const [createPromocode, { isLoading: isCreating }] = useCreatePromocodeMutation();

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
    // Re-validate discountValue when discountType changes
    trigger("discountValue");
  };

  const onSubmit = async (data) => {

    console.log(data);
    // Validate discount type
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
      setIsOpen(false);
    } else {
      toast.error(res?.error?.data?.message || t("promocodes.promocodeCreateFailed"));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm">{t("promocodes.addPromocode")}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("createEdit.createPromocode")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 mt-4">
          {/* Code Details Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
              <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
                {t("promocodes.codeDetails")}
              </h3>
            </div>
            <TextField
              label={t("promocodes.promocodeLabel")}
              placeholder={t("promocodes.promocodePlaceholder")}
              register={register}
              name="code"
              error={errors.code}
            />
            <TextField
              label={t("promocodes.descriptionLabel")}
              placeholder={t("promocodes.descriptionPlaceholder")}
              register={register}
              name="description"
              error={errors.description}
            />
          </div>

          {/* Discount Configuration Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
              <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
                {t("promocodes.discountConfiguration")}
              </h3>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-black/50 dark:text-white/50 text-sm ml-1">{t("promocodes.discountType")}</label>
              <Dropdown
                name={t("promocodes.discountType")}
                options={discountTypeOptions}
                setSelectedOption={handleDiscountTypeChange}
                className="py-2"
              >
                {discountType?.label || (
                  <span className="text-black/50 dark:text-white/50">{t("promocodes.selectType")}</span>
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
            />
          </div>

          {/* Usage Limits Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
              <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
                {t("promocodes.usageLimits")}
              </h3>
            </div>
            <TextField
              label={t("promocodes.maxUses")}
              placeholder={t("promocodes.maxUsesPlaceholder")}
              register={register}
              name="maxUses"
              type="number"
              error={errors.maxUses}
            />
            <TextField
              label={t("promocodes.minOrderAmount")}
              placeholder={t("promocodes.minOrderAmountPlaceholder")}
              register={register}
              name="minOrderAmount"
              type="number"
              step="0.01"
              error={errors.minOrderAmount}
            />
          </div>

          {/* Applicable Products Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
              <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
                {t("promocodes.applicableProducts") || "Applicable Products"}
              </h3>
            </div>

            <div className="flex items-center justify-between bg-white dark:bg-[#1a1f26] p-3 rounded-xl border border-gray-100 dark:border-gray-800">
              <div>
                <p className="text-sm text-black/70 dark:text-white/70">
                  {selectedProducts.length} {t("promocodes.productsSelected") || "products selected"}
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
                {selectedProducts.length === availableProducts.length && availableProducts.length > 0
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

          {/* Validity Period Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
              <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
                {t("promocodes.validityPeriod")}
              </h3>
            </div>
            <TextField
              label={t("promocodes.startsAt")}
              placeholder={t("promocodes.startsAtPlaceholder")}
              register={register}
              name="startsAt"
              type="datetime-local"
              error={errors.startsAt}
            />
            <TextField
              label={t("promocodes.expiresAt")}
              placeholder={t("promocodes.expiresAtPlaceholder")}
              register={register}
              name="expiresAt"
              type="datetime-local"
              error={errors.expiresAt}
            />
          </div>

          {/* Status Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
              <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
                {t("common.status")}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox className="bg-black text-white hover:bg-black/90" name="isActive" value={true} setValue={() => { }}>
                {t("promocodes.activeByDefault")}
              </Checkbox>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" type="button" onClick={() => setIsOpen(false)} className="bg-red-500 hover:bg-red-600 text-white">
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={isCreating} className="bg-green-500 hover:bg-green-600 text-white">
              {isCreating ? t("common.creating") : t("common.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default PromocodeForm;