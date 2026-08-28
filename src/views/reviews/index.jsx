import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import ReusableTable from "@/components/table/reusable-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useGetReviewsQuery,
  useCreateReviewMutation,
} from "@/features/reviews/reviewsApiSlice";
import { useGetProductsQuery } from "@/features/product/productApiSlice";
import { useGetUsersQuery } from "@/features/user/userApiSlice";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Star,
  MessageSquare,
  MessageCircle,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";

function ReviewsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const authUser = useSelector((state) => state.auth.user);
  const [createFormOpen, setCreateFormOpen] = useState(false);
  const [formValues, setFormValues] = useState({
    productId: "",
    rating: "",
    title: "",
    comment: "",
    userId: "",
  });
  const [createReview, { isLoading: isCreating }] = useCreateReviewMutation();
  const { data: reviews = [], isLoading } = useGetReviewsQuery(
    { companyId: authUser?.companyId },
    { skip: !authUser?.companyId },
  );
  const { data: products = [], isLoading: isLoadingProducts } =
    useGetProductsQuery(
      { companyId: authUser?.companyId },
      { skip: !authUser?.companyId },
    );
  const { data: users = [], isLoading: isLoadingUsers } = useGetUsersQuery(
    { companyId: authUser?.companyId },
    { skip: !authUser?.companyId },
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createReview({
        productId: Number(formValues.productId),
        rating: Number(formValues.rating),
        title: formValues.title,
        comment: formValues.comment,
        userId: formValues.userId ? Number(formValues.userId) : undefined,
      }).unwrap();
      setFormValues({
        productId: "",
        rating: "",
        title: "",
        comment: "",
        userId: "",
      });
      setCreateFormOpen(false);
    } catch (error) {
      // handle error silently for now; could add toast
      console.error("Failed to create review", error);
    }
  };

  // Calculate Stats
  const stats = useMemo(() => {
    const total = reviews.length;
    const pending = reviews.filter((r) => !r.reply).length;
    const replied = total - pending;
    const avgRating =
      total > 0
        ? (
            reviews.reduce((acc, curr) => acc + (curr.rating || 0), 0) / total
          ).toFixed(1)
        : "0.0";

    return [
      {
        label: t("reviews.totalReviews") || "Total Reviews",
        value: total,
        icon: MessageSquare,
        color: "text-blue-600",
        bg: "bg-blue-50 dark:bg-blue-900/20",
        border: "border-blue-200 dark:border-blue-800",
      },
      {
        label: t("reviews.avgRating") || "Average Rating",
        value: avgRating,
        icon: Star,
        color: "text-amber-600",
        bg: "bg-amber-50 dark:bg-amber-900/20",
        border: "border-amber-200 dark:border-amber-800",
      },
      {
        label: t("reviews.pendingReplies") || "Pending Replies",
        value: pending,
        icon: AlertCircle,
        color: "text-rose-600",
        bg: "bg-rose-50 dark:bg-rose-900/20",
        border: "border-rose-200 dark:border-rose-800",
      },
      {
        label: t("reviews.replied") || "Replied",
        value: replied,
        icon: CheckCircle2,
        color: "text-emerald-600",
        bg: "bg-emerald-50 dark:bg-emerald-900/20",
        border: "border-emerald-200 dark:border-emerald-800",
      },
    ];
  }, [reviews, t]);

  const headers = useMemo(
    () => [
      { header: "ID", field: "id" },
      { header: t("reviews.product"), field: "productName" },
      { header: t("reviews.customer"), field: "customerName" },
      { header: t("reviews.rating"), field: "rating" },
      { header: t("reviews.comment"), field: "comment" },
      { header: t("reviews.status"), field: "status" },
      { header: t("reviews.createdAt"), field: "createdAt" },
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
            {t("reviews.replied")}
          </span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            {t("reviews.pending")}
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
            <span className="sr-only">{t("common.view")}</span>
          </Button>
        ),
      })),
    [reviews, t, navigate],
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#0b0f14] p-6 lg:p-10 font-sans space-y-8">
      {/* --- Header --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">
            {t("reviews.title") || "Product Reviews"}
          </h1>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
            {t("reviews.subtitle") || "Manage and reply to customer feedback"}
          </p>
        </div>
        <Button
          type="button"
          onClick={() => setCreateFormOpen(true)}
          className="mt-2 md:mt-0 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg transition-all"
        >
          {t("reviews.addReview") || "Add Review"}
        </Button>
      </div>

      <Dialog open={createFormOpen} onOpenChange={setCreateFormOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white dark:bg-[#1a1f26] border-gray-100 dark:border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
              {t("reviews.createTitle") || "Create Review"}
            </DialogTitle>
          </DialogHeader>
          <form className="grid grid-cols-1 gap-4 mt-4" onSubmit={handleSubmit}>
            <div className="flex flex-col space-y-1">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("reviews.product") || "Product"}
              </Label>
              <Select
                value={formValues.productId}
                onValueChange={(value) =>
                  setFormValues((prev) => ({ ...prev, productId: value }))
                }
                disabled={isLoadingProducts}
              >
                <SelectTrigger className="h-10 bg-white dark:bg-[#111827] border-gray-300 dark:border-gray-700">
                  <SelectValue
                    placeholder={
                      isLoadingProducts
                        ? t("common.loading") || "Loading..."
                        : t("common.select") || "Select"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      <div className="flex items-center gap-2">
                        {(p.thumbnail || p.images?.[0]) && (
                          <img
                            src={p.thumbnail || p.images?.[0]}
                            alt=""
                            className="w-8 h-8 rounded-md object-cover border border-gray-200 dark:border-gray-700"
                          />
                        )}
                        <span className="truncate max-w-[300px]">{p.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col space-y-1">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Rating (1-5)
              </Label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() =>
                      setFormValues((prev) => ({ ...prev, rating: star }))
                    }
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        Number(formValues.rating) >= star
                          ? "fill-amber-400 text-amber-400"
                          : "fill-gray-100 text-gray-300 dark:fill-gray-800 dark:text-gray-700"
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                  {formValues.rating
                    ? `${formValues.rating} Stars`
                    : "Select rating"}
                </span>
              </div>
            </div>

            <div className="flex flex-col space-y-1">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("reviews.customer") || "Customer (optional)"}
              </Label>
              <Select
                value={formValues.userId}
                onValueChange={(value) =>
                  setFormValues((prev) => ({ ...prev, userId: value }))
                }
                disabled={isLoadingUsers}
              >
                <SelectTrigger className="h-10 bg-white dark:bg-[#111827] border-gray-300 dark:border-gray-700">
                  <SelectValue
                    placeholder={
                      isLoadingUsers
                        ? t("common.loading") || "Loading..."
                        : t("common.select") || "Select (optional)"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={String(u.id)}>
                      {u.name || u.fullName || `User #${u.id}`}{" "}
                      {u.email ? `(${u.email})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col space-y-1">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Title
              </Label>
              <Input
                type="text"
                name="title"
                value={formValues.title}
                onChange={handleChange}
                className="h-10 bg-white dark:bg-[#111827] border-gray-300 dark:border-gray-700"
                required
                placeholder="Review summary"
              />
            </div>

            <div className="flex flex-col space-y-1">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Comment
              </Label>
              <textarea
                name="comment"
                value={formValues.comment}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 rounded-md bg-white dark:bg-[#111827] border border-gray-300 dark:border-gray-700 text-sm outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-gray-400"
                placeholder="Detailed review..."
              />
            </div>

            <div className="flex items-center gap-3 justify-end mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateFormOpen(false)}
                className="border-gray-300 dark:border-gray-700"
              >
                {t("common.cancel") || "Cancel"}
              </Button>
              <Button
                type="submit"
                disabled={isCreating}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {isCreating
                  ? t("common.saving") || "Saving..."
                  : t("common.save") || "Save"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* --- Stats Grid --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`rounded-2xl p-5 border ${stat.bg} ${stat.border} flex flex-col justify-between h-32 relative overflow-hidden group`}
          >
            <div className="flex justify-between items-start z-10">
              <div>
                <p
                  className={`text-xs font-bold uppercase tracking-wider opacity-70 ${stat.color}`}
                >
                  {stat.label}
                </p>
                <h3 className={`text-3xl font-black mt-2 ${stat.color}`}>
                  {stat.value}
                </h3>
              </div>
              <div
                className={`p-2.5 rounded-xl bg-white/50 dark:bg-black/20 backdrop-blur-sm ${stat.color}`}
              >
                <stat.icon className="w-5 h-5" />
              </div>
            </div>

            {/* Decorative background element */}
            <stat.icon
              className={`absolute -bottom-4 -right-4 w-24 h-24 opacity-10 rotate-12 ${stat.color} transition-transform group-hover:scale-110 duration-500`}
            />
          </motion.div>
        ))}
      </div>

      {/* --- Reviews Table --- */}
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
          {/* Add filter/export actions here if needed */}
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
    </div>
  );
}

export default ReviewsPage;
