import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const PasswordField = ({
  type = "password",
  placeholder,
  label,
  className,
  icon,
  register,
  name,
  registerOptions,
  disabled = false,
  error,
  ...rest
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  
  // Register the field with react-hook-form
  const registerProps = register && name ? register(name, registerOptions) : {};

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <label className="text-black/50 dark:text-white/50 text-sm ml-1">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={isPassword && !showPassword ? "password" : "text"}
          placeholder={placeholder}
          className={`border-2 rounded-xl ${
            error ? "border-red-500 dark:border-red-500" : "border-gray-200 dark:border-gray-700 focus:border-primary dark:focus:border-primary"
          } py-3 bg-gray-50 dark:bg-gray-800/50 w-full outline-none transition-all duration-300 dark:text-white/90 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:bg-white dark:focus:bg-gray-800 focus:shadow-lg focus:shadow-primary/10 pr-12 ${
            icon ? "pl-11" : "pl-4"
          } ${disabled ? "opacity-60 cursor-not-allowed" : ""} password-input`}
          disabled={disabled}
          {...registerProps}
          {...rest}
        />
        {icon && (
          <span className="absolute top-1/2 -translate-y-1/2 left-3">{icon}</span>
        )}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-black/50 dark:text-white/50 hover:text-black/70 dark:hover:text-white/70 transition-colors z-10 cursor-pointer"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
      {error && (
        <span className="text-red-500 text-xs ml-1">{error.message}</span>
      )}
    </div>
  );
};

export default PasswordField;
