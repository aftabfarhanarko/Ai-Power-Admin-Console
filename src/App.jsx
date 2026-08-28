import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { routes } from "./routes";

// hooks
import useAuth from "./hooks/useAuth";
import useStorageSync from "./hooks/useStorageSync";
import useFavicon from "./hooks/useFavicon";
import { DarkModeProvider } from "./hooks/dark-mode";
import { SearchProvider } from "./contexts/SearchContext";

// components
import AtomLoader from "./components/loader/AtomLoader";

// styles
import "./assets/styles/global.css";
import "./assets/styles/typography.css";
import "./assets/styles/layout.css";

const App = () => {
  const { i18n } = useTranslation();
  const { isLoading, authChecked } = useAuth();

  // Synchronize HTML lang attribute with current application language
  // This allows CSS selectors like html[lang="bn"] to apply specific styles (e.g., fonts)
  useEffect(() => {
    if (i18n.language) {
      document.documentElement.lang = i18n.language;
    }
  }, [i18n.language]);
  
  // Enable real-time storage sync across tabs
  useStorageSync();
  
  // Dynamically update favicon from API
  useFavicon();

  if (!authChecked || isLoading) {
    return (
      <div className="h-screen w-screen center">
        <AtomLoader />
      </div>
    );
  }
  return (
    <DarkModeProvider>
      <SearchProvider>
        <RouterProvider router={routes} />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              borderRadius: "8px",
              background: "#222",
              color: "#eee",
              fontSize: "14px",
              padding: "16px",
              border: "1px solid #333",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            },
          }}
        />
      </SearchProvider>
    </DarkModeProvider>
  );
};

export default App;
