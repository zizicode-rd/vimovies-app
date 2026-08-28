import { NextRequest, NextResponse } from 'next/server';
import { apiFetch } from '@/lib/api';
import type { BrandPublic, PaginatedResponse } from '@/types/api';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lang = searchParams.get('lang') ?? 'es';
  const data = await apiFetch<PaginatedResponse<BrandPublic> | BrandPublic[]>('/api/v1/brands', { lang: lang as 'es' | 'en' });
  return NextResponse.json(data);
}
