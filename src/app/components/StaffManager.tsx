'use client';

import { useState, useEffect } from 'react';
import { api, Staff } from '@/app/lib/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';
import { Plus, Trash2, UserPlus, ShieldCheck, Asterisk, Loader2 } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
export function StaffManager() {
  const { shopId } = useAuth();
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    pin: '',
  });

  useEffect(() => {
    if (shopId) {
      fetchStaff();
    } else {
      setLoading(false);
    }
  }, [shopId]);

  async function fetchStaff() {
    try {
      setLoading(true);
      const data = await api.getStaff(shopId);
      setStaffList(data);
    } catch (err) {
      toast.error('Failed to load staff list');
    } finally {
      setLoading(false);
    }
  }

  const handleAdd = async () => {
    if (!formData.name || formData.pin.length !== 4) {
      toast.error('Name and a 4-digit PIN are required');
      return;
    }

    try {
      setLoading(true);
      await api.createStaff({
        name: formData.name,
        pin: formData.pin,
      }, shopId);
      toast.success('Staff member added successfully');
      setIsAdding(false);
      setFormData({ name: '', pin: '' });
      fetchStaff();
    } catch (err: any) {
      toast.error(err.message || 'Failed to add staff');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure? This person will no longer be able to log orders.')) return;
    try {
      setLoading(true);
      await api.deleteStaff(id);
      toast.success('Staff access revoked');
      fetchStaff();
    } catch (err) {
      toast.error('Failed to remove staff');
    } finally {
      setLoading(false);
    }
  };

  if (loading && staffList.length === 0) {
    return (
      <div className="flex justify-center p-12 bg-white rounded-3xl animate-pulse">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <Card className="border-none shadow-xl bg-white rounded-[2rem] overflow-hidden">
      <CardHeader className="bg-slate-50/50 border-b p-6 flex flex-row items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
            <ShieldCheck size={20} />
          </div>
          <div>
            <CardTitle className="text-xl font-black text-slate-900 tracking-tight">Staff & Security</CardTitle>
            <p className="text-[11px] text-slate-500 font-medium">Manage access PINs for this branch</p>
          </div>
        </div>
        <Button 
          onClick={() => setIsAdding(true)} 
          disabled={isAdding}
          className="bg-blue-600 hover:bg-blue-700 h-10 rounded-xl font-black text-[10px] uppercase tracking-widest px-6 shadow-md shadow-blue-100 transition-all active:scale-95 flex gap-2"
        >
          <UserPlus size={16} /> Add Staff Member
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/30 text-slate-400 text-[10px] uppercase tracking-[0.2em] font-black border-b">
                <th className="px-8 py-4">Crew Member</th>
                <th className="px-8 py-4 text-center">Security PIN</th>
                <th className="px-8 py-4 text-right">Operational Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isAdding && (
                <tr className="bg-blue-50/20 animate-in slide-in-from-top-1 duration-300">
                  <td className="px-8 py-3">
                    <Input 
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      placeholder="Staff Full Name"
                      className="h-10 bg-white border-blue-100 rounded-lg text-sm font-bold"
                    />
                  </td>
                  <td className="px-8 py-3 flex justify-center">
                    <Input 
                      type="password"
                      maxLength={4}
                      value={formData.pin} 
                      onChange={e => setFormData({...formData, pin: e.target.value.replace(/\D/g, '')})}
                      placeholder="PIN"
                      className="h-10 w-24 text-center bg-white border-blue-100 rounded-lg text-sm font-bold tracking-[0.3em]"
                    />
                  </td>
                  <td className="px-8 py-3 text-right">
                    <div className="flex justify-end gap-2">
                       <Button size="sm" className="bg-green-600 hover:bg-green-700 h-9 rounded-lg px-6 font-bold text-xs" onClick={handleAdd}>
                        Confirm
                      </Button>
                      <Button size="sm" variant="ghost" className="text-slate-400 h-9 px-4 font-bold text-xs" onClick={() => setIsAdding(false)}>
                        Cancel
                      </Button>
                    </div>
                  </td>
                </tr>
              )}
              
              {staffList.map((staff) => (
                <tr key={staff.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-black text-xs border border-slate-200 group-hover:bg-blue-50 group-hover:border-blue-100 group-hover:text-blue-500 transition-all">
                        {staff.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-black text-slate-900 text-sm tracking-tight">{staff.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-4 text-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest border border-slate-200 group-hover:bg-green-50 group-hover:text-green-600 group-hover:border-green-100 transition-all">
                      <ShieldCheck size={10} className="mr-1.5" /> Encrypted
                    </span>
                  </td>
                  <td className="px-8 py-4 text-right">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg px-4 font-black uppercase text-[10px] tracking-widest transition-all opacity-0 group-hover:opacity-100" 
                      onClick={() => handleDelete(staff.id)}
                    >
                      <Trash2 size={14} className="mr-2" /> Revoke Access
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {shopId && staffList.length === 0 && !isAdding && !loading && (
            <div className="p-16 text-center text-slate-300 font-black text-xs uppercase tracking-widest">
              No staff assigned to this branch.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
