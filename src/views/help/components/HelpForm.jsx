import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import TextField from "@/components/input/TextField";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useCreateHelpMutation } from "@/features/help/helpApiSlice";

function HelpForm() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const helpSchema = useMemo(
    () =>
      yup.object().shape({
        email: yup
          .string()
          .required(t("help.validation.emailRequired"))
          .email(t("help.validation.emailInvalid"))
          .trim(),
        issue: yup
          .string()
          .required(t("help.validation.issueRequired"))
          .min(10, t("help.validation.issueMin"))
          .max(500, t("help.validation.issueMax"))
          .trim(),
      }),
    [t]
  );
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(helpSchema),
    mode: "onChange",
  });
  const [createHelp, { isLoading: isCreating }] = useCreateHelpMutation();

  const onSubmit = async (data) => {
    const payload = {
      email: data.email,
      issue: data.issue,
    };

    const res = await createHelp(payload);
    if (res?.data) {
      toast.success(t("help.ticketCreated"));
      reset();
      setIsOpen(false);
    } else {
      toast.error(res?.error?.data?.message || t("help.ticketFailed"));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm">{t("help.createTicket")}</Button>
      </DialogTrigger>
      <DialogContent className="h-[450px]">
        <DialogHeader>
          <DialogTitle>{t("help.createHelpTicket")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 mt-4">
          {/* Contact Information Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
              <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
                {t("help.contactInformation")}
              </h3>
            </div>
            <TextField 
              label={t("help.yourEmail")} 
              placeholder={t("help.emailPlaceholder")} 
              type="email" 
              register={register} 
              name="email" 
              error={errors.email?.message}
            />
          </div>

          {/* Issue Description Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
              <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
                {t("help.issueDetails")}
              </h3>
            </div>
            <TextField 
              label={t("help.issueDescription")} 
              placeholder={t("help.issuePlaceholder")} 
              multiline 
              rows={4} 
              register={register} 
              name="issue" 
              error={errors.issue?.message}
            />
          </div>
          <DialogFooter>
            <div className="flex items-center w-full justify-end gap-2">
              <Button className="btn-cancel" variant="ghost" type="button" onClick={() => setIsOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button className="btn-submit" type="submit" disabled={isCreating}>
                {isCreating ? t("common.creating") : t("common.create")}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog >
  );
}

export default HelpForm;