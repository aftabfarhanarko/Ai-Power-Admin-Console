import React from "react";
import ProductsStatCard from "./ProductsStatCard";

export default function ProductsStatsGrid({ stats = [] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, idx) => (
        <ProductsStatCard key={stat.label} stat={stat} index={idx} />
      ))}
    </div>
  );
}
