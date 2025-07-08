import { createI18n } from 'vue-i18n';
import { translations, type SupportedLocale } from '@ekklesia/translations';

// Admin-specific translations
const adminTranslations = {
  en: {
    admin: {
      title: 'Church Administration',
      dashboard: {
        title: 'Admin Dashboard',
        overview: 'Overview',
        statistics: 'Statistics',
        recent_activity: 'Recent Activity'
      },
      users: {
        title: 'User Management',
        add_user: 'Add User',
        roles: 'Roles',
        permissions: 'Permissions'
      },
      church_settings: {
        title: 'Church Settings',
        general: 'General Settings',
        modules: 'Enabled Modules',
        integrations: 'Integrations'
      }
    }
  },
  es: {
    admin: {
      title: 'Administración de la Iglesia',
      dashboard: {
        title: 'Panel de Administración',
        overview: 'Resumen',
        statistics: 'Estadísticas',
        recent_activity: 'Actividad Reciente'
      },
      users: {
        title: 'Gestión de Usuarios',
        add_user: 'Agregar Usuario',
        roles: 'Roles',
        permissions: 'Permisos'
      },
      church_settings: {
        title: 'Configuración de la Iglesia',
        general: 'Configuración General',
        modules: 'Módulos Habilitados',
        integrations: 'Integraciones'
      }
    }
  },
  'pt-BR': {
    admin: {
      title: 'Administração da Igreja',
      dashboard: {
        title: 'Painel de Administração',
        overview: 'Visão Geral',
        statistics: 'Estatísticas',
        recent_activity: 'Atividade Recente'
      },
      users: {
        title: 'Gerenciamento de Usuários',
        add_user: 'Adicionar Usuário',
        roles: 'Funções',
        permissions: 'Permissões'
      },
      church_settings: {
        title: 'Configurações da Igreja',
        general: 'Configurações Gerais',
        modules: 'Módulos Habilitados',
        integrations: 'Integrações'
      }
    }
  }
};

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
    en: { ...translations.en, ...adminTranslations.en },
    es: { ...translations.es, ...adminTranslations.es },
    'pt-BR': { ...translations['pt-BR'], ...adminTranslations['pt-BR'] }
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
