'use client';

import React, { createContext, useContext, useEffect, useCallback } from 'react';
import NextLink from 'next/link';
import { useRouter, useParams as useNextParams, useSearchParams as useNextSearchParams, usePathname } from 'next/navigation';

// --- Outlet & Params Context shims ---
const OutletContext = createContext(null);
const ParamsContext = createContext({});

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
      isActive = currentPath === to || (to !== '/' && currentPath.startsWith(to));
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
  const nextParams = useNextParams() || {};
  const matchedParams = useContext(ParamsContext) || {};
  return { ...nextParams, ...matchedParams };
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

// --- Path Matching Helper ---
function matchRoutePath(pattern, pathname) {
  if (!pattern) return null;
  if (pattern === '*') return { isMatch: true, params: {} };
  
  const cleanPattern = pattern.length > 1 && pattern.endsWith('/') ? pattern.slice(0, -1) : pattern;
  const cleanPathname = pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;

  if (cleanPattern === cleanPathname) {
    return { isMatch: true, params: {} };
  }

  const paramNames = [];
  const regexStr = '^' + cleanPattern.replace(/:([a-zA-Z0-9_]+)/g, (_, name) => {
    paramNames.push(name);
    return '([^/]+)';
  }) + '$';

  try {
    const regex = new RegExp(regexStr);
    const match = cleanPathname.match(regex);
    if (match) {
      const params = {};
      paramNames.forEach((name, index) => {
        params[name] = match[index + 1];
      });
      return { isMatch: true, params };
    }
  } catch (e) {
    // Fallback if regex fails
  }

  return null;
}

// --- RouterProvider & Route stubs ---
export function createBrowserRouter(routes) {
  return routes;
}

export function RouterProvider({ router }) {
  const pathname = usePathname() || '/';

  const routesList = Array.isArray(router) ? router : [];
  
  // Find top route (e.g. path "/")
  const topRoute = routesList.find(r => r.path === '/' || r.path === '') || routesList[0];
  
  if (!topRoute) return null;

  const children = topRoute.children || [];
  
  let matchedChild = null;
  let matchedParams = {};

  for (const child of children) {
    if (child.path === '*') continue;
    const res = matchRoutePath(child.path, pathname);
    if (res?.isMatch) {
      matchedChild = child;
      matchedParams = res.params;
      break;
    }
  }

  if (!matchedChild) {
    const wildcardChild = children.find(c => c.path === '*');
    if (wildcardChild) {
      matchedChild = wildcardChild;
    }
  }

  const childElement = matchedChild ? matchedChild.element : null;

  return (
    <ParamsContext.Provider value={matchedParams}>
      <OutletProvider value={childElement}>
        {topRoute.element || childElement}
      </OutletProvider>
    </ParamsContext.Provider>
  );
}

export function Routes({ children }) {
  return children;
}
export function Route() {
  return null;
}
