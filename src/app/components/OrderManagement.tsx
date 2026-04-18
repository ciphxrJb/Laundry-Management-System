'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, Order } from '@/app/lib/api';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { toast } from 'sonner';
import { Trash2, Eye, RefreshCw, Search, Calculator, Timer, CheckCircle, Wallet, Phone, ArrowUpRight } from 'lucide-react';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

/**
 * COMPLIANCE: Design System v1.0
 * - Unified with Selection Page DNA
 * - Radius: rounded-[2rem]
 * - Background: bg-slate-50
 * - Typography: text-3xl font-bold
 */

export function OrderManagement() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteOrderId, setDeleteOrderId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchQuery, activeTab]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await api.getOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;
    if (activeTab !== 'all') {
      filtered = filtered.filter(order => {
        if (activeTab === 'pending') return order.status === 'Pending' || order.status === 'Processing';
        if (activeTab === 'ready') return order.status === 'Ready';
        if (activeTab === 'completed') return order.status === 'Completed';
        if (activeTab === 'unpaid') return order.payment_status === 'Unpaid';
        return true;
      });
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(order =>
        (order.customer_name?.toLowerCase() || '').includes(q) ||
        (order.customer_phone || '').includes(q)
      );
    }
    setFilteredOrders(filtered);
  };

  const updateOrderStatus = async (orderId: string, status: any) => {
    try {
      await api.updateOrderStatus(orderId, status);
      toast.success(`Status: ${status}`);
      loadOrders();
    } catch (error: any) {
      toast.error('Sync failed');
    }
  };

  const statusOptions = ['Pending', 'Processing', 'Ready', 'Completed', 'Cancelled'];

  const stats = {
    revenue: orders.reduce((sum, o) => sum + Number(o.price || 0), 0),
    active: orders.filter(o => o.status === 'Pending' || o.status === 'Processing').length,
    unpaid: orders.filter(o => o.payment_status === 'Unpaid').length
  };

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-700">
      
      {/* STANDARD HEADER DNA */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div>
          <div className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-3">Management Console</div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Active Registries</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Real-time operational monitoring and control.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={loadOrders} disabled={loading} className="h-12 w-12 rounded-xl bg-white border-slate-100 shadow-sm active:scale-95 transition-all">
            <RefreshCw size={18} className={loading ? 'animate-spin' : 'text-slate-400'} />
          </Button>
          <Button onClick={() => router.push('/new-order')} className="h-12 bg-blue-600 rounded-xl px-8 font-bold text-white shadow-xl shadow-blue-200 active:scale-95 transition-all">
            New Transaction
          </Button>
        </div>
      </div>

      {/* COMPACT STATS PLATES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Revenue Pool', val: `₱${stats.revenue.toLocaleString()}`, icon: Wallet, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Active Loads', val: stats.active, icon: Timer, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Unpaid Items', val: stats.unpaid, icon: Calculator, color: 'text-slate-900', bg: 'bg-slate-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-50 flex items-center justify-between">
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <h4 className={`text-2xl font-bold ${stat.color}`}>{stat.val}</h4>
            </div>
            <div className={`p-3 ${stat.bg} ${stat.color} rounded-2xl`}>
              <stat.icon size={20} />
            </div>
          </div>
        ))}
      </div>

      {/* UNIFIED LIST PLATE */}
      <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2rem] overflow-hidden bg-white">
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="px-8 pt-8 pb-6 flex flex-col md:flex-row gap-6 justify-between items-center border-b border-slate-50">
              <TabsList className="bg-slate-50 p-1.5 rounded-2xl h-auto">
                {['all', 'pending', 'ready', 'completed'].map(t => (
                  <TabsTrigger key={t} value={t} className="rounded-xl px-6 py-2 font-bold text-[10px] uppercase tracking-widest leading-none">
                    {t}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              <div className="relative w-full md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <Input
                  placeholder="Filter records..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-11 bg-slate-50 border-none rounded-xl text-sm font-medium"
                />
              </div>
            </div>

            <div className="divide-y divide-slate-50">
              {loading ? (
                <div className="py-24 text-center text-slate-300 font-bold uppercase text-[10px] tracking-widest">Synchronizing...</div>
              ) : filteredOrders.length === 0 ? (
                <div className="py-24 text-center text-slate-300 font-bold uppercase text-[10px] tracking-widest">No matching records</div>
              ) : (
                filteredOrders.map((order) => (
                  <div key={order.id} className="group p-8 flex flex-col md:flex-row md:items-center gap-8 hover:bg-slate-50/50 transition-all duration-300">
                    
                    {/* Customer Core */}
                    <div className="flex-1 flex items-center gap-5">
                      <div className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center shadow-sm text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                        <ArrowUpRight size={20} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-lg font-bold text-slate-900 tracking-tight leading-none mb-2 hover:text-blue-600 cursor-pointer transition-colors uppercase" onClick={() => router.push(`/receipt/${order.id}`)}>
                          {order.customer_name}
                        </h3>
                        <div className="flex items-center gap-3 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                          <span className="flex items-center gap-1"><Phone size={10} /> {order.customer_phone || 'N/A'}</span>
                          <span className="opacity-30">|</span>
                          <span>{new Date(order.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>

                    {/* Stats Strip */}
                    <div className="flex items-center gap-10">
                      <div className="hidden lg:block text-center min-w-[100px]">
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1">Service Type</p>
                        <Badge variant="secondary" className="bg-slate-100 text-slate-600 rounded-lg px-2 text-[9px] uppercase font-black">{order.service_type}</Badge>
                      </div>
                      <div className="text-right min-w-[80px]">
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1">Total</p>
                        <p className="text-xl font-bold text-slate-900">₱{order.price}</p>
                      </div>
                    </div>

                    {/* Action Hub */}
                    <div className="flex items-center gap-3 md:pl-6 md:border-l md:border-slate-50">
                      <div className="w-40">
                        <Select value={order.status} onValueChange={(val) => updateOrderStatus(order.id, val)}>
                          <SelectTrigger className={`h-11 rounded-xl border-none font-bold text-[10px] uppercase tracking-widest transition-all ${
                            order.status === 'Ready' ? 'bg-green-100 text-green-700' :
                            order.status === 'Processing' ? 'bg-blue-100 text-blue-700' :
                            'bg-slate-100 text-slate-500'
                          }`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-none shadow-2xl">
                            {statusOptions.map(opt => <SelectItem key={opt} value={opt} className="font-bold text-[10px] uppercase tracking-widest">{opt}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button variant="outline" size="icon" onClick={() => router.push(`/receipt/${order.id}`)} className="h-11 w-11 rounded-xl bg-white border-slate-100 text-slate-300 hover:text-blue-600 hover:border-blue-100 active:scale-95 transition-all">
                        <Eye size={18} />
                      </Button>
                      <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl bg-white border-slate-100 text-slate-300 hover:text-red-500 hover:border-red-100 active:scale-95 transition-all" onClick={() => setDeleteOrderId(order.id)}>
                        <Trash2 size={18} />
                      </Button>
                    </div>

                  </div>
                ))
              )}
            </div>
          </Tabs>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteOrderId} onOpenChange={() => setDeleteOrderId(null)}>
        <AlertDialogContent className="rounded-[2.5rem] border-none shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-bold text-xl uppercase tracking-tight">Delete Registry Entry?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 font-medium">This transaction record will be removed permanently from the registry. This action cannot be reversed.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 pt-4">
            <AlertDialogCancel className="rounded-xl border-slate-100 font-black text-[10px] uppercase tracking-widest">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => setDeleteOrderId(null)} className="rounded-xl bg-red-600 font-black text-[10px] uppercase tracking-widest shadow-xl shadow-red-100">Confirm Removal</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
