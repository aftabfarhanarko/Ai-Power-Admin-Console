import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const CustomerDetailsHeader = ({
  customer,
  statusLabel,
  statusClasses,
  stats,
  isDeleting,
  onOpenDelete,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="rounded-2xl bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-700 dark:text-white"
            onClick={() => navigate("/customers")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
              {customer.name}
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${statusClasses}`}
              >
                {statusLabel}
              </span>
            </h1>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
              {t("customers.customerIdLabel")}:{" "}
              <span className="font-mono text-indigo-600 dark:text-indigo-400">
                {customer.id}
              </span>
              <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
              {t("customers.memberSince")}{" "}
              {new Date(customer.joinedDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">


          <Button
            variant="destructive"
            className="flex-1 md:flex-none h-11 rounded-xl font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20"
            disabled={isDeleting}
            onClick={onOpenDelete}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {isDeleting ? t("customers.deleting") : t("customers.delete")}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 pt-8 border-t border-gray-100 dark:border-gray-800">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className={`rounded-xl p-4 border ${stat.bg} ${stat.border} flex items-center gap-4`}
          >
            <div
              className={`p-3 rounded-lg bg-white dark:bg-black/20 ${stat.color}`}
            >
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p
                className={`text-xs font-bold uppercase tracking-wider opacity-70 ${stat.color}`}
              >
                {stat.label}
              </p>
              <p className={`text-2xl font-black ${stat.color}`}>
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomerDetailsHeader;

