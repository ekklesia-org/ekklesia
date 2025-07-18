import axios from 'axios';
import type {
  ICreateSocietyDto,
  IUpdateSocietyDto,
} from '@ekklesia/shared';

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-type': 'application/json',
  },
});

export const societiesApi = {
  async getSocieties(churchId: string, params: Record<string, string | number> = {}) {
    const response = await apiClient.get(`/societies?churchId=${churchId}`, {
      params,
    });
    return response.data;
  },

  async createSociety(data: ICreateSocietyDto) {
    await apiClient.post('/societies', data);
  },

  async updateSociety(id: string, data: IUpdateSocietyDto) {
    await apiClient.patch(`/societies/${id}`, data);
  },

  async deleteSociety(id: string) {
    await apiClient.delete(`/societies/${id}`);
  },
};
