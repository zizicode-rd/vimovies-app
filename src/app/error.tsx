'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>Algo salió mal</h1>
      <p style={{ color: 'var(--color-gray-700)', marginBottom: '24px' }}>
        Error: {error.message || 'Unknown error'}
      </p>
      <button
        onClick={reset}
        style={{
          padding: '12px 24px',
          borderRadius: '8px',
          border: 'none',
          background: 'var(--color-ink)',
          color: '#fff',
          cursor: 'pointer',
        }}
      >
        Reintentar
      </button>
    </div>
  );
}
