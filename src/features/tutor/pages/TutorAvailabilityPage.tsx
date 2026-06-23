import { useEffect, useState } from 'react';
import { Plus, Info, Clock, ChevronDown, Loader2, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { tutorService } from '@/api/services/tutorService';
import { publicService } from '@/api/services/publicService';

type ScheduleRow = {
  id: string | number;
  no: string;
  day: string;
  time: string;
  status: 'AVAILABLE' | 'BOOKED' | 'NON AVAILABLE';
};

export default function TutorAvailabilityPage() {
  const [loading, setLoading] = useState(true);
  const [schedules, setSchedules] = useState<ScheduleRow[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasPhone, setHasPhone] = useState(true);

  // Form dropdown options
  const [masterSlots, setMasterSlots] = useState<any[]>([]);
  const [approvedCourses, setApprovedCourses] = useState<any[]>([]);

  // Filters state
  const [selectedDayFilter, setSelectedDayFilter] = useState('Semua Hari');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('Semua Status');

  // Form state for Modal
  const [formDay, setFormDay] = useState('Senin');
  const [formTime, setFormTime] = useState('');
  const [formStatus, setFormStatus] = useState('Available');

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const response = await tutorService.getAvailability();
        const data = response?.data || response || [];
        
        // Map data from API
        if (Array.isArray(data)) {
          setSchedules(data.map((item: any, idx: number) => ({
            id: item.id || idx + 1,
            no: String(idx + 1).padStart(2, '0'),
            day: item.day || 'Senin',
            time: item.time || '00.00 - 00.00',
            status: item.status || 'AVAILABLE'
          })));
        } else {
          setSchedules([]);
        }
      } catch (error) {
        console.error('Failed to fetch availability');
      }
    };

    const fetchDropdownData = async () => {
      try {
        const [slotsRes, profileRes] = await Promise.all([
          publicService.getMasterSlots(),
          tutorService.getProfile()
        ]);
        
        const slotsData = slotsRes?.data || slotsRes || [];
        setMasterSlots(Array.isArray(slotsData) ? slotsData : []);
        if (slotsData.length > 0) {
          const firstSlot = slotsData[0];
          setFormTime(`${firstSlot.start_time.slice(0, 5)} - ${firstSlot.end_time.slice(0, 5)}`);
        }

        const profileData = profileRes?.data || profileRes || {};
        const taughtCourses = profileData.taught_courses || [];
        setApprovedCourses(taughtCourses);
        
        if (!profileData.phone) {
          setHasPhone(false);
        }
      } catch (error) {
        console.error('Failed to fetch dropdown data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
    fetchDropdownData();
  }, []);

  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();

    // Guard: masterSlots must be loaded before we can build a valid payload
    if (masterSlots.length === 0) {
      alert('Data jam belajar belum tersedia. Coba refresh halaman.');
      return;
    }

    setSaving(true);
    try {
      const dayMapRev: Record<string, string> = {
        'Senin': 'Monday',
        'Selasa': 'Tuesday',
        'Rabu': 'Wednesday',
        'Kamis': 'Thursday',
        'Jumat': 'Friday',
        'Sabtu': 'Saturday',
        'Minggu': 'Sunday'
      };

      const existingIndex = schedules.findIndex(s => s.day === formDay && s.time === formTime);
      let newSchedules = [...schedules];
      
      if (existingIndex >= 0) {
        newSchedules[existingIndex] = {
          ...newSchedules[existingIndex],
          status: formStatus as any
        };
      } else {
        newSchedules.push({
          id: schedules.length + 1,
          no: String(schedules.length + 1).padStart(2, '0'),
          day: formDay,
          time: formTime,
          status: formStatus as any
        });
      }

      // Normalize time format: API returns '07:00:00', display uses '07:00 - 07:50'
      const normalizeTime = (t: string) => t.slice(0, 5);
      const payloadSlots = newSchedules.map(s => {
        const [startDisp, endDisp] = s.time.split(' - ');
        const slotMatch = masterSlots.find(m =>
          normalizeTime(m.start_time) === normalizeTime(startDisp || '') &&
          normalizeTime(m.end_time) === normalizeTime(endDisp || '')
        );
        return {
          day_of_week: dayMapRev[s.day] || s.day,
          master_slot_id: slotMatch?.id as number | undefined,
          is_active: s.status.toUpperCase() !== 'NON AVAILABLE'
        };
      }).filter((s): s is { day_of_week: string; master_slot_id: number; is_active: boolean } =>
        s.master_slot_id !== undefined
      );

      // Guard: abort if all slots failed to match — prevents silent data wipe
      if (payloadSlots.length === 0) {
        alert('Gagal membangun jadwal: data jam tidak cocok. Coba refresh halaman dan ulangi.');
        return;
      }

      await tutorService.setAvailability({ slots: payloadSlots });
      
      setSchedules(newSchedules);
      
      alert('Jadwal berhasil disimpan!');
      setIsEditModalOpen(false);
    } catch (error: any) {
      console.error('Save error:', error.response?.data || error);
      alert('Gagal menyimpan jadwal: ' + (error.response?.data?.message || 'Kesalahan server.'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSchedule = async (scheduleToDelete: ScheduleRow) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus jadwal pada hari ${scheduleToDelete.day} pukul ${scheduleToDelete.time}?`)) {
      return;
    }

    setSaving(true);
    try {
      const newSchedules = schedules.filter(s => !(s.day === scheduleToDelete.day && s.time === scheduleToDelete.time));
      
      const dayMapRev: Record<string, string> = {
        'Senin': 'Monday',
        'Selasa': 'Tuesday',
        'Rabu': 'Wednesday',
        'Kamis': 'Thursday',
        'Jumat': 'Friday',
        'Sabtu': 'Saturday',
        'Minggu': 'Sunday'
      };

      // Normalize time format: same fix as handleSaveSchedule
      const normalizeTime = (t: string) => t.slice(0, 5);
      const payloadSlots = newSchedules.map(s => {
        const [startDisp, endDisp] = s.time.split(' - ');
        const slotMatch = masterSlots.find(m =>
          normalizeTime(m.start_time) === normalizeTime(startDisp || '') &&
          normalizeTime(m.end_time) === normalizeTime(endDisp || '')
        );
        return {
          day_of_week: dayMapRev[s.day] || s.day,
          master_slot_id: slotMatch?.id as number | undefined,
          is_active: s.status.toUpperCase() !== 'NON AVAILABLE'
        };
      }).filter((s): s is { day_of_week: string; master_slot_id: number; is_active: boolean } =>
        s.master_slot_id !== undefined
      );

      // If remaining schedules exist but none matched, abort to avoid silent wipe
      if (newSchedules.length > 0 && payloadSlots.length === 0) {
        alert('Gagal menghapus: data jam tidak cocok. Coba refresh halaman dan ulangi.');
        return;
      }

      await tutorService.setAvailability({ slots: payloadSlots });
      
      setSchedules(newSchedules);
      alert('Jadwal berhasil dihapus!');
    } catch (error: any) {
      console.error('Delete error:', error.response?.data || error);
      alert('Gagal menghapus jadwal: ' + (error.response?.data?.message || 'Kesalahan server.'));
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const upperStatus = status.toUpperCase();
    switch (upperStatus) {
      case 'AVAILABLE':
        return <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase bg-[#fff3e0] text-[#f57c00]">AVAILABLE</span>;
      case 'BOOKED':
        return <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase bg-[#e8f5e9] text-[#2e7d32]">BOOKED</span>;
      case 'NON AVAILABLE':
      default:
        return <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase bg-slate-100 text-slate-500">NON AVAILABLE</span>;
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-brand-600" /></div>;
  }

  return (
    <div className="max-w-5xl mx-auto pb-12 relative z-10">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[#0a192f] mb-2 dark:text-white">Pengaturan Jadwal</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Atur ketersediaan jadwalmu mengajar.</p>
      </div>

      {/* Edit Jadwal Button */}
      {!hasPhone ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-8 flex flex-col sm:flex-row items-center gap-4 justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-red-900 font-bold text-sm mb-0.5">Nomor Telepon Belum Diisi</h3>
              <p className="text-red-700 text-xs">Anda wajib melengkapi nomor telepon di profil Anda sebelum dapat mengatur jadwal.</p>
            </div>
          </div>
          <Link to="/tutor/profile" className="shrink-0 px-5 py-2.5 btn-glass-destructive font-bold text-xs rounded-xl text-center w-full sm:w-auto">
            Lengkapi Profil
          </Link>
        </div>
      ) : (
        <button 
          onClick={() => setIsEditModalOpen(true)}
          className="btn-glass-primary px-6 py-3 rounded-xl font-bold flex items-center gap-2 mb-8 shadow-md"
        >
          <Plus className="w-5 h-5" /> Edit Jadwal
        </button>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
        <div className="w-full sm:w-48">
          <label className="block text-[10px] font-extrabold tracking-widest text-slate-400 uppercase mb-2 ml-1">PILIH HARI</label>
          <div className="relative">
            <select 
              value={selectedDayFilter}
              onChange={(e) => setSelectedDayFilter(e.target.value)}
              className="w-full appearance-none bg-slate-50/50 border border-slate-200 text-slate-800 font-semibold text-sm rounded-xl px-4 py-3 outline-none focus:border-brand-500 dark:bg-bgSecondary dark:border-borderColor dark:text-textPrimary cursor-pointer"
            >
              <option value="Semua Hari">Semua Hari</option>
              <option value="Senin">Senin</option>
              <option value="Selasa">Selasa</option>
              <option value="Rabu">Rabu</option>
              <option value="Kamis">Kamis</option>
              <option value="Jumat">Jumat</option>
              <option value="Sabtu">Sabtu</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
        
        <div className="w-full sm:w-48">
          <label className="block text-[10px] font-extrabold tracking-widest text-slate-400 uppercase mb-2 ml-1">STATUS</label>
          <div className="relative">
            <select 
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="w-full appearance-none bg-slate-50/50 border border-slate-200 text-slate-800 font-semibold text-sm rounded-xl px-4 py-3 outline-none focus:border-brand-500 dark:bg-bgSecondary dark:border-borderColor dark:text-textPrimary cursor-pointer"
            >
              <option value="Semua Status">Semua Status</option>
              <option value="Available">Available</option>
              <option value="Booked">Booked</option>
              <option value="Non Available">Non Available</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-bgSecondary rounded-2xl border border-slate-200 dark:border-borderColor overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-100 dark:border-borderColor/50">
                <th className="py-5 px-6 text-[10px] font-extrabold tracking-widest text-slate-400 uppercase w-20">NO</th>
                <th className="py-5 px-6 text-[10px] font-extrabold tracking-widest text-slate-400 uppercase w-32">HARI</th>
                <th className="py-5 px-6 text-[10px] font-extrabold tracking-widest text-slate-400 uppercase">WAKTU OPERASIONAL</th>
                <th className="py-5 px-6 text-[10px] font-extrabold tracking-widest text-slate-400 uppercase text-center w-32">STATUS</th>
                <th className="py-5 px-6 text-[10px] font-extrabold tracking-widest text-slate-400 uppercase text-right w-20">AKSI</th>
              </tr>
            </thead>
            <tbody>
              {schedules.filter(row => {
                const matchDay = selectedDayFilter === 'Semua Hari' || row.day === selectedDayFilter;
                const matchStatus = selectedStatusFilter === 'Semua Status' || row.status.toUpperCase() === selectedStatusFilter.toUpperCase();
                return matchDay && matchStatus;
              }).map((row, index) => (
                <tr key={index} className="border-b border-slate-50 dark:border-borderColor/20 hover:bg-slate-50/50 dark:hover:bg-bgPrimary/50 transition-colors">
                  <td className="py-4 px-6 text-sm font-bold text-slate-300 dark:text-slate-600">{row.no}</td>
                  <td className="py-4 px-6 text-sm font-bold text-[#0a192f] dark:text-white">{row.day}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      <Clock className="w-4 h-4" />
                      {row.time}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center">
                    {getStatusBadge(row.status)}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button 
                      onClick={() => handleDeleteSchedule(row)}
                      disabled={saving || !hasPhone}
                      className="p-2 btn-glass-destructive rounded-lg disabled:opacity-50"
                      title={!hasPhone ? "Lengkapi nomor telepon di profil untuk menghapus jadwal" : "Hapus Jadwal"}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Jadwal Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-bgSecondary w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-[#0a192f] dark:text-white mb-1">Edit Jadwal</h2>
                  <p className="text-sm text-slate-500 font-medium">Tentukan waktu ketersediaan mengajar Anda.</p>
                </div>
                <button 
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
              </div>
              
              <form onSubmit={handleSaveSchedule} className="space-y-6">
                
                {/* Pilih Hari */}
                <div>
                  <label className="block text-[11px] font-extrabold tracking-widest text-slate-500 uppercase mb-2 ml-1">PILIH HARI</label>
                  <div className="relative">
                    <select 
                      value={formDay}
                      onChange={(e) => setFormDay(e.target.value)}
                      className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-800 font-medium text-sm rounded-xl px-4 py-3.5 outline-none focus:border-brand-500 dark:bg-bgPrimary dark:border-borderColor dark:text-textPrimary cursor-pointer"
                    >
                      <option value="Senin">Senin</option>
                      <option value="Selasa">Selasa</option>
                      <option value="Rabu">Rabu</option>
                      <option value="Kamis">Kamis</option>
                      <option value="Jumat">Jumat</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* Pilih Jam */}
                <div>
                  <label className="block text-[11px] font-extrabold tracking-widest text-slate-500 uppercase mb-2 ml-1">PILIH JAM</label>
                  <div className="relative">
                    <select 
                      value={formTime}
                      onChange={(e) => setFormTime(e.target.value)}
                      className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-800 font-medium text-sm rounded-xl px-4 py-3.5 outline-none focus:border-brand-500 dark:bg-bgPrimary dark:border-borderColor dark:text-textPrimary cursor-pointer"
                    >
                      {masterSlots.map((slot) => {
                        const timeString = `${slot.start_time.slice(0, 5)} - ${slot.end_time.slice(0, 5)}`;
                        return (
                          <option key={slot.id} value={timeString}>
                            {timeString}
                          </option>
                        );
                      })}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* Pilih Status */}
                <div>
                  <label className="block text-[11px] font-extrabold tracking-widest text-slate-500 uppercase mb-2 ml-1">PILIH STATUS</label>
                  <div className="relative">
                    <select 
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value)}
                      className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-800 font-medium text-sm rounded-xl px-4 py-3.5 outline-none focus:border-brand-500 dark:bg-bgPrimary dark:border-borderColor dark:text-textPrimary cursor-pointer"
                    >
                      <option value="Available">Available</option>
                      <option value="Non Available">Non Available</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* Info Alert */}
                <div className="flex gap-3 bg-[#fff3e0] text-[#e65100] p-4 rounded-xl items-start">
                  <div className="shrink-0 mt-0.5"><Info className="w-5 h-5 fill-[#e65100] text-[#fff3e0]" /></div>
                  <p className="text-xs font-semibold leading-relaxed">
                    Pastikan waktu yang Anda pilih tidak bertabrakan dengan jadwal yang sudah ada untuk menjaga kualitas sesi pembelajaran.
                  </p>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-2 pt-6">
                  <button 
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-colors text-sm dark:hover:bg-bgPrimary"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    disabled={saving || masterSlots.length === 0}
                    title={masterSlots.length === 0 ? 'Data jam belajar belum tersedia' : undefined}
                    className="px-6 py-3 rounded-xl font-bold btn-glass-primary shadow-sm text-sm disabled:opacity-50 flex items-center gap-2"
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    {saving ? 'Menyimpan...' : 'Simpan Jadwal'}
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
