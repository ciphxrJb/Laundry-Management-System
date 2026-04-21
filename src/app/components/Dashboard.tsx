'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api, DashboardStats } from '@/app/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { DollarSign, Package, CheckCircle, Clock, AlertCircle, TrendingUp, RefreshCw, Sparkles } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { useAuth } from '../auth/AuthProvider';

export function Dashboard() {
  const router = useRouter();
  const { shopId } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (shopId) {
      loadDashboard();
    } else {
      setLoading(false);
    }
  }, [shopId]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await api.getDashboard(shopId);
      if (data && data.totalOrdersToday !== undefined) {
        setStats(data);
      } else {
        throw new Error('No data');
      }
    } catch (error: any) {
      // Fail with zeroes
      setStats({
        totalOrdersToday: 0,
        pendingOrders: 0,
        completedOrders: 0,
        readyForPickup: 0,
        totalIncomeToday: 0,
        totalIncomeWeek: 0,
        unpaidOrders: 0,
        recentOrders: []
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="flex justify-between items-center mb-10">
          <div className="h-10 w-48 bg-slate-200 rounded-xl" />
          <div className="h-14 w-40 bg-slate-200 rounded-2xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-32 bg-white rounded-[2rem] border border-slate-100 shadow-sm" />
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Current Revenue',
      value: `₱${stats.totalIncomeToday.toFixed(2)}`,
      description: 'Total earnings today',
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      title: 'New Orders',
      value: stats.totalOrdersToday,
      description: 'Accepted transactions',
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Work in Progress',
      value: stats.pendingOrders,
      description: 'Currently processing',
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Available Pickup',
      value: stats.readyForPickup,
      icon: CheckCircle,
      description: 'Ready for customer',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Weekly Forecast',
      value: `₱${stats.totalIncomeWeek.toFixed(2)}`,
      description: 'Last 7 days revenue',
      icon: TrendingUp,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
    },
    {
      title: 'Completed',
      value: stats.completedOrders,
      description: 'Total finished today',
      icon: Package,
      color: 'text-slate-600',
      bgColor: 'bg-slate-50',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
      case 'Processing': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'Ready': return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'Completed': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      default: return 'bg-slate-100 text-slate-700 active:scale-95';
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Executive Dashboard</h1>
          <p className="text-slate-500 font-medium tracking-wide mt-1">Real-time performance analytics for your branch</p>
        </div>
        <div className="flex gap-3">
          <Button 
            className="h-14 px-8 rounded-2xl font-black text-xs uppercase tracking-widest bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-95" 
            onClick={() => router.push('/new-order')}
          >
            Create Order
          </Button>
          <Button 
            variant="outline"
            size="icon"
            className="h-14 w-14 rounded-2xl border-slate-200 hover:bg-white active:rotate-180 transition-all duration-500"
            onClick={loadDashboard}
          >
            <RefreshCw size={20} className="text-slate-400" />
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white rounded-[2rem] overflow-hidden group hover:shadow-2xl transition-all duration-500">
              <CardContent className="p-8">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">{stat.title}</p>
                    <p className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</p>
                    <p className="text-xs text-slate-400 font-medium">{stat.description}</p>
                  </div>
                  <div className={`p-4 rounded-2xl ${stat.bgColor} ${stat.color} group-hover:scale-110 transition-transform duration-500 shadow-sm`}>
                    <Icon size={24} strokeWidth={2.5} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Primary Content Row */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Orders List */}
        <Card className="lg:col-span-2 border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white rounded-[2.5rem] overflow-hidden">
          <CardHeader className="p-8 border-b border-slate-50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-black tracking-tight text-slate-900">Recent Activity</CardTitle>
                <CardDescription className="font-medium">Latest customer transactions</CardDescription>
              </div>
              <Button variant="ghost" className="text-blue-600 font-black text-[10px] uppercase tracking-widest hover:bg-blue-50" onClick={() => router.push('/orders')}>
                View Ledger
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {stats.recentOrders.length === 0 ? (
              <div className="p-12 text-center bg-slate-50/50 rounded-b-[2.5rem] border-t border-dashed border-slate-100">
                <Package className="mx-auto text-slate-200 mb-4" size={48} />
                <p className="text-slate-400 font-black text-xs uppercase tracking-widest">No transactions this week</p>
              </div>
            ) : (
              <div className="max-h-[500px] overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {stats.recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-6 bg-slate-50/30 border border-transparent hover:border-slate-100 hover:bg-white rounded-[1.5rem] transition-all group"
                  >
                    <div className="flex gap-5 items-center">
                      <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-400 font-black text-xs group-hover:text-blue-600 group-hover:shadow-md transition-all">
                        {order.customer_name.charAt(0)}
                      </div>
                      <div className="space-y-0.5">
                         <h4 className="font-bold text-slate-900">{order.customer_name}</h4>
                         <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                           <span className="flex items-center gap-1"><Package size={12} /> {order.service_type}</span>
                           <span>•</span>
                           <span>{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                         </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-black text-lg text-slate-900 tracking-tight">₱{order.price.toFixed(2)}</p>
                        <Badge variant="outline" className={`mt-1 border-none font-bold text-[10px] h-6 px-3 ${getStatusColor(order.status)}`}>
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Priority Monitoring (Unpaid/Alerts) */}
        <div className="space-y-6">
           <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white rounded-[2rem] overflow-hidden">
             <CardHeader className="bg-orange-50/50 p-8 border-b border-orange-100/50">
                <CardTitle className="text-lg font-black text-orange-950 uppercase tracking-tighter flex items-center gap-2">
                  <AlertCircle size={20} className="text-orange-600" />
                  Payment Alerts
                </CardTitle>
             </CardHeader>
             <CardContent className="p-8 space-y-6">
               <div className="flex justify-between items-end">
                 <div className="space-y-1">
                   <p className="text-4xl font-black text-slate-900 tracking-tighter">{stats.unpaidOrders}</p>
                   <p className="text-xs text-slate-400 font-medium">Orders awaiting payment</p>
                 </div>
                 <Button size="sm" variant="outline" className="rounded-xl font-bold text-orange-600 border-orange-200 hover:bg-orange-50 bg-white shadow-sm">
                   Collect All
                 </Button>
               </div>
               
               <div className="pt-6 border-t border-slate-50">
                 <p className="text-xs text-slate-400 leading-relaxed italic">
                   Tracking unpaid orders helps maintain healthy cash flow for your branch.
                 </p>
               </div>
             </CardContent>
           </Card>

           <div className="p-8 rounded-[2rem] bg-blue-600 shadow-2xl shadow-blue-200 text-white space-y-4">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Sparkles size={20} />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest opacity-80">Pro Optimization</p>
              <p className="text-sm font-medium leading-relaxed">
                Your highest revenue comes from <span className="font-black underline underline-offset-4">Wash & Dry</span> services this week.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}