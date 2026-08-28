'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { OutletProvider } from 'react-router-dom';

const SuperAdminPrivateRoute = dynamic(() => import('@/hooks/useSuperAdminPrivateRoute'), { ssr: false });
const SuperAdminLayout = dynamic(() => import('@/layout/superadmin/layout'), { ssr: false });

export default function SuperadminLayout({ children }) {
  return (
    <SuperAdminPrivateRoute>
      <OutletProvider value={children}>
        <SuperAdminLayout />
      </OutletProvider>
    </SuperAdminPrivateRoute>
  );
}
