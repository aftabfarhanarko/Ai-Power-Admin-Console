import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  useGetReviewByIdQuery,
  useReplyReviewMutation,
} from "@/features/reviews/reviewsApiSlice";
import { Button } from "@/components/ui/button";
import { useSelector } from "react-redux";
import { 
  ArrowLeft, 
  Send, 
  Star, 
  MessageSquare, 
  User, 
  Package, 
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Mail
} from "lucide-react";
import { motion } from "framer-motion";

const ReviewDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const authUser = useSelector((state) => state.auth.user);

  const [replyText, setReplyText] = useState("");

  const { data: review, isLoading, refetch } = useGetReviewByIdQuery(
    { id: Number(id), companyId: authUser?.companyId },
    { skip: !id || !authUser?.companyId }
  );
  const [addReply, { isLoading: isReplying }] = useReplyReviewMutation();

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !review?.id) return;
    try {
      await addReply({
        id: review.id,
        body: { reply: replyText.trim() },
      }).unwrap();
      setReplyText("");
      refetch();
    } catch (err) {
      console.error("Failed to reply:", err);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {t("reviews.notFound") || "Review Not Found"}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">
          {t("reviews.detailSubtitle")}
        </p>
        <Button onClick={() => navigate("/reviews")} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t("common.backToReviews")}
        </Button>
      </div>
    );
  }

  return (
    <motion.div 
      className="max-w-7xl mx-auto space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/reviews")}
            className="pl-0 hover:bg-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("common.back")}
          </Button>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">
            {t("reviews.detailTitle")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            #{review.id} • {new Date(review.createdAt).toLocaleDateString()}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className={`px-4 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2 ${
            review.reply 
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" 
              : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
          }`}>
            {review.reply ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                {t("reviews.statusReplied")}
              </>
            ) : (
              <>
                <Clock className="w-4 h-4" />
                {t("reviews.statusPending")}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Review Content */}
        <motion.div className="lg:col-span-2 space-y-6" variants={itemVariants}>
          {/* Main Review Card */}
          <div className="bg-white dark:bg-[#1a1f26] rounded-[24px] p-8 border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-100/50 dark:shadow-black/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-bl-[100px] pointer-events-none" />
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {review.user?.name?.[0] || "G"}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {review.user?.name || t("reviews.guestUser")}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                      <Mail className="w-3.5 h-3.5" />
                      {review.user?.email || t("reviews.noEmailProvided")}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-6 h-6 ${
                          star <= review.rating
                            ? "fill-amber-400 text-amber-400"
                            : "fill-gray-200 text-gray-200 dark:fill-gray-800 dark:text-gray-800"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {t("reviews.ratingSummary", { rating: review.rating })}
                  </span>
                </div>
              </div>

              <div className="mb-8">
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
                  {t("reviews.customerFeedback")}
                </h4>
                {review.title && (
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                    {review.title}
                  </h3>
                )}
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap text-lg">
                    "{review.comment}"
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <Package className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                      {t("reviews.productLabel")}
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {review.product?.name || t("common.unknown")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                      {t("reviews.dateLabel")}
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Reply Action */}
        <motion.div className="lg:col-span-1 space-y-6" variants={itemVariants}>
          <div className="bg-white dark:bg-[#1a1f26] rounded-[24px] p-6 border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-100/50 dark:shadow-black/20 sticky top-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                <MessageSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {t("reviews.response")}
              </h3>
            </div>

            {review.reply ? (
              <div className="bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl p-5 border border-emerald-100 dark:border-emerald-900/30 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                    {t("reviews.responseSent")}
                  </span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-3">
                  {review.reply}
                </p>
                <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70">
                  {t("reviews.updatedAt")}:{" "}
                  {new Date(review.updatedAt).toLocaleString()}
                </p>
              </div>
            ) : (
              <div className="bg-amber-50/50 dark:bg-amber-900/10 rounded-2xl p-4 border border-amber-100 dark:border-amber-900/30 mb-6 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                    {t("reviews.actionRequired")}
                  </h4>
                  <p className="text-xs text-amber-700/80 dark:text-amber-400/80 mt-1">
                    {t("reviews.actionRequiredDesc")}
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleReply} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">
                  {review.reply
                    ? t("reviews.updateReply")
                    : t("reviews.sendReply")}
                </label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={
                    review.reply
                      ? (t("reviews.updateReplyPlaceholder") || "Update your reply...")
                      : t("reviews.replyPlaceholder")
                  }
                  rows={6}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black/20 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                  disabled={isReplying}
                />
              </div>
              <Button
                type="submit"
                className="w-full h-11 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-lg shadow-indigo-500/20"
                disabled={isReplying || !replyText.trim()}
              >
                {isReplying ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    {t("common.sending")}
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    {review.reply
                      ? t("reviews.updateReply")
                      : t("reviews.sendReply")}
                  </>
                )}
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ReviewDetailPage;
