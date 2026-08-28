# Ejemplos de datos — Vimovies API

Documento con JSONs realistas para entender la estructura de datos que viaja por la API en producción. Se dividen en **payloads de ingesta** (lo que envía la IA/scripts al backend) y **respuestas públicas** (lo que recibe Next.js para renderizar).

---

## 1. Ingesta de marcas (POST `/api/v1/admin/brands`)

```json
{
  "name": "LG",
  "slug": "lg",
  "logo_url": "https://cdn.vimovies.com/brands/lg-logo.svg",
  "description": "Marca surcoreana líder en monitores gaming y profesionales.",
  "website_url": "https://www.lg.com",
  "i18n": {
    "es": { "name": "LG", "description": "Marca surcoreana líder en monitores." },
    "en": { "name": "LG", "description": "South Korean leader in displays." }
  }
}
```

---

## 2. Ingesta de monitores (POST `/api/v1/admin/monitors`)

### 2.1 Monitor gaming completo con i18n

```json
{
  "brand_slug": "lg",
  "model_name": "LG UltraGear 27GP850-B",
  "slug": "lg-ultragear-27gp850-b",
  "base_specs": {
    "screen_size_inches": 27,
    "resolution_width": 2560,
    "resolution_height": 1440,
    "aspect_ratio": "16:9",
    "refresh_rate_hz": 165,
    "response_time_ms": 1.0,
    "panel_type": "Fast-IPS",
    "hdr_support": "HDR400",
    "has_vrr_sync": true,
    "color_gamut_srgb_pct": 98,
    "color_gamut_dci_p3_pct": 98,
    "brightness_nits": 400,
    "contrast_ratio_static": 1000,
    "has_kvm": false,
    "usb_pd_wattage": 0,
    "vesa_mount": "100x100",
    "has_speakers": false
  },
  "extended_specs": {
    "ergonomics": {
      "height_adjustable": true,
      "swivel": "90°",
      "tilt": "-5° a 15°",
      "pivot": true
    },
    "connectivity": {
      "hdmi": "2 x HDMI 2.0",
      "displayport": "1 x DP 1.4",
      "usb": "1 x USB-B upstream, 2 x USB-A 3.0"
    },
    "gaming": {
      "g_sync": "Compatible",
      "free_sync": "Premium",
      "black_stabilizer": true,
      "crosshair": true
    }
  },
  "main_image_url": "https://cdn.vimovies.com/monitors/lg-ultragear-27gp850-b.jpg",
  "is_published": true,
  "seo": {
    "meta_title": "LG UltraGear 27GP850-B | Análisis y ficha técnica 2026",
    "meta_description": "Descubre el LG UltraGear 27GP850-B: 27\" QHD 165 Hz Fast-IPS ideal para gaming competitivo."
  },
  "i18n": {
    "es": {
      "model_name": "LG UltraGear 27GP850-B",
      "meta_title": "LG UltraGear 27GP850-B | Análisis y ficha técnica 2026",
      "meta_description": "Monitor gaming 27\" QHD 165 Hz Fast-IPS con 1 ms GTG."
    },
    "en": {
      "model_name": "LG UltraGear 27GP850-B",
      "meta_title": "LG UltraGear 27GP850-B Review | 165 Hz QHD Fast-IPS",
      "meta_description": "27-inch QHD 165 Hz Fast-IPS gaming monitor with 1 ms GTG."
    }
  }
}
```

### 2.2 Monitor profesional sin campo `slug` (lo genera el backend)

```json
{
  "brand_slug": "benq",
  "model_name": "BenQ PD2700U",
  "base_specs": {
    "screen_size_inches": 27,
    "resolution_width": 3840,
    "resolution_height": 2160,
    "aspect_ratio": "16:9",
    "refresh_rate_hz": 60,
    "response_time_ms": 5,
    "panel_type": "IPS",
    "hdr_support": null,
    "has_vrr_sync": false,
    "color_gamut_srgb_pct": 100,
    "color_gamut_dci_p3_pct": null,
    "brightness_nits": 350,
    "contrast_ratio_static": 1300,
    "has_kvm": true,
    "usb_pd_wattage": 0,
    "vesa_mount": "100x100",
    "has_speakers": true
  },
  "extended_specs": {
    "eye_care": {
      "low_blue_light": true,
      "flicker_free": true,
      "brightness_intelligence_plus": true
    },
    "connectivity": {
      "hdmi": "2 x HDMI 2.0",
      "displayport": "1 x DP 1.4",
      "usb": "4 x USB 3.1"
    }
  },
  "main_image_url": "https://cdn.vimovies.com/monitors/benq-pd2700u.jpg",
  "is_published": true,
  "seo": {
    "meta_title": "BenQ PD2700U | Monitor 4K para diseño y productividad",
    "meta_description": "Análisis del BenQ PD2700U: 27\" 4K IPS con tecnología Eye-Care para largas jornadas."
  },
  "i18n": {
    "es": {
      "meta_title": "BenQ PD2700U | Monitor 4K para diseño y productividad",
      "meta_description": "Monitor 27\" 4K IPS con tecnología Eye-Care y calibración de fábrica."
    },
    "en": {
      "meta_title": "BenQ PD2700U | 4K Design Monitor Review",
      "meta_description": "27\" 4K IPS monitor with factory calibration and Eye-Care tech."
    }
  }
}
```

---

## 3. Ingesta de comparativas (POST `/api/v1/admin/comparisons`)

```json
{
  "monitor_a_slug": "lg-ultragear-27gp850-b",
  "monitor_b_slug": "asus-rog-swift-pg27aqn",
  "ai_summary": "El ASUS ROG Swift PG27AQN gana en velocidad pura gracias a sus 360 Hz, mientras que el LG 27GP850-B ofrece mejor relación calidad-precio para QHD 165 Hz.",
  "ai_verdict": "Elige el ASUS si buscas rendimiento eSports extremo; elige el LG si quieres un panel equilibrado para gaming y productividad.",
  "is_published": true,
  "seo": {
    "meta_title": "LG 27GP850-B vs ASUS ROG Swift PG27AQN | Comparativa gaming",
    "meta_description": "Comparativa cara a cara entre dos monitores gaming de 27 pulgadas: LG vs ASUS."
  },
  "i18n": {
    "es": {
      "ai_summary": "El ASUS ROG Swift PG27AQN gana en velocidad pura...",
      "ai_verdict": "Elige el ASUS si buscas rendimiento eSports extremo..."
    },
    "en": {
      "ai_summary": "The ASUS ROG Swift PG27AQN wins on raw speed...",
      "ai_verdict": "Pick the ASUS for extreme esports performance..."
    }
  }
}
```

---

## 4. Ingesta de posts (POST `/api/v1/admin/posts`)

```json
{
  "title": "Guía: ¿Cuántos Hz necesitas para jugar competitivamente?",
  "slug": "cuantos-hz-necesitas-gaming-competitivo",
  "category": "guide",
  "summary": "Desde 60 Hz hasta 360 Hz: te explicamos cuánta tasa de refresco realmente necesitas según tu género de juego y presupuesto.",
  "content_json": {
    "blocks": [
      {
        "type": "paragraph",
        "text": "La tasa de refresco es uno de los factores que más impacta la fluidez percibida..."
      },
      {
        "type": "heading",
        "level": 2,
        "text": "60 Hz vs 144 Hz"
      },
      {
        "type": "table",
        "headers": ["Género", "Mínimo recomendado", "Ideal"],
        "rows": [
          ["MOBA / RTS", "60 Hz", "144 Hz"],
          ["FPS competitivo", "144 Hz", "240+ Hz"],
          ["Carreras / simuladores", "144 Hz", "240 Hz"]
        ]
      }
    ]
  },
  "featured_image_url": "https://cdn.vimovies.com/posts/hz-gaming-guide.jpg",
  "related_monitor_slugs": [
    "lg-ultragear-27gp850-b",
    "asus-rog-swift-pg27aqn"
  ],
  "is_published": true,
  "seo": {
    "meta_title": "¿Cuántos Hz necesitas para gaming competitivo?",
    "meta_description": "Guía completa sobre tasa de refresco: 60 Hz, 144 Hz, 240 Hz y 360 Hz explicados para jugadores."
  },
  "i18n": {
    "es": {
      "title": "Guía: ¿Cuántos Hz necesitas para jugar competitivamente?",
      "summary": "Desde 60 Hz hasta 360 Hz..."
    },
    "en": {
      "title": "Guide: How Many Hz Do You Need for Competitive Gaming?",
      "summary": "From 60 Hz to 360 Hz..."
    }
  }
}
```

---

## 5. Ingesta de hubs pSEO (POST `/api/v1/admin/hubs`)

```json
{
  "slug": "mejores-monitores-ips-144hz",
  "title": "Mejores monitores IPS 144 Hz para gaming y productividad",
  "filter_query": {
    "panel_type": "IPS",
    "min_refresh_rate_hz": 144
  },
  "intro_content": "Los monitores IPS con 144 Hz o más combinan color y fluidez. Aquí los mejores modelos filtrados por rendimiento real.",
  "faq_json": {
    "¿IPS o VA para gaming?": "IPS es más rápido en tiempos de respuesta y ofrece mejores ángulos de visión; VA destaca en contraste.",
    "¿144 Hz es suficiente?": "Para la mayoría de jugadores, 144 Hz es el punto dulce entre precio y fluidez."
  },
  "is_indexable": true,
  "seo": {
    "meta_title": "Top monitores IPS 144 Hz | Comparativa 2026",
    "meta_description": "Descubre los mejores monitores IPS con 144 Hz para gaming. Filtros, comparativas y precios actualizados."
  },
  "i18n": {
    "es": {
      "title": "Mejores monitores IPS 144 Hz para gaming y productividad",
      "intro_content": "Los monitores IPS con 144 Hz o más combinan color y fluidez..."
    },
    "en": {
      "title": "Best 144 Hz IPS Monitors for Gaming and Productivity",
      "intro_content": "IPS monitors with 144 Hz or more blend color accuracy and smoothness..."
    }
  }
}
```

---

## 6. Respuestas públicas

### 6.1 GET `/api/v1/monitors/lg-ultragear-27gp850-b?lang=es`

```json
{
  "ok": true,
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "brand": {
      "id": "11111111-2222-3333-4444-555555555555",
      "name": "LG",
      "slug": "lg",
      "logo_url": "https://cdn.vimovies.com/brands/lg-logo.svg",
      "description": "Marca surcoreana líder en monitores.",
      "website_url": "https://www.lg.com",
      "i18n": {
        "es": { "name": "LG", "description": "Marca surcoreana líder en monitores." },
        "en": { "name": "LG", "description": "South Korean leader in displays." }
      }
    },
    "model_name": "LG UltraGear 27GP850-B",
    "slug": "lg-ultragear-27gp850-b",
    "base_specs": {
      "screen_size_inches": 27,
      "resolution_width": 2560,
      "resolution_height": 1440,
      "aspect_ratio": "16:9",
      "refresh_rate_hz": 165,
      "response_time_ms": 1,
      "panel_type": "Fast-IPS",
      "hdr_support": "HDR400",
      "has_vrr_sync": true,
      "color_gamut_srgb_pct": 98,
      "color_gamut_dci_p3_pct": 98,
      "brightness_nits": 400,
      "contrast_ratio_static": 1000,
      "has_kvm": false,
      "usb_pd_wattage": 0,
      "vesa_mount": "100x100",
      "has_speakers": false
    },
    "extended_specs": {
      "ergonomics": { "height_adjustable": true, "swivel": "90°", "tilt": "-5° a 15°", "pivot": true },
      "connectivity": { "hdmi": "2 x HDMI 2.0", "displayport": "1 x DP 1.4", "usb": "1 x USB-B upstream, 2 x USB-A 3.0" },
      "gaming": { "g_sync": "Compatible", "free_sync": "Premium", "black_stabilizer": true, "crosshair": true }
    },
    "scores": {
      "gaming": 92.5,
      "office": 78.3,
      "editing": 85.1
    },
    "main_image_url": "https://cdn.vimovies.com/monitors/lg-ultragear-27gp850-b.jpg",
    "meta_title": "LG UltraGear 27GP850-B | Análisis y ficha técnica 2026",
    "meta_description": "Monitor gaming 27\" QHD 165 Hz Fast-IPS con 1 ms GTG.",
    "i18n": {
      "es": {
        "model_name": "LG UltraGear 27GP850-B",
        "meta_title": "LG UltraGear 27GP850-B | Análisis y ficha técnica 2026",
        "meta_description": "Monitor gaming 27\" QHD 165 Hz Fast-IPS con 1 ms GTG."
      },
      "en": {
        "model_name": "LG UltraGear 27GP850-B",
        "meta_title": "LG UltraGear 27GP850-B Review | 165 Hz QHD Fast-IPS",
        "meta_description": "27-inch QHD 165 Hz Fast-IPS gaming monitor with 1 ms GTG."
      }
    },
    "created_at": "2026-01-15T10:00:00.000Z",
    "updated_at": "2026-03-20T14:30:00.000Z"
  }
}
```

### 6.2 GET `/api/v1/monitors?brand_slug=lg&page=1&limit=2`

```json
{
  "ok": true,
  "data": {
    "data": [
      {
        "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "slug": "lg-ultragear-27gp850-b",
        "model_name": "LG UltraGear 27GP850-B",
        "main_image_url": "https://cdn.vimovies.com/monitors/lg-ultragear-27gp850-b.jpg",
        "scores": { "gaming": 92.5, "office": 78.3, "editing": 85.1 },
        "meta_title": "LG UltraGear 27GP850-B | Análisis y ficha técnica 2026",
        "brand_name": "LG",
        "brand_slug": "lg"
      },
      {
        "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
        "slug": "lg-27ul850-w",
        "model_name": "LG 27UL850-W",
        "main_image_url": "https://cdn.vimovies.com/monitors/lg-27ul850-w.jpg",
        "scores": { "gaming": 55.2, "office": 91.0, "editing": 88.4 },
        "meta_title": "LG 27UL850-W | Monitor 4K USB-C para Mac y oficina",
        "brand_name": "LG",
        "brand_slug": "lg"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 2,
      "total": 12,
      "total_pages": 6,
      "has_next": true,
      "has_prev": false
    }
  }
}
```

### 6.3 GET `/api/v1/comparisons/lg-ultragear-27gp850-b-vs-asus-rog-swift-pg27aqn?lang=es`

```json
{
  "ok": true,
  "data": {
    "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
    "slug": "asus-rog-swift-pg27aqn-vs-lg-ultragear-27gp850-b",
    "monitor_a": {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "slug": "lg-ultragear-27gp850-b",
      "model_name": "LG UltraGear 27GP850-B",
      "scores": { "gaming": 92.5, "office": 78.3, "editing": 85.1 }
    },
    "monitor_b": {
      "id": "d4e5f6a7-b8c9-0123-def1-234567890123",
      "slug": "asus-rog-swift-pg27aqn",
      "model_name": "ASUS ROG Swift PG27AQN",
      "scores": { "gaming": 98.1, "office": 65.4, "editing": 72.0 }
    },
    "winners": {
      "gaming": "d4e5f6a7-b8c9-0123-def1-234567890123",
      "office": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "editing": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
    },
    "deltas": {
      "gaming": 5.6,
      "office": 12.9,
      "editing": 13.1
    },
    "ai_summary": "El ASUS ROG Swift PG27AQN gana en velocidad pura gracias a sus 360 Hz...",
    "ai_verdict": "Elige el ASUS si buscas rendimiento eSports extremo...",
    "meta_title": "LG 27GP850-B vs ASUS ROG Swift PG27AQN | Comparativa gaming",
    "meta_description": "Comparativa cara a cara entre dos monitores gaming de 27 pulgadas: LG vs ASUS.",
    "i18n": {
      "es": {
        "ai_summary": "El ASUS ROG Swift PG27AQN gana en velocidad pura...",
        "ai_verdict": "Elige el ASUS si buscas rendimiento eSports extremo..."
      },
      "en": {
        "ai_summary": "The ASUS ROG Swift PG27AQN wins on raw speed...",
        "ai_verdict": "Pick the ASUS for extreme esports performance..."
      }
    },
    "created_at": "2026-02-10T09:15:00.000Z"
  }
}
```

### 6.4 GET `/api/v1/posts/cuantos-hz-necesitas-gaming-competitivo?lang=es`

```json
{
  "ok": true,
  "data": {
    "id": "e5f6a7b8-c9d0-1234-ef12-345678901234",
    "title": "Guía: ¿Cuántos Hz necesitas para jugar competitivamente?",
    "slug": "cuantos-hz-necesitas-gaming-competitivo",
    "category": "guide",
    "summary": "Desde 60 Hz hasta 360 Hz: te explicamos cuánta tasa de refresco realmente necesitas según tu género de juego y presupuesto.",
    "content_json": {
      "blocks": [
        { "type": "paragraph", "text": "La tasa de refresco es uno de los factores que más impacta la fluidez percibida..." },
        { "type": "heading", "level": 2, "text": "60 Hz vs 144 Hz" },
        { "type": "table", "headers": ["Género", "Mínimo recomendado", "Ideal"], "rows": [["MOBA / RTS", "60 Hz", "144 Hz"], ["FPS competitivo", "144 Hz", "240+ Hz"]] }
      ]
    },
    "featured_image_url": "https://cdn.vimovies.com/posts/hz-gaming-guide.jpg",
    "related_monitors": [
      {
        "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "slug": "lg-ultragear-27gp850-b",
        "model_name": "LG UltraGear 27GP850-B",
        "main_image_url": "https://cdn.vimovies.com/monitors/lg-ultragear-27gp850-b.jpg",
        "scores": { "gaming": 92.5, "office": 78.3, "editing": 85.1 },
        "meta_title": "LG UltraGear 27GP850-B | Análisis y ficha técnica 2026",
        "brand_name": "LG",
        "brand_slug": "lg"
      },
      {
        "id": "d4e5f6a7-b8c9-0123-def1-234567890123",
        "slug": "asus-rog-swift-pg27aqn",
        "model_name": "ASUS ROG Swift PG27AQN",
        "main_image_url": "https://cdn.vimovies.com/monitors/asus-rog-swift-pg27aqn.jpg",
        "scores": { "gaming": 98.1, "office": 65.4, "editing": 72.0 },
        "meta_title": "ASUS ROG Swift PG27AQN | Review 360 Hz 1440p",
        "brand_name": "ASUS",
        "brand_slug": "asus"
      }
    ],
    "meta_title": "¿Cuántos Hz necesitas para gaming competitivo?",
    "meta_description": "Guía completa sobre tasa de refresco: 60 Hz, 144 Hz, 240 Hz y 360 Hz explicados para jugadores.",
    "i18n": {
      "es": {
        "title": "Guía: ¿Cuántos Hz necesitas para jugar competitivamente?",
        "summary": "Desde 60 Hz hasta 360 Hz...",
        "content_json": { "blocks": [{ "type": "paragraph", "text": "La tasa de refresco..." }] }
      },
      "en": {
        "title": "Guide: How Many Hz Do You Need for Competitive Gaming?",
        "summary": "From 60 Hz to 360 Hz...",
        "content_json": { "blocks": [{ "type": "paragraph", "text": "Refresh rate is one of the most impactful factors..." }] }
      }
    },
    "published_at": "2026-02-01T08:00:00.000Z",
    "created_at": "2026-02-01T08:00:00.000Z"
  }
}
```

### 6.5 GET `/api/v1/hubs/mejores-monitores-ips-144hz?lang=es`

```json
{
  "ok": true,
  "data": {
    "id": "f6a7b8c9-d0e1-2345-f123-456789012345",
    "slug": "mejores-monitores-ips-144hz",
    "title": "Mejores monitores IPS 144 Hz para gaming y productividad",
    "intro_content": "Los monitores IPS con 144 Hz o más combinan color y fluidez. Aquí los mejores modelos filtrados por rendimiento real.",
    "faq_json": {
      "¿IPS o VA para gaming?": "IPS es más rápido en tiempos de respuesta y ofrece mejores ángulos de visión; VA destaca en contraste.",
      "¿144 Hz es suficiente?": "Para la mayoría de jugadores, 144 Hz es el punto dulce entre precio y fluidez."
    },
    "matched_count": 18,
    "filters": {
      "panel_type": "IPS",
      "min_refresh_rate_hz": 144
    },
    "meta_title": "Top monitores IPS 144 Hz | Comparativa 2026",
    "meta_description": "Descubre los mejores monitores IPS con 144 Hz para gaming. Filtros, comparativas y precios actualizados.",
    "i18n": {
      "es": {
        "title": "Mejores monitores IPS 144 Hz para gaming y productividad",
        "intro_content": "Los monitores IPS con 144 Hz o más combinan color y fluidez...",
        "faq_json": {
          "¿IPS o VA para gaming?": "IPS es más rápido en tiempos de respuesta...",
          "¿144 Hz es suficiente?": "Para la mayoría de jugadores, 144 Hz es el punto dulce..."
        }
      },
      "en": {
        "title": "Best 144 Hz IPS Monitors for Gaming and Productivity",
        "intro_content": "IPS monitors with 144 Hz or more blend color accuracy and smoothness..."
      }
    },
    "monitors": [
      {
        "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "slug": "lg-ultragear-27gp850-b",
        "model_name": "LG UltraGear 27GP850-B",
        "main_image_url": "https://cdn.vimovies.com/monitors/lg-ultragear-27gp850-b.jpg",
        "scores": { "gaming": 92.5, "office": 78.3, "editing": 85.1 },
        "meta_title": "LG UltraGear 27GP850-B | Análisis y ficha técnica 2026",
        "brand_name": "LG",
        "brand_slug": "lg"
      }
    ]
  }
}
```

### 6.6 GET `/api/v1/search?q=ultragear`

```json
{
  "ok": true,
  "data": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "slug": "lg-ultragear-27gp850-b",
      "model_name": "LG UltraGear 27GP850-B",
      "main_image_url": "https://cdn.vimovies.com/monitors/lg-ultragear-27gp850-b.jpg",
      "scores": { "gaming": 92.5, "office": 78.3, "editing": 85.1 },
      "meta_title": "LG UltraGear 27GP850-B | Análisis y ficha técnica 2026",
      "brand_name": "LG",
      "brand_slug": "lg"
    }
  ]
}
```

---

## 7. Sitemaps XML

### 7.1 `/sitemaps/index.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://vimovies.com/sitemaps/monitors-1.xml</loc>
    <lastmod>2026-03-20T14:30:00.000Z</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://vimovies.com/sitemaps/comparisons-1.xml</loc>
    <lastmod>2026-03-20T14:30:00.000Z</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://vimovies.com/sitemaps/posts-1.xml</loc>
    <lastmod>2026-03-20T14:30:00.000Z</lastmod>
  </sitemap>
</sitemapindex>
```

### 7.2 `/sitemaps/monitors-1.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://vimovies.com/monitores/lg/lg-ultragear-27gp850-b</loc>
    <lastmod>2026-03-20T14:30:00.000Z</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://vimovies.com/monitores/benq/benq-pd2700u</loc>
    <lastmod>2026-03-18T11:20:00.000Z</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

---

## 8. Respuesta de error tipica

```json
{
  "ok": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request body",
    "details": [
      {
        "path": ["base_specs", "refresh_rate_hz"],
        "message": "Expected number, received string"
      }
    ]
  }
}
```
