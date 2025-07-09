import { User, UserRole } from '@ekklesia/shared/index';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { MenuItem } from '@ekklesia/ui';
import {
  HomeIcon,
  CalendarIcon,
  UsersIcon,
  SpeakerWaveIcon,
  BookOpenIcon,
  UserIcon,
  Cog6ToothIcon,
} from '@heroicons/vue/24/outline';

export const useClientMenu = (user: User | null) => {
  const { t } = useI18n();

  // Role-based permission checks for client app
  const isMember = computed(() => user?.role === UserRole.MEMBER);
  const isSecretary = computed(() => user?.role === UserRole.SECRETARY);
  const isPastor = computed(() => user?.role === UserRole.PASTOR);
  const isChurchAdmin = computed(() => user?.role === UserRole.CHURCH_ADMIN);

  // Generate menu items based on user role for client app
  const menuItems = computed<MenuItem[]>(() => {
    const items: MenuItem[] = [];

    // Home - Always visible
    items.push({
      id: 'home',
      label: t('client_sidebar.home'),
      to: '/',
      icon: HomeIcon,
    });

    // Events - Always visible
    items.push({
      id: 'events',
      label: t('client_sidebar.events'),
      to: '/events',
      icon: CalendarIcon,
    });

    // Members directory - For logged in users
    if (user) {
      items.push({
        id: 'members',
        label: t('client_sidebar.members'),
        to: '/members',
        icon: UsersIcon,
      });
    }

    // Announcements - Always visible
    items.push({
      id: 'announcements',
      label: t('client_sidebar.announcements'),
      to: '/announcements',
      icon: SpeakerWaveIcon,
    });

    // Resources/Library - For logged in users
    if (user) {
      items.push({
        id: 'resources',
        label: t('client_sidebar.resources'),
        to: '/resources',
        icon: BookOpenIcon,
      });
    }

    // My Profile - For logged in users
    if (user) {
      items.push({
        id: 'profile',
        label: t('client_sidebar.profile'),
        to: '/profile',
        icon: UserIcon,
      });
    }

    // Settings - For logged in users
    if (user) {
      items.push({
        id: 'settings',
        label: t('client_sidebar.settings'),
        to: '/settings',
        icon: Cog6ToothIcon,
      });
    }

    return items;
  });

  return {
    menuItems,
    // Export permission checks if needed elsewhere
    isMember,
    isSecretary,
    isPastor,
    isChurchAdmin,
  };
};
