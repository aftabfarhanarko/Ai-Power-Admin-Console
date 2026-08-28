import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import TextField from "@/components/input/TextField";

const PartialPaymentModal = ({
  isOpen,
  onClose,
  order,
  form,
  setForm,
  onConfirm,
  isLoading,
}) => {
  const { t } = useTranslation();

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {t("orders.recordPayment") || "Partial Payment"} - Order #
            {order?.id}
          </DialogTitle>
          <p className="text-sm text-black/60 dark:text-white/60 mt-1">
            {order && (
              <>
                {t("orders.total")}: $
                {Number(order.totalAmount ?? 0).toFixed(2)}{" "}
                | {t("orders.paid")}: $
                {Number(order.paidAmount ?? 0).toFixed(2)}{" "}
                | {t("orders.remaining") || "Remaining"}: $
                {(
                  Number(order.totalAmount ?? 0) -
                  Number(order.paidAmount ?? 0)
                ).toFixed(2)}
              </>
            )}
          </p>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <TextField
            label={t("orders.partialAmount") || "Amount"}
            placeholder="0.00"
            type="number"
            step="0.01"
            min="0"
            value={form.partialAmount}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                partialAmount: e.target.value,
              }))
            }
          />
          <TextField
            label={t("orders.paymentReference")}
            placeholder={t("orders.paymentReference")}
            value={form.partialPaymentRef}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                partialPaymentRef: e.target.value,
              }))
            }
          />
        </div>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
          >
            {t("common.cancel")}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
          >
            {isLoading
              ? t("common.processing")
              : t("orders.recordPayment") || "Record Payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PartialPaymentModal;
