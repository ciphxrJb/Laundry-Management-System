'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';
import { Loader2, LogIn, Droplets, ShieldCheck, Sparkles, Building2 } from 'lucide-react';

export function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push('/');
      }
    });
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      toast.success('Successfully logged in!');
      router.push('/');
    } catch (error: any) {
      toast.error(error.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex overflow-hidden bg-white">
      {/* LEFT SIDE: Eye-catching Content/Animation */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 items-center justify-center p-12">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-600/20 blur-[100px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-600/20 blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative z-10 max-w-lg text-center">
          <div className="inline-flex p-4 bg-blue-600/10 rounded-3xl border border-blue-500/20 mb-8 backdrop-blur-sm">
            <Droplets className="w-12 h-12 text-blue-400" />
          </div>
          <h1 className="text-5xl font-extrabold text-white tracking-tight mb-4">
            Elevate Your <span className="text-blue-400 font-serif italic">Laundry</span> Business
          </h1>
          <p className="text-slate-400 text-lg font-medium tracking-wide">
            Smart Operations. Seamless Growth.
          </p>
        </div>

        <div className="absolute bottom-10 left-10 flex items-center gap-2 text-white/20">
          <Building2 size={20} />
          <span className="text-xs uppercase tracking-widest font-bold">Laundry Management System</span>
        </div>
      </div>

      {/* RIGHT SIDE: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="text-center mb-10 lg:hidden">
            <h1 className="text-3xl font-bold text-slate-900">Laundry POS</h1>
          </div>

          <Card className="border-none shadow-2xl rounded-3xl overflow-hidden bg-white">
            <CardHeader className="space-y-1 pb-8">
              <div className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">Login Profile</div>
              <CardTitle className="text-3xl font-bold">Welcome Back</CardTitle>
              <CardDescription>
                Sign in to access your dashboard
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-600">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 rounded-xl bg-slate-50 border-slate-100 focus:bg-white transition-all shadow-sm"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 rounded-xl bg-slate-50 border-slate-100 focus:bg-white transition-all shadow-sm"
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col pt-6">
                <Button className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-base font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all" disabled={loading} type="submit">
                  {loading ? (
                    <><Loader2 className="mr-2 animate-spin" size={18} /> Signing in...</>
                  ) : (
                    <><LogIn className="mr-2" size={18} /> Sign In</>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
