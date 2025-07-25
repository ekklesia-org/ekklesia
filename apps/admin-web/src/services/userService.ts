import axios from 'axios';
import { User, UserListResponse, ICreateUserDto, IUpdateUserDto } from '@ekklesia/shared';

export class UserService {
  private readonly baseUrl = '/api/users';

  /**
   * Get all users with pagination
   */
  async getUsers(
    page = 1,
    limit = 10,
    includeInactive = false,
    churchId?: string
  ): Promise<UserListResponse> {
    const response = await axios.get<UserListResponse>(this.baseUrl, {
      params: { page, limit, includeInactive, churchId }
    });
    return response.data;
  }

  /**
   * Get a single user by ID
   */
  async getUser(id: string): Promise<User> {
    const response = await axios.get<User>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  /**
   * Create a new user
   */
  async createUser(data: ICreateUserDto): Promise<User> {
    const response = await axios.post<User>(this.baseUrl, data);
    return response.data;
  }

  /**
   * Update an existing user
   */
  async updateUser(id: string, data: IUpdateUserDto): Promise<User> {
    const response = await axios.put<User>(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  /**
   * Activate a user
   */
  async activateUser(id: string): Promise<void> {
    await axios.put(`${this.baseUrl}/${id}/activate`);
  }

  /**
   * Deactivate a user
   */
  async deactivateUser(id: string): Promise<void> {
    await axios.put(`${this.baseUrl}/${id}/deactivate`);
  }

  /**
   * Delete a user (soft delete)
   */
  async deleteUser(id: string): Promise<void> {
    await axios.delete(`${this.baseUrl}/${id}`);
  }

  /**
   * Hard delete a user
   */
  async hardDeleteUser(id: string): Promise<void> {
    await axios.delete(`${this.baseUrl}/${id}/hard`);
  }

  /**
   * Get users available to link to a member
   */
  async getAvailableForMember(churchId?: string, excludeMemberId?: string): Promise<User[]> {
    const response = await axios.get<User[]>(`${this.baseUrl}/available/for-member`, {
      params: { churchId, excludeMemberId }
    });
    return response.data;
  }
}

// Export a default instance
export const userService = new UserService();

