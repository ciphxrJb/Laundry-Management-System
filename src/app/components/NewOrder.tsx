'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api, Order } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { ThermalReceipt } from './ThermalReceipt';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';
import {
  Printer,
  User,
  Phone,
  Shirt,
  Weight,
  Wallet,
  ClipboardList,
  ChevronRight,
  Loader2,
} from 'lucide-react';

type ServiceOption = {
  value: string;
  label: string;
  description: string;
  basePrice: number;
  weightPrice: number;
};

const serviceTypes: ServiceOption[] = [
  { value: 'Wash', label: 'Wash', description: 'Full machine wash cycle', basePrice: 50, weightPrice: 20 },
  { value: 'Dry', label: 'Dry', description: 'Machine drying only', basePrice: 40, weightPrice: 15 },
  { value: 'Fold', label: 'Fold', description: 'Folding & sorting service', basePrice: 30, weightPrice: 10 },
  { value: 'Wash + Dry', label: 'Wash & Dry', description: 'Full wash and dry combo', basePrice: 80, weightPrice: 30 },
  { value: 'Wash + Dry + Fold', label: 'Full Service', description: 'Wash, dry, and fold', basePrice: 100, weightPrice: 40 },
];

export function NewOrder() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const initialFormState = {
    customerName: '',
    phone: '',
    serviceType: '',
    weight: '',
    itemCount: '',
    price: '',
    paymentStatus: 'Unpaid' as 'Paid' | 'Unpaid',
    notes: '',
  };

  const [formData, setFormData] = useState(initialFormState);
  const [printedOrder, setPrintedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (formData.serviceType && formData.weight) {
      const service = serviceTypes.find(s => s.value === formData.serviceType);
      if (service) {
        const kg = parseFloat(formData.weight);
        if (!isNaN(kg) && kg > 0) {
          const computed = service.basePrice + kg * service.weightPrice;
          setFormData(prev => ({ ...prev, price: computed.toFixed(2) }));
        }
      }
    }
  }, [formData.serviceType, formData.weight]);

  const handleSubmit = async (e: React.FormEvent, shouldPrint = false) => {
    e.preventDefault();
    if (!formData.customerName.trim() || !formData.serviceType || !formData.price) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const result = await api.createOrder({
        customerName: formData.customerName.trim(),
        phone: formData.phone || null,
        serviceType: formData.serviceType,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        itemCount: formData.itemCount ? parseInt(formData.itemCount) : null,
        price: parseFloat(formData.price),
        paymentStatus: formData.paymentStatus,
        notes: formData.notes.trim() || null,
      });

      toast.success('Order created successfully!');

      if (shouldPrint && result.order) {
        setPrintedOrder(result.order);
        setTimeout(() => {
          window.print();
          setFormData(initialFormState);
        }, 100);
      } else {
        setFormData(initialFormState);
      }
    } catch (error: any) {
      console.error('Failed to create order:', error);
      toast.error(error.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const selectedService = serviceTypes.find(s => s.value === formData.serviceType);
  
  return (
    <>
      <div className="space-y-6 pb-12 print:hidden">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">New Order</h1>
            <p className="text-gray-600 mt-1">Create a new laundry transaction</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <User size={18} className="text-blue-600" /> Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Full Name</Label>
                  <Input
                    id="customerName"
                    value={formData.customerName}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                    placeholder="Enter customer name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number (PH)</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 11);
                      setFormData(prev => ({ ...prev, phone: val }));
                    }}
                    placeholder="0917 123 4567"
                    maxLength={11}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Service & Weight */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Shirt size={18} className="text-blue-600" /> Service Selection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {serviceTypes.map((type) => (
                    <Button
                      key={type.value}
                      variant={formData.serviceType === type.value ? 'default' : 'outline'}
                      className="h-auto py-4 px-4 flex flex-col items-center justify-center text-center gap-1"
                      onClick={() => setFormData(prev => ({ ...prev, serviceType: type.value }))}
                    >
                      <span className="font-bold">{type.label}</span>
                      <span className="text-[10px] opacity-70">Base: ₱{type.basePrice}</span>
                    </Button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight" className="flex items-center gap-2">
                      <Weight size={18} /> Weight (kg)
                    </Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      value={formData.weight}
                      onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                      placeholder="0.0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="itemCount">Item Count</Label>
                    <Input
                      id="itemCount"
                      type="number"
                      value={formData.itemCount}
                      onChange={(e) => setFormData(prev => ({ ...prev, itemCount: e.target.value }))}
                      placeholder="e.g. 15"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional instructions..."
                    className="min-h-[80px]"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Checkout Column */}
          <div className="space-y-6">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>Verify details before saving</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Service Fee</span>
                    <span className="font-bold">₱{selectedService?.basePrice || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Weight Fee</span>
                    <span className="font-bold">₱{(parseFloat(formData.weight) || 0) * (selectedService?.weightPrice || 0)}</span>
                  </div>
                  <div className="h-px bg-gray-100" />
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-3xl font-bold text-blue-600">₱{formData.price || '0.00'}</span>
                  </div>
                </div>

                <div className="space-y-3 pt-4">
                  <Button 
                    className="w-full h-12 bg-blue-600"
                    disabled={loading || !formData.customerName || !formData.serviceType}
                    onClick={(e) => handleSubmit(e, true)}
                  >
                    {loading ? <Loader2 className="animate-spin" /> : <><Printer size={18} /> Create & Print</>}
                  </Button>
                  <Button 
                    variant="ghost"
                    className="w-full text-gray-500 hover:text-gray-700 font-bold"
                    disabled={loading || !formData.customerName || !formData.serviceType}
                    onClick={(e) => handleSubmit(e, false)}
                  >
                    Create Order
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {printedOrder && <ThermalReceipt order={printedOrder} />}
    </>
  );
}