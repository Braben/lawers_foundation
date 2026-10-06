import 'server-only';
import { cache } from 'react';
import { notFound } from 'next/navigation';
import { API_BASE } from './api-base';

export const getPublicData = cache(async <T,>(path: string): Promise<T> => {
  const response = await fetch(`${API_BASE}/api/${path}`, { cache: 'no-store', signal: AbortSignal.timeout(15000) });
  if (response.status === 404) notFound();
  if (!response.ok) throw new Error('Public content is temporarily unavailable');
  const result = await response.json();
  if (!result.success) throw new Error('Public content is temporarily unavailable');
  return result.data as T;
});
