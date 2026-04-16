import { useState } from 'react';
import { useNavigate } from 'react-router';
import { api } from '../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import { ArrowLeft, Printer } from 'lucide-react';

export function NewOrder() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    serviceType: '',
    weight: '',
    price: '',
    paymentStatus: 'Unpaid',
    notes: '',
  });

  const serviceTypes = [
    { value: 'Wash', label: 'Wash', suggestedPrice: '50' },
    { value: 'Dry', label: 'Dry', suggestedPrice: '40' },
    { value: 'Fold', label: 'Fold', suggestedPrice: '30' },
    { value: 'Wash + Dry', label: 'Wash + Dry', suggestedPrice: '80' },
    { value: 'Wash + Dry + Fold', label: 'Wash + Dry + Fold', suggestedPrice: '100' },
  ];

  const handleServiceChange = (value: string) => {
    setFormData({ ...formData, serviceType: value });
    const service = serviceTypes.find(s => s.value === value);
    if (service && !formData.price) {
      setFormData({ ...formData, serviceType: value, price: service.suggestedPrice });
    }
  };

  const handleSubmit = async (e: React.FormEvent, shouldPrint = false) => {
    e.preventDefault();

    if (!formData.customerName || !formData.serviceType || !formData.price) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const result = await api.createOrder({
        customerName: formData.customerName,
        phone: formData.phone || null,
        serviceType: formData.serviceType,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        price: parseFloat(formData.price),
        paymentStatus: formData.paymentStatus,
        notes: formData.notes || null,
      });

      toast.success('Order created successfully!');
      
      if (shouldPrint && result.order?.id) {
        // Navigate to receipt page and print
        navigate(`/receipt/${result.order.id}`);
        // Small delay to ensure page loads before printing
        setTimeout(() => {
          window.print();
        }, 500);
      } else {
        navigate('/orders');
      }
    } catch (error: any) {
      console.error('Failed to create order:', error);
      toast.error(error.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">New Order</h1>
          <p className="text-gray-600 mt-1">Create a new laundry order</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
          <CardDescription>Fill in the customer and service information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4">
            {/* Customer Info */}
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-lg">Customer Information</h3>
              
              <div>
                <Label htmlFor="customerName">Customer Name *</Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  placeholder="Enter customer name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone">Contact Number (Optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="09XX XXX XXXX"
                />
              </div>
            </div>

            {/* Service Details */}
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-lg">Service Details</h3>

              <div>
                <Label htmlFor="serviceType">Service Type *</Label>
                <Select value={formData.serviceType} onValueChange={handleServiceChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceTypes.map((service) => (
                      <SelectItem key={service.value} value={service.value}>
                        {service.label} (₱{service.suggestedPrice})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="weight">Weight (kg) (Optional)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    placeholder="0.0"
                  />
                </div>

                <div>
                  <Label htmlFor="price">Price (₱) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-lg">Payment</h3>

              <div>
                <Label htmlFor="paymentStatus">Payment Status</Label>
                <Select
                  value={formData.paymentStatus}
                  onValueChange={(value) => setFormData({ ...formData, paymentStatus: value })}
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
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Add any special instructions or notes..."
                rows={3}
              />
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Creating...' : 'Create Order'}
              </Button>
              <Button 
                type="button" 
                disabled={loading} 
                variant="secondary"
                onClick={(e) => handleSubmit(e as any, true)}
                className="flex-1"
              >
                <Printer size={16} className="mr-2" />
                {loading ? 'Creating...' : 'Create & Print'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}