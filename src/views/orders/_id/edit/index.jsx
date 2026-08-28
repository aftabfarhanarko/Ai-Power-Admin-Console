import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import TextField from "@/components/input/TextField";
import {
  useCompleteOrderMutation,
  useShipOrderMutation,
  useRecordPartialPaymentMutation,
} from "@/features/order/orderApiSlice";
import { useGetOrdersQuery } from "@/features/order/orderApiSlice";
import { useSelector } from "react-redux";

const OrderEditPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { data: orders = [], refetch } = useGetOrdersQuery({ companyId: user?.companyId });
  const order = orders.find((o) => o.id === parseInt(id));

  const orderEditSchema = useMemo(
    () =>
      yup.object().shape({
        paymentRef: yup
          .string()
          .max(100, t("orders.validation.paymentRefMax"))
          .trim(),
        trackingId: yup
          .string()
          .max(100, t("orders.validation.trackingIdMax"))
          .trim(),
        provider: yup
          .string()
          .max(100, t("orders.validation.providerMax"))
          .trim(),
      }),
    [t]
  );

  const partialPaymentSchema = useMemo(
    () =>
      yup.object().shape({
        partialAmount: yup
          .number()
          .required(t("orders.validation.amountRequired"))
          .positive(t("orders.validation.amountPositive"))
          .typeError(t("orders.validation.amountNumber")),
        partialPaymentRef: yup.string().max(100).trim(),
      }),
    [t]
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(orderEditSchema),
    mode: "onChange",
    defaultValues: {
      paymentRef: order?.paymentReference || "",
      trackingId: order?.shippingTrackingId || "",
      provider: order?.shippingProvider || "",
    },
  });

  const {
    register: registerPartial,
    handleSubmit: handlePartialSubmit,
    reset: resetPartial,
    formState: { errors: partialErrors },
  } = useForm({
    resolver: yupResolver(partialPaymentSchema),
    mode: "onChange",
    defaultValues: { partialAmount: "", partialPaymentRef: "" },
  });

  const [completeOrder, { isLoading: isCompleting }] = useCompleteOrderMutation();
  const [shipOrder, { isLoading: isShipping }] = useShipOrderMutation();
  const [recordPartialPayment, { isLoading: isRecordingPartial }] = useRecordPartialPaymentMutation();

  const onComplete = async (data) => {
    const params = { companyId: user?.companyId };
    const res = await completeOrder({ id: order.id, body: { paymentRef: data.paymentRef || undefined }, params });
    if (res?.data) {
      toast.success(t("orders.orderMarkedPaid"));
      reset({ paymentRef: data.paymentRef, trackingId: order?.shippingTrackingId || "", provider: order?.shippingProvider || "" });
    } else {
      toast.error(res?.error?.data?.message || t("orders.completeFailed"));
    }
  };

  const onShip = async (data) => {
    const params = { companyId: user?.companyId };
    const res = await shipOrder({ id: order.id, body: { trackingId: data.trackingId || undefined, provider: data.provider || undefined }, params });
    if (res?.data) {
      toast.success(t("orders.shippingUpdated"));
      reset({ paymentRef: order?.paymentReference || "", trackingId: data.trackingId, provider: data.provider });
    } else {
      toast.error(res?.error?.data?.message || t("orders.shippingUpdateFailed"));
    }
  };

  const onPartialPayment = async (data) => {
    const params = { companyId: user?.companyId };
    const res = await recordPartialPayment({
      id: order.id,
      body: { amount: Number(data.partialAmount), paymentRef: data.partialPaymentRef || undefined },
      params,
    });
    if (res?.data) {
      toast.success(t("orders.partialPaymentRecorded"));
      resetPartial({ partialAmount: "", partialPaymentRef: "" });
      refetch();
    } else {
      toast.error(res?.error?.data?.message || t("orders.partialPaymentFailed"));
    }
  };

  if (!order) {
    return (
      <div className="rounded-2xl bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/orders")}
            className="bg-black dark:bg-black hover:bg-black/80 dark:hover:bg-black/80 text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">{t("orders.orderNotFound")}</h1>
            <p className="text-sm text-black/60 dark:text-white/60 mt-1">
              {t("orders.orderNotFoundDesc")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/orders/${id}`)}
          className="bg-black dark:bg-black hover:bg-black/80 dark:hover:bg-black/80 text-white"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">{t("orders.editOrderTitle")} #{order.id}</h1>
          <p className="text-sm text-black/60 dark:text-white/60 mt-1">
            {t("createEdit.updateOrder")}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {order.totalAmount != null && (
          <section className="border border-gray-100 dark:border-gray-800 rounded-lg p-4">
            <h4 className="text-sm font-medium mb-3">{t("orders.paymentSummary") || "Payment Summary"}</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
              <div>
                <span className="text-black/60 dark:text-white/60">{t("orders.totalAmount") || "Total"}: </span>
                <span className="font-semibold">৳{parseFloat(order.totalAmount || 0).toFixed(2)}</span>
              </div>
              <div>
                <span className="text-black/60 dark:text-white/60">{t("orders.paidAmount") || "Paid"}: </span>
                <span className="font-semibold text-emerald-600">৳{parseFloat(order.paidAmount || 0).toFixed(2)}</span>
              </div>
              <div>
                <span className="text-black/60 dark:text-white/60">{t("orders.remaining") || "Remaining"}: </span>
                <span className="font-semibold text-amber-600">
                  ৳{Math.max(0, parseFloat(order.totalAmount || 0) - parseFloat(order.paidAmount || 0)).toFixed(2)}
                </span>
              </div>
            </div>
            {parseFloat(order.paidAmount || 0) < parseFloat(order.totalAmount || 0) && (
              <form onSubmit={handlePartialSubmit(onPartialPayment)} className="space-y-3">
                <div className="flex flex-wrap gap-3 items-end">
                  <TextField
                    label={t("orders.partialAmount") || "Amount"}
                    placeholder="0.00"
                    register={registerPartial}
                    name="partialAmount"
                    type="number"
                    step="0.01"
                    error={partialErrors.partialAmount?.message}
                    className="flex-1 min-w-[120px]"
                  />
                  <TextField
                    label={t("orders.paymentReference")}
                    placeholder={t("orders.txnRefOptional")}
                    register={registerPartial}
                    name="partialPaymentRef"
                    error={partialErrors.partialPaymentRef?.message}
                    className="flex-1 min-w-[120px]"
                  />
                  <Button
                    type="submit"
                    disabled={isRecordingPartial}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {isRecordingPartial ? t("common.processing") : t("orders.recordPayment") || "Record Payment"}
                  </Button>
                </div>
              </form>
            )}
          </section>
        )}

        <section className="border border-gray-100 dark:border-gray-800 rounded-lg p-4">
          <h4 className="text-sm font-medium mb-3">{t("orders.completePayment")}</h4>
          <form onSubmit={handleSubmit(onComplete)} className="space-y-3">
            <TextField
              label={t("orders.paymentReference")}
              placeholder={t("orders.txnRefOptional")}
              register={register}
              name="paymentRef"
              error={errors.paymentRef?.message}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={isCompleting} className="bg-black dark:bg-black hover:bg-black/80 dark:hover:bg-black/80 text-white">
                {isCompleting ? t("common.processing") : t("orders.markPaid")}
              </Button>
            </div>
          </form>
        </section>

        <section className="border border-gray-100 dark:border-gray-800 rounded-lg p-4">
          <h4 className="text-sm font-medium mb-3">{t("orders.shipping")}</h4>
          <form onSubmit={handleSubmit(onShip)} className="space-y-3">
            <TextField
              label={t("orders.trackingId")}
              placeholder={t("orders.trackingId")}
              register={register}
              name="trackingId"
              error={errors.trackingId?.message}
            />
            <TextField
              label={t("orders.shippingProvider")}
              placeholder={t("orders.providerPlaceholder")}
              register={register}
              name="provider"
              error={errors.provider?.message}
            />
            <div className="flex justify-end">
              <Button className="bg-black dark:bg-black hover:bg-black/80 dark:hover:bg-black/80 text-white" type="submit" variant="outline" disabled={isShipping}>
                {isShipping ? t("orders.updating") : t("orders.updateShipping")}
              </Button>
            </div>
          </form>
        </section>

        <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
          <Button className="bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400" variant="outline" onClick={() => navigate(`/orders/${id}`)}>
            {t("common.cancel")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderEditPage;
