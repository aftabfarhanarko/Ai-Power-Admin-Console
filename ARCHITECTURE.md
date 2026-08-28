# E-Commerce Admin Panel - Architecture Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Architecture Patterns](#architecture-patterns)
5. [Core Components](#core-components)
6. [State Management](#state-management)
7. [API Layer](#api-layer)
8. [Routing & Navigation](#routing--navigation)
9. [Authentication & Authorization](#authentication--authorization)
10. [Styling & UI](#styling--ui)
11. [Build & Development](#build--development)

---

## Project Overview

This is a modern e-commerce admin panel built with React, designed to manage various aspects of an e-commerce platform including products, categories, inventory, orders, customers, banners, promocodes, and system users.

### Key Features
- **Product Management**: Create, read, update, and delete products
- **Category Management**: Organize products into categories
- **Inventory Management**: Track and manage stock levels
- **Order Management**: View and manage customer orders
- **Customer Management**: Manage customer accounts
- **Banner Management**: Manage promotional banners
- **Promocode Management**: Create and manage discount codes
- **Fraud Detection**: Monitor and manage fraud checks
- **User Management**: Manage system users and permissions
- **Settings**: Configure system settings
- **Help Center**: Manage help documentation

---

## Technology Stack

### Core Framework
- **React 18.3.1**: UI library
- **Vite 5.4.8**: Build tool and development server
- **React Router DOM 6.27.0**: Client-side routing

### State Management
- **Redux Toolkit 2.2.8**: State management library
- **RTK Query**: Data fetching and caching solution
- **React Redux 9.1.2**: React bindings for Redux

### UI & Styling
- **Tailwind CSS 3.4.13**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives
  - Accordion, Dialog, Dropdown Menu, Switch, Tooltip
- **Lucide React**: Icon library
- **Recharts 2.13.3**: Charting library for data visualization

### Form Management
- **React Hook Form 7.53.0**: Form state management
- **Yup 1.6.1**: Schema validation
- **@hookform/resolvers**: Form validation resolvers

### Utilities
- **Moment.js 2.30.1**: Date manipulation
- **jsPDF 3.0.0**: PDF generation
- **Socket.io Client 4.8.1**: Real-time communication
- **React Hot Toast 2.4.1**: Toast notifications
- **JWT Decoder**: Token parsing utilities

### Development Tools
- **ESLint**: Code linting
- **PostCSS**: CSS processing
- **Autoprefixer**: CSS vendor prefixing

---

## Project Structure

```
e-commerce-admin/
├── public/                 # Static assets
│   └── favicon.png
├── src/
│   ├── assets/            # Static resources
│   │   ├── icons/         # SVG icons
│   │   ├── images/        # Image assets
│   │   └── styles/        # Global styles
│   │       ├── global.css
│   │       ├── layout.css
│   │       └── typography.css
│   ├── components/        # Reusable UI components
│   │   ├── buttons/       # Button components
│   │   ├── cards/         # Card components
│   │   ├── charts/        # Chart components
│   │   ├── dropdown/      # Dropdown components
│   │   ├── footer/        # Footer component
│   │   ├── headers/       # Header components
│   │   ├── input/         # Input components
│   │   ├── loader/        # Loading components
│   │   ├── logo/          # Logo component
│   │   ├── navbar/        # Navigation components
│   │   ├── no-data/       # Empty state component
│   │   ├── status/        # Status indicator
│   │   ├── table/         # Table components
│   │   ├── templates/     # Template components
│   │   └── ui/            # Base UI components (Radix UI)
│   ├── features/          # Feature-based modules
│   │   ├── api/           # Base API slice
│   │   ├── auth/          # Authentication feature
│   │   ├── banners/       # Banner management
│   │   ├── category/      # Category management
│   │   ├── fraud/         # Fraud detection
│   │   ├── help/          # Help center
│   │   ├── inventory/     # Inventory management
│   │   ├── order/         # Order management
│   │   ├── ordersitem/    # Order items
│   │   ├── product/       # Product management
│   │   ├── promocode/     # Promocode management
│   │   ├── setting/       # Settings
│   │   ├── systemuser/    # System user management
│   │   └── user/          # User management
│   ├── hooks/             # Custom React hooks
│   │   ├── dark-mode.jsx  # Dark mode provider
│   │   ├── useAuth.js     # Authentication hook
│   │   ├── useCookie.js   # Cookie management
│   │   ├── useImageUpload.js
│   │   ├── usePrivateRoute.jsx
│   │   ├── useTitle.js
│   │   └── useToken.js    # Token management
│   ├── layout/            # Layout components
│   │   └── layout.jsx     # Main layout wrapper
│   ├── lib/               # Utility libraries
│   │   ├── format-date.js
│   │   └── utils.js
│   ├── pages/             # Page components
│   │   ├── auth/          # Authentication pages
│   │   ├── banner/        # Banner pages
│   │   ├── categories/    # Category pages
│   │   ├── common/        # Common pages (error, etc.)
│   │   ├── customers/     # Customer pages
│   │   ├── dashboard/     # Dashboard
│   │   ├── fraud/         # Fraud pages
│   │   ├── help/          # Help pages
│   │   ├── inventory/     # Inventory pages
│   │   ├── manageuser/    # User management pages
│   │   ├── orders/        # Order pages
│   │   ├── ordersitem/    # Order item pages
│   │   ├── products/      # Product pages
│   │   ├── promocode/     # Promocode pages
│   │   └── settings/      # Settings pages
│   ├── utils/             # Utility functions
│   │   ├── cookies.js
│   │   ├── duration.js
│   │   └── jwt-decoder.js
│   ├── App.jsx            # Root component
│   ├── main.jsx           # Application entry point
│   ├── routes.jsx         # Route configuration
│   └── store.js           # Redux store configuration
├── index.html             # HTML template
├── package.json           # Dependencies
├── vite.config.js        # Vite configuration
├── tailwind.config.js    # Tailwind configuration
├── postcss.config.js     # PostCSS configuration
└── eslint.config.js      # ESLint configuration
```

---

## Architecture Patterns

### Feature-Based Architecture
The application follows a **feature-based architecture** where related functionality is grouped together:

- Each feature has its own directory under `src/features/`
- Features contain API slices for data fetching
- Pages are organized by feature domain
- Components are shared across features when reusable

### Component Architecture
- **Presentational Components**: Located in `src/components/` - reusable UI components
- **Container Components**: Located in `src/pages/` - page-level components that connect to state
- **Feature Components**: Located in `src/pages/{feature}/components/` - feature-specific components

### API Architecture
- **Base API Slice**: Centralized API configuration in `src/features/api/apiSlice.js`
- **Feature API Slices**: Each feature extends the base API slice using `injectEndpoints`
- **RTK Query**: Used for all API interactions with automatic caching and refetching

---

## Core Components

### Entry Point (`main.jsx`)
```1:16:src/main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";

import App from "./App.jsx";
import { store } from "./store.js";

import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>
);
```

### Root Component (`App.jsx`)
- Wraps the application with authentication check
- Provides dark mode context
- Configures toast notifications
- Handles initial loading state

### Layout Component (`layout.jsx`)
- Provides consistent page structure
- Includes sidebar navigation and top navbar
- Responsive design with mobile/desktop layouts
- Dark mode support

---

## State Management

### Redux Store Configuration
The application uses Redux Toolkit with the following structure:

```7:16:src/store.js
export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authReducer,
  },
  devTools: import.meta.env.VITE_ENV !== "PRODUCTION",
  middleware: (gDM) => gDM().concat([apiSlice.middleware]),
});

setupListeners(store.dispatch);
```

### Store Slices

#### 1. API Slice (`apiSlice`)
- Base configuration for RTK Query
- Handles authentication headers
- Implements token refresh logic
- Manages cache invalidation

#### 2. Auth Slice (`authSlice`)
- Manages authentication state
- Handles login/logout actions
- Stores user information
- Manages token persistence

### State Structure
```javascript
{
  apiSlice: {
    // RTK Query cache
  },
  auth: {
    accessToken: string | null,
    user: object | null,
    isAuthenticated: boolean
  }
}
```

---

## API Layer

### Base API Slice
The base API slice (`src/features/api/apiSlice.js`) provides:

1. **Base Query Configuration**
   - Sets base URL from environment variables
   - Adds Authorization headers automatically
   - Handles token refresh on 401 errors

2. **Token Refresh Logic**
   - Automatic token refresh on authentication failure
   - Retry mechanism (max 3 attempts)
   - Logout on refresh failure

3. **Cache Management**
   - Tag-based cache invalidation
   - 60-second cache retention
   - Auto-refetch on mount/reconnect

4. **Tag Types**
   - Categories, Products, Inventory, Users, Orders, etc.
   - Used for cache invalidation

### Feature API Slices
Each feature extends the base API slice:

**Example: Category API Slice**
```3:21:src/features/category/categoryApiSlice.js
export const categoryApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
      
    // createCategory 
    createCategory: builder.mutation({
   query: (body) => ({
    url: "/categories",
    method: "POST",
    body,
    headers: { "Content-Type": "application/json;charset=UTF-8" },
   }),
  invalidatesTags: [{ type: "categories", id: "LIST" }],
    }),
        
    getCategories: builder.query({
      query: () => ({ url: "/categories", method: "GET" }),
      transformResponse: (res) => res?.data ?? [], // ✅ safe response
      providesTags: [{ type: "categories", id: "LIST" }],
    }),
```

**Features with API Slices:**
- Authentication (`authApiSlice`)
- Categories (`categoryApiSlice`)
- Products (`productApiSlice`)
- Inventory (`inventoryApiSlice`)
- Orders (`orderApiSlice`, `ordersItemApiSlice`)
- Users (`userApiSlice`, `systemuserApiSlice`)
- Banners (`bannersApiSlice`)
- Promocodes (`promocodeApiSlice`)
- Settings (`settingApiSlice`)
- Help (`helpApiSlice`)
- Fraud (`fraudApiSlice`)

### API Endpoints Pattern
- **Queries**: For GET requests (read operations)
- **Mutations**: For POST, PATCH, DELETE requests (write operations)
- **Cache Tags**: Used for automatic cache invalidation
- **Transform Response**: Normalizes API responses

---

## Routing & Navigation

### Route Configuration (`routes.jsx`)
The application uses React Router v6 with a nested route structure:

```29:94:src/routes.jsx
export const routes = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <DashboardPage />,
      },
      {
        path: "/categories",
        element: <CategoriesPage />,
      },
      // ... more routes
    ],
  },
  { path: "/sign-in", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  { path: "/forgot-password", element: <ForgotPasswordRequestPage /> },
  { path: "/reset-password", element: <ResetPasswordPage /> },
  { path: "*", element: <ErrorPage /> },
]);
```

### Route Structure
- **Public Routes**: `/sign-in`, `/register`, `/forgot-password`, `/reset-password`
- **Protected Routes**: All routes under `/` (wrapped in Layout)
- **404 Route**: Catch-all route for unknown paths

### Navigation Components
- **SideNav**: Sidebar navigation for desktop
- **TopNavbar**: Top navigation bar with user menu
- **PrivateRoute**: HOC for route protection (currently not used in routes, but available)

---

## Authentication & Authorization

### Authentication Flow

1. **Login Process**
   - User submits credentials
   - API returns access token and refresh token
   - Tokens stored in Redux state
   - Tokens persisted (cookie or session storage based on "remember me")

2. **Token Management**
   - Access tokens in Authorization header
   - Automatic token refresh on 401 errors
   - Token storage via `useToken` hook

3. **Logout Process**
   - Clears Redux state
   - Removes tokens from storage
   - Resets API cache
   - Redirects to login

### Auth State Management
```7:44:src/features/auth/authSlice.js
const initialState = {
  accessToken: accessToken || null,
  user: null,
  isAuthenticated: !!accessToken,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    userLoggedIn: (state, action) => {
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      if (action.payload.rememberMe) {
        setAuthCookie(action.payload);
      } else {
        setSessionToken(
          action.payload.accessToken,
          action.payload.refreshToken
        );
      }
    },
    userDetailsFetched: (state, action) => {
      state.user = action.payload;
    },
    userLoggedOut: (state) => {
      state.accessToken = null;
      state.user = null;
      state.isAuthenticated = false;
      clearTokens();
    },
  },
});
```

### Authentication Hooks
- **useAuth**: Checks authentication status and loading state
- **useToken**: Manages token storage and retrieval
- **useCookie**: Handles cookie operations
- **usePrivateRoute**: Protects routes (wrapper component)

### Token Refresh Mechanism
The API slice automatically handles token refresh:

```22:75:src/features/api/apiSlice.js
const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  const { accessToken, refreshToken, rememberMe } = getTokens();
  let retryCount = 0;

  // Try refreshing token if unauthorized (401)
  while (
    (!accessToken || (result.error && result.error.status === 401)) &&
    retryCount < MAX_RETRY_COUNT
  ) {
    retryCount++;
    try {
      if (refreshToken) {
        const refreshResult = await baseQuery(
          {
            url: "/auth/refresh-token",
            method: "POST",
            body: { refreshToken },
            credentials: "include",
          },
          api,
          extraOptions
        );

        if (refreshResult.data?.success) {
          // ✅ Store new tokens
          api.dispatch(
            userLoggedIn({
              accessToken: refreshResult.data.data.accessToken,
              refreshToken: refreshResult.data.data.refreshToken,
              rememberMe,
            })
          );

          // Retry original request with new token
          result = await baseQuery(args, api, extraOptions);
          break;
        } else {
          api.dispatch(userLoggedOut());
          break;
        }
      } else {
        api.dispatch(userLoggedOut());
        break;
      }
    } catch (error) {
      console.error("Refresh token failed:", error);
      api.dispatch(userLoggedOut());
      break;
    }
  }

  return result;
};
```

---

## Styling & UI

### Tailwind CSS
- Utility-first CSS framework
- Custom configuration in `tailwind.config.js`
- Responsive design with mobile-first approach

### Component Libraries
- **Radix UI**: Accessible, unstyled components
  - Dialog, Dropdown Menu, Switch, Tooltip, Accordion
- **Custom Components**: Built on top of Radix UI primitives

### Dark Mode
- Implemented via `DarkModeProvider` hook
- Toggle functionality in navigation
- Persists user preference

### Global Styles
- `global.css`: Base styles and CSS variables
- `layout.css`: Layout-specific styles
- `typography.css`: Typography styles

### UI Components Structure
```
components/
├── buttons/      # Button variants
├── cards/        # Card components
├── charts/       # Chart components (Recharts)
├── input/        # Form inputs
├── table/        # Table components with pagination
├── ui/           # Base UI components (Radix UI)
└── ...
```

---

## Build & Development

### Build Tool: Vite
- Fast development server with HMR
- Optimized production builds
- Environment variable support

### Configuration Files

#### Vite Config (`vite.config.js`)
```6:13:vite.config.js
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

- Path alias `@` for `src/` directory
- React plugin for JSX support

#### Environment Variables
- `VITE_API_URL`: Backend API base URL
- `VITE_ENV`: Environment (DEVELOPMENT/PRODUCTION)

### Scripts
```6:12:package.json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "build:prod": "vite build --mode prod",
  "lint": "eslint .",
  "preview": "vite preview"
}
```

### Development Workflow
1. **Development**: `npm run dev` - Starts dev server
2. **Build**: `npm run build` - Production build
3. **Preview**: `npm run preview` - Preview production build
4. **Lint**: `npm run lint` - Code linting

---

## Key Design Decisions

### 1. Feature-Based Organization
- **Rationale**: Better code organization and scalability
- **Benefit**: Easy to locate feature-specific code

### 2. RTK Query for Data Fetching
- **Rationale**: Reduces boilerplate, automatic caching
- **Benefit**: Better performance, less code

### 3. Tag-Based Cache Invalidation
- **Rationale**: Precise cache control
- **Benefit**: Efficient data synchronization

### 4. Automatic Token Refresh
- **Rationale**: Seamless user experience
- **Benefit**: Users don't get logged out unexpectedly

### 5. Component Composition
- **Rationale**: Reusability and maintainability
- **Benefit**: Consistent UI, easier updates

---

## Future Considerations

### Potential Improvements
1. **Error Boundaries**: Add React error boundaries for better error handling
2. **Code Splitting**: Implement route-based code splitting for better performance
3. **Testing**: Add unit and integration tests
4. **TypeScript Migration**: Consider migrating to TypeScript for type safety
5. **Accessibility**: Enhance ARIA labels and keyboard navigation
6. **Performance**: Implement virtual scrolling for large lists
7. **Internationalization**: Add i18n support for multi-language support

---

## Dependencies Summary

### Production Dependencies
- React ecosystem (React, React DOM, React Router)
- Redux ecosystem (Redux Toolkit, React Redux)
- UI libraries (Radix UI, Recharts, Lucide React)
- Form management (React Hook Form, Yup)
- Utilities (Moment, jsPDF, Socket.io)
- Styling (Tailwind CSS, PostCSS)

### Development Dependencies
- Build tools (Vite, plugins)
- Linting (ESLint, plugins)
- CSS processing (PostCSS, Autoprefixer)

---

## Conclusion

This e-commerce admin panel follows modern React best practices with a feature-based architecture, centralized state management, and a robust API layer. The application is designed for scalability, maintainability, and developer experience.

For questions or contributions, please refer to the project's contribution guidelines.






