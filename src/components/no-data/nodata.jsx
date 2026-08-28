import { FolderOpen } from "lucide-react";
import React from "react";

const NoDataFound = ({ className, children }) => {
  return (
    <div className={`center text-sm dark:text-white/50 text-black/50 ${className}`}>
      <FolderOpen strokeWidth={1} />
      <span className="mt-3 block text-center">{children}</span>
    </div>
  );
};

export default NoDataFound;
