'use client';

import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  FileText, 
  Users, 
  Menu, 
  LogOut, 
  Shield, 
  Droplets,
  ChevronRight,
  User,
  RefreshCw,
  Settings as SettingsIcon
} from 'lucide-react';
import { ShopSwitcher } from './ShopSwitcher';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from './ui/sheet';
import { api } from '../lib/api';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [appMode, setAppMode] = useState<'system' | 'admin'>('system');
  const [userEmail, setUserEmail] = useState<string>('Syncing...');

  useEffect(() => {
    const savedMode = localStorage.getItem('appMode') as 'system' | 'admin';
    if (savedMode) {
      setAppMode(savedMode);
    }

    const fetchUser = async () => {
      const data = await api.getMe();
      if (data?.user) {
        setUserEmail(data.user.email || '');
      } else {
        router.push('/login');
      }
    };
    fetchUser();
  }, [pathname]);

  const handleSwitchMode = () => {
    localStorage.removeItem('appMode');
    router.push('/');
  };

  const navItems = appMode === 'admin' 
    ? [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/new-order', label: 'New Order', icon: ShoppingCart },
        { path: '/orders', label: 'Orders', icon: FileText },
        { path: '/customers', label: 'Customers', icon: Users },
        { path: '/settings', label: 'Settings', icon: SettingsIcon }
      ]
    : [
        { path: '/new-order', label: 'New Order', icon: ShoppingCart },
        { path: '/orders', label: 'Orders', icon: FileText },
        { path: '/customers', label: 'Customers', icon: Users },
      ];

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <>
      {navItems.map(({ path, label, icon: Icon }) => {
        const isActive = pathname === path;
        return (
          <Link
            key={path}
            href={path}
            onClick={onClick}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group ${
              isActive
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 font-bold'
                : 'text-slate-500 hover:bg-blue-50 hover:text-blue-600'
            }`}
          >
            <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
              <Icon size={20} />
            </div>
            <span className="text-sm">{label}</span>
          </Link>
        );
      })}
    </>
  );

  if (pathname === '/' || pathname === '/login') {
    return <div className="min-h-screen bg-transparent">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col lg:flex-row font-sans">
      {/* Mobile Header (Hidden on Tablet and above) */}
      <div className="md:hidden sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b p-4 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-2">
          <Droplets className="text-blue-600 w-6 h-6" />
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Laundry<span className="text-blue-600">POS</span></h1>
        </div>
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="bg-slate-50 rounded-xl">
              <Menu size={24} />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0 border-none bg-white">
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation Menu</SheetTitle>
            </SheetHeader>
            <div className="p-8 border-b flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <User size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Authenticated</p>
                <p className="text-xs font-bold text-slate-700 truncate">{userEmail}</p>
              </div>
            </div>
            <nav className="flex flex-col gap-2 p-4">
              <div className="px-2 mb-2 mt-4 lg:hidden">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Navigation</p>
              </div>
              <NavLinks onClick={() => setMobileMenuOpen(false)} />
              <div className="mt-8 pt-6 border-t flex flex-col gap-2">
                <Button
                  variant="secondary"
                  className="w-full justify-start h-12 rounded-xl bg-slate-100 border-none text-slate-700 font-bold gap-3"
                  onClick={() => {
                    handleSwitchMode();
                    setMobileMenuOpen(false);
                  }}
                >
                  <RefreshCw size={18} className="text-slate-500" />
                  Switch Mode
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start h-12 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50 font-bold gap-3"
                  onClick={async () => {
                    const { supabase } = await import('../lib/supabase');
                    await supabase.auth.signOut();
                    router.push('/login');
                  }}
                >
                  <LogOut size={18} />
                  Log Out Account
                </Button>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>

      {/* REFINED SIDEBAR (Visible on Tablet and above) */}
      <aside className="hidden md:flex w-72 h-screen sticky top-0 flex-col bg-white border-r p-6 print:hidden shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-2.5 mb-10 px-2">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <Droplets size={20} />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tighter">Laundry<span className="text-blue-600 italic">ERP</span></h1>
        </div>

        {/* Elegant Account Widget */}
        <div className="mb-2 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3 relative overflow-hidden group hover:border-blue-200 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-blue-500 group-hover:border-blue-100 transition-all">
            <User size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Authenticated</p>
            <p className="text-xs font-bold text-slate-700 truncate">{userEmail}</p>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full h-10 mb-8 rounded-xl justify-center text-slate-500 hover:text-slate-700 hover:bg-slate-50 font-bold transition-all border-dashed"
          onClick={handleSwitchMode}
        >
          <LogOut size={16} className="mr-2" />
          Switch Mode
        </Button>

        <nav className="flex flex-col gap-2 flex-1">
          <div className="px-2 mb-2">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Environments</p>
          </div>
          <NavLinks />
        </nav>

      </aside>

      {/* Content Area */}
      <main className="flex-1 p-4 md:p-10 w-full overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}