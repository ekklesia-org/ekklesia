import axios from 'axios';
import { Church, ChurchWithUsers, ChurchListResponse, ICreateChurchDto, IUpdateChurchDto } from '@ekklesia/shared';

export class ChurchService {
  private readonly baseUrl = '/api/churches';

  /**
   * Get all churches with pagination
   */
  async getChurches(
    page = 1,
    limit = 10,
    includeInactive = false
  ): Promise<ChurchListResponse> {
    const response = await axios.get<ChurchListResponse>(this.baseUrl, {
      params: { page, limit, includeInactive }
    });
    return response.data;
  }

  /**
   * Get a single church by ID
   */
  async getChurch(id: string): Promise<ChurchWithUsers> {
    const response = await axios.get<ChurchWithUsers>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  /**
   * Get a church by slug
   */
  async getChurchBySlug(slug: string): Promise<ChurchWithUsers> {
    const response = await axios.get<ChurchWithUsers>(`${this.baseUrl}/slug/${slug}`);
    return response.data;
  }

  /**
   * Create a new church
   */
  async createChurch(data: ICreateChurchDto): Promise<ChurchWithUsers> {
    const response = await axios.post<ChurchWithUsers>(this.baseUrl, data);
    return response.data;
  }

  /**
   * Update an existing church
   */
  async updateChurch(id: string, data: IUpdateChurchDto): Promise<ChurchWithUsers> {
    const response = await axios.put<ChurchWithUsers>(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  /**
   * Soft delete a church
   */
  async deleteChurch(id: string): Promise<ChurchWithUsers> {
    const response = await axios.delete<ChurchWithUsers>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  /**
   * Permanently delete a church
   */
  async hardDeleteChurch(id: string): Promise<void> {
    await axios.delete(`${this.baseUrl}/${id}/hard`);
  }

  /**
   * Transfer Super Admin users from one church to another
   */
  async transferSuperAdmins(fromChurchId: string, toChurchId: string): Promise<{ message: string }> {
    const response = await axios.post<{ message: string }>(
      `${this.baseUrl}/${fromChurchId}/transfer-super-admins/${toChurchId}`
    );
    return response.data;
  }

  /**
   * Get available churches for Super Admin transfer
   */
  async getTransferOptions(churchId: string): Promise<Church[]> {
    const response = await axios.get<Church[]>(`${this.baseUrl}/${churchId}/transfer-options`);
    return response.data;
  }

  /**
   * Generate slug from church name
   */
  generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
