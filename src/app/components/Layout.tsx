'use client';

import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, ShoppingCart, FileText, Users, Menu, LogOut, Shield } from 'lucide-react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [appMode, setAppMode] = useState<'system' | 'admin'>('system');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const savedMode = localStorage.getItem('appMode') as 'system' | 'admin';
    if (savedMode) {
      setAppMode(savedMode);
    }
  }, [pathname]);

  // Mock user data since auth is disabled
  const user = { email: 'demo@laundry.com' };
  const shopId = 'DEMO-001';

  const handleSwitchMode = () => {
    localStorage.removeItem('appMode');
    router.push('/');
  };

  const navItems = appMode === 'admin' 
    ? [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/new-order', label: 'New Order', icon: ShoppingCart },
        { path: '/orders', label: 'Orders', icon: FileText },
        { path: '/customers', label: 'Customers', icon: Users }
      ]
    : [
        { path: '/new-order', label: 'New Order', icon: ShoppingCart },
        { path: '/orders', label: 'Orders', icon: FileText },
        { path: '/customers', label: 'Customers', icon: Users },
      ];

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <>
      {navItems.map(({ path, label, icon: Icon }) => (
        <Link
          key={path}
          href={path}
          onClick={onClick}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            pathname === path
              ? 'bg-blue-500 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Icon size={20} />
          <span className="font-medium">{label}</span>
        </Link>
      ))}
    </>
  );

  if (pathname === '/') {
    return <div className="min-h-screen bg-gray-50">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-50 bg-white border-b shadow-sm print:hidden">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold text-blue-600">Laundry POS</h1>
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <button className="inline-flex items-center justify-center rounded-md p-2 hover:bg-gray-100 transition-colors">
                <Menu size={24} />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="p-4 border-b">
                <h2 className="text-xl font-bold text-blue-600">Menu</h2>
                <p className="text-xs text-gray-500 mt-1 uppercase tracking-wide">{isMounted ? appMode : ''} Mode</p>
              </div>
              <nav className="flex flex-col gap-2 p-4">
                <NavLinks onClick={() => setMobileMenuOpen(false)} />
                <Button
                  variant="outline"
                  className="justify-start mt-4"
                  onClick={handleSwitchMode}
                >
                  <LogOut size={16} />
                  <span className="ml-2">Switch Mode</span>
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="lg:flex print:block">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 min-h-screen bg-white border-r shadow-sm print:hidden">
          <div className="sticky top-0 p-6">
            <h1 className="text-2xl font-bold text-blue-600 mb-8">Laundry POS</h1>
            <div className="mb-4 rounded-lg border bg-gray-50 px-3 py-2">
              <p className="text-xs text-gray-500">Signed in as</p>
              <p className="text-sm font-semibold">{user.email}</p>
              <p className="text-xs uppercase tracking-wide text-gray-500 mt-1">{isMounted ? appMode : ''} Mode</p>
              {shopId && <p className="text-xs text-gray-500 mt-1">Shop: {shopId}</p>}
            </div>
            <nav className="flex flex-col gap-2">
              <NavLinks />
            </nav>
            <Button
              variant="outline"
              className="w-full mt-4 justify-start"
              onClick={handleSwitchMode}
            >
              <LogOut size={16} />
              <span className="ml-2">Switch Mode</span>
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8 print:p-0 print:m-0 w-full relative">
          {children}
        </main>
      </div>
    </div>
  );
}