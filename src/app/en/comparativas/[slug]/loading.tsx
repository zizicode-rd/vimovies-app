import { MonitorCompareSkeleton } from '@/components/ui/skeletons/MonitorCompareSkeleton';

export default function Loading() {
  return (
    <section className="container" style={{ padding: '32px 0' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ height: '32px', width: '320px', background: 'var(--color-paper, #f4f4f6)', borderRadius: '6px' }} />
        <div style={{ height: '16px', width: '480px', background: 'var(--color-paper, #f4f4f6)', borderRadius: '6px' }} />
      </div>
      <MonitorCompareSkeleton columns={3} rows={8} />
    </section>
  );
}
