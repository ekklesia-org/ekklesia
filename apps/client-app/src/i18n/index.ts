import { createI18n } from 'vue-i18n';
import { translations, type SupportedLocale } from '@ekklesia/translations';

// Client-specific translations
const clientTranslations = {
  en: {
    client: {
      title: 'Church Community',
      home: {
        title: 'Welcome to Our Church',
        upcoming_events: 'Upcoming Events',
        announcements: 'Announcements',
        quick_actions: 'Quick Actions'
      },
      events: {
        title: 'Events',
        upcoming: 'Upcoming Events',
        past: 'Past Events',
        register: 'Register',
        details: 'Event Details'
      },
      giving: {
        title: 'Giving',
        tithe: 'Tithe',
        offering: 'Offering',
        give_now: 'Give Now',
        giving_history: 'Giving History'
      },
      prayer: {
        title: 'Prayer Requests',
        submit_request: 'Submit Prayer Request',
        my_requests: 'My Requests'
      }
    }
  },
  es: {
    client: {
      title: 'Comunidad de la Iglesia',
      home: {
        title: 'Bienvenido a Nuestra Iglesia',
        upcoming_events: 'Próximos Eventos',
        announcements: 'Anuncios',
        quick_actions: 'Acciones Rápidas'
      },
      events: {
        title: 'Eventos',
        upcoming: 'Próximos Eventos',
        past: 'Eventos Pasados',
        register: 'Registrarse',
        details: 'Detalles del Evento'
      },
      giving: {
        title: 'Ofrendas',
        tithe: 'Diezmo',
        offering: 'Ofrenda',
        give_now: 'Dar Ahora',
        giving_history: 'Historial de Ofrendas'
      },
      prayer: {
        title: 'Peticiones de Oración',
        submit_request: 'Enviar Petición de Oración',
        my_requests: 'Mis Peticiones'
      }
    }
  },
  'pt-BR': {
    client: {
      title: 'Comunidade da Igreja',
      home: {
        title: 'Bem-vindo à Nossa Igreja',
        upcoming_events: 'Próximos Eventos',
        announcements: 'Anúncios',
        quick_actions: 'Ações Rápidas'
      },
      events: {
        title: 'Eventos',
        upcoming: 'Próximos Eventos',
        past: 'Eventos Passados',
        register: 'Registrar-se',
        details: 'Detalhes do Evento'
      },
      giving: {
        title: 'Ofertas',
        tithe: 'Dízimo',
        offering: 'Oferta',
        give_now: 'Dar Agora',
        giving_history: 'Histórico de Ofertas'
      },
      prayer: {
        title: 'Pedidos de Oração',
        submit_request: 'Enviar Pedido de Oração',
        my_requests: 'Meus Pedidos'
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
    en: { ...translations.en, ...clientTranslations.en },
    es: { ...translations.es, ...clientTranslations.es },
    'pt-BR': { ...translations['pt-BR'], ...clientTranslations['pt-BR'] }
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
