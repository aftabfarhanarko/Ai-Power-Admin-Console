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
import { useUpdatePrivacyPolicyMutation } from "@/features/privacy-policy/privacyPolicyApiSlice";

function PrivacyPolicyEditForm({ policy, onClose }) {
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
        defaultValues: {
            content: policy?.content || "",
        },
    });
    const [updatePrivacyPolicy, { isLoading: isUpdating }] = useUpdatePrivacyPolicyMutation();

    useEffect(() => {
        if (policy) {
            reset({
                content: policy.content || "",
            });
        }
    }, [policy, reset]);

    const onSubmit = async (data) => {
        const payload = {
            content: data.content,
        };

        const res = await updatePrivacyPolicy({ id: policy.id, ...payload });
        if (res?.data) {
            toast.success(t("privacyPolicy.updatedSuccess"));
            onClose();
        } else {
            toast.error(res?.error?.data?.message || t("privacyPolicy.updateFailed"));
        }
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{t("privacyPolicy.editTitle")}</DialogTitle>
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
                        <Button type="submit" disabled={isUpdating} className="bg-green-500 hover:bg-green-600 text-white">
                            {isUpdating ? t("common.updating") : t("common.update")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default PrivacyPolicyEditForm;

