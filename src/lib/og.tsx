import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

function getMonitorData(monitor: any) {
  const brand = monitor?.brand?.name ?? '';
  const model = monitor?.model_name ?? '';
  const base = monitor?.base_specs ?? {};
  const hz = base.refresh_rate_hz;
  const resolution = base.resolution_width && base.resolution_height
    ? `${base.resolution_width}x${base.resolution_height}`
    : '';
  const panel = base.panel_type ?? '';
  const inches = base.screen_size_inches ? `${base.screen_size_inches}"` : '';
  const response = base.response_time_ms ? `${base.response_time_ms}ms` : '';
  return { brand, model, hz, resolution, panel, inches, response };
}

export function monitorOgImage(monitor: any, locale: 'es' | 'en') {
  const { brand, model, hz, resolution, panel, inches, response } = getMonitorData(monitor);
  const badge = [hz ? `${hz}Hz` : '', resolution, panel, inches, response].filter(Boolean).join(' • ');
  const subtitle = locale === 'en' ? 'Verified monitor specs' : 'Especificaciones técnicas verificadas';

  return new ImageResponse(
    (
      <div
        style={{
          background: '#0b0c0f',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px',
          color: '#ffffff',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 28, color: '#ef4444', fontWeight: 900, letterSpacing: '0.1em' }}>VIMONITORS</span>
          <span style={{ fontSize: 22, background: '#1f2937', padding: '10px 18px', borderRadius: 8, color: '#e5e7eb' }}>
            {hz ? `${hz}Hz` : resolution}
          </span>
        </div>
        <div>
          <p style={{ fontSize: 24, color: '#9ca3af', marginBottom: 12 }}>{brand}</p>
          <h1 style={{ fontSize: 56, fontWeight: 800, lineHeight: 1.1, marginBottom: 20 }}>{model}</h1>
          <p style={{ fontSize: 28, color: '#d1d5db' }}>{badge || subtitle}</p>
        </div>
        <div style={{ display: 'flex', gap: 16, fontSize: 20, color: '#6b7280' }}>
          <span>{subtitle}</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
