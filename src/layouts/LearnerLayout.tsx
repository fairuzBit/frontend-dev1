import { ReactNode } from 'react';
import { Bell, GraduationCap, History, LayoutGrid, Sparkles, UserCircle2, Clock } from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';

const navigation = [
  { label: 'Dashboard', to: '/learner', icon: LayoutGrid },
  { label: 'Tutor', to: '/tutors', icon: GraduationCap },
  { label: 'Pesanan', to: '/learner/bookings', icon: Sparkles },
  { label: 'Jadwal', to: '/learner/schedules', icon: Clock },
  { label: 'Riwayat', to: '/learner/history', icon: History },
  { label: 'Notifikasi', to: '/learner/notifications', icon: Bell },
  { label: 'Profil', to: '/learner/profile', icon: UserCircle2 },
];

export default function LearnerLayout({ children }: { children: ReactNode }) {
  return <AppLayout navigation={navigation} panelRole="Learner">{children}</AppLayout>;
}
