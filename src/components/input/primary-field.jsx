import React from "react";

const PrimaryField = ({ placeholder, name, register, className, ...props }) => {
  return (
    <input
      placeholder={placeholder}
      name={name}
      className={`py-3 px-4 rounded-xl bg-gray-50 dark:bg-[#1a1f26] border border-gray-200 dark:border-gray-800 w-full outline-none focus:ring-2 focus:ring-black/5 dark:focus:ring-white/10 transition-all duration-200 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 ${className}`}
      {...register(name)}
      {...props}
    />
  );
};

export default PrimaryField;
