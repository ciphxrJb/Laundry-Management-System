import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { api, Order } from '../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
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
import { Trash2, Eye, RefreshCw, Search } from 'lucide-react';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

export function OrderManagement() {
  const navigate = useNavigate();
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
      setOrders(data.orders);
    } catch (error) {
      console.error('Failed to load orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    // Filter by tab
    if (activeTab !== 'all') {
      filtered = filtered.filter(order => {
        if (activeTab === 'pending') return order.status === 'Pending' || order.status === 'Washing' || order.status === 'Drying';
        if (activeTab === 'ready') return order.status === 'Ready for pickup';
        if (activeTab === 'completed') return order.status === 'Completed';
        if (activeTab === 'unpaid') return order.paymentStatus === 'Unpaid';
        return true;
      });
    }

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(order =>
        order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.phone?.includes(searchQuery) ||
        order.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredOrders(filtered);
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      await api.updateOrder(orderId, { status });
      toast.success('Order status updated');
      loadOrders();
    } catch (error: any) {
      console.error('Failed to update order:', error);
      toast.error(error.message || 'Failed to update order');
    }
  };

  const updatePaymentStatus = async (orderId: string, paymentStatus: string) => {
    try {
      await api.updateOrder(orderId, { paymentStatus });
      toast.success('Payment status updated');
      loadOrders();
    } catch (error: any) {
      console.error('Failed to update payment:', error);
      toast.error(error.message || 'Failed to update payment');
    }
  };

  const deleteOrder = async () => {
    if (!deleteOrderId) return;

    try {
      await api.deleteOrder(deleteOrderId);
      toast.success('Order deleted');
      loadOrders();
      setDeleteOrderId(null);
    } catch (error: any) {
      console.error('Failed to delete order:', error);
      toast.error(error.message || 'Failed to delete order');
    }
  };

  const statusOptions = ['Pending', 'Washing', 'Drying', 'Ready for pickup', 'Completed'];

  const tabCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'Pending' || o.status === 'Washing' || o.status === 'Drying').length,
    ready: orders.filter(o => o.status === 'Ready for pickup').length,
    completed: orders.filter(o => o.status === 'Completed').length,
    unpaid: orders.filter(o => o.paymentStatus === 'Unpaid').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Order Management</h1>
          <p className="text-gray-600 mt-1">Track and manage all laundry orders</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadOrders} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span className="ml-2">Refresh</span>
          </Button>
          <Button onClick={() => navigate('/new-order')}>New Order</Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <Input
          placeholder="Search by customer name, phone, or order ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full md:w-auto">
          <TabsTrigger value="all">All ({tabCounts.all})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({tabCounts.pending})</TabsTrigger>
          <TabsTrigger value="ready">Ready ({tabCounts.ready})</TabsTrigger>
          <TabsTrigger value="completed">Done ({tabCounts.completed})</TabsTrigger>
          <TabsTrigger value="unpaid">Unpaid ({tabCounts.unpaid})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Orders ({filteredOrders.length})</CardTitle>
              <CardDescription>Manage order status and payments</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading orders...</div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No orders found. {searchQuery && 'Try a different search.'}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <div
                      key={order.id}
                      className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                    >
                      {/* Mobile Layout */}
                      <div className="md:hidden space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-lg">{order.customerName}</p>
                            <p className="text-sm text-gray-600">{order.phone || 'No phone'}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(order.createdAt).toLocaleString()}
                            </p>
                          </div>
                          <p className="font-bold text-xl text-blue-600">₱{order.price.toFixed(2)}</p>
                        </div>

                        <div className="flex gap-2 flex-wrap">
                          <Badge variant="outline">{order.serviceType}</Badge>
                          {order.weight && <Badge variant="outline">{order.weight} kg</Badge>}
                        </div>

                        <div className="space-y-2">
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Status</p>
                            <Select
                              value={order.status}
                              onValueChange={(value) => updateOrderStatus(order.id, value)}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {statusOptions.map((status) => (
                                  <SelectItem key={status} value={status}>
                                    {status}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <p className="text-xs text-gray-600 mb-1">Payment</p>
                            <Select
                              value={order.paymentStatus}
                              onValueChange={(value) => updatePaymentStatus(order.id, value)}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Paid">Paid</SelectItem>
                                <SelectItem value="Unpaid">Unpaid</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {order.notes && (
                          <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                            Note: {order.notes}
                          </p>
                        )}

                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1" onClick={() => navigate(`/receipt/${order.id}`)}>
                            <Eye size={16} />
                            <span className="ml-2">View</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteOrderId(order.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>

                      {/* Desktop Layout */}
                      <div className="hidden md:flex items-center gap-4">
                        <div className="flex-1">
                          <p className="font-bold text-lg">{order.customerName}</p>
                          <p className="text-sm text-gray-600">{order.phone || 'No phone'}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(order.createdAt).toLocaleString()}
                          </p>
                        </div>

                        <div className="flex flex-col items-center gap-1">
                          <Badge variant="outline">{order.serviceType}</Badge>
                          {order.weight && <span className="text-xs text-gray-600">{order.weight} kg</span>}
                        </div>

                        <div className="w-40">
                          <Select
                            value={order.status}
                            onValueChange={(value) => updateOrderStatus(order.id, value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {statusOptions.map((status) => (
                                <SelectItem key={status} value={status}>
                                  {status}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="w-32">
                          <Select
                            value={order.paymentStatus}
                            onValueChange={(value) => updatePaymentStatus(order.id, value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Paid">Paid</SelectItem>
                              <SelectItem value="Unpaid">Unpaid</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="text-right">
                          <p className="font-bold text-xl text-blue-600">₱{order.price.toFixed(2)}</p>
                        </div>

                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => navigate(`/receipt/${order.id}`)}>
                            <Eye size={16} />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteOrderId(order.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteOrderId} onOpenChange={() => setDeleteOrderId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Order?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the order from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteOrder} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
