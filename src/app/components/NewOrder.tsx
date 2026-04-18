'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api, Order } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ThermalReceipt } from './ThermalReceipt';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Printer,
  User,
  Phone,
  Shirt,
  Weight,
  Wallet,
  ClipboardList,
  ChevronRight,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

type ServiceOption = {
  value: string;
  label: string;
  description: string;
  basePrice: number;
  pricePerKg: number;
};

const serviceTypes: ServiceOption[] = [
  {
    value: 'Wash',
    label: 'Wash',
    description: 'Full machine wash cycle',
    basePrice: 50,
    pricePerKg: 20,
  },
  {
    value: 'Dry',
    label: 'Dry',
    description: 'Machine drying only',
    basePrice: 40,
    pricePerKg: 15,
  },
  {
    value: 'Fold',
    label: 'Fold',
    description: 'Folding & sorting service',
    basePrice: 30,
    pricePerKg: 10,
  },
  {
    value: 'Wash + Dry',
    label: 'Wash & Dry',
    description: 'Full wash and dry combo',
    basePrice: 80,
    pricePerKg: 30,
  },
  {
    value: 'Wash + Dry + Fold',
    label: 'Full Service',
    description: 'Wash, dry, and fold',
    basePrice: 100,
    pricePerKg: 40,
  },
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

  // Auto-calculate price when weight or service changes
  useEffect(() => {
    if (formData.serviceType && formData.weight) {
      const service = serviceTypes.find(s => s.value === formData.serviceType);
      if (service) {
        const kg = parseFloat(formData.weight);
        if (!isNaN(kg) && kg > 0) {
          const computed = service.basePrice + kg * service.pricePerKg;
          setFormData(prev => ({ ...prev, price: computed.toFixed(2) }));
        }
      }
    }
  }, [formData.serviceType, formData.weight]);

  const handleServiceSelect = (value: string) => {
    const service = serviceTypes.find(s => s.value === value);
    setFormData(prev => ({
      ...prev,
      serviceType: value,
      // Only auto-fill price if no weight entered yet
      price: prev.weight ? prev.price : service ? service.basePrice.toFixed(2) : prev.price,
    }));
  };

  const handlePhoneChange = (value: string) => {
    // Only allow digits and format
    const digits = value.replace(/\D/g, '').slice(0, 11);
    setFormData(prev => ({ ...prev, phone: digits }));
  };

  const handleSubmit = async (shouldPrint = false) => {
    if (!formData.customerName.trim()) {
      toast.error('Customer name is required');
      return;
    }
    if (!formData.serviceType) {
      toast.error('Please select a service type');
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error('Please enter a valid price');
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
        // Wait a tiny bit for the hidden ThermalReceipt to render into the DOM
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
  const priceValue = parseFloat(formData.price) || 0;
  const weightValue = parseFloat(formData.weight) || 0;
  const isFormValid =
    formData.customerName.trim() && formData.serviceType && priceValue > 0;

  return (
    <>
      <div className="max-w-6xl mx-auto space-y-6 pb-12 print:hidden">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">New Order</h1>
        <p className="text-gray-500 mt-1">Fill in the details to create a new laundry order.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* === LEFT / MAIN FORM === */}
        <div className="lg:col-span-2 space-y-6">

          {/* Customer Information */}
          <Card className="border-gray-200 shadow-sm rounded-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900">
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="customerName" className="font-medium">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  placeholder="e.g. Juan dela Cruz"
                  className="h-10 transition-shadow focus:ring-2 focus:ring-offset-0 focus:ring-blue-500/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="font-medium text-gray-700 flex items-center justify-between">
                  <span>Contact Number</span>
                  <span className="text-xs text-gray-400 font-normal">Optional</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="09XXXXXXXXX"
                  className="h-10 transition-shadow focus:ring-2 focus:ring-offset-0 focus:ring-blue-500/20"
                  maxLength={11}
                />
              </div>
            </CardContent>
          </Card>

          {/* Service Type */}
          <Card className="border-gray-200 shadow-sm rounded-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900">
                Service Selection <span className="text-red-500">*</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {serviceTypes.map((service) => {
                  const isSelected = formData.serviceType === service.value;
                  return (
                    <button
                      key={service.value}
                      type="button"
                      onClick={() => handleServiceSelect(service.value)}
                      className={`relative text-left p-4 rounded-xl border transition-all duration-200 focus:outline-none ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {isSelected && (
                        <CheckCircle2
                          size={16}
                          className="absolute top-4 right-4 text-blue-600"
                        />
                      )}
                      <p className={`font-semibold ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                        {service.label}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{service.description}</p>
                      <p className={`text-xs font-medium mt-3 ${isSelected ? 'text-blue-700' : 'text-gray-600'}`}>
                        From ₱{service.basePrice}
                      </p>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Weight & Pricing */}
          <Card className="border-gray-200 shadow-sm rounded-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900">
                Measurement & Pricing
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="weight" className="font-medium text-gray-700 flex items-center justify-between">
                  <span>Weight (kg)</span>
                  <span className="text-xs text-gray-400 font-normal">Optional</span>
                </Label>
                <div className="relative">
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    placeholder="0.0"
                    className="h-10 pr-10 transition-shadow focus:ring-2 focus:ring-offset-0 focus:ring-blue-500/20"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                    kg
                  </span>
                </div>
                {selectedService && weightValue > 0 && (
                  <p className="text-xs text-gray-500 mt-1.5">
                    Auto-calc: ₱{selectedService.basePrice} + {weightValue}kg × ₱{selectedService.pricePerKg}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="itemCount" className="font-medium text-gray-700 flex items-center justify-between">
                  <span>Item Count (pcs)</span>
                  <span className="text-xs text-gray-400 font-normal">Optional</span>
                </Label>
                <div className="relative">
                  <Input
                    id="itemCount"
                    type="number"
                    min="0"
                    value={formData.itemCount}
                    onChange={(e) => setFormData({ ...formData, itemCount: e.target.value })}
                    placeholder="0"
                    className="h-10 pr-10 transition-shadow focus:ring-2 focus:ring-offset-0 focus:ring-blue-500/20"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                    pcs
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price" className="font-medium">
                  Total Price <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                    ₱
                  </span>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                    className="h-10 pl-7 transition-shadow focus:ring-2 focus:ring-offset-0 focus:ring-blue-500/20"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card className="border-gray-200 shadow-sm rounded-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Payment Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  {(['Unpaid', 'Paid'] as const).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setFormData({ ...formData, paymentStatus: status })}
                      className={`flex-1 py-2.5 px-4 rounded-lg border text-sm font-medium transition-colors ${
                        formData.paymentStatus === status
                          ? status === 'Paid'
                            ? 'border-green-600 bg-green-50 text-green-700 ring-1 ring-green-600'
                            : 'border-orange-500 bg-orange-50 text-orange-700 ring-1 ring-orange-500'
                          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200 shadow-sm rounded-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Special instructions..."
                  rows={2}
                  className="resize-none transition-shadow focus:ring-2 focus:ring-offset-0 focus:ring-blue-500/20"
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* === RIGHT / ORDER SUMMARY STICKY === */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <Card className="border-gray-200 shadow-sm rounded-xl bg-white">
              <CardHeader className="pb-4 border-b border-gray-100">
                <CardTitle className="text-lg font-semibold text-gray-900">Summary</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4 pt-5">
                {/* Customer */}
                <div className="flex justify-between items-start">
                  <div className="text-sm text-gray-500">Customer</div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${!formData.customerName ? 'text-gray-400 italic font-normal' : 'text-gray-900'}`}>
                      {formData.customerName || 'Pending...'}
                    </p>
                    {formData.phone && (
                      <p className="text-xs text-gray-500 mt-0.5">{formData.phone}</p>
                    )}
                  </div>
                </div>

                <div className="h-px bg-gray-100" />

                {/* Service */}
                <div className="flex justify-between items-start">
                  <div className="text-sm text-gray-500">Service</div>
                  <div className="text-right">
                    {selectedService ? (
                      <>
                        <p className="text-sm font-medium text-gray-900">
                          {selectedService.label}
                        </p>
                        {weightValue > 0 && (
                          <p className="text-xs text-gray-500 mt-0.5">{weightValue} kg</p>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-gray-400 italic">None selected</p>
                    )}
                  </div>
                </div>

                <div className="h-px bg-gray-100" />

                {/* Payment */}
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">Status</div>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-md ${
                      formData.paymentStatus === 'Paid'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-orange-100 text-orange-700'
                    }`}
                  >
                    {formData.paymentStatus}
                  </span>
                </div>

                <div className="h-px bg-gray-100" />

                {/* Total */}
                <div className="pt-2 flex items-center justify-between">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-gray-900">
                    <span className="text-xl text-gray-500 font-normal mr-1">₱</span>
                    {priceValue > 0 ? priceValue.toFixed(2) : '0.00'}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-6">
                  <Button
                    onClick={() => handleSubmit(false)}
                    disabled={loading || !isFormValid}
                    className="w-full h-11 font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    {loading ? (
                      <><Loader2 size={16} className="mr-2 animate-spin" /> Processing...</>
                    ) : (
                      'Complete Order'
                    )}
                  </Button>

                  <Button
                    onClick={() => handleSubmit(true)}
                    disabled={loading || !isFormValid}
                    variant="outline"
                    className="w-full h-11 font-medium border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    {loading ? (
                      <><Loader2 size={16} className="mr-2 animate-spin" /> Processing...</>
                    ) : (
                      <><Printer size={16} className="mr-2 text-gray-500" /> Print Receipt</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        </div>
      </div>

      {/* Render the hidden Thermal Receipt component for printing */}
      {printedOrder && <ThermalReceipt order={printedOrder} />}
    </>
  );
}