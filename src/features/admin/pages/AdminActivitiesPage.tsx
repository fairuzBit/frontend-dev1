import { useEffect, useState } from 'react';
import { adminService } from '@/api/services/adminService';
import { Card, CardContent } from '@/components/ui/card';
import { Activity, Loader2, Search, Calendar, User } from 'lucide-react';
import AdminNavigationTabs from '@/features/admin/components/AdminNavigationTabs';

export default function AdminActivitiesPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const res = await adminService.getModerationLogs();
        setLogs(res.data || res || []);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Gagal memuat riwayat aktivitas admin');
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const query = searchQuery.toLowerCase();
    return (
      (log.admin_name?.toLowerCase() || '').includes(query) ||
      (log.action?.toLowerCase() || '').includes(query) ||
      (log.reason?.toLowerCase() || '').includes(query) ||
      (log.details?.toLowerCase() || '').includes(query)
    );
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 relative z-10">
      {/* Header Section */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Manajemen Platform</h1>
        <p className="text-yellow-400">Kelola pengguna, verifikasi tutor baru, dan pantau aktivitas sistem dalam satu tempat.</p>
      </div>

      {/* Tabs */}
      <AdminNavigationTabs />

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-bgSecondary/30 p-4 rounded-3xl border border-borderColor/20 backdrop-blur-md">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-textSecondary" />
          <input
            type="text"
            placeholder="Cari admin, tindakan, alasan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-bgPrimary border border-borderColor text-textPrimary text-sm outline-none focus:border-brand-500 transition-colors"
          />
        </div>
        <div className="text-xs font-bold text-textSecondary uppercase tracking-wider">
          Total: {filteredLogs.length} Aktivitas
        </div>
      </div>

      {/* Logs Card */}
      <Card className="border-borderColor bg-bgSecondary shadow-sm rounded-[32px] overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0B132B] dark:bg-bgSecondary text-white border-b border-borderColor">
                  <th className="p-5 text-xs font-bold uppercase tracking-wider">Tanggal & Waktu</th>
                  <th className="p-5 text-xs font-bold uppercase tracking-wider">Admin</th>
                  <th className="p-5 text-xs font-bold uppercase tracking-wider">Tindakan</th>
                  <th className="p-5 text-xs font-bold uppercase tracking-wider">Alasan & Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderColor/50 bg-transparent">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="p-12 text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-brand-500 mx-auto" />
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={4} className="p-12 text-center text-rose-500 font-medium">
                      {error}
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-12 text-center text-textSecondary font-medium">
                      <Activity className="w-12 h-12 mx-auto mb-4 opacity-20" />
                      Belum ada riwayat aktivitas admin
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-bgPrimary/30 transition-colors">
                      {/* Tanggal */}
                      <td className="p-5 text-sm text-textSecondary font-medium">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 opacity-50" />
                          <span>{log.tanggal}</span>
                        </div>
                      </td>

                      {/* Admin */}
                      <td className="p-5 text-sm font-bold text-textPrimary">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-brand-500" />
                          <span>{log.admin_name}</span>
                        </div>
                      </td>

                      {/* Tindakan */}
                      <td className="p-5">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-brand-500/10 text-brand-500 dark:text-brand-400">
                          {log.action}
                        </span>
                      </td>

                      {/* Alasan & Detail */}
                      <td className="p-5 text-sm text-textPrimary max-w-md">
                        <p className="font-bold text-textSecondary mb-0.5">Alasan: {log.reason || '-'}</p>
                        {log.details && (
                          <p className="text-xs text-textSecondary font-medium leading-relaxed bg-bgPrimary/50 p-2.5 rounded-xl border border-borderColor/20 mt-1.5 font-mono">
                            {log.details}
                          </p>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
