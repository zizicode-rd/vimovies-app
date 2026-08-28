import Link from 'next/link';
import type { PostContentBlock, MonitorListItem } from '@/types/api';
import styles from './BlockRenderer.module.scss';
import ProductCard from './ProductCard';
import Callout from './Callout';
import ComparisonWidget from './ComparisonWidget';

function ArticleMonitorCard({ monitor, base }: { monitor: MonitorListItem; base: string }) {
  const best = Math.max(monitor.scores.gaming, monitor.scores.office, monitor.scores.editing);
  const profile = (
    ['gaming', 'office', 'editing'].find((k) => (monitor.scores as any)[k] === best) ?? 'gaming'
  ) as string;

  return (
    <Link href={`${base}/monitores/${monitor.brand_slug}/${monitor.slug}`} className={styles.monitorCard}>
      <div className={styles.monitorCardImage}>
        {monitor.main_image_url ? (
          <img src={monitor.main_image_url} alt={monitor.model_name} loading="lazy" />
        ) : (
          <div className={styles.monitorCardPh}>{monitor.brand_name}</div>
        )}
      </div>
      <div className={styles.monitorCardBody}>
        <span className={styles.monitorCardBrand}>{monitor.brand_name}</span>
        <h4 className={styles.monitorCardName}>{monitor.model_name}</h4>
        <div className={styles.monitorCardScore}>
          <span className={styles.monitorCardScoreBar} style={{ width: `${best}%` }} />
          <span className={styles.monitorCardScoreValue}>{profile.charAt(0).toUpperCase() + profile.slice(1)} {best.toFixed(1)}</span>
        </div>
      </div>
    </Link>
  );
}

export default function BlockRenderer({
  blocks,
  base,
  relatedMonitors = [],
}: {
  blocks: PostContentBlock[];
  base: string;
  relatedMonitors?: MonitorListItem[];
}) {
  return (
    <>
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'heading':
            return <h2 key={i} id={`block-${i}`} className={styles.heading}>{block.text ?? block.content}</h2>;
          case 'paragraph':
            return <p key={i} className={styles.paragraph}>{block.text ?? block.content}</p>;
          case 'image':
            return (
              <figure key={i} className={styles.figure}>
                {block.src ? (
                  <img src={block.src} alt={block.alt ?? ''} loading="lazy" />
                ) : null}
                {block.alt ? <figcaption>{block.alt}</figcaption> : null}
              </figure>
            );
          case 'table':
            return (
              <div key={i} className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>{block.headers?.map((h, hi) => <th key={hi}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {block.rows?.map((row, ri) => (
                      <tr key={ri}>{row.map((c, ci) => <td key={ci}>{c}</td>)}</tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          case 'list':
          case 'bullets':
            return (
              <div key={i} className={styles.listBlock}>
                {block.content ? <p className={styles.listTitle}>{block.content}</p> : null}
                <ul className={styles.bullets}>
                  {block.items?.map((item, j) => <li key={j}>{item}</li>)}
                </ul>
              </div>
            );
          case 'quote':
            return <blockquote key={i} className={styles.quote}>{block.text ?? block.content}</blockquote>;
          case 'faq':
            return (
              <details key={i} className={styles.faq}>
                <summary>{block.question ?? block.title}</summary>
                <p>{block.answer ?? block.content}</p>
              </details>
            );
          case 'callout':
            return <Callout key={i} title={block.title} content={block.text ?? block.content} variant={block.variant} />;
          case 'product_card':
            return (
              <ProductCard
                key={i}
                badge={block.badge}
                score={block.score}
                name={block.name}
                subtitle={block.subtitle}
                specs={block.specs}
                highlights={block.highlights}
                analysisUrl={block.analysisUrl}
                compareUrl={block.compareUrl}
              />
            );
          case 'monitor_card':
            if (!block.slug) return null;
            const monitor = relatedMonitors.find((m) => m.slug === block.slug);
            if (!monitor) return null;
            return <ArticleMonitorCard key={i} monitor={monitor} base={base} />;
          case 'comparison_widget_cta':
            return <ComparisonWidget key={i} base={base} />;
          default:
            return null;
        }
      })}
    </>
  );
}
