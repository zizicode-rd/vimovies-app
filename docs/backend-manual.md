# 📘 Manual del Backend — Vimonitors API

> **Rol:** guía de construcción del backend. Define qué tecnología se usa, cómo se organizan las carpetas, cómo se comunica la API con los datos, qué endpoints existen, cuáles son públicos, cuáles requieren token y cómo se generan los sitemaps para un frontend Next.js orientado a velocidad y SEO.

---

## 1. Stack y frameworks

| Capa | Tecnología | Por qué |
|------|-----------|---------|
| Runtime / API | **Hono** sobre **Node.js** (`@hono/node-server`) | Framework ligero, tipado nativo con TypeScript, middleware de auth sencillo y response helper compatible con ISR/revalidación de Next.js. |
| Base de datos | **Supabase / PostgreSQL** | Postgres con triggers para scores, RLS pública, JSONB para specs variables y extensiones (`pg_trgm`, `pgcrypto`). |
| Validación | **Zod** (instalar junto a Hono) | La IA nunca escribe directo a la base; todo pasa por un schema Zod que protege la calidad de los datos. |
| Cliente DB | **@supabase/supabase-js** con `service_role` | La ingesta usa `service_role` (bypassa RLS). Las lecturas públicas usan `anon` con RLS ya configurada. |
| Cache / revalidación | Headers de Hono + ISR de Next.js | El backend devuelve `Cache-Control` y `ETag`; Next.js hace SSG/ISR con `generateStaticParams` consumiendo estas rutas. |

### Instalación recomendada

```bash
pnpm add hono @hono/node-server zod @supabase/supabase-js
pnpm add -D @types/node tsx typescript
```

---

## 2. Estructura de carpetas

```
vimonitors-api/
├── src/
│   ├── index.ts              # entry point: crea app Hono y monta routers
│   ├── types.ts              # contrato de comunicación API ↔ datos (ya creado)
│   ├── lib/
│   │   ├── db.ts             # cliente Supabase (service_role para ingest, anon para lecturas)
│   │   ├── auth.ts           # middleware bearer token para rutas de ingest
│   │   └── errors.ts         # helpers de respuesta ApiError/ApiSuccess
│   ├── schemas/
│   │   ├── monitor.schema.ts # Zod para ingesta de monitores
│   │   ├── comparison.schema.ts
│   │   ├── post.schema.ts
│   │   └── hub.schema.ts
│   ├── routes/
│   │   ├── public.ts         # GET sin token: lectura SEO/cacheable
│   │   ├── ingest.ts         # POST/PUT/PATCH con token: administración
│   │   ├── sitemaps.ts       # GET .xml divididos por entidad y paginados
│   │   └── health.ts         # /health y /version
│   └── services/
│       ├── monitor.service.ts
│       ├── comparison.service.ts
│       ├── post.service.ts
│       ├── hub.service.ts
│       └── sitemap.service.ts
├── help/
│   ├── schema.sql            # schema oficial Supabase
│   ├── relations.md          # relaciones y decisiones de datos
│   └── arquitectura.md       # visión de producto
└── docs/
    └── backend-manual.md     # este archivo
```

### Convenciones

- **Un archivo `*.service.ts` por entidad:** contiene la lógica de lectura/escritura en Supabase.
- **Un archivo `*.schema.ts` por entidad:** contiene los Zod schemas de ingesta.
- **`types.ts` no importa Zod:** es el contrato puro de TypeScript; los schemas Zod deben inferir de `types.ts` o ser `z.infer<typeof Schema>`.
- **Las rutas no saben de SQL:** solo reciben DTOs, validan con Zod y llaman a services.

---

## 3. Comunicación API ↔ datos

### 3.1 Flujo de lectura (público, cacheable)

```
[Next.js SSG/ISR] --GET--> [Hono public.ts]
                                │
                                ▼
                          [service.ts]
                                │
                                ▼
                          [Supabase anon / RLS]
```

**Reglas de lectura**

- Todos los `GET` públicos devuelven datos ya procesados, listos para renderizar.
- No se filtra ni ordena en el frontend: el backend envía listados paginados y ordenados.
- Los SEO fields (`meta_title`, `meta_description`) viajan en cada recurso para que Next.js los use en Server Components.
- **i18n:** las lecturas públicas aceptan `?lang=en` (o `?lang=es` por defecto). El backend resuelve los campos traducibles y devuelve el idioma solicitado con fallback a `es`.

### 3.2 Flujo de ingesta (protegido por token)

```
[Script IA] --POST--> [Hono ingest.ts]
                            │
                            ▼
                     [Zod schema] --valida--X--> [ApiError 400]
                            │
                            ▼
                     [service.ts] --upsert--> [Supabase service_role]
                            │
                            ▼
                     [Next.js revalidatePath] (opcional)
```

**Reglas de ingesta**

1. **Si el JSON no pasa Zod, nunca toca la base.** Se devuelve `ApiError` con el campo fallido.
2. **Upsert idempotente por `slug`.** Reingresar el mismo slug actualiza; nunca duplica.
3. **Scores en `monitors` se recalculan por trigger Postgres**, no por el backend, para no duplicar fuente de verdad.
4. **Comparativas se generan canónicas** ordenando alfabéticamente los slugs; imposible crear `A-vs-B` y `B-vs-A`.

### 3.3 Calidad de datos al 100 %

Para garantizar que cada dato que llega al frontend es válido:

| Problema | Solución en backend |
|----------|---------------------|
| Tipos incorrectos | Zod `number()`, `boolean()`, `enum()` en los schemas de ingesta. |
| Slugs duplicados | Índice `UNIQUE` en Postgres + upsert por `slug`. |
| Comparativas duplicadas | Índice único `LEAST/GREATEST(monitor_a_id, monitor_b_id)` + trigger de slug canónico. |
| Páginas pSEO vacías | `pseo_hubs.is_indexable` se calcula con `matched_count >= 3` vía función programada. |
| SEO roto | Zod obliga `meta_title` y `meta_description` en ingesta; mínimo/máximo de longitud. |
| Scores inconsistentes | Triggers Postgres calculan scores; `comparisons` solo **lee** los scores de `monitors`. |
| Datos a medias | Transacciones/upserts atómicos; si falla una parte, no se publica nada. |
| Búsqueda insegura | Filtros pSEO mapeados a parámetros explícitos (`fn_count_monitors_matching`); nunca SQL dinámico desde JSON. |

---

## 4. Endpoints

### 4.1 Rutas públicas (sin token)

Usan cliente Supabase `anon`. Devuelven solo contenido publicado/indexable según RLS.

| Método | Ruta | Descripción | Response type |
|--------|------|-------------|---------------|
| `GET` | `/api/v1/health` | Estado del servicio | `ApiSuccess<{ status: "ok" }>` |
| `GET` | `/api/v1/brands` | Lista todas las marcas | `ApiSuccess<BrandPublic[]>` |
| `GET` | `/api/v1/brands/:slug` | Marca por slug | `ApiSuccess<BrandPublic>` |
| `GET` | `/api/v1/monitors` | Lista paginada de monitores con filtros | `ApiSuccess<PaginatedResponse<MonitorListItem>>` |
| `GET` | `/api/v1/monitors/:slug` | Ficha técnica completa | `ApiSuccess<MonitorPublic>` |
| `GET` | `/api/v1/comparisons` | Lista paginada de comparativas | `ApiSuccess<PaginatedResponse<ComparisonPublic>>` |
| `GET` | `/api/v1/comparisons/:slug` | Comparativa 1 vs 1 | `ApiSuccess<ComparisonPublic>` |
| `GET` | `/api/v1/hubs` | Listado de hubs pSEO indexables | `ApiSuccess<PaginatedResponse<PseoHubPublic>>` |
| `GET` | `/api/v1/hubs/:slug` | Hub pSEO con monitores filtrados | `ApiSuccess<PseoHubPublic & { monitors: MonitorListItem[] }>` |
| `GET` | `/api/v1/posts` | Blog por categoría | `ApiSuccess<PaginatedResponse<PostPublic>>` |
| `GET` | `/api/v1/posts/:slug` | Post completo | `ApiSuccess<PostPublic>` |
| `GET` | `/api/v1/search` | Búsqueda de monitores por `q` | `ApiSuccess<MonitorListItem[]>` |

**Query params comunes a todas las rutas públicas**

| Parámetro | Valor | Descripción |
|-----------|-------|-------------|
| `lang` | `es` (default) \| `en` | Idioma de respuesta; fallback a `es` si falta la traducción. |

**Headers recomendados para lectura**

```http
Cache-Control: public, max-age=60, stale-while-revalidate=86400
```

Esto permite que Next.js ISR revalide en segundo plano y Googlebot reciba respuestas rápidas.

### 4.2 Rutas con token (ingesta / admin)

Todas las rutas de este grupo requieren header:

```http
Authorization: Bearer <INGEST_TOKEN>
```

Middleware `auth.ts` compara contra `process.env.INGEST_TOKEN`.

| Método | Ruta | Body | Descripción |
|--------|------|------|-------------|
| `POST` | `/api/v1/admin/brands` | `IngestBrandPayload` | Crear/actualizar marca |
| `POST` | `/api/v1/admin/monitors` | `IngestMonitorPayload` | Crear/actualizar monitor |
| `POST` | `/api/v1/admin/comparisons` | `IngestComparisonPayload` | Crear/actualizar comparativa |
| `POST` | `/api/v1/admin/posts` | `IngestPostPayload` | Crear/actualizar post |
| `POST` | `/api/v1/admin/hubs` | `IngestPseoHubPayload` | Crear/actualizar hub pSEO |
| `POST` | `/api/v1/admin/hubs/refresh-counts` | — | Dispara `fn_refresh_all_hub_counts()` |
| `POST` | `/api/v1/admin/revalidate` | `{ path: string }` | Pide a Next.js revalidar una ruta (ISR) |

**Respuestas de ingesta**

- `200 OK` / `201 Created` → `ApiSuccess<T>` con el objeto guardado.
- `400 Bad Request` → `ApiError` con los campos inválidos de Zod.
- `401 Unauthorized` → token ausente o inválido.
- `409 Conflict` → violación de índice único (duplicado real).

---

## 5. Sitemaps (SEO técnico)

Google acepta archivos de hasta 50 MB o 50.000 URLs, pero para mantener la re-generación rápida y permitir revalidación granular, **cada entidad se divide en archivos de máximo 5.000 items**.

### 5.1 Estructura de URLs de sitemap

```
/sitemaps/index.xml              # índice que apunta a cada sub-sitemap
/sitemaps/monitors-1.xml         # monitores 1-5000
/sitemaps/monitors-2.xml         # monitores 5001-10000
/sitemaps/brands-1.xml
/sitemaps/comparisons-1.xml
/sitemaps/comparisons-2.xml
/sitemaps/hubs-1.xml
/sitemaps/posts-1.xml
```

### 5.2 Endpoints de sitemap

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/sitemaps/index.xml` | Índice de todos los archivos |
| `GET` | `/sitemaps/:kind-:page.xml` | Archivo XML de 1 entidad y 1 página |

### 5.3 Cómo implementar el servicio

```ts
// src/services/sitemap.service.ts (pseudo-código)
const PAGE_SIZE = 5_000;

async function buildSitemapPage(kind: SitemapEntityKind, page: number) {
  const { data, count } = await fetchIdsAndSlugsFor(kind, page);
  const urls: SitemapUrlEntry[] = data.map(item => ({
    loc: canonicalUrl(kind, item.slug),
    lastmod: item.updated_at,
    changefreq: "weekly",
    priority: priorityFor(kind),
  }));

  return toXml(urls);
}

async function buildSitemapIndex() {
  const kinds: SitemapEntityKind[] = ["monitors", "brands", "comparisons", "pseo_hubs", "posts"];
  const sitemaps = [];

  for (const kind of kinds) {
    const total = await countPublished(kind);
    const pages = Math.ceil(total / PAGE_SIZE);
    for (let p = 1; p <= pages; p++) {
      sitemaps.push({ kind, page: p, loc: `${BASE_URL}/sitemaps/${kind}-${p}.xml` });
    }
  }

  return toSitemapIndexXml(sitemaps);
}
```

### 5.4 Tipos de datos ya definidos en `src/types.ts`

- `SitemapEntityKind` — entidades soportadas.
- `SitemapUrlEntry` — cada `<url>` del XML.
- `SitemapIndex` — índice global.
- `SitemapPage<T>` — página XML de una entidad.
- `SitemapPayload` — unión de ambos.

### 5.5 Reglas SEO para sitemaps

- **No incluir URLs no publicadas** (`is_published = false` o `is_indexable = false`).
- **Usar `<lastmod>`** con `updated_at` del recurso para que Googlebot priorice re-crawl.
- **Un sitemap por entidad** permite revalidar solo el que cambia (`/sitemaps/monitors-1.xml`) sin regenerar todo.
- **Incluir el índice en `robots.txt`:**

```txt
Sitemap: https://vimonitors.com/sitemaps/index.xml
```

---

## 6. Cómo integrar con Next.js (frontend)

### 6.1 Server Components

```ts
// app/monitores/[brand]/[slug]/page.tsx
import type { MonitorPublic, ApiResponse } from "@vimonitors/types";

export async function generateStaticParams() {
  const res = await fetch(`${API_URL}/api/v1/monitors?limit=5000`);
  const { data }: ApiResponse<PaginatedResponse<MonitorListItem>> = await res.json();

  return data.map(m => ({
    brand: m.brand_slug,
    slug: m.slug,
  }));
}
```

### 6.2 JSON-LD

El backend no genera JSON-LD; el frontend lo arma en Server Components a partir de los datos ya validados:

```ts
import type { JsonLdProduct, MonitorPublic } from "@vimonitors/types";

function monitorJsonLd(m: MonitorPublic): JsonLdProduct {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: m.model_name,
    image: m.main_image_url ?? undefined,
    brand: { "@type": "Brand", name: m.brand.name },
    description: m.meta_description,
  };
}
```

### 6.3 Revalidación ISR

Tras una ingesta exitosa, el backend puede llamar:

```ts
await fetch(`${NEXT_SITE_URL}/api/revalidate?path=/monitores/${brandSlug}/${monitorSlug}`, {
  method: "POST",
});
```

Alternativa más sencilla: ISR con `revalidate: 3600` (1h) en los `fetch` de Next.js.

---

## 7. Variables de entorno necesarias

```bash
# Supabase
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx       # solo para ingest
SUPABASE_ANON_KEY=xxx               # lecturas públicas

# Seguridad de ingesta
INGEST_TOKEN=xxx                    # header Authorization: Bearer <INGEST_TOKEN>

# URLs
API_BASE_URL=https://api.vimonitors.com
NEXT_SITE_URL=https://vimonitors.com
```

---

## 8. Checklist de arranque

1. Correr `schema.sql` en Supabase SQL Editor.
2. Instalar dependencias recomendadas.
3. Crear `src/lib/db.ts` con cliente `service_role` y `anon`.
4. Implementar schemas Zod basados en `src/types.ts`.
5. Crear `src/routes/public.ts` con endpoints de lectura.
6. Crear `src/routes/ingest.ts` protegidos con `auth.ts` middleware.
7. Implementar `src/routes/sitemaps.ts` paginado a 5.000 items.
8. Cargar 5-10 monitores de prueba vía `POST /api/v1/admin/monitors`.
9. Verificar sitemaps en `/sitemaps/index.xml`.
10. Conectar Next.js Server Components a los endpoints públicos.

---

## 9. Decisiones de arquitectura clave

- **Scores en triggers Postgres**, no en el backend: una sola fuente de verdad.
- **`extended_specs` como JSONB** para lo que solo se muestra; columnas tipadas para lo que se filtra/ordena.
- **Sitemaps separados por entidad** para revalidación granular y mejor crawl budget.
- **RLS pública** en Supabase para lecturas; `service_role` solo en ingest.
- **Zod obligatorio** antes de cualquier escritura; nada llega "a medias" a la base.
- **i18n almacenado en DB como JSONB estructurado** (`{"es": {...}, "en": {...}}`) y resuelto por el backend antes de servir.

---

## 10. Internacionalización (i18n)

### 10.1 Modelo de datos

Las traducciones viven dentro de la base de datos en una columna `i18n` de tipo `jsonb` en cada tabla con contenido traducible:

- `brands.i18n`
- `monitors.i18n`
- `comparisons.i18n`
- `pseo_hubs.i18n`
- `posts.i18n`

**Formato esperado**

```json
{
  "es": { "meta_title": "Monitor gaming 4K", "extended_specs": { ... } },
  "en": { "meta_title": "4K gaming monitor", "meta_description": "Technical review of the BenQ PD2700U...", "extended_specs": { ... } }
}
```

- `es` es el idioma por defecto y **siempre debe existir**.
- `en` es opcional. Si falta para un campo, el backend hace fallback a `es`.
- Los campos no traducibles (slugs, scores, especificaciones técnicas) nunca van dentro de `i18n`.

### 10.2 Campos traducibles por entidad

| Entidad | Campos en `i18n` |
|---------|------------------|
| `brands` | `name`, `description` |
| `monitors` | `model_name`, `meta_title`, `meta_description`, `extended_specs` |
| `comparisons` | `meta_title`, `meta_description`, `ai_summary`, `ai_verdict` |
| `pseo_hubs` | `title`, `intro_content`, `faq_json`, `meta_title`, `meta_description` |
| `posts` | `title`, `summary`, `content_json`, `meta_title`, `meta_description` |

### 10.3 Resolución de idioma en el backend

Antes de devolver un recurso público, el backend ejecuta una función `resolveLocale(entity, lang)`:

```ts
// src/lib/i18n.ts (pseudo-código)
const DEFAULT_LOCALE = "es";
const SUPPORTED_LOCALES = ["es", "en"] as const;

function resolveLocale<T extends { i18n: I18n<unknown> }>(
  entity: T,
  requestedLang: SupportedLocale = "es"
): Omit<T, "i18n"> & { available_locales: SupportedLocale[] } {
  const translations = entity.i18n ?? {};
  const available_locales = Object.keys(translations).filter(isSupportedLocale) as SupportedLocale[];

  return {
    ...entity,
    ...applyTranslations(entity, translations[requestedLang] ?? translations[DEFAULT_LOCALE]),
    available_locales,
  };
}
```

**Reglas**

1. Si `lang` no está soportado, se ignora y se usa `es`.
2. Si `lang=en` existe y tiene un campo, se usa la versión en inglés.
3. Si `lang=en` falta o un campo no está traducido, se usa `es` (fallback).
4. La respuesta pública incluye `i18n` completo para que el frontend pueda hacer switching sin nuevo request si lo desea.

### 10.4 Ingesta de traducciones

En los endpoints con token, el payload puede incluir un objeto `i18n` junto a los campos base:

```json
{
  "brand_slug": "benq",
  "model_name": "PD2700U",
  "slug": "benq-pd2700u",
  "base_specs": { ... },
  "extended_specs": { ... },
  "seo": {
    "meta_title": "BenQ PD2700U: monitor 4K para diseñadores",
    "meta_description": "Análisis técnico del BenQ PD2700U..."
  },
  "i18n": {
    "en": {
      "meta_title": "BenQ PD2700U: 4K monitor for designers",
      "meta_description": "Technical review of the BenQ PD2700U...",
      "extended_specs": { ... }
    }
  }
}
```

- Los campos base (`model_name`, `seo`, `extended_specs`) se guardan en español (default) y también se replican como `i18n.es` si no vienen explícitos.
- Zod valida que `i18n` sea un objeto con claves permitidas y que los tipos internos coincidan.

### 10.5 SEO e i18n

- Cada idioma genera URLs distintas en el frontend: `/es/monitores/...` y `/en/monitors/...`.
- Los sitemaps deben tener versiones por idioma o usar `hreflang` alternates:

```xml
<url>
  <loc>https://vimonitors.com/es/monitores/benq/pd2700u</loc>
  <xhtml:link rel="alternate" hreflang="en" href="https://vimonitors.com/en/monitors/benq/pd2700u"/>
</url>
```

- El backend provee `available_locales` en cada recurso para que Next.js arme las alternativas correctas.
