import { createI18n } from 'vue-i18n';
import { translations, type SupportedLocale } from '@ekklesia/translations';
import {
  deepMerge,
  getInitialLocale,
  setLocale as setSharedLocale,
  getCurrentLocale as getSharedCurrentLocale,
  supportedLocalesWithMetadata
} from '@ekklesia/shared-utils';

// Import Admin-specific translations
import en from './locales/en.json';
import es from './locales/es.json';
import ptBR from './locales/pt-BR.json';

const adminTranslations = { en, es, 'pt-BR': ptBR };

// Create i18n instance
export const i18n = createI18n({
  legacy: false,
  locale: getInitialLocale(),
  fallbackLocale: 'en',
  messages: {
    en: deepMerge(translations.en, adminTranslations.en),
    es: deepMerge(translations.es, adminTranslations.es),
    'pt-BR': deepMerge(translations['pt-BR'], adminTranslations['pt-BR'])
  }
});

// Helper functions - using shared utilities
export function setLocale(locale: SupportedLocale): void {
  setSharedLocale(locale, i18n);
}

export function getCurrentLocale(): SupportedLocale {
  return getSharedCurrentLocale(i18n);
}

// Re-export supported locales from shared utils
export const supportedLocales = supportedLocalesWithMetadata;
