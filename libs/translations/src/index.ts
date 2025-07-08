export * from './lib/translations';

// Export all translation files
import en from './locales/en.json';
import es from './locales/es.json';
import ptBR from './locales/pt-BR.json';

export const translations = {
  en,
  es,
  'pt-BR': ptBR,
};

export const supportedLocales = ['en', 'es', 'pt-BR'] as const;
export type SupportedLocale = typeof supportedLocales[number];

export { en, es, ptBR };
