import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import TextField from "@/components/input/TextField";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  useCompleteOrderMutation,
  useShipOrderMutation,
} from "@/features/order/orderApiSlice";
import { useSelector } from "react-redux";

const OrderEditForm = ({ order }) => {
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.auth);
  const [isOpen, setIsOpen] = useState(false);

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

  const [completeOrder, { isLoading: isCompleting }] = useCompleteOrderMutation();
  const [shipOrder, { isLoading: isShipping }] = useShipOrderMutation();

  const onComplete = async (data) => {
    const params = { companyId: user?.companyId };
    const res = await completeOrder({ id: order.id, body: { paymentRef: data.paymentRef || undefined }, params });
    if (res?.data) {
      toast.success(t("orders.orderMarkedPaid"));
    } else {
      toast.error(res?.error?.data?.message || t("orders.completeFailed"));
    }
  };

  const onShip = async (data) => {
    const params = { companyId: user?.companyId };
    const res = await shipOrder({ id: order.id, body: { trackingId: data.trackingId || undefined, provider: data.provider || undefined }, params });
    if (res?.data) {
      toast.success(t("orders.shippingUpdated"));
    } else {
      toast.error(res?.error?.data?.message || t("orders.shippingUpdateFailed"));
    }
  };

  const closeAndReset = () => {
    setIsOpen(false);
    reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400"
          title={t("common.edit")}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("orders.editOrderTitle")} #{order?.id}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <section>
            <h4 className="text-sm font-medium mb-3">{t("orders.completePayment")}</h4>
            <form onSubmit={handleSubmit(onComplete)} className="space-y-3">
              <TextField
                label={t("orders.paymentReference")}
                placeholder={t("orders.txnRefOptional")}
                register={register}
                name="paymentRef"
                error={errors.paymentRef?.message}
              />
              <DialogFooter>
                <Button type="submit" disabled={isCompleting}>
                  {isCompleting ? t("common.processing") : t("orders.markPaid")}
                </Button>
              </DialogFooter>
            </form>
          </section>

          <section>
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
              <DialogFooter>
                <Button className="bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400" type="submit" variant="outline" disabled={isShipping}>
                  {isShipping ? t("orders.updating") : t("orders.updateShipping")}
                </Button>
              </DialogFooter>
            </form>
          </section>

          <div className="fl justify-end gap-2">
            <Button className="bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400" variant="outline" onClick={closeAndReset}>{t("orders.close")}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderEditForm;