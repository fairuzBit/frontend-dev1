import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoginPage from '@/features/auth/pages/LoginPage';
import RegisterPage from '@/features/auth/pages/RegisterPage';
import AdminDashboard from '@/features/admin/pages/AdminDashboard';
import AdminApplicationsPage from '@/features/admin/pages/AdminApplicationsPage';
import AdminComplaintsPage from '@/features/admin/pages/AdminComplaintsPage';
import AdminCoursesPage from '@/features/admin/pages/AdminCoursesPage';
import AdminMasterSlotsPage from '@/features/admin/pages/AdminMasterSlotsPage';
import AdminUsersPage from '@/features/admin/pages/AdminUsersPage';
import AdminPaymentsPage from '@/features/admin/pages/AdminPaymentsPage';
import AdminActivitiesPage from '@/features/admin/pages/AdminActivitiesPage';
import LearnerBookingsPage from '@/features/learner/pages/LearnerBookingsPage';
import LearnerSchedulesPage from '@/features/learner/pages/LearnerSchedulesPage';
import LearnerBookingDetailPage from '@/features/learner/pages/LearnerBookingDetailPage';
import LearnerDashboard from '@/features/learner/pages/LearnerDashboard';
import LearnerHistoryPage from '@/features/learner/pages/LearnerHistoryPage';
import LearnerNotificationsPage from '@/features/learner/pages/LearnerNotificationsPage';
import LearnerProfilePage from '@/features/learner/pages/LearnerProfilePage';
import LearnerReviewPage from '@/features/learner/pages/LearnerReviewPage';
import TutorApplicationPage from '@/features/learner/pages/TutorApplicationPage';
import TutorDetailPage from '@/features/learner/pages/TutorDetailPage';
import TutorListPage from '@/features/learner/pages/TutorListPage';
import TutorAvailabilityPage from '@/features/tutor/pages/TutorAvailabilityPage';
import TutorBookingsPage from '@/features/tutor/pages/TutorBookingsPage';
import TutorDashboard from '@/features/tutor/pages/TutorDashboard';
import TutorHistoryPage from '@/features/tutor/pages/TutorHistoryPage';
import TutorReviewsPage from '@/features/tutor/pages/TutorReviewsPage';
import TutorProfilePage from '@/features/tutor/pages/TutorProfilePage';
import TutorNotificationsPage from '@/features/tutor/pages/TutorNotificationsPage';
import AdminLayout from '@/layouts/AdminLayout';
import LearnerLayout from '@/layouts/LearnerLayout';
import TutorLayout from '@/layouts/TutorLayout';
import { useAuth, getRoleLabel } from '@/context/AuthContext';

function HomeRedirect() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-sm font-medium text-slate-600">Memuat sesi...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const role = getRoleLabel(user);
  if (role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  if (role === 'tutor') {
    return <Navigate to="/tutor" replace />;
  }

  return <Navigate to="/learner" replace />;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/register/tutor" element={<ProtectedRoute allowedRoles={['learner']}><LearnerLayout><TutorApplicationPage /></LearnerLayout></ProtectedRoute>} />

      <Route path="/learner" element={<ProtectedRoute allowedRoles={['learner']}><LearnerLayout><LearnerDashboard /></LearnerLayout></ProtectedRoute>} />
      <Route path="/learner/bookings" element={<ProtectedRoute allowedRoles={['learner']}><LearnerLayout><LearnerBookingsPage /></LearnerLayout></ProtectedRoute>} />
      <Route path="/learner/schedules" element={<ProtectedRoute allowedRoles={['learner']}><LearnerLayout><LearnerSchedulesPage /></LearnerLayout></ProtectedRoute>} />
      <Route path="/learner/bookings/:id" element={<ProtectedRoute allowedRoles={['learner']}><LearnerLayout><LearnerBookingDetailPage /></LearnerLayout></ProtectedRoute>} />
      <Route path="/learner/history" element={<ProtectedRoute allowedRoles={['learner']}><LearnerLayout><LearnerHistoryPage /></LearnerLayout></ProtectedRoute>} />
      <Route path="/learner/reviews/:id" element={<ProtectedRoute allowedRoles={['learner']}><LearnerLayout><LearnerReviewPage /></LearnerLayout></ProtectedRoute>} />
      <Route path="/learner/notifications" element={<ProtectedRoute allowedRoles={['learner']}><LearnerLayout><LearnerNotificationsPage /></LearnerLayout></ProtectedRoute>} />
      <Route path="/learner/profile" element={<ProtectedRoute allowedRoles={['learner']}><LearnerLayout><LearnerProfilePage /></LearnerLayout></ProtectedRoute>} />
      <Route path="/tutors" element={<ProtectedRoute allowedRoles={['learner']}><LearnerLayout><TutorListPage /></LearnerLayout></ProtectedRoute>} />
      <Route path="/tutors/:id" element={<ProtectedRoute allowedRoles={['learner']}><LearnerLayout><TutorProfilePage /></LearnerLayout></ProtectedRoute>} />

      <Route path="/tutor" element={<ProtectedRoute allowedRoles={['tutor']}><TutorLayout><TutorDashboard /></TutorLayout></ProtectedRoute>} />
      <Route path="/tutor/availability" element={<ProtectedRoute allowedRoles={['tutor']}><TutorLayout><TutorAvailabilityPage /></TutorLayout></ProtectedRoute>} />
      <Route path="/tutor/bookings" element={<ProtectedRoute allowedRoles={['tutor']}><TutorLayout><TutorBookingsPage /></TutorLayout></ProtectedRoute>} />
      <Route path="/tutor/history" element={<ProtectedRoute allowedRoles={['tutor']}><TutorLayout><TutorHistoryPage /></TutorLayout></ProtectedRoute>} />
      <Route path="/tutor/reviews" element={<ProtectedRoute allowedRoles={['tutor']}><TutorLayout><TutorReviewsPage /></TutorLayout></ProtectedRoute>} />
      <Route path="/tutor/notifications" element={<ProtectedRoute allowedRoles={['tutor']}><TutorLayout><TutorNotificationsPage /></TutorLayout></ProtectedRoute>} />
      <Route path="/tutor/profile" element={<ProtectedRoute allowedRoles={['tutor']}><TutorLayout><TutorProfilePage /></TutorLayout></ProtectedRoute>} />

      <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><AdminDashboard /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/applications" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><AdminApplicationsPage /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><AdminUsersPage /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/complaints" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><AdminComplaintsPage /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/courses" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><AdminCoursesPage /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/master-slots" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><AdminMasterSlotsPage /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/payments" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><AdminPaymentsPage /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/activities" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><AdminActivitiesPage /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/tutors/:id" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><TutorProfilePage /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/learners/:id" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout><LearnerProfilePage /></AdminLayout></ProtectedRoute>} />
    </Routes>
  );
}

export default App;
