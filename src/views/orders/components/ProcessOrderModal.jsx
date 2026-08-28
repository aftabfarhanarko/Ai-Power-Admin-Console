import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const ProcessOrderModal = ({
  isOpen,
  onClose,
  order,
  onConfirm,
  isLoading,
}) => {
  const { t } = useTranslation();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("orders.markProcessing")}</DialogTitle>
          <p className="text-sm text-black/60 dark:text-white/60 mt-1">
            {t("orders.confirmProcessing")} Order #{order?.id}?
          </p>
        </DialogHeader>
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
            className="bg-purple-500 hover:bg-purple-600 text-white"
          >
            {isLoading
              ? t("common.processing")
              : t("orders.markProcessing")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProcessOrderModal;
