'use client';

import React from "react";
import { Provider } from "react-redux";
import { I18nextProvider } from "react-i18next";
import { Toaster } from "react-hot-toast";

import { store } from "@/store";
import { DarkModeProvider } from "@/hooks/dark-mode";
import { SearchProvider } from "@/contexts/SearchContext";

export default function Providers({ children }) {
  return (
    <I18nextProvider>
      <Provider store={store}>
        <DarkModeProvider>
          <SearchProvider>
            {children}
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
      </Provider>
    </I18nextProvider>
  );
}
