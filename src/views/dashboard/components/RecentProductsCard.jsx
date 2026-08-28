import React from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Package, ArrowUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import SkeletonLoader from "./SkeletonLoader";

export default function RecentProductsCard({
  data = [],
  currentPage,
  totalPages,
  itemsPerPage,
  onPageChange,
  isLoading,
}) {
  const { t } = useTranslation();
  const start = (currentPage - 1) * itemsPerPage;
  const currentData = data.slice(start, start + itemsPerPage);

  return (
    <Card className="border-none shadow-sm h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Package className="w-5 h-5" />
          {t("dashboard.recentProducts")}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        {isLoading ? (
          <SkeletonLoader rows={10} />
        ) : (
          <div className="flex flex-col h-full">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="uppercase text-xs font-bold text-gray-500">
                      <div className="flex items-center gap-1">
                        {t("dashboard.columnProduct")}{" "}
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </TableHead>
                    <TableHead className="uppercase text-xs font-bold text-gray-500">
                      <div className="flex items-center gap-1">
                        {t("dashboard.columnPrice")}{" "}
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </TableHead>
                    <TableHead className="text-right uppercase text-xs font-bold text-gray-500">
                      <div className="flex items-center justify-end gap-1">
                        {t("dashboard.columnStock")}{" "}
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentData.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-nexus-teal/10 flex items-center justify-center text-nexus-teal">
                          <Package className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                          <span>{product.name}</span>
                          <span className="text-[10px] text-gray-400 uppercase">{product.category}</span>
                        </div>
                      </TableCell>
                      <TableCell>{product.price}</TableCell>
                      <TableCell className="text-right">
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold ${
                            product.stock < 10 ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
                          }`}
                        >
                          {product.stock}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-between sm:justify-end gap-4 mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <span>{t("table.itemsPerPage")}</span>
                <select className="bg-transparent border border-gray-200 dark:border-gray-700 rounded px-1 py-0.5 focus:outline-none" disabled>
                  <option>{itemsPerPage}</option>
                </select>
              </div>
              <span>
                {start + 1}-{Math.min(start + itemsPerPage, data.length)}{" "}
                {t("table.of")} {data.length} {t("table.items")}
              </span>
              <div className="flex items-center gap-1">
                <button
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded disabled:opacity-50"
                  onClick={() => onPageChange(1)}
                  disabled={currentPage === 1}
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>
                <button
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded disabled:opacity-50"
                  onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded disabled:opacity-50"
                  onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded disabled:opacity-50"
                  onClick={() => onPageChange(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
