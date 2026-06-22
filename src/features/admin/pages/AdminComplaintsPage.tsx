import { useEffect, useState } from 'react';
import { MessageSquareText, Star, AlertCircle, CheckCircle, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { adminService } from '@/api/services/adminService';
import { normalizeList } from '@/lib/apiData';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function AdminComplaintsPage() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<Array<any>>([]);
  const [stats, setStats] = useState<any>({ total_negative: 0, pending: 0, processing: 0, resolved: 0 });
  const [logs, setLogs] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const response = await adminService.getModerationReviews();
      setComplaints(response.data?.reviews || []);
      setStats(response.data?.stats || { total_negative: 0, pending: 0, processing: 0, resolved: 0 });
      
      const logsResponse = await adminService.getModerationLogs();
      setLogs(logsResponse.data || []);
    } catch {
      setError('Gagal memuat komplain dari backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleProcess = async (id: number, tutorName?: string) => {
    try {
      await adminService.processReview(id);
      if (tutorName) {
        navigate(`/admin/users?name=${encodeURIComponent(tutorName)}&role=tutor`);
      } else {
        fetchComplaints();
      }
    } catch {
      alert('Gagal memproses ulasan');
    }
  };

  const handleResolve = async (id: number) => {
    try {
      await adminService.resolveReview(id);
      fetchComplaints();
    } catch {
      alert('Gagal menyelesaikan ulasan');
    }
  };

  const handleDelete = async (id: number, status: string | null) => {
    let reason = 'Penghapusan oleh Admin';
    
    // Jika status belum SELESAI, admin wajib memberi alasan.
    if (status !== 'SELESAI') {
      const inputReason = prompt('Masukkan alasan penghapusan (misal: "Spam/Troll"):');
      if (inputReason === null) return; // User cancelled
      reason = inputReason || reason;
    }
    
    if (confirm('Yakin ingin menghapus ulasan buruk ini secara permanen?')) {
      try {
        await adminService.deleteReview(id, reason);
        fetchComplaints();
      } catch {
        alert('Gagal menghapus ulasan');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-2 tracking-tight">Komplain & Moderasi</h1>
        <p className="text-slate-200 font-medium">Tinjau ulasan ber-rating rendah (⭐ 1 & 2) untuk menjaga kualitas layanan KonekDin.</p>
      </div>
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Card className="flex-1 border-rose-100 shadow-sm">
          <CardContent className="p-5 flex flex-col justify-center h-full">
            <span className="text-sm font-medium text-slate-500 dark:text-pink-50 mb-2 block">Total Ulasan Negatif</span>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{stats.total_negative}</span>
              <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center border border-rose-100">
                <MessageSquareText className="w-4 h-4 text-rose-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="flex-1 border-amber-100 shadow-sm">
          <CardContent className="p-5 flex flex-col justify-center h-full">
            <span className="text-sm font-medium text-slate-500 dark:text-pink-50 mb-2 block">Menunggu Tinjauan</span>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{stats.pending}</span>
              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-100 uppercase">Action Req.</span>
            </div>
          </CardContent>
        </Card>

        <Card className="flex-1 border-blue-100 shadow-sm">
          <CardContent className="p-5 flex flex-col justify-center h-full">
            <span className="text-sm font-medium text-slate-500 dark:text-pink-50 mb-2 block">Sedang Diproses</span>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{stats.processing}</span>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full border border-blue-100 uppercase">Follow-up</span>
            </div>
          </CardContent>
        </Card>

        <Card className="flex-1 border-emerald-100 shadow-sm">
          <CardContent className="p-5 flex flex-col justify-center h-full">
            <span className="text-sm font-medium text-slate-500 dark:text-pink-50 mb-2 block">Selesai</span>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{stats.resolved}</span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100 uppercase">Aman</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Ulasan Rating Rendah (1-2 Bintang)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? <div className="p-6 text-center text-sm text-slate-500 dark:text-pink-50">Memuat komplain...</div> : null}
          {error ? <div className="p-6 text-center text-sm text-rose-500">{error}</div> : null}
          {!loading && !error && complaints.length === 0 ? <div className="p-6 text-center text-sm text-slate-500 dark:text-pink-50">Belum ada komplain dari backend. Semua ulasan terlihat baik.</div> : null}
          
          {!loading && !error && complaints.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 dark:text-pink-100 uppercase tracking-wider">
                    <th className="p-5 font-bold">ID Sesi</th>
                    <th className="p-5 font-bold">Learner / Tutor</th>
                    <th className="p-5 font-bold text-center">Rating</th>
                    <th className="p-5 font-bold">Ulasan / Alasan Learner</th>
                    <th className="p-5 font-bold text-center">Aksi Moderasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {complaints.map((item, index) => (
                    <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-5 align-top">
                        <div className="font-bold text-slate-900 dark:text-white text-sm">#BK-800{item.id}</div>
                        <div className="text-xs text-slate-400 dark:text-pink-100 mt-1">{item.tanggal}</div>
                        <div className="mt-2">
                          <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${item.moderation_status === 'MENUNGGU TINJAUAN' ? 'bg-amber-100 text-amber-700' : item.moderation_status === 'DIPROSES' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                            {item.moderation_status === 'MENUNGGU TINJAUAN' ? 'Pending' : item.moderation_status}
                          </span>
                        </div>
                      </td>
                      <td className="p-5 align-top">
                        <div className="font-bold text-slate-900 dark:text-white text-sm">{item.learner_name}</div>
                        <div className="text-xs text-slate-500 dark:text-pink-50 mt-1 flex items-center gap-1">
                          <span className="text-slate-300">→</span> {item.tutor_name}
                        </div>
                      </td>
                      <td className="p-5 align-top text-center">
                        <div className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 px-2.5 py-1 rounded-md font-bold text-sm">
                          <Star className="h-3.5 w-3.5 fill-rose-500 text-rose-500" /> {Number(item.rating).toFixed(1)}
                        </div>
                      </td>
                      <td className="p-5 align-top">
                        <div className="bg-rose-50/50 rounded-xl p-3 text-sm italic text-slate-600 dark:text-pink-50 border border-rose-100/50">
                          "{item.comment || 'Tidak ada komentar'}"
                        </div>
                      </td>
                      <td className="p-5 align-top text-center">
                        <div className="flex flex-col items-center gap-2">
                          {item.moderation_status === 'MENUNGGU TINJAUAN' && (
                            <Button size="sm" variant="outline" className="w-32 text-amber-600 border-amber-200 hover:bg-amber-50 text-xs font-bold" onClick={() => handleProcess(item.id, item.tutor_name)}>
                              <AlertCircle className="w-3.5 h-3.5 mr-1.5" /> Tindak Lanjut
                            </Button>
                          )}
                          {item.moderation_status === 'DIPROSES' && (
                            <Button size="sm" variant="outline" className="w-32 text-emerald-600 border-emerald-200 hover:bg-emerald-50 text-xs font-bold" onClick={() => handleResolve(item.id)}>
                              <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Selesaikan
                            </Button>
                          )}
                          <Button size="sm" variant="outline" className="w-32 text-slate-600 dark:text-pink-50 border-slate-200 hover:bg-slate-50 text-xs font-bold" onClick={() => handleDelete(item.id, item.moderation_status)}>
                            <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Hapus
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Aktifitas Moderasi Terbaru</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {logs.length === 0 ? (
            <div className="p-6 text-center text-sm text-slate-500 dark:text-pink-50">Belum ada aktifitas moderasi.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 dark:text-pink-100 uppercase tracking-wider bg-slate-50/50">
                    <th className="p-4 font-bold">Waktu</th>
                    <th className="p-4 font-bold">Admin</th>
                    <th className="p-4 font-bold">Aksi</th>
                    <th className="p-4 font-bold">Keterangan</th>
                    <th className="p-4 font-bold">Ulasan Asli</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {logs.map((log, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 text-xs text-slate-500 dark:text-pink-50">{log.tanggal}</td>
                      <td className="p-4 text-sm font-medium text-slate-700">{log.admin_name}</td>
                      <td className="p-4">
                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${log.action === 'DIHAPUS' ? 'bg-rose-100 text-rose-700' : log.action === 'DIPROSES' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-slate-600 dark:text-pink-50 italic">
                        "{log.reason}"
                      </td>
                      <td className="p-4 text-xs text-slate-500 dark:text-pink-50 max-w-xs truncate" title={log.details?.comment}>
                        ⭐ {log.details?.rating} - {log.details?.comment || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
