import { apiFetch } from '@/lib/api';
import { monitorOgImage } from '@/lib/og';

export const alt = 'Ficha técnica del monitor en Vimonitors';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

interface Params { params: Promise<{ brand: string; slug: string }> }

export default async function Image({ params }: Params) {
  const { slug } = await params;
  const monitor = await apiFetch<any>(`/api/v1/monitors/${slug}`, { lang: 'es' });
  return monitorOgImage(monitor, 'es');
}
