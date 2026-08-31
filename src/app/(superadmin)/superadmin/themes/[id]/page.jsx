'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const PageComponent = dynamic(() => import('@/views/superadmin/theme-detail'), { ssr: false });

export default function Page() {
  return <PageComponent />;
}
