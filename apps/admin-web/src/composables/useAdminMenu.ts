import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { UserRole, User } from '@ekklesia/shared';
import type { MenuItem } from '@ekklesia/ui';
import {
  HomeIcon as DashboardIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  UsersIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  SpeakerWaveIcon,
  UserGroupIcon,
  CogIcon,
  DocumentChartBarIcon,
} from '@heroicons/vue/24/outline';

export const useAdminMenu = (user: User | null) => {
  const { t } = useI18n();

  // Role-based permission checks
  const isSuperAdmin = computed(() => user?.role === UserRole.SUPER_ADMIN);
  const isChurchAdmin = computed(() => user?.role === UserRole.CHURCH_ADMIN);
  const isPastor = computed(() => user?.role === UserRole.PASTOR);
  const isTreasurer = computed(() => user?.role === UserRole.TREASURER);
  const isSecretary = computed(() => user?.role === UserRole.SECRETARY);

  // Permission checks
  const canManageMembers = computed(() => 
    isSuperAdmin.value || isChurchAdmin.value || isPastor.value || isSecretary.value
  );

  const canManageEvents = computed(() => 
    isSuperAdmin.value || isChurchAdmin.value || isPastor.value || isSecretary.value
  );

  const canManageFinances = computed(() => 
    isSuperAdmin.value || isChurchAdmin.value || isPastor.value || isTreasurer.value
  );

  const canManageAnnouncements = computed(() => 
    isSuperAdmin.value || isChurchAdmin.value || isPastor.value || isSecretary.value
  );

  const canManageUsers = computed(() => 
    isSuperAdmin.value || isChurchAdmin.value
  );

  const canViewReports = computed(() => 
    isSuperAdmin.value || isChurchAdmin.value || isPastor.value || isTreasurer.value
  );

  // Generate menu items based on user role
  const menuItems = computed<MenuItem[]>(() => {
    const items: MenuItem[] = [];

    // Dashboard - Always visible
    items.push({
      id: 'dashboard',
      label: t('sidebar.dashboard'),
      to: '/dashboard',
      icon: DashboardIcon,
    });

    // Super Admin Only - Church Management
    if (isSuperAdmin.value) {
      items.push({
        id: 'churches',
        label: t('sidebar.churches'),
        to: '/churches',
        icon: BuildingOfficeIcon,
      });
    }

    // Super Admin Only - Global Statistics
    if (isSuperAdmin.value) {
      items.push({
        id: 'statistics',
        label: t('sidebar.statistics'),
        to: '/statistics',
        icon: ChartBarIcon,
      });
    }

    // Church Admin and up - Members Management
    if (canManageMembers.value) {
      items.push({
        id: 'members',
        label: t('sidebar.members'),
        to: '/members',
        icon: UsersIcon,
      });
    }

    // Church Admin and up - Events Management
    if (canManageEvents.value) {
      items.push({
        id: 'events',
        label: t('sidebar.events'),
        to: '/events',
        icon: CalendarIcon,
      });
    }

    // Pastor, Treasurer, Church Admin - Financial Management
    if (canManageFinances.value) {
      items.push({
        id: 'finances',
        label: t('sidebar.finances'),
        to: '/finances',
        icon: CurrencyDollarIcon,
      });
    }

    // Church Admin and up - Announcements
    if (canManageAnnouncements.value) {
      items.push({
        id: 'announcements',
        label: t('sidebar.announcements'),
        to: '/announcements',
        icon: SpeakerWaveIcon,
      });
    }

    // Church Admin and up - User Management
    if (canManageUsers.value) {
      items.push({
        id: 'users',
        label: t('sidebar.users'),
        to: '/users',
        icon: UserGroupIcon,
      });
    }

    // Church Admin only - Church Settings
    if (isChurchAdmin.value) {
      items.push({
        id: 'church-settings',
        label: t('sidebar.church_settings'),
        to: '/church-settings',
        icon: CogIcon,
      });
    }

    // Reports - For authorized roles
    if (canViewReports.value) {
      items.push({
        id: 'reports',
        label: t('sidebar.reports'),
        to: '/reports',
        icon: DocumentChartBarIcon,
      });
    }

    return items;
  });

  return {
    menuItems,
    // Export permission checks if needed elsewhere
    isSuperAdmin,
    isChurchAdmin,
    isPastor,
    isTreasurer,
    isSecretary,
    canManageMembers,
    canManageEvents,
    canManageFinances,
    canManageAnnouncements,
    canManageUsers,
    canViewReports,
  };
};
