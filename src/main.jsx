import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { I18nextProvider } from "react-i18next";

import App from "./App.jsx";
import { store } from "./store.js";

import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <I18nextProvider>
      <Provider store={store}>
        <App />
      </Provider>
    </I18nextProvider>
  </StrictMode>
);
