import { useEffect, useState } from 'react';
import { adminService } from '@/api/services/adminService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Banknote, CheckCircle, Clock, Loader2, Search, XCircle, Users, ShieldCheck, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminNavigationTabs from '@/features/admin/components/AdminNavigationTabs';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await adminService.getPayments();
      setPayments(res.data || res);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal memuat daftar pembayaran');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleApprove = async (id: number) => {
    if (!window.confirm('Apakah Anda yakin ingin menyetujui pembayaran ini?')) return;
    
    try {
      setProcessingId(id);
      await adminService.approvePayment(id);
      await fetchPayments();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menyetujui pembayaran');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'accepted':
      case 'completed':
        return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-md">Lunas</span>;
      case 'cancelled':
      case 'rejected':
        return <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-md">Dibatalkan</span>;
      default:
        return <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-md flex items-center gap-1 w-max"><Clock className="w-3 h-3" /> Menunggu</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 relative z-10">
      {/* Header Section */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Manajemen Platform</h1>
        <p className="text-slate-500">Kelola pengguna, verifikasi tutor baru, dan pantau pembayaran dalam satu tempat.</p>
      </div>

      {/* Tabs */}
      <AdminNavigationTabs />

      <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0B132B] text-white">
                  <th className="p-4 text-xs font-bold uppercase tracking-wider">ID</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider">Tanggal</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider">Learner & Tutor</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider">Metode</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider">Nominal</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto" />
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-red-500 font-medium">
                      {error}
                    </td>
                  </tr>
                ) : payments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500">
                      Belum ada data pembayaran
                    </td>
                  </tr>
                ) : (
                  payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="p-4 text-sm font-mono text-slate-500">#{payment.id.toString().padStart(4, '0')}</td>
                      <td className="p-4 text-sm text-slate-600">{payment.tanggal}</td>
                      <td className="p-4">
                        <p className="text-sm font-bold text-slate-800">{payment.learner}</p>
                        <p className="text-xs text-slate-500">ke {payment.tutor}</p>
                      </td>
                      <td className="p-4 text-sm font-bold text-slate-700 uppercase">
                        {payment.metode?.replace('_', ' ') || '-'}
                      </td>
                      <td className="p-4 text-sm font-black text-emerald-600">
                        Rp{payment.nominal?.toLocaleString('id-ID')}
                      </td>
                      <td className="p-4">
                        {getStatusBadge(payment.status)}
                      </td>
                      <td className="p-4 text-right">
                        {payment.status === 'pending' || payment.status === 'unpaid' ? (
                          <button
                            onClick={() => handleApprove(payment.id)}
                            disabled={processingId === payment.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 btn-glass-primary text-xs font-bold rounded-lg shadow-sm disabled:opacity-50"
                          >
                            {processingId === payment.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <CheckCircle className="w-3.5 h-3.5" />
                            )}
                            Approve
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium italic">-</span>
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
