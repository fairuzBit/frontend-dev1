import { useEffect, useState } from 'react';
import { Sparkles, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { tutorService } from '@/api/services/tutorService';
import { normalizeList } from '@/lib/apiData';

// Helper to format phone number to international WhatsApp format
const formatWhatsAppLink = (phone: string | undefined) => {
  if (!phone) return null;
  let clean = phone.replace(/\D/g, '');
  if (clean.startsWith('0')) {
    clean = '62' + clean.substring(1);
  }
  return `https://wa.me/${clean}`;
};

const formatDate = (dateStr: string) => {
  if (!dateStr || dateStr === '-') return '-';
  const dateObj = new Date(dateStr);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
  return `${dateObj.getDate()} ${months[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
};

export default function TutorBookingsPage() {
  const [requests, setRequests] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completingId, setCompletingId] = useState<number | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await tutorService.getBookings();
        setRequests(normalizeList(response));
      } catch {
        setError('Gagal memuat jadwal dari backend.');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleCompleteSession = async (bookingId: number) => {
    if (!confirm('Apakah Anda yakin sesi belajar ini telah selesai?')) {
      return;
    }

    setCompletingId(bookingId);
    try {
      await tutorService.completeBooking(bookingId);
      setRequests(prev => prev.filter(r => r.id !== bookingId));
      alert('Sesi belajar berhasil diselesaikan!');
    } catch {
      alert('Gagal menyelesaikan sesi belajar.');
    } finally {
      setCompletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Jadwal Sesi Aktif</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <p className="text-sm text-slate-500">Memuat jadwal...</p> : null}
          {error ? <p className="text-sm text-rose-500">{error}</p> : null}
          {!loading && !error && requests.length === 0 ? <p className="text-sm text-slate-500">Belum ada jadwal aktif.</p> : null}
          {requests.map((request, index) => {
            const waLink = formatWhatsAppLink(request.learner_phone as string | undefined);
            
            return (
              <div key={index} className="mt-3 flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 first:mt-0">
                <div>
                  <p className="font-bold text-slate-900 text-lg">{(request.learner as string) ?? 'Learner'}</p>
                  <p className="text-sm text-slate-500 font-medium mt-1">Mata Kuliah: <span className="text-emerald-600 font-bold">{(request.course as string) ?? '—'}</span></p>
                  <p className="text-sm text-slate-600 dark:text-textSecondary mt-1 font-medium bg-white dark:bg-bgSecondary inline-block px-2 py-1 rounded-md border border-slate-100 dark:border-borderColor/10">
                     Jadwal: <span className="font-bold text-textPrimary dark:text-white">{formatDate(request.date as string)}</span> | {Array.isArray(request.slots) && request.slots.length > 0 ? request.slots.join(', ') : 'Belum memilih waktu'}
                  </p>
                </div>
                <div className="flex flex-col md:items-end gap-3 shrink-0">
                  <div className="flex items-center gap-2 text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full"><Sparkles className="h-4 w-4" /> Disetujui</div>
                  <div className="flex flex-col sm:flex-row md:flex-col gap-2 w-full">
                    {waLink && (
                      <a 
                        href={waLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 btn-glass-whatsapp text-sm font-bold rounded-xl w-full md:w-auto justify-center"
                      >
                        <MessageCircle className="w-4 h-4" /> Hubungi Learner
                      </a>
                    )}
                    {request.status === 'accepted' && (
                      <button
                        onClick={() => handleCompleteSession(request.id as number)}
                        disabled={completingId === request.id}
                        className="flex items-center gap-2 px-4 py-2 border border-emerald-600 text-emerald-600 hover:bg-emerald-50 disabled:opacity-50 text-sm font-bold rounded-xl transition-colors w-full md:w-auto justify-center"
                      >
                        {completingId === request.id ? 'Memproses...' : 'Sesi Selesai'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
