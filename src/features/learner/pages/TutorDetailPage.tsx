import { useParams } from 'react-router-dom';
import { CalendarDays, GraduationCap, MessageSquareText, Star, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { learnerService } from '@/api/services/learnerService';

export default function TutorDetailPage() {
  const { id } = useParams();
  const [tutor, setTutor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTutor = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const response = await learnerService.getTutorById(id);
        // The API might return { data: tutor } or just tutor
        setTutor(response.data || response);
      } catch (err) {
        setError('Gagal memuat profil tutor. Mungkin pengguna ini bukan tutor atau data tidak ditemukan.');
      } finally {
        setLoading(false);
      }
    };

    fetchTutor();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  if (error || !tutor) {
    return (
      <Card className="border-rose-200">
        <CardContent className="p-6 text-rose-600 flex flex-col items-center justify-center">
          <p className="font-semibold">{error || 'Data tutor tidak ditemukan'}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profil Tutor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            <div className="rounded-full bg-brand-50 p-4 text-brand-700">
              <GraduationCap className="h-8 w-8" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">{tutor.name || tutor.username}</p>
              <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                <span className="font-medium bg-slate-100 px-2 py-0.5 rounded-md text-slate-700">
                  Semester {tutor.current_semester || tutor.semester || '?'}
                </span>
                <span>•</span>
                <span className="font-medium bg-emerald-50 px-2 py-0.5 rounded-md text-emerald-700">
                  IPK {tutor.ipk || 'N/A'}
                </span>
                <span>•</span>
                <span className="flex items-center text-amber-500 font-medium">
                  <Star className="w-4 h-4 fill-current mr-1" />
                  {tutor.rating || 'Baru'}
                </span>
                <span>•</span>
                <span className="font-medium">
                  Rp{tutor.price_per_session ? tutor.price_per_session.toLocaleString('id-ID') : '0'}/sesi
                </span>
              </div>
            </div>
          </div>
          
          {tutor.bio && (
            <div className="mt-6 text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p className="text-sm">{tutor.bio}</p>
            </div>
          )}

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-[24px] border border-slate-200 p-5">
              <div className="flex items-center gap-2 text-sm font-bold tracking-wide text-slate-700 uppercase mb-3">
                <CalendarDays className="h-4 w-4" /> Slot tersedia
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {tutor.available_slots && tutor.available_slots.length > 0 ? (
                  tutor.available_slots.map((slot: any, idx: number) => (
                    <span key={idx} className="bg-brand-50 text-brand-700 text-xs px-2.5 py-1 rounded-full font-medium">
                      {slot.day_of_week.substring(0, 3)}, {slot.start_time} - {slot.end_time}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 italic">Belum ada slot tersedia.</p>
                )}
              </div>
            </div>
            <div className="rounded-[24px] border border-slate-200 p-5">
              <div className="flex items-center gap-2 text-sm font-bold tracking-wide text-slate-700 uppercase mb-3">
                <MessageSquareText className="h-4 w-4" /> Mata Kuliah
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {tutor.taught_courses && tutor.taught_courses.length > 0 ? (
                  tutor.taught_courses.map((course: any, idx: number) => (
                    <span key={idx} className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-md font-medium border border-slate-200">
                      {course.course_name} ({course.course_code})
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 italic">Belum ada mata kuliah yang diajarkan.</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
