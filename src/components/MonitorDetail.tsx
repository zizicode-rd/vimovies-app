import type { ReactElement } from 'react';
import Link from 'next/link';
import ImageSlider from './ImageSlider';
import ScoreCards from './ScoreCards';
import { getTranslations, t } from '@/lib/i18n';
import type { MonitorPublic } from '@/types/api';
import styles from './MonitorDetail.module.scss';

function formatScore(n: number) {
  return n.toFixed(1);
}

function scoreColors(value: number) {
  if (value >= 80) return { number: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' };
  if (value >= 60) return { number: '#d97706', bg: '#fffbeb', border: '#fde68a' };
  return { number: '#dc2626', bg: '#fef2f2', border: '#fecaca' };
}

function formatPorts(ports: any, portFallback: string): string {
  if (!ports) return '—';
  if (typeof ports === 'string') return ports;
  if (Array.isArray(ports)) {
    return ports
      .map((p) => {
        if (typeof p === 'string') return p;
        if (p && typeof p === 'object') {
          const obj = p as Record<string, any>;
          const count = obj.count ?? obj.quantity ?? 1;
          const name = obj.name ?? obj.type ?? portFallback;
          const version = obj.version ? ` ${obj.version}` : '';
          return `${count}x ${name}${version}`;
        }
        return String(p);
      })
      .join(', ');
  }
  if (typeof ports === 'object') {
    const entries = Object.entries(ports as Record<string, unknown>);
    return entries
      .map(([name, value]) => {
        if (value === false || value === null || value === undefined) return '';
        if (value && typeof value === 'object') {
          const obj = value as Record<string, any>;
          const count = obj.count ?? obj.quantity ?? 1;
          const version = obj.version ? ` ${obj.version}` : '';
          return `${count}x ${name}${version}`;
        }
        if (typeof value === 'number' && value > 0) return `${value}x ${name}`;
        if (typeof value === 'string' && value) return value;
        if (value === true) return name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
        return '';
      })
      .join(', ');
  }
  return '—';
}

function youtubeEmbedUrl(url: string): string {
  const short = url.match(/youtu\.be\/([\w-]+)/);
  const long = url.match(/v=([\w-]+)/);
  const id = short?.[1] ?? long?.[1];
  return id ? `https://www.youtube.com/embed/${id}` : url;
}

function getImages(monitor: MonitorPublic): { src: string; alt: string }[] {
  const media = (monitor.media ?? []).map((m) => {
    if (typeof m === 'string') return { src: m, alt: monitor.model_name };
    return { src: m.cdn_url, alt: m.alt ?? monitor.model_name };
  }).filter((m) => !!m.src);

  const seen = new Set<string>();
  const unique: { src: string; alt: string }[] = [];
  for (const m of media) {
    if (!seen.has(m.src)) {
      seen.add(m.src);
      unique.push(m);
    }
  }

  if (monitor.main_image_url && !seen.has(monitor.main_image_url)) {
    unique.unshift({ src: monitor.main_image_url, alt: monitor.model_name });
  }

  return unique.length ? unique : (monitor.main_image_url ? [{ src: monitor.main_image_url, alt: monitor.model_name }] : []);
}

interface SpecSectionProps {
  title: string;
  icon: ReactElement;
  rows: { label: string; value: string }[];
}

function SpecSection({ title, icon, rows }: SpecSectionProps) {
  if (rows.length === 0) return null;
  return (
    <div className={styles.specCard}>
      <h3 className={styles.specCardTitle}><span className={styles.specIcon}>{icon}</span> {title}</h3>
      <div className={styles.specList}>
        {rows.map((row, i) => (
          <div key={i} className={styles.specRow}>
            <span className={styles.specLabel}>{row.label}</span>
            <span className={styles.specValue}>{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function MonitorDetail({
  monitor,
  locale,
  brand,
}: {
  monitor: MonitorPublic;
  locale: 'es' | 'en';
  brand: string;
}) {
  const translations = await getTranslations(locale);
  const base = locale === 'en' ? '/en' : '/es';
  const name = `${monitor.brand?.name ?? brand} ${monitor.model_name}`;
  const scoreLabels: Record<string, string> = {
    gaming: t(translations, 'monitor.profiles.gaming', 'Gaming'),
    office: t(translations, 'monitor.profiles.office', 'Office'),
    editing: t(translations, 'monitor.profiles.editing', 'Editing'),
  };
  const baseSpecs = monitor.base_specs;
  const ext = monitor.extended_specs;
  const images = getImages(monitor);

  const scoreWords = {
    excellent: t(translations, 'monitor.scoreExcellent', 'Excelente'),
    good: t(translations, 'monitor.scoreGood', 'Bueno'),
    fair: t(translations, 'monitor.scoreFair', 'Aceptable'),
  };

  const labels = {
    inches: t(translations, 'monitor.labels.inches', 'Pulgadas'),
    resolution: t(translations, 'monitor.labels.resolution', 'Resolución'),
    refreshRate: t(translations, 'monitor.labels.refreshRate', 'Tasa de refresco'),
    panel: t(translations, 'monitor.labels.panel', 'Panel'),
    responseTime: t(translations, 'monitor.labels.responseTime', 'Tiempo de respuesta'),
    hdr: t(translations, 'monitor.labels.hdr', 'HDR'),
    brightness: t(translations, 'monitor.labels.brightness', 'Brillo'),
    contrast: t(translations, 'monitor.labels.contrast', 'Contraste'),
    dciP3: t(translations, 'monitor.labels.dciP3', 'DCI-P3'),
    srgb: t(translations, 'monitor.labels.srgb', 'sRGB'),
    colorDepth: t(translations, 'monitor.labels.colorDepth', 'Profundidad de color'),
    bitDepth: t(translations, 'monitor.labels.bitDepth', 'Bits'),
    curvature: t(translations, 'monitor.labels.curvature', 'Curvatura'),
    usbPd: t(translations, 'monitor.labels.usbPd', 'USB-PD'),
    speakers: t(translations, 'monitor.labels.speakers', 'Altavoces'),
    kvm: t(translations, 'monitor.labels.kvm', 'KVM'),
    vesa: t(translations, 'monitor.labels.vesa', 'VESA'),
    ports: t(translations, 'monitor.labels.ports', 'Puertos'),
    vrr: t(translations, 'monitor.labels.vrr', 'VRR'),
    adaptiveSync: t(translations, 'monitor.labels.adaptiveSync', 'Adaptive Sync'),
    aspectRatio: t(translations, 'monitor.labels.aspectRatio', 'Relación de aspecto'),
    overclocking: t(translations, 'monitor.labels.overclocking', 'Overclocking'),
    syncTechnology: t(translations, 'monitor.labels.syncTechnology', 'Tecnología sync'),
    tilt: t(translations, 'monitor.labels.tilt', 'Inclinación'),
    swivel: t(translations, 'monitor.labels.swivel', 'Giro'),
    pivot: t(translations, 'monitor.labels.pivot', 'Pivote'),
    heightAdjust: t(translations, 'monitor.labels.heightAdjust', 'Ajuste de altura'),
    headphone: t(translations, 'monitor.labels.headphone', 'Jack audio'),
    hdmi: t(translations, 'monitor.labels.hdmi', 'HDMI'),
    displayport: t(translations, 'monitor.labels.displayport', 'DisplayPort'),
    usb: t(translations, 'monitor.labels.usb', 'USB'),
    features: t(translations, 'monitor.labels.features', 'Características'),
  };

  const sections = {
    screenAndImage: t(translations, 'monitor.screenAndImage', 'Pantalla e Imagen'),
    performance: t(translations, 'monitor.performance', 'Rendimiento'),
    colorAndGamut: t(translations, 'monitor.colorAndGamut', 'Color y Gama'),
    connectivityAndPorts: t(translations, 'monitor.connectivityAndPorts', 'Conectividad y Puertos'),
    ergonomics: t(translations, 'monitor.ergonomics', 'Ergonomía'),
    gaming: t(translations, 'monitor.gaming', 'Gaming'),
    audioPower: t(translations, 'monitor.audioPower', 'Audio y Alimentación'),
    specs: t(translations, 'monitor.specsTitle', 'Especificaciones técnicas'),
    video: t(translations, 'monitor.videoReview', 'Video review'),
    verdict: t(translations, 'monitor.verdict', 'Veredicto'),
    navSpecs: t(translations, 'monitor.specs', 'Especificaciones'),
    navVerdict: t(translations, 'monitor.verdict', 'Veredicto'),
    navAlt: t(translations, 'monitor.alternatives', 'Alternativas'),
    compareCta: t(translations, 'monitor.compareCta', 'Comparar contra otro monitor'),
    buyCta: t(translations, 'monitor.buyCta', 'Ver precio / Dónde comprar'),
  };

  const yes = t(translations, 'monitor.yes', 'Sí');
  const no = t(translations, 'monitor.no', 'No');
  const flat = t(translations, 'monitor.flat', 'Plano');
  const portFallback = t(translations, 'monitor.portFallback', 'puerto');

  const profileEntries = [
    { key: 'gaming', value: monitor.scores?.gaming ?? 0 },
    { key: 'office', value: monitor.scores?.office ?? 0 },
    { key: 'editing', value: monitor.scores?.editing ?? 0 },
  ];
  const topProfile = profileEntries.reduce((a, b) => (a.value >= b.value ? a : b), profileEntries[0]).key;
  const profileLabel = t(translations, `catalog.sort.${topProfile}`, topProfile.charAt(0).toUpperCase() + topProfile.slice(1));

  const verdictTemplate = t(translations, 'monitor.verdictFallback', 'Una opción sólida para uso {profile_top}, con panel {panel} y {refreshRate}Hz de tasa de refresco.') as string;
  const verdictFallback = verdictTemplate
    .replace(/\{profile_top\}/g, profileLabel)
    .replace(/\{panel\}/g, baseSpecs?.panel_type ?? '—')
    .replace(/\{refreshRate\}/g, String(baseSpecs?.refresh_rate_hz ?? '—'));

  const chips = [
    baseSpecs?.screen_size_inches ? `${baseSpecs.screen_size_inches}"` : undefined,
    baseSpecs?.resolution_width && baseSpecs?.resolution_height ? `${baseSpecs.resolution_width}x${baseSpecs.resolution_height}` : undefined,
    baseSpecs?.refresh_rate_hz ? `${baseSpecs.refresh_rate_hz}Hz` : undefined,
    baseSpecs?.panel_type,
    baseSpecs?.response_time_ms ? `${baseSpecs.response_time_ms}ms` : undefined,
    baseSpecs?.has_vrr_sync ? 'VRR' : undefined,
  ].filter(Boolean) as string[];

  const toStr = (v: unknown) => {
    if (v === null || v === undefined) return '';
    if (typeof v === 'boolean') return v ? yes : no;
    return String(v);
  };

  const onlyValue = (rows: { label: string; value: unknown }[]) =>
    rows.filter((r) => r.value !== '' && r.value !== null && r.value !== undefined).map((r) => ({ label: r.label, value: toStr(r.value) }));

  const screenRows = onlyValue([
    { label: labels.inches, value: baseSpecs?.screen_size_inches ? `${baseSpecs.screen_size_inches}"` : '' },
    { label: labels.resolution, value: baseSpecs?.resolution_width && baseSpecs?.resolution_height ? `${baseSpecs.resolution_width}x${baseSpecs.resolution_height}` : '' },
    { label: labels.aspectRatio, value: baseSpecs?.aspect_ratio },
    { label: labels.refreshRate, value: baseSpecs?.refresh_rate_hz ? `${baseSpecs.refresh_rate_hz}Hz` : '' },
    { label: labels.panel, value: baseSpecs?.panel_type },
    { label: labels.responseTime, value: baseSpecs?.response_time_ms ? `${baseSpecs.response_time_ms}ms` : '' },
    { label: labels.hdr, value: baseSpecs?.hdr_support },
    { label: labels.brightness, value: baseSpecs?.brightness_nits ? `${baseSpecs.brightness_nits} nits` : '' },
    { label: labels.contrast, value: baseSpecs?.contrast_ratio_static ? `${baseSpecs.contrast_ratio_static}:1` : '' },
  ]);

  const performanceRows = onlyValue([
    { label: labels.refreshRate, value: baseSpecs?.refresh_rate_hz ? `${baseSpecs.refresh_rate_hz}Hz` : '' },
    { label: labels.responseTime, value: baseSpecs?.response_time_ms ? `${baseSpecs.response_time_ms}ms` : '' },
    { label: labels.adaptiveSync, value: ext?.gaming?.sync_technology ?? ext?.gaming?.g_sync ?? ext?.gaming?.free_sync },
    { label: labels.overclocking, value: ext?.gaming?.overclocking },
  ]);

  const colorRows = onlyValue([
    { label: labels.srgb, value: baseSpecs?.color_gamut_srgb_pct ? `${baseSpecs.color_gamut_srgb_pct}%` : '' },
    { label: labels.dciP3, value: baseSpecs?.color_gamut_dci_p3_pct ? `${baseSpecs.color_gamut_dci_p3_pct}%` : '' },
    { label: labels.colorDepth, value: ext?.color?.color_depth ?? ext?.color_depth },
    { label: labels.bitDepth, value: ext?.color?.bit_depth ?? ext?.bit_depth },
    { label: labels.curvature, value: ext?.curvatura },
  ]);

  const connectivityRows = onlyValue([
    { label: labels.hdmi, value: ext?.connectivity?.hdmi },
    { label: labels.displayport, value: ext?.connectivity?.displayport },
    { label: labels.usb, value: ext?.connectivity?.usb },
    { label: labels.headphone, value: ext?.connectivity?.headphone_jack },
    { label: labels.ports, value: formatPorts(ext?.connectivity ?? ext?.ports, portFallback) },
  ]);

  const audioPowerRows = onlyValue([
    { label: labels.speakers, value: baseSpecs?.has_speakers },
    { label: labels.kvm, value: baseSpecs?.has_kvm },
    { label: labels.usbPd, value: baseSpecs?.usb_pd_wattage ? `${baseSpecs.usb_pd_wattage}W` : '' },
    { label: labels.vesa, value: baseSpecs?.vesa_mount },
  ]);

  const ergonomicsRows = onlyValue([
    { label: labels.tilt, value: ext?.ergonomics?.tilt },
    { label: labels.swivel, value: ext?.ergonomics?.swivel },
    { label: labels.pivot, value: ext?.ergonomics?.pivot },
    { label: labels.heightAdjust, value: ext?.ergonomics?.height_adjust },
    { label: labels.vesa, value: baseSpecs?.vesa_mount ?? ext?.ergonomics?.vesa },
  ]);

  const gamingRows = onlyValue([
    { label: labels.vrr, value: baseSpecs?.has_vrr_sync },
    { label: labels.syncTechnology, value: ext?.gaming?.sync_technology },
    { label: labels.overclocking, value: ext?.gaming?.overclocking },
    { label: labels.features, value: Array.isArray(ext?.gaming?.features) ? ext.gaming.features.join(', ') : ext?.gaming?.features },
  ]);

  return (
    <>
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroInner}>
            <div className={styles.media}>
              <ImageSlider images={images} brand={monitor.brand?.name ?? brand} />
            </div>

            <div className={styles.info}>
              <div className={styles.kicker}>
                <span className={styles.badge}>{baseSpecs?.refresh_rate_hz ? `${baseSpecs.refresh_rate_hz}Hz ${baseSpecs.panel_type ?? ''}` : (baseSpecs?.panel_type ?? 'Monitor')}</span>
              </div>

              <h1 className={styles.title}>{name}</h1>
              <p className={styles.summary}>{monitor.meta_description}</p>

              <div className={styles.chips}>
                {chips.map((chip) => (
                  <span key={chip} className={styles.chip}>{chip}</span>
                ))}
              </div>

              <div className={styles.actions}>
                <a href="#specs" className={styles.actionLink}>
                  {sections.navSpecs}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                </a>
                <a href="#verdict" className={styles.actionLink}>
                  {sections.navVerdict}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                </a>
                <Link href={`${base}/monitores`} className={styles.actionLink}>
                  {sections.navAlt}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M17 7H7M17 7V17" /></svg>
                </Link>
              </div>

              {monitor.scores && (
                <ScoreCards
                  locale={locale}
                  scores={[
                    { key: 'gaming', label: scoreLabels.gaming, value: monitor.scores.gaming },
                    { key: 'office', label: scoreLabels.office, value: monitor.scores.office },
                    { key: 'editing', label: scoreLabels.editing, value: monitor.scores.editing },
                  ]}
                />
              )}

              <div className={styles.buyBox}>
                <Link href={`${base}/comparativas?a=${monitor.slug}`} className={styles.btnPrimary}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3" /><path d="M16 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3" /><line x1="12" y1="8" x2="12" y2="16" /></svg>
                  {sections.compareCta}
                </Link>
                <Link href={`${base}/monitores`} className={styles.btnSecondary}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
                  {sections.buyCta}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {monitor.video_embed && monitor.video_embed.url && (
        <section className={styles.videoSection}>
          <div className="container">
            <h2 className={styles.sectionTitle}>{monitor.video_embed.title ?? sections.video}</h2>
            <div className={styles.videoWrap}>
              <iframe
                src={youtubeEmbedUrl(monitor.video_embed.url)}
                title={monitor.video_embed.title ?? 'Video review'}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </section>
      )}

      <section id="specs" className={styles.specs}>
        <div className="container">
          <h2 className={styles.sectionTitle}>{sections.specs}</h2>
          <div className={styles.specCards}>
            <SpecSection
              title={sections.screenAndImage}
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>}
              rows={screenRows}
            />
            <SpecSection
              title={sections.performance}
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>}
              rows={performanceRows}
            />
            <SpecSection
              title={sections.colorAndGamut}
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 2v20" /><path d="M2 12h20" /></svg>}
              rows={colorRows}
            />
            <SpecSection
              title={sections.connectivityAndPorts}
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" /><path d="M15 2v2" /><path d="M15 20v2" /><path d="M2 15h2" /><path d="M20 15h2" /></svg>}
              rows={connectivityRows}
            />
            <SpecSection
              title={sections.ergonomics}
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4" /><path d="M12 18v4" /><path d="M4.93 4.93l2.83 2.83" /><path d="M16.24 16.24l2.83 2.83" /><path d="M2 12h4" /><path d="M18 12h4" /><path d="M4.93 19.07l2.83-2.83" /><path d="M16.24 7.76l2.83-2.83" /></svg>}
              rows={ergonomicsRows}
            />
            <SpecSection
              title={sections.gaming}
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2" /><path d="M6 12h4" /><path d="M8 10v4" /><path d="M15 13h.01" /><path d="M18 11h.01" /></svg>}
              rows={gamingRows}
            />
            <SpecSection
              title={sections.audioPower}
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>}
              rows={audioPowerRows}
            />
          </div>

          <div id="verdict" className={styles.verdict}>
            <h3 className={styles.verdictTitle}>{sections.verdict}</h3>
            <p className={styles.verdictText}>
              {monitor.meta_description ? `${monitor.meta_description} ${verdictFallback}` : verdictFallback}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
