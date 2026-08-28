import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import RichTextEditor from "@/components/input/RichTextEditor";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useCreateTermsConditionsMutation } from "@/features/terms-conditions/termsConditionsApiSlice";

function TermsConditionsForm({ onClose, onSuccess }) {
  const { t } = useTranslation();
  const termsConditionsSchema = useMemo(
    () =>
      yup.object().shape({
        content: yup
          .string()
          .required(t("termsConditions.validation.contentRequired"))
          .min(10, t("termsConditions.validation.contentMin")),
      }),
    [t]
  );
  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(termsConditionsSchema),
  });
  const [createTermsConditions, { isLoading: isCreating }] = useCreateTermsConditionsMutation();

  const onSubmit = async (data) => {
    const payload = {
      content: data.content,
    };

    const res = await createTermsConditions(payload);
    if (res?.data) {
      toast.success(t("termsConditions.createdSuccess"));
      reset();
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } else {
      toast.error(res?.error?.data?.message || t("termsConditions.createFailed"));
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("termsConditions.createTitle")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-4">
          <Controller
            name="content"
            control={control}
            render={({ field }) => (
              <RichTextEditor
                placeholder={t("termsConditions.contentPlaceholder")}
                value={field.value || ""}
                onChange={field.onChange}
                error={errors.content}
                height="400px"
              />
            )}
          />
          <DialogFooter>
            <Button
              variant="ghost"
              type="button"
              onClick={onClose}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={isCreating} className="bg-green-500 hover:bg-green-600 text-white">
              {isCreating ? t("common.creating") : t("common.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default TermsConditionsForm;
