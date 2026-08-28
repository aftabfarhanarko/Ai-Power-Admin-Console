import React from "react";

const CardHeader = ({ children, svgIcon, primary = false }) => {
  return (
    <div className="fl gap-3">
      <span
        className={`lg:h-9 h-8 lg:w-9 w-8 center rounded-full ${
          primary ? "bg-white" : "bg-primary"
        }`}
      >
        {svgIcon}
      </span>
      <h3 className={`flex-1 ${primary ? "text-white lg:h3 font-semibold" : "text-black dark:text-white subtitle"}`}>
        {children}
      </h3>
    </div>
  );
};

export default CardHeader;
