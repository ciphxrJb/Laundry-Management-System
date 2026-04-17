'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { DollarSign, Package, CheckCircle, Clock, AlertCircle, TrendingUp } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { DemoDataButton } from './DemoDataButton';

const initialStats = {
  totalOrdersToday: 5,
  pendingOrders: 2,
  completedOrders: 3,
  readyForPickup: 1,
  totalIncomeToday: 420.0,
  totalIncomeWeek: 2850.0,
  unpaidOrders: 1,
  recentOrders: [
    {
      id: 'order-1',
      customerId: 'cust-1',
      customerName: 'Juan Dela Cruz',
      phone: '09171234567',
      serviceType: 'Wash + Dry + Fold',
      weight: 5.5,
      price: 120,
      status: 'Ready for pickup',
      paymentStatus: 'Paid',
      notes: 'Please use fabric softener',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'order-2',
      customerId: 'cust-2',
      customerName: 'Maria Santos',
      phone: '09189876543',
      serviceType: 'Wash + Dry',
      weight: 3.2,
      price: 80,
      status: 'Pending',
      paymentStatus: 'Unpaid',
      notes: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'order-3',
      customerId: 'cust-3',
      customerName: 'Pedro Reyes',
      phone: '09175678901',
      serviceType: 'Wash',
      weight: 2.1,
      price: 50,
      status: 'Completed',
      paymentStatus: 'Paid',
      notes: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
};

export function Dashboard() {
  const router = useRouter();
  const [stats] = useState(initialStats);

  const statCards = [
    {
      title: 'Orders Today',
      value: stats.totalOrdersToday,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'Ready for Pickup',
      value: stats.readyForPickup,
      icon: AlertCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Completed',
      value: stats.completedOrders,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Income Today',
      value: `₱${stats.totalIncomeToday.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
    {
      title: 'Income This Week',
      value: `₱${stats.totalIncomeWeek.toFixed(2)}`,
      icon: TrendingUp,
      color: 'text-teal-600',
      bgColor: 'bg-teal-100',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Washing': return 'bg-blue-100 text-blue-800';
      case 'Drying': return 'bg-cyan-100 text-cyan-800';
      case 'Ready for pickup': return 'bg-purple-100 text-purple-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentColor = (status: string) => {
    return status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's your shop overview</p>
        </div>
        <div className="flex gap-2">
          <DemoDataButton />
          <Button size="lg" onClick={() => router.push('/new-order')}>New Order</Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">{stat.title}</p>
                    <p className="text-3xl font-bold mt-2">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <Icon className={`${stat.color}`} size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Unpaid Orders Alert */}
      {stats.unpaidOrders > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="text-orange-600" size={20} />
              <p className="text-orange-800 font-medium">
                You have {stats.unpaidOrders} unpaid order{stats.unpaidOrders > 1 ? 's' : ''}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Latest transactions from your shop</CardDescription>
            </div>
            <Button variant="outline" onClick={() => router.push('/orders')}>View All</Button>
          </div>
        </CardHeader>
        <CardContent>
          {stats.recentOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No orders yet. Create your first order to get started!
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold">{order.customerName}</p>
                      <Badge variant="outline" className="text-xs">
                        {order.serviceType}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      {order.phone || 'No phone'} • {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-bold text-lg">₱{order.price.toFixed(2)}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge className={getStatusColor(order.status)} variant="secondary">
                          {order.status}
                        </Badge>
                        <Badge className={getPaymentColor(order.paymentStatus)} variant="secondary">
                          {order.paymentStatus}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}