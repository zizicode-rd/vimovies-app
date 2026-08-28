import type { PseoHubPublic, MonitorListItem } from '@/types/api';

export function parseHubFilters(hub: PseoHubPublic): Record<string, any> {
  const raw = (hub as any).filter_query ?? hub.filters;
  if (!raw) return {};
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }
  return raw;
}

function inferredResolution(m: MonitorListItem) {
  const w = m.base_specs?.resolution_width;
  if (w) return w;
  const text = `${m.meta_title} ${m.model_name}`;
  if (/4K|3840x2160|UHD/i.test(text)) return 3840;
  if (/1440p|2560x1440|QHD/i.test(text)) return 2560;
  if (/1080p|1920x1080|FHD/i.test(text)) return 1920;
  return 0;
}

function inferredHz(m: MonitorListItem) {
  const fromSpec = m.base_specs?.refresh_rate_hz;
  if (fromSpec) return fromSpec;
  const text = `${m.meta_title} ${m.model_name}`;
  const match = text.match(/(\d+)Hz/i);
  return match ? Number(match[1]) : 0;
}

function inferredPanel(m: MonitorListItem) {
  return (m.base_specs?.panel_type || m.meta_title || m.model_name || '').toUpperCase();
}

export function applyHubFilters(monitors: MonitorListItem[], filters: Record<string, any>) {
  if (!filters || !Object.keys(filters).length) return monitors;

  return monitors.filter((m) => {
    const w = inferredResolution(m);
    const hz = inferredHz(m);
    const panel = inferredPanel(m);

    for (const [key, value] of Object.entries(filters)) {
      if (value === undefined || value === null || value === '') continue;

      if (key === 'resolution_width' && typeof value === 'number') {
        if (w < value) return false;
        continue;
      }
      if (key === 'min_refresh_rate_hz' && typeof value === 'number') {
        if (hz < value) return false;
        continue;
      }
      if (key === 'panel_type' && typeof value === 'string') {
        if (!panel.includes(value.toUpperCase())) return false;
        continue;
      }
      if (key === 'brand_slug' && typeof value === 'string') {
        if (m.brand_slug !== value) return false;
        continue;
      }
      if (key === 'has_kvm' && value === true) {
        if (!m.base_specs?.has_kvm) return false;
        continue;
      }
    }

    return true;
  });
}

function extractText(value: any): string {
  if (typeof value === 'string') return value;
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') {
    return (
      value.content ??
      value.text ??
      value.question ??
      value.answer ??
      JSON.stringify(value)
    );
  }
  return String(value);
}

function normalizeFaqItem(raw: any): { question: string; answer: string } | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const question = extractText(raw.question ?? raw.q ?? raw.title);
  const answer = extractText(raw.answer ?? raw.a ?? raw.content);
  if (!question && !answer) return null;
  return { question, answer };
}

export function parseFaq(faq: any) {
  if (!faq) return [];
  if (typeof faq === 'string') {
    try {
      return parseFaq(JSON.parse(faq));
    } catch {
      return [];
    }
  }
  if (Array.isArray(faq)) return faq.map(normalizeFaqItem).filter(Boolean) as { question: string; answer: string }[];
  if (typeof faq === 'object') {
    const obj = faq as Record<string, any>;
    for (const key of ['faq', 'faqs', 'items']) {
      if (Array.isArray(obj[key])) return obj[key].map(normalizeFaqItem).filter(Boolean);
      if (typeof obj[key] === 'string') {
        try {
          const parsed = JSON.parse(obj[key]);
          if (Array.isArray(parsed)) return parsed.map(normalizeFaqItem).filter(Boolean);
        } catch {
          // ignore
        }
      }
    }
    return Object.entries(obj).map(([question, answer]) => ({
      question: extractText(question),
      answer: extractText(answer),
    }));
  }
  return [];
}
