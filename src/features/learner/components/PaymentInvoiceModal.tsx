import React, { useState } from 'react';
import { X, CheckCircle2, Banknote, CreditCard, Smartphone, ShieldCheck, Calendar } from 'lucide-react';
import { learnerService } from '@/api/services/learnerService';

interface PaymentInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: any;
  onSuccess: () => void;
}

export function PaymentInvoiceModal({ isOpen, onClose, booking, onSuccess }: PaymentInvoiceModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>('transfer');
  const [selectedProvider, setSelectedProvider] = useState<string>('bri');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !booking) return null;

  const handleConfirm = async () => {
    try {
      setIsProcessing(true);
      setError(null);
      // Determine payment_method string to send
      let paymentMethodStr = selectedMethod;
      if (selectedMethod === 'transfer' || selectedMethod === 'ewallet') {
        paymentMethodStr = `${selectedMethod}_${selectedProvider}`;
      }

      const res = await learnerService.payBooking(booking.id, paymentMethodStr);
      
      if (res.success) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal memproses pembayaran. Coba lagi.');
    } finally {
      setIsProcessing(false);
    }
  };

  const tutorName = booking.tutor?.user?.name || booking.tutor?.name || 'Tutor KonekDin';
  
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-5xl bg-slate-50 rounded-[32px] shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-200 max-h-[95vh]">
        
        {/* Left Side: Detail & Methods */}
        <div className="w-full md:w-3/5 p-6 md:p-10 overflow-y-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-extrabold text-textPrimary">Invoice Pembayaran</h2>
              <p className="text-sm text-slate-500 mt-1">Tinjau rincian sesi dan pilih metode pembayaran untuk sesi Anda.</p>
            </div>
            <button 
              onClick={onClose}
              className="btn-glass p-2 rounded-full shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 font-medium">
              {error}
            </div>
          )}

          {/* Ringkasan Pesanan Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-8">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
              <Banknote className="w-4 h-4 text-emerald-500" /> Ringkasan Pesanan
            </h3>
            
            <div className="grid grid-cols-2 gap-y-5 gap-x-4">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Learner</p>
                <p className="text-sm font-bold text-slate-800">Anda</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tutor</p>
                <p className="text-sm font-bold text-slate-800">{tutorName}</p>
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

          {/* Metode Pembayaran */}
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
        </div>

        {/* Right Side: Price Details */}
        <div className="w-full md:w-2/5 bg-[#0B132B] flex flex-col p-6 md:p-10 text-white">
          <div className="flex-1">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Banknote className="w-5 h-5 text-emerald-400" /> Rincian Harga
            </h3>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400 font-medium">Biaya Sesi ({booking.slots?.length || 0} Sesi)</span>
                <span className="font-bold">Rp{booking.total_price?.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400 font-medium">Biaya Layanan</span>
                <span className="font-bold">Rp{booking.service_fee?.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 mb-8">
              <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">Total Pembayaran</p>
              <p className="text-4xl font-black text-white">Rp{booking.grand_total?.toLocaleString('id-ID')}</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Pembayaran Anda dijamin aman melalui sistem escrow kami. Dana hanya akan diteruskan ke tutor setelah sesi selesai.
              </p>
            </div>
          </div>

          <div className="mt-8">
            <button
              onClick={handleConfirm}
              disabled={isProcessing}
              className="btn-glass-primary w-full py-4 font-bold rounded-xl flex items-center justify-center gap-2 mb-4 disabled:opacity-50"
            >
              {isProcessing ? 'Memproses...' : 'Konfirmasi'}
            </button>
            <p className="text-[10px] text-center text-slate-500">
              Dengan membayar, Anda menyetujui <a href="#" className="underline hover:text-white transition-colors">Ketentuan Layanan</a> & <a href="#" className="underline hover:text-white transition-colors">Kebijakan Privasi</a> KonekDin.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
