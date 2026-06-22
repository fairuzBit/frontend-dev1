import React, { useEffect, useState } from 'react';
import { Calendar, Clock, Star, MessageSquarePlus, RotateCcw, AlertCircle, CheckCircle2, History } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { learnerService } from '@/api/services/learnerService';
import { normalizeList } from '@/lib/apiData';

export default function LearnerHistoryPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const response = await learnerService.getHistory();
        const data = normalizeList(response);
        setHistory(data);
      } catch (err) {
        setError('Gagal memuat riwayat belajar dari server.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium animate-pulse">Memuat riwayat belajar...</p>
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
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-textPrimary mb-2 tracking-tight">Riwayat Sesi Belajar</h1>
        <p className="text-slate-500 font-medium">Lihat kembali riwayat perjalanan belajarmu.</p>
      </div>

      <div className="space-y-4">
        {history.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-200 border-dashed rounded-[32px]">
            <History className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-700 mb-1">Belum ada riwayat</h3>
            <p className="text-sm text-slate-500 mb-6">Anda belum menyelesaikan sesi belajar apapun.</p>
          </div>
        ) : (
          history.map((item) => {
            const slots = item.slots || [];
            
            // Date formatting
            let dateText = 'Tanggal tidak tersedia';
            if (item.booking_date) {
              const dateObj = new Date(item.booking_date);
              const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
              const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
              dateText = `${days[dateObj.getDay()]}, ${dateObj.getDate()} ${monthNames[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
            }
            
            // Time formatting
            let timeText = '-';
            if (slots.length > 0) {
              const start = slots[0].start_time;
              const end = slots[slots.length - 1].end_time;
              timeText = `${start} - ${end} WIB`;
            }

            const courseName = item.course?.name || '-';
            const tutorName = item.tutor?.user?.name || item.tutor?.name || 'Tutor KonekDin';
            const tutorInitials = tutorName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
            
            // Rating from review if given, or tutor average rating
            const displayRating = item.review?.rating || item.tutor?.rating_avg || 5;

            return (
              <div key={item.id} className="bg-white border border-slate-200 rounded-[24px] p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:shadow-lg hover:shadow-slate-200/50 hover:border-emerald-200">
                <div className="flex items-start gap-4 w-full md:w-auto">
                  
                  {/* Avatar & Rating Badge */}
                  <div className="relative shrink-0">
                    <div className="w-16 h-16 rounded-xl bg-purple-400 text-white flex items-center justify-center text-xl font-bold shadow-sm overflow-hidden">
                      {item.tutor?.avatar || item.tutor?.user?.avatar ? (
                        <img src={item.tutor?.avatar || item.tutor?.user?.avatar} alt={tutorName} className="w-full h-full object-cover" />
                      ) : (
                        tutorInitials
                      )}
                    </div>
                    {/* Rating Badge overlap */}
                    <div className="absolute -top-2 -right-2 bg-white border border-slate-100 shadow-sm rounded-full px-1.5 py-0.5 flex items-center gap-1 z-10">
                      <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                      <span className="text-[10px] font-bold text-slate-700">{displayRating}</span>
                    </div>
                  </div>

                  {/* Info Section */}
                  <div className="flex flex-col flex-1">
                    <h3 className="font-extrabold text-emerald-600 text-lg leading-tight mb-1">{courseName}</h3>
                    <p className="font-bold text-slate-700 text-sm mb-3">{tutorName}</p>
                    
                    <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {dateText}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {timeText}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-4 md:pt-0 border-t border-slate-100 md:border-0 w-full md:w-auto justify-end">
                  {item.status === 'completed' && !item.review && (
                    <button 
                      onClick={() => navigate(`/learner/reviews/${item.id}`)}
                      className="flex items-center gap-2 px-5 py-2.5 btn-glass-warning text-sm font-bold rounded-xl"
                    >
                      <MessageSquarePlus className="w-4 h-4" /> Beri Ulasan
                    </button>
                  )}
                  {item.status === 'completed' && item.review && (
                    <div className="px-4 py-2.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl flex items-center gap-2 border border-emerald-100">
                      <CheckCircle2 className="w-4 h-4" /> Sudah Diulas
                    </div>
                  )}
                  <button 
                    onClick={() => navigate('/tutors', { 
                      state: { 
                        autoBook: true, 
                        prefilledBooking: item 
                      } 
                    })}
                    className="flex items-center gap-2 px-5 py-2.5 btn-glass-primary text-sm font-bold rounded-xl shadow-md"
                  >
                    <RotateCcw className="w-4 h-4" /> Belajar Lagi
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
