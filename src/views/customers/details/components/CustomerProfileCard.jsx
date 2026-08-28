import React from "react";
import { useTranslation } from "react-i18next";
import { User, Mail, Phone, MapPin, Globe } from "lucide-react";

const CustomerProfileCard = ({ customer }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white dark:bg-[#1a1f26] rounded-[24px] overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm">
      <div className="p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <User className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {t("customers.personalInformation")}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-2xl bg-gray-100 dark:bg-white/5 overflow-hidden border border-gray-200 dark:border-gray-700">
                <img
                  src={customer.avatar}
                  alt={customer.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white text-lg">
                  {customer.name}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {customer.role === "admin"
                    ? t("customers.roleAdmin")
                    : t("customers.roleCustomer")}{" "}
                  • {customer.district}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">
                  {t("customers.emailLabel")}
                </label>
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                  <Mail className="w-4 h-4 text-indigo-500" />
                  {customer.email}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">
                  {t("customers.phoneLabel")}
                </label>
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                  <Phone className="w-4 h-4 text-indigo-500" />
                  {customer.phone}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">
                {t("customers.billingAddress")}
              </label>
              <div className="flex items-start gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                <MapPin className="w-4 h-4 text-indigo-500 mt-0.5" />
                <span className="leading-relaxed">{customer.address}</span>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">
                {t("customers.account")}
              </label>
              <div className="space-y-2 text-sm font-semibold text-gray-900 dark:text-white">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-indigo-500" />
                  <span>
                    {t("customers.roleLabel")}:{" "}
                    <span className="font-bold capitalize">
                      {customer.role}
                    </span>
                  </span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {t("customers.companyIdLabel")}:{" "}
                  <span className="font-mono">{customer.companyId}</span>
                </div>
                {customer.isBanned && (
                  <div className="mt-2 text-xs text-rose-500 dark:text-rose-400">
                    {t("customers.banReasonLabel")}:{" "}
                    {customer.banReason ||
                      t("customers.banReasonNotSpecified")}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfileCard;

