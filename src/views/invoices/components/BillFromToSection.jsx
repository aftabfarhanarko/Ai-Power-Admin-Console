import React from "react";
import { PlusCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

export default function BillFromToSection({
  authUser,
  invoiceData,
  setInvoiceData,
  customers,
  onAddNewCustomer,
}) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      <div className="space-y-4">
        <h3 className="font-bold text-gray-900 dark:text-white underline decoration-[#7c3aed] decoration-2 underline-offset-8 mb-6">
          {t("invoices.create.billFrom")}
        </h3>
        <div className="space-y-2 text-sm">
          <p className="font-bold text-gray-800 dark:text-gray-200">
            {authUser?.companyName || "-"}
          </p>
          {authUser?.branchLocation && (
            <p className="text-gray-500">{authUser.branchLocation}</p>
          )}
          {authUser?.phone && (
            <p className="text-gray-500">Phone : {authUser.phone}</p>
          )}
          {authUser?.email && (
            <p className="text-gray-500">Email : {authUser.email}</p>
          )}
        </div>
      </div>
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-gray-900 dark:text-white underline decoration-[#7c3aed] decoration-2 underline-offset-8">
            {t("invoices.create.billTo")}
          </h3>
          <Button
            variant="link"
            className="text-[#7c3aed] h-auto p-0 flex items-center gap-1"
            onClick={onAddNewCustomer}
          >
            <PlusCircle className="w-3 h-3" />
            {t("invoices.create.addNewCustomer")}
          </Button>
        </div>
        <div className="space-y-2">
          <label className="text-xs text-gray-500 font-medium">
            {t("invoices.create.customerLabel")}{" "}
            <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full h-10 px-3 rounded-md border border-gray-200 dark:border-gray-800 bg-transparent text-sm"
            value={invoiceData.customerId}
            onChange={(e) =>
              setInvoiceData({
                ...invoiceData,
                customerId: e.target.value,
              })
            }
          >
            <option value="">{t("invoices.create.selectCustomer")}</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.email})
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
