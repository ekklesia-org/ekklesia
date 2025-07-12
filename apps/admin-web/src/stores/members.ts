import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { MemberService, Member } from './../services/memberService';
import { ICreateMemberDto, IUpdateMemberDto } from '@ekklesia/shared';

const memberService = new MemberService();

export const useMembersStore = defineStore('members', () => {
  // State
  const members = ref<Member[]>([]);
  const isLoading = ref(false);
  const error = ref('');
  const currentPage = ref(1);
  const totalPages = ref(1);
  const total = ref(0);
  const limit = ref(10);

  // Getters
  const hasError = computed(() => !!error.value);

  // Actions
  const fetchMembers = async (page = 1, includeInactive = false, churchId?: string) => {
    isLoading.value = true;
    error.value = '';
    try {
      const response = await memberService.getMembers(page, limit.value, includeInactive, churchId);
      members.value = response.members;
      currentPage.value = response.page;
      totalPages.value = response.totalPages;
      total.value = response.total;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch members';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const createMember = async (data: ICreateMemberDto) => {
    isLoading.value = true;
    error.value = '';
    try {
      await memberService.createMember(data);
      await fetchMembers(currentPage.value);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create member';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const updateMember = async (id: string, data: IUpdateMemberDto) => {
    isLoading.value = true;
    error.value = '';
    try {
      await memberService.updateMember(id, data);
      await fetchMembers(currentPage.value);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update member';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const deleteMember = async (id: string) => {
    isLoading.value = true;
    error.value = '';
    try {
      await memberService.deleteMember(id);
      await fetchMembers(currentPage.value);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete member';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const activateMember = async (id: string) => {
    isLoading.value = true;
    error.value = '';
    try {
      await memberService.activateMember(id);
      await fetchMembers(currentPage.value);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to activate member';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const deactivateMember = async (id: string) => {
    isLoading.value = true;
    error.value = '';
    try {
      await memberService.deactivateMember(id);
      await fetchMembers(currentPage.value);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to deactivate member';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    // State
    members,
    isLoading,
    error,
    hasError,
    currentPage,
    totalPages,
    total,
    limit,

    // Actions
    fetchMembers,
    createMember,
    updateMember,
    deleteMember,
    activateMember,
    deactivateMember,
  };
});
