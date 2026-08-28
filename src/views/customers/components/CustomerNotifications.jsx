import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Mail, MessageSquare, Send } from "lucide-react";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import TextField from "@/components/input/TextField";
import RichTextEditor from "@/components/input/RichTextEditor";
import {
    useSendCustomerEmailNotificationMutation,
    useSendCustomerSmsNotificationMutation,
} from "@/features/notifications/notificationsApiSlice";
import { hasPermission, FeaturePermission } from "@/constants/feature-permission";

function CustomerNotifications() {
    const { t } = useTranslation();
    const { user } = useSelector((state) => state.auth);
    const [isEmailOpen, setIsEmailOpen] = useState(false);
    const [isSmsOpen, setIsSmsOpen] = useState(false);

    const hasEmailPermission = hasPermission(user, FeaturePermission.EMAIL_CONFIGURATION);
    const hasSmsPermission = hasPermission(user, FeaturePermission.SMS_CONFIGURATION);

    const {
        register: registerEmail,
        control: controlEmail,
        handleSubmit: handleEmailSubmit,
        reset: resetEmailForm,
        formState: { errors: emailErrors },
    } = useForm({
        defaultValues: {
            subject: "",
            body: "",
            html: "",
        },
    });

    const {
        register: registerSms,
        handleSubmit: handleSmsSubmit,
        reset: resetSmsForm,
        formState: { errors: smsErrors },
    } = useForm({
        defaultValues: {
            message: "",
        },
    });

    const [sendEmail, { isLoading: isSendingEmail }] =
        useSendCustomerEmailNotificationMutation();
    const [sendSms, { isLoading: isSendingSms }] =
        useSendCustomerSmsNotificationMutation();

    const onEmailSubmit = async (values) => {
        const html = values.html?.trim();
        const payload = {
            subject: values.subject.trim(),
            body: values.body.trim(),
            ...(html ? { html } : {}),
        };

        try {
            const res = await sendEmail(payload).unwrap();
            toast.success(
                res?.message || t("customers.notifications.emailSuccessFallback"),
            );
            resetEmailForm();
            setIsEmailOpen(false);
        } catch (error) {
            toast.error(
                error?.data?.message ||
                    t("customers.notifications.emailFailedFallback"),
            );
        }
    };

    const onSmsSubmit = async (values) => {
        const payload = {
            message: values.message.trim(),
        };

        try {
            const res = await sendSms(payload).unwrap();
            toast.success(
                res?.message || t("customers.notifications.smsSuccessFallback"),
            );
            resetSmsForm();
            setIsSmsOpen(false);
        } catch (error) {
            toast.error(
                error?.data?.message ||
                    t("customers.notifications.smsFailedFallback"),
            );
        }
    };

    return (
        <div className="flex items-center gap-2">
            {hasEmailPermission && (
                <Dialog open={isEmailOpen} onOpenChange={setIsEmailOpen}>
                    <DialogTrigger asChild>
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-14 flex items-center gap-2 rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111827] text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-900"
                        >
                            <Mail className="w-4 h-4" />
                            <span>{t("customers.notifications.emailBroadcast")}</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-xl h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>
                                {t("customers.notifications.broadcastEmailTitle")}
                            </DialogTitle>
                        </DialogHeader>
                        <form
                            onSubmit={handleEmailSubmit(onEmailSubmit)}
                            className="flex flex-col gap-4 mt-4"
                        >
                            <TextField
                                label={t("customers.notifications.subjectLabel")}
                                placeholder={t(
                                    "customers.notifications.subjectPlaceholder",
                                )}
                                register={registerEmail}
                                name="subject"
                                error={emailErrors.subject}
                                registerOptions={{
                                    required:
                                        t(
                                            "customers.notifications.subjectRequired",
                                        ),
                                }}
                            />
                            <TextField
                                label={t("customers.notifications.bodyLabel")}
                                placeholder={t(
                                    "customers.notifications.bodyPlaceholder",
                                )}
                                register={registerEmail}
                                name="body"
                                error={emailErrors.body}
                                multiline
                                rows={4}
                                registerOptions={{
                                    required:
                                        t("customers.notifications.bodyRequired"),
                                }}
                            />
                            <Controller
                                name="html"
                                control={controlEmail}
                                render={({ field }) => (
                                    <RichTextEditor
                                        label={t(
                                            "customers.notifications.htmlLabel",
                                        )}
                                        placeholder={t(
                                            "customers.notifications.htmlPlaceholder",
                                        )}
                                        value={field.value || ""}
                                        onChange={field.onChange}
                                        height="300px"
                                    />
                                )}
                            />
                            <DialogFooter className="gap-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="bg-red-600 hover:bg-red-700 text-white dark:bg-red-600 dark:hover:bg-red-700"
                                    onClick={() => {
                                        resetEmailForm();
                                        setIsEmailOpen(false);
                                    }}
                                    disabled={isSendingEmail}
                                >
                                    {t("customers.notifications.cancel")}
                                </Button>
                                <Button
                                    variant="outline"
                                    type="submit"
                                    className="h-14 px-6 rounded-2xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1f26] font-bold flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50"
                                    disabled={isSendingEmail}
                                >
                                    <Send className="w-4 h-4" />
                                    <span>
                                        {isSendingEmail
                                            ? t("customers.notifications.sending")
                                            : t("customers.notifications.sendEmail")}
                                    </span>
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            )}

            {hasSmsPermission && (
                <Dialog open={isSmsOpen} onOpenChange={setIsSmsOpen}>
                    <DialogTrigger asChild>
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-14 flex items-center gap-2 rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111827] text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-900"
                        >
                            <MessageSquare className="w-4 h-4" />
                            <span>{t("customers.notifications.smsBroadcast")}</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-xl h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>
                                {t("customers.notifications.broadcastSmsTitle")}
                            </DialogTitle>
                        </DialogHeader>
                        <form
                            onSubmit={handleSmsSubmit(onSmsSubmit)}
                            className="flex flex-col gap-4 mt-4"
                        >
                            <div className="space-y-1">
                                <TextField
                                    label={t("customers.notifications.messageLabel")}
                                    placeholder={t(
                                        "customers.notifications.messagePlaceholder",
                                    )}
                                    register={registerSms}
                                    name="message"
                                    error={smsErrors.message}
                                    multiline
                                    rows={4}
                                    maxLength={480}
                                    registerOptions={{
                                        required: t(
                                            "customers.notifications.messageRequired",
                                        ),
                                        maxLength: {
                                            value: 480,
                                            message: t(
                                                "customers.notifications.messageMaxLength",
                                            ),
                                        },
                                    }}
                                />
                                <p className="text-xs text-black/50 dark:text-white/50">
                                    {t("customers.notifications.messageMaxHint")}
                                </p>
                            </div>
                            <DialogFooter className="gap-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="bg-red-600 hover:bg-red-700 text-white dark:bg-red-600 dark:hover:bg-red-700"
                                    onClick={() => {
                                        resetSmsForm();
                                        setIsSmsOpen(false);
                                    }}
                                    disabled={isSendingSms}
                                >
                                    {t("customers.notifications.cancel")}
                                </Button>
                                <Button
                                    variant="outline"
                                    type="submit"
                                    className="h-14 px-6 rounded-2xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1f26] font-bold flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50"
                                    disabled={isSendingSms}
                                >
                                    {isSendingSms
                                        ? t("customers.notifications.sending")
                                        : t("customers.notifications.sendSms")}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}

export default CustomerNotifications;

