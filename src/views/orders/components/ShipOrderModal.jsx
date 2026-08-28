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

const ShipOrderModal = ({
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
            {t("orders.markShipped")} - Order #{order?.id}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <TextField
            label={t("orders.trackingId")}
            placeholder={t("orders.trackingId")}
            value={form.trackingId}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, trackingId: e.target.value }))
            }
          />
          <TextField
            label={t("orders.shippingProvider")}
            placeholder={t("orders.providerPlaceholder")}
            value={form.provider}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, provider: e.target.value }))
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
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            {isLoading ? t("common.processing") : t("orders.markShipped")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShipOrderModal;
