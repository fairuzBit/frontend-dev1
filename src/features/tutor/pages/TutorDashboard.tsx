import { CalendarDays, Clock3, Sparkles, TrendingUp, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTutorDashboard } from '@/hooks/useTutorDashboard';
import { pickValue } from '@/lib/apiData';

function formatNumber(value: unknown) {
  if (typeof value === 'number') {
    return value.toLocaleString('id-ID');
  }

  if (typeof value === 'string' && value.trim()) {
    return value;
  }

  return '—';
}

export default function TutorDashboard() {
  const { data, loading, error } = useTutorDashboard();
  const summary = (data?.summary ?? {}) as Record<string, unknown>;
  const activeSessions = formatNumber(pickValue(summary, ['activeSessions', 'active_sessions', 'active_session_count']));
  const earnings = formatNumber(pickValue(summary, ['earnings', 'totalEarnings', 'total_earnings']));
  const pendingBookings = formatNumber(pickValue(summary, ['pendingBookings', 'pending_bookings', 'pending_booking_count']));
  const upcomingSessions = Array.isArray(pickValue(data, ['upcomingSessions', 'upcoming_sessions', 'schedules']))
    ? (pickValue(data, ['upcomingSessions', 'upcoming_sessions', 'schedules']) as Array<Record<string, unknown>>)
    : [];

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-brand-600 to-brand-700 text-white">
        <CardContent className="space-y-3">
          <div className="inline-flex rounded-full bg-white/15 px-3 py-1 text-sm font-medium text-brand-50">Tutor Overview</div>
          <h2 className="text-2xl font-semibold">Data dashboard diterima langsung dari backend.</h2>
          <p className="text-sm text-brand-50">Ringkasan sesi, pendapatan, dan booking menunggu diperbarui dari server.</p>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Ringkasan cepat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-brand-50 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-brand-700"><CalendarDays className="h-4 w-4" /> Sesi aktif</div>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{loading ? '…' : activeSessions}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-700"><Wallet className="h-4 w-4" /> Pendapatan</div>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{loading ? '…' : earnings}</p>
              </div>
              <div className="rounded-2xl bg-amber-50 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-amber-700"><TrendingUp className="h-4 w-4" /> Booking menunggu</div>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{loading ? '…' : pendingBookings}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Jadwal mendatang</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <p className="text-sm text-slate-500">Mengambil data...</p> : null}
            {error ? <p className="text-sm text-rose-500">{error}</p> : null}
            {!loading && !error && upcomingSessions.length === 0 ? <p className="text-sm text-slate-500">Belum ada data jadwal dari backend.</p> : null}
            <div className="space-y-3">
              {upcomingSessions.map((session, index) => (
                <div key={index} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{(session.title as string) ?? 'Sesi'}</p>
                      <p className="text-sm text-slate-500">{(session.learner as string) ?? '—'}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-brand-700"><Clock3 className="h-4 w-4" /> {(session.time as string) ?? '—'}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
