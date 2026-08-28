'use client';

import { Suspense } from 'react';
import Loader from './Loader';

function LoaderInner() {
  // Client hooks that depend on navigation can only run under Suspense
  return <Loader />;
}

export default function GlobalLoader() {
  return (
    <Suspense fallback={null}>
      <LoaderInner />
    </Suspense>
  );
}
