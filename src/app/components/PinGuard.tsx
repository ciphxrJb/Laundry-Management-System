'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../lib/api';
import { Loader2, Lock, X, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';

interface PinGuardProps {
  children: React.ReactNode;
}

export function PinGuard({ children }: PinGuardProps) {
  const router = useRouter();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [correctPin, setCorrectPin] = useState<string | null>(null);

  useEffect(() => {
    // Check if we already unlocked it in this session
    const unlocked = sessionStorage.getItem('admin_unlocked');
    if (unlocked === 'true') {
      setIsUnlocked(true);
    }

    // Fetch the shop's actual pin
    async function fetchPin() {
      const me = await api.getMe();
      // We'll assume the shop data has admin_pin
      setCorrectPin(me?.shop?.admin_pin || '1234');
    }
    fetchPin();
  }, []);

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
    // Mimic database check delay
    await new Promise(r => setTimeout(r, 600));
    
    if (inputPin === correctPin) {
      sessionStorage.setItem('admin_unlocked', 'true');
      setIsUnlocked(true);
      toast.success('Manager access granted');
    } else {
      toast.error('Invalid Manager PIN');
      setPin('');
    }
    setLoading(false);
  };

  const clearPin = () => setPin('');

  if (isUnlocked) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-sm w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-8 text-center bg-slate-50 border-b">
          <div className="inline-flex p-4 bg-blue-100 rounded-2xl mb-4">
            <Lock className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Manager Access</h2>
          <p className="text-slate-500 text-sm mt-1">Please enter your 4-digit PIN to continue</p>
        </div>

        <div className="p-8">
          {/* PIN Indicators */}
          <div className="flex justify-center gap-4 mb-10">
            {[0, 1, 2, 3].map((i) => (
              <div 
                key={i} 
                className={`w-4 h-4 rounded-full border-2 border-slate-200 transition-all duration-200 ${
                  pin.length > i ? 'bg-blue-600 border-blue-600 scale-125' : 'bg-transparent'
                }`}
              />
            ))}
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handleKeyPress(num.toString())}
                disabled={loading}
                className="h-16 rounded-2xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-xl font-bold text-slate-700 active:scale-90 transition-all"
              >
                {num}
              </button>
            ))}
            <button
              onClick={clearPin}
              disabled={loading}
              className="h-16 rounded-2xl bg-red-50 hover:bg-red-100 flex items-center justify-center text-sm font-bold text-red-600 transition-all"
            >
              CLEAR
            </button>
            <button
              onClick={() => handleKeyPress('0')}
              disabled={loading}
              className="h-16 rounded-2xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-xl font-bold text-slate-700 active:scale-90 transition-all"
            >
              0
            </button>
            <button
              onClick={() => router.push('/')}
              disabled={loading}
              className="h-16 rounded-2xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-all"
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>

        {loading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        )}
      </div>
    </div>
  );
}
