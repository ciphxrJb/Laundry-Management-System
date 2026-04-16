import { useEffect, useState } from 'react';
import { api, Customer, Order } from '../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { toast } from 'sonner';
import { Search, User, Phone, Calendar, DollarSign, Package } from 'lucide-react';

export function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    filterCustomers();
  }, [customers, searchQuery]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await api.getCustomers();
      setCustomers(data.customers);
    } catch (error) {
      console.error('Failed to load customers:', error);
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const filterCustomers = () => {
    if (!searchQuery) {
      setFilteredCustomers(customers);
      return;
    }

    const filtered = customers.filter(customer =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone?.includes(searchQuery)
    );
    setFilteredCustomers(filtered);
  };

  const viewCustomerHistory = async (customer: Customer) => {
    setSelectedCustomer(customer);
    setLoadingOrders(true);
    try {
      const data = await api.getCustomer(customer.id);
      setCustomerOrders(data.orders);
    } catch (error) {
      console.error('Failed to load customer history:', error);
      toast.error('Failed to load customer history');
    } finally {
      setLoadingOrders(false);
    }
  };

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Customers</h1>
        <p className="text-gray-600 mt-1">View customer history and information</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <Input
          placeholder="Search by customer name or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Customers ({filteredCustomers.length})</CardTitle>
          <CardDescription>Customer list with order history</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading customers...</div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchQuery ? 'No customers found matching your search.' : 'No customers yet.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCustomers.map((customer) => (
                <Card key={customer.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => viewCustomerHistory(customer)}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <User size={20} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="font-bold">{customer.name}</p>
                          {customer.phone && (
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Phone size={12} />
                              <span>{customer.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Package size={14} />
                          <span>Total Orders</span>
                        </div>
                        <span className="font-semibold">{customer.totalOrders}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-gray-600">
                          <DollarSign size={14} />
                          <span>Total Spent</span>
                        </div>
                        <span className="font-semibold text-green-600">₱{customer.totalSpent.toFixed(2)}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Calendar size={14} />
                          <span>Last Visit</span>
                        </div>
                        <span className="text-xs">{new Date(customer.lastVisit).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <Button variant="outline" size="sm" className="w-full mt-3">
                      View History
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Customer History Dialog */}
      <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User size={24} />
              {selectedCustomer?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedCustomer?.phone && (
                <div className="flex items-center gap-1 mt-1">
                  <Phone size={14} />
                  <span>{selectedCustomer.phone}</span>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedCustomer && (
            <div className="space-y-4">
              {/* Customer Stats */}
              <div className="grid grid-cols-3 gap-3">
                <Card>
                  <CardContent className="p-3 text-center">
                    <p className="text-sm text-gray-600">Total Orders</p>
                    <p className="text-2xl font-bold text-blue-600">{selectedCustomer.totalOrders}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 text-center">
                    <p className="text-sm text-gray-600">Total Spent</p>
                    <p className="text-2xl font-bold text-green-600">₱{selectedCustomer.totalSpent.toFixed(2)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 text-center">
                    <p className="text-sm text-gray-600">Customer Since</p>
                    <p className="text-sm font-semibold mt-1">
                      {new Date(selectedCustomer.firstVisit).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Order History */}
              <div>
                <h3 className="font-semibold mb-3">Order History</h3>
                {loadingOrders ? (
                  <div className="text-center py-4 text-gray-500">Loading orders...</div>
                ) : customerOrders.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">No orders found</div>
                ) : (
                  <div className="space-y-3">
                    {customerOrders.map((order) => (
                      <div key={order.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <Badge variant="outline">{order.serviceType}</Badge>
                            <p className="text-xs text-gray-600 mt-1">
                              {new Date(order.createdAt).toLocaleString()}
                            </p>
                          </div>
                          <p className="font-bold text-lg">₱{order.price.toFixed(2)}</p>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={getStatusColor(order.status)} variant="secondary">
                            {order.status}
                          </Badge>
                          <Badge
                            className={order.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                            variant="secondary"
                          >
                            {order.paymentStatus}
                          </Badge>
                        </div>
                        {order.notes && (
                          <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded">
                            {order.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
