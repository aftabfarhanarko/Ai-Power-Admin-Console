'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { getTokens } from '@/hooks/useToken';
import { getSuperadminTokens } from '@/features/superadminAuth/superadminAuthSlice';
import { decodeJWT } from '@/utils/jwt-decoder';

const App = dynamic(() => import('@/App'), { ssr: false });

export default function RootPage() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // 1. Check Super Admin session
    const { accessToken: superadminToken } = getSuperadminTokens();
    if (superadminToken) {
      try {
        const { payload } = decodeJWT(superadminToken);
        if (payload?.role === 'SUPER_ADMIN') {
          router.replace('/superadmin');
          return;
        }
      } catch (e) {
        console.error(e);
      }
    }

    // 2. Check Merchant session
    const { accessToken: merchantToken } = getTokens();
    if (!merchantToken) {
      // Unauthenticated -> Redirect to login
      router.replace('/login');
      return;
    }

    // Check if token in merchant storage belongs to a Super Admin
    try {
      const { payload } = decodeJWT(merchantToken);
      if (payload?.role === 'SUPER_ADMIN') {
        router.replace('/superadmin');
        return;
      }
    } catch (e) {
      console.error(e);
    }

    // Merchant authenticated -> Render App
    setIsReady(true);
  }, [router]);

  if (!isReady) {
    return null;
  }

  return <App />;
}