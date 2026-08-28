import React from "react";
import { Plus, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

export default function InvoiceItemsSection({
  items,
  setItems,
  products,
  addItem,
  removeItem,
  handleProductSelect,
  calcItemAmount,
}) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
        {t("invoices.create.items.title")}
      </h2>

      <div className="space-y-4">
        <div className="flex items-center gap-6">
          <span className="text-sm font-medium">
            {t("invoices.create.items.itemType")}
          </span>
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                name="itemType"
                value="product"
                id="product"
                defaultChecked
                className="w-4 h-4 accent-[#7c3aed]"
              />
              <label htmlFor="product" className="text-xs font-medium">
                {t("invoices.create.items.product")}
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                name="itemType"
                value="service"
                id="service"
                className="w-4 h-4 accent-[#7c3aed]"
              />
              <label htmlFor="service" className="text-xs font-medium">
                {t("invoices.create.items.service")}
              </label>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-50/50 dark:bg-black/10 rounded-xl border border-gray-100 dark:border-gray-800 lg:w-1/3">
          <label className="text-xs text-gray-500 mb-1 block font-medium">
            {t("invoices.create.items.quickAddTitle")}
          </label>
          <p className="text-xs text-gray-400">
            {t("invoices.create.items.quickAddSubtitle")}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[1000px]">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-900 dark:bg-black py-4">
                <th className="text-left py-3 px-4 text-white text-xs font-semibold rounded-tl-xl w-1/4">
                  {t("invoices.create.items.colProductService")}
                </th>
                <th className="text-left py-3 px-4 text-white text-xs font-semibold">
                  {t("invoices.create.items.colQuantity")}
                </th>
                <th className="text-left py-3 px-4 text-white text-xs font-semibold">
                  {t("invoices.create.items.colUnit")}
                </th>
                <th className="text-left py-3 px-4 text-white text-xs font-semibold">
                  {t("invoices.create.items.colRate")}
                </th>
                <th className="text-left py-3 px-4 text-white text-xs font-semibold w-1/6">
                  {t("invoices.create.items.colDiscount")}
                </th>
                <th className="text-left py-3 px-4 text-white text-xs font-semibold">
                  {t("invoices.create.items.colTax")}
                </th>
                <th className="text-left py-3 px-4 text-white text-xs font-semibold">
                  {t("invoices.create.items.colAmount")}
                </th>
                <th className="text-right py-3 px-4 text-white text-xs font-semibold rounded-tr-xl"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {items.map((item) => (
                <tr
                  key={item.id}
                  className="group hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="space-y-1">
                      <select
                        className="w-full h-8 rounded border border-gray-200 dark:border-gray-800 bg-transparent text-xs"
                        value={item.productId || ""}
                        onChange={(e) =>
                          handleProductSelect(item.id, e.target.value)
                        }
                      >
                        <option value="">
                          {t("invoices.create.items.selectProduct")}
                        </option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} - {p.price}
                          </option>
                        ))}
                      </select>
                      <input
                        value={item.name}
                        placeholder={t(
                          "invoices.create.items.namePlaceholder",
                        )}
                        className="flex h-10 w-full rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm dark:border-gray-800"
                        onChange={(e) => {
                          const newItems = items.map((i) =>
                            i.id === item.id
                              ? { ...i, name: e.target.value }
                              : i
                          );
                          setItems(newItems);
                        }}
                      />
                    </div>
                  </td>
                  <td className="py-4 px-4 w-[100px]">
                    <input
                      type="number"
                      value={item.quantity}
                      className="flex h-10 w-full rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm dark:border-gray-800 text-center"
                      onChange={(e) => {
                        const qty = parseInt(e.target.value) || 0;
                        const newItems = items.map((i) =>
                          i.id === item.id
                            ? {
                                ...i,
                                quantity: qty,
                                amount: calcItemAmount(
                                  qty,
                                  i.rate,
                                  i.discount,
                                  i.tax
                                ),
                              }
                            : i
                        );
                        setItems(newItems);
                      }}
                    />
                  </td>
                  <td className="py-4 px-4 w-[120px]">
                    <input
                      value={item.unit}
                      className="flex h-10 w-full rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm dark:border-gray-800"
                      onChange={(e) => {
                        const newItems = items.map((i) =>
                          i.id === item.id
                            ? { ...i, unit: e.target.value }
                            : i
                        );
                        setItems(newItems);
                      }}
                    />
                  </td>
                  <td className="py-4 px-4 w-[150px]">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                        $
                      </span>
                      <input
                        type="number"
                        value={item.rate}
                        className="flex h-10 w-full rounded-md border border-gray-200 bg-transparent pl-6 pr-3 py-2 text-sm dark:border-gray-800"
                        onChange={(e) => {
                          const rate = parseFloat(e.target.value) || 0;
                          const newItems = items.map((i) =>
                            i.id === item.id
                              ? {
                                  ...i,
                                  rate,
                                  amount: calcItemAmount(
                                    i.quantity,
                                    rate,
                                    i.discount,
                                    i.tax
                                  ),
                                }
                              : i
                          );
                          setItems(newItems);
                        }}
                      />
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={item.discount}
                        className="flex h-10 w-full rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm dark:border-gray-800 text-center"
                        onChange={(e) => {
                          const discount = parseFloat(e.target.value) || 0;
                          const newItems = items.map((i) =>
                            i.id === item.id
                              ? {
                                  ...i,
                                  discount,
                                  amount: calcItemAmount(
                                    i.quantity,
                                    i.rate,
                                    discount,
                                    i.tax
                                  ),
                                }
                              : i
                          );
                          setItems(newItems);
                        }}
                      />
                      <select
                        className="w-[60px] h-10 rounded-md border border-gray-200 bg-transparent text-sm dark:border-gray-800"
                        value={item.discountType}
                        onChange={(e) => {
                          const newItems = items.map((i) =>
                            i.id === item.id
                              ? { ...i, discountType: e.target.value }
                              : i
                          );
                          setItems(newItems);
                        }}
                      >
                        <option value="%">%</option>
                        <option value="fixed">$</option>
                      </select>
                    </div>
                  </td>
                  <td className="py-4 px-4 w-[80px]">
                    <input
                      type="number"
                      value={item.tax}
                      className="flex h-10 w-full rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm dark:border-gray-800 text-center"
                      onChange={(e) => {
                        const tax = parseFloat(e.target.value) || 0;
                        const newItems = items.map((i) =>
                          i.id === item.id
                            ? {
                                ...i,
                                tax,
                                amount: calcItemAmount(
                                  i.quantity,
                                  i.rate,
                                  i.discount,
                                  tax
                                ),
                              }
                            : i
                        );
                        setItems(newItems);
                      }}
                    />
                  </td>
                  <td className="py-4 px-4 w-[150px]">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                        $
                      </span>
                      <input
                        value={item.amount.toFixed(2)}
                        className="flex h-10 w-full rounded-md border border-gray-200 bg-gray-50 px-6 py-2 text-sm dark:bg-black/20 dark:border-gray-800"
                        readOnly
                      />
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Button
        variant="outline"
        onClick={addItem}
        className="text-[#7c3aed] border-[#7c3aed]/20 hover:bg-[#7c3aed]/5 font-semibold"
      >
        <Plus className="w-4 h-4 mr-2" />
        {t("invoices.create.items.addNew")}
      </Button>
    </div>
  );
}
