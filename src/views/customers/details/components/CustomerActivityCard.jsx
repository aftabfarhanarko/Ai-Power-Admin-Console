import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Clock, CheckCircle2, FileText, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

const buildActivityItems = (recentOrders) =>
  recentOrders.map((order) => {
    const status = (order.status || "").toLowerCase();
    const createdAt = order.createdAt
      ? new Date(order.createdAt).toLocaleString()
      : "";

    let icon = FileText;
    let color = "text-indigo-500 bg-indigo-50";

    if (status === "paid" || status === "delivered") {
      icon = CheckCircle2;
      color = "text-emerald-500 bg-emerald-50";
    } else if (status === "cancelled" || status === "refunded") {
      icon = ShieldAlert;
      color = "text-rose-500 bg-rose-50";
    } else if (status === "processing" || status === "shipped") {
      icon = Clock;
      color = "text-blue-500 bg-blue-50";
    }

    return {
      title: `Order #${order.id} ${status || ""}`.trim(),
      date: createdAt,
      icon,
      color,
    };
  });

const CustomerActivityCard = ({ recentOrders }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const activityItems = useMemo(
    () => buildActivityItems(recentOrders),
    [recentOrders],
  );

  return (
    <div className="bg-white dark:bg-[#1a1f26] rounded-[24px] p-6 md:p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
      <div className="flex items-center gap-3 mb-8">
        <Clock className="w-5 h-5 text-purple-500" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          {t("customers.recentActivity")}
        </h3>
      </div>
      <div className="space-y-8 relative pl-2">
        <div className="absolute left-[19px] top-2 bottom-2 w-px bg-gray-100 dark:bg-gray-800" />
        {activityItems.length === 0 ? (
          <p className="text-xs font-medium text-gray-400">
            {t("customers.noRecentActivity")}
          </p>
        ) : (
          activityItems.map((act, idx) => (
            <div key={idx} className="relative flex items-start gap-5">
              <div
                className={`z-10 w-10 h-10 rounded-full flex items-center justify-center border-4 border-white dark:border-[#1a1f26] shadow-sm ${act.color}`}
              >
                <act.icon className="w-4 h-4" />
              </div>
              <div className="pt-1">
                <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                  {act.title}
                </p>
                <p className="text-xs font-medium text-gray-400 mt-1 flex items-center gap-1.5">
                  {act.date}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
      <Button
        variant="ghost"
        className="w-full mt-8 text-xs font-bold uppercase text-gray-400 tracking-widest hover:text-indigo-600"
        onClick={() => navigate("/orders")}
      >
        {t("customers.viewFullHistory")}
      </Button>
    </div>
  );
};

export default CustomerActivityCard;

