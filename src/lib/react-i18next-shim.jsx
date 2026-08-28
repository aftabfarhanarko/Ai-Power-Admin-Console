import React from "react";
import en from "./en.json";

// Dynamic translation key resolver
export function t(key, defaultValue) {
  if (!key) return "";
  const parts = key.split(".");
  let current = en;
  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = current[part];
    } else {
      return defaultValue || key;
    }
  }
  return typeof current === "string" ? current : (defaultValue || key);
}

export function useTranslation() {
  return {
    t,
    i18n: {
      language: "en",
      changeLanguage: () => {},
      on: () => {},
      off: () => {},
    },
  };
}

export const I18nextProvider = ({ children }) => {
  return <>{children}</>;
};

export const initReactI18next = {
  type: "3rdParty",
  init: () => {},
};

export default {
  t,
  useTranslation,
  I18nextProvider,
  initReactI18next,
};
