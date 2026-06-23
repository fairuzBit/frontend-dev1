import React, { useState, useMemo, useEffect } from 'react';
import { X, Calendar, BookOpen, Clock, AlertCircle } from 'lucide-react';
import { learnerService } from '@/api/services/learnerService';
import { useNavigate } from 'react-router-dom';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  tutor: any;
  prefilledBooking?: any;
}

export function BookingModal({ isOpen, onClose, tutor, prefilledBooking }: BookingModalProps) {
  const navigate = useNavigate();
  
  // Form State
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlotIds, setSelectedSlotIds] = useState<number[]>([]);
  
  // UI State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && prefilledBooking) {
      if (prefilledBooking.course?.id) {
        setSelectedCourseId(prefilledBooking.course.id.toString());
      }
      if (prefilledBooking.booking_date) {
        const dateStr = prefilledBooking.booking_date.substring(0, 10);
        setSelectedDate(dateStr);
      }
      if (prefilledBooking.slots) {
        const slotIds = prefilledBooking.slots.map((s: any) => s.slot_id).filter(Boolean);
        setSelectedSlotIds(slotIds);
      }
    } else if (!isOpen) {
      setSelectedCourseId('');
      setSelectedDate('');
      setSelectedSlotIds([]);
    }
  }, [isOpen, prefilledBooking]);

  // Constants
  const platformFee = 1000;
  const pricePerSession = tutor?.price || tutor?.price_per_session || 0;
  const totalSessions = selectedSlotIds.length;
  const sessionsCost = totalSessions * pricePerSession;
  const grandTotal = sessionsCost + platformFee;

  const engToIndoDay: Record<string, string> = {
    'monday': 'Senin',
    'tuesday': 'Selasa',
    'wednesday': 'Rabu',
    'thursday': 'Kamis',
    'friday': 'Jumat',
    'saturday': 'Sabtu',
    'sunday': 'Minggu'
  };

  // Process availability to group by day for date picker / slot selection
  const availableSlotsByDay = useMemo(() => {
    if (!tutor?.available_slots) return {};
    
    return tutor.available_slots.reduce((acc: any, slot: any) => {
      // Normalize day name to Indonesian
      const rawDay = (slot.day_of_week || '').toLowerCase();
      const day = engToIndoDay[rawDay] || slot.day_of_week;
      
      if (!acc[day]) acc[day] = [];
      acc[day].push(slot);
      return acc;
    }, {});
  }, [tutor]);

  // Derived days available
  const availableDays = Object.keys(availableSlotsByDay);

  // When a date is selected, get the day name to show available slots
  // Format: YYYY-MM-DD
  const selectedDayName = useMemo(() => {
    if (!selectedDate) return null;
    const dateObj = new Date(selectedDate);
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    return days[dateObj.getDay()];
  }, [selectedDate]);

  // Slots for the selected day
  const slotsForSelectedDate = selectedDayName ? (availableSlotsByDay[selectedDayName] || []) : [];

  const handleSlotToggle = (slotId: number) => {
    setSelectedSlotIds(prev => 
      prev.includes(slotId) 
        ? prev.filter(id => id !== slotId)
        : [...prev, slotId]
    );
  };

  const handleBooking = async () => {
    if (!selectedCourseId || !selectedDate || selectedSlotIds.length === 0) {
      setError('Silakan lengkapi semua pilihan (Mata Kuliah, Tanggal, dan Jam Sesi).');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      
      const payload = {
        tutor_id: tutor.id,
        course_id: selectedCourseId,
        booking_date: selectedDate,
        slot_ids: selectedSlotIds
      };

      const res = await learnerService.createBooking(payload);
      
      if (res.success) {
        // Redirect to specific detail pesanan page
        const newBookingId = res.data?.id || res.id;
        navigate(`/learner/bookings/${newBookingId}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Terjadi kesalahan saat membuat pesanan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !tutor) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-slate-50 rounded-[32px] shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in fade-in zoom-in-95 duration-200 max-h-[90vh]">
        
        {/* Left Side: Form */}
        <div className="w-full md:w-3/5 p-6 md:p-8 overflow-y-auto">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Pesan Sesi</h2>
              <p className="text-sm text-slate-500 mt-1">Lengkapi detail sesi belajar Anda bersama {tutor.name}.</p>
            </div>
            <button 
              onClick={onClose}
              className="btn-glass p-2 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            {/* Mata Kuliah */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-500" /> Pilih Mata Kuliah
              </label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              >
                <option value="" disabled>-- Pilih Mata Kuliah --</option>
                {tutor.taught_courses?.map((course: any) => (
                  <option key={course.course_id} value={course.course_id}>
                    {course.course_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tanggal */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-500" /> Pilih Tanggal
              </label>
              <div className="bg-white border border-slate-200 rounded-xl p-2">
                <input
                  type="date"
                  value={selectedDate}
                  min={prefilledBooking ? undefined : new Date().toISOString().split('T')[0]} // prevent past dates
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSelectedSlotIds([]); // reset slots when date changes
                  }}
                  className="w-full px-2 py-1 outline-none text-sm font-medium text-slate-700 bg-transparent cursor-pointer"
                />
              </div>
              {selectedDate && !slotsForSelectedDate.length && (
                <p className="text-xs text-red-500 mt-2 font-medium">
                  Tutor tidak tersedia pada hari {selectedDayName}. Hari tersedia: {availableDays.join(', ')}.
                </p>
              )}
            </div>

            {/* Jam Sesi */}
            {selectedDate && slotsForSelectedDate.length > 0 && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-500" /> Pilih Jam Sesi
                </label>
                <p className="text-xs text-slate-500 mb-3">Anda dapat memilih lebih dari satu sesi untuk hari ini.</p>
                <div className="flex flex-wrap gap-2">
                  {slotsForSelectedDate.map((slot: any) => {
                    const slotId = slot.slot_id || slot.id; // handle based on API response structure
                    const isSelected = selectedSlotIds.includes(slotId);
                    return (
                      <button
                        key={slotId}
                        type="button"
                        onClick={() => handleSlotToggle(slotId)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                          isSelected 
                            ? 'btn-glass-primary scale-[1.02]' 
                            : 'btn-glass'
                        }`}
                      >
                        {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Order Summary */}
        <div className="w-full md:w-2/5 bg-[#0B132B] p-6 md:p-8 flex flex-col justify-between text-white">
          <div>
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
              <BookOpen className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-2xl font-bold mb-1">Ringkasan Pesanan</h3>
            <p className="text-sm text-slate-400 mb-8 leading-relaxed">Konfirmasi rincian sesi mentorship Anda sebelum melanjutkan.</p>

            <div className="space-y-4 mb-8">
              {/* Card 1: Subject */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Mata Pelajaran</p>
                  <p className="text-sm font-bold text-white">
                    {selectedCourseId 
                      ? tutor.taught_courses?.find((c: any) => c.course_id == selectedCourseId)?.course_name 
                      : '-'}
                  </p>
                </div>
              </div>

              {/* Card 2: Date & Time */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Waktu Sesi</p>
                  <p className="text-sm font-bold text-white">
                    {selectedDate 
                      ? `${selectedDayName}, ${new Date(selectedDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`
                      : '-'}
                  </p>
                  <p className="text-xs text-emerald-400 font-medium mt-0.5">
                    {totalSessions > 0 ? `${totalSessions} Sesi Dipilih` : 'Silakan klik kotak jam sesi'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="border-t border-white/10 pt-6 space-y-3 mb-6">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400 font-medium">Biaya Sesi (Rp{pricePerSession.toLocaleString('id-ID')} × {totalSessions} Sesi)</span>
                <span className="font-bold">Rp{sessionsCost.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400 font-medium">Biaya Layanan</span>
                <span className="font-bold">Rp{platformFee.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-white/10">
                <span className="text-lg font-bold text-emerald-400">Total Pembayaran</span>
                <span className="text-2xl font-black text-white">Rp{grandTotal.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3.5 px-4 rounded-xl text-sm font-bold bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-all"
              >
                Batal
              </button>
              <button
                onClick={handleBooking}
                disabled={isSubmitting || totalSessions === 0 || !selectedCourseId || !selectedDate}
                className="flex-[2] py-3.5 px-4 rounded-xl text-sm font-bold flex justify-center items-center disabled:opacity-50 bg-emerald-500 hover:bg-emerald-600 text-white transition-all shadow-md shadow-emerald-950/20"
              >
                {isSubmitting ? 'Memproses...' : 'Buat Pesanan'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
