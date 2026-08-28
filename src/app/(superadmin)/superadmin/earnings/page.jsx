'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const PageComponent = dynamic(() => import('@/pages/superadmin/earnings'), { ssr: false });

export default function Page() {
  return <PageComponent />;
}
