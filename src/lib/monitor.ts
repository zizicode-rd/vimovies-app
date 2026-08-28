import type { MonitorPublic } from '@/types/api';

export function normalizeMonitor(data: any): MonitorPublic {
  const raw = data ?? {};

  const baseSpecs = raw.base_specs ?? {
    screen_size_inches: raw.screen_size_inches,
    resolution_width: raw.resolution_width,
    resolution_height: raw.resolution_height,
    aspect_ratio: raw.aspect_ratio,
    refresh_rate_hz: raw.refresh_rate_hz,
    response_time_ms: raw.response_time_ms,
    panel_type: raw.panel_type,
    hdr_support: raw.hdr_support,
    has_vrr_sync: raw.has_vrr_sync,
    color_gamut_srgb_pct: raw.color_gamut_srgb_pct,
    color_gamut_dci_p3_pct: raw.color_gamut_dci_p3_pct,
    brightness_nits: raw.brightness_nits,
    contrast_ratio_static: raw.contrast_ratio_static,
    has_kvm: raw.has_kvm,
    usb_pd_wattage: raw.usb_pd_wattage,
    vesa_mount: raw.vesa_mount,
    has_speakers: raw.has_speakers,
  };

  const scores = raw.scores ?? {
    gaming: raw.score_gaming ?? 0,
    office: raw.score_office ?? 0,
    editing: raw.score_editing ?? 0,
  };

  const brand = raw.brand ?? (raw.brand_id ? { id: raw.brand_id, name: raw.brand_name ?? '', slug: '' } : undefined);

  return {
    id: raw.id,
    brand,
    model_name: raw.model_name,
    slug: raw.slug,
    base_specs: baseSpecs,
    extended_specs: raw.extended_specs ?? {},
    scores,
    main_image_url: raw.main_image_url ?? null,
    media: raw.media ?? [],
    video_embed: raw.video_embed ?? null,
    meta_title: raw.meta_title,
    meta_description: raw.meta_description,
    i18n: raw.i18n ?? {},
    created_at: raw.created_at,
    updated_at: raw.updated_at,
  } as MonitorPublic;
}
