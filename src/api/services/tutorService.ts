import apiClient from '@/api/axios';
import { withRequestCache } from '@/lib/apiData';

export interface TutorDashboardResponse {
  summary: {
    activeSessions: number;
    earnings: number;
    pendingBookings: number;
  };
  upcomingSessions: Array<{
    id: number;
    title: string;
    time: string;
    learner: string;
  }>;
}

class TutorService {
  async getDashboard() {
    return withRequestCache('tutor.dashboard', async () => {
      const response = await apiClient.get<TutorDashboardResponse>('/tutor/dashboard');
      return response.data;
    });
  }

  async getAvailability() {
    return withRequestCache('tutor.availability', async () => {
      const response = await apiClient.get('/tutor/availability');
      return response.data;
    });
  }

  async getBookings() {
    return withRequestCache('tutor.bookings', async () => {
      const response = await apiClient.get('/tutor/bookings');
      return response.data;
    });
  }

  async getHistory() {
    return withRequestCache('tutor.history', async () => {
      const response = await apiClient.get('/tutor/history');
      return response.data;
    });
  }

  async getReviews(params?: Record<string, string | number>) {
    const queryString = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
    return withRequestCache(`tutor.reviews.${queryString}`, async () => {
      const response = await apiClient.get(`/tutor/reviews${queryString}`);
      return response.data;
    });
  }

  async getSchedules() {
    return withRequestCache('tutor.schedules', async () => {
      const response = await apiClient.get('/tutor/schedules');
      return response.data;
    });
  }

  async acceptBooking(id: number) {
    return withRequestCache(`tutor.acceptBooking.${id}`, async () => {
      const response = await apiClient.patch(`/tutor/bookings/${id}/accept`);
      return response.data;
    });
  }

  async rejectBooking(id: number) {
    return withRequestCache(`tutor.rejectBooking.${id}`, async () => {
      const response = await apiClient.patch(`/tutor/bookings/${id}/reject`);
      return response.data;
    });
  }

  async completeBooking(id: number) {
    const response = await apiClient.patch(`/tutor/bookings/${id}/complete`);
    return response.data;
  }

  async setAvailability(payload: Record<string, unknown>) {
    const response = await apiClient.post('/tutor/availability', payload);
    return response.data;
  }

  async getProfile() {
    return withRequestCache('tutor.profile', async () => {
      const response = await apiClient.get('/tutor/profile');
      return response.data;
    });
  }

  async updateProfile(payload: Record<string, unknown> | FormData) {
    if (payload instanceof FormData) {
      payload.append('_method', 'PATCH');
      const response = await apiClient.post('/tutor/profile', payload, { headers: { 'Content-Type': 'multipart/form-data' } });
      return response.data;
    }
    const response = await apiClient.patch('/tutor/profile', payload);
    return response.data;
  }

  async toggleStatus() {
    const response = await apiClient.patch('/tutor/profile/status');
    return response.data;
  }

  async getNotifications() {
    return withRequestCache('tutor.notifications', async () => {
      const response = await apiClient.get('/tutor/notifications');
      return response.data;
    });
  }

  async markAllNotificationsAsRead() {
    const response = await apiClient.post('/tutor/notifications/read-all');
    return response.data;
  }

  async upgradeSemester(payload: FormData | Record<string, unknown>) {
    const config = payload instanceof FormData 
      ? { headers: { 'Content-Type': 'multipart/form-data' } }
      : {};
    const response = await apiClient.post('/tutor/upgrade-semester', payload, config);
    return response.data;
  }
}

export const tutorService = new TutorService();
