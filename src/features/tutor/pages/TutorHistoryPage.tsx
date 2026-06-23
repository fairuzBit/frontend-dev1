import { useEffect, useState } from 'react';
import { Calendar, Clock, History, CheckCircle2, XCircle, AlertCircle, User, BookOpen } from 'lucide-react';
import { tutorService } from '@/api/services/tutorService';
import { normalizeList } from '@/lib/apiData';

function StatusBadge({ status }: { status: string }) {
  switch (status?.toUpperCase()) {
    case 'SELESAI':
    case 'COMPLETED':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
          <CheckCircle2 className="w-3 h-3" /> Selesai
        </span>
      );
    case 'DIBATALKAN':
    case 'CANCELLED':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-100">
          <XCircle className="w-3 h-3" /> Dibatalkan
        </span>
      );
    case 'DITOLAK':
    case 'REJECTED':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-600 border border-orange-100">
          <XCircle className="w-3 h-3" /> Ditolak
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">
          <AlertCircle className="w-3 h-3" /> {status ?? 'Tidak diketahui'}
        </span>
      );
  }
}

export default function TutorHistoryPage() {
  const [history, setHistory] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await tutorService.getHistory();
        setHistory(normalizeList(response));
      } catch {
        setError('Gagal memuat riwayat mengajar dari backend.');
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
          <div className="w-10 h-10 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
          <p className="text-slate-500 font-medium animate-pulse">Memuat riwayat mengajar...</p>
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
        <h1 className="text-2xl md:text-3xl font-extrabold text-textPrimary mb-2 tracking-tight">
          Riwayat Mengajar
        </h1>
        <p className="text-slate-500 font-medium">Rekap seluruh sesi mengajar yang telah kamu selesaikan.</p>
      </div>

      <div className="space-y-4">
        {history.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-200 border-dashed rounded-[32px]">
            <History className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-700 mb-1">Belum ada riwayat</h3>
            <p className="text-sm text-slate-500">Kamu belum menyelesaikan sesi mengajar apapun.</p>
          </div>
        ) : (
          history.map((item, index) => {
            // Slots: handle both object {start_time, end_time} and legacy string format
            const rawSlots = (item.slots as Array<unknown>) || [];
            const slots = rawSlots.map((s) => {
              if (typeof s === 'string') {
                // Legacy format: "10:20 - 11:10"
                const parts = s.split(' - ');
                return { start_time: parts[0] ?? s, end_time: parts[1] ?? s };
              }
              return s as Record<string, string>;
            });

            // Date formatting
            let dateText = 'Tanggal tidak tersedia';
            if (item.booking_date) {
              const dateObj = new Date(item.booking_date as string);
              const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
              const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
              dateText = `${days[dateObj.getDay()]}, ${dateObj.getDate()} ${monthNames[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
            } else if (item.detail) {
              dateText = item.detail as string;
            }

            // Time formatting
            let timeText = '-';
            if (slots.length > 0) {
              const start = slots[0].start_time;
              const end = slots[slots.length - 1].end_time;
              if (start && end) timeText = `${start} – ${end} WIB`;
            }

            // Duration in slots (1 slot = 1 hour typically)
            const durationText = slots.length > 0 ? `${slots.length} jam` : null;

            // Learner info — BE returns learner as {name, avatar} object
            const learner = item.learner as Record<string, unknown> | undefined;
            const learnerName = (learner?.name ?? item.title ?? 'Siswa') as string;
            const learnerAvatar = learner?.avatar as string | undefined;

            // Course info — BE returns course as plain string
            const courseName = (typeof item.course === 'string' ? item.course : (item.course as Record<string, unknown>)?.name ?? item.detail ?? '-') as string;

            // Status
            const status = (item.status as string) ?? '';

            return (
              <div
                key={String(item.id ?? index)}
                className="bg-white border border-slate-200 rounded-[24px] p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all hover:shadow-lg hover:shadow-slate-200/50 hover:border-brand-200"
              >
                {/* Left: Avatar + Info */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div className="w-14 h-14 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center text-lg font-bold shadow-sm overflow-hidden">
                      {learnerAvatar ? (
                        <img src={learnerAvatar} alt={learnerName} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-6 h-6 text-brand-500" />
                      )}
                    </div>
                  </div>

                  {/* Text info */}
                  <div className="flex flex-col flex-1 min-w-0">
                    <p className="font-extrabold text-slate-900 text-base leading-tight mb-0.5 truncate">{learnerName}</p>

                    <div className="flex items-center gap-1.5 mb-3">
                      <BookOpen className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                      <p className="text-sm font-semibold text-brand-600 truncate">{courseName}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-medium text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {dateText}
                      </div>
                      {timeText !== '-' && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {timeText}
                        </div>
                      )}
                      {durationText && (
                        <div className="flex items-center gap-1.5">
                          <span className="w-3.5 h-3.5 rounded-full bg-slate-200 inline-flex items-center justify-center text-[9px] font-black text-slate-500">⏱</span>
                          {durationText}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Status badge */}
                <div className="flex items-center justify-end md:justify-start shrink-0">
                  <StatusBadge status={status} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
