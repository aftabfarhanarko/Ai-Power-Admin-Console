import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import TextField from "@/components/input/TextField";

const DeliverOrderModal = ({
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
            {t("orders.markDelivered")} - Order #{order?.id}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <TextField
            label={t("orders.note")}
            placeholder={t("orders.notePlaceholder")}
            value={form.comment}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, comment: e.target.value }))
            }
            multiline
            rows={3}
          />
          <div className="flex items-center justify-between rounded-lg border border-black/10 dark:border-white/10 p-4">
            <label
              htmlFor="markAsPaid"
              className="text-sm font-medium cursor-pointer"
            >
              {t("orders.markPaid")}
            </label>
            <Switch
              id="markAsPaid"
              checked={form.markAsPaid}
              onCheckedChange={(checked) =>
                setForm((prev) => ({ ...prev, markAsPaid: checked }))
              }
            />
          </div>
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
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            {isLoading
              ? t("common.processing")
              : t("orders.markDelivered")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeliverOrderModal;
