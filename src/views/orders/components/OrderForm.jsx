import React, { useMemo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import TextField from "@/components/input/TextField";
import Dropdown from "@/components/dropdown/dropdown";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useCreateOrderMutation } from "@/features/order/orderApiSlice";
import { useGetProductsQuery } from "@/features/product/productApiSlice";
import { useGetUsersQuery } from "@/features/user/userApiSlice";
import { useSelector } from "react-redux";

const OrderForm = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const orderSchema = useMemo(
    () =>
      yup.object().shape({
        customerName: yup
          .string()
          .when('$hasCustomer', {
            is: false,
            then: (schema) => schema.required(t("orders.validation.customerNameRequired")).min(2, t("orders.validation.nameMin")).max(100, t("orders.validation.nameMax")).trim(),
            otherwise: (schema) => schema.trim(),
          }),
        customerPhone: yup
          .string()
          .when('$hasCustomer', {
            is: false,
            then: (schema) => schema.max(20, t("orders.validation.phoneMax")).matches(/^[+\d\s()-]*$/, t("orders.validation.phoneValid")).trim(),
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
    [t]
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
      clearErrors(['customerName', 'customerPhone']);
    }
    trigger();
  }, [selectedCustomer, clearErrors, trigger]);
  
  const [createOrder, { isLoading }] = useCreateOrderMutation();
  const { user } = useSelector((state) => state.auth);
  const { data: products = [] } = useGetProductsQuery({ companyId: user?.companyId });
  const { data: users = [] } = useGetUsersQuery({ companyId: user?.companyId });

  const productOptions = useMemo(
    () => products.map((p) => ({ label: `${p.name ?? p.title} (${p.sku ?? "-"})`, value: p.id })),
    [products]
  );
  const customerOptions = useMemo(
    () => users.map((u) => ({ label: `${u.name ?? "-"} (${u.email ?? "-"})`, value: u.id })),
    [users]
  );
  const paymentOptions = useMemo(
    () => [
      { label: t("orders.paymentDirect"), value: "DIRECT" },
      { label: t("orders.paymentCod"), value: "COD" },
    ],
    [t]
  );
  const [selectedPayment, setSelectedPayment] = useState(paymentOptions[0]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [itemQty, setItemQty] = useState(1);
  const [items, setItems] = useState([]);

  const addItem = () => {
    if (!selectedProduct || !itemQty || itemQty <= 0) return toast.error(t("orders.selectProductAndQty"));
    const exists = items.find((it) => it.productId === selectedProduct.value);
    if (exists) {
      setItems((prev) =>
        prev.map((it) =>
          it.productId === selectedProduct.value ? { ...it, quantity: it.quantity + itemQty } : it
        )
      );
    } else {
      setItems((prev) => [
        ...prev,
        { productId: selectedProduct.value, name: selectedProduct.label, quantity: itemQty },
      ]);
    }
    setSelectedProduct(null);
    setItemQty(1);
  };

  const removeItem = (pid) => setItems((prev) => prev.filter((it) => it.productId !== pid));

  const onSubmit = async (data) => {
    if (items.length === 0) {
      toast.error(t("orders.addAtLeastOneItem"));
      return;
    }
    
    // Manual validation: if no customer selected, customerName is required
    if (!selectedCustomer && (!data.customerName || data.customerName.trim().length < 2)) {
      toast.error(t("orders.customerNameRequiredMin"));
      return;
    }

    const payload = {
      customerId: selectedCustomer?.value || undefined,
      customerName: !selectedCustomer ? data.customerName || undefined : undefined,
      customerEmail: !selectedCustomer ? data.customerEmail || undefined : undefined,
      customerPhone: !selectedCustomer ? data.customerPhone || undefined : undefined,
      customerAddress: !selectedCustomer ? data.customerAddress || undefined : undefined,
      items: items.map((it) => ({ productId: it.productId, quantity: it.quantity })),
      shippingAddress: data.shippingAddress || undefined,
      paymentMethod: selectedPayment?.value,
    };

    const params = { companyId: user?.companyId };
    const res = await createOrder({ body: payload, params });
    if (res?.data) {
      toast.success(t("orders.orderCreated"));
      reset();
      setItems([]);
      setSelectedCustomer(null);
      setSelectedPayment(paymentOptions[0]);
      setIsOpen(false);
    } else {
      toast.error(res?.error?.data?.message || t("orders.orderCreateFailed"));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm">{t("orders.createOrder")}</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t("orders.createOrder")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit, (errors) => {
          // Log validation errors for debugging
          if (Object.keys(errors).length > 0) {
            console.log("Form validation errors:", errors);
            const firstError = Object.values(errors)[0];
            if (firstError?.message) {
              toast.error(firstError.message);
            }
          }
        })} className="space-y-4">
          {/* Customer selection */}
          <div className="fl gap-3">
            <Dropdown
              name={t("orders.customer")}
              options={customerOptions}
              setSelectedOption={setSelectedCustomer}
            >
              {selectedCustomer ? selectedCustomer.label : t("orders.selectCustomer")}
            </Dropdown>
            <Dropdown
              name={t("orders.paymentMethod")}
              options={paymentOptions}
              setSelectedOption={setSelectedPayment}
            >
              {selectedPayment ? selectedPayment.label : t("orders.paymentMethod")}
            </Dropdown>
          </div>

          {/* Manual customer info (used only if no selectedCustomer) */}
          {!selectedCustomer && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <TextField
                label={t("orders.customerName")}
                placeholder={t("orders.customerPlaceholder")}
                register={register}
                name="customerName"
                error={errors.customerName?.message}
              />
              <TextField
                label={t("orders.customerEmail")}
                placeholder={t("orders.emailPlaceholder")}
                type="email"
                register={register}
                name="customerEmail"
                error={errors.customerEmail?.message}
              />
              <TextField
                label={t("orders.customerPhone")}
                placeholder={t("orders.phonePlaceholder")}
                register={register}
                name="customerPhone"
                error={errors.customerPhone?.message}
              />
              <TextField
                label={t("orders.customerAddress")}
                placeholder={t("orders.addressPlaceholder")}
                register={register}
                name="customerAddress"
                error={errors.customerAddress?.message}
              />
            </div>
          )}

          {/* Shipping address */}
          <TextField
            label={t("orders.shippingAddress")}
            placeholder={t("orders.shippingPlaceholder")}
            register={register}
            name="shippingAddress"
            error={errors.shippingAddress?.message}
          />

          {/* Items composer */}
          <div className="rounded-xl border border-gray-100 dark:border-gray-800 p-3">
            <div className="fl gap-3">
              <Dropdown
                name={t("orders.product")}
                options={productOptions}
                setSelectedOption={setSelectedProduct}
              >
                {selectedProduct ? selectedProduct.label : t("orders.selectProduct")}
              </Dropdown>
              <input
                type="number"
                min={1}
                value={itemQty}
                onChange={(e) => {
                  const value = e.target.value;
                  const numValue = parseInt(value, 10);
                  if (!isNaN(numValue) && numValue > 0) {
                    setItemQty(numValue);
                  } else if (value === "" || value === null || value === undefined) {
                    setItemQty(1);
                  }
                }}
                onBlur={(e) => {
                  const value = e.target.value;
                  const numValue = parseInt(value, 10);
                  if (isNaN(numValue) || numValue < 1) {
                    setItemQty(1);
                  }
                }}
                className="border border-gray-100 dark:border-white/20 bg-gray-50 dark:bg-[#1a1f26] dark:bg-white/10 px-3 py-2 rounded-md w-28 outline-none"
                placeholder={t("orders.qty")}
              />
              <Button type="button" variant="outline" onClick={addItem}>
                {t("orders.addItem")}
              </Button>
            </div>

            <div className="mt-3 space-y-2">
              {items.length === 0 ? (
                <p className="text-sm opacity-60">{t("orders.noItemsAdded")}</p>
              ) : (
                items.map((it) => (
                  <div key={it.productId} className="fl justify-between border border-black/5 dark:border-gray-800 rounded-md px-3 py-2">
                    <span className="text-sm">{it.name}</span>
                    <div className="fl gap-3">
                      <span className="text-sm">{t("orders.qty")}: {it.quantity}</span>
                      <Button variant="ghost" size="sm" onClick={() => removeItem(it.productId)}>
                        {t("orders.remove")}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="ghost" 
              className="bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400" 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsOpen(false);
              }}
            >
              {t("orders.close")}
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400">
              {isLoading ? t("orders.creating") : t("orders.createOrder")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default OrderForm;