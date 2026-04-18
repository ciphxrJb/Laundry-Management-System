'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from './lib/supabase';
import { Settings, Monitor, Droplets, Lock, X, Loader2, ChevronRight, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { api } from './lib/api';

/**
 * COMPLIANCE: Design System v1.0
 * - Background: bg-slate-50
 * - Typography: H1 (text-3xl font-bold), Technical (text-[10px] uppercase font-black)
 * - Radius: rounded-[2rem]
 * - Shadow: shadow-xl shadow-slate-200/50
 */

export default function ModeSelection() {
  const router = useRouter();
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [correctPin, setCorrectPin] = useState<string>('1234');
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await api.getMe();
        if (data?.user) {
          setUserEmail(data.user.email || '');
          setCorrectPin(data.user.user_metadata?.admin_pin || '1234');
          setCheckingAuth(false);
        } else {
          router.push('/login');
        }
      } catch (err) {
        router.push('/login');
      }
    };
    fetchUser();
  }, [router]);

  if (checkingAuth) {
    return (
      <div className="h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  const selectMode = (mode: 'system' | 'admin') => {
    if (mode === 'system') {
      localStorage.setItem('appMode', 'system');
      router.push('/new-order');
    } else {
      setShowPinModal(true);
    }
  };

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 4) {
        verifyPin(newPin);
      }
    }
  };

  const verifyPin = async (inputPin: string) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 600)); 

    if (inputPin === correctPin) { 
      localStorage.setItem('appMode', 'admin');
      sessionStorage.setItem('admin_unlocked', 'true');
      toast.success('Manager access granted');
      router.push('/dashboard');
    } else {
      toast.error('Invalid Manager PIN');
      setPin('');
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    toast.success('Signed out successfully');
  };

  return (
    <div className="h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      
      {/* Background Aura (Design System Compliant) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-5%] left-[-5%] w-[60%] h-[60%] rounded-full bg-blue-100/50 blur-[130px]" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[60%] h-[60%] rounded-full bg-purple-100/30 blur-[130px]" />
      </div>

      <div className={`w-full max-w-5xl relative z-10 transition-all duration-700 ${showPinModal ? 'blur-2xl scale-95 opacity-40 px-6' : 'scale-100 opacity-100'}`}>
        
        {/* Top Header (Design System Compliant) */}
        <div className="w-full flex justify-between items-center mb-16 px-4 animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white shadow-sm rounded-xl flex items-center justify-center border border-slate-100">
              <Droplets className="text-blue-600 w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Authenticated Operator</p>
              <p className="text-sm font-bold text-slate-900">{userEmail}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="group flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-red-600 hover:border-red-100 transition-all font-bold text-[10px] uppercase tracking-widest shadow-sm active:scale-95"
          >
            <Lock size={12} className="group-hover:rotate-12 transition-transform" />
            Sign Out
          </button>
        </div>

        {/* HORIZONTAL TERMINAL CARDS (Design System Compliant) */}
        <div className="grid md:grid-cols-2 gap-10">
          
          {/* POS Terminal */}
          <button 
            onClick={() => selectMode('system')}
            className="group relative bg-white border border-slate-100 p-12 rounded-[2rem] shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-blue-600/10 transition-all duration-500 hover:-translate-y-2 block w-full text-left overflow-hidden animate-in fade-in slide-in-from-left-8 duration-700"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-50/50 rounded-full translate-x-12 -translate-y-12 transition-transform group-hover:scale-150 duration-700 font-bold" />
            
            <div className="relative z-10">
              <div className="p-5 bg-blue-600 rounded-2xl w-fit mb-10 text-white shadow-xl shadow-blue-600/30 group-hover:rotate-6 group-hover:scale-110 transition-all duration-500">
                <Monitor size={32} />
              </div>
              
              <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3">POS Service Terminal</div>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-3">System POS</h2>
              <p className="text-base text-slate-500 leading-relaxed font-medium pr-8 opacity-80">Track orders, manage laundry processing, and issue digital receipts.</p>
              
              <div className="mt-10 flex items-center gap-2 text-blue-600 font-bold text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 translate-x-3 group-hover:translate-x-0 transition-all duration-500">
                Launch Workspace <ChevronRight size={14} />
              </div>
            </div>
          </button>

          {/* Admin Terminal */}
          <button 
            onClick={() => selectMode('admin')}
            className="group relative bg-white border border-slate-100 p-12 rounded-[2rem] shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-900/10 transition-all duration-500 hover:-translate-y-2 block w-full text-left overflow-hidden animate-in fade-in slide-in-from-right-8 duration-700"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-slate-50/50 rounded-full translate-x-12 -translate-y-12 transition-transform group-hover:scale-150 duration-700" />
            
            <div className="relative z-10">
              <div className="p-5 bg-slate-900 rounded-2xl w-fit mb-10 text-white shadow-xl shadow-slate-900/30 group-hover:-rotate-6 group-hover:scale-110 transition-all duration-500">
                <Settings size={32} />
              </div>
              
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Core Administration</div>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-3">Management</h2>
              <p className="text-base text-slate-500 leading-relaxed font-medium pr-8 opacity-80">Access financial reports, shop analytics, and staff management.</p>
              
              <div className="mt-10 flex items-center gap-2 text-slate-900 font-bold text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 translate-x-3 group-hover:translate-x-0 transition-all duration-500">
                Launch Dashboard <ChevronRight size={14} />
              </div>
            </div>
          </button>

        </div>

        {/* Footer (Design System Compliant) */}
        <div className="mt-20 flex justify-center animate-in fade-in duration-1000 delay-500">
          <div className="flex items-center gap-2.5 px-6 py-3 bg-white rounded-full border border-slate-100 shadow-sm">
            <Sparkles className="text-blue-500 w-4 h-4" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enterprise Edition v1.2.0</span>
          </div>
        </div>

      </div>

      {/* PIN MODAL (Native Standard) */}
      {showPinModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => { setShowPinModal(false); setPin(''); }} />
          
          <div className="relative max-w-sm w-full bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 text-center border-b bg-slate-50/50">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Admin Verification</h2>
              <p className="text-slate-500 text-sm mt-1">Enter your security PIN to access the dashboard</p>
            </div>

            <div className="p-6">
              <div className="flex justify-center gap-4 mb-8">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className={`w-3 h-3 rounded-full transition-all duration-200 ${pin.length > i ? 'bg-blue-600 scale-125' : 'bg-slate-200'}`} />
                ))}
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleKeyPress(num.toString())}
                    disabled={loading}
                    className="h-14 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-xl font-semibold text-slate-700 active:scale-95 transition-all"
                  >
                    {num}
                  </button>
                ))}
                <button onClick={() => setPin('')} disabled={loading} className="h-14 rounded-lg flex items-center justify-center text-sm font-bold text-red-600 hover:bg-red-50 transition-all">CLEAR</button>
                <button onClick={() => handleKeyPress('0')} disabled={loading} className="h-14 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-xl font-semibold text-slate-700 active:scale-95 transition-all">0</button>
                <button onClick={() => { setShowPinModal(false); setPin(''); }} disabled={loading} className="h-14 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"><X size={20} /></button>
              </div>
            </div>

            {loading && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
