import React, { useMemo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import TextField from "@/components/input/TextField";
import Dropdown from "@/components/dropdown/dropdown";
import { useCreateOrderMutation } from "@/features/order/orderApiSlice";
import { useGetProductsQuery } from "@/features/product/productApiSlice";
import { useGetUsersQuery } from "@/features/user/userApiSlice";
import { useSelector } from "react-redux";
import {
  ArrowLeft,
  User,
  Box,
  CreditCard,
  Truck,
  ShoppingCart,
  Plus,
  Trash2,
  Save,
  X,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const CreateOrderPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const orderSchema = useMemo(
    () =>
      yup.object().shape({
        customerName: yup.string().when("$hasCustomer", {
          is: false,
          then: (schema) =>
            schema
              .required(t("orders.validation.customerNameRequired"))
              .min(2, t("orders.validation.nameMin"))
              .max(100, t("orders.validation.nameMax"))
              .trim(),
          otherwise: (schema) => schema.trim(),
        }),
        customerPhone: yup.string().when("$hasCustomer", {
          is: false,
          then: (schema) =>
            schema
              .max(20, t("orders.validation.phoneMax"))
              .matches(/^[+\d\s()-]*$/, t("orders.validation.phoneValid"))
              .trim(),
          otherwise: (schema) => schema.trim(),
        }),
        customerEmail: yup
          .string()
          .transform((v) => (v === "" ? undefined : v))
          .optional()
          .email(t("orders.validation.emailValid"))
          .max(255, t("orders.validation.emailMax"))
          .trim(),
        customerAddress: yup
          .string()
          .max(500, t("orders.validation.addressMax"))
          .trim(),
        shippingAddress: yup
          .string()
          .max(500, t("orders.validation.shippingAddressMax"))
          .trim(),
      }),
    [t],
  );

  const form = useForm({
    resolver: yupResolver(orderSchema),
    mode: "onChange",
    context: { hasCustomer: !!selectedCustomer },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    clearErrors,
    trigger,
  } = form;

  // Clear validation errors and re-validate when customer selection changes
  useEffect(() => {
    if (selectedCustomer) {
      clearErrors(["customerName", "customerPhone"]);
    }
    trigger();
  }, [selectedCustomer, clearErrors, trigger]);

  const [createOrder, { isLoading }] = useCreateOrderMutation();
  const { user } = useSelector((state) => state.auth);
  const { data: products = [] } = useGetProductsQuery({
    companyId: user?.companyId,
  });
  const { data: users = [] } = useGetUsersQuery({ companyId: user?.companyId });

  const productOptions = useMemo(
    () =>
      products.map((p) => ({
        label: `${p.name ?? p.title} (${p.sku ?? "-"})`,
        value: p.id,
      })),
    [products],
  );
  const customerOptions = useMemo(
    () =>
      users.map((u) => ({
        label: `${u.name ?? "-"} (${u.email ?? "-"})`,
        value: u.id,
      })),
    [users],
  );
  const paymentOptions = useMemo(
    () => [
      { label: t("orders.paymentDirect"), value: "DIRECT" },
      { label: t("orders.paymentCod"), value: "COD" },
    ],
    [t],
  );
  const [selectedPayment, setSelectedPayment] = useState(paymentOptions[0]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [itemQty, setItemQty] = useState(1);
  const [items, setItems] = useState([]);

  const addItem = () => {
    if (!selectedProduct || !itemQty || itemQty <= 0)
      return toast.error(t("orders.selectProductAndQty"));
    const exists = items.find((it) => it.productId === selectedProduct.value);
    if (exists) {
      setItems((prev) =>
        prev.map((it) =>
          it.productId === selectedProduct.value
            ? { ...it, quantity: it.quantity + itemQty }
            : it,
        ),
      );
    } else {
      setItems((prev) => [
        ...prev,
        {
          productId: selectedProduct.value,
          name: selectedProduct.label,
          quantity: itemQty,
        },
      ]);
    }
    setSelectedProduct(null);
    setItemQty(1);
  };

  const removeItem = (pid) =>
    setItems((prev) => prev.filter((it) => it.productId !== pid));

  const onSubmit = async (data) => {
    if (items.length === 0) {
      toast.error(
        t("orders.addAtLeastOneItem", "Please add at least one item"),
      );
      return;
    }

    // Manual validation: if no customer selected, customerName is required
    if (
      !selectedCustomer &&
      (!data.customerName || data.customerName.trim().length < 2)
    ) {
      toast.error(
        t("orders.customerNameRequiredMin", "Customer name is required"),
      );
      return;
    }

    const payload = {
      customerId: selectedCustomer?.value || undefined,
      customerName: !selectedCustomer
        ? data.customerName || undefined
        : undefined,
      customerEmail: !selectedCustomer
        ? data.customerEmail || undefined
        : undefined,
      customerPhone: !selectedCustomer
        ? data.customerPhone || undefined
        : undefined,
      customerAddress: !selectedCustomer
        ? data.customerAddress || undefined
        : undefined,
      items: items.map((it) => ({
        productId: it.productId,
        quantity: it.quantity,
      })),
      shippingAddress: data.shippingAddress || undefined,
      paymentMethod: selectedPayment?.value,
    };

    const params = { companyId: user?.companyId };
    const res = await createOrder({ body: payload, params });
    if (res?.data) {
      toast.success(t("orders.orderCreated", "Order created successfully!"));
      reset();
      setItems([]);
      setSelectedCustomer(null);
      setSelectedPayment(paymentOptions[0]);
      navigate("/orders");
    } else {
      toast.error(
        res?.error?.data?.message ||
          t("orders.orderCreateFailed", "Failed to create order"),
      );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-[1600px] mx-auto space-y-8"
    >
      {/* Header Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/orders")}
            className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white transition-all duration-300"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            {t("orders.createOrder", "Create Order")}
          </h1>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-lg font-medium pl-14">
          {t(
            "createEdit.createOrderDesc",
            "Create a new order for your customers efficiently.",
          )}
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit, (errors) => {
          if (Object.keys(errors).length > 0) {
            console.log("Form validation errors:", errors);
            const firstError = Object.values(errors)[0];
            if (firstError?.message) {
              toast.error(firstError.message);
            }
          }
        })}
        className="grid grid-cols-1 xl:grid-cols-12 gap-8"
      >
        {/* Left Column: Customer & Items */}
        <div className="xl:col-span-8 space-y-8">
          {/* Customer Section */}
          <div className="relative group">
            {/* Background Layer with Overflow Hidden for Decoration */}
            <div className="absolute inset-0 bg-white dark:bg-slate-800 rounded-[32px] border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden pointer-events-none">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -mr-16 -mt-16 transition-all duration-500 group-hover:bg-indigo-500/10" />
            </div>

            {/* Content Layer (Unclipped for Dropdowns) */}
            <div className="relative z-10 p-8 py-12">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-[18px] bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {t("orders.customerDetails", "Customer Details")}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    {t(
                      "orders.customerDetailsDesc",
                      "Select existing or enter new customer",
                    )}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                      {t("orders.customer", "Customer")}
                    </label>
                    <div className="relative">
                      <Dropdown
                        name={t("orders.customer", "Customer")}
                        options={customerOptions}
                        setSelectedOption={setSelectedCustomer}
                        className="w-full"
                      >
                        {selectedCustomer
                          ? selectedCustomer.label
                          : t("orders.selectCustomer", "Select Customer")}
                      </Dropdown>
                    </div>
                  </div>
                </div>

                {/* Manual Customer Fields */}
                <AnimatePresence>
                  {!selectedCustomer && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-700">
                        <TextField
                          label={t("orders.customerName", "Customer Name")}
                          placeholder={t(
                            "orders.customerPlaceholder",
                            "Enter customer name",
                          )}
                          register={register}
                          name="customerName"
                          error={errors.customerName?.message}
                          inputClassName="bg-slate-50 dark:bg-slate-900/50 h-14 rounded-xl border-slate-200 dark:border-slate-700 focus:border-indigo-500"
                        />
                        <TextField
                          label={t("orders.customerEmail", "Customer Email")}
                          placeholder={t(
                            "orders.emailPlaceholder",
                            "Enter email address",
                          )}
                          type="email"
                          register={register}
                          name="customerEmail"
                          error={errors.customerEmail?.message}
                          inputClassName="bg-slate-50 dark:bg-slate-900/50 h-14 rounded-xl border-slate-200 dark:border-slate-700 focus:border-indigo-500"
                        />
                        <TextField
                          label={t("orders.customerPhone", "Phone Number")}
                          placeholder={t(
                            "orders.phonePlaceholder",
                            "Enter phone number",
                          )}
                          register={register}
                          name="customerPhone"
                          error={errors.customerPhone?.message}
                          inputClassName="bg-slate-50 dark:bg-slate-900/50 h-14 rounded-xl border-slate-200 dark:border-slate-700 focus:border-indigo-500"
                        />
                        <TextField
                          label={t("orders.customerAddress", "Address")}
                          placeholder={t(
                            "orders.addressPlaceholder",
                            "Enter full address",
                          )}
                          register={register}
                          name="customerAddress"
                          error={errors.customerAddress?.message}
                          inputClassName="bg-slate-50 dark:bg-slate-900/50 h-14 rounded-xl border-slate-200 dark:border-slate-700 focus:border-indigo-500"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Items Section */}
          <div className="bg-white dark:bg-slate-800 rounded-[32px] p-8 border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-[18px] bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm">
                <Box className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {t("orders.products", "Products")}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  {t("orders.productsDesc", "Add products to the order")}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-[24px] border border-slate-200 dark:border-slate-700">
                <div className="flex flex-col md:flex-row gap-4 items-end">
                  <div className="flex-1 space-y-2 w-full">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                      {t("orders.selectProduct", "Select Product")}
                    </label>
                    <Dropdown
                      name={t("orders.product", "Product")}
                      options={productOptions}
                      setSelectedOption={setSelectedProduct}
                    >
                      {selectedProduct
                        ? selectedProduct.label
                        : t("orders.selectProduct", "Select Product")}
                    </Dropdown>
                  </div>
                  <div className="w-full md:w-32 space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                      {t("orders.qty", "Qty")}
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={itemQty}
                      onChange={(e) => {
                        const value = e.target.value;
                        const numValue = parseInt(value, 10);
                        if (!isNaN(numValue) && numValue > 0) {
                          setItemQty(numValue);
                        } else if (value === "") {
                          setItemQty(1);
                        }
                      }}
                      className="w-full h-[52px] px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-center font-bold text-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={addItem}
                    className="h-[52px] px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-500/20 w-full md:w-auto"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    {t("orders.addItem", "Add Item")}
                  </Button>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider ml-1 mb-2">
                  {t("orders.orderItems", "Order Items")} ({items.length})
                </h4>
                <AnimatePresence mode="popLayout">
                  {items.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-[24px]"
                    >
                      <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500 font-medium">
                        {t("orders.noItemsAdded", "No items added yet.")}
                      </p>
                    </motion.div>
                  ) : (
                    items.map((it) => (
                      <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        key={it.productId}
                        className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[20px] shadow-sm hover:shadow-md transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-lg">
                            {it.quantity}x
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">
                              {it.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              Product ID: {it.productId}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(it.productId)}
                          className="text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Sidebar */}
        <div className="xl:col-span-4 space-y-8">
          {/* Payment & Shipping Card */}
          <div className="bg-white dark:bg-slate-800 rounded-[32px] p-8 border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none sticky top-8">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
              <CreditCard className="w-6 h-6 text-indigo-600" />
              {t("orders.paymentAndShipping", "Payment & Shipping")}
            </h3>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                  {t("orders.paymentMethod", "Payment Method")}
                </label>
                <Dropdown
                  name={t("orders.paymentMethod", "Payment Method")}
                  options={paymentOptions}
                  setSelectedOption={setSelectedPayment}
                >
                  {selectedPayment
                    ? selectedPayment.label
                    : t("orders.paymentMethod", "Payment Method")}
                </Dropdown>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                  {t("orders.shippingAddress", "Shipping Address")}
                </label>
                <textarea
                  {...register("shippingAddress")}
                  placeholder={t(
                    "orders.shippingPlaceholder",
                    "Enter shipping address (optional)",
                  )}
                  className="w-full h-32 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none transition-all"
                />
                {errors.shippingAddress && (
                  <p className="text-red-500 text-sm ml-1">
                    {errors.shippingAddress.message}
                  </p>
                )}
              </div>

              <div className="pt-6 border-t border-slate-100 dark:border-slate-700">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-slate-500 font-medium">
                    {t("orders.totalItems", "Total Items")}
                  </span>
                  <span className="text-slate-900 dark:text-white font-bold text-lg">
                    {items.length}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-slate-500 font-medium">
                    {t("orders.totalQuantity", "Total Quantity")}
                  </span>
                  <span className="text-slate-900 dark:text-white font-bold text-lg">
                    {items.reduce((acc, curr) => acc + curr.quantity, 0)}
                  </span>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-base shadow-lg shadow-indigo-500/30 dark:shadow-none transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {t("orders.creating", "Creating...")}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" />
                      {t("orders.createOrder", "Create Order")}
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </motion.div>
  );
};

export default CreateOrderPage;
