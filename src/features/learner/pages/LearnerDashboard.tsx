import { useEffect, useState } from 'react';
import { CalendarDays, Clock, Sparkles, TrendingUp, Wallet, CheckCircle, Clock3, BookOpen, Star, Plus, Lightbulb, MessageSquareText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLearnerDashboard } from '@/hooks/useLearnerDashboard';
import { pickValue } from '@/lib/apiData';
import { useAuth } from '@/context/AuthContext';
import { learnerService } from '@/api/services/learnerService';
import { normalizeList } from '@/lib/apiData';
import { Link, useNavigate } from 'react-router-dom';

function formatNumber(value: unknown) {
  if (typeof value === 'number') {
    return value.toLocaleString('id-ID');
  }
  if (typeof value === 'string' && value.trim()) {
    return value;
  }
  return '0';
}

export default function LearnerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data, stats, loading, error } = useLearnerDashboard();
  
  const totalSesi = formatNumber(pickValue(stats, ['total_sessions']));
  const jamBelajar = formatNumber(pickValue(stats, ['total_hours']));
  const mataKuliah = formatNumber(pickValue(stats, ['total_courses']));
  
  const nextClass = pickValue(data, ['next_class']) as Record<string, unknown> | null;
  const recommendedTutors = Array.isArray(pickValue(data, ['recommended_tutors'])) 
    ? (pickValue(data, ['recommended_tutors']) as Array<Record<string, unknown>>) 
    : [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#99F2D1] to-[#B6F3C9] dark:from-[#0c1611] dark:to-[#060b08] border border-white/10 dark:border-brand-500/10 rounded-[24px] p-8 md:p-10 text-white shadow-lg transition-all duration-300">
        <div className="absolute -right-10 -top-10 opacity-30 dark:opacity-40 pointer-events-none">
          <svg width="450" height="450" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="250" cy="150" r="80" className="stroke-white dark:stroke-brand-500" strokeWidth="30" strokeOpacity="0.2"/>
            <circle cx="250" cy="150" r="140" className="stroke-white dark:stroke-brand-500" strokeWidth="20" strokeOpacity="0.15"/>
            <circle cx="250" cy="150" r="200" className="stroke-white dark:stroke-brand-500" strokeWidth="15" strokeOpacity="0.1"/>
            <circle cx="250" cy="150" r="260" className="stroke-white dark:stroke-brand-500" strokeWidth="10" strokeOpacity="0.05"/>
          </svg>
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">
              Selamat Datang Kembali, {user?.name?.split(' ')[0] || 'Nina'}! 👋
            </h1>
            <p className="text-white/90 dark:text-textSecondary text-sm md:text-base max-w-xl">
              Siap untuk melanjutkan petualangan belajarmu hari ini?
            </p>
          </div>
          
          <Link 
            to="/learner/bookings/new"
            className="shrink-0 inline-flex items-center gap-2 btn-glass font-bold px-5 py-2.5 rounded-2xl shadow-sm"
          >
            <Plus className="w-4 h-4" /> Sesi Baru
          </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border border-slate-100 shadow-sm rounded-[24px] p-6 bg-white flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100 text-blue-600">
                <CheckCircle className="w-5 h-5" />
              </div>
              <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">Total Sesi Selesai</p>
            </div>
          </div>
          <div className="flex items-end gap-3">
            <h3 className="text-3xl font-extrabold text-textPrimary">{loading ? '...' : totalSesi || '0'}</h3>
            {totalSesi !== '0' && <span className="bg-emerald-50 text-emerald-600 text-xs font-bold px-2 py-0.5 rounded-md mb-1 border border-emerald-100">+{totalSesi} sesi</span>}
          </div>
        </Card>

        <Card className="border border-slate-100 shadow-sm rounded-[24px] p-6 bg-white flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100 text-emerald-600">
                <Clock className="w-5 h-5" />
              </div>
              <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">Total Jam Belajar</p>
            </div>
          </div>
          <div className="flex items-end gap-3">
            <h3 className="text-3xl font-extrabold text-textPrimary">{loading ? '...' : jamBelajar || '0'} <span className="text-lg font-bold text-slate-500">jam</span></h3>
            {jamBelajar !== '0' && <span className="bg-emerald-50 text-emerald-600 text-xs font-bold px-2 py-0.5 rounded-md mb-1 border border-emerald-100">Aktif</span>}
          </div>
        </Card>

        <Card className="border border-slate-100 shadow-sm rounded-[24px] p-6 bg-white flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center border border-orange-100 text-orange-500">
                <BookOpen className="w-5 h-5" />
              </div>
              <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">Matkul Dipelajari</p>
            </div>
          </div>
          <div className="flex items-end gap-3">
            <h3 className="text-3xl font-extrabold text-textPrimary">{loading ? '...' : mataKuliah || '0'}</h3>
          </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Jadwal + Tips) - Takes 2 cols on large */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-textPrimary">Jadwal Mendatang</h2>
            <Link to="/learner/history" className="text-sm font-bold text-emerald-600 hover:text-emerald-700">Lihat Semua</Link>
          </div>
          
          {loading ? (
            <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 h-48 flex items-center justify-center text-slate-400">Memuat jadwal...</div>
          ) : !nextClass ? (
            <div className="bg-white rounded-[24px] p-8 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center h-56">
              <CalendarDays className="w-10 h-10 text-slate-300 mb-3" />
              <p className="text-slate-500 font-medium mb-1">Tidak ada jadwal terdekat.</p>
              <p className="text-slate-400 text-sm">Yuk pesan sesi baru dan mulai belajar!</p>
            </div>
          ) : (
            <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 hover:border-emerald-200 transition-colors">
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="relative shrink-0">
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100 flex items-center justify-center overflow-hidden font-bold text-xl">
                    {(nextClass.tutor as any)?.avatar ? (
                      <img src={(nextClass.tutor as any).avatar} className="w-full h-full object-cover" alt="Tutor" />
                    ) : (
                      ((nextClass.tutor as any)?.name || 'T').substring(0, 2).toUpperCase()
                    )}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-emerald-100 uppercase tracking-wider">{nextClass.booking_date as string}</span>
                  </div>
                  <h4 className="font-bold text-textPrimary text-base">{(nextClass.course as any)?.name || 'Mata Kuliah'}</h4>
                  <p className="text-sm text-slate-500 font-medium">Bersama {(nextClass.tutor as any)?.user?.name || 'Tutor'}</p>
                </div>
              </div>
              <Link 
                to={`/learner/bookings/${nextClass.id}`}
                className="w-full sm:w-auto btn-glass px-5 py-2.5 rounded-xl font-bold text-sm text-center"
              >
                Rincian Sesi
              </Link>
            </div>
          )}

          {/* 3 Alerts Section */}
          <div className="space-y-3 pt-4">
            <div className="bg-blue-50/50 border border-blue-100/50 rounded-2xl p-4 flex gap-4">
              <div className="mt-0.5">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <span className="text-xs font-bold">i</span>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-bold text-blue-900 mb-1">Informasi Sesi Belajar</h4>
                <p className="text-xs text-blue-800/80 leading-relaxed">
                  Setiap sesi belajar berdurasi <span className="font-bold">50 menit</span>. Anda dapat memesan <span className="font-bold">lebih dari 1 sesi</span> sekaligus untuk memperpanjang waktu belajar bersama tutor secara otomatis.
                </p>
              </div>
            </div>

            <div className="bg-emerald-50/50 border border-emerald-100/50 rounded-2xl p-4 flex gap-4">
              <div className="mt-0.5">
                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <Lightbulb className="w-3.5 h-3.5" />
                </div>
              </div>
              <div>
                <h4 className="text-sm font-bold text-emerald-900 mb-1">Tips Belajar Maksimal</h4>
                <p className="text-xs text-emerald-800/80 leading-relaxed">
                  Pastikan Anda telah <span className="font-bold">menyiapkan materi & pertanyaan</span> sebelum sesi dimulai agar waktu diskusi bersama tutor bisa digunakan secara efisien.
                </p>
              </div>
            </div>

            <div className="bg-orange-50/50 border border-orange-100/50 rounded-2xl p-4 flex gap-4">
              <div className="mt-0.5">
                <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                  <MessageSquareText className="w-3.5 h-3.5" />
                </div>
              </div>
              <div>
                <h4 className="text-sm font-bold text-orange-900 mb-1">Bantu Learner Lain</h4>
                <p className="text-xs text-orange-800/80 leading-relaxed">
                  Jangan lupa untuk <span className="font-bold">meninggalkan ulasan</span> setelah sesi berakhir! Ulasan Anda sangat berharga bagi teman-teman Learner lain untuk menemukan tutor terbaik.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Tutor Rekomendasi) - Takes 1 col */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-textPrimary">Tutor Rekomendasi</h2>
            <div className="w-6 h-6 rounded-md bg-yellow-50 flex items-center justify-center border border-yellow-100">
              <Lightbulb className="w-3.5 h-3.5 text-yellow-600" />
            </div>
          </div>
          
          <div className="space-y-3">
            {loading ? (
              <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 text-center text-sm text-slate-400">Mencari tutor...</div>
            ) : recommendedTutors.length === 0 ? (
              <div className="bg-white rounded-[24px] p-8 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center h-32">
                <p className="text-slate-500 text-sm font-medium">Belum ada tutor rekomendasi</p>
              </div>
            ) : (
              recommendedTutors.map((tutor, i) => (
                <div key={i} className="bg-white rounded-[24px] p-4 shadow-sm border border-slate-100 flex items-center justify-between cursor-pointer hover:border-emerald-200 hover:shadow-md transition-all group" onClick={() => navigate(`/tutors/${tutor.id}`)}>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 flex items-center justify-center overflow-hidden font-bold text-sm shrink-0">
                      {tutor.avatar ? (
                        <img src={tutor.avatar as string} className="w-full h-full object-cover" alt="Tutor" />
                      ) : (
                        ((tutor.name as string) || 'T').substring(0, 2).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-textPrimary text-sm group-hover:text-emerald-700 transition-colors truncate">{(tutor.name as string) || 'Tutor'}</h4>
                      <p className="text-xs text-slate-500 truncate">{(tutor.major as string) || (tutor.taught_courses as any[])?.[0]?.course_name || 'Tutor Umum'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span className="text-xs font-bold text-amber-700">{Number(tutor.rating_avg || tutor.rating || 0).toFixed(1)}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <Link 
            to="/tutors"
            className="block w-full btn-glass border-dashed font-bold px-6 py-3.5 rounded-[20px] text-sm text-center"
          >
            Jelajahi Tutor Lainnya &gt;
          </Link>
        </div>

      </div>
    </div>
  );
}
