import React from "react";

export default function InvoiceDetailsItemsTable({ items, formatCurrency }) {
  return (
    <div className="space-y-4">
      <h4 className="text-gray-900 dark:text-white font-bold text-base">
        Product / Service Items
      </h4>
      <div className="overflow-hidden rounded-xl border border-gray-100 dark:border-gray-800">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-900 dark:bg-black">
              <th className="py-4 px-4 text-left text-xs font-bold text-white uppercase w-[50px]">
                #
              </th>
              <th className="py-4 px-4 text-left text-xs font-bold text-white uppercase">
                Product/Service
              </th>
              <th className="py-4 px-4 text-center text-xs font-bold text-white uppercase">
                Quantity
              </th>
              <th className="py-4 px-4 text-center text-xs font-bold text-white uppercase">
                Unit
              </th>
              <th className="py-4 px-4 text-right text-xs font-bold text-white uppercase">
                Rate
              </th>
              <th className="py-4 px-4 text-right text-xs font-bold text-white uppercase">
                Discount
              </th>
              <th className="py-4 px-4 text-right text-xs font-bold text-white uppercase">
                Tax
              </th>
              <th className="py-4 px-4 text-right text-xs font-bold text-white uppercase">
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {items?.map((item, idx) => (
              <tr
                key={item.id || idx}
                className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors"
              >
                <td className="py-4 px-4 text-sm font-medium text-gray-500">{idx + 1}</td>
                <td className="py-4 px-4">
                  <p className="font-bold text-gray-900 dark:text-white text-sm">{item.name}</p>
                </td>
                <td className="py-4 px-4 text-center text-sm font-medium text-gray-500">
                  {item.quantity}
                </td>
                <td className="py-4 px-4 text-center text-sm font-medium text-gray-500">
                  {item.unit || "Pcs"}
                </td>
                <td className="py-4 px-4 text-right text-sm font-medium text-gray-500">
                  {formatCurrency(item.rate)}
                </td>
                <td className="py-4 px-4 text-right text-sm font-medium text-gray-500">
                  {item.discount || 0}%
                </td>
                <td className="py-4 px-4 text-right text-sm font-medium text-gray-500">
                  {item.tax || 0}%
                </td>
                <td className="py-4 px-4 text-right font-bold text-gray-900 dark:text-white">
                  {formatCurrency(item.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
