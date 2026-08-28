# Guía de consumo frontend — Vimovies API

Este documento muestra cómo Next.js App Router consume los endpoints públicos que acabamos de crear: fichas técnicas de monitores y páginas de comparativas (VS).

---

## 1. Helper genérico para llamar a la API

Crea `lib/api.ts` en tu proyecto Next.js:

```ts
import type { ApiResponse, SupportedLocale } from "../types/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export async function apiFetch<T>(
  path: string,
  options?: { lang?: SupportedLocale; next?: RequestInit["next"] }
): Promise<T> {
  const url = new URL(path, API_URL);
  if (options?.lang) url.searchParams.set("lang", options.lang);

  const res = await fetch(url.toString(), {
    next: options?.next ?? { revalidate: 3600 }, // ISR por defecto 1h
  });

  const json = (await res.json()) as ApiResponse<T>;

  if (!json.ok) {
    throw new Error(json.error.message);
  }

  return json.data;
}
```

---

## 2. Ficha técnica de un monitor

### Ruta sugerida

```
app/monitores/[brand]/[slug]/page.tsx
```

### Código

```tsx
import { notFound } from "next/navigation";
import { apiFetch } from "@/lib/api";
import type { MonitorPublic } from "@/types/api";
import ScoreBadge from "@/components/ScoreBadge";
import SpecTable from "@/components/SpecTable";
import MonitorJsonLd from "@/components/MonitorJsonLd";

interface PageProps {
  params: Promise<{ brand: string; slug: string }>;
  searchParams: Promise<{ lang?: string }>;
}

export async function generateStaticParams() {
  const monitors = await apiFetch<{ slug: string; brand_slug: string }[]>(
    "/api/v1/monitors?limit=5000"
  );
  return monitors.map((m) => ({
    brand: m.brand_slug,
    slug: m.slug,
  }));
}

export async function generateMetadata({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { lang } = await searchParams;
  const monitor = await apiFetch<MonitorPublic>(`/api/v1/monitors/${slug}`, {
    lang: lang === "en" ? "en" : "es",
  });

  return {
    title: monitor.meta_title,
    description: monitor.meta_description,
  };
}

export default async function MonitorPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { lang } = await searchParams;
  const monitor = await apiFetch<MonitorPublic>(`/api/v1/monitors/${slug}`, {
    lang: lang === "en" ? "en" : "es",
  });

  if (!monitor) return notFound();

  return (
    <main className="container mx-auto p-6">
      <MonitorJsonLd monitor={monitor} />

      <header className="mb-8">
        <p className="text-sm text-gray-500">{monitor.brand.name}</p>
        <h1 className="text-3xl font-bold">{monitor.model_name}</h1>
        {monitor.main_image_url && (
          <img
            src={monitor.main_image_url}
            alt={monitor.model_name}
            className="mt-4 max-w-md rounded-lg"
          />
        )}
      </header>

      <section className="grid grid-cols-3 gap-4 mb-8">
        <ScoreBadge label="Gaming" score={monitor.scores.gaming} />
        <ScoreBadge label="Oficina" score={monitor.scores.office} />
        <ScoreBadge label="Edición" score={monitor.scores.editing} />
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Especificaciones técnicas</h2>
        <SpecTable base={monitor.base_specs} extended={monitor.extended_specs} />
      </section>

      <aside className="text-sm text-gray-400">
        Actualizado: {new Date(monitor.updated_at).toLocaleDateString()}
      </aside>
    </main>
  );
}
```

### Componentes de apoyo

```tsx
// components/ScoreBadge.tsx
export default function ScoreBadge({ label, score }: { label: string; score: number }) {
  return (
    <div className="p-4 rounded bg-gray-100 text-center">
      <div className="text-sm text-gray-600">{label}</div>
      <div className="text-2xl font-bold">{score}</div>
    </div>
  );
}
```

```tsx
// components/SpecTable.tsx
import type { MonitorBaseSpecs, ExtendedSpecs } from "@/types/api";

export default function SpecTable({
  base,
  extended,
}: {
  base: MonitorBaseSpecs;
  extended: ExtendedSpecs;
}) {
  const entries = [
    ["Tamaño", `${base.screen_size_inches}"`],
    ["Resolución", `${base.resolution_width}x${base.resolution_height}`],
    ["Panel", base.panel_type],
    ["Tasa de refresco", `${base.refresh_rate_hz} Hz`],
    ["Tiempo de respuesta", `${base.response_time_ms ?? "N/A"} ms`],
    ["HDR", base.hdr_support ?? "No"],
    ["VRR", base.has_vrr_sync ? "Sí" : "No"],
    ["KVM", base.has_kvm ? "Sí" : "No"],
    ["Altavoces", base.has_speakers ? "Sí" : "No"],
  ];

  return (
    <div className="space-y-6">
      <table className="w-full text-left border-collapse">
        <tbody>
          {entries.map(([k, v]) => (
            <tr key={k} className="border-b">
              <th className="py-2">{k}</th>
              <td className="py-2">{String(v)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {Object.entries(extended).map(([section, fields]) => (
        <div key={section}>
          <h3 className="font-semibold capitalize">{section}</h3>
          <table className="w-full text-left">
            <tbody>
              {Object.entries(fields ?? {}).map(([k, v]) => (
                <tr key={k} className="border-b">
                  <th className="py-2">{k}</th>
                  <td className="py-2">{String(v)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
```

```tsx
// components/MonitorJsonLd.tsx
import type { MonitorPublic, JsonLdProduct } from "@/types/api";

export default function MonitorJsonLd({ monitor }: { monitor: MonitorPublic }) {
  const jsonLd: JsonLdProduct = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: monitor.model_name,
    image: monitor.main_image_url ?? undefined,
    brand: { "@type": "Brand", name: monitor.brand.name },
    description: monitor.meta_description,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
```

---

## 3. Página VS (comparativa 1 vs 1)

### Ruta sugerida

```
app/comparativas/[slug]/page.tsx
```

### Código

```tsx
import { notFound } from "next/navigation";
import { apiFetch } from "@/lib/api";
import type { ComparisonPublic } from "@/types/api";
import ScoreBadge from "@/components/ScoreBadge";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
}

export async function generateStaticParams() {
  const comparisons = await apiFetch<{ slug: string }[]>(
    "/api/v1/comparisons?limit=5000"
  );
  return comparisons.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { lang } = await searchParams;
  const comparison = await apiFetch<ComparisonPublic>(
    `/api/v1/comparisons/${slug}`,
    { lang: lang === "en" ? "en" : "es" }
  );

  return {
    title: comparison.meta_title,
    description: comparison.meta_description,
  };
}

function ProfileRow({
  label,
  a,
  b,
  delta,
  winnerId,
}: {
  label: string;
  a: number;
  b: number;
  delta: number;
  winnerId: string;
}) {
  const aWins = winnerId === "" ? a >= b : false; // aquí se usa el UUID real del ganador
  const bWins = !aWins;

  return (
    <tr className="border-b">
      <td className="py-3 font-medium">{label}</td>
      <td className={`py-3 text-center ${aWins ? "font-bold text-green-600" : ""}`}>
        {a}
      </td>
      <td className={`py-3 text-center ${bWins ? "font-bold text-green-600" : ""}`}>
        {b}
      </td>
      <td className="py-3 text-center text-sm text-gray-500">Δ {delta}</td>
    </tr>
  );
}

export default async function ComparisonPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const { lang } = await searchParams;
  const c = await apiFetch<ComparisonPublic>(`/api/v1/comparisons/${slug}`, {
    lang: lang === "en" ? "en" : "es",
  });

  if (!c) return notFound();

  const profiles: ("gaming" | "office" | "editing")[] = ["gaming", "office", "editing"];

  return (
    <main className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2 text-center">
        {c.monitor_a.model_name} vs {c.monitor_b.model_name}
      </h1>
      <p className="text-center text-gray-500 mb-8">Comparativa completa</p>

      <div className="grid grid-cols-2 gap-8 mb-8">
        <div className="p-4 border rounded">
          <h2 className="text-xl font-semibold">{c.monitor_a.model_name}</h2>
          <div className="flex gap-2 mt-2">
            {profiles.map((p) => (
              <ScoreBadge key={p} label={p} score={c.monitor_a.scores[p]} />
            ))}
          </div>
        </div>
        <div className="p-4 border rounded">
          <h2 className="text-xl font-semibold">{c.monitor_b.model_name}</h2>
          <div className="flex gap-2 mt-2">
            {profiles.map((p) => (
              <ScoreBadge key={p} label={p} score={c.monitor_b.scores[p]} />
            ))}
          </div>
        </div>
      </div>

      <section className="mb-8">
        <h3 className="text-lg font-semibold mb-2">Ganadores por perfil</h3>
        <table className="w-full text-left">
          <thead>
            <tr>
              <th>Perfil</th>
              <th className="text-center">{c.monitor_a.model_name}</th>
              <th className="text-center">{c.monitor_b.model_name}</th>
              <th className="text-center">Diferencia</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((p) => (
              <ProfileRow
                key={p}
                label={p}
                a={c.monitor_a.scores[p]}
                b={c.monitor_b.scores[p]}
                delta={c.deltas[p]}
                winnerId={c.winners[p] as string}
              />
            ))}
          </tbody>
        </table>
      </section>

      {c.ai_summary && (
        <section className="mb-6 p-4 bg-gray-50 rounded">
          <h3 className="font-semibold mb-1">Resumen IA</h3>
          <p>{c.ai_summary}</p>
        </section>
      )}

      {c.ai_verdict && (
        <section className="p-4 border-l-4 border-blue-500">
          <h3 className="font-semibold mb-1">Veredicto</h3>
          <p>{c.ai_verdict}</p>
        </section>
      )}
    </main>
  );
}
```

> **Nota importante:** `c.winners` contiene los UUID de los monitores ganadores por perfil. Para resaltar el ganador compara `c.winners.gaming === c.monitor_a.id`.

---

## 4. ISR y revalidación

### Desde Next.js (tiempo de revalidación)

En `apiFetch` ya definimos:

```ts
next: { revalidate: 3600 }
```

Esto hace que la página se re-genere en segundo plano cada hora. Para datos que cambian poco (fichas de monitor), `86400` (1 día) es más adecuado.

### Desde el backend (revalidación bajo demanda)

Cuando el servicio de ingesta guarda un monitor, puedes hacer:

```ts
await fetch(`${process.env.NEXT_SITE_URL}/api/revalidate`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    path: `/monitores/${brandSlug}/${monitorSlug}`,
  }),
});
```

Y en Next.js:

```ts
// app/api/revalidate/route.ts
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { path } = await req.json();
  revalidatePath(path);
  return NextResponse.json({ revalidated: true, path });
}
```

---

## 5. Resumen de flujo

```
[Next.js SSG]  generateStaticParams() -> GET /api/v1/monitors?limit=5000
[Next.js page] fetch() -> GET /api/v1/monitors/:slug?lang=es
[Hono service] -> Supabase anon -> resuelve i18n y SEO -> JSON
[Next.js]      render Server Component + JSON-LD
[Post ingest]  Hono revalida /monitores/:brand/:slug
```

El frontend nunca toca la base de datos: siempre consume `ApiResponse<T>` desde Hono.
