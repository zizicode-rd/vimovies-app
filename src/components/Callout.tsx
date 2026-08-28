import type { ReactElement } from 'react';
import styles from './Callout.module.scss';

const icons: Record<string, ReactElement> = {
  info: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
  ),
  warning: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
  ),
  success: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
  ),
};

export default function Callout({
  title,
  content,
  variant = 'info',
}: {
  title?: string;
  content?: string;
  variant?: 'info' | 'warning' | 'success';
}) {
  return (
    <div className={`${styles.callout} ${styles[variant]}`}>
      <div className={styles.icon}>{icons[variant]}</div>
      <div className={styles.body}>
        {title && <h4 className={styles.title}>{title}</h4>}
        {content && <p className={styles.text}>{content}</p>}
      </div>
    </div>
  );
}
