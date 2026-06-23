import { useState, useEffect, type ElementType, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bell, ChevronRight, GraduationCap, LogOut, Menu, X, ArrowLeft, Sun, Moon } from 'lucide-react';
import { useAuth, getRoleLabel, hasRole } from '@/context/AuthContext';
import apiClient from '@/api/axios';

interface AppLayoutProps {
  children: ReactNode;
  navigation: Array<{
    label: string;
    to: string;
    icon: ElementType;
  }>;
  panelRole?: string;
}

export default function AppLayout({ children, navigation, panelRole }: AppLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  // Poll for notifications
  useEffect(() => {
    if (!user) return;
    if (panelRole !== 'Learner' && panelRole !== 'Tutor') return;

    const checkNotifications = async () => {
      try {
        let unread = false;
        if (panelRole === 'Learner' && hasRole(user, 'learner')) {
          const res = await apiClient.get('/learner/notification');
          const list = res.data.data || res.data || [];
          unread = list.some((n: any) => !n.is_read);
        } else if (panelRole === 'Tutor' && hasRole(user, 'tutor')) {
          const res = await apiClient.get('/tutor/notifications');
          const list = res.data.data || res.data || [];
          unread = list.some((n: any) => !n.is_read);
        }
        setHasUnreadNotifications(unread);
      } catch (err) {
        console.error("Failed to check notifications", err);
      }
    };

    checkNotifications();
    const interval = setInterval(checkNotifications, 10000);
    return () => clearInterval(interval);
  }, [panelRole, user]);

  // Mark all as read when opening notifications page
  useEffect(() => {
    if (!user) return;

    const markAsRead = async () => {
      try {
        if (panelRole === 'Learner' && location.pathname === '/learner/notifications' && hasRole(user, 'learner')) {
          await apiClient.post('/learner/notifications/read-all');
          setHasUnreadNotifications(false);
        } else if (panelRole === 'Tutor' && location.pathname === '/tutor/notifications' && hasRole(user, 'tutor')) {
          await apiClient.post('/tutor/notifications/read-all');
          setHasUnreadNotifications(false);
        }
      } catch (err) {
        console.error("Failed to mark notifications as read", err);
      }
    };

    markAsRead();
  }, [location.pathname, panelRole, user]);

  const roleLabel = getRoleLabel(user);

  return (
    <div className="min-h-screen bg-transparent dark:bg-appBg text-textPrimary transition-colors duration-300 relative z-0 overflow-hidden">
      {/* Decorative Background Shapes (Light/Dark Gradient background) */}
      <div className="absolute inset-0 z-[-1] flex overflow-hidden pointer-events-none bg-gradient-to-br from-[#99F2D1] to-[#1C3E35] dark:from-[#060b08] dark:to-[#08120d]">
        
        {/* Giant Text Overlay - TOP */}
        {/* Di sini Anda bisa mengatur tulisan KonekDin di Background */}
        <div className="absolute top-0 w-full flex justify-start lg:pl-[5rem] pt-8 opacity-40 overflow-hidden">
          <span className="text-[15vw] leading-none font-black uppercase tracking-widest text-white/30 dark:text-white/20 whitespace-nowrap select-none">
            KonekDin
          </span>
        </div>

        {/* Giant Text Overlay - BOTTOM */}
        <div className="absolute bottom-0 w-full flex justify-center lg:pl-[5rem] pb-8 opacity-40 overflow-hidden">
          <span className="text-[15vw] leading-none font-black uppercase tracking-widest text-white/30 dark:text-white/20 whitespace-nowrap select-none">
            KonekDin
          </span>
        </div>
      </div>

      <div className="flex min-h-screen relative z-10">
        {/* Sidebar Overlay for Mobile */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black/50 lg:hidden" 
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside 
          className={`fixed top-4 bottom-4 left-4 h-[calc(100vh-2rem)] z-50 w-64 transform flex flex-col border border-borderColor bg-bgSecondary bg-opacity-80 backdrop-blur-md rounded-3xl shadow-[4px_0_24px_rgba(0,0,0,0.02)] text-textPrimary dark:text-white transition-transform duration-300 ease-in-out ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-[calc(100%+1rem)]'
          }`}
        >
          {/* Logo */}
          <div className="flex items-center gap-3 p-6 pb-4">
            <div className="flex items-center justify-center rounded-lg p-2 text-brand-500">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
              </svg>
            </div>
            <span className="text-xl font-bold text-brand-600 tracking-tight">KonekDin</span>
            <button 
              className="btn-glass ml-auto p-2 rounded-lg" 
              onClick={() => setIsSidebarOpen(false)}
              title="Tutup Sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* User Profile in Sidebar */}
          <div className="px-6 pb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700 shadow-sm overflow-hidden border-2 border-brand-100">
                {user?.avatar ? (
                  <img src={user.avatar as string} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  (user?.name ?? 'U').slice(0, 2).toUpperCase()
                )}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="truncate text-sm font-bold text-textPrimary dark:text-white">{user?.name ?? 'Budi Santoso'}</span>
                <span className="truncate text-xs text-textSecondary dark:text-slate-400">{panelRole || roleLabel}</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto px-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.to;
              const isNotificationLink = item.label === 'Notifikasi';

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => {
                    if (window.innerWidth < 1024) setIsSidebarOpen(false);
                  }}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                    active 
                      ? 'bg-amber-50 text-amber-600 dark:bg-brand-500/10 dark:text-brand-400' 
                      : 'text-textSecondary dark:text-slate-300 hover:bg-bgPrimary hover:text-textPrimary dark:hover:text-white dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="relative">
                    <Icon className="h-4 w-4" />
                    {isNotificationLink && hasUnreadNotifications && (
                      <span className="absolute -top-1 -right-1 flex h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
                    )}
                  </div>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-borderColor space-y-1">
            <button className="btn-glass flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold">
              <div className="flex items-center justify-center h-4 w-4 rounded-full border-2 border-current">
                <span className="text-[10px]">?</span>
              </div>
              Bantuan
            </button>
            <button 
              onClick={handleLogout} 
              className="btn-glass-destructive flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold"
            >
              <LogOut className="h-4 w-4" />
              Keluar
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main 
          className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out p-4 md:p-6 lg:p-8 ${
            isSidebarOpen ? 'lg:ml-[17rem]' : 'ml-0'
          }`}
        >
          {/* Unified Header (Back Button, Menu Toggle, Theme) */}
          <header className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {!isSidebarOpen && (
                <button 
                  onClick={() => setIsSidebarOpen(true)}
                  className="btn-glass p-2.5 rounded-xl"
                  title="Buka Sidebar"
                >
                  <Menu className="h-5 w-5" />
                </button>
              )}
              <button 
                onClick={() => navigate(-1)}
                className="btn-glass p-2.5 rounded-xl flex items-center gap-2"
                title="Go Back"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="text-sm font-bold hidden sm:inline">Kembali</span>
              </button>
            </div>
            
            <div className="flex gap-2 z-50 relative">
              <button 
                onClick={toggleTheme} 
                className="btn-glass p-2.5 rounded-xl"
                title="Toggle Theme"
              >
                {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </button>
            </div>
          </header>

          <div className="flex-1">{children}</div>
        </main>
      </div>
    </div>
  );
}
