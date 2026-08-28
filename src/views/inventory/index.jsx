import React from "react";
import { useNavigate } from "react-router-dom";

import StockAdjustmentModal from "./components/StockAdjustmentModal";
import InventoryHeader from "./components/InventoryHeader";
import InventoryStats from "./components/InventoryStats";
import InventoryToolbar from "./components/InventoryToolbar";
import InventoryTable from "./components/InventoryTable";
import { useInventoryPage } from "./useInventoryPage";

import { exportProductsToPDF } from "@/utils/pdfExport";

const InventoryPage = () => {
  const navigate = useNavigate();
  const {
    isLoading,
    visibleColumns,
    toggleColumn,
    visibleColumnCount,
    searchTerm,
    setSearchTerm,
    selectedCategoryId,
    setSelectedCategoryId,
    categoryOptions,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    setSortConfig,
    processedData,
    paginatedData,
    renderPrice,
    stockModal,
    setStockModal,
    historyModal,
    setHistoryModal,
    stats,
  } = useInventoryPage();

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 p-4 lg:p-8 space-y-8 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-50/50 to-transparent dark:from-indigo-950/20 dark:to-transparent -z-10" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      <InventoryHeader
        onExport={() => exportProductsToPDF(processedData, "Inventory")}
        onAdd={() => navigate("/products/create")}
      />

      <InventoryStats stats={stats} />

      <InventoryToolbar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategoryId={selectedCategoryId}
        setSelectedCategoryId={setSelectedCategoryId}
        categoryOptions={categoryOptions}
        setSortConfig={setSortConfig}
        visibleColumns={visibleColumns}
        toggleColumn={toggleColumn}
      />

      <InventoryTable
        isLoading={isLoading}
        processedTotal={processedData.length}
        paginatedData={paginatedData}
        renderPrice={renderPrice}
        navigate={navigate}
        visibleColumns={visibleColumns}
        visibleColumnCount={visibleColumnCount}
        pageSize={pageSize}
        setPageSize={setPageSize}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        setStockModal={setStockModal}
      />

      {/* --- Stock Modal --- */}
      {stockModal.isOpen && (
        <StockAdjustmentModal
          isOpen={stockModal.isOpen}
          onClose={() =>
            setStockModal({ isOpen: false, product: null, type: "in" })
          }
          product={stockModal.product}
          type={stockModal.type}
        />
      )}
    </div>
  );
};

export default InventoryPage;
