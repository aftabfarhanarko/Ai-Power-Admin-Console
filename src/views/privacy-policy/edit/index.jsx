import React, { useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  useGetPrivacyPoliciesQuery,
  useUpdatePrivacyPolicyMutation,
} from "../../../features/privacy-policy/privacyPolicyApiSlice";
import AtomLoader from "../../../components/loader/AtomLoader";
import toast from "react-hot-toast";
import RichTextEditor from "../../../components/input/RichTextEditor";
import { motion } from "framer-motion";
import {
  Save,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  History,
  Shield,
  Lightbulb,
  Clock,
} from "lucide-react";

const EditPrivacyPolicy = () => {
  const { t } = useTranslation();
  const schema = useMemo(
    () =>
      yup.object().shape({
        content: yup.string().required(t("privacyPolicy.validation.contentRequired")),
        isActive: yup.boolean(),
      }),
    [t],
  );

  const navigate = useNavigate();
  const authUser = useSelector((state) => state.auth.user);
  const { data: policies = [], isLoading: isFetching } = useGetPrivacyPoliciesQuery({ companyId: authUser?.companyId });
  const latestPolicy = policies && policies.length > 0 ? policies[0] : null;
  const [updatePrivacyPolicy, { isLoading: isUpdating }] = useUpdatePrivacyPolicyMutation();

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      content: "",
      isActive: true,
    },
  });

  const isActive = watch("isActive");

  useEffect(() => {
    if (latestPolicy) {
      reset({
        content: latestPolicy.content || "",
        isActive: latestPolicy.isActive ?? true,
      });
    }
  }, [latestPolicy, reset]);

  const onSubmit = async (data) => {
    try {
      if (!latestPolicy?.id && !latestPolicy?._id) {
        toast.error(t("privacyPolicy.noPolicyFoundToUpdate"));
        return;
      }
      const id = latestPolicy.id || latestPolicy._id;
      await updatePrivacyPolicy({ id, body: data }).unwrap();
      toast.success(t("privacyPolicy.updatedSuccess"));
      navigate("/privacy-policy");
    } catch (error) {
      toast.error(error.data?.message || t("privacyPolicy.updateFailed"));
    }
  };

  if (isFetching) return <div className="flex justify-center items-center h-screen"><AtomLoader /></div>;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } },
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black p-4 md:p-8 font-sans text-gray-900 dark:text-gray-100">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-7xl mx-auto space-y-8"
      >
        {/* Header Section */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mt-2">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                <Shield className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 dark:from-indigo-400 dark:via-violet-400 dark:to-purple-400 drop-shadow-sm">
                  {t("privacyPolicy.editTitle")}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 font-medium">
                  {t("privacyPolicy.editDesc")}
                </p>
              </div>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/privacy-policy")}
            className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("privacyPolicy.backToOverview")}
          </motion.button>
        </motion.div>

        {/* No Policy Found State */}
        {!latestPolicy && !isFetching && (
           <motion.div variants={itemVariants} className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-800 text-center">
             <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
             <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
               {t("privacyPolicy.noPolicyFoundTitle")}
             </h3>
             <p className="text-gray-600 dark:text-gray-400 mb-4">
               {t("privacyPolicy.noPolicyFoundShortDesc")}
             </p>
             <button
                onClick={() => navigate("/privacy-policy/create")}
                className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
             >
               {t("privacyPolicy.createNewPolicy")}
             </button>
           </motion.div>
        )}

        {latestPolicy && (
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content Column */}
            <div className="lg:col-span-2 space-y-8">
              <motion.div variants={itemVariants} className="bg-white dark:bg-gray-900 rounded-[24px] p-6 md:p-8 shadow-xl border border-gray-100 dark:border-gray-800/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 dark:bg-indigo-900/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
                
                <div className="flex items-center gap-2 mb-6 relative z-10">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
                    {t("privacyPolicy.policyContentTitle")}
                  </h2>
                </div>

                <div className="space-y-6 relative z-10">
                  {/* RichTextEditor */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      {t("privacyPolicy.legalText")}
                    </label>
                    <div className={`rounded-xl overflow-hidden border ${errors.content ? "border-red-500" : "border-gray-200 dark:border-gray-700"} shadow-sm`}>
                      <Controller
                        name="content"
                        control={control}
                        render={({ field }) => (
                          <RichTextEditor
                            placeholder={t("privacyPolicy.contentPlaceholder")}
                            value={field.value || ""}
                            onChange={field.onChange}
                            error={errors.content}
                            height="500px"
                          />
                        )}
                      />
                    </div>
                    {errors.content && (
                      <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4 shrink-0" /> {errors.content.message}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Sidebar Column */}
            <div className="lg:col-span-1 space-y-6">
              {/* Status Card */}
              <motion.div variants={itemVariants} className="bg-white dark:bg-gray-900 rounded-[24px] p-6 shadow-xl border border-gray-100 dark:border-gray-800/50 sticky top-6">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                  {t("privacyPolicy.publishingStatus")}
                </h3>
                
                <div className="space-y-4">
                  {/* Active Toggle */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-black/20 rounded-2xl border border-gray-100 dark:border-gray-800">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-700 dark:text-gray-200">
                        {t("privacyPolicy.activeStatus")}
                      </span>
                      <span className="text-xs text-gray-500">
                        {t("privacyPolicy.visibleToPublic")}
                      </span>
                    </div>
                    <Controller
                      name="isActive"
                      control={control}
                      render={({ field }) => (
                        <button
                          type="button"
                          onClick={() => field.onChange(!field.value)}
                          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                            field.value ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-700"
                          }`}
                        >
                          <span
                            className={`${
                              field.value ? "translate-x-6" : "translate-x-1"
                            } inline-block h-5 w-5 transform rounded-full bg-white transition-transform`}
                          />
                        </button>
                      )}
                    />
                  </div>

                  {/* Metadata */}
                  <div className="bg-gray-50 dark:bg-black/20 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 space-y-3">
                     <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
                           <History className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                           <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">
                             {t("privacyPolicy.currentVersion")}
                           </p>
                           <p className="text-sm font-bold text-gray-800 dark:text-white">
                             v{latestPolicy.version || t("common.na")}
                           </p>
                        </div>
                     </div>
                     <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                           <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                           <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">
                             {t("privacyPolicy.lastModified")}
                           </p>
                           <p className="text-sm font-bold text-gray-800 dark:text-white">
                             {latestPolicy.updatedAt ? new Date(latestPolicy.updatedAt).toLocaleDateString() : t("privacyPolicy.never")}
                           </p>
                        </div>
                     </div>
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isUpdating}
                    className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                  >
                    {isUpdating ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>{t("common.updating")}</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        <span>{t("privacyPolicy.updatePolicy")}</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>

              {/* Best Practices Card */}
              <motion.div variants={itemVariants} className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-[24px] p-6 border border-indigo-100 dark:border-indigo-800/30">
                <h4 className="font-bold text-indigo-900 dark:text-indigo-100 mb-3 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-500 shrink-0" />
                  {t("privacyPolicy.bestPractices")}
                </h4>
                <ul className="space-y-3 text-sm text-indigo-800 dark:text-indigo-200">
                  <li className="flex gap-2">
                    <span className="text-indigo-500">•</span>
                    <span>{t("privacyPolicy.bestPractice1")}</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-indigo-500">•</span>
                    <span>{t("privacyPolicy.bestPractice2")}</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-indigo-500">•</span>
                    <span>{t("privacyPolicy.bestPractice3")}</span>
                  </li>
                </ul>
              </motion.div>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default EditPrivacyPolicy;
