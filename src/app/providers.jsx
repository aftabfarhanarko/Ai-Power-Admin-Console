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
      </Provider>
    </I18nextProvider>
  );
}
