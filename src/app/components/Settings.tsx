'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { supabase } from '@/app/lib/supabase';
import { Store, Phone, MapPin, Save, Loader2, Lock } from 'lucide-react';

export function Settings() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const [shopName, setShopName] = useState('');
  const [shopAddress, setShopAddress] = useState('');
  const [shopPhone, setShopPhone] = useState('');
  const [adminPin, setAdminPin] = useState('');

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (session?.user?.user_metadata) {
          const meta = session.user.user_metadata;
          setShopName(meta.shop_name || 'Laundry POS');
          setShopAddress(meta.shop_address || '123 Main Street\nCityville');
          setShopPhone(meta.shop_phone || '0917-123-4567');
          setAdminPin(meta.admin_pin || '1234');
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setFetching(false);
      }
    }
    loadProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: {
          shop_name: shopName,
          shop_address: shopAddress,
          shop_phone: shopPhone,
          admin_pin: adminPin
        }
      });
      if (error) throw error;
      toast.success('Shop settings updated successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update shop metadata');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Shop Settings</h1>
          <p className="text-gray-600 mt-1">Manage your business profile and receipt details</p>
        </div>
      </div>

      <Card className="border-none shadow-xl bg-white rounded-2xl overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b">
          <CardTitle className="text-xl flex items-center gap-2">
            <Store className="text-blue-600" size={20} />
            Receipt Information
          </CardTitle>
          <CardDescription>
            This information will be printed on all physical and digital customer receipts.
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSave}>
          <CardContent className="space-y-5 pt-6">
            <div className="space-y-2">
              <Label htmlFor="shopName" className="font-bold">Business Name</Label>
              <div className="relative">
                <Store className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <Input
                  id="shopName"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="e.g. Wash & Fold Master"
                  className="pl-10 h-12 bg-slate-50 border-slate-200"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="shopPhone" className="font-bold">Contact Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <Input
                  id="shopPhone"
                  value={shopPhone}
                  onChange={(e) => setShopPhone(e.target.value)}
                  placeholder="e.g. 0917-123-4567"
                  className="pl-10 h-12 bg-slate-50 border-slate-200"
                  required
                />
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-slate-100">
              <Label htmlFor="adminPin" className="font-bold">Admin Security PIN</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <Input
                  id="adminPin"
                  type="password"
                  maxLength={4}
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 1234"
                  className="pl-10 h-12 bg-slate-50 border-slate-200"
                  required
                />
              </div>
              <p className="text-[11px] text-gray-500 italic">This 4-digit code is required to access the Manager Dashboard.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="shopAddress" className="font-bold">Business Address</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-gray-400" size={16} />
                <textarea
                  id="shopAddress"
                  value={shopAddress}
                  onChange={(e) => setShopAddress(e.target.value)}
                  placeholder="e.g. 143 Laundry Street, Manila"
                  className="w-full min-h-[100px] pl-10 pt-3 p-3 rounded-md border border-slate-200 bg-slate-50 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                  required
                />
              </div>
              <p className="text-[11px] text-gray-500 italic">Keep it short so it fits nicely on a thermal receipt printer.</p>
            </div>
          </CardContent>
          
          <CardFooter className="bg-slate-50/50 border-t pt-6 flex justify-end">
            <Button 
              type="submit" 
              className="h-12 px-8 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 shadow-md transition-all active:scale-95"
              disabled={loading}
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Saving Changes...</>
              ) : (
                <><Save className="w-5 h-5 mr-2" /> Save Settings</>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
