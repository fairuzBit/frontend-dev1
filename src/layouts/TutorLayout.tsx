import { ReactNode } from 'react';
import { CalendarDays, Clock3, History, LayoutGrid, MessageSquareText, Sparkles, UserCircle2, Bell } from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';

const navigation = [
  { label: 'Dashboard', to: '/tutor', icon: LayoutGrid },
  { label: 'Availability', to: '/tutor/availability', icon: CalendarDays },
  { label: 'Booking', to: '/tutor/bookings', icon: Sparkles },
  { label: 'Riwayat', to: '/tutor/history', icon: History },
  { label: 'Review', to: '/tutor/reviews', icon: MessageSquareText },
  { label: 'Notifikasi', to: '/tutor/notifications', icon: Bell },
  { label: 'Profil', to: '/tutor/profile', icon: UserCircle2 },
];

export default function TutorLayout({ children }: { children: ReactNode }) {
  return <AppLayout navigation={navigation} panelRole="Tutor">{children}</AppLayout>;
}
