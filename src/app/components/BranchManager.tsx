'use client';

import { useState, useEffect } from 'react';
import { api, ShopInfo } from '@/app/lib/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card';
import { toast } from 'sonner';
import { Plus, Building2, MapPin, ExternalLink, Loader2, Landmark } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';

export function BranchManager() {
  const { switchShop } = useAuth();
  const [shops, setShops] = useState<ShopInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');

  useEffect(() => {
    fetchShops();
  }, []);

  async function fetchShops() {
    try {
      const data = await api.getUserShops();
      setShops(data);
    } catch (err) {
      toast.error('Failed to load branches');
    } finally {
      setLoading(false);
    }
  }

  const handleCreate = async () => {
    if (!newBranchName.trim()) {
      toast.error('Please enter a branch name');
      return;
    }

    try {
      setLoading(true);
      const newShopId = await api.createShop(newBranchName);
      toast.success(`Success! ${newBranchName} has been created.`);
      setIsAdding(false);
      setNewBranchName('');
      
      // Refresh list
      const updatedShops = await api.getUserShops();
      setShops(updatedShops);
      
      // Option to switch immediately
      if (confirm(`Do you want to switch to ${newBranchName} now?`)) {
        await switchShop(newShopId);
        window.location.reload();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to create branch');
    } finally {
      setLoading(false);
    }
  };

  if (loading && shops.length === 0) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
      {/* Branch List Card */}
      <Card className="border-none shadow-xl bg-white rounded-[2rem] overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b p-6 flex flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
              <Landmark size={20} />
            </div>
            <div>
              <CardTitle className="text-xl font-black text-slate-900 tracking-tight">Branch Network</CardTitle>
              <p className="text-[11px] text-slate-500 font-medium">Managing {shops.length} total locations</p>
            </div>
          </div>
          <Button 
            onClick={() => setIsAdding(true)} 
            disabled={isAdding}
            className="h-10 px-6 bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-100 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95"
          >
            <Plus size={16} className="mr-1.5" /> Create Branch
          </Button>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="grid divide-y divide-slate-100">
            {isAdding && (
              <div className="p-6 bg-blue-50/20 animate-in slide-in-from-top-1 duration-300">
                <div className="max-w-md mx-auto space-y-4">
                  <div className="space-y-2 text-center">
                    <label className="text-[10px] font-black uppercase tracking-widest text-blue-500">New Branch Identity</label>
                    <Input 
                      value={newBranchName}
                      onChange={(e) => setNewBranchName(e.target.value)}
                      placeholder="e.g. South Mall Branch"
                      className="h-12 rounded-xl bg-white border-blue-100 font-bold px-6 text-center shadow-sm"
                      autoFocus
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1 h-10 rounded-lg bg-blue-600 hover:bg-blue-700 font-black text-[10px] uppercase tracking-widest"
                      onClick={handleCreate}
                      disabled={loading}
                    >
                      {loading ? 'Creating...' : 'Initialize Branch'}
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="h-10 px-4 rounded-lg text-slate-400 font-bold text-xs"
                      onClick={() => setIsAdding(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {shops.map((shop) => (
              <div key={shop.id} className="px-8 py-5 flex items-center justify-between hover:bg-slate-50/50 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 group-hover:bg-blue-50 group-hover:border-blue-100 group-hover:text-blue-500 transition-all shadow-sm">
                    <Building2 size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 text-sm tracking-tight">{shop.name}</h3>
                    <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-tighter">
                      <Landmark size={10} />
                      {shop.organization.name}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="rounded-lg h-9 text-slate-300 hover:text-blue-600 hover:bg-blue-50 font-black uppercase text-[10px] tracking-widest transition-all px-4 opacity-0 group-hover:opacity-100"
                    onClick={async () => {
                        await switchShop(shop.id);
                        toast.success(`Switched to ${shop.name}`);
                    }}
                  >
                    <ExternalLink size={14} className="mr-2" /> Manage
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <div className="p-6 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex items-start gap-4">
         <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-indigo-500 shrink-0 shadow-sm">
           <Landmark size={16} />
         </div>
         <div className="space-y-0.5">
           <h4 className="font-black text-indigo-900 text-[10px] uppercase tracking-widest">Branch Insights</h4>
           <p className="text-[11px] text-indigo-700/70 font-medium leading-relaxed">
             New branches inherit your organization settings but operate their own isolated customer and transaction ledger.
           </p>
         </div>
      </div>
    </div>
  );
}
