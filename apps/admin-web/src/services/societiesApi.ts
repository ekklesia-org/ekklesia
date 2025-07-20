import { CreateSocietyDto, UpdateSocietyDto } from '@ekklesia/api/societies';
import { SocietyListResponse } from '@ekklesia/shared';
import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-type': 'application/json',
  },
});


export const societiesApi = {
  async getSocieties(churchId: string, params: Record<string, string | number> = {}): Promise<SocietyListResponse> {
    const response = await apiClient.get(`/societies`, {
      params: {
        churchId,
        ...params
      }
    });

    // Handle response format - may need adaptation based on actual API response
    return response.data;
  },

  async createSociety(data: CreateSocietyDto) {
    const response = await apiClient.post('/societies', data);
    return response.data;
  },

  async updateSociety(id: string, data: UpdateSocietyDto) {
    const response = await apiClient.patch(`/societies/${id}`, data);
    return response.data;
  },

  async deleteSociety(id: string) {
    const response = await apiClient.delete(`/societies/${id}`);
    return response.data;
  },
};
