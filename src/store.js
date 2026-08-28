import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";

import { apiSlice } from "./features/api/apiSlice";
import { steadfastApiSlice } from "./features/steadfast/steadfastApiSlice";
import { pathaoApiSlice } from "./features/pathao/pathaoApiSlice";
import { redxApiSlice } from "./features/redx/redxApiSlice";
import { superadminAuthApiSlice } from "./features/superadminAuth/superadminAuthApiSlice";
import { superadminApiSlice } from "./features/superadmin/superadminApiSlice";
import authReducer from "./features/auth/authSlice";
import superadminAuthReducer from "./features/superadminAuth/superadminAuthSlice";

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    [steadfastApiSlice.reducerPath]: steadfastApiSlice.reducer,
    [pathaoApiSlice.reducerPath]: pathaoApiSlice.reducer,
    [redxApiSlice.reducerPath]: redxApiSlice.reducer,
    [superadminAuthApiSlice.reducerPath]: superadminAuthApiSlice.reducer,
    [superadminApiSlice.reducerPath]: superadminApiSlice.reducer,
    auth: authReducer,
    superadminAuth: superadminAuthReducer,
  },
  devTools: import.meta.env.VITE_ENV !== "PRODUCTION",
  middleware: (gDM) => gDM().concat([
    apiSlice.middleware, 
    steadfastApiSlice.middleware, 
    pathaoApiSlice.middleware,
    redxApiSlice.middleware,
    superadminAuthApiSlice.middleware,
    superadminApiSlice.middleware,
  ]),
});

setupListeners(store.dispatch);
