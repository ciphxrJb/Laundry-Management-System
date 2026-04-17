'use client';

import { useRouter } from 'next/navigation';
import { Settings, Monitor, Droplets, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

export default function ModeSelection() {
  const router = useRouter();

  const selectMode = (mode: 'system' | 'admin') => {
    localStorage.setItem('appMode', mode);
    
    if (mode === 'system') {
      router.push('/new-order');
    } else {
      toast.success('Welcome Admin');
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-50">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-400/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-400/20 blur-[120px] pointer-events-none" />

      <div className="max-w-5xl w-full px-6 relative z-10 -mt-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-sm mb-6 border border-slate-100">
            <Droplets className="text-blue-500 w-8 h-8" />
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-4">
            Laundry<span className="text-blue-600">POS</span>
          </h1>
          <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto font-medium">
            Select your operating environment to continue
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* System Mode Action */}
          <button 
            onClick={() => selectMode('system')}
            className="group relative text-left bg-white/60 backdrop-blur-xl border border-white/80 p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 block w-full"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-3xl" />
            
            <div className="flex items-start justify-between mb-6">
              <div className="p-4 bg-blue-50 rounded-2xl group-hover:bg-blue-100 transition-colors">
                <Monitor className="w-8 h-8 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                <ChevronRight className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-slate-900 mb-2">System POS</h2>
            <p className="text-slate-500 leading-relaxed">
              For cashiers and staff operations. Create new orders, manage customers, and process active laundry batches.
            </p>
          </button>

          {/* Admin Mode Action */}
          <button 
            onClick={() => selectMode('admin')}
            className="group relative text-left bg-white/60 backdrop-blur-xl border border-white/80 p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 block w-full"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-3xl" />
            
            <div className="flex items-start justify-between mb-6">
              <div className="p-4 bg-purple-50 rounded-2xl group-hover:bg-purple-100 transition-colors">
                <Settings className="w-8 h-8 text-purple-600 group-hover:rotate-90 transition-transform duration-500" />
              </div>
              <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                <ChevronRight className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Administration</h2>
            <p className="text-slate-500 leading-relaxed">
              For managers and owners. View financial reports, configure business settings, and manage staff accounts.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
