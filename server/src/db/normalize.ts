function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function convertKeys(obj: any): any {
  if (Array.isArray(obj)) return obj.map(convertKeys);
  if (obj === null || typeof obj !== 'object') return obj;

  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = toCamelCase(key);
    result[camelKey] = convertKeys(value);
  }
  return result;
}

const JOIN_KEY_MAP: Record<string, string> = {
  categories: 'category',
  users: 'user',
};

const STRIP_FIELDS = new Set(['password_hash', 'passwordHash']);

export function normalize<T>(data: T): T {
  if (Array.isArray(data)) return data.map(normalize) as T;
  if (data === null || typeof data !== 'object') return data;

  const converted = convertKeys(data);
  const result: any = {};

  for (const [key, value] of Object.entries(converted)) {
    if (STRIP_FIELDS.has(key)) continue;
    const mapped = JOIN_KEY_MAP[key] || key;
    result[mapped] = value;
  }

  return result;
}
