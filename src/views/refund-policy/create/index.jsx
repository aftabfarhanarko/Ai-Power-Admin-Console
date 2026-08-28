import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, RefreshCcw, FileText, Info, AlertCircle } from "lucide-react";
import RichTextEditor from "@/components/input/RichTextEditor";
import { useCreateRefundPolicyMutation } from "@/features/refund-policy/refundPolicyApiSlice";
import { motion } from "framer-motion";

function CreateRefundPolicyPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const refundPolicySchema = useMemo(
        () =>
            yup.object().shape({
                content: yup
                    .string()
                    .required(t("refundPolicy.validation.contentRequired"))
                    .min(10, t("refundPolicy.validation.contentMin")),
            }),
        [t]
    );
    const { control, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: yupResolver(refundPolicySchema),
    });
    const [createRefundPolicy, { isLoading: isCreating }] = useCreateRefundPolicyMutation();

    const onSubmit = async (data) => {
        try {
            const payload = {
                content: data.content,
            };

            // API slice expects an object with `body` and optional `params`
            const res = await createRefundPolicy({ body: payload }).unwrap();
            if (res) {
                toast.success(t("refundPolicy.createdSuccess"));
                reset();
                navigate("/refund-policy");
            }
        } catch (error) {
            toast.error(error?.data?.message || error?.message || t("refundPolicy.createFailed"));
        }
    };

    return (
        <div className="min-h-screen pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <span
                            onClick={() => navigate("/refund-policy")}
                            className="cursor-pointer hover:text-indigo-500 transition-colors"
                        >
                            {t("refundPolicy.title")}
                        </span>
                        <span>/</span>
                        <span className="text-indigo-500 font-medium">
                            {t("refundPolicy.create")}
                        </span>
                    </div>
                    <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 dark:from-indigo-400 dark:via-violet-400 dark:to-purple-400 drop-shadow-sm">
                        {t("refundPolicy.createTitle")}
                    </h1>
                    <p className="text-gray-500 mt-2 text-lg">
                        {t("refundPolicy.createDesc")}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={() => navigate("/refund-policy")}
                        className="rounded-xl h-12 px-6 border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 transition-all duration-300"
                    >
                        {t("common.cancel")}
                    </Button>
                    <Button
                        onClick={handleSubmit(onSubmit)}
                        disabled={isCreating}
                        className="rounded-xl h-12 px-8 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30 transition-all duration-300 transform hover:-translate-y-0.5"
                    >
                        {isCreating ? (
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>{t("common.creating")}</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Save className="w-5 h-5" />
                                <span>{t("common.create")}</span>
                            </div>
                        )}
                    </Button>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Column */}
                <div className="lg:col-span-2 space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-[#1a1f26] rounded-[24px] overflow-hidden border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-100/50 dark:shadow-black/20"
                    >
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-black/20 flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                                <FileText className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-lg">
                                {t("refundPolicy.contentSectionTitle")}
                            </h3>
                        </div>
                        <div className="p-6">
                            <Controller
                                name="content"
                                control={control}
                                render={({ field }) => (
                                    <RichTextEditor
                                        placeholder={t("refundPolicy.contentPlaceholder")}
                                        value={field.value || ""}
                                        onChange={field.onChange}
                                        error={errors.content}
                                        height="500px"
                                        className="prose dark:prose-invert max-w-none"
                                    />
                                )}
                            />
                        </div>
                    </motion.div>
                </div>

                {/* Sidebar Column */}
                <div className="lg:col-span-1 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white dark:bg-[#1a1f26] rounded-[24px] p-6 border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-100/50 dark:shadow-black/20 sticky top-6"
                    >
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Info className="w-5 h-5 text-indigo-500" />
                            {t("refundPolicy.helpTipsTitle")}
                        </h3>
                        
                        <div className="space-y-4">
                            <div className="bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl p-4 border border-indigo-100 dark:border-indigo-900/20">
                                <h4 className="font-semibold text-indigo-700 dark:text-indigo-400 mb-2 text-sm">
                                    {t("refundPolicy.helpWhatToIncludeTitle")}
                                </h4>
                                <ul className="text-xs text-indigo-600/80 dark:text-indigo-400/70 space-y-2 list-disc pl-4">
                                    <li>{t("refundPolicy.helpWhatToInclude1")}</li>
                                    <li>{t("refundPolicy.helpWhatToInclude2")}</li>
                                    <li>{t("refundPolicy.helpWhatToInclude3")}</li>
                                    <li>{t("refundPolicy.helpWhatToInclude4")}</li>
                                    <li>{t("refundPolicy.helpWhatToInclude5")}</li>
                                </ul>
                            </div>

                            <div className="bg-orange-50 dark:bg-orange-900/10 rounded-2xl p-4 border border-orange-100 dark:border-orange-900/20">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertCircle className="w-4 h-4 text-orange-500" />
                                    <span className="font-bold text-orange-700 dark:text-orange-400 text-sm">
                                        {t("refundPolicy.legalDisclaimerTitle")}
                                    </span>
                                </div>
                                <p className="text-xs text-orange-600/80 dark:text-orange-400/70">
                                    {t("refundPolicy.legalDisclaimerText")}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </form>
        </div>
    );
}

export default CreateRefundPolicyPage;
