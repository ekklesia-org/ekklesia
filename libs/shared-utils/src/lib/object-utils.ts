/**
 * Check if a value is an object (not null, not array)
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Deep clone an object using JSON methods
 * Note: This will not work with functions, undefined, or circular references
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as T;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as T;
  if (typeof obj === 'object') {
    const cloned = {} as T;
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        (cloned as Record<string, unknown>)[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }
  return obj;
}

/**
 * Flatten a nested object with dot notation keys
 * Example: { a: { b: { c: 1 } } } -> { 'a.b.c': 1 }
 */
export function flattenObject(obj: Record<string, unknown>, prefix = ''): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const newKey = prefix ? `${prefix}.${key}` : key;

      if (isObject(obj[key])) {
        Object.assign(result, flattenObject(obj[key] as Record<string, unknown>, newKey));
      } else {
        result[newKey] = obj[key];
      }
    }
  }

  return result;
}

/**
 * Get a nested property from an object using dot notation
 * Example: getValue(obj, 'a.b.c') -> obj.a.b.c
 */
export function getValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((current, key) => {
    return current && typeof current === 'object' && current !== null && key in current ? (current as Record<string, unknown>)[key] : undefined;
  }, obj as unknown);
}

/**
 * Set a nested property in an object using dot notation
 * Example: setValue(obj, 'a.b.c', value) -> obj.a.b.c = value
 */
export function setValue(obj: Record<string, unknown>, path: string, value: unknown): void {
  const keys = path.split('.');
  const lastKey = keys.pop();

  if (!lastKey) return;

  let current = obj as Record<string, unknown>;
  for (const key of keys) {
    if (!current[key] || !isObject(current[key])) {
      current[key] = {};
    }
    current = current[key] as Record<string, unknown>;
  }

  current[lastKey] = value;
}

/**
 * Remove undefined and null values from an object
 */
export function removeEmptyValues(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj
      .map(removeEmptyValues)
      .filter((item) => item !== undefined && item !== null);
  }

  if (isObject(obj)) {
    const result: Record<string, unknown> = {};
    const objRecord = obj as Record<string, unknown>;
    for (const key in objRecord) {
      if (Object.prototype.hasOwnProperty.call(objRecord, key)) {
        const value = objRecord[key];
        if (value !== null && value !== undefined) {
          const cleanedValue = removeEmptyValues(value);
          if (cleanedValue !== null && cleanedValue !== undefined) {
            result[key] = cleanedValue;
          }
        }
      }
    }
    return result;
  }

  return obj;
}
