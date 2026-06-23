import { useEffect, useState } from 'react';
import { UserCircle2, Eye, Ban, Trash2, CheckCircle2, Clock, Search, Filter, X, AlertTriangle, Users, ShieldCheck, Wallet } from 'lucide-react';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { adminService } from '@/api/services/adminService';
import { normalizeList } from '@/lib/apiData';
import { Link, useSearchParams } from 'react-router-dom';
import AdminNavigationTabs from '@/features/admin/components/AdminNavigationTabs';

const SUSPEND_DURATIONS = [
  { value: '1 Hari', label: '1 Hari', description: 'Kembali aktif besok' },
  { value: '1 Minggu', label: '1 Minggu', description: 'Kembali aktif 7 hari lagi' },
  { value: '1 Bulan', label: '1 Bulan', description: 'Kembali aktif 30 hari lagi' },
];

function formatSuspensionInfo(
  suspendedUntil: string | null,
  suspendedEnd?: string | null
): { endDate: string; remaining: string } | null {
  if (!suspendedUntil) return null;
  const now = new Date();
  const until = new Date(suspendedUntil);
  const diffMs = until.getTime() - now.getTime();
  if (diffMs <= 0) return null;

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  const remaining = days > 0 ? `Tersisa ${days} hari ${hours} jam` : `Tersisa ${hours} jam`;
  const endDate = suspendedEnd ?? until.toLocaleDateString('id-ID', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  return { endDate, remaining };
}

export default function AdminUsersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchName, setSearchName] = useState(searchParams.get('name') || '');
  const [filterRole, setFilterRole] = useState(searchParams.get('role') || 'all');
  const [filterStatus, setFilterStatus] = useState(searchParams.get('status') || 'all');

  const [suspendModal, setSuspendModal] = useState<{
    open: boolean;
    user: Record<string, unknown> | null;
  }>({ open: false, user: null });

  const [suspendLoading, setSuspendLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchName) params.set('name', searchName);
    if (filterRole !== 'all') params.set('role', filterRole);
    if (filterStatus !== 'all') params.set('status', filterStatus);
    setSearchParams(params, { replace: true });
  }, [searchName, filterRole, filterStatus, setSearchParams]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await adminService.getUsers();
      setUsers(normalizeList(response));
    } catch {
      setError('Gagal memuat pengguna dari backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSuspend = async (duration: string) => {
    if (!suspendModal.user) return;
    setSuspendLoading(true);
    try {
      await adminService.suspendUser(
        suspendModal.user.id as string | number,
        duration
      );
      setSuspendModal({ open: false, user: null });
      fetchUsers();
    } catch {
      alert('Gagal menyuspend pengguna');
    } finally {
      setSuspendLoading(false);
    }
  };

  const handleUnsuspend = async (userId: string | number) => {
    try {
      await adminService.unsuspendUser(userId);
      fetchUsers();
    } catch {
      alert('Gagal mengaktifkan pengguna');
    }
  };

  const handleDelete = async (userId: string | number) => {
    if (confirm('Yakin ingin menghapus pengguna ini?')) {
      try {
        await adminService.deleteUser(userId);
        fetchUsers();
      } catch {
        alert('Gagal menghapus pengguna');
      }
    }
  };

  const isUserSuspended = (user: Record<string, unknown>): boolean => {
    const until = user.suspended_until as string | null;
    if (!until) return false;
    return new Date(until).getTime() > Date.now();
  };

  const filteredUsers = users.filter((user) => {
    const role = (user.role as string) ?? (user.roles as string) ?? '—';
    const name = (user.name as string) ?? (user.username as string) ?? 'Pengguna';

    const matchesName = name.toLowerCase().includes(searchName.toLowerCase());
    const matchesRole = filterRole === 'all' || role.toLowerCase() === filterRole.toLowerCase();
    
    const suspended = isUserSuspended(user);
    const matchesStatus = filterStatus === 'all' 
      ? true 
      : filterStatus === 'suspended' 
        ? suspended 
        : !suspended;

    return matchesName && matchesRole && matchesStatus;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 relative z-10">
      {/* Header Section */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Manajemen Platform</h1>
        <p className="text-slate-500">Kelola pengguna, verifikasi tutor baru, dan pantau pembayaran dalam satu tempat.</p>
      </div>

      {/* Tabs */}
      <AdminNavigationTabs />

      <Card className="border-0 shadow-sm rounded-3xl overflow-hidden bg-white">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="text-xl font-bold text-slate-800">Manajemen Pengguna</CardTitle>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-9 pr-8 py-2 text-sm text-slate-700 font-medium border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 w-full appearance-none bg-white"
              >
                <option value="all">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            <div className="relative flex-1 sm:flex-initial">
              <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="pl-9 pr-8 py-2 text-sm text-slate-700 font-medium border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 w-full appearance-none bg-white"
              >
                <option value="all">Semua Role</option>
                <option value="learner">Learner</option>
                <option value="tutor">Tutor</option>
              </select>
            </div>
            <div className="relative flex-1 sm:flex-initial">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari pengguna..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm text-slate-700 font-medium placeholder:text-slate-400 placeholder:font-normal border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 w-full sm:w-64"
              />
            </div>
          </div>
        </div>
        <CardContent className="p-6">
          {loading ? <p className="text-sm text-slate-500">Memuat pengguna...</p> : null}
          {error ? <p className="text-sm text-rose-500">{error}</p> : null}
          {!loading && !error && filteredUsers.length === 0 ? (
            <p className="text-sm text-slate-500">Tidak ada pengguna yang cocok dengan filter.</p>
          ) : null}
          {filteredUsers.map((user, index) => {
            const suspended = isUserSuspended(user);
            const suspensionInfo = formatSuspensionInfo(
              user.suspended_until as string | null,
              user.suspended_end as string | undefined
            );
            const userId = (user.id as number | string) || index;
            const role = (user.role as string) ?? (user.roles as string) ?? '—';

            return (
              <div
                key={index}
                className="mt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 first:mt-0 gap-4 transition-colors hover:bg-slate-50/80"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {user.avatar ? (
                    <img 
                      src={user.avatar as string} 
                      alt={(user.name as string) ?? 'User'} 
                      className="w-11 h-11 rounded-full object-cover shrink-0 border border-slate-100 shadow-sm"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center font-bold text-sm shrink-0 border border-slate-100">
                      {((user.name as string) ?? 'Pengguna').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 truncate">
                      {(user.name as string) ?? (user.username as string) ?? 'Pengguna'}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full uppercase tracking-wider bg-slate-200 text-slate-600">
                        {role}
                      </span>
                      {suspended && suspensionInfo && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 flex items-center gap-1">
                          <Clock className="w-3 h-3 shrink-0" />
                          <span>
                            <span className="font-semibold">Suspend hingga {suspensionInfo.endDate}</span>
                            <span className="mx-1">—</span>
                            <span>{suspensionInfo.remaining}</span>
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
                  <Link
                    to={role === 'learner' ? `/admin/learners/${userId}` : `/admin/tutors/${userId}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold btn-glass"
                    title="Lihat Profil"
                  >
                    <Eye className="w-3.5 h-3.5" /> Profil
                  </Link>
                  {suspended ? (
                    <button
                      onClick={() => handleUnsuspend(userId)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold btn-glass-primary"
                      title="Aktifkan Pengguna"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Aktifkan
                    </button>
                  ) : (
                    <button
                      onClick={() => setSuspendModal({ open: true, user })}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold btn-glass"
                      title="Suspend Pengguna"
                    >
                      <Ban className="w-3.5 h-3.5" /> Suspend
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(userId)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold btn-glass-destructive"
                    title="Hapus Pengguna"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Hapus
                  </button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Suspend Modal */}
      {suspendModal.open && suspendModal.user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-800">Suspend Pengguna</h3>
                  <p className="text-sm text-slate-500">
                    {(suspendModal.user.name as string) ?? 'Pengguna'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSuspendModal({ open: false, user: null })}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-3">
              <p className="text-sm text-slate-600 mb-4">
                Pilih durasi suspend untuk pengguna ini:
              </p>
              {SUSPEND_DURATIONS.map((d) => (
                <button
                  key={d.value}
                  onClick={() => handleSuspend(d.value)}
                  disabled={suspendLoading}
                  className="w-full flex items-center justify-between p-4 rounded-2xl btn-glass group disabled:opacity-50 disabled:cursor-not-allowed text-left"
                >
                  <div>
                    <p className="font-semibold text-slate-800 group-hover:text-amber-700 transition-colors">
                      {d.label}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{d.description}</p>
                  </div>
                  <Ban className="w-4 h-4 text-slate-400 group-hover:text-amber-500 transition-colors shrink-0" />
                </button>
              ))}
            </div>

            <div className="p-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSuspendModal({ open: false, user: null })}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
