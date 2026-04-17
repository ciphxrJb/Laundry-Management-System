'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { api } from '@/app/lib/api';
import { toast } from 'sonner';
import { Database } from 'lucide-react';

export function DemoDataButton() {
  const [loading, setLoading] = useState(false);

  const createDemoData = async () => {
    try {
      setLoading(true);
      
      const demoOrders = [
        {
          customerName: 'Juan Dela Cruz',
          phone: '09171234567',
          serviceType: 'Wash + Dry + Fold',
          weight: 5.5,
          price: 120,
          paymentStatus: 'Paid',
          notes: 'Please use fabric softener',
        },
        {
          customerName: 'Maria Santos',
          phone: '09189876543',
          serviceType: 'Wash + Dry',
          weight: 3.2,
          price: 80,
          paymentStatus: 'Unpaid',
          notes: null,
        },
        {
          customerName: 'Pedro Reyes',
          phone: '09201234567',
          serviceType: 'Dry',
          weight: 2.0,
          price: 40,
          paymentStatus: 'Paid',
          notes: null,
        },
      ];

      for (const order of demoOrders) {
        await api.createOrder(order);
      }

      toast.success('Demo data created successfully!');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      console.error('Failed to create demo data:', error);
      toast.error(error.message || 'Failed to create demo data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={createDemoData}
      disabled={loading}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      <Database size={16} />
      {loading ? 'Creating...' : 'Add Demo Data'}
    </Button>
  );
}
