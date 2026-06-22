import { ReactNode } from 'react';
import { Banknote, BookOpen, CalendarDays, LayoutGrid, MessageSquareText, UserCircle2, Users } from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';

const navigation = [
  { label: 'Dashboard', to: '/admin', icon: LayoutGrid },
  { label: 'Manajemen Tutor', to: '/admin/applications', icon: Users },
  { label: 'Pengguna', to: '/admin/users', icon: UserCircle2 },
  { label: 'Komplain & Moderasi', to: '/admin/complaints', icon: MessageSquareText },

  { label: 'Mata Kuliah', to: '/admin/courses', icon: BookOpen },
  { label: 'Master Slots', to: '/admin/master-slots', icon: CalendarDays },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AppLayout navigation={navigation} panelRole="Admin Panel">{children}</AppLayout>;
}
