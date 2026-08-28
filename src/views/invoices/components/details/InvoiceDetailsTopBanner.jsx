import React from "react";

export default function InvoiceDetailsTopBanner({
  companyName,
  branchLocation,
  status,
  logoImage,
  logoWidth,
  logoHeight,
}) {
  const isPaid = status?.toLowerCase() === "paid";

  return (
    <div className="relative h-48 w-full overflow-hidden bg-white dark:bg-[#1a1f26]">
      <div className="absolute top-0 right-0 w-[60%] h-full bg-gradient-to-l from-purple-100/50 to-transparent dark:from-purple-900/10" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#7c3aed]/5 rounded-full -mr-16 -mt-16 blur-3xl" />
      
      {/* Logo / Company Name Section */}
      <div className="absolute top-0 right-0 p-12 flex items-center gap-4">
        {logoImage ? (
          <img
            src={logoImage}
            alt="Company Logo"
            style={{
              width: logoWidth ? `${logoWidth}px` : "auto",
              height: logoHeight ? `${logoHeight}px` : "auto",
              maxWidth: logoWidth ? "none" : "250px",
              maxHeight: logoHeight ? "none" : "150px",
              objectFit: "contain",
            }}
            className="object-contain"
          />
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#7c3aed] to-[#3b82f6] flex items-center justify-center text-white shadow-lg">
              <div className="w-2 h-2 rounded-full bg-white" />
            </div>
            <span className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              {companyName || "SquadCart"}
            </span>
          </div>
        )}
      </div>

      <div className="absolute top-0 left-0 p-12">
        <h1 className="text-4xl font-black text-gray-800 dark:text-white uppercase tracking-tight">
          Invoice
        </h1>
        <p className="text-gray-900 dark:text-gray-300 font-bold mt-2">
          {companyName || "SquadCart"}
        </p>
        <p className="text-sm text-gray-500">{branchLocation || "-"}</p>
      </div>

      {!isPaid && (
        <div className="absolute top-12 left-1/2 -ml-16 transform -rotate-12 border-4 border-red-500/30 text-red-500/40 text-xs font-black px-4 py-1 rounded-lg uppercase tracking-widest flex flex-col items-center">
          <span>NOT</span>
          <span>PAID</span>
          <div className="absolute inset-x-0 bottom-0 h-px bg-red-500/20" />
        </div>
      )}
    </div>
  );
}
