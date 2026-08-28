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

const CancelOrderModal = ({
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
          <DialogTitle>{t("orders.cancelOrder")}</DialogTitle>
          <p className="text-sm text-black/60 dark:text-white/60 mt-1">
            {t("orders.confirmProcessing")} Order #{order?.id}?
          </p>
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
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            {isLoading
              ? t("common.processing")
              : t("orders.cancelOrder")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CancelOrderModal;
