import { useEffect, useState } from 'react';
import { Users, FileText, X, Check, Search, Filter, ShieldCheck, Wallet, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { adminService } from '@/api/services/adminService';
import { normalizeList } from '@/lib/apiData';
import { Link, useLocation } from 'react-router-dom';
import AdminNavigationTabs from '@/features/admin/components/AdminNavigationTabs';

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [selectedDocs, setSelectedDocs] = useState<Array<{name?: string, label?: string, url?: string}> | null>(null);
  const [selectedLearnerName, setSelectedLearnerName] = useState<string>('');
  const [selectedKeahlian, setSelectedKeahlian] = useState<string[]>([]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await adminService.getApplications();
      setApplications(normalizeList(response));
    } catch {
      setError('Gagal memuat aplikasi tutor dari backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleApprove = async (id: number | string) => {
    try {
      await adminService.approveApplication(id);
      fetchApplications();
    } catch {
      alert('Gagal menyetujui tutor');
    }
  };

  const handleReject = async (id: number | string) => {
    const reason = prompt('Masukkan alasan penolakan (opsional):');
    if (reason !== null) {
      try {
        await adminService.rejectApplication(id, reason);
        fetchApplications();
      } catch {
        alert('Gagal menolak tutor');
      }
    }
  };

  const handleDelete = async (id: number | string) => {
    if (confirm('Apakah Anda yakin ingin menghapus data pengajuan ini?')) {
      try {
        await adminService.deleteApplication(id);
        fetchApplications();
      } catch {
        alert('Gagal menghapus pengajuan');
      }
    }
  };

  // Helper to get initials
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 relative z-10">
      {/* Header Section */}
      <div>
        <h1 className="text-3xl font-bold text-textPrimary mb-2">Manajemen Platform</h1>
        <p className="text-textSecondary">Kelola pengguna, verifikasi tutor baru, dan pantau pembayaran dalam satu tempat.</p>
      </div>

      {/* Tabs */}
      <AdminNavigationTabs />

      {/* Main Content Card */}
      <Card className="border-0 shadow-sm rounded-3xl overflow-hidden bg-bgSecondary">
        <div className="p-6 border-b border-borderColor flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-xl font-bold text-textPrimary">Daftar Pengajuan Tutor</h2>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-3 py-2 text-xs font-semibold btn-glass rounded-lg">
              <Filter className="w-3.5 h-3.5" /> Filter
            </button>
            <div className="relative">
              <Search className="w-4 h-4 text-textSecondary absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Cari learner..." 
                className="pl-9 pr-4 py-2 text-sm bg-bgPrimary text-textPrimary border border-borderColor rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 w-full sm:w-64"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-borderColor bg-bgPrimary/50">
                <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-wider text-textSecondary">Learner</th>
                <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-wider text-textSecondary">Tanggal Pengajuan</th>
                <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-wider text-textSecondary">Mata Kuliah Diajukan</th>
                <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-wider text-textSecondary text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borderColor">
              {loading && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-textSecondary">Memuat aplikasi...</td>
                </tr>
              )}
              {error && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-rose-500">{error}</td>
                </tr>
              )}
              {!loading && !error && applications.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-textSecondary">Belum ada pengajuan tutor baru.</td>
                </tr>
              )}
              {!loading && !error && applications.map((item, index) => {
                const name = (item.name as string) ?? 'Unknown';
                const email = (item.email as string) ?? 'No email';
                const matkul = (item.matkul as string[])?.[0] ?? 'Umum';
                const docs = item.documents as Array<{url?: string}>;
                const docUrl = docs?.[0]?.url ?? '#';

                return (
                  <tr key={index} className="hover:bg-bgPrimary transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {item.avatar ? (
                          <img 
                            src={item.avatar as string} 
                            alt={name} 
                            className="w-10 h-10 rounded-full object-cover shrink-0 border border-borderColor shadow-sm"
                          />
                        ) : (
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                            {getInitials(name)}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-textPrimary">{name}</p>
                          <p className="text-xs text-textSecondary">{email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-textSecondary font-medium">{(item.created_at as string) ?? '—'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-bgPrimary text-textPrimary border border-borderColor">
                        {matkul}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => {
                            setSelectedDocs(docs);
                            setSelectedLearnerName(name);
                            setSelectedKeahlian((item.keahlian as string[]) || []);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold btn-glass"
                        >
                          <FileText className="w-3.5 h-3.5" /> Lihat Berkas ({docs?.length || 0})
                        </button>
                        
                        {item.status === 'pending' ? (
                          <>
                            <button 
                              onClick={() => handleReject(item.id as number)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold btn-glass-destructive"
                            >
                              <X className="w-3.5 h-3.5" /> Tolak
                            </button>
                            <button 
                              onClick={() => handleApprove(item.id as number)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold btn-glass-primary"
                            >
                              <Check className="w-3.5 h-3.5" /> ACC
                            </button>
                          </>
                        ) : (
                          <>
                            <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                              item.status === 'approved' ? 'text-brand-600 bg-brand-50 dark:bg-brand-500/10 dark:text-brand-400' : 'text-rose-600 bg-rose-50 dark:bg-rose-500/10 dark:text-rose-400'
                            }`}>
                              {item.status === 'approved' ? 'Disetujui' : 'Ditolak'}
                            </span>
                            {item.status === 'rejected' && (
                              <button 
                                onClick={() => handleDelete(item.id as number)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold btn-glass-destructive"
                                title="Hapus Pengajuan"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Document Modal */}
      {selectedDocs !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-bgSecondary w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-borderColor animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-borderColor bg-bgPrimary/50">
              <h3 className="font-bold text-lg text-textPrimary">
                Berkas: {selectedLearnerName}
              </h3>
              <button 
                onClick={() => setSelectedDocs(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-borderColor text-textSecondary hover:text-textPrimary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              {selectedKeahlian && selectedKeahlian.length > 0 && selectedKeahlian[0] && (
                <div className="mb-6 p-4 rounded-2xl bg-brand-50/50 dark:bg-brand-500/10 border border-brand-100 dark:border-brand-500/20">
                  <h4 className="text-sm font-bold text-brand-700 dark:text-brand-400 mb-2">Keahlian & Bio</h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {selectedKeahlian[0]}
                  </p>
                </div>
              )}

              <h4 className="text-sm font-bold text-textPrimary mb-3">Dokumen Terlampir</h4>
              {selectedDocs && selectedDocs.length > 0 ? (
                <div className="space-y-3">
                  {selectedDocs.map((doc, i) => (
                    <a 
                      key={i}
                      href={doc.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 rounded-2xl border border-borderColor bg-bgPrimary hover:border-brand-500 hover:bg-brand-50/50 dark:hover:bg-brand-500/10 group transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-500/20 text-brand-500 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-bold text-textPrimary group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                            {doc.label || `Dokumen ${i + 1}`}
                          </p>
                          <p className="text-xs text-textSecondary mt-0.5">
                            {doc.name || 'Dokumen PDF'}
                          </p>
                        </div>
                      </div>
                      <div className="text-xs font-bold text-brand-500 px-3 py-1 rounded-lg bg-brand-50 dark:bg-brand-500/20 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                        Buka
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                  <p className="text-textSecondary font-medium">Tidak ada berkas yang dilampirkan.</p>
                </div>
              )}
            </div>
            
            <div className="p-5 border-t border-borderColor bg-bgPrimary/50 flex justify-end">
              <button 
                onClick={() => setSelectedDocs(null)}
                className="px-5 py-2.5 rounded-xl font-bold btn-glass text-sm"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
