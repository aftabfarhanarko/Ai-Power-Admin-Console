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
import { useCreatePrivacyPolicyMutation } from "@/features/privacy-policy/privacyPolicyApiSlice";

function PrivacyPolicyForm({ onClose, onSuccess }) {
    const { t } = useTranslation();
    const privacyPolicySchema = useMemo(
        () =>
            yup.object().shape({
                content: yup
                    .string()
                    .required(t("privacyPolicy.validation.contentRequired"))
                    .min(10, t("privacyPolicy.validation.contentMin")),
            }),
        [t]
    );
    const { control, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: yupResolver(privacyPolicySchema),
    });
    const [createPrivacyPolicy, { isLoading: isCreating }] = useCreatePrivacyPolicyMutation();

    const onSubmit = async (data) => {
        try {
            const payload = {
                content: data.content,
            };

            const res = await createPrivacyPolicy(payload).unwrap();
            if (res) {
                toast.success(t("privacyPolicy.createdSuccess"));
                reset();
                if (onSuccess) onSuccess();
                if (onClose) onClose();
            }
        } catch (error) {
            toast.error(error?.data?.message || error?.message || t("privacyPolicy.createFailed"));
        }
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{t("privacyPolicy.createTitle")}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-4">
                    <Controller
                        name="content"
                        control={control}
                        render={({ field }) => (
                            <RichTextEditor
                                placeholder={t("privacyPolicy.contentPlaceholder")}
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

export default PrivacyPolicyForm;
