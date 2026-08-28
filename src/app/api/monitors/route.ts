import { NextRequest, NextResponse } from 'next/server';
import { apiFetch } from '@/lib/api';
import type { PaginatedResponse, MonitorListItem } from '@/types/api';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const qs = new URLSearchParams();
  for (const [key, value] of searchParams.entries()) {
    qs.set(key, value);
  }
  const data = await apiFetch<PaginatedResponse<MonitorListItem>>(`/api/v1/monitors?${qs.toString()}`);
  return NextResponse.json(data);
}
