'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { supabase } from '@/app/lib/supabase';
import { Store, Phone, MapPin, Save, Loader2, Lock, Droplets, Users, Landmark } from 'lucide-react';
import { ServiceManager } from './ServiceManager';
import { StaffManager } from './StaffManager';
import { BranchManager } from './BranchManager';
import { useAuth } from '../auth/AuthProvider';

export function Settings() {
  const { shopId } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'services' | 'staff' | 'organization'>('profile');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const [shopName, setShopName] = useState('');
  const [shopAddress, setShopAddress] = useState('');
  const [shopPhone, setShopPhone] = useState('');
  const [adminPin, setAdminPin] = useState('');

  useEffect(() => {
    async function loadProfile() {
      if (!shopId) {
        setFetching(false);
        return;
      }

      try {
        setFetching(true);
        // Fetch specific shop metadata from the API/Database instead of just user_metadata
        const { data: shop, error: shopErr } = await supabase
          .from('shops')
          .select('*')
          .eq('id', shopId)
          .single();

        if (shopErr) throw shopErr;
        
        setShopName(shop.name || '');
        setShopAddress(shop.address || ''); 
        setShopPhone(shop.phone || '');
        setAdminPin(shop.admin_pin || '1234');
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setFetching(false);
      }
    }
    loadProfile();
  }, [shopId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase
        .from('shops')
        .update({
          name: shopName,
          address: shopAddress,
          phone: shopPhone,
          admin_pin: adminPin
        })
        .eq('id', shopId);

      if (error) throw error;
      toast.success('Branch settings updated successfully!');
      
      // Give the DB a moment, then refresh to sync with Sidebar/Switcher
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update shop metadata');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Branch Profile', icon: Store },
    { id: 'services', label: 'Laundry Services', icon: Droplets },
    { id: 'staff', label: 'Staff & Security', icon: Users },
    { id: 'organization', label: 'Organization', icon: Landmark },
  ];

  if (fetching && !shopName) {
    return (
      <div className="space-y-10 max-w-5xl mx-auto pb-12 animate-pulse">
        <div className="flex flex-col items-center gap-4 mb-10">
          <div className="h-12 w-64 bg-slate-200 rounded-2xl" />
          <div className="h-4 w-48 bg-slate-100 rounded-xl" />
        </div>
        <div className="flex justify-center gap-2 mb-12">
          {[1,2,3,4].map(i => <div key={i} className="h-12 w-32 bg-slate-100 rounded-full" />)}
        </div>
        <div className="h-[600px] w-full bg-white rounded-[3rem] shadow-sm border border-slate-100" />
      </div>
    );
  }

  
  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-in fade-in duration-500">
      {/* Modern Segmented Control (Centered) */}
      <div className="flex justify-center">
        <div className="bg-slate-100/60 backdrop-blur-md p-1 rounded-full flex gap-1 border border-slate-200/50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-2 rounded-full transition-all duration-300 text-xs font-bold ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm border border-slate-200 scale-105'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <tab.icon size={14} className={activeTab === tab.id ? 'text-blue-600' : 'text-slate-400'} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="mt-2 relative">
        
        {/* Branch Profile */}
        <div className={activeTab === 'profile' ? 'block animate-in fade-in zoom-in-95 duration-500' : 'hidden'}>
          <Card className="border-none shadow-xl bg-white rounded-[2rem] overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b p-6 flex flex-row items-center gap-4 text-left">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
                <Store size={24} />
              </div>
              <div>
                <CardTitle className="text-xl font-black text-slate-900 tracking-tight">Branch Profile</CardTitle>
                <p className="text-[11px] text-slate-500 font-medium">Manage business information and security</p>
              </div>
            </CardHeader>
            
            <form onSubmit={handleSave}>
              <CardContent className="p-8 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Column 1 */}
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="shopName" className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Business Name</Label>
                      <Input
                        id="shopName"
                        value={shopName}
                        onChange={(e) => setShopName(e.target.value)}
                        placeholder="e.g. Wash & Fold Master"
                        className="h-12 bg-slate-50/50 border-slate-100 rounded-xl font-bold focus:bg-white transition-all px-4"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                       <Label htmlFor="shopPhone" className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Contact Phone</Label>
                       <Input
                         id="shopPhone"
                         value={shopPhone}
                         onChange={(e) => setShopPhone(e.target.value)}
                         placeholder="e.g. 0917-123-4567"
                         className="h-12 bg-slate-50/50 border-slate-100 rounded-xl font-bold focus:bg-white transition-all px-4"
                         required
                       />
                    </div>
                  </div>

                  {/* Column 2 */}
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="shopAddress" className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Physical Address</Label>
                      <textarea
                        id="shopAddress"
                        value={shopAddress}
                        onChange={(e) => setShopAddress(e.target.value)}
                        placeholder="e.g. 143 Laundry Street, Manila"
                        className="w-full h-12 min-h-12 max-h-32 p-3 rounded-xl border border-slate-100 bg-slate-50/50 text-sm font-bold focus:bg-white transition-all outline-none leading-relaxed"
                        required
                      />
                    </div>

                    <div className="p-4 bg-red-50/30 rounded-2xl border border-red-100/50 space-y-2">
                      <div className="flex items-center justify-between">
                         <Label htmlFor="adminPin" className="text-[10px] font-black uppercase tracking-widest text-red-400 px-1">Security PIN</Label>
                         <Lock size={12} className="text-red-300" />
                      </div>
                      <Input
                        id="adminPin"
                        type="password"
                        maxLength={4}
                        value={adminPin}
                        onChange={(e) => setAdminPin(e.target.value.replace(/\D/g, ''))}
                        placeholder="••••"
                        className="h-10 bg-white border-red-100 rounded-xl font-mono tracking-[0.6em] text-center text-lg shadow-sm"
                        required
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="bg-slate-50/50 border-t p-6 flex justify-end">
                <Button 
                  type="submit" 
                  className="h-12 px-8 rounded-xl font-black uppercase tracking-widest text-[10px] bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95 flex gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                  ) : (
                    <><Save className="w-4 h-4" /> Update Profile</>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>

        {/* Laundry Services */}
        <div className={activeTab === 'services' ? 'block animate-in fade-in zoom-in-95 duration-500' : 'hidden'}>
          <ServiceManager />
        </div>

        {/* Staff & Security */}
        <div className={activeTab === 'staff' ? 'block animate-in fade-in zoom-in-95 duration-500' : 'hidden'}>
          <StaffManager />
        </div>

        {/* Organization */}
        <div className={activeTab === 'organization' ? 'block animate-in fade-in zoom-in-95 duration-500' : 'hidden'}>
          <BranchManager />
        </div>

      </div>
    </div>
  );
}
