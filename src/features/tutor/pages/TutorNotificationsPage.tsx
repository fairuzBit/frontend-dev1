import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BellRing, CalendarCheck, Clock, GraduationCap, Star, Wallet, ArrowRight } from 'lucide-react';
import { tutorService } from '@/api/services/tutorService';
import { normalizeList } from '@/lib/apiData';

export default function TutorNotificationsPage() {
  const [notifications, setNotifications] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await tutorService.getNotifications();
        setNotifications(normalizeList(response));
      } catch {
        setError('Gagal memuat notifikasi dari backend.');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return { icon: Wallet, style: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400' };
      case 'session_reminder':
        return { icon: Clock, style: 'text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400' };
      case 'application':
        return { icon: GraduationCap, style: 'text-brand-600 bg-brand-50 dark:bg-brand-500/10 dark:text-brand-400' };
      case 'booking':
        return { icon: CalendarCheck, style: 'text-blue-600 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400' };
      case 'review':
        return { icon: Star, style: 'text-purple-600 bg-purple-50 dark:bg-purple-500/10 dark:text-purple-400' };
      default:
        return { icon: BellRing, style: 'text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-400' };
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-textPrimary tracking-tight mb-2">Notifikasi</h1>
        <p className="text-textSecondary font-medium">Pantau pesan, pemesanan sesi baru, dan pencairan dana Anda di sini.</p>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center bg-bgSecondary rounded-3xl border border-borderColor shadow-sm">
            <div className="animate-pulse flex flex-col items-center gap-3">
              <div className="w-12 h-12 bg-bgPrimary rounded-full"></div>
              <div className="w-32 h-4 bg-bgPrimary rounded-md"></div>
              <div className="w-48 h-3 bg-bgPrimary rounded-md"></div>
            </div>
          </div>
        ) : null}
        
        {error ? (
          <div className="p-6 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-2xl text-rose-600 dark:text-rose-400 font-medium text-center">
            {error}
          </div>
        ) : null}
        
        {!loading && !error && notifications.length === 0 ? (
          <div className="p-12 text-center bg-bgSecondary rounded-3xl border border-borderColor shadow-sm flex flex-col items-center">
            <div className="w-16 h-16 bg-bgPrimary rounded-full flex items-center justify-center mb-4">
              <BellRing className="w-8 h-8 text-textSecondary" />
            </div>
            <h3 className="text-lg font-bold text-textPrimary mb-1">Belum ada notifikasi</h3>
            <p className="text-sm text-textSecondary">Pemberitahuan pemesanan dan aktivitas akan muncul di sini.</p>
          </div>
        ) : null}

        {!loading && !error && Object.entries(
          notifications.reduce<Record<string, Array<any>>>((acc, item) => {
            const group = (item.group as string) || 'TERBARU';
            if (!acc[group]) acc[group] = [];
            acc[group].push(item);
            return acc;
          }, {})
        ).map(([group, groupNotifications]) => (
          <div key={group} className="mb-8 space-y-4">
            <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 tracking-widest uppercase pl-4 mb-4">
              {group}
            </h3>
            
            {(groupNotifications as Array<any>).map((item: any, index: number) => {
              const type = (item.type as string) || 'default';
              const { icon: Icon, style } = getNotificationIcon(type);
              const isRead = item.is_read === true || item.is_read === 1;

              return (
                <div 
                  key={item.id as string || index} 
                  className={`relative flex items-start gap-4 p-5 sm:p-6 rounded-3xl border transition-all duration-300 hover:shadow-md ${
                    isRead 
                      ? 'bg-bgSecondary border-borderColor opacity-80 hover:opacity-100' 
                      : 'bg-brand-50/50 dark:bg-brand-500/5 border-brand-200 dark:border-brand-500/20 shadow-sm'
                  }`}
                >
                  {!isRead && (
                    <div className="absolute top-6 right-6 w-2.5 h-2.5 rounded-full bg-brand-500 ring-4 ring-brand-100 dark:ring-brand-500/20"></div>
                  )}
                  
                  <div className={`shrink-0 rounded-2xl p-3.5 ${style}`}>
                    <Icon className="h-6 w-6" strokeWidth={2.5} />
                  </div>
                  
                  <div className="flex-1 pr-6">
                    <p className={`text-base ${
                      isRead 
                        ? 'font-bold text-textPrimary opacity-80' 
                        : 'font-black text-textPrimary'
                    }`}>
                      {(item.title as string) ?? 'Notifikasi'}
                    </p>
                    <p className={`text-sm mt-1.5 leading-relaxed ${
                      isRead 
                        ? 'text-textSecondary font-medium' 
                        : 'text-textSecondary font-semibold'
                    }`}>
                      {(item.message as string) ?? (item.body as string) ?? '—'}
                    </p>
                     <p className="mt-3 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                      {(item.time_ago as string) ?? (item.time as string) ?? (item.created_at as string) ?? '—'}
                    </p>

                    {/* Tombol Cek Booking */}
                    {type === 'booking' && (
                      <div className="mt-4">
                        <Link 
                          to="/tutor/bookings"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 dark:bg-brand-500/20 dark:hover:bg-brand-500/30 text-white dark:text-brand-400 text-xs font-bold rounded-xl shadow-sm transition-colors"
                        >
                          Cek Booking <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
