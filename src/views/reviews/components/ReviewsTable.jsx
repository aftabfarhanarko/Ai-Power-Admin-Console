import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, MessageSquare, MessageCircle } from "lucide-react";
import ReusableTable from "@/components/table/reusable-table";
import { Button } from "@/components/ui/button";

const ReviewsTable = ({ reviews, isLoading }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const headers = useMemo(
    () => [
      { header: "ID", field: "id" },
      { header: t("reviews.product") || "Product", field: "productName" },
      { header: t("reviews.customer") || "Customer", field: "customerName" },
      { header: t("reviews.rating") || "Rating", field: "rating" },
      { header: t("reviews.comment") || "Comment", field: "comment" },
      { header: t("reviews.status") || "Status", field: "status" },
      { header: t("reviews.createdAt") || "Created", field: "createdAt" },
      {
        header: t("common.actions") || "Actions",
        field: "actions",
        sortable: false,
      },
    ],
    [t],
  );

  const tableData = useMemo(
    () =>
      reviews.map((review) => ({
        id: (
          <span className="font-mono text-xs text-gray-500">#{review.id}</span>
        ),
        productName: (
          <div className="font-medium text-gray-900 dark:text-white">
            {review.product?.name ?? "-"}
          </div>
        ),
        customerName: (
          <div className="flex flex-col">
            <span className="font-medium text-sm text-gray-900 dark:text-white">
              {review.user?.name ?? "Guest"}
            </span>
            <span className="text-xs text-gray-500">
              {review.user?.email ?? ""}
            </span>
          </div>
        ),
        rating: (
          <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-md w-fit border border-amber-100 dark:border-amber-800">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-sm font-bold text-amber-700 dark:text-amber-400">
              {review.rating}
            </span>
          </div>
        ),
        comment: (
          <div
            className="max-w-[300px] truncate text-sm text-gray-600 dark:text-gray-300"
            title={review.comment}
          >
            {review.comment || "-"}
          </div>
        ),
        status: review.reply ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            {t("reviews.replied") || "Replied"}
          </span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            {t("reviews.pending") || "Pending"}
          </span>
        ),
        createdAt: review.createdAt
          ? new Date(review.createdAt).toLocaleDateString()
          : "-",
        actions: (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/reviews/${review.id}`)}
            className="h-8 w-8 p-0 rounded-full hover:bg-gray-100 dark:hover:bg-white/10"
          >
            <MessageCircle className="w-4 h-4 text-gray-500" />
            <span className="sr-only">View</span>
          </Button>
        ),
      })),
    [reviews, t, navigate],
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="rounded-[24px] bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden"
    >
      <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-indigo-500" />
          Recent Reviews
        </h2>
      </div>
      <div className="p-2">
        <ReusableTable
          data={tableData}
          headers={headers}
          total={reviews.length}
          isLoading={isLoading}
          py="py-4"
        />
      </div>
    </motion.div>
  );
};

export default ReviewsTable;

