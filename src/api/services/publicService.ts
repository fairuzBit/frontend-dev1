import apiClient from '@/api/axios';
import { withRequestCache } from '@/lib/apiData';

class PublicService {
  async register(payload: Record<string, unknown>) {
    return withRequestCache('public.register', async () => {
      const response = await apiClient.post('/register', payload);
      return response.data;
    });
  }

  async login(payload: Record<string, unknown>) {
    return withRequestCache('public.login', async () => {
      const response = await apiClient.post('/login', payload);
      return response.data;
    });
  }

  async getCourses() {
    return withRequestCache('public.courses', async () => {
      const response = await apiClient.get('/courses');
      return response.data;
    });
  }

  async getMasterSlots() {
    return withRequestCache('public.master-slots', async () => {
      const response = await apiClient.get('/master-slots');
      return response.data;
    });
  }

  async getUser() {
    return withRequestCache('public.user', async () => {
      const response = await apiClient.get('/user');
      return response.data;
    });
  }

  async logout() {
    const response = await apiClient.post('/logout');
    return response.data;
  }
}

export const publicService = new PublicService();
