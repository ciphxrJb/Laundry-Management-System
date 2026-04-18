'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, Order } from '@/app/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
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
import { Trash2, Eye, RefreshCw, Search, Calculator, Timer, Wallet, ArrowUpRight, Phone, CheckCircle } from 'lucide-react';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

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
      toast.success(`Status updated to ${status}`);
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
    <div className="space-y-6 pb-12 animate-in fade-in duration-700">
      
      {/* STANDARD HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Order Registry</h1>
          <p className="text-gray-600 mt-1">Monitor and manage all laundry activity</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadOrders} disabled={loading} className="h-10 w-10 p-0">
            <RefreshCw size={18} className={loading ? 'animate-spin' : 'text-gray-500'} />
          </Button>
          <Button onClick={() => router.push('/new-order')} className="bg-blue-600">
            New Transaction
          </Button>
        </div>
      </div>

      {/* COMPACT STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Revenue Pool', val: `₱${stats.revenue.toLocaleString()}`, icon: Wallet, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Active Loads', val: stats.active, icon: Timer, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Unpaid Items', val: stats.unpaid, icon: Calculator, color: 'text-gray-900', bg: 'bg-gray-100' },
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">{stat.label}</p>
                <h4 className={`text-2xl font-bold ${stat.color}`}>{stat.val}</h4>
              </div>
              <div className={`p-3 ${stat.bg} ${stat.color} rounded-xl`}>
                <stat.icon size={20} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* UNIFIED LIST */}
      <Card>
        <div className="px-6 pt-6 pb-4 flex flex-col md:flex-row gap-4 justify-between items-center border-b">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList>
              {['all', 'pending', 'ready', 'completed'].map(t => (
                <TabsTrigger key={t} value={t} className="px-4 capitalize">
                  {t}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <Input
              placeholder="Search records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="divide-y">
          {loading ? (
            <div className="py-12 text-center text-gray-400 font-semibold text-sm">Loading records...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-12 text-center text-gray-400 font-semibold text-sm">No matching records found.</div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order.id} className="p-6 flex flex-col md:flex-row md:items-center gap-6 hover:bg-gray-50 transition-colors duration-200">
                
                {/* Customer Details */}
                <div className="flex-1 flex flex-col min-w-0">
                  <h3 className="text-lg font-bold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors" onClick={() => router.push(`/receipt/${order.id}`)}>
                    {order.customer_name}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1.5"><Phone size={14} /> {order.customer_phone || 'N/A'}</span>
                    <span>•</span>
                    <span>{new Date(order.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex items-center gap-4">
                  <div className="w-24">
                     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Service</p>
                     <Badge variant="outline" className="font-semibold">{order.service_type}</Badge>
                  </div>
                  <div className="w-16">
                     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Weight</p>
                     <span className="text-sm font-semibold text-gray-700">{order.weight}kg</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                  <div className="w-36">
                    <Select value={order.status} onValueChange={(val) => updateOrderStatus(order.id, val)}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="w-24 text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total</p>
                    <p className="text-lg font-bold text-gray-900">₱{order.price}</p>
                  </div>
                  
                  <div className="flex gap-2 justify-end">
                    <Button variant="ghost" size="icon" onClick={() => router.push(`/receipt/${order.id}`)} className="text-gray-400 hover:text-blue-600">
                      <Eye size={18} />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-500" onClick={() => setDeleteOrderId(order.id)}>
                      <Trash2 size={18} />
                    </Button>
                  </div>
                </div>

              </div>
            ))
          )}
        </div>
      </Card>

      <AlertDialog open={!!deleteOrderId} onOpenChange={() => setDeleteOrderId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Order?</AlertDialogTitle>
            <AlertDialogDescription>This transaction record will be removed permanently.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {toast.info('Feature disabled temporarily'); setDeleteOrderId(null);}} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
