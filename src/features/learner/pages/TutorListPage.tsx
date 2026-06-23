import { Search, Loader2, Star, Award, UserCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';
import { learnerService } from '@/api/services/learnerService';
import { publicService } from '@/api/services/publicService';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BookingModal } from '../components/BookingModal';

export default function TutorListPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [tutors, setTutors] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [masterSlots, setMasterSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTutor, setSelectedTutor] = useState<any>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const filteredTutors = tutors.filter((tutor) => {
    const matchesSearch = searchQuery === '' || 
      tutor.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCourse = selectedCourse === '' ||
      (tutor.taught_courses && tutor.taught_courses.some((c: any) => c.course_id?.toString() === selectedCourse || c.course_name === selectedCourse));

    const matchesDay = selectedDay === '' || 
      (tutor.available_slots && tutor.available_slots.some((s: any) => (s.day_of_week || '').toLowerCase() === selectedDay));

    const matchesTime = selectedTime === '' ||
      (tutor.available_slots && tutor.available_slots.some((s: any) => (s.start_time || '').startsWith(selectedTime)));

    return matchesSearch && matchesCourse && matchesDay && matchesTime;
  });

  const handleOpenBookingModal = (tutor: any) => {
    setSelectedTutor(tutor);
    setIsBookingModalOpen(true);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tutorsRes, coursesRes, slotsRes] = await Promise.all([
          learnerService.getTutors(),
          publicService.getCourses(),
          publicService.getMasterSlots()
        ]);
        setTutors(tutorsRes.data || []);
        setCourses(coursesRes.data || []);
        setMasterSlots(slotsRes.data || []);
      } catch (error) {
        console.error('Failed to fetch data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (location.state?.autoBook && location.state?.prefilledBooking && tutors.length > 0) {
      const bookingData = location.state.prefilledBooking;
      const targetTutor = tutors.find(t => t.id === bookingData.tutor?.id || t.id === bookingData.tutor_id);
      if (targetTutor) {
        setSelectedTutor(targetTutor);
        setIsBookingModalOpen(true);
      }
    }
  }, [location.state, tutors]);

  return (
    <div className="space-y-6">
      <Card className="border-slate-100 shadow-sm rounded-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-slate-800">Cari Tutor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <Input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-emerald-500 h-11" 
                placeholder="Cari nama tutor..." 
              />
            </div>
            <select 
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="rounded-xl bg-slate-50 border border-slate-200 focus:ring-emerald-500 h-11 px-4 text-sm text-slate-700 outline-none max-w-[200px]"
            >
              <option value="">Semua Mata Kuliah</option>
              {courses.map((course: any) => (
                <option key={course.id} value={course.name}>{course.name}</option>
              ))}
            </select>
            <select 
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="rounded-xl bg-slate-50 border border-slate-200 focus:ring-emerald-500 h-11 px-4 text-sm text-slate-700 outline-none"
            >
              <option value="">Semua Hari</option>
              <option value="monday">Senin</option>
              <option value="tuesday">Selasa</option>
              <option value="wednesday">Rabu</option>
              <option value="thursday">Kamis</option>
              <option value="friday">Jumat</option>
              <option value="saturday">Sabtu</option>
              <option value="sunday">Minggu</option>
            </select>
            <select 
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="rounded-xl bg-slate-50 border border-slate-200 focus:ring-emerald-500 h-11 px-4 text-sm text-slate-700 outline-none"
            >
              <option value="">Semua Jam</option>
              {masterSlots.map((slot: any) => {
                const timeStr = slot.start_time ? slot.start_time.substring(0, 5) : '';
                return timeStr ? <option key={slot.id} value={timeStr}>{timeStr}</option> : null;
              })}
            </select>
            {(searchQuery || selectedCourse || selectedDay || selectedTime) && (
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCourse('');
                  setSelectedDay('');
                  setSelectedTime('');
                }}
                className="rounded-xl btn-glass-destructive px-6 py-2 text-sm font-bold shadow-sm"
              >
                Reset
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredTutors.map((tutor) => (
            <Card key={tutor.id} className="flex flex-col hover:border-emerald-200 transition-all shadow-sm hover:shadow-md rounded-[24px] overflow-hidden border-slate-100">
              <CardContent className="p-5 flex flex-col flex-1">
                {/* Header: Avatar + Rating + Top Tutor Badge */}
                <div className="flex justify-between items-start mb-4">
                  <div className="relative">
                    {tutor.avatar ? (
                      <img src={tutor.avatar} alt={tutor.name} className="w-20 h-20 rounded-2xl object-cover border border-slate-100 shadow-sm" />
                    ) : (
                      <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center border border-slate-200 shadow-sm">
                        <UserCircle className="w-10 h-10 text-slate-400" />
                      </div>
                    )}
                    <div className="absolute -top-2 -right-3 bg-slate-800 text-white rounded-full px-2 py-0.5 text-[11px] font-bold flex items-center shadow-sm">
                      <Star className="w-3 h-3 text-amber-400 mr-1 fill-current" />
                      {tutor.rating_avg || 'Baru'}
                    </div>
                  </div>
                  
                  {/* Top Tutor Indicator (Optional logic, we display for tutors with good rating or just static as per design if rating >= 4.5) */}
                  {(!tutor.rating_avg || parseFloat(tutor.rating_avg) >= 4.5) && (
                    <div className="flex flex-col items-center">
                      <div className="bg-amber-100 text-amber-500 p-1.5 rounded-lg mb-1 shadow-sm border border-amber-200">
                        <Award className="w-5 h-5" />
                      </div>
                      <span className="text-[9px] font-extrabold text-amber-500 uppercase tracking-widest">Top Tutor</span>
                    </div>
                  )}
                </div>

                {/* Name, Bio, & Price */}
                <div className="mb-3 flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[17px] font-bold text-slate-800 mb-0.5 truncate">{tutor.name}</h3>
                    <p className="text-[13px] text-slate-500 truncate">
                      {tutor.bio || `Semester ${tutor.current_semester || '?'}`}
                    </p>
                  </div>
                  <div className="text-right shrink-0 pl-2">
                    <p className="text-[15px] font-black text-emerald-600">
                      Rp{tutor.price ? tutor.price.toLocaleString('id-ID') : tutor.price_per_session ? tutor.price_per_session.toLocaleString('id-ID') : '0'}
                    </p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">/ Sesi</p>
                  </div>
                </div>

                {/* Subjects Badges */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {tutor.taught_courses && tutor.taught_courses.length > 0 ? (
                    tutor.taught_courses.slice(0, 4).map((c: any, i: number) => (
                      <span key={i} className="px-2 py-1 bg-indigo-50 text-indigo-600 text-[9px] font-bold rounded-md uppercase tracking-wider">
                        {c.course_name}
                      </span>
                    ))
                  ) : (
                    <span className="text-[11px] italic text-slate-400">Belum ada mata kuliah</span>
                  )}
                </div>
                
                {/* Available Schedule */}
                <div className="mb-5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Jadwal Tersedia</p>
                  
                  {/* Hari */}
                  <div className="flex gap-1 mb-2.5">
                    {[
                      { id: 'monday', label: 'Sn', full: 'Senin' },
                      { id: 'tuesday', label: 'Sl', full: 'Selasa' },
                      { id: 'wednesday', label: 'Rb', full: 'Rabu' },
                      { id: 'thursday', label: 'Km', full: 'Kamis' },
                      { id: 'friday', label: 'Jm', full: 'Jumat' },
                      { id: 'saturday', label: 'Sb', full: 'Sabtu' },
                      { id: 'sunday', label: 'Mg', full: 'Minggu' }
                    ].map(day => {
                      const isAvailable = new Set(tutor.available_slots?.map((s: any) => (s.day_of_week || '').toLowerCase())).has(day.id);
                      return (
                        <div 
                          key={day.id} 
                          title={day.full}
                          className={`flex-1 aspect-square rounded-[8px] flex items-center justify-center text-[10px] font-bold transition-all cursor-default ${
                            isAvailable 
                              ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/20' 
                              : 'bg-slate-50 border border-slate-100 text-slate-300'
                          }`}
                        >
                          {day.label}
                        </div>
                      );
                    })}
                  </div>

                  {/* Jam (Preview) */}
                  <div className="flex flex-wrap gap-1.5">
                    {tutor.available_slots && tutor.available_slots.length > 0 ? (
                      Array.from(new Set(tutor.available_slots.map((s: any) => s.start_time))).slice(0, 4).map((time: any, idx: number) => (
                        <span key={idx} className="bg-slate-100 border border-slate-200 text-slate-500 text-[10px] px-2 py-1 rounded-md font-bold flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5 text-slate-400" /> {time}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] italic text-slate-400">Belum ada jam operasional.</span>
                    )}
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="mt-auto grid grid-cols-2 gap-2 pt-2">
                  <button 
                    onClick={() => handleOpenBookingModal(tutor)}
                    className="btn-glass-primary text-[13px] font-bold py-2.5 rounded-xl shadow-sm"
                  >
                    Pesan Sesi
                  </button>
                  <Link 
                    to={`/tutors/${tutor.id}`}
                    className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-100 text-[13px] font-bold py-2.5 rounded-xl text-center transition-colors flex justify-center items-center"
                  >
                    Lihat Profil
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
          {filteredTutors.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-3xl border border-slate-100">
              Belum ada tutor yang cocok dengan kriteria pencarian Anda.
            </div>
          )}
        </div>
      )}

      <BookingModal 
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false);
          if (location.state?.autoBook) {
            navigate(location.pathname, { replace: true, state: {} });
          }
        }}
        tutor={selectedTutor}
        prefilledBooking={location.state?.prefilledBooking}
      />
    </div>
  );
}
