import React, { createContext, useContext, useState } from "react";

const SearchContext = createContext();

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearch must be used within SearchProvider");
  }
  return context;
};

export const SearchProvider = ({ children }) => {
  const [isSearching, setIsSearching] = useState(false);

  return (
    <SearchContext.Provider value={{ isSearching, setIsSearching }}>
      {children}
    </SearchContext.Provider>
  );
};
