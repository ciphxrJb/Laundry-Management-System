'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { api, Order } from '@/app/lib/api';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { ArrowLeft, Printer } from 'lucide-react';

function ReceiptContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadOrder();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const data = await api.getOrders();
      const foundOrder = data.orders.find((o: Order) => o.id === id);
      
      // If we are mocking api and creating local orders, "getOrders" might be empty 
      // in our simple mock. Let's handle testing gracefully by creating a dummy if needed
      // so you can actually see the thermal receipt design!
      if (foundOrder) {
        setOrder(foundOrder);
      } else {
        // Mock fallback for immediate presentation testing
        setOrder({
          id: id,
          customerId: 'test',
          customerName: 'Test Customer',
          phone: '09123456789',
          serviceType: 'Wash & Dry',
          weight: 5.5,
          price: 150.00,
          status: 'Pending',
          paymentStatus: 'Unpaid',
          notes: 'Test generated order',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    } catch (error) {
      toast.error('Failed to load order data');
    } finally {
      setLoading(false);
    }
  };

  // Safe auto-printing
  useEffect(() => {
    if (!loading && order && searchParams.get('print') === 'true') {
      const timer = setTimeout(() => {
        window.print();
      }, 500); // Give the DOM exactly half a second to render layout before freezing for print dialog
      return () => clearTimeout(timer);
    }
  }, [loading, order, searchParams]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-10">
        <div className="animate-pulse text-gray-500 font-mono text-sm">Generating Ticket...</div>
      </div>
    );
  }

  if (!order) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 print:bg-white print:py-0">
      
      {/* Screen Only Navigation Area */}
      <div className="max-w-md mx-auto mb-6 flex justify-between items-center print:hidden px-4">
        <Button variant="ghost" className="bg-white shadow-sm border border-gray-200 hover:bg-gray-50" onClick={() => router.back()}>
          <ArrowLeft size={16} className="mr-2" /> Back
        </Button>
        <Button className="bg-blue-600 hover:bg-blue-700 shadow-sm" onClick={() => window.print()}>
          <Printer size={16} className="mr-2"/> Print Receipt
        </Button>
      </div>

      {/* Actual Thermal Paper Receipt Container */}
      <div className="mx-auto bg-white shadow-lg print:shadow-none w-[320px] max-w-full font-mono text-[13px] leading-[1.4] text-black">
        {/* Receipt Padding Area */}
        <div className="p-6 print:p-0">
          
          {/* Header */}
          <div className="text-center mb-4">
            <h1 className="text-xl font-bold uppercase mb-1">Laundry POS</h1>
            <p className="text-[11px] mb-0.5">123 Main Street</p>
            <p className="text-[11px] mb-0.5">Cityville</p>
            <p className="text-[11px]">Tel: 0917-123-4567</p>
          </div>

          <div className="border-t border-dashed border-gray-400 my-3" />

          {/* Meta Data */}
          <div className="mb-4">
            <div className="flex justify-between">
              <span>Date:</span>
              <span>{formatDate(order.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span>Ticket:</span>
              <span className="font-bold">{order.id}</span>
            </div>
          </div>

          <div className="border-t border-dashed border-gray-400 my-3" />

          {/* Customer Metadata */}
          <div className="mb-4">
            <p className="uppercase font-bold mb-1 border-b border-gray-800 inline-block">CUST: {order.customerName}</p>
            {order.phone && <p>Tel: {order.phone}</p>}
          </div>

          <div className="border-t border-dashed border-gray-400 my-3" />

          {/* Table Header */}
          <div className="flex justify-between mb-2">
            <span className="font-bold">QTY / ITEM</span>
            <span className="font-bold">AMOUNT</span>
          </div>

          {/* Service Line Items */}
          <div className="flex justify-between items-start mb-1">
            <div className="w-2/3 pr-2">
              <span className="uppercase">{order.serviceType}</span>
              {order.weight && (
                <div className="text-[11px] ml-2">@ {order.weight} kg</div>
              )}
            </div>
            <div className="w-1/3 text-right">
              {order.price.toFixed(2)}
            </div>
          </div>

          {order.notes && (
            <div className="mt-2 text-[11px] italic">
              * Note: {order.notes}
            </div>
          )}

          <div className="border-t border-dashed border-gray-400 my-3" />

          {/* Totals */}
          <div className="flex justify-between mb-1">
            <span>SUBTOTAL</span>
            <span>{order.price.toFixed(2)}</span>
          </div>

          <div className="flex justify-between font-bold text-base mt-2 mb-2">
            <span>TOTAL DUE</span>
            <span>PHP {order.price.toFixed(2)}</span>
          </div>

          {/* Payment Status Tag */}
          <div className="flex justify-end mb-4">
            <span className={`px-2 py-0.5 uppercase border ${order.paymentStatus === 'Paid' ? 'border-black font-bold' : 'border-gray-500 border-dashed'}`}>
              *{order.paymentStatus}*
            </span>
          </div>

          <div className="border-t border-dashed border-gray-400 my-3" />

          {/* Footer */}
          <div className="text-center mt-6 text-[11px]">
            <p className="mb-1">All garments must be claimed</p>
            <p className="mb-1">within 30 days of completion.</p>
            <p className="mb-4">Not liable for shrinkages.</p>
            
            <p className="font-bold">*** THANK YOU ***</p>
          </div>

          {/* Bottom Cut Space (Important for Thermal Printers) */}
          <div className="h-10 print:h-20" />
        </div>
      </div>
    </div>
  );
}

export function Receipt() {
  return (
    <Suspense fallback={<div className="p-10 font-mono text-center">Loading Terminal...</div>}>
      <ReceiptContent />
    </Suspense>
  );
}
