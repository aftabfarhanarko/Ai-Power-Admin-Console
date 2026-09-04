import React from "react";

/**
 * Premium Status Badge Component
 */
export const GlassBadge = ({ status, variant, className = "" }) => {
  const normalized = String(status || variant || "").toLowerCase().trim();

  let styleClass = "glass-badge-info";

  if (
    normalized.includes("paid") ||
    normalized.includes("active") ||
    normalized.includes("completed") ||
    normalized.includes("delivered") ||
    normalized.includes("success") ||
    normalized.includes("published")
  ) {
    styleClass = "glass-badge-success";
  } else if (
    normalized.includes("pending") ||
    normalized.includes("processing") ||
    normalized.includes("draft") ||
    normalized.includes("in transit") ||
    normalized.includes("warning")
  ) {
    styleClass = "glass-badge-warning";
  } else if (
    normalized.includes("failed") ||
    normalized.includes("cancelled") ||
    normalized.includes("inactive") ||
    normalized.includes("error") ||
    normalized.includes("danger") ||
    normalized.includes("expired")
  ) {
    styleClass = "glass-badge-danger";
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide border shadow-xs ${styleClass} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75 animate-pulse" />
      <span className="capitalize">{status || variant || "N/A"}</span>
    </span>
  );
};

export default GlassBadge;
