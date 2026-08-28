import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const TextField = ({
  type = "text",
  placeholder,
  label,
  className = "",
  inputClassName = "",
  register,
  registerOptions,
  name,
  icon,
  error,
  disabled = false,
  multiline = false,
  rows = 3,
  maxLength,
  ...rest
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password" && !multiline;
  const registerProps =
    register && name ? register(name, registerOptions) : {};

  const fieldClassNames = `border rounded-xl ${
    error ? "border-red-500 dark:border-red-500" : "border-gray-200 dark:border-gray-800 focus:border-black dark:focus:border-white"
  } py-3 bg-gray-50 dark:bg-[#1a1f26] w-full outline-none transition-all duration-200 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:bg-white dark:focus:bg-[#1a1f26] focus:shadow-sm ${
    isPassword ? "pr-12" : "pr-4"
  } ${
    icon && !multiline ? "pl-11" : "pl-4"
  } ${disabled ? "opacity-60 cursor-not-allowed" : ""} ${
    multiline ? "min-h-[120px] resize-y" : ""
  } ${inputClassName}`.trim();

  const commonProps = {
    placeholder,
    disabled,
    className: fieldClassNames,
    maxLength,
    ...registerProps,
    ...rest,
  };

  const wrapperClassNames = `flex flex-col gap-2 ${className}`.trim();

  return (
    <div className={wrapperClassNames}>
      {label && <label className="text-gray-700 dark:text-gray-300 text-sm font-medium ml-1">{label}</label>}
      <div className="relative">
        {multiline ? (
          <textarea {...commonProps} rows={rows} />
        ) : (
          <>
            <input
              type={isPassword && showPassword ? "text" : type}
              {...commonProps}
              className={`${fieldClassNames} password-input`}
            />
            {icon && <span className="absolute top-1/2 -translate-y-1/2 left-3 text-gray-400">{icon}</span>}
          </>
        )}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors z-10 cursor-pointer"
            tabIndex={-1}
          >
            {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
          </button>
        )}
      </div>
      {error && (
        <span className="text-red-500 text-xs ml-1 font-medium">{error.message}</span>
      )}
    </div>
  );
};

export default TextField;
