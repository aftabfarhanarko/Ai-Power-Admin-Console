import { search } from "@/assets/icons/svgIcons";
import React from "react";
import { Search } from "lucide-react";

const SearchBar = ({
  placeholder = "Search Items",
  searchValue,
  setSearhValue,
  onKeyDown,
  onEnter,
  className,
}) => {
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && onEnter) {
      onEnter();
    }
    if (onKeyDown) {
      onKeyDown(e);
    }
  };

  return (
    <div className="relative w-full">
      <input
        placeholder={placeholder}
        value={searchValue}
        onChange={(e) => setSearhValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className={`w-full py-2.5 pl-10 pr-4 rounded-xl text-sm outline-none transition-all duration-200 
          bg-gray-100 dark:bg-gray-800 
          text-gray-900 dark:text-gray-100 
          placeholder:text-gray-500 dark:placeholder:text-gray-400
          border border-transparent focus:bg-white dark:focus:bg-[#1a1f26] focus:border-gray-200 dark:focus:border-gray-700 focus:shadow-sm
          ${className}`}
      />
      <span className="absolute top-1/2 -translate-y-1/2 left-3 text-gray-400">
        <Search size={18} />
      </span>
    </div>
  );
};

export default SearchBar;
