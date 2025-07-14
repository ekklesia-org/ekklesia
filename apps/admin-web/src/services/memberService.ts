import axios from 'axios';
import { ICreateMemberDto, IUpdateMemberDto } from '@ekklesia/shared';

export interface Member {
  id: string;
  churchId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: Date;
  cpf?: string;
  rg?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'TRANSFERRED' | 'DECEASED';
  maritalStatus: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';
  baptismDate?: Date;
  memberSince: Date;
  spouseId?: string;
  profession?: string;
  notes?: string;
  photoUrl?: string;
  userId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MemberListResponse {
  members: Member[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class MemberService {
  private readonly baseUrl = '/api/members';

  /**
   * Get all members with pagination
   */
  async getMembers(
    page = 1,
    limit = 10,
    includeInactive = false,
    churchId?: string
  ): Promise<MemberListResponse> {
    const response = await axios.get<MemberListResponse>(this.baseUrl, {
      params: { page, limit, includeInactive, churchId }
    });
    return response.data;
  }

  /**
   * Get a single member by ID
   */
  async getMember(id: string): Promise<Member> {
    const response = await axios.get<Member>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  /**
   * Create a new member
   */
  async createMember(data: ICreateMemberDto): Promise<Member> {
    const response = await axios.post<Member>(this.baseUrl, data);
    return response.data;
  }

  /**
   * Update an existing member
   */
  async updateMember(id: string, data: IUpdateMemberDto): Promise<Member> {
    const response = await axios.put<Member>(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  /**
   * Activate a member
   */
  async activateMember(id: string): Promise<void> {
    await axios.put(`${this.baseUrl}/${id}/activate`);
  }

  /**
   * Deactivate a member
   */
  async deactivateMember(id: string): Promise<void> {
    await axios.put(`${this.baseUrl}/${id}/deactivate`);
  }

  /**
   * Delete a member (soft delete)
   */
  async deleteMember(id: string): Promise<void> {
    await axios.delete(`${this.baseUrl}/${id}`);
  }

  /**
   * Hard delete a member
   */
  async hardDeleteMember(id: string): Promise<void> {
    await axios.delete(`${this.baseUrl}/${id}/hard`);
  }

  /**
   * Unlink user from member
   */
  async unlinkUser(id: string): Promise<void> {
    await axios.put(`${this.baseUrl}/${id}/unlink-user`);
  }
}

// Export a default instance
export const memberService = new MemberService();
