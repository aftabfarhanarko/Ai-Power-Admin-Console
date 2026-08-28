import React from "react";
import AtomLoader from "../loader/AtomLoader";

const SubmitButton = ({
  type = "submit",
  children,
  isLoading,
  className,
  ...props
}) => {
  return (
    <button 
      {...props} 
      type={type} 
      className={`bg-gradient-to-r from-gray-900 via-black to-gray-900 hover:from-gray-800 hover:via-gray-900 hover:to-gray-800 dark:from-primary dark:via-primary/90 dark:to-primary dark:hover:from-primary/90 dark:hover:via-primary dark:hover:to-primary/90 py-3.5 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none flex items-center justify-center gap-2 ${className}`}
    >
      {isLoading && <AtomLoader />}
      {children}
    </button>
  );
};

export default SubmitButton;
