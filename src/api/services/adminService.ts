import apiClient from '@/api/axios';
import { withRequestCache } from '@/lib/apiData';

class AdminService {
  async getStats() {
    return withRequestCache('admin.stats', async () => {
      const response = await apiClient.get('/admin/stats');
      return response.data;
    });
  }

  async getApplications() {
    return withRequestCache('admin.applications', async () => {
      const response = await apiClient.get('/admin/applications');
      return response.data;
    });
  }

  async approveApplication(id: string | number) {
    return withRequestCache(`admin.approveApplication.${id}`, async () => {
      const response = await apiClient.patch(`/admin/applications/${id}/approve`);
      return response.data;
    });
  }

  async rejectApplication(id: string | number, reason?: string) {
    return withRequestCache(`admin.rejectApplication.${id}`, async () => {
      const response = await apiClient.patch(`/admin/applications/${id}/reject`, { admin_note: reason });
      return response.data;
    });
  }

  async deleteApplication(id: string | number) {
    return withRequestCache(`admin.deleteApplication.${id}`, async () => {
      const response = await apiClient.delete(`/admin/applications/${id}`);
      return response.data;
    });
  }

  async getUsers() {
    return withRequestCache('admin.users', async () => {
      const response = await apiClient.get('/admin/users');
      return response.data;
    });
  }

  async getUserById(id: string | number) {
    return withRequestCache(`admin.user.${id}`, async () => {
      const response = await apiClient.get(`/admin/users/${id}`);
      return response.data;
    });
  }

  async deleteUser(id: string | number) {
    return withRequestCache(`admin.deleteUser.${id}`, async () => {
      const response = await apiClient.delete(`/admin/users/${id}`);
      return response.data;
    });
  }

  async suspendUser(id: string | number, duration: string) {
    const response = await apiClient.patch(`/admin/users/${id}/suspend`, { duration });
    return response.data;
  }

  async unsuspendUser(id: string | number) {
    const response = await apiClient.patch(`/admin/users/${id}/unsuspend`);
    return response.data;
  }

  async getModerationReviews() {
    return withRequestCache('admin.moderation.reviews', async () => {
      const response = await apiClient.get('/admin/moderation/reviews');
      return response.data;
    });
  }

  async processReview(id: string | number) {
    return withRequestCache(`admin.processReview.${id}`, async () => {
      const response = await apiClient.patch(`/admin/moderation/reviews/${id}/process`);
      return response.data;
    });
  }

  async resolveReview(id: string | number) {
    return withRequestCache(`admin.resolveReview.${id}`, async () => {
      const response = await apiClient.patch(`/admin/moderation/reviews/${id}/resolve`);
      return response.data;
    });
  }

  async deleteReview(id: string | number, reason?: string) {
    return withRequestCache(`admin.deleteReview.${id}`, async () => {
      const response = await apiClient.delete(`/admin/moderation/reviews/${id}`, {
        data: { reason }
      });
      return response.data;
    });
  }

  async getModerationLogs() {
    return withRequestCache('admin.moderation.logs', async () => {
      const response = await apiClient.get('/admin/moderation/logs');
      return response.data;
    });
  }

  async getPayments() {
    return withRequestCache('admin.payments', async () => {
      const response = await apiClient.get('/admin/payments');
      return response.data;
    });
  }

  async approvePayment(id: string | number) {
    return withRequestCache(`admin.approvePayment.${id}`, async () => {
      const response = await apiClient.patch(`/admin/payments/${id}/approve`);
      return response.data;
    });
  }

  async acceptBooking(id: string | number) {
    return withRequestCache(`admin.acceptBooking.${id}`, async () => {
      const response = await apiClient.patch(`/admin/bookings/${id}/accept`);
      return response.data;
    });
  }

  async rejectBooking(id: string | number) {
    return withRequestCache(`admin.rejectBooking.${id}`, async () => {
      const response = await apiClient.patch(`/admin/bookings/${id}/reject`);
      return response.data;
    });
  }

  async getCourses() {
    return withRequestCache('admin.courses', async () => {
      const response = await apiClient.get('/courses');
      return response.data;
    });
  }

  async getMasterSlots() {
    return withRequestCache('admin.masterSlots', async () => {
      const response = await apiClient.get('/master-slots');
      return response.data;
    });
  }

  async createCourse(data: { name: string; code: string; semester: number | string }) {
    const response = await apiClient.post('/admin/courses', data);
    return response.data;
  }

  async updateCourse(id: string | number, data: { name: string; code: string; semester: number | string }) {
    const response = await apiClient.put(`/admin/courses/${id}`, data);
    return response.data;
  }

  async deleteCourse(id: string | number) {
    const response = await apiClient.delete(`/admin/courses/${id}`);
    return response.data;
  }

  async createMasterSlot(data: { code: string; start_time: string; end_time: string }) {
    const response = await apiClient.post('/admin/master-slots', data);
    return response.data;
  }

  async deleteMasterSlot(id: string | number) {
    const response = await apiClient.delete(`/admin/master-slots/${id}`);
    return response.data;
  }

}

export const adminService = new AdminService();
