import { MonitorCatalogSkeleton } from '@/components/ui/skeletons/MonitorCatalogSkeleton';

export default function Loading() {
  return (
    <section className="container" style={{ padding: '32px 0' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ height: '32px', width: '260px', background: 'var(--color-paper, #f4f4f6)', borderRadius: '6px' }} />
        <div style={{ height: '16px', width: '420px', background: 'var(--color-paper, #f4f4f6)', borderRadius: '6px' }} />
      </div>
      <MonitorCatalogSkeleton count={8} />
    </section>
  );
}
