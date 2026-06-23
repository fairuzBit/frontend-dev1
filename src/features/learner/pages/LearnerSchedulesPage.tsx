import React, { useEffect, useState } from 'react';
import { Calendar, Clock, Star, AlertCircle, Banknote, Eye, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { learnerService } from '@/api/services/learnerService';
import { normalizeList } from '@/lib/apiData';

const formatWhatsAppLink = (phone?: string) => {
  if (!phone) return '#';
  let formatted = phone.replace(/\D/g, '');
  if (formatted.startsWith('0')) {
    formatted = '62' + formatted.substring(1);
  }
  return `https://wa.me/${formatted}`;
};

export default function LearnerSchedulesPage() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await learnerService.getSchedules();
      setSchedules(normalizeList(response));
    } catch (err) {
      setError('Gagal memuat jadwal Anda dari server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium animate-pulse">Memuat jadwal Anda...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-100 p-6 rounded-3xl flex flex-col items-center text-center max-w-lg mx-auto mt-10">
        <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
        <h3 className="font-bold text-red-900 mb-2">Gagal Memuat Data</h3>
        <p className="text-red-600 text-sm">{error}</p>
        <button 
          onClick={fetchSchedules}
          className="mt-4 px-5 py-2 btn-glass-destructive text-sm font-bold rounded-xl"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-textPrimary mb-2 tracking-tight">Jadwal Belajar</h1>
        <p className="text-slate-500 font-medium">Lihat sesi belajar Anda yang sudah terkonfirmasi.</p>
      </div>

      <div className="space-y-4">
        {schedules.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-200 border-dashed rounded-[32px]">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-700 mb-1">Belum ada jadwal</h3>
            <p className="text-sm text-slate-500 mb-6">Anda belum memiliki sesi belajar yang terkonfirmasi.</p>
          </div>
        ) : (
          schedules.map((schedule) => {
            const slots = schedule.slots || [];
            
            // Format schedule text (e.g. "Senin, 14 Okt 2026")
            const dateObj = new Date(schedule.booking_date);
            const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
            const dateText = `${days[dateObj.getDay()]}, ${dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`;
            
            // Format time text (e.g. "12:30 - 14:10 WIB")
            let timeText = '-';
            if (slots.length > 0) {
              const start = slots[0].start_time;
              const end = slots[slots.length - 1].end_time;
              timeText = `${start} - ${end} WIB`;
            }

            // Tutor info fallback
            const tutorName = schedule.tutor?.user?.name || schedule.tutor?.name || 'Tutor KonekDin';
            const tutorRating = schedule.tutor?.rating || 'Baru';
            const tutorAvatar = schedule.tutor?.avatar || schedule.tutor?.user?.avatar;

            return (
              <div key={schedule.id} className="bg-white border border-slate-200 rounded-[28px] p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all hover:shadow-lg hover:shadow-slate-200/50 hover:border-emerald-200">
                <div className="flex items-start md:items-center gap-5">
                  <div className="relative">
                    <div className="w-20 h-20 md:w-16 md:h-16 rounded-2xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200 shadow-sm">
                      {tutorAvatar ? (
                        <img src={tutorAvatar} alt={tutorName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-emerald-100 text-emerald-700 font-bold text-xl">
                          {tutorName.charAt(0)}
                        </div>
                      )}
                    </div>
                    {/* Rating Badge */}
                    <div className="absolute -top-2 -right-2 bg-white border border-slate-200 shadow-sm rounded-full px-2 py-0.5 flex items-center gap-1 z-10">
                      <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                      <span className="text-[10px] font-bold text-slate-700">{tutorRating}</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <h3 className="font-bold text-slate-800 text-lg">{tutorName}</h3>
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider rounded-md">
                        {schedule.course?.name || 'Mata Kuliah'}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {dateText}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {timeText}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 w-full md:w-auto pt-4 md:pt-0 border-t border-slate-100 md:border-0">
                  <div className="px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-emerald-50 text-emerald-600 border border-emerald-200">
                    Sesi Aktif
                  </div>
                  
                  <div className="flex gap-2">
                    {(schedule.tutor?.phone || schedule.tutor?.user?.phone) && (
                      <a 
                        href={formatWhatsAppLink(schedule.tutor?.phone || schedule.tutor?.user?.phone)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-4 py-2.5 btn-glass-whatsapp text-xs font-bold rounded-xl"
                        title="Hubungi Tutor via WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        Chat
                      </a>
                    )}
                    <Link 
                      to={`/learner/bookings/${schedule.id}`}
                      className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                    >
                      Detail Sesi
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
