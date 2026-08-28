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
              borderRadius: "16px",
              background: "#ffffff",
              color: "#000000",
              fontSize: "16px",
              fontWeight: "700",
              padding: "16px 24px",
              minWidth: "360px",
              border: "1px solid #eae6f4",
              boxShadow: "0 10px 25px -5px rgba(53, 37, 205, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
            },
            success: {
              duration: 4000,
              iconTheme: {
                primary: "#10b981",
                secondary: "#ffffff",
              },
              style: {
                borderLeft: "5px solid #10b981",
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: "#ef4444",
                secondary: "#ffffff",
              },
              style: {
                borderLeft: "5px solid #ef4444",
              },
            },
            loading: {
              iconTheme: {
                primary: "#3525cd",
                secondary: "#e2dfff",
              },
              style: {
                borderLeft: "5px solid #3525cd",
              },
            },
          }}
        />
      </SearchProvider>
    </DarkModeProvider>
  );
};

export default App;
