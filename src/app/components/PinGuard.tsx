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
      setCorrectPin(me?.user?.user_metadata?.admin_pin || '1234');
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
    <div className="w-full min-h-[80vh] flex flex-col items-center justify-center p-4 animate-in fade-in duration-500">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-sm border overflow-hidden relative">
        <div className="p-6 text-center border-b bg-gray-50/50">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold">Admin Verification</h2>
          <p className="text-gray-500 text-sm mt-1">Enter your security PIN to access metrics</p>
        </div>

        <div className="p-6">
          {/* PIN Indicators */}
          <div className="flex justify-center gap-4 mb-8">
            {[0, 1, 2, 3].map((i) => (
              <div 
                key={i} 
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  pin.length > i ? 'bg-blue-600 scale-125' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <Button
                key={num}
                variant="outline"
                disabled={loading}
                onClick={() => handleKeyPress(num.toString())}
                className="h-14 text-xl font-semibold hover:bg-gray-50"
              >
                {num}
              </Button>
            ))}
            <Button
              variant="ghost"
              disabled={loading}
              onClick={clearPin}
              className="h-14 text-sm font-bold text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              CLEAR
            </Button>
            <Button
              variant="outline"
              disabled={loading}
              onClick={() => handleKeyPress('0')}
              className="h-14 text-xl font-semibold hover:bg-gray-50"
            >
              0
            </Button>
            <Button
              variant="ghost"
              disabled={loading}
              onClick={() => router.push('/')}
              className="h-14 text-gray-500 hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {loading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        )}
      </div>
    </div>
  );
}
