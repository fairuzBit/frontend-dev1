import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Loader2, Star } from 'lucide-react';
import { learnerService } from '@/api/services/learnerService';

export default function LearnerReviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookingDetail = async () => {
      try {
        setLoading(true);
        const res = await learnerService.getBookingById(id!);
        setBooking(res.data || res);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Gagal memuat detail pesanan.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBookingDetail();
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setSubmitError('Silakan pilih jumlah bintang terlebih dahulu.');
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError(null);
      await learnerService.submitReview(id!, { rating, comment });
      navigate('/learner/history', { replace: true });
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || 'Gagal mengirim ulasan. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <button onClick={() => navigate('/learner/history')} className="text-emerald-600 font-bold hover:underline">
          Kembali ke Riwayat
        </button>
      </div>
    );
  }

  const tutorName = booking.tutor?.user?.name || booking.tutor?.name || 'Tutor';
  const tutorInitials = tutorName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
  const courseName = booking.course?.name || '-';

  // Format Date
  const dateObj = new Date(booking.booking_date);
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const dateText = `${days[dateObj.getDay()]}, ${dateObj.getDate()} ${monthNames[dateObj.getMonth()]} ${dateObj.getFullYear()}`;

  return (
    <div className="max-w-4xl mx-auto pb-12 animate-in fade-in duration-300">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 font-bold mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Kembali
      </button>

      <div className="flex flex-col md:flex-row justify-between gap-8 mb-10">
        <div className="max-w-md">
          <h1 className="text-3xl md:text-4xl font-extrabold text-textPrimary leading-tight mb-4 tracking-tight">
            Bagaimana pengalaman belajarmu bersama <span className="text-emerald-600">{tutorName}</span>?
          </h1>
          <p className="text-slate-500 font-medium">
            Masukanmu membantu kami menjaga kualitas pembelajaran dan meningkatkan pengalaman belajar bersama tutor.
          </p>
        </div>

        {/* Tutor Info Card */}
        <div className="shrink-0 self-start bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-4 w-full md:w-auto shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-purple-400 text-white flex items-center justify-center text-lg font-bold shadow-sm shrink-0 overflow-hidden">
            {booking.tutor?.avatar || booking.tutor?.user?.avatar ? (
              <img src={booking.tutor?.avatar || booking.tutor?.user?.avatar} alt={tutorName} className="w-full h-full object-cover" />
            ) : (
              tutorInitials
            )}
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">{tutorName}</h3>
            <p className="font-bold text-emerald-600 text-xs mb-1.5">{courseName}</p>
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
              <Calendar className="w-3 h-3 text-slate-400" /> Sesi : {dateText}
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 shadow-sm rounded-[32px] p-6 md:p-10">
        {submitError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 font-medium">
            {submitError}
          </div>
        )}

        <div className="mb-10">
          <h3 className="text-lg font-bold text-emerald-700 mb-1">Penilaian Sesi</h3>
          <p className="text-sm text-slate-500 mb-4">Pilih jumlah bintang yang sesuai dengan pengalaman belajarmu.</p>
          
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => setRating(star)}
              >
                <Star 
                  className={`w-10 h-10 ${
                    star <= (hoveredRating || rating) 
                      ? 'fill-amber-400 text-amber-400' 
                      : 'fill-slate-100 text-slate-200'
                  } transition-colors`} 
                />
              </button>
            ))}
          </div>
        </div>

        <div className="mb-10">
          <div className="flex justify-between items-end mb-4">
            <h3 className="text-lg font-bold text-emerald-700">Ulasan Detail</h3>
            <span className="text-xs font-medium italic text-slate-400">Opsional, tetapi sangat membantu</span>
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={5}
            placeholder="Tulis pendapatmu tentang cara mengajar, kejelasan penjelasan, dan materi yang diberikan..."
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-none placeholder:text-slate-400"
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={submitting || rating === 0}
          className="px-8 py-3.5 btn-glass-primary disabled:cursor-not-allowed font-bold rounded-xl shadow-md flex items-center justify-center gap-2 text-sm"
        >
          {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Kirim Ulasan'}
        </button>
      </form>
    </div>
  );
}
