import React from "react";
import { useTranslation } from "react-i18next";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react";

const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    itemName,
    isLoading = false,
    type = "default", // "default", "warning", "danger", "success"
    confirmText,
    cancelText,
}) => {
    const { t } = useTranslation();
    const modalTitle = title ?? t("modal.confirmAction");
    const confirmLabel = confirmText ?? t("common.confirm");
    const cancelLabel = cancelText ?? t("common.cancel");
    const handleConfirm = async () => {
        try {
            await onConfirm();
        } catch (error) {
            // Error handling is done in the parent component
            console.error("Confirm error:", error);
        }
    };

    const getIcon = () => {
        switch (type) {
            case "warning":
                return <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />;
            case "danger":
                return <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />;
            case "success":
                return <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />;
            default:
                return <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
        }
    };

    const getIconBg = () => {
        switch (type) {
            case "warning":
                return "bg-orange-100 dark:bg-orange-900/20";
            case "danger":
                return "bg-red-100 dark:bg-red-900/20";
            case "success":
                return "bg-green-100 dark:bg-green-900/20";
            default:
                return "bg-blue-100 dark:bg-blue-900/20";
        }
    };

    const getButtonVariant = () => {
        switch (type) {
            case "danger":
                return "destructive";
            case "success":
                return "default";
            case "warning":
                return "default";
            default:
                return "default";
        }
    };

    const getButtonClassName = () => {
        switch (type) {
            case "danger":
                return "bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700";
            case "success":
                return "bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700";
            case "warning":
                return "bg-orange-600 hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-700";
            default:
                return "";
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] h-[300px]">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${getIconBg()}`}>
                            {getIcon()}
                        </div>
                        <div>
                            <DialogTitle className="text-lg pb-2 font-semibold">{modalTitle}</DialogTitle>
                            {description && (
                                <DialogDescription className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    {description}
                                </DialogDescription>
                            )}
                        </div>
                    </div>
                </DialogHeader>
                <div className="py-4">
                    {itemName && (
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                            {itemName}
                        </p>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={onClose} disabled={isLoading}>
                        {cancelLabel}
                    </Button>
                    <Button
                        variant={getButtonVariant()}
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className={getButtonClassName()}
                    >
                        {isLoading ? t("common.processing") : confirmLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ConfirmModal;

