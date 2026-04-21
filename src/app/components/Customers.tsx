'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { api, Customer, Order } from '@/app/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { toast } from 'sonner';
import { Search, User, Phone, Package, DollarSign, Users, ChevronRight, Calendar } from 'lucide-react';

import { useAuth } from '../auth/AuthProvider';

export function Customers() {
  const { shopId } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search');

  useEffect(() => {
    if (initialSearch) setSearchQuery(initialSearch);
  }, [initialSearch]);

  useEffect(() => {
    if (shopId) {
      loadCustomers();
    } else {
      setLoading(false);
    }
  }, [shopId]);

  useEffect(() => {
    filterCustomers();
  }, [customers, searchQuery]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await api.getCustomers();
      setCustomers(Array.isArray(data) ? data : []);
    } catch (error) {
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const filterCustomers = () => {
    const q = searchQuery.toLowerCase();
    const filtered = customers.filter(c =>
      (c.name || '').toLowerCase().includes(q) ||
      (c.phone || '').includes(q)
    );
    setFilteredCustomers(filtered);
  };

  const viewCustomerHistory = async (customer: Customer) => {
    setSelectedCustomer(customer);
    setLoadingOrders(true);
    try {
      const allOrders = await api.getOrders();
      setCustomerOrders(allOrders.filter(o => o.customer_name === customer.name));
    } catch (error) {
      toast.error('History load failed');
    } finally {
      setLoadingOrders(false);
    }
  };

  const stats = {
    total: customers.length,
    revenue: customers.reduce((sum, c) => sum + Number(c.total_spent || 0), 0)
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-700">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Customer Directory</h1>
          <p className="text-gray-600 mt-1">Manage laundry customer relationships</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <Input
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
             <div className="col-span-full py-12 text-center text-gray-400 font-semibold text-sm">Loading records...</div>
        ) : filteredCustomers.length === 0 ? (
            <div className="col-span-full py-12 text-center text-gray-400 font-semibold text-sm">No customers found.</div>
        ) : (
          filteredCustomers.map((customer) => (
            <Card 
              key={customer.id} 
              className="hover:border-blue-300 transition-all cursor-pointer group"
              onClick={() => viewCustomerHistory(customer)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600 rounded-lg transition-colors">
                      <User size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{customer.name}</h4>
                      <div className="flex items-center gap-1.5 text-sm text-gray-500">
                        <Phone size={12} /> <span>{customer.phone || 'No Phone'}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Visits</p>
                    <p className="font-semibold text-gray-700">{customer.total_orders || 0}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Value</p>
                    <p className="font-semibold text-green-600">₱{customer.total_spent || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <div className="flex items-center gap-3">
               <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                  <User size={20} />
               </div>
               <div>
                  <DialogTitle>{selectedCustomer?.name}</DialogTitle>
                  <DialogDescription className="flex items-center gap-1.5 pt-1">
                     <Phone size={14} /> {selectedCustomer?.phone || 'Contact Unlisted'}
                  </DialogDescription>
               </div>
            </div>
          </DialogHeader>

          <div className="space-y-6 mt-2">
            <div className="grid grid-cols-2 gap-4">
               <Card className="bg-gray-50 border-none shadow-none">
                  <CardContent className="p-4 text-center">
                     <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Visits</p>
                     <p className="text-2xl font-bold">{selectedCustomer?.total_orders || 0}</p>
                  </CardContent>
               </Card>
               <Card className="bg-gray-50 border-none shadow-none">
                  <CardContent className="p-4 text-center">
                     <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Spent</p>
                     <p className="text-2xl font-bold text-green-600">₱{selectedCustomer?.total_spent || 0}</p>
                  </CardContent>
               </Card>
            </div>

            <div>
              <h3 className="font-semibold text-sm mb-3">Transaction History</h3>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {loadingOrders ? (
                  <p className="text-center py-6 text-gray-400 text-sm">Loading history...</p>
                ) : customerOrders.length === 0 ? (
                  <p className="text-center py-6 text-gray-400 text-sm">No transaction history found.</p>
                ) : (
                  customerOrders.map(o => (
                    <div key={o.id} className="p-4 border rounded-xl flex items-center justify-between">
                       <div>
                          <div className="flex items-center gap-2 mb-1.5">
                             <Badge variant="outline">{o.service_type}</Badge>
                             <span className="text-xs text-gray-500">{new Date(o.created_at).toLocaleDateString()}</span>
                          </div>
                          <p className={`text-xs font-semibold ${o.status === 'Ready' ? 'text-green-600' : 'text-blue-600'}`}>
                             {o.status}
                          </p>
                       </div>
                       <p className="font-bold">₱{o.price}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
