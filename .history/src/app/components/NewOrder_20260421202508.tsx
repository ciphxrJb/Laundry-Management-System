'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api, Order, Customer } from '../lib/api';
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
  const [customersList, setCustomersList] = useState<Customer[]>([]);
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

  // Load returning customers for autocomplete memory
  useEffect(() => {
    api.getCustomers()
      .then(data => {
        if (Array.isArray(data)) setCustomersList(data);
      })
      .catch(err => console.error("Could not load customers for autofill", err));
  }, []);

  // Autofill Handler for Name
  const handleNameChange = (val: string) => {
    const match = customersList.find(c => c.name.toLowerCase() === val.toLowerCase());
    if (match && match.phone) {
      const matchedPhone = match.phone; // capture it so TS doesn't lose narrowing
      setFormData(prev => ({ ...prev, customerName: match.name, phone: matchedPhone }));
    } else {
      setFormData(prev => ({ ...prev, customerName: val }));
    }
  };

  // Autofill Handler for Phone
  const handlePhoneChange = (val: string) => {
    const cleanPhone = val.replace(/\D/g, '').slice(0, 11);
    const match = customersList.find(c => c.phone === cleanPhone);
    if (match && cleanPhone.length === 11) {
      setFormData(prev => ({ ...prev, phone: cleanPhone, customerName: prev.customerName || match.name }));
    } else {
      setFormData(prev => ({ ...prev, phone: cleanPhone }));
    }
  };

  useEffect(() => {
    if (formData.serviceType) {
      const service = serviceTypes.find(s => s.value === formData.serviceType);
      if (service) {
        const kg = parseFloat(formData.weight) || 0;
        const computed = service.basePrice + (kg * service.weightPrice);
        setFormData(prev => ({ ...prev, price: computed.toFixed(2) }));
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
      <div className="space-y-6 pb-24 lg:pb-12 print:hidden">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">New Order</h1>
            <p className="text-gray-600 mt-1">Create a new laundry transaction</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4 lg:space-y-6">
            {/* Customer Details */}
            <Card className="rounded-2xl lg:rounded-3xl border-slate-100">
              <CardHeader className="pb-3 lg:pb-6">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <User size={18} className="text-blue-600" /> Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <datalist id="customer-names">
                  {customersList.map(c => <option key={c.id} value={c.name} />)}
                </datalist>
                
                <div className="space-y-2">
                  <Label htmlFor="customerName">Full Name</Label>
                  <Input
                    id="customerName"
                    list="customer-names"
                    value={formData.customerName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Enter customer name"
                    autoComplete="off"
                    className="h-12 bg-slate-50 border-slate-100 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number (PH)</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="0917 123 4567"
                    maxLength={11}
                    className="h-12 bg-slate-50 border-slate-100 rounded-xl"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Service & Weight */}
            <Card className="rounded-2xl lg:rounded-3xl border-slate-100">
              <CardHeader className="pb-3 lg:pb-6">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Shirt size={18} className="text-blue-600" /> Service Selection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 lg:gap-3">
                  {serviceTypes.map((type) => (
                    <Button
                      key={type.value}
                      variant={formData.serviceType === type.value ? 'default' : 'outline'}
                      className={`h-auto py-3 lg:py-4 px-2 lg:px-4 flex flex-col items-center justify-center text-center gap-1 rounded-xl transition-all ${
                        formData.serviceType === type.value 
                        ? 'bg-blue-600 shadow-md shadow-blue-200 ring-2 ring-blue-600 ring-offset-2' 
                        : 'border-slate-100 bg-slate-50 hover:bg-blue-50'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, serviceType: type.value }))}
                    >
                      <span className="font-bold text-xs lg:text-sm">{type.label}</span>
                      <span className="text-[9px] lg:text-[10px] opacity-70 italic font-mono">₱{type.basePrice}+</span>
                    </Button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight" className="flex items-center gap-2">
                      <Weight size={18} className="text-slate-400" /> Weight (kg)
                    </Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      value={formData.weight}
                      onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                      placeholder="0.0"
                      className="h-12 bg-slate-50 border-slate-100 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="itemCount" className="flex items-center gap-2">
                      <ClipboardList size={18} className="text-slate-400" /> Items
                    </Label>
                    <Input
                      id="itemCount"
                      type="number"
                      value={formData.itemCount}
                      onChange={(e) => setFormData(prev => ({ ...prev, itemCount: e.target.value }))}
                      placeholder="e.g. 15"
                      className="h-12 bg-slate-50 border-slate-100 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Special Instructions</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="e.g. No fabric softener for the blue towels"
                    className="min-h-[80px] bg-slate-50 border-slate-100 rounded-xl resize-none"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Checkout Column (Desktop) */}
          <div className="hidden lg:block space-y-6">
            <Card className="sticky top-6 rounded-3xl border-slate-100 shadow-xl shadow-slate-200/50">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>Verify details before saving</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-medium">Service Fee</span>
                    <span className="font-bold">₱{selectedService?.basePrice || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-medium">Weight Fee</span>
                    <span className="font-bold">₱{((parseFloat(formData.weight) || 0) * (selectedService?.weightPrice || 0)).toFixed(2)}</span>
                  </div>
                  <div className="h-px bg-slate-100" />
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-lg font-bold text-slate-900">Total</span>
                    <span className="text-3xl font-black text-blue-600 tracking-tighter">₱{formData.price || '0.00'}</span>
                  </div>
                </div>

                <div className="space-y-3 pt-4">
                  <Button 
                    className="w-full h-14 bg-blue-600 hover:bg-blue-700 rounded-2xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95"
                    disabled={loading || !formData.customerName || !formData.serviceType}
                    onClick={(e) => handleSubmit(e, true)}
                  >
                    {loading ? <Loader2 className="animate-spin" /> : <><Printer size={18} className="mr-2" /> Create & Print</>}
                  </Button>
                  <Button 
                    variant="ghost"
                    className="w-full h-12 text-slate-400 hover:text-slate-600 font-bold rounded-2xl"
                    disabled={loading || !formData.customerName || !formData.serviceType}
                    onClick={(e) => handleSubmit(e, false)}
                  >
                    Create Without Printing
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* MOBILE STICKY ACTION BAR */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 z-40 shadow-[0_-8px_30px_rgba(0,0,0,0.15)] animate-in slide-in-from-bottom duration-500">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <div className="min-w-[80px]">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total</p>
            <p className="text-xl font-black text-blue-600 tracking-tighter truncate">₱{formData.price || '0.00'}</p>
          </div>
          
          <div className="flex-1 flex gap-2">
            <Button 
              variant="outline"
              className="flex-1 h-12 border-slate-200 text-slate-600 rounded-xl font-bold text-xs"
              disabled={loading || !formData.customerName || !formData.serviceType}
              onClick={(e) => handleSubmit(e, false)}
            >
              {loading ? <Loader2 className="animate-spin size-4" /> : 'Add Order'}
            </Button>
            <Button 
              className="flex-[1.5] h-12 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold shadow-md shadow-blue-100 text-xs gap-1.5"
              disabled={loading || !formData.customerName || !formData.serviceType}
              onClick={(e) => handleSubmit(e, true)}
            >
              {loading ? <Loader2 className="animate-spin size-4" /> : <><Printer size={16} /> Add & Print</>}
            </Button>
          </div>
        </div>
      </div>

      {printedOrder && <ThermalReceipt order={printedOrder} />}
    </>
  );
}