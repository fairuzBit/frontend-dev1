import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const { loginWithSupabaseToken } = useAuth();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Dapatkan session Supabase yang baru saja terautentikasi
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }

        if (session?.access_token) {
          // Kirim access token Supabase ke backend Laravel kita
          await loginWithSupabaseToken(session.access_token);
          
          // Setelah berhasil login, sign out dari Supabase agar tidak menyisakan sesi di Supabase client
          await supabase.auth.signOut();

          // Redirect ke halaman utama
          navigate('/', { replace: true });
        } else {
          throw new Error('Sesi autentikasi Google tidak ditemukan.');
        }
      } catch (err: any) {
        console.error('Error saat auth callback:', err);
        setErrorMsg(err.message || 'Gagal menyelaraskan sesi autentikasi Google.');
      }
    };

    handleCallback();
  }, [loginWithSupabaseToken, navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-bgSecondary p-4 text-center">
      {errorMsg ? (
        <div className="max-w-md rounded-2xl border border-rose-200 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-500/10 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-rose-600 dark:text-rose-400">Autentikasi Gagal</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-textSecondary">{errorMsg}</p>
          <button
            onClick={() => navigate('/login')}
            className="mt-4 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
          >
            Kembali ke Login
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent"></div>
          <p className="text-sm font-medium text-slate-600 dark:text-textSecondary">
            Menghubungkan akun Google Anda dengan KonekDin...
          </p>
        </div>
      )}
    </div>
  );
}
