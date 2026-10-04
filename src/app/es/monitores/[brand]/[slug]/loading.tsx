import { MonitorDetailSkeleton } from '@/components/ui/skeletons/MonitorDetailSkeleton';

export default function Loading() {
  return (
    <section className="container" style={{ padding: '32px 0' }}>
      <MonitorDetailSkeleton />
    </section>
  );
}
