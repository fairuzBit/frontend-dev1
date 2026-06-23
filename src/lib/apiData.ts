const inFlightRequests = new Map<string, Promise<unknown>>();

export async function withRequestCache<T>(cacheKey: string, request: () => Promise<T>): Promise<T> {
  const existingRequest = inFlightRequests.get(cacheKey);
  if (existingRequest) {
    return existingRequest as Promise<T>;
  }

  const pendingRequest = Promise.resolve().then(request);
  inFlightRequests.set(cacheKey, pendingRequest as Promise<unknown>);

  try {
    return await pendingRequest;
  } finally {
    inFlightRequests.delete(cacheKey);
  }
}

export function unwrapPayload<T = unknown>(payload: unknown): T {
  if (!payload || typeof payload !== 'object') {
    return payload as T;
  }

  const record = payload as Record<string, unknown>;
  if ('data' in record && record.data !== undefined) {
    return record.data as T;
  }

  return payload as T;
}

export function normalizeRecord(payload: unknown): Record<string, unknown> {
  const unwrapped = unwrapPayload(payload);

  if (unwrapped && typeof unwrapped === 'object' && !Array.isArray(unwrapped)) {
    return unwrapped as Record<string, unknown>;
  }

  return {};
}

export function normalizeList(payload: unknown): Array<Record<string, unknown>> {
  const unwrapped = unwrapPayload(payload);

  if (Array.isArray(unwrapped)) {
    return unwrapped as Array<Record<string, unknown>>;
  }

  if (unwrapped && typeof unwrapped === 'object') {
    const record = unwrapped as Record<string, unknown>;
    for (const key of ['data', 'items', 'results', 'bookings', 'schedules', 'notifications', 'history']) {
      const value = record[key];
      if (Array.isArray(value)) {
        return value as Array<Record<string, unknown>>;
      }
    }
  }

  return [];
}

export function pickValue(payload: unknown, keys: string[]): unknown {
  const record = normalizeRecord(payload);
  for (const key of keys) {
    if (record[key] !== undefined && record[key] !== null) {
      return record[key];
    }
  }

  return null;
}

export function formatRupiah(value: unknown): string {
  if (value === null || value === undefined) return 'Rp0';
  const number = Number(value);
  if (isNaN(number)) return 'Rp0';
  return `Rp${number.toLocaleString('id-ID')}`;
}
