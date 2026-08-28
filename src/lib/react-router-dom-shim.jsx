'use client';

import React, { createContext, useContext, useEffect, useCallback } from 'react';
import NextLink from 'next/link';
import { useRouter, useParams as useNextParams, useSearchParams as useNextSearchParams, usePathname } from 'next/navigation';

// --- Outlet Context shim for matching <Outlet /> rendering ---
const OutletContext = createContext(null);

export function OutletProvider({ value, children }) {
  return (
    <OutletContext.Provider value={value}>
      {children}
    </OutletContext.Provider>
  );
}

export function Outlet() {
  const children = useContext(OutletContext);
  return children;
}

// --- Link component shim ---
export function Link({ to, children, ...props }) {
  return (
    <NextLink href={to} {...props}>
      {children}
    </NextLink>
  );
}

// --- NavLink component shim ---
export function NavLink({ to, children, className, style, end, ...props }) {
  const pathname = usePathname();
  
  const currentPath = pathname || '/';
  
  let isActive = false;
  if (to) {
    if (end) {
      isActive = currentPath === to;
    } else {
      isActive = currentPath.startsWith(to);
    }
  }

  // Resolve className
  let resolvedClassName = '';
  if (typeof className === 'function') {
    resolvedClassName = className({ isActive });
  } else if (className) {
    resolvedClassName = className;
  }
  
  // Resolve style
  let resolvedStyle = undefined;
  if (typeof style === 'function') {
    resolvedStyle = style({ isActive });
  } else if (style) {
    resolvedStyle = style;
  }

  // Resolve children (React Router v6 supports function children)
  let resolvedChildren = children;
  if (typeof children === 'function') {
    resolvedChildren = children({ isActive });
  }

  return (
    <NextLink href={to} className={resolvedClassName} style={resolvedStyle} {...props}>
      {resolvedChildren}
    </NextLink>
  );
}

// --- useNavigate hook shim ---
export function useNavigate() {
  const router = useRouter();
  
  return useCallback((to, options) => {
    if (typeof to === 'number') {
      if (to === -1) {
        router.back();
      }
      return;
    }
    
    if (options?.replace) {
      router.replace(to);
    } else {
      router.push(to);
    }
  }, [router]);
}

// --- useParams hook shim ---
export function useParams() {
  const params = useNextParams();
  return params || {};
}

// --- useSearchParams hook shim ---
export function useSearchParams() {
  const nextSearchParams = useNextSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const setSearchParams = useCallback((newParams, options) => {
    const params = new URLSearchParams(nextSearchParams?.toString() || '');
    
    if (newParams instanceof URLSearchParams || typeof newParams?.entries === 'function') {
      const entries = newParams instanceof URLSearchParams ? Array.from(newParams.entries()) : Object.entries(newParams);
      for (const [key, val] of entries) {
        params.set(key, val);
      }
    } else if (newParams && typeof newParams === 'object') {
      Object.keys(newParams).forEach(key => {
        if (newParams[key] === undefined || newParams[key] === null) {
          params.delete(key);
        } else {
          params.set(key, String(newParams[key]));
        }
      });
    }
    
    const searchStr = params.toString();
    const url = `${pathname}${searchStr ? `?${searchStr}` : ''}`;
    
    if (options?.replace) {
      router.replace(url);
    } else {
      router.push(url);
    }
  }, [nextSearchParams, pathname, router]);

  return [nextSearchParams, setSearchParams];
}

// --- useLocation hook shim ---
export function useLocation() {
  const pathname = usePathname();
  const searchParams = useNextSearchParams();
  
  return {
    pathname: pathname || '/',
    search: searchParams ? `?${searchParams.toString()}` : '',
    hash: '',
    state: null,
  };
}

// --- Navigate redirect component shim ---
export function Navigate({ to, replace }) {
  const router = useRouter();
  
  useEffect(() => {
    if (replace) {
      router.replace(to);
    } else {
      router.push(to);
    }
  }, [router, to, replace]);
  
  return null;
}

// --- Dummies/stubs for browser routers ---
export function createBrowserRouter(routes) {
  return routes;
}
export function RouterProvider() {
  return null;
}
export function Routes({ children }) {
  return children;
}
export function Route() {
  return null;
}
