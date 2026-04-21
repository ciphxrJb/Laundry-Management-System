'use client';

import { useState, useEffect } from 'react';
import { api, Service } from '@/app/lib/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';
import { Plus, Trash2, Edit2, Check, X, Loader2, IndianRupee } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { Droplets } from 'lucide-react';

export function ServiceManager() {
  const { shopId } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    base_price: '',
    price_per_kg: '',
  });

  useEffect(() => {
    if (shopId) {
      fetchServices();
    } else {
      setLoading(false);
    }
  }, [shopId]);

  async function fetchServices() {
    try {
      setLoading(true);
      const data = await api.getServices(shopId);
      setServices(data);
    } catch (err) {
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  }

  const handleAdd = async () => {
    if (!formData.name || !formData.base_price) {
      toast.error('Name and Base Price are required');
      return;
    }

    try {
      setLoading(true);
      await api.createService({
        name: formData.name,
        description: '',
        base_price: Number(formData.base_price),
        price_per_kg: Number(formData.price_per_kg || 0),
      }, shopId);
      toast.success('Service added successfully');
      setIsAdding(false);
      setFormData({ name: '', base_price: '', price_per_kg: '' });
      fetchServices();
    } catch (err) {
      toast.error('Failed to create service');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      setLoading(true);
      await api.updateService(id, {
        name: formData.name,
        base_price: Number(formData.base_price),
        price_per_kg: Number(formData.price_per_kg),
      });
      toast.success('Service updated');
      setEditingId(null);
      fetchServices();
    } catch (err) {
      toast.error('Failed to update service');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure? This will remove the service from the POS selection.')) return;
    try {
      setLoading(true);
      await api.deleteService(id);
      toast.success('Service deactivated');
      fetchServices();
    } catch (err) {
      toast.error('Failed to delete service');
    } finally {
      setLoading(false);
    }
  };

  const handleSeedDefaults = async () => {
    try {
      setLoading(true);
      await api.seedDefaultServices(shopId);
      toast.success('Starter services added!');
      fetchServices();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add starter services');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (service: Service) => {
    setEditingId(service.id);
    setFormData({
      name: service.name,
      base_price: service.base_price.toString(),
      price_per_kg: service.price_per_kg.toString(),
    });
  };

  if (loading && services.length === 0) {
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
            <Droplets size={20} />
          </div>
          <div>
            <CardTitle className="text-xl font-black text-slate-900 tracking-tight">Service Directory</CardTitle>
            <p className="text-[11px] text-slate-500 font-medium">Set pricing strategies for this branch</p>
          </div>
        </div>
        <Button 
          onClick={() => setIsAdding(true)} 
          disabled={isAdding}
          className="bg-blue-600 hover:bg-blue-700 h-10 rounded-xl font-black text-[10px] uppercase tracking-widest px-6 shadow-md shadow-blue-100 transition-all active:scale-95"
        >
          <Plus size={16} className="mr-1.5" /> Add New Service
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/30 text-slate-400 text-[10px] uppercase tracking-[0.2em] font-black border-b">
                <th className="px-8 py-4">Service Name</th>
                <th className="px-8 py-4 text-right">Base Price</th>
                <th className="px-8 py-4 text-right">Per KG</th>
                <th className="px-8 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isAdding && (
                <tr className="bg-blue-50/20 animate-in slide-in-from-top-1 duration-300">
                  <td className="px-8 py-3">
                    <Input 
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      placeholder="e.g. Wash & Fold"
                      className="h-9 bg-white border-blue-200 rounded-lg text-sm font-bold"
                    />
                  </td>
                  <td className="px-8 py-3">
                    <Input 
                      type="number"
                      value={formData.base_price} 
                      onChange={e => setFormData({...formData, base_price: e.target.value})}
                      placeholder="0.00"
                      className="h-9 text-right bg-white border-blue-200 rounded-lg text-sm font-bold"
                    />
                  </td>
                  <td className="px-8 py-3">
                    <Input 
                      type="number"
                      value={formData.price_per_kg} 
                      onChange={e => setFormData({...formData, price_per_kg: e.target.value})}
                      placeholder="0.00"
                      className="h-9 text-right bg-white border-blue-200 rounded-lg text-sm font-bold"
                    />
                  </td>
                  <td className="px-8 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600 hover:bg-green-50" onClick={handleAdd}>
                        <Check size={18} />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:bg-slate-100" onClick={() => setIsAdding(false)}>
                        <X size={18} />
                      </Button>
                    </div>
                  </td>
                </tr>
              )}
              
              {services.map((service) => (
                <tr key={service.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-4 font-black text-slate-800 text-sm tracking-tight">
                    {editingId === service.id ? (
                      <Input 
                        value={formData.name} 
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="h-9 bg-white font-bold"
                      />
                    ) : (
                      service.name
                    )}
                  </td>
                  <td className="px-8 py-4 text-right">
                    {editingId === service.id ? (
                      <Input 
                        type="number"
                        value={formData.base_price} 
                        onChange={e => setFormData({...formData, base_price: e.target.value})}
                        className="h-9 text-right bg-white font-bold"
                      />
                    ) : (
                      <span className="font-bold text-slate-900">₱{service.base_price.toFixed(2)}</span>
                    )}
                  </td>
                  <td className="px-8 py-4 text-right">
                    {editingId === service.id ? (
                      <Input 
                        type="number"
                        value={formData.price_per_kg} 
                        onChange={e => setFormData({...formData, price_per_kg: e.target.value})}
                        className="h-9 text-right bg-white font-bold"
                      />
                    ) : (
                      <span className="text-slate-500 font-bold text-xs uppercase tracking-tighter">₱{service.price_per_kg.toFixed(2)}/kg</span>
                    )}
                  </td>
                  <td className="px-8 py-4 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {editingId === service.id ? (
                        <>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600 hover:bg-green-50" onClick={() => handleUpdate(service.id)}>
                            <Check size={18} />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:bg-slate-100" onClick={() => setEditingId(null)}>
                            <X size={18} />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-600 hover:bg-blue-50" onClick={() => startEdit(service)}>
                            <Edit2 size={16} />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-red-300 hover:text-red-500 hover:bg-red-50" onClick={() => handleDelete(service.id)}>
                            <Trash2 size={16} />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {shopId && services.length === 0 && !isAdding && !loading && (
            <div className="p-20 text-center animate-in fade-in zoom-in duration-500">
               <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-200">
                 <Droplets size={32} />
               </div>
               <p className="text-slate-900 font-bold text-lg tracking-tight">No services defined.</p>
               <p className="text-slate-500 text-sm mt-1 mb-8 max-w-xs mx-auto">Set up your pricing structure manually or use our recommended starter templates.</p>
               <Button 
                onClick={handleSeedDefaults}
                variant="outline"
                className="rounded-xl border-blue-200 text-blue-600 font-bold hover:bg-blue-600 hover:text-white transition-all shadow-lg shadow-blue-50"
              >
                Quick-Start with Default Services
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
