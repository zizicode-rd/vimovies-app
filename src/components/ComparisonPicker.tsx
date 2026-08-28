'use client';

import { useState, useRef, useEffect } from 'react';
import type { MonitorListItem } from '@/types/api';
import styles from './ComparisonPicker.module.scss';

function formatName(m: MonitorListItem) {
  if (m.model_name.toLowerCase().startsWith(m.brand_name.toLowerCase())) return m.model_name;
  return `${m.brand_name} ${m.model_name}`;
}

export default function ComparisonPicker({
  options,
  value,
  onChange,
  label,
  placeholder,
}: {
  options: MonitorListItem[];
  value: string;
  onChange: (slug: string) => void;
  label: string;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = options.find((m) => m.slug === value);

  const filtered = options.filter((m) => {
    const q = query.toLowerCase();
    return m.model_name.toLowerCase().includes(q) || m.brand_name.toLowerCase().includes(q);
  });

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  function select(slug: string, name: string) {
    onChange(slug);
    setQuery(name);
    setOpen(false);
  }

  return (
    <div className={styles.picker} ref={ref}>
      <label className={styles.label}>{label}</label>
      <div className={styles.inputWrap}>
        <input
          ref={inputRef}
          type="text"
          className={styles.input}
          placeholder={placeholder}
          value={open ? query : selected ? formatName(selected) : ''}
          onFocus={() => {
            setOpen(true);
            setQuery('');
          }}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          readOnly={!open}
        />
        {open && (
          <ul className={styles.list} role="listbox">
            {filtered.map((m) => {
              const name = formatName(m);
              return (
                <li
                  key={m.id}
                  className={`${styles.item} ${m.slug === value ? styles.active : ''}`}
                  onClick={() => select(m.slug, name)}
                  role="option"
                  aria-selected={m.slug === value}
                >
                  <span className={styles.brand}>{m.brand_name}</span>
                  <span className={styles.model}>{m.model_name}</span>
                </li>
              );
            })}
            {filtered.length === 0 && (
              <li className={styles.empty}>No se encontraron monitores</li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
