'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Plus, ShoppingCart, Clock, CheckCircle, DollarSign } from 'lucide-react';

const serviceTypes = [
  { value: 'wash-dry-fold', label: 'Wash + Dry + Fold', price: 120 },
  { value: 'wash-dry', label: 'Wash + Dry', price: 80 },
  { value: 'dry', label: 'Dry Only', price: 40 },
  { value: 'wash-fold', label: 'Wash + Fold', price: 100 },
];

const mockOrders = [
  {
    id: '1',
    customerName: 'Juan Dela Cruz',
    serviceType: 'Wash + Dry + Fold',
    weight: 5.5,
    price: 120,
    status: 'Ready for pickup',
    createdAt: new Date().toLocaleTimeString(),
  },
  {
    id: '2',
    customerName: 'Maria Santos',
    serviceType: 'Wash + Dry',
    weight: 3.2,
    price: 80,
    status: 'Washing',
    createdAt: new Date().toLocaleTimeString(),
  },
];

export function POS() {
  const router = useRouter();
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');
  const [orders] = useState(mockOrders);

  const selectedService = serviceTypes.find(s => s.value === serviceType);
  const calculatedPrice = selectedService && weight ? selectedService.price * parseFloat(weight) : 0;

  const handleCreateOrder = () => {
    // Mock order creation
    alert('Order created successfully!');
    setCustomerName('');
    setPhone('');
    setServiceType('');
    setWeight('');
    setNotes('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ready for pickup': return 'bg-green-100 text-green-800';
      case 'Washing': return 'bg-blue-100 text-blue-800';
      case 'Drying': return 'bg-cyan-100 text-cyan-800';
      case 'Completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Laundry POS</h1>
          <p className="text-gray-600 mt-1">Create new orders and manage current transactions</p>
        </div>
        <Button onClick={() => router.push('/orders')} variant="outline">
          View All Orders
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Creation */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus size={20} />
                New Order
              </CardTitle>
              <CardDescription>Create a new laundry order</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Customer Name *</Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter customer name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="09123456789"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="serviceType">Service Type *</Label>
                  <Select value={serviceType} onValueChange={setServiceType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select service" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceTypes.map((service) => (
                        <SelectItem key={service.value} value={service.value}>
                          {service.label} - ₱{service.price}/kg
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg) *</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="0.0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Special instructions..."
                />
              </div>

              {calculatedPrice > 0 && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Total Price:</span>
                    <span className="text-2xl font-bold text-blue-600">₱{calculatedPrice.toFixed(2)}</span>
                  </div>
                </div>
              )}

              <Button
                onClick={handleCreateOrder}
                className="w-full"
                disabled={!customerName || !serviceType || !weight}
              >
                <ShoppingCart className="mr-2" size={16} />
                Create Order
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Current Orders */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock size={20} />
                Current Orders
              </CardTitle>
              <CardDescription>Active orders in progress</CardDescription>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No active orders
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{order.customerName}</span>
                        <Badge className={getStatusColor(order.status)} variant="secondary">
                          {order.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-600 space-y-1">
                        <div>{order.serviceType}</div>
                        <div>{order.weight}kg • ₱{order.price}</div>
                        <div>{order.createdAt}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg">Today's Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Orders Today</span>
                <span className="font-bold">5</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Revenue</span>
                <span className="font-bold text-green-600">₱420</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Ready for Pickup</span>
                <span className="font-bold text-blue-600">1</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}