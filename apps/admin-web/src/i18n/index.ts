import { createI18n } from 'vue-i18n';
import { translations, type SupportedLocale } from '@ekklesia/translations';

// Import Admin-specific translations
import en from './locales/en.json';
import es from './locales/es.json';
import ptBR from './locales/pt-BR.json';

const adminTranslations = { en, es, 'pt-BR': ptBR };

// Deep merge function to properly merge nested objects
function deepMerge(target: any, source: any): any {
  const result = { ...target };

  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
        // If both target and source have the same key and both are objects, merge them
        if (typeof result[key] === 'object' && result[key] !== null && !Array.isArray(result[key])) {
          result[key] = deepMerge(result[key], source[key]);
        } else {
          result[key] = source[key];
        }
      } else {
        result[key] = source[key];
      }
    }
  }

  return result;
}

// Get browser language or default to English
function getBrowserLocale(): SupportedLocale {
  const browserLang = navigator.language || navigator.languages[0];
  const locale = browserLang.split('-')[0];

  if (locale === 'es') return 'es';
  if (locale === 'pt') return 'pt-BR';
  return 'en';
}

// Get saved locale from localStorage or use browser default
function getInitialLocale(): SupportedLocale {
  const saved = localStorage.getItem('ekklesia-locale') as SupportedLocale;
  if (saved && ['en', 'es', 'pt-BR'].includes(saved)) {
    return saved;
  }
  return getBrowserLocale();
}

// Create i18n instance
export const i18n = createI18n({
  legacy: false,
  locale: getInitialLocale(),
  fallbackLocale: 'en',
  messages: {
    en: { ...deepMerge(translations.en, adminTranslations.en) },
    es: { ...deepMerge(translations.es, adminTranslations.es) },
    'pt-BR': { ...deepMerge(translations['pt-BR'], adminTranslations['pt-BR']) }
  }
});

// Helper functions
export function setLocale(locale: SupportedLocale) {
  i18n.global.locale.value = locale;
  localStorage.setItem('ekklesia-locale', locale);
  document.documentElement.lang = locale;
}

export function getCurrentLocale(): SupportedLocale {
  return i18n.global.locale.value as SupportedLocale;
}

export const supportedLocales = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'pt-BR', name: 'Português (Brasil)', flag: '🇧🇷' }
] as const;
