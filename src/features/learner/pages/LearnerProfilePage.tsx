import { useEffect, useState, useRef, type FormEvent } from 'react';
import { Building2, FileText, Pencil, CalendarDays, History, ArrowLeft, GraduationCap, Check, X } from 'lucide-react';
import { formatNIM } from '@/lib/nimHelper';
import { Card } from '@/components/ui/card';
import { learnerService } from '@/api/services/learnerService';
import { adminService } from '@/api/services/adminService';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth, hasRole } from '@/context/AuthContext';

type ProfileFormState = {
  name: string;
  email: string;
  nim: string;
  phone: string;
  avatar: string;
  major?: string;
  faculty?: string;
  university?: string;
};

const emptyProfile: ProfileFormState = {
  name: '',
  email: '',
  nim: '',
  phone: '',
  avatar: '',
  major: 'Teknik Informatika', // Mock data as requested
  faculty: 'Ilmu Komputer', // Mock data as requested
  university: 'Universitas Dian Nuswantoro', // Mock data as requested
};

export default function LearnerProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdminView = !!id;
  const [profile, setProfile] = useState<ProfileFormState>(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        let response;
        if (isAdminView) {
          response = await adminService.getUserById(id);
        } else {
          response = await learnerService.getProfile();
        }
        
        const payload = response?.data ?? response;
        const profileData = payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : {};

        setProfile((prev) => ({
          ...prev,
          name: (profileData.name as string) || (profileData.username as string) || '',
          email: (profileData.email as string) ?? '',
          nim: (profileData.nim as string) ?? '',
          phone: (profileData.phone as string) ?? '',
          avatar: (profileData.avatar as string) ?? '',
        }));
      } catch {
        console.error('Gagal memuat data profil');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id, isAdminView]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isAdminView) return;
    
    setSaving(true);
    try {
      const payload = new FormData();
      payload.append('name', profile.name);
      payload.append('nim', profile.nim);
      payload.append('phone', profile.phone);
      
      if (fileInputRef.current?.files?.[0]) {
        payload.append('avatar', fileInputRef.current.files[0]);
      }
      
      const response = await learnerService.updateProfile(payload);
      const updatedData = response?.data ?? response;
      
      setProfile(prev => ({
        ...prev,
        avatar: (updatedData?.avatar as string) || prev.avatar
      }));
      setAvatarPreview(null);
      
      setToast({ message: 'Profil berhasil diperbarui!', type: 'success' });
      setIsEditModalOpen(false);
    } catch (err: any) {
      console.error('Update Profile Error:', err);
      const msg = err.response?.data?.message || err.message || 'Error tidak diketahui';
      setToast({ message: 'Gagal memperbarui profil: ' + msg, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-textSecondary">Memuat profil...</div>;
  }

  const userName = profile.name || 'Budi Santoso';
  const displayAvatar = avatarPreview || profile.avatar || '';

  const renderAvatar = (sizeClasses: string, textClasses: string) => {
    if (displayAvatar) {
      return <img src={displayAvatar} alt="Profile" className="w-full h-full object-cover" />;
    }
    return (
      <div className={`flex w-full h-full items-center justify-center bg-brand-100 text-brand-700 font-black tracking-tight ${textClasses}`}>
        {userName.substring(0, 2).toUpperCase()}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 relative z-10">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-[100] animate-in fade-in slide-in-from-top-4 duration-300">
          <div className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border bg-white ${
            toast.type === 'success' ? 'border-brand-200' : 'border-rose-200'
          }`}>
            {toast.type === 'success' ? (
              <div className="bg-brand-100 text-brand-600 rounded-full p-1.5">
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
            ) : (
              <div className="bg-rose-100 text-rose-600 rounded-full p-1.5">
                <X className="w-4 h-4 stroke-[3]" />
              </div>
            )}
            <p className="text-sm font-bold text-slate-800">{toast.message}</p>
          </div>
        </div>
      )}
      
      {/* Top Profile Header */}
      <div className="bg-bgSecondary/90 backdrop-blur-xl border border-borderColor rounded-[36px] p-6 md:p-8 shadow-sm flex flex-col md:flex-row gap-6 items-start justify-between">
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start w-full text-center md:text-left">
          <div className="relative shrink-0">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-[32px] overflow-hidden bg-bgSecondary border-4 border-bgSecondary shadow-lg">
              {renderAvatar('w-32 h-32 md:w-40 md:h-40', 'text-4xl md:text-5xl')}
            </div>
            {!isAdminView && (
              <>
                <button 
                  onClick={() => setIsEditModalOpen(true)}
                  className="absolute bottom-2 right-2 btn-glass-primary p-2.5 rounded-2xl shadow-lg"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />
              </>
            )}
          </div>
          
          <div className="pt-2">
            <h1 className="text-3xl md:text-4xl font-extrabold text-textPrimary tracking-tight mb-2">
              {profile.name || 'Budi Santoso'}
            </h1>
            <div className="flex items-center justify-center md:justify-start text-textSecondary font-medium">
              <Building2 className="w-4 h-4 mr-2 text-brand-500" />
              {profile.university}
            </div>
          </div>
        </div>

        {/* Action Buttons (Hidden for Admin View) */}
        {!isAdminView && (
          <div className="flex flex-col gap-3 pt-4 md:pt-2 w-full md:w-auto">
            <Link 
              to="/learner/bookings"
              className="flex items-center justify-center gap-2 btn-glass-primary px-5 py-3 rounded-2xl text-sm font-bold shadow-sm"
            >
              <CalendarDays className="w-4 h-4" /> Lihat Jadwal Belajar
            </Link>
            <Link 
              to="/learner/history"
              className="flex items-center justify-center gap-2 btn-glass px-5 py-3 rounded-2xl text-sm font-bold shadow-sm"
            >
              <History className="w-4 h-4" /> Lihat Riwayat Belajar
            </Link>
            {hasRole(user, 'tutor') && (
              <Link 
                to="/tutor"
                className="flex items-center justify-center gap-2 btn-glass px-5 py-3 rounded-2xl text-sm font-bold shadow-sm mt-1"
              >
                <GraduationCap className="w-4 h-4" /> Beralih ke Panel Tutor
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Informasi Pribadi Display */}
      <Card className="border-borderColor bg-bgSecondary shadow-sm rounded-[32px] overflow-hidden mt-6">
        <div className="p-8">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
            <h3 className="text-2xl font-bold text-textPrimary">Informasi Pribadi</h3>
            {!isAdminView && (
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="text-sm font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Pencil className="w-4 h-4" /> Edit Profil
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              { label: 'Nama', value: profile.name },
              { label: 'NIM', value: formatNIM(profile.nim) },
              { label: 'Jurusan', value: 'Teknik Informatika' },
              { label: 'Fakultas', value: 'Ilmu Komputer' },
              { label: 'Email', value: profile.email },
              { label: 'Nomor Telepon', value: profile.phone },
            ].map((item, idx) => (
              <div key={idx}>
                <label className="block text-[10px] font-extrabold tracking-wider text-textSecondary uppercase mb-1.5 ml-1">
                  {item.label}
                </label>
                <div className="rounded-2xl p-4 text-sm font-semibold border transition-colors bg-bgPrimary border-transparent text-textSecondary">
                  <input 
                    type="text" 
                    value={item.value} 
                    readOnly
                    className="bg-transparent w-full outline-none text-textPrimary cursor-default"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Edit Profile Modal */}
      {isEditModalOpen && !isAdminView && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-bgSecondary w-full max-w-xl rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 md:p-8">
              <h2 className="text-2xl font-bold text-textPrimary mb-6">Edit Profil</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Avatar Edit */}
                <div className="flex items-center gap-6">
                  <div className="relative shrink-0 w-24 h-24 rounded-full overflow-hidden border-4 border-bgPrimary bg-bgPrimary">
                    {renderAvatar('w-24 h-24', 'text-3xl')}
                  </div>
                  <div>
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 btn-glass font-bold text-sm rounded-xl"
                    >
                      Ganti Foto Profil
                    </button>
                    <p className="text-xs text-textSecondary mt-2">Format: JPG, PNG, GIF (Maks. 2MB)</p>
                  </div>
                </div>

                {/* Fields Edit */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-textSecondary mb-1.5">Nama Lengkap</label>
                    <input 
                      type="text" 
                      value={profile.name} 
                      onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full rounded-xl p-3 bg-bgPrimary border border-borderColor focus:border-brand-500 outline-none text-textPrimary font-medium text-sm transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-textSecondary mb-1.5">NIM</label>
                    <input 
                      type="text" 
                      value={profile.nim} 
                      onChange={(e) => setProfile(prev => ({ ...prev, nim: e.target.value.replace(/\./g, '') }))}
                      className="w-full rounded-xl p-3 bg-bgPrimary border border-borderColor focus:border-brand-500 outline-none text-textPrimary font-medium text-sm transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-textSecondary mb-1.5">Email</label>
                    <input 
                      type="email" 
                      value={profile.email} 
                      readOnly
                      className="w-full rounded-xl p-3 bg-bgPrimary border border-transparent outline-none text-textSecondary font-medium text-sm cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-textSecondary mb-1.5">Nomor Telepon</label>
                    <input 
                      type="text" 
                      value={profile.phone} 
                      onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full rounded-xl p-3 bg-bgPrimary border border-borderColor focus:border-brand-500 outline-none text-textPrimary font-medium text-sm transition-colors"
                    />
                  </div>
                </div>

                {/* Hardcoded Readonly Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-70">
                  <div>
                    <label className="block text-xs font-bold text-textSecondary mb-1.5">Jurusan</label>
                    <input type="text" value="Teknik Informatika" readOnly className="w-full rounded-xl p-3 bg-bgPrimary border border-transparent outline-none text-textSecondary font-medium text-sm cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-textSecondary mb-1.5">Fakultas</label>
                    <input type="text" value="Ilmu Komputer" readOnly className="w-full rounded-xl p-3 bg-bgPrimary border border-transparent outline-none text-textSecondary font-medium text-sm cursor-not-allowed" />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-borderColor">
                  <button 
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl font-bold text-textSecondary hover:bg-bgPrimary transition-colors text-sm"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2.5 rounded-xl font-bold btn-glass-primary shadow-sm text-sm disabled:opacity-50 flex items-center gap-2"
                  >
                    {saving && <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />}
                    {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade to Tutor Banner (Hidden for Admin View) */}
      {!isAdminView && (
        <Card className="bg-[#111840] text-white shadow-xl rounded-[32px] overflow-hidden border-0 mt-8">
          <div className="p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">Yuk daftar jadi tutor!</h3>
              <p className="text-slate-400 font-medium text-sm md:text-base max-w-md leading-relaxed">
                "Bagikan keahlianmu dan bantu mahasiswa lain berkembang bersama."
              </p>
            </div>
            <Link 
              to="/register/tutor"
              className="shrink-0 btn-glass font-bold px-8 py-3.5 rounded-2xl shadow-sm text-sm"
            >
              Daftar Tutor
            </Link>
          </div>
        </Card>
      )}

    </div>
  );
}
