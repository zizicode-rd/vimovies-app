import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { buildMetadata } from '@/lib/seo';
import { getTranslations, t } from '@/lib/i18n';

export const metadata: Metadata = buildMetadata({
  locale: 'es',
  path: '/es/metodologia',
  title: 'Metodología de análisis y puntuación de monitores',
  description: 'Cómo verificamos especificaciones técnicas, calculamos puntuaciones por uso y mantenemos nuestro catálogo de monitores para gaming, oficina y edición.',
  type: 'article',
});

export default async function MethodologyPage() {
  const translations = await getTranslations('es');

  return (
    <>
      <Header locale="es" />
      <main className="container" style={{ padding: '64px 0 120px' }}>
        <span className="eyebrow">Metodología</span>
        <h1 className="section-title" style={{ marginBottom: 24 }}>Cómo trabajamos en Vimovies</h1>
        <div className="prose" style={{ maxWidth: 720 }}>
          <p style={{ fontSize: '17px', lineHeight: 1.7, color: 'var(--color-gray-700)', marginBottom: 32 }}>
            Cada ficha de monitor en Vimovies parte de la hoja técnica oficial del fabricante. Contrastamos resolución, tasa de refresco, panel, brillo, conectividad y otras especificaciones clave para detectar errores o exageraciones.
          </p>
          <h2 style={{ fontSize: '22px', marginTop: 40, marginBottom: 16 }}>Puntuaciones por perfil</h2>
          <p style={{ fontSize: '16px', lineHeight: 1.7, color: 'var(--color-gray-700)', marginBottom: 24 }}>
            Asignamos tres puntuaciones (gaming, oficina y edición) combinando los datos técnicos con reglas ponderadas para cada uso. No se trata de una nota subjetiva: refleja qué tan adecuado es el monitor según el caso de uso.
          </p>
          <h2 style={{ fontSize: '22px', marginTop: 40, marginBottom: 16 }}>Actualización de datos</h2>
          <p style={{ fontSize: '16px', lineHeight: 1.7, color: 'var(--color-gray-700)', marginBottom: 24 }}>
            Revisamos precios, disponibilidad y nuevos lanzamientos semanalmente. Las comparativas y hubs de selección se recalculan automáticamente cuando la base de datos cambia.
          </p>
          <h2 style={{ fontSize: '22px', marginTop: 40, marginBottom: 16 }}>Independencia</h2>
          <p style={{ fontSize: '16px', lineHeight: 1.7, color: 'var(--color-gray-700)' }}>
            {t(translations, 'footer.tagline')}
          </p>
        </div>
      </main>
      <Footer locale="es" />
    </>
  );
}
