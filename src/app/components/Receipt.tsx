import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { api, Order } from '../lib/api';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { ArrowLeft, Printer } from 'lucide-react';

export function Receipt() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadOrder();
    }
  }, [id]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const data = await api.getOrders();
      const foundOrder = data.orders.find((o: Order) => o.id === id);
      if (foundOrder) {
        setOrder(foundOrder);
      } else {
        toast.error('Order not found');
        navigate('/orders');
      }
    } catch (error) {
      console.error('Failed to load order:', error);
      toast.error('Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading receipt...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Order not found</div>
      </div>
    );
  }

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
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Action Buttons (hide on print) */}
      <div className="flex items-center gap-4 print:hidden">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Receipt</h1>
          <p className="text-gray-600 mt-1">Order details and receipt</p>
        </div>
        <Button onClick={handlePrint}>
          <Printer size={16} />
          <span className="ml-2">Print</span>
        </Button>
      </div>

      {/* Receipt Card */}
      <Card className="border-2">
        <CardContent className="p-8">
          {/* Shop Header */}
          <div className="text-center border-b pb-6 mb-6">
            <h2 className="text-3xl font-bold text-blue-600">Laundry POS</h2>
            <p className="text-gray-600 mt-2">Laundry Shop Management System</p>
            <p className="text-sm text-gray-500 mt-1">Professional Laundry Services</p>
          </div>

          {/* Order Info */}
          <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b">
            <div>
              <p className="text-sm text-gray-600">Order ID</p>
              <p className="font-mono text-sm mt-1">{order.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Date & Time</p>
              <p className="font-semibold mt-1">{new Date(order.createdAt).toLocaleString()}</p>
            </div>
          </div>

          {/* Customer Info */}
          <div className="mb-6 pb-6 border-b">
            <h3 className="font-bold text-lg mb-3">Customer Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-semibold mt-1">{order.customerName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Contact</p>
                <p className="font-semibold mt-1">{order.phone || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Service Details */}
          <div className="mb-6 pb-6 border-b">
            <h3 className="font-bold text-lg mb-3">Service Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Service Type</span>
                <span className="font-semibold">{order.serviceType}</span>
              </div>
              {order.weight && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Weight</span>
                  <span className="font-semibold">{order.weight} kg</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Status</span>
                <Badge className={getStatusColor(order.status)} variant="secondary">
                  {order.status}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Status</span>
                <Badge
                  className={order.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                  variant="secondary"
                >
                  {order.paymentStatus}
                </Badge>
              </div>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="mb-6 pb-6 border-b">
              <h3 className="font-bold text-lg mb-2">Notes</h3>
              <p className="text-gray-700 bg-gray-50 p-3 rounded">{order.notes}</p>
            </div>
          )}

          {/* Total */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold">Total Amount</span>
              <span className="text-3xl font-bold text-blue-600">₱{order.price.toFixed(2)}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t text-center text-sm text-gray-600">
            <p className="font-semibold">Thank you for your business!</p>
            <p className="mt-2">Please keep this receipt for your records</p>
            <p className="mt-4 text-xs text-gray-500">
              Generated on {new Date().toLocaleString()}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
