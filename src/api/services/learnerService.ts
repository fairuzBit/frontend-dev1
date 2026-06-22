import apiClient from '@/api/axios';
import { withRequestCache } from '@/lib/apiData';

class LearnerService {
  async getDashboard() {
    return withRequestCache('learner.dashboard', async () => {
      const response = await apiClient.get('/dashboard');
      return response.data;
    });
  }

  async getStats() {
    return withRequestCache('learner.stats', async () => {
      const response = await apiClient.get('/dashboard/stats');
      return response.data;
    });
  }

  async getProfile() {
    return withRequestCache('learner.profile', async () => {
      const response = await apiClient.get('/me');
      return response.data;
    });
  }

  async updateProfile(payload: Record<string, unknown> | FormData) {
    if (payload instanceof FormData) {
      payload.append('_method', 'PATCH');
      const response = await apiClient.post('/me', payload, { headers: { 'Content-Type': 'multipart/form-data' } });
      return response.data;
    }
    const response = await apiClient.patch('/me', payload);
    return response.data;
  }

  async getTutors() {
    return withRequestCache('learner.tutors', async () => {
      const response = await apiClient.get('/tutors');
      return response.data;
    });
  }

  async getTutorById(id: string | number) {
    return withRequestCache(`learner.tutor.${id}`, async () => {
      const response = await apiClient.get(`/tutors/${id}`);
      return response.data;
    });
  }

  async getBookings() {
    return withRequestCache('learner.bookings', async () => {
      const response = await apiClient.get('/learner/bookings');
      return response.data;
    });
  }

  async getBookingById(id: string | number) {
    return withRequestCache(`learner.booking.${id}`, async () => {
      const response = await apiClient.get(`/learner/bookings/${id}`);
      return response.data;
    });
  }

  async payBooking(id: string | number, payment_method: string) {
    const response = await apiClient.patch(`/learner/bookings/${id}/pay`, { payment_method });
    return response.data;
  }

  async simulatePayment(id: string | number) {
    const response = await apiClient.patch(`/learner/bookings/${id}/simulate-payment`);
    return response.data;
  }

  async cancelBooking(id: string | number) {
    const response = await apiClient.patch(`/learner/bookings/${id}/cancel`);
    return response.data;
  }

  async getSchedules() {
    return withRequestCache('learner.schedules', async () => {
      const response = await apiClient.get('/schedules');
      return response.data;
    });
  }

  async getHistory() {
    return withRequestCache('learner.history', async () => {
      const response = await apiClient.get('/learner/history');
      return response.data;
    });
  }

  async getNotifications() {
    return withRequestCache('learner.notifications', async () => {
      const response = await apiClient.get('/learner/notification');
      return response.data;
    });
  }

  async markNotificationAsRead(id: string | number) {
    return withRequestCache(`learner.markNotification.${id}`, async () => {
      const response = await apiClient.patch(`/learner/notification/${id}/read`);
      return response.data;
    });
  }

  async markAllNotificationsAsRead() {
    const response = await apiClient.post('/learner/notifications/read-all');
    return response.data;
  }

  async createBooking(payload: Record<string, unknown>) {
    const response = await apiClient.post('/learner/bookings', payload);
    return response.data;
  }

  async submitReview(id: string | number, payload: Record<string, unknown>) {
    const response = await apiClient.post(`/learner/bookings/${id}/reviews`, payload);
    return response.data;
  }

  async upgradeToTutor(payload: FormData | Record<string, unknown>) {
    const config = payload instanceof FormData 
      ? { headers: { 'Content-Type': 'multipart/form-data' } }
      : {};
    const response = await apiClient.post('/register/tutor/upload-document', payload, config);
    return response.data;
  }
}

export const learnerService = new LearnerService();
