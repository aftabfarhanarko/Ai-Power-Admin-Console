import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import TextField from "@/components/input/TextField";

const BarcodeScanModal = ({
  isOpen,
  onClose,
  value,
  setValue,
  onScan,
  isLoading,
}) => {
  const { t } = useTranslation();

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const val = (e.target?.value || value || "").trim();
      if (val) {
        onScan(val);
      }
    }
  };

  const handleConfirm = () => {
    const val = value?.trim();
    if (!val) {
      toast.error(t("orders.trackingIdRequired"));
      return;
    }
    onScan(val);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("orders.scanBarcode")}</DialogTitle>
          <p className="text-sm text-black/60 dark:text-white/60 mt-1">
            {t("orders.scanBarcodeDesc")}
          </p>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <TextField
            label={t("orders.trackingId")}
            placeholder={t("orders.enterTrackingId")}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
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
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-slate-500 hover:bg-slate-600 text-white"
          >
            {isLoading
              ? t("common.processing")
              : t("orders.recordScan")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BarcodeScanModal;
