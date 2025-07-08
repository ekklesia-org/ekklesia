import { createI18n } from 'vue-i18n';
import { translations, type SupportedLocale } from '@ekklesia/translations';

// Admin-specific translations
const adminTranslations = {
  en: {
    app: {
      title: 'Ekklesia Admin'
    },
    auth: {
      login: 'Login',
      email: 'Email',
      password: 'Password',
      logout: 'Logout',
      admin_portal: 'Administrative Portal',
      email_placeholder: 'Enter your email address',
      password_placeholder: 'Enter your password',
      logging_in: 'Signing in...',
      need_help: 'Need help? Contact your system administrator'
    },
    dashboard: {
      title: 'Dashboard',
      welcome: 'Welcome back, {name}!',
      members: 'Total Members',
      events: 'Upcoming Events',
      donations: 'Monthly Donations',
      announcements: 'Active Announcements',
      quick_actions: 'Quick Actions',
      add_member: 'Add New Member',
      create_event: 'Create Event',
      new_announcement: 'New Announcement'
    },
    validation: {
      required: '{field} is required',
      email_invalid: 'Please enter a valid email address',
      min_length: '{field} must be at least {min} characters'
    },
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
    app: {
      title: 'Ekklesia Admin'
    },
    auth: {
      login: 'Iniciar Sesión',
      email: 'Correo Electrónico',
      password: 'Contraseña',
      logout: 'Cerrar Sesión',
      admin_portal: 'Portal Administrativo',
      email_placeholder: 'Ingresa tu correo electrónico',
      password_placeholder: 'Ingresa tu contraseña',
      logging_in: 'Iniciando sesión...',
      need_help: '¿Necesitas ayuda? Contacta a tu administrador del sistema'
    },
    dashboard: {
      title: 'Panel de Control',
      welcome: '¡Bienvenido de vuelta, {name}!',
      members: 'Total de Miembros',
      events: 'Eventos Próximos',
      donations: 'Donaciones Mensuales',
      announcements: 'Anuncios Activos',
      quick_actions: 'Acciones Rápidas',
      add_member: 'Agregar Nuevo Miembro',
      create_event: 'Crear Evento',
      new_announcement: 'Nuevo Anuncio'
    },
    validation: {
      required: '{field} es obligatorio',
      email_invalid: 'Por favor ingresa un correo electrónico válido',
      min_length: '{field} debe tener al menos {min} caracteres'
    },
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
    app: {
      title: 'Ekklesia Admin'
    },
    auth: {
      login: 'Entrar',
      email: 'E-mail',
      password: 'Senha',
      logout: 'Sair',
      admin_portal: 'Portal Administrativo',
      email_placeholder: 'Digite seu endereço de e-mail',
      password_placeholder: 'Digite sua senha',
      logging_in: 'Entrando...',
      need_help: 'Precisa de ajuda? Entre em contato com o administrador do sistema'
    },
    dashboard: {
      title: 'Painel de Controle',
      welcome: 'Bem-vindo de volta, {name}!',
      members: 'Total de Membros',
      events: 'Eventos Próximos',
      donations: 'Doações Mensais',
      announcements: 'Anúncios Ativos',
      quick_actions: 'Ações Rápidas',
      add_member: 'Adicionar Novo Membro',
      create_event: 'Criar Evento',
      new_announcement: 'Novo Anúncio'
    },
    validation: {
      required: '{field} é obrigatório',
      email_invalid: 'Por favor, insira um endereço de e-mail válido',
      min_length: '{field} deve ter pelo menos {min} caracteres'
    },
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
