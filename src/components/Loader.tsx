'use client';

import { useEffect, useState, useTransition } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import PageLoader from './PageLoader';

export default function Loader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending] = useTransition();
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);
    const t = setTimeout(() => setShow(false), 300);
    return () => clearTimeout(t);
  }, [pathname, searchParams]);

  if (!show && !isPending) return null;

  return <PageLoader label="" />;
}
