// Define SupportedLocale type locally to avoid circular dependencies
export const supportedLocales = ['en', 'es', 'pt-BR'] as const;
export type SupportedLocale = typeof supportedLocales[number];

// Helpers --------------------------------------------------------
type IsPlainObject<T> = T extends object
  ? (T extends (...args: any[]) => any ? false : true)          // exclude functions
  : false;

type MergeDeepValue<T, U> =
  IsPlainObject<T> extends true
    ? IsPlainObject<U> extends true
      ? MergeDeep<T, U>                            // recurse
      : U
    : U;

// Core type ------------------------------------------------------
export type MergeDeep<T, U> = {
  // keys present in both
  [K in keyof T & keyof U]: MergeDeepValue<T[K], U[K]>;
} & {
  // keys only in U
  [K in Exclude<keyof U, keyof T>]: U[K];
} & {
  // keys only in T
  [K in Exclude<keyof T, keyof U>]: T[K];
};

/**
 * Deep merge function to properly merge nested objects
 * Useful for merging translation objects without losing nested properties
 */
export function deepMerge<T extends Record<string, unknown>, S extends Record<string, unknown>>(target: T, source: S): MergeDeep<T, S> {
  const result = { ...Object(target) } as Record<string, unknown>;

  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
        // If both target and source have the same key and both are objects, merge them
        if (typeof result[key] === 'object' && result[key] !== null && !Array.isArray(result[key])) {
          result[key] = deepMerge(
            result[key] as Record<string, unknown>,
            source[key] as Record<string, unknown>
          );
        } else {
          result[key] = source[key];
        }
      } else {
        result[key] = source[key];
      }
    }
  }

  return result as MergeDeep<T, S>;
}

/**
 * Get browser language or default to English
 * Maps browser language codes to supported locales
 */
export function getBrowserLocale(): SupportedLocale {
  const browserLang = navigator.language || navigator.languages[0];
  const locale = browserLang.split('-')[0];

  if (locale === 'es') return 'es';
  if (locale === 'pt') return 'pt-BR';
  return 'en';
}

/**
 * Get saved locale from localStorage or use browser default
 * Validates that the saved locale is supported
 */
export function getInitialLocale(): SupportedLocale {
  const saved = localStorage.getItem('ekklesia-locale') as SupportedLocale;
  if (saved && ['en', 'es', 'pt-BR'].includes(saved)) {
    return saved;
  }
  return getBrowserLocale();
}

// Type for i18n instance with the expected structure
interface I18nInstance {
  global: {
    locale: {
      value: SupportedLocale;
    };
  };
}

/**
 * Set the current locale and persist it
 * Updates both the i18n instance and localStorage
 */
export function setLocale(locale: SupportedLocale, i18nInstance: I18nInstance): void {
  i18nInstance.global.locale.value = locale;
  localStorage.setItem('ekklesia-locale', locale);
  document.documentElement.lang = locale;
}

/**
 * Get the current locale from an i18n instance
 */
export function getCurrentLocale(i18nInstance: I18nInstance): SupportedLocale {
  return i18nInstance.global.locale.value;
}

/**
 * Supported locales configuration with metadata
 * Can be imported and used across all apps
 */
export const supportedLocalesWithMetadata = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'pt-BR', name: 'Português (Brasil)', flag: '🇧🇷' }
] as const;
