import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, Star, Banknote, CreditCard, Smartphone, ShieldCheck, ArrowLeft, Loader2, CheckCircle2, MessageCircle, AlertCircle } from 'lucide-react';
import { learnerService } from '@/api/services/learnerService';

const formatWhatsAppLink = (phone?: string) => {
  if (!phone) return '#';
  let formatted = phone.replace(/\D/g, '');
  if (formatted.startsWith('0')) {
    formatted = '62' + formatted.substring(1);
  }
  return `https://wa.me/${formatted}`;
};

export default function LearnerBookingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Payment State
  const [selectedMethod, setSelectedMethod] = useState<string>('transfer');
  const [selectedProvider, setSelectedProvider] = useState<string>('bri');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Cancellation State
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

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

  useEffect(() => {
    if (id) {
      fetchBookingDetail();
    }
  }, [id]);

  const handleConfirm = async () => {
    try {
      setIsProcessing(true);
      setPaymentError(null);
      
      const paymentMethodStr = selectedMethod === 'cash' ? 'cash' : 'midtrans';

      const res = await learnerService.payBooking(booking.id, paymentMethodStr);
      const updatedBooking = res.data || res;
      
      if (updatedBooking.payment_method === 'midtrans') {
        const snapToken = updatedBooking.payment_code;
        const snap = (window as any).snap;
        
        if (snap) {
          snap.pay(snapToken, {
            onSuccess: async (result: any) => {
              console.log('Payment Success:', result);
              await fetchBookingDetail();
            },
            onPending: async (result: any) => {
              console.log('Payment Pending:', result);
              await fetchBookingDetail();
            },
            onError: (result: any) => {
              console.error('Payment Error:', result);
              setPaymentError('Pembayaran gagal atau dibatalkan.');
            },
            onClose: () => {
              console.log('Payment popup closed');
              fetchBookingDetail();
            }
          });
        } else {
          setPaymentError('Midtrans SDK tidak termuat. Silakan muat ulang halaman.');
        }
      } else {
        // Cash payment, just reload
        await fetchBookingDetail();
      }
    } catch (err: any) {
      setPaymentError(err.response?.data?.message || 'Gagal memproses pembayaran. Coba lagi.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelBooking = async () => {
    try {
      setIsCancelling(true);
      setPaymentError(null);
      
      const res = await learnerService.cancelBooking(booking.id);
      
      if (res.success || res) {
        setIsCancelModalOpen(false);
        await fetchBookingDetail();
      }
    } catch (err: any) {
      setPaymentError(err.response?.data?.message || 'Gagal membatalkan pesanan. Coba lagi.');
      setIsCancelModalOpen(false);
    } finally {
      setIsCancelling(false);
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
        <button onClick={() => navigate('/learner/bookings')} className="btn-glass-primary font-bold px-4 py-2 rounded-xl">
          Kembali ke Daftar Pesanan
        </button>
      </div>
    );
  }

  const tutorName = booking.tutor?.user?.name || booking.tutor?.name || 'Tutor KonekDin';
  const isPaid = booking.payment_status === 'paid';
  const isCancelled = booking.status === 'cancelled';
  const isMidtransPending = !isCancelled && booking.payment_method === 'midtrans' && (booking.payment_status === 'unpaid' || booking.payment_status === 'pending');
  const isPending = !isCancelled && booking.payment_method !== 'midtrans' && (booking.payment_status === 'pending' || (booking.payment_status === 'unpaid' && booking.payment_method !== null));
  
  // Format Date
  const dateObj = new Date(booking.booking_date);
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const dateText = `${days[dateObj.getDay()]}, ${dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  
  // Format Time
  let timeText = '-';
  if (booking.slots && booking.slots.length > 0) {
    const start = booking.slots[0].start_time;
    const end = booking.slots[booking.slots.length - 1].end_time;
    timeText = `${start} - ${end}`;
  }

  return (
    <div className="max-w-5xl mx-auto pb-12 animate-in fade-in zoom-in-95 duration-300">
      <button 
        onClick={() => navigate('/learner/bookings')}
        className="btn-glass flex items-center gap-2 font-bold mb-6 px-4 py-2 rounded-xl"
      >
        <ArrowLeft className="w-4 h-4" /> Kembali
      </button>

      <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side: Detail & Methods */}
        <div className="w-full md:w-3/5 p-6 md:p-10">
          <div className="mb-8">
            <h2 className="text-2xl font-extrabold text-textPrimary">Invoice Pembayaran</h2>
            <p className="text-sm text-slate-500 mt-1">ID Pesanan: <span className="font-mono text-slate-700">#{booking.id.toString().padStart(5, '0')}</span></p>
          </div>

          {paymentError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 font-medium">
              {paymentError}
            </div>
          )}

          {/* Ringkasan Pesanan Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-8">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
              <Banknote className="w-4 h-4 text-emerald-500" /> Rincian Sesi
            </h3>
            
            <div className="grid grid-cols-2 gap-y-5 gap-x-4">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Learner</p>
                <p className="text-sm font-bold text-slate-800">Anda</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tutor</p>
                <div className="flex items-center gap-2">
                  {booking.tutor?.user?.avatar || booking.tutor?.avatar ? (
                    <img 
                      src={booking.tutor?.user?.avatar || booking.tutor?.avatar} 
                      alt="Tutor Avatar" 
                      className="w-6 h-6 rounded-full object-cover border border-slate-200 shadow-sm" 
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center border border-emerald-200 shrink-0">
                      <span className="text-[10px] font-bold text-emerald-700">{tutorName.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                  <p className="text-sm font-bold text-slate-800 truncate">{tutorName}</p>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Mata Pelajaran</p>
                <div className="inline-block px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-md">
                  {booking.course?.name || '-'}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Jadwal Sesi</p>
                <div className="flex items-start gap-1.5 text-xs font-bold text-slate-800 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                  <span>
                    {dateText}<br/>
                    {timeText}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Metode Pembayaran (Only show if UNPAID and NOT PENDING) */}
          {!isPaid && !isPending ? (
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
                <CreditCard className="w-4 h-4 text-emerald-500" /> Metode Pembayaran
              </h3>
              
              <div className="space-y-3">
                {/* Tunai */}
                <label className={`flex items-center p-4 border rounded-2xl cursor-pointer transition-all ${
                  selectedMethod === 'cash' ? 'border-emerald-500 bg-emerald-50/30 ring-1 ring-emerald-500' : 'border-slate-200 bg-white hover:border-emerald-300'
                }`}>
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mr-4">
                    <Banknote className="w-5 h-5 text-slate-500" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-sm text-slate-800">Bayar Tunai</h4>
                    <p className="text-xs text-slate-500">Di Lokasi</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedMethod === 'cash' ? 'border-emerald-500' : 'border-slate-300'}`}>
                    {selectedMethod === 'cash' && <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />}
                  </div>
                  <input type="radio" name="method" value="cash" className="hidden" onChange={() => setSelectedMethod('cash')} />
                </label>

                {/* Transfer Bank */}
                <div className={`border rounded-2xl transition-all overflow-hidden ${
                  selectedMethod === 'transfer' ? 'border-emerald-500 bg-emerald-50/30 ring-1 ring-emerald-500' : 'border-slate-200 bg-white hover:border-emerald-300'
                }`}>
                  <label className="flex items-center p-4 cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mr-4">
                      <CreditCard className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-sm text-slate-800">Transfer Bank</h4>
                      <p className="text-xs text-slate-500">BRI, BNI, Mandiri, BCA</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedMethod === 'transfer' ? 'border-emerald-500' : 'border-slate-300'}`}>
                      {selectedMethod === 'transfer' && <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />}
                    </div>
                    <input type="radio" name="method" value="transfer" className="hidden" onChange={() => setSelectedMethod('transfer')} />
                  </label>
                  
                  {selectedMethod === 'transfer' && (
                    <div className="px-4 pb-4 pt-0 pl-[72px]">
                      <div className="flex gap-2">
                        {['bri', 'bni', 'mandiri', 'bca'].map(bank => (
                          <button
                            key={bank}
                            onClick={() => setSelectedProvider(bank)}
                            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${
                              selectedProvider === bank 
                                ? 'btn-glass-primary' 
                                : 'btn-glass'
                            }`}
                          >
                            {bank}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* E-Wallet */}
                <div className={`border rounded-2xl transition-all overflow-hidden ${
                  selectedMethod === 'ewallet' ? 'border-emerald-500 bg-emerald-50/30 ring-1 ring-emerald-500' : 'border-slate-200 bg-white hover:border-emerald-300'
                }`}>
                  <label className="flex items-center p-4 cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mr-4">
                      <Smartphone className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-sm text-slate-800">E-Wallet</h4>
                      <p className="text-xs text-slate-500">OVO, GoPay, Dana</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedMethod === 'ewallet' ? 'border-emerald-500' : 'border-slate-300'}`}>
                      {selectedMethod === 'ewallet' && <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />}
                    </div>
                    <input type="radio" name="method" value="ewallet" className="hidden" onChange={() => setSelectedMethod('ewallet')} />
                  </label>

                  {selectedMethod === 'ewallet' && (
                    <div className="px-4 pb-4 pt-0 pl-[72px]">
                      <div className="flex gap-2">
                        {['ovo', 'gopay', 'dana'].map(wallet => (
                          <button
                            key={wallet}
                            onClick={() => setSelectedProvider(wallet)}
                            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${
                              selectedProvider === wallet 
                                ? 'btn-glass-primary' 
                                : 'btn-glass'
                            }`}
                          >
                            {wallet}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : isMidtransPending ? (
            <div className="p-8 border border-emerald-200 bg-emerald-50/50 rounded-2xl flex flex-col items-center justify-center text-center mt-6">
              <CreditCard className="w-16 h-16 text-emerald-500 mb-4" />
              <h3 className="text-xl font-bold text-slate-800 mb-2">Selesaikan Pembayaran</h3>
              <p className="text-slate-600 text-sm mb-6">Pembayaran Anda sedang menunggu penyelesaian via Midtrans.</p>
              <button
                onClick={() => {
                  const snap = (window as any).snap;
                  if (snap) {
                    snap.pay(booking.payment_code, {
                      onSuccess: () => fetchBookingDetail(),
                      onPending: () => fetchBookingDetail(),
                      onError: () => setPaymentError('Pembayaran gagal atau dibatalkan.'),
                      onClose: () => fetchBookingDetail(),
                    });
                  } else {
                    setPaymentError('Midtrans SDK tidak termuat. Silakan muat ulang halaman.');
                  }
                }}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                Bayar Sekarang (Midtrans)
              </button>
            </div>
          ) : isPending ? (
            <div className="p-8 border border-amber-200 bg-amber-50 rounded-2xl flex flex-col items-center justify-center text-center mt-6">
              <Clock className="w-16 h-16 text-amber-500 mb-4" />
              <h3 className="text-xl font-bold text-amber-900 mb-2">Menunggu Verifikasi Admin</h3>
              <p className="text-amber-700 text-sm mb-4">
                Silakan transfer ke rekening berikut dan tunggu konfirmasi Admin:
              </p>
              <div className="bg-white px-5 py-4 rounded-xl border border-amber-100 shadow-sm w-full max-w-sm mb-2 text-left">
                <p className="text-xs text-amber-600 font-bold uppercase tracking-wider mb-1">Bank Tujuan</p>
                <p className="text-lg font-black text-slate-800">Bank KonekDin</p>
                <p className="text-base font-mono font-medium text-slate-600 mt-1">123-456-7890</p>
                <p className="text-xs text-slate-400 mt-1">a.n. PT KonekDin Edukasi</p>
              </div>
              <p className="text-[11px] text-amber-600 font-medium italic mt-2">
                *Pesanan Anda akan disetujui setelah pembayaran dikonfirmasi.
              </p>
            </div>
          ) : isCancelled ? (
            <div className="p-8 border border-red-200 bg-red-50 rounded-2xl flex flex-col items-center justify-center text-center mt-6">
              <AlertCircle className="w-16 h-16 text-red-500 mb-4 animate-pulse" />
              <h3 className="text-xl font-bold text-red-900 mb-2">Pesanan Telah Dibatalkan</h3>
              <p className="text-red-700 text-sm">
                Pesanan ini telah dibatalkan dan slot belajar Anda telah dilepaskan. Silakan buat pesanan baru jika ingin memesan sesi lagi.
              </p>
            </div>
          ) : (
            <div className="p-8 border border-emerald-200 bg-emerald-50/50 rounded-2xl flex flex-col items-center justify-center text-center mt-6">
              <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4" />
              <h3 className="text-xl font-bold text-emerald-900 mb-2">Pembayaran Berhasil!</h3>
              <p className="text-emerald-700 text-sm">Sesi belajar Anda bersama {tutorName} sudah dikonfirmasi.</p>
              <div className="mt-6 px-4 py-2 bg-emerald-100 text-emerald-800 font-bold rounded-xl text-sm border border-emerald-200">
                Kode Pembayaran: {booking.payment_code || '-'}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Price Details */}
        <div className="w-full md:w-2/5 bg-[#0B132B] flex flex-col p-6 md:p-10 text-white relative">
          {/* Subtle decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-bl-[100px] pointer-events-none" />
          
          <div className="flex-1 relative z-10">
            <h3 className="text-lg font-bold mb-8 flex items-center gap-2">
              <Banknote className="w-5 h-5 text-emerald-400" /> Rincian Harga
            </h3>

            <div className="space-y-5 mb-10">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400 font-medium">Biaya Sesi ({booking.slots?.length || 0} Sesi)</span>
                <span className="font-bold">Rp{booking.total_price?.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400 font-medium">Biaya Layanan</span>
                <span className="font-bold">Rp{booking.service_fee?.toLocaleString('id-ID')}</span>
              </div>
              {(isPaid || isPending) && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-emerald-400 font-medium">Metode Pembayaran</span>
                  <span className="font-bold uppercase">{booking.payment_method?.replace('_', ' ') || '-'}</span>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-white/10 mb-8">
              <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">Total Pembayaran</p>
              <p className="text-4xl font-black text-white tracking-tight">Rp{booking.grand_total?.toLocaleString('id-ID')}</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex gap-4 backdrop-blur-sm">
              <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Pembayaran Anda dijamin aman melalui sistem escrow kami. Dana hanya akan diteruskan ke tutor setelah sesi selesai.
              </p>
            </div>
          </div>

          <div className="mt-10 relative z-10">
            {isCancelled ? (
              <button
                onClick={() => navigate('/learner/bookings')}
                className="btn-glass w-full py-4 font-bold rounded-xl"
              >
                Kembali ke Daftar Pesanan
              </button>
            ) : !isPaid && !isPending ? (
              <>
                <button
                  onClick={isMidtransPending ? () => {
                    const snap = (window as any).snap;
                    if (snap) {
                      snap.pay(booking.payment_code, {
                        onSuccess: () => fetchBookingDetail(),
                        onPending: () => fetchBookingDetail(),
                        onError: () => setPaymentError('Pembayaran gagal atau dibatalkan.'),
                        onClose: () => fetchBookingDetail(),
                      });
                    } else {
                      setPaymentError('Midtrans SDK tidak termuat. Silakan muat ulang halaman.');
                    }
                  } : handleConfirm}
                  disabled={isProcessing}
                  className="w-full py-4 font-bold rounded-xl flex items-center justify-center gap-2 mb-3 disabled:opacity-50 bg-emerald-500 hover:bg-emerald-600 text-white transition-all shadow-md"
                >
                  {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : isMidtransPending ? 'Bayar Sekarang' : 'Selesaikan Pembayaran'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsCancelModalOpen(true)}
                  disabled={isProcessing || isCancelling}
                  className="btn-glass-destructive w-full py-4 font-bold rounded-xl flex items-center justify-center gap-2 mb-4 disabled:opacity-50"
                >
                  Batalkan Pesanan
                </button>
                <p className="text-[10px] text-center text-slate-500">
                  Dengan membayar, Anda menyetujui <a href="#" className="underline hover:text-white transition-colors">Ketentuan Layanan</a> & <a href="#" className="underline hover:text-white transition-colors">Kebijakan Privasi</a> KonekDin.
                </p>
              </>
            ) : isPaid ? (
              <>
                {(booking.tutor?.phone || booking.tutor?.user?.phone) && (
                  <a
                    href={formatWhatsAppLink(booking.tutor?.phone || booking.tutor?.user?.phone)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-glass-whatsapp w-full py-4 font-bold rounded-xl flex items-center justify-center gap-2 mb-4"
                  >
                    <MessageCircle className="w-5 h-5" /> Hubungi Tutor via WhatsApp
                  </a>
                )}
                <button
                  onClick={() => navigate('/learner/history')}
                  className="btn-glass w-full py-4 font-bold rounded-xl"
                >
                  Lihat Jadwal Belajar Anda
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate('/learner/bookings')}
                className="btn-glass w-full py-4 font-bold rounded-xl"
              >
                Kembali ke Daftar Pesanan
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Cancellation Confirmation Modal */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-bgSecondary border border-slate-200 dark:border-borderColor/20 rounded-[28px] max-w-md w-full p-6 md:p-8 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-extrabold text-textPrimary dark:text-white mb-2">
              Batalkan Pesanan?
            </h3>
            <p className="text-sm text-slate-600 dark:text-textSecondary leading-relaxed mb-6">
              Apakah Anda yakin ingin membatalkan pesanan ini? <span className="text-red-500 font-medium">Tindakan ini tidak dapat dibatalkan</span> dan slot belajar Anda akan dilepaskan untuk learner lain.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setIsCancelModalOpen(false)}
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
                {isCancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Ya, Batalkan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
