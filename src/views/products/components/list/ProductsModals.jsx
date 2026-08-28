import React from "react";
import DeleteModal from "@/components/modals/DeleteModal";
import ConfirmModal from "@/components/modals/ConfirmModal";

export default function ProductsModals({
  modalState,
  onClose,
  onAction,
  t = (k) => k,
  isDeleting = false,
  isRecovering = false,
  isPermanentlyDeleting = false,
}) {
  const { type, product } = modalState ?? {};
  if (!type || !product) return null;

  if (type === "delete") {
    return (
      <DeleteModal
        isOpen
        onClose={onClose}
        onConfirm={() => onAction("delete", product)}
        title={t("products.moveToTrash")}
        description={t("products.moveToTrashDesc")}
        itemName={product?.name}
        isLoading={isDeleting}
      />
    );
  }

  if (type === "recover") {
    return (
      <ConfirmModal
        isOpen
        onClose={onClose}
        onConfirm={() => onAction("recover", product)}
        title={t("products.recoverProduct")}
        description={t("products.recoverProductDesc")}
        itemName={product?.name}
        isLoading={isRecovering}
        type="success"
        confirmText="Recover"
      />
    );
  }

  if (type === "permanentDelete") {
    return (
      <ConfirmModal
        isOpen
        onClose={onClose}
        onConfirm={() => onAction("permanentDelete", product)}
        title="Permanent Delete"
        description="This action cannot be undone."
        itemName={product?.name}
        isLoading={isPermanentlyDeleting}
        type="danger"
        confirmText="Delete Permanently"
      />
    );
  }

  return null;
}
