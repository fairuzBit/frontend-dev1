import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Users, ShieldCheck, Wallet, Activity } from 'lucide-react';
import apiClient from '@/api/axios';

export default function AdminNavigationTabs() {
  const location = useLocation();
  const [counts, setCounts] = useState({
    pendingVerifications: 0,
    pendingPayments: 0,
  });

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const response = await apiClient.get('/admin/stats');
        const stats = response.data?.data || response.data || {};
        setCounts({
          pendingVerifications: Number(stats.pending_verifications || 0),
          pendingPayments: Number(stats.pending_payments || 0),
        });
      } catch (error) {
        console.error('Failed to fetch admin stats for navigation badges', error);
      }
    };

    fetchCounts();
    const interval = setInterval(fetchCounts, 10000);
    return () => clearInterval(interval);
  }, []);

  const tabs = [
    {
      to: '/admin/users',
      label: 'Manajemen Pengguna',
      icon: Users,
      count: 0,
    },
    {
      to: '/admin/applications',
      label: 'Verifikasi Tutor',
      icon: ShieldCheck,
      count: counts.pendingVerifications,
    },
    {
      to: '/admin/payments',
      label: 'Manajemen Keuangan',
      icon: Wallet,
      count: counts.pendingPayments,
    },
    {
      to: '/admin/activities',
      label: 'Riwayat Aktivitas',
      icon: Activity,
      count: 0,
    },
  ];

  return (
    <div className="flex items-center gap-2 border-b border-slate-200 pb-px">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = location.pathname === tab.to;

        return (
          <Link
            key={tab.to}
            to={tab.to}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-xl transition-all relative top-px shadow-sm ${
              isActive
                ? 'bg-white text-slate-800 border-x border-t border-slate-200'
                : 'bg-white/10 hover:bg-white/15 text-white border-x border-t border-transparent'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-brand-500' : 'text-white'}`} />
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-black text-white bg-rose-500 rounded-full min-w-[20px] h-5 flex items-center justify-center animate-pulse">
                {tab.count}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
