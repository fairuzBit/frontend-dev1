import { useEffect, useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ArrowRight, GraduationCap, Sparkles, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, isAuthenticated, loading } = useAuth();
  const [name, setName] = useState(() => sessionStorage.getItem('konekdin_reg_name') || '');
  const [nim, setNim] = useState(() => sessionStorage.getItem('konekdin_reg_nim') || '');
  const [phone, setPhone] = useState(() => sessionStorage.getItem('konekdin_reg_phone') || '');
  const [email, setEmail] = useState(() => sessionStorage.getItem('konekdin_reg_email') || '');
  const [password, setPassword] = useState(() => sessionStorage.getItem('konekdin_reg_password') || '');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    sessionStorage.setItem('konekdin_reg_name', name);
    sessionStorage.setItem('konekdin_reg_nim', nim);
    sessionStorage.setItem('konekdin_reg_phone', phone);
    sessionStorage.setItem('konekdin_reg_email', email);
    sessionStorage.setItem('konekdin_reg_password', password);
  }, [name, nim, phone, email, password]);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/learner', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await register({ fullName: name, nim, phone, email, password });
      
      sessionStorage.removeItem('konekdin_reg_name');
      sessionStorage.removeItem('konekdin_reg_nim');
      sessionStorage.removeItem('konekdin_reg_phone');
      sessionStorage.removeItem('konekdin_reg_email');
      sessionStorage.removeItem('konekdin_reg_password');

      navigate('/learner', { replace: true });
    } catch (err: any) {
      if (err.response?.data?.errors) {
        const errorMessages = Object.values(err.response.data.errors).flat().join(' ');
        setError(errorMessages);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Pendaftaran gagal. Silakan coba lagi.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-sm font-medium text-slate-600">Memuat sesi...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to="/learner" replace />;
  }

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-[radial-gradient(circle_at_top_right,_rgba(0,121,107,0.16),_transparent_35%),linear-gradient(135deg,_#f8fffd_0%,_#ebf8f4_100%)] dark:bg-[radial-gradient(circle_at_top_right,_rgba(138,227,52,0.08),_transparent_35%),linear-gradient(135deg,_#060b08_0%,_#0c1611_100%)] p-2 sm:p-4 lg:p-6 overflow-hidden">
      <div className="flex w-full max-w-5xl h-full max-h-[850px] flex-col-reverse lg:flex-row rounded-[32px] border border-brand-100 dark:border-brand-500/20 bg-white/90 dark:bg-bgSecondary/95 shadow-[0_30px_80px_rgba(0,121,107,0.16)] dark:shadow-[0_30px_80px_rgba(138,227,52,0.06)] overflow-hidden">
        <section className="flex flex-1 items-center justify-center p-4 md:p-6 overflow-y-auto hide-scrollbar">
          <div className="w-full max-w-md my-auto rounded-[24px] border border-slate-200 dark:border-brand-500/10 bg-slate-50/80 dark:bg-[#0c1611]/80 p-5 md:p-6">
            <div className="inline-flex rounded-xl bg-brand-50 dark:bg-brand-500/10 p-2 text-brand-700 dark:text-brand-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <h2 className="mt-3 text-xl font-semibold text-slate-900 dark:text-white">Buat akun Learner baru</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-textSecondary">Daftar dan cari tutor sesuai kebutuhan Anda.</p>

            <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-slate-900 dark:text-white text-xs font-semibold">Nama</Label>
                  <Input id="name" placeholder="Nama lengkap" value={name} onChange={(event) => setName(event.target.value)} className="bg-white dark:bg-bgSecondary text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-textSecondary/50 border border-slate-300 dark:border-brand-500/20 h-9 text-sm" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="nim" className="text-slate-900 dark:text-white text-xs font-semibold">NIM</Label>
                  <Input id="nim" placeholder="A11202415836" value={nim} onChange={(event) => setNim(event.target.value.replace(/\./g, ''))} className="bg-white dark:bg-bgSecondary text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-textSecondary/50 border border-slate-300 dark:border-brand-500/20 h-9 text-sm" required />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-slate-900 dark:text-white text-xs font-semibold">Nomor Telepon</Label>
                <Input id="phone" placeholder="0812xxxxxxxx" value={phone} onChange={(event) => setPhone(event.target.value)} className="bg-white dark:bg-bgSecondary text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-textSecondary/50 border border-slate-300 dark:border-brand-500/20 h-9 text-sm" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-slate-900 dark:text-white text-xs font-semibold">Email</Label>
                <Input id="email" type="email" placeholder="nama@email.com" value={email} onChange={(event) => setEmail(event.target.value)} className="bg-white dark:bg-bgSecondary text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-textSecondary/50 border border-slate-300 dark:border-brand-500/20 h-9 text-sm" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-slate-900 dark:text-white text-xs font-semibold">Password</Label>
                <div className="relative">
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    value={password} 
                    onChange={(event) => setPassword(event.target.value)} 
                    className="bg-white dark:bg-bgSecondary text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-textSecondary/50 pr-10 border border-slate-300 dark:border-brand-500/20 h-9 text-sm" 
                    required 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-textSecondary hover:text-slate-600 dark:hover:text-white transition-colors focus:outline-none"
                    aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              {error ? (
                <div className="rounded-xl border border-rose-200 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-500/10 p-3 text-xs text-rose-600 dark:text-rose-400 font-medium">
                  {error}
                </div>
              ) : null}
              <Button className="w-full h-10 mt-2" type="submit" disabled={submitting}>
                {submitting ? 'Memproses...' : 'Daftar'} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>

            <p className="mt-4 text-center text-xs text-slate-500 dark:text-textSecondary">
              Sudah punya akun?{' '}
              <Link to="/login" className="font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700">Masuk di sini</Link>
            </p>
          </div>
        </section>

        <section className="flex lg:flex-1 flex-col justify-center bg-brand-700 dark:bg-[#0c1611] p-8 text-white md:p-12 overflow-y-auto border-t lg:border-t-0 lg:border-l border-brand-100 dark:border-brand-500/20">
          <div className="max-w-md mx-auto">
            <div className="inline-flex rounded-2xl bg-white/15 p-3">
              <GraduationCap className="h-8 w-8" />
            </div>
            <h1 className="mt-6 text-3xl font-semibold sm:text-4xl">Gabung sebagai Learner</h1>
            <p className="mt-4 text-base leading-relaxed text-brand-50 dark:text-textSecondary">
              Jelajahi tutor, buat booking, dan dapatkan bimbingan belajar yang terorganisir dengan baik.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
