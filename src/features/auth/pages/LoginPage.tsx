import { useEffect, useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, GraduationCap, ShieldCheck, UserCircle, Briefcase, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth, getRoleLabel, hasRole } from '@/context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, loading, logout, user } = useAuth();
  
  const [loginMode, setLoginMode] = useState<'learner' | 'tutor'>(() => {
    return (sessionStorage.getItem('konekdin_login_mode') as 'learner' | 'tutor') || 'learner';
  });
  const [email, setEmail] = useState(() => sessionStorage.getItem('konekdin_login_email') || '');
  const [password, setPassword] = useState(() => sessionStorage.getItem('konekdin_login_password') || '');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    sessionStorage.setItem('konekdin_login_mode', loginMode);
    sessionStorage.setItem('konekdin_login_email', email);
    sessionStorage.setItem('konekdin_login_password', password);
  }, [loginMode, email, password]);

  const from = location.state?.from?.pathname;

  useEffect(() => {
    // Auto-redirect if already authenticated and just visiting the page
    if (!loading && isAuthenticated && !submitting) {
      const role = getRoleLabel(user);
      if (role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (hasRole(user, 'tutor') && loginMode === 'tutor') {
        navigate('/tutor', { replace: true });
      } else {
        navigate(from || '/learner', { replace: true });
      }
    }
  }, [isAuthenticated, loading, navigate, user, submitting, from, loginMode]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const loggedUser = await login({ email, password });
      
      if (loginMode === 'tutor') {
        if (hasRole(loggedUser, 'tutor') || getRoleLabel(loggedUser) === 'admin') {
          sessionStorage.removeItem('konekdin_login_email');
          sessionStorage.removeItem('konekdin_login_password');
          navigate('/tutor', { replace: true });
        } else {
          setError('Akun Anda belum terdaftar sebagai Pengajar. Silakan masuk sebagai Pelajar dan daftar menjadi Tutor melalui profil Anda.');
          await logout();
        }
      } else {
        const role = getRoleLabel(loggedUser);
        sessionStorage.removeItem('konekdin_login_email');
        sessionStorage.removeItem('konekdin_login_password');
        if (role === 'admin') {
          navigate('/admin', { replace: true });
        } else {
          navigate('/learner', { replace: true });
        }
      }
    } catch (err: any) {
      if (err.response?.data?.errors) {
        const errorMessages = Object.values(err.response.data.errors).flat().join(' ');
        setError(errorMessages);
      } else {
        const msg = err.response?.data?.message || 'Login gagal. Periksa email dan password Anda.';
        setError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-sm font-medium text-slate-600">Memuat sesi...</div>;
  }

  if (isAuthenticated && !submitting) {
    return null; // Will be redirected by useEffect
  }

  return (
    <div className="h-screen w-screen overflow-hidden flex items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(0,121,107,0.16),_transparent_35%),linear-gradient(135deg,_#f3fffc_0%,_#e6f6f2_100%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(138,227,52,0.08),_transparent_35%),linear-gradient(135deg,_#060b08_0%,_#0c1611_100%)] p-4 sm:p-6 lg:p-8">
      <div className="flex w-full max-w-6xl max-h-full flex-col overflow-y-auto lg:overflow-hidden rounded-[32px] border border-brand-100 dark:border-brand-500/20 bg-white/90 dark:bg-bgSecondary/95 shadow-[0_30px_80px_rgba(0,121,107,0.16)] dark:shadow-[0_30px_80px_rgba(138,227,52,0.06)] lg:flex-row">
        <section className="flex lg:flex-1 shrink-0 flex-col justify-between bg-brand-700 dark:bg-[#0c1611] p-8 text-white md:p-12 border-b lg:border-b-0 lg:border-r border-brand-100 dark:border-brand-500/20">
          <div>
            <div className="inline-flex rounded-2xl bg-white/15 p-3">
              <GraduationCap className="h-8 w-8" />
            </div>
            <h1 className="mt-6 text-3xl font-semibold sm:text-4xl">Masuk ke KonekDin</h1>
            <p className="mt-4 max-w-lg text-base leading-7 text-brand-50 dark:text-textSecondary">
              Kelola reservasi tutor, sesi belajar, dan riwayat kelas dalam satu platform yang cepat dan aman.
            </p>
          </div>

          <div className="rounded-[24px] border border-white/20 dark:border-brand-500/10 bg-white/10 dark:bg-[#060b08]/30 p-4 backdrop-blur mt-8 lg:mt-0">
            <div className="flex items-center gap-2 text-sm font-medium"><ShieldCheck className="h-4 w-4" /> Akses aman dan terenkripsi</div>
          </div>
        </section>

        <section className="flex flex-1 items-center justify-center p-6 md:p-10">
          <div className="w-full max-w-md rounded-[28px] border border-slate-200 dark:border-brand-500/10 bg-slate-50/80 dark:bg-[#0c1611]/80 p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Selamat datang kembali</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-textSecondary">Pilih mode masuk dan masukkan kredensial Anda.</p>

            <div className="mt-6 flex rounded-xl bg-slate-200/50 dark:bg-[#060b08]/50 p-1">
              <button
                type="button"
                onClick={() => setLoginMode('learner')}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-bold transition-all ${
                  loginMode === 'learner' 
                    ? 'btn-glass-primary shadow-sm' 
                    : 'btn-glass text-slate-500'
                }`}
              >
                <UserCircle className="h-4 w-4" /> Pelajar
              </button>
              <button
                type="button"
                onClick={() => setLoginMode('tutor')}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-bold transition-all ${
                  loginMode === 'tutor' 
                    ? 'btn-glass-primary shadow-sm' 
                    : 'btn-glass text-slate-500'
                }`}
              >
                <Briefcase className="h-4 w-4" /> Pengajar
              </button>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-900 dark:text-white">Email</Label>
                <Input id="email" type="email" placeholder="nama@email.com" value={email} onChange={(event) => setEmail(event.target.value)} className="bg-white dark:bg-bgSecondary text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-textSecondary/50 border border-slate-300 dark:border-brand-500/20" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-900 dark:text-white">Password</Label>
                <div className="relative">
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    value={password} 
                    onChange={(event) => setPassword(event.target.value)} 
                    className="bg-white dark:bg-bgSecondary text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-textSecondary/50 pr-10 border border-slate-300 dark:border-brand-500/20" 
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
                <div className="rounded-xl border border-rose-200 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-500/10 p-3 text-sm text-rose-600 dark:text-rose-400 font-medium">
                  {error}
                </div>
              ) : null}
              <Button className="w-full" type="submit" disabled={submitting}>
                {submitting ? 'Memproses...' : `Masuk sebagai ${loginMode === 'learner' ? 'Pelajar' : 'Pengajar'}`} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500 dark:text-textSecondary">
              Belum punya akun?{' '}
              <Link to="/register" className="font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700">Daftar sekarang</Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
