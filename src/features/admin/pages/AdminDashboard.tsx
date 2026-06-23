import { useEffect, useState } from 'react';
import { BarChart3, ShieldCheck, Users, Activity, AlertTriangle, ChevronRight, Star, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { adminService } from '@/api/services/adminService';
import { normalizeRecord, pickValue } from '@/lib/apiData';
import { Link } from 'react-router-dom';

function formatNumber(value: unknown) {
  if (typeof value === 'number') {
    return value.toLocaleString('id-ID');
  }

  if (typeof value === 'string' && value.trim()) {
    return value;
  }

  return '0';
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Record<string, unknown>>({});
  const [activeComplaintsCount, setActiveComplaintsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsResponse, reviewsResponse] = await Promise.all([
          adminService.getStats(),
          adminService.getModerationReviews()
        ]);
        setStats(normalizeRecord(statsResponse));
        
        // Count active complaints (MENUNGGU TINJAUAN or DIPROSES)
        const reviewsArray = reviewsResponse?.data?.reviews || reviewsResponse?.reviews || (Array.isArray(reviewsResponse?.data) ? reviewsResponse.data : []) || [];
        const active = Array.isArray(reviewsArray) ? reviewsArray.filter((r: any) => r.moderation_status !== 'SELESAI') : [];
        setActiveComplaintsCount(active.length);
        
      } catch {
        setError('Gagal memuat data dashboard dari backend.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const totalLearners = formatNumber(pickValue(stats, ['total_learners', 'total_users', 'users_count']));
  const tutorVerified = formatNumber(pickValue(stats, ['verified_tutors', 'total_tutors', 'tutors_count']));
  const complaints = formatNumber(activeComplaintsCount);
  const pendingApplications = formatNumber(pickValue(stats, ['pending_verifications', 'pending_applications', 'tutor_applications', 'applications_count']));

  const aktivitasTerbaru = (stats.aktivitas_terbaru as any[]) || [];
  const topTutors = (stats.top_tutors as any[]) || [];
  const popularCourses = (stats.mata_kuliah_populer as any[]) || [];

  // Calculate total bookings for top 3 courses
  const totalPopularBookings = popularCourses.reduce((sum, course) => sum + (course.bookings || 0), 0);

  const getStatusBadge = (type: string, status: string) => {
    switch(type) {
      case 'application': return <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-md">{status}</span>;
      case 'review': return <span className="px-2 py-1 bg-rose-100 text-rose-700 text-xs font-bold rounded-md">{status}</span>;
      case 'booking': return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-md">{status}</span>;
      default: return <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-md">{status}</span>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header section similar to image */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-yellow-400">Performa dan aktivitas platform hari ini. Kelola ekosistem akademik dengan presisi.</p>
      </div>

      {error && <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100">{error}</div>}

      {/* 3 Top Stat Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-slate-200 shadow-sm rounded-3xl overflow-hidden relative">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div className="bg-brand-50 p-3 rounded-2xl text-brand-600">
                <Users className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs font-bold tracking-wider text-slate-500 dark:text-pink-50 uppercase mb-1">Total Pelajar</p>
            <h3 className="text-4xl font-extrabold text-slate-900 dark:text-white">{loading ? '...' : totalLearners}</h3>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm rounded-3xl overflow-hidden relative">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-600">
                <ShieldCheck className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs font-bold tracking-wider text-slate-500 dark:text-pink-50 uppercase mb-1">Tutor Terdaftar</p>
            <h3 className="text-4xl font-extrabold text-slate-900 dark:text-white">{loading ? '...' : tutorVerified}</h3>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm rounded-3xl overflow-hidden relative">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div className="bg-rose-50 p-3 rounded-2xl text-rose-600">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs font-bold tracking-wider text-slate-500 dark:text-pink-50 uppercase mb-1">Komplain Aktif</p>
            <h3 className="text-4xl font-extrabold text-slate-900 dark:text-white">{loading ? '...' : complaints}</h3>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section - 2 Columns */}
      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* Left Col - Activity & Widgets */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-200 shadow-sm rounded-3xl">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Aktivitas Terbaru</h3>
                <Link to="/admin/activities" className="text-sm font-semibold text-brand-600 hover:text-brand-700">Lihat Semua</Link>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-4 text-xs font-bold text-slate-400 dark:text-pink-100 uppercase tracking-wider pb-3 border-b">
                  <span>Nama Pengguna</span>
                  <span className="col-span-2">Aktivitas</span>
                  <span className="text-right">Status</span>
                </div>
                
                {loading ? (
                   <p className="text-sm text-slate-500 dark:text-pink-50 py-4">Memuat aktivitas...</p>
                ) : aktivitasTerbaru.length === 0 ? (
                  <div className="py-8 text-center text-slate-500 dark:text-pink-50">
                    <Activity className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm">Belum ada aktivitas baru hari ini.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {aktivitasTerbaru.map((activity, idx) => (
                      <div key={idx} className="grid grid-cols-4 items-center text-sm py-2 border-b border-slate-50 last:border-0">
                        <div className="font-semibold text-slate-900 dark:text-white truncate pr-4">{activity.user_name}</div>
                        <div className="col-span-2">
                          <p className="text-slate-800 dark:text-white font-medium truncate">{activity.activity}</p>
                          <p className="text-xs text-slate-400 dark:text-pink-100">{activity.time_formatted}</p>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(activity.type, activity.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top Tutors & Popular Courses Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-slate-200 shadow-sm rounded-3xl">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Performa Tutor Terbaik</h3>
                {loading ? (
                   <p className="text-sm text-slate-500 dark:text-pink-50">Memuat data...</p>
                ) : topTutors.length === 0 ? (
                   <p className="text-sm text-slate-500 dark:text-pink-50">Belum ada data tutor.</p>
                ) : (
                  <div className="space-y-5">
                    {topTutors.map((tutor, idx) => {
                      const names = tutor.name?.split(' ') || ['N', 'A'];
                      const initials = names.length > 1 
                        ? `${names[0][0]}${names[names.length-1][0]}`.toUpperCase()
                        : names[0].substring(0, 2).toUpperCase();

                      return (
                        <div key={idx} className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              {tutor.avatar ? (
                                <img
                                  src={tutor.avatar as string}
                                  alt={tutor.name}
                                  className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-100 dark:border-brand-500/20 shadow-sm"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-sm">
                                  {initials}
                                </div>
                              )}
                              <div className="absolute -top-2 -right-2 bg-white rounded-full p-0.5 shadow-sm">
                                <div className="bg-amber-100 text-amber-600 rounded-full flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold border border-white">
                                  <Star className="w-3 h-3 mr-0.5 fill-amber-500 text-amber-500" />
                                  {tutor.rating}
                                </div>
                              </div>
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white text-sm truncate max-w-[120px]">{tutor.name}</p>
                              <p className="text-xs text-slate-500 dark:text-pink-50 font-medium">({tutor.sessions} Sesi Selesai)</p>
                            </div>
                          </div>
                          <div className="flex flex-col items-center">
                            <Award className="w-6 h-6 text-amber-400 mb-1" />
                            <span className="text-[9px] font-bold text-amber-500 uppercase tracking-wider">Top Tutor</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm rounded-3xl">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Mata Kuliah Populer</h3>
                {loading ? (
                   <p className="text-sm text-slate-500 dark:text-pink-50">Memuat data...</p>
                ) : popularCourses.length === 0 ? (
                   <p className="text-sm text-slate-500 dark:text-pink-50">Belum ada pesanan.</p>
                ) : (
                  <div className="space-y-6">
                    {popularCourses.map((course, idx) => {
                      const percentage = totalPopularBookings > 0 
                        ? Math.round((course.bookings / totalPopularBookings) * 100) 
                        : 0;
                      
                      const barColors = ['bg-brand-800', 'bg-emerald-500', 'bg-amber-500'];
                      const barColor = barColors[idx % barColors.length];

                      return (
                        <div key={idx}>
                          <div className="flex justify-between items-end mb-2">
                            <p className="font-bold text-slate-900 dark:text-white text-sm truncate max-w-[160px]">{course.name}</p>
                            <p className="text-xs font-bold text-brand-600">{percentage}% Peminat</p>
                          </div>
                          <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full ${barColor} rounded-full`} style={{ width: `${percentage}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Col - Quick Actions & Alerts */}
        <div className="space-y-6">
          <Card className="border-brand-200 shadow-sm rounded-3xl overflow-hidden border-l-4 border-l-brand-600">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Verifikasi Tutor</h3>
                <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded-md">{loading ? '-' : pendingApplications}</span>
              </div>
              <p className="text-sm text-slate-500 dark:text-pink-50 mb-5">Pengajuan verifikasi dokumen tutor tertunda.</p>
              <Link to="/admin/applications" className="block text-center w-full btn-glass font-semibold py-2.5 rounded-xl">
                Lihat Detail
              </Link>
            </CardContent>
          </Card>

          <Card className="border-rose-200 shadow-sm rounded-3xl overflow-hidden border-l-4 border-l-rose-500">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Komplain Baru</h3>
                <span className="bg-rose-100 text-rose-600 text-xs font-bold px-2 py-1 rounded-md">{loading ? '-' : complaints}</span>
              </div>
              <p className="text-sm text-slate-500 dark:text-pink-50 mb-5">Butuh tanggapan admin segera.</p>
              <Link to="/admin/complaints" className="block text-center w-full btn-glass-destructive font-semibold py-2.5 rounded-xl">
                Lihat Detail
              </Link>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
