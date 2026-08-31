'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const PageComponent = dynamic(() => import('@/views/superadmin/superadmin-components/superadmin-detail'), { ssr: false });

export default function Page() {
  return <PageComponent />;
}
