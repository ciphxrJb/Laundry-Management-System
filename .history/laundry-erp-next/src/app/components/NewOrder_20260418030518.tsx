'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
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
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    serviceType: '',
    weight: '',
    price: '',
    paymentStatus: 'Unpaid' as 'Paid' | 'Unpaid',
    notes: '',
  });

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
      alert('Customer name is required');
      return;
    }
    if (!formData.serviceType) {
      alert('Please select a service type');
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      alert('Please enter a valid price');
      return;
    }

    try {
      setLoading(true);
      // Mock order creation
      alert('Order created successfully!');

      if (shouldPrint) {
        router.push('/receipt/mock-order-id');
      } else {
        router.push('/orders');
      }
    } catch (error: any) {
      console.error('Failed to create order:', error);
      alert(error.message || 'Failed to create order');
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
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="rounded-full hover:bg-gray-100"
        >
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">New Order</h1>
          <p className="text-gray-500 text-sm mt-0.5">Fill in the details below to create a new laundry order</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* === LEFT / MAIN FORM === */}
        <div className="lg:col-span-2 space-y-5">

          {/* Customer Information */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-800">
                <div className="p-1.5 bg-blue-50 rounded-md">
                  <User size={16} className="text-blue-600" />
                </div>
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="customerName" className="text-sm font-medium text-gray-700">
                  Customer Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  placeholder="e.g. Juan dela Cruz"
                  className="h-10"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <Phone size={13} className="text-gray-400" />
                  Contact Number
                  <span className="text-xs text-gray-400 ml-1">(optional)</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="09XXXXXXXXX"
                  className="h-10"
                  maxLength={11}
                />
              </div>
            </CardContent>
          </Card>

          {/* Service Type */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-800">
                <div className="p-1.5 bg-purple-50 rounded-md">
                  <Shirt size={16} className="text-purple-600" />
                </div>
                Service Type <span className="text-red-500">*</span>
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
                      className={`relative text-left p-4 rounded-xl border-2 transition-all duration-150 hover:shadow-md focus:outline-none ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 shadow-sm'
                          : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/40'
                      }`}
                    >
                      {isSelected && (
                        <CheckCircle2
                          size={16}
                          className="absolute top-3 right-3 text-blue-500"
                        />
                      )}
                      <p className={`font-semibold text-sm ${isSelected ? 'text-blue-700' : 'text-gray-800'}`}>
                        {service.label}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{service.description}</p>
                      <p className={`text-xs font-medium mt-2 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`}>
                        From ₱{service.basePrice}
                      </p>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Weight & Pricing */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-800">
                <div className="p-1.5 bg-amber-50 rounded-md">
                  <Weight size={16} className="text-amber-600" />
                </div>
                Weight & Pricing
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="weight" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  Weight (kg)
                  <span className="text-xs text-gray-400 ml-1">(optional)</span>
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
                    className="h-10 pr-10"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">
                    kg
                  </span>
                </div>
                {selectedService && weightValue > 0 && (
                  <p className="text-xs text-blue-600 mt-1">
                    Auto-price: ₱{selectedService.basePrice} + {weightValue}kg × ₱{selectedService.pricePerKg}/kg
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="price" className="text-sm font-medium text-gray-700">
                  Price (₱) <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">
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
                    className="h-10 pl-7"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment & Pickup */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-800">
                <div className="p-1.5 bg-green-50 rounded-md">
                  <Wallet size={16} className="text-green-600" />
                </div>
                Payment & Pickup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Payment Status Toggle */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Payment Status</Label>
                <div className="flex gap-3">
                  {(['Unpaid', 'Paid'] as const).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setFormData({ ...formData, paymentStatus: status })}
                      className={`flex-1 py-2.5 px-4 rounded-lg border-2 text-sm font-semibold transition-all ${
                        formData.paymentStatus === status
                          ? status === 'Paid'
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-orange-400 bg-orange-50 text-orange-700'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      {status === 'Paid' ? 'Paid' : 'Unpaid'}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-800">
                <div className="p-1.5 bg-gray-100 rounded-md">
                  <ClipboardList size={16} className="text-gray-600" />
                </div>
                Special Instructions
                <span className="text-xs text-gray-400 font-normal ml-1">(optional)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="e.g. Handle with care, separate darks, air-dry only..."
                rows={3}
                className="resize-none"
              />
            </CardContent>
          </Card>
        </div>

        {/* === RIGHT / ORDER SUMMARY === */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-4">
            <Card className="border border-blue-100 bg-gradient-to-b from-blue-50 to-white shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-gray-800">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Customer */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-gray-400 shrink-0" />
                    <span className="text-sm text-gray-500">Customer</span>
                  </div>
                  <p className={`font-semibold text-gray-900 pl-5 ${!formData.customerName ? 'text-gray-300 font-normal italic' : ''}`}>
                    {formData.customerName || 'Not entered'}
                  </p>
                  {formData.phone && (
                    <p className="text-xs text-gray-500 pl-5 flex items-center gap-1">
                      <Phone size={11} /> {formData.phone}
                    </p>
                  )}
                </div>

                <div className="h-px bg-gray-200" />

                {/* Service */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Shirt size={14} className="text-gray-400 shrink-0" />
                    <span className="text-sm text-gray-500">Service</span>
                  </div>
                  {selectedService ? (
                    <div className="pl-5">
                      <p className="font-semibold text-gray-900">
                        {selectedService.label}
                      </p>
                      {weightValue > 0 && (
                        <p className="text-xs text-gray-500 mt-0.5">{weightValue} kg</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-300 italic pl-5">Not selected</p>
                  )}
                </div>

                <div className="h-px bg-gray-200" />

                {/* Payment */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Wallet size={14} className="text-gray-400" />
                    Payment
                  </div>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      formData.paymentStatus === 'Paid'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-orange-100 text-orange-700'
                    }`}
                  >
                    {formData.paymentStatus}
                  </span>
                </div>

                <div className="h-px bg-gray-200" />

                {/* Total */}
                <div className="flex items-end justify-between">
                  <span className="text-sm text-gray-500">Total Amount</span>
                  <span className={`text-2xl font-bold ${priceValue > 0 ? 'text-blue-600' : 'text-gray-300'}`}>
                    ₱{priceValue > 0 ? priceValue.toFixed(2) : '0.00'}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-1">
                  <Button
                    onClick={() => handleSubmit(false)}
                    disabled={loading || !isFormValid}
                    className="w-full h-11 font-semibold bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {loading ? (
                      <><Loader2 size={16} className="mr-2 animate-spin" /> Creating...</>
                    ) : (
                      <><CheckCircle2 size={16} className="mr-2" /> Create Order</>
                    )}
                  </Button>

                  <Button
                    onClick={() => handleSubmit(true)}
                    disabled={loading || !isFormValid}
                    variant="outline"
                    className="w-full h-11 font-semibold border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    {loading ? (
                      <><Loader2 size={16} className="mr-2 animate-spin" /> Creating...</>
                    ) : (
                      <><Printer size={16} className="mr-2" /> Create & Print Receipt</>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => router.back()}
                    disabled={loading}
                    className="w-full h-10 text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </Button>
                </div>

                {!isFormValid && (
                  <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <ChevronRight size={14} className="text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700">
                      {!formData.customerName.trim()
                        ? 'Enter a customer name to continue'
                        : !formData.serviceType
                        ? 'Select a service type'
                        : 'Enter a price to continue'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
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
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    serviceType: '',
    weight: '',
    price: '',
    paymentStatus: 'Unpaid' as 'Paid' | 'Unpaid',
    notes: '',
  });

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
        price: parseFloat(formData.price),
        paymentStatus: formData.paymentStatus,
        notes: formData.notes.trim() || null,
      });

      toast.success('Order created successfully!');

      if (shouldPrint && result.order?.id) {
        router.push(`/receipt/${result.order.id}`);
        setTimeout(() => window.print(), 500);
      } else {
        router.push('/orders');
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
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="rounded-full hover:bg-gray-100"
        >
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">New Order</h1>
          <p className="text-gray-500 text-sm mt-0.5">Fill in the details below to create a new laundry order</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* === LEFT / MAIN FORM === */}
        <div className="lg:col-span-2 space-y-5">

          {/* Customer Information */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-800">
                <div className="p-1.5 bg-blue-50 rounded-md">
                  <User size={16} className="text-blue-600" />
                </div>
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="customerName" className="text-sm font-medium text-gray-700">
                  Customer Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  placeholder="e.g. Juan dela Cruz"
                  className="h-10"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <Phone size={13} className="text-gray-400" />
                  Contact Number
                  <span className="text-xs text-gray-400 ml-1">(optional)</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="09XXXXXXXXX"
                  className="h-10"
                  maxLength={11}
                />
              </div>
            </CardContent>
          </Card>

          {/* Service Type */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-800">
                <div className="p-1.5 bg-purple-50 rounded-md">
                  <Shirt size={16} className="text-purple-600" />
                </div>
                Service Type <span className="text-red-500">*</span>
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
                      className={`relative text-left p-4 rounded-xl border-2 transition-all duration-150 hover:shadow-md focus:outline-none ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 shadow-sm'
                          : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/40'
                      }`}
                    >
                      {isSelected && (
                        <CheckCircle2
                          size={16}
                          className="absolute top-3 right-3 text-blue-500"
                        />
                      )}
                      <p className={`font-semibold text-sm ${isSelected ? 'text-blue-700' : 'text-gray-800'}`}>
                        {service.label}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{service.description}</p>
                      <p className={`text-xs font-medium mt-2 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`}>
                        From ₱{service.basePrice}
                      </p>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Weight & Pricing */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-800">
                <div className="p-1.5 bg-amber-50 rounded-md">
                  <Weight size={16} className="text-amber-600" />
                </div>
                Weight & Pricing
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="weight" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  Weight (kg)
                  <span className="text-xs text-gray-400 ml-1">(optional)</span>
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
                    className="h-10 pr-10"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">
                    kg
                  </span>
                </div>
                {selectedService && weightValue > 0 && (
                  <p className="text-xs text-blue-600 mt-1">
                    Auto-price: ₱{selectedService.basePrice} + {weightValue}kg × ₱{selectedService.pricePerKg}/kg
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="price" className="text-sm font-medium text-gray-700">
                  Price (₱) <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">
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
                    className="h-10 pl-7"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment & Pickup */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-800">
                <div className="p-1.5 bg-green-50 rounded-md">
                  <Wallet size={16} className="text-green-600" />
                </div>
                Payment & Pickup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Payment Status Toggle */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Payment Status</Label>
                <div className="flex gap-3">
                  {(['Unpaid', 'Paid'] as const).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setFormData({ ...formData, paymentStatus: status })}
                      className={`flex-1 py-2.5 px-4 rounded-lg border-2 text-sm font-semibold transition-all ${
                        formData.paymentStatus === status
                          ? status === 'Paid'
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-orange-400 bg-orange-50 text-orange-700'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      {status === 'Paid' ? 'Paid' : 'Unpaid'}
                    </button>
                  ))}
                </div>
              </div>


            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-800">
                <div className="p-1.5 bg-gray-100 rounded-md">
                  <ClipboardList size={16} className="text-gray-600" />
                </div>
                Special Instructions
                <span className="text-xs text-gray-400 font-normal ml-1">(optional)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="e.g. Handle with care, separate darks, air-dry only..."
                rows={3}
                className="resize-none"
              />
            </CardContent>
          </Card>
        </div>

        {/* === RIGHT / ORDER SUMMARY === */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-4">
            <Card className="border border-blue-100 bg-gradient-to-b from-blue-50 to-white shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-gray-800">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Customer */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-gray-400 shrink-0" />
                    <span className="text-sm text-gray-500">Customer</span>
                  </div>
                  <p className={`font-semibold text-gray-900 pl-5 ${!formData.customerName ? 'text-gray-300 font-normal italic' : ''}`}>
                    {formData.customerName || 'Not entered'}
                  </p>
                  {formData.phone && (
                    <p className="text-xs text-gray-500 pl-5 flex items-center gap-1">
                      <Phone size={11} /> {formData.phone}
                    </p>
                  )}
                </div>

                <div className="h-px bg-gray-200" />

                {/* Service */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Shirt size={14} className="text-gray-400 shrink-0" />
                    <span className="text-sm text-gray-500">Service</span>
                  </div>
                  {selectedService ? (
                    <div className="pl-5">
                      <p className="font-semibold text-gray-900">
                        {selectedService.label}
                      </p>
                      {weightValue > 0 && (
                        <p className="text-xs text-gray-500 mt-0.5">{weightValue} kg</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-300 italic pl-5">Not selected</p>
                  )}
                </div>

                <div className="h-px bg-gray-200" />


                {/* Payment */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Wallet size={14} className="text-gray-400" />
                    Payment
                  </div>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      formData.paymentStatus === 'Paid'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-orange-100 text-orange-700'
                    }`}
                  >
                    {formData.paymentStatus}
                  </span>
                </div>

                <div className="h-px bg-gray-200" />

                {/* Total */}
                <div className="flex items-end justify-between">
                  <span className="text-sm text-gray-500">Total Amount</span>
                  <span className={`text-2xl font-bold ${priceValue > 0 ? 'text-blue-600' : 'text-gray-300'}`}>
                    ₱{priceValue > 0 ? priceValue.toFixed(2) : '0.00'}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-1">
                  <Button
                    onClick={() => handleSubmit(false)}
                    disabled={loading || !isFormValid}
                    className="w-full h-11 font-semibold bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {loading ? (
                      <><Loader2 size={16} className="mr-2 animate-spin" /> Creating...</>
                    ) : (
                      <><CheckCircle2 size={16} className="mr-2" /> Create Order</>
                    )}
                  </Button>

                  <Button
                    onClick={() => handleSubmit(true)}
                    disabled={loading || !isFormValid}
                    variant="outline"
                    className="w-full h-11 font-semibold border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    {loading ? (
                      <><Loader2 size={16} className="mr-2 animate-spin" /> Creating...</>
                    ) : (
                      <><Printer size={16} className="mr-2" /> Create & Print Receipt</>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => router.back()}
                    disabled={loading}
                    className="w-full h-10 text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </Button>
                </div>

                {!isFormValid && (
                  <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <ChevronRight size={14} className="text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700">
                      {!formData.customerName.trim()
                        ? 'Enter a customer name to continue'
                        : !formData.serviceType
                        ? 'Select a service type'
                        : 'Enter a price to continue'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}