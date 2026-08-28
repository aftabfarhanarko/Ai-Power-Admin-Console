import React, { useEffect, useMemo } from "react";
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
import { useUpdateTermsConditionsMutation } from "@/features/terms-conditions/termsConditionsApiSlice";

function TermsConditionsEditForm({ terms, onClose }) {
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
    defaultValues: {
      content: terms?.content || "",
    },
  });
  const [updateTermsConditions, { isLoading: isUpdating }] = useUpdateTermsConditionsMutation();

  useEffect(() => {
    if (terms) {
      reset({
        content: terms.content || "",
      });
    }
  }, [terms, reset]);

  const onSubmit = async (data) => {
    const payload = {
      content: data.content,
    };

    const res = await updateTermsConditions({ id: terms.id, ...payload });
    if (res?.data) {
      toast.success(t("termsConditions.updatedSuccess"));
      onClose();
    } else {
      toast.error(res?.error?.data?.message || t("termsConditions.updateFailed"));
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Terms & Conditions</DialogTitle>
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
            <Button type="submit" disabled={isUpdating} className="bg-green-500 hover:bg-green-600 text-white">
              {isUpdating ? t("common.updating") : t("common.update")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default TermsConditionsEditForm;

