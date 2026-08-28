'use client';

import { useEffect, useState } from 'react';

export default function PostProgress() {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    function update() {
      const h = document.documentElement;
      const st = h.scrollTop || document.body.scrollTop;
      const sh = h.scrollHeight - h.clientHeight;
      setWidth(sh > 0 ? (st / sh) * 100 : 0);
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
    return () => window.removeEventListener('scroll', update);
  }, []);

  return (
    <div className="read-progress" style={{ position: 'sticky', top: 0, zIndex: 80, height: '3px', background: 'var(--color-line)' }}>
      <i style={{ display: 'block', height: '100%', width: `${width}%`, background: 'var(--color-red)', transition: 'width 0.1s linear' }} />
    </div>
  );
}
