export type SupportedLocale = 'es' | 'en';

export interface ApiError {
  code: string;
  message: string;
}

export interface ApiResponse<T> {
  ok: boolean;
  data: T;
  error?: ApiError;
}

export interface I18n<T = Record<string, unknown>> {
  es: T;
  en?: T;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

export interface BrandPublic {
  id: string;
  name: string;
  slug: string;
  logo_url?: string | null;
  description?: string | null;
  website_url?: string | null;
  i18n: I18n<{ name?: string; description?: string }>;
}

export interface MonitorBaseSpecs {
  screen_size_inches: number;
  resolution_width: number;
  resolution_height: number;
  aspect_ratio?: string | null;
  refresh_rate_hz: number;
  response_time_ms?: number | null;
  panel_type: string;
  hdr_support?: string | null;
  has_vrr_sync: boolean;
  color_gamut_srgb_pct?: number | null;
  color_gamut_dci_p3_pct?: number | null;
  brightness_nits?: number | null;
  contrast_ratio_static?: number | null;
  has_kvm: boolean;
  usb_pd_wattage?: number;
  vesa_mount?: string | null;
  has_speakers: boolean;
}

export type ExtendedSpecs = Record<string, Record<string, unknown>>;

export interface MonitorScores {
  gaming: number;
  office: number;
  editing: number;
}

export interface MediaPublic {
  id: string;
  original_url: string;
  cdn_url: string;
  alt: string | null;
  created_at: string;
}

export interface VideoEmbed {
  title?: string;
  url: string;
}

export interface MonitorPublic {
  id: string;
  brand: BrandPublic;
  model_name: string;
  slug: string;
  base_specs: MonitorBaseSpecs;
  extended_specs: ExtendedSpecs;
  scores: MonitorScores;
  main_image_url?: string | null;
  media?: MediaPublic[];
  video_embed?: VideoEmbed | null;
  meta_title: string;
  meta_description: string;
  i18n: I18n<{
    model_name?: string;
    meta_title?: string;
    meta_description?: string;
    extended_specs?: ExtendedSpecs;
  }>;
  created_at: string;
  updated_at: string;
}

export interface MonitorListItem {
  id: string;
  slug: string;
  model_name: string;
  main_image_url?: string | null;
  base_specs?: MonitorBaseSpecs;
  scores: MonitorScores;
  meta_title: string;
  brand_name: string;
  brand_slug: string;
}

export interface ComparisonMonitorRef {
  id: string;
  slug: string;
  model_name: string;
  brand?: { name: string; slug: string };
  brand_name?: string;
  scores: MonitorScores;
}

export interface ComparisonPublic {
  id: string;
  slug: string;
  monitor_a: ComparisonMonitorRef;
  monitor_b: ComparisonMonitorRef;
  winners: { gaming: string; office: string; editing: string };
  deltas: { gaming: number; office: number; editing: number };
  ai_summary?: string | null;
  ai_verdict?: string | null;
  meta_title: string;
  meta_description: string;
  i18n: I18n<{
    ai_summary?: string;
    ai_verdict?: string;
  }>;
  created_at: string;
  updated_at: string;
}

export interface PostContentBlock {
  type: 'paragraph' | 'heading' | 'table' | 'list' | 'bullets' | 'callout' | 'product_card' | 'monitor_card' | 'image' | 'quote' | 'faq' | 'comparison_widget_cta' | string;
  text?: string;
  content?: string;
  items?: string[];
  level?: number;
  headers?: string[];
  rows?: string[][];
  src?: string;
  alt?: string;
  slug?: string;
  question?: string;
  answer?: string;
  // callout
  variant?: 'info' | 'warning' | 'success';
  title?: string;
  // product card
  badge?: string;
  score?: number;
  name?: string;
  subtitle?: string;
  specs?: { size?: string; resolution?: string; refreshRate?: string; responseTime?: string; panelType?: string; hdr?: string };
  highlights?: string[];
  analysisUrl?: string;
  compareUrl?: string;
}

export interface PostPublic {
  id: string;
  title: string;
  slug: string;
  category: string;
  author?: string;
  summary: string;
  content_json: { blocks: PostContentBlock[] } | string;
  featured_image_url?: string | null;
  related_monitors?: MonitorListItem[];
  meta_title: string;
  meta_description: string;
  i18n: I18n<{
    title?: string;
    summary?: string;
    author?: string;
    content_json?: { blocks: PostContentBlock[] } | string;
  }>;
  published_at: string;
  created_at: string;
  updated_at: string;
}

export interface PseoHubFilters {
  panel_type?: string | null;
  min_refresh_rate_hz?: number | null;
  [key: string]: unknown;
}

export interface PseoHubPublic {
  id: string;
  slug: string;
  title: string;
  intro_content: string | null;
  faq_json: any;
  matched_count: number;
  filter_query?: string;
  filters: PseoHubFilters;
  meta_title: string;
  meta_description: string;
  i18n: I18n<{
    title?: string;
    intro_content?: string | null;
    faq_json?: any;
  }>;
  monitors?: MonitorListItem[];
}

export type SitemapEntityKind = 'monitors' | 'brands' | 'comparisons' | 'pseo_hubs' | 'posts';

export interface SearchFilters {
  brand_slug?: string;
  panel_type?: string;
  min_refresh_rate_hz?: number;
  q?: string;
  [key: string]: unknown;
}
