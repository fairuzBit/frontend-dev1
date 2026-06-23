import React, { useEffect, useState } from 'react';
import { Calendar, Clock, Star, AlertCircle, Banknote, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { learnerService } from '@/api/services/learnerService';
import { normalizeList } from '@/lib/apiData';

export default function LearnerBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cancellation State
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<number | string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await learnerService.getBookings();
      setBookings(normalizeList(response));
    } catch (err) {
      setError('Gagal memuat data pesanan dari server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async () => {
    if (!selectedBookingId) return;
    try {
      setIsCancelling(true);
      setCancelError(null);
      await learnerService.cancelBooking(selectedBookingId);
      setIsCancelModalOpen(false);
      setSelectedBookingId(null);
      await fetchBookings();
    } catch (err: any) {
      setCancelError(err.response?.data?.message || 'Gagal membatalkan pesanan. Coba lagi.');
    } finally {
      setIsCancelling(false);
    }
  };



  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium animate-pulse">Memuat pesanan Anda...</p>
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
          onClick={fetchBookings}
          className="btn-glass-destructive mt-4 px-5 py-2 text-sm font-bold rounded-xl"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-textPrimary mb-2 tracking-tight">Detail Pesanan</h1>
        <p className="text-slate-500 font-medium">Lihat detail pesanan dan selesaikan pembayaran.</p>
      </div>

      <div className="space-y-4">
        {bookings.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-200 border-dashed rounded-[32px]">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-700 mb-1">Belum ada pesanan</h3>
            <p className="text-sm text-slate-500 mb-6">Anda belum pernah memesan sesi tutor.</p>
          </div>
        ) : (
          bookings.map((booking) => {
            const isPaid = booking.payment_status === 'paid';
            const isPending = booking.payment_status === 'pending' || (booking.payment_status === 'unpaid' && booking.payment_method !== null);
            const slots = booking.slots || [];
            
            // Format schedule text (e.g. "Senin, 14 Okt 2026")
            const dateObj = new Date(booking.booking_date);
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
            const tutorName = booking.tutor?.user?.name || booking.tutor?.name || 'Tutor KonekDin';
            const tutorRating = booking.tutor?.rating || 'Baru';
            const tutorAvatar = booking.tutor?.avatar || booking.tutor?.user?.avatar;

            return (
              <div key={booking.id} className="bg-white border border-slate-200 rounded-[28px] p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all hover:shadow-lg hover:shadow-slate-200/50 hover:border-emerald-200">
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
                        {booking.course?.name || 'Mata Kuliah'}
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
                  {/* Status Badge */}
                  <div className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase ${
                    isPaid 
                      ? 'bg-[#0B132B] text-white' 
                      : isPending
                        ? 'bg-blue-50 text-blue-600 border border-blue-200'
                        : 'bg-amber-50 text-amber-600 border border-amber-200'
                  }`}>
                    {isPaid ? 'Lunas' : isPending ? 'Pending' : 'Belum Bayar'}
                  </div>
                  
                  {/* Action Button */}
                  {isPaid ? (
                    <Link 
                      to="/learner/schedules" 
                      className="btn-glass inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl"
                    >
                      Lihat Jadwal
                    </Link>
                  ) : isPending ? (
                    <Link 
                      to={`/learner/bookings/${booking.id}`}
                      className="btn-glass inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl"
                    >
                      Menunggu Verifikasi <Clock className="w-3.5 h-3.5" />
                    </Link>
                  ) : (
                    <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto">
                      <Link 
                        to={`/learner/bookings/${booking.id}`}
                        className="btn-glass-primary inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl text-center"
                      >
                        Bayar Sekarang <Banknote className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => {
                          setSelectedBookingId(booking.id);
                          setIsCancelModalOpen(true);
                        }}
                        className="btn-glass-destructive inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl"
                      >
                        Batalkan
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Cancellation Confirmation Modal */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-bgSecondary border border-slate-200 dark:border-borderColor/20 rounded-[28px] max-w-md w-full p-6 md:p-8 shadow-2xl relative animate-in zoom-in-95 duration-200 text-left">
            <h3 className="text-xl font-extrabold text-textPrimary dark:text-white mb-2">
              Batalkan Pesanan?
            </h3>
            <p className="text-sm text-slate-600 dark:text-textSecondary leading-relaxed mb-4">
              Apakah Anda yakin ingin membatalkan pesanan ini? <span className="text-red-500 font-medium">Tindakan ini tidak dapat dibatalkan</span> dan slot belajar Anda akan dilepaskan untuk learner lain.
            </p>

            {cancelError && (
              <div className="mb-4 p-3 bg-red-50/50 border border-red-100/50 rounded-xl text-xs text-red-600 font-medium">
                {cancelError}
              </div>
            )}
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsCancelModalOpen(false);
                  setSelectedBookingId(null);
                  setCancelError(null);
                }}
                disabled={isCancelling}
                className="btn-glass flex-1 py-3 font-bold rounded-xl text-sm"
              >
                Kembali
              </button>
              <button
                onClick={handleCancelBooking}
                disabled={isCancelling}
                className="btn-glass-destructive flex-1 py-3 font-bold rounded-xl text-sm flex items-center justify-center gap-1.5"
              >
                {isCancelling ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : 'Ya, Batalkan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
