'use client';

import { useRouter, usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingCart, FileText, Users, Menu } from 'lucide-react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { useState } from 'react';

export function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/new-order', label: 'New Order', icon: ShoppingCart },
    { path: '/orders', label: 'Orders', icon: FileText },
    { path: '/customers', label: 'Customers', icon: Users },
  ];

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <>
      {navItems.map(({ path, label, icon: Icon }) => (
        <button
          key={path}
          onClick={() => {
            router.push(path);
            onClick?.();
          }}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors w-full text-left ${
            pathname === path
              ? 'bg-blue-500 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Icon size={20} />
          <span className="font-medium">{label}</span>
        </button>
      ))}
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-50 bg-white border-b shadow-sm">
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
                <p className="text-xs text-gray-500 mt-1 uppercase tracking-wide">{role}</p>
              </div>
              <nav className="flex flex-col gap-2 p-4">
                <NavLinks onClick={() => setMobileMenuOpen(false)} />
                <Button
                  variant="outline"
                  className="justify-start mt-4"
                  onClick={handleSignOut}
                >
                  <LogOut size={16} />
                  <span className="ml-2">Sign Out</span>
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="lg:flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 min-h-screen bg-white border-r shadow-sm">
          <div className="sticky top-0 p-6">
            <h1 className="text-2xl font-bold text-blue-600 mb-8">Laundry POS</h1>
            <nav className="flex flex-col gap-2">
              <NavLinks />
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}