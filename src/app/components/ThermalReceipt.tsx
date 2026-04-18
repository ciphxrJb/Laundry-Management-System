import { useState, useEffect } from 'react';
import { Order } from '@/app/lib/api';
import { supabase } from '@/app/lib/supabase';

export function ThermalReceipt({ order }: { order: Order }) {
  const [shopInfo, setShopInfo] = useState({
    name: 'Laundry POS',
    address: '123 Main Street\nCityville',
    phone: '0917-123-4567'
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.user_metadata) {
        const meta = session.user.user_metadata;
        setShopInfo({
          name: meta.shop_name || 'Laundry POS',
          address: meta.shop_address || '123 Main Street\nCityville',
          phone: meta.shop_phone || '0917-123-4567'
        });
      }
    });
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="hidden print:block font-mono text-[13px] leading-[1.4] text-black mx-auto w-[320px]">
      <div className="text-center mb-4">
        <h1 className="text-xl font-bold uppercase mb-1">{shopInfo.name}</h1>
        {shopInfo.address.split('\n').map((line, i) => (
          <p key={i} className="text-[11px] mb-0.5">{line}</p>
        ))}
        <p className="text-[11px]">Tel: {shopInfo.phone}</p>
      </div>

      <div className="border-t border-dashed border-gray-400 my-3" />

      <div className="mb-4">
        <div className="flex justify-between">
          <span>Date:</span>
          <span>{formatDate(order.created_at)}</span>
        </div>
        <div className="flex justify-between">
          <span>Ticket:</span>
          <span className="font-bold">{order.id.slice(0, 8).toUpperCase()}</span>
        </div>
      </div>

      <div className="border-t border-dashed border-gray-400 my-3" />

      <div className="mb-4">
        <p className="uppercase font-bold mb-1 border-b border-gray-800 inline-block">CUST: {order.customer_name}</p>
        {order.customer_phone && <p>Tel: {order.customer_phone}</p>}
      </div>

      <div className="border-t border-dashed border-gray-400 my-3" />

      <div className="flex justify-between mb-2">
        <span className="font-bold">QTY / ITEM</span>
        <span className="font-bold">AMOUNT</span>
      </div>

      <div className="flex justify-between items-start mb-1">
        <div className="w-2/3 pr-2">
          <span className="uppercase">{order.service_type}</span>
          <div className="text-[11px] ml-2">
            {order.weight && <span>@ {order.weight} kg </span>}
            {order.item_count && <span>({order.item_count} pcs)</span>}
          </div>
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

      <div className="flex justify-between mb-1">
        <span>SUBTOTAL</span>
        <span>{order.price.toFixed(2)}</span>
      </div>

      <div className="flex justify-between font-bold text-base mt-2 mb-2">
        <span>TOTAL DUE</span>
        <span>PHP {order.price.toFixed(2)}</span>
      </div>

      <div className="flex justify-end mb-4">
        <span className={`px-2 py-0.5 uppercase border ${order.payment_status === 'Paid' ? 'border-black font-bold' : 'border-gray-500 border-dashed'}`}>
          *{order.payment_status}*
        </span>
      </div>

      <div className="border-t border-dashed border-gray-400 my-3" />

      <div className="text-center mt-6 text-[11px]">
        <p className="mb-1">All garments must be claimed</p>
        <p className="mb-1">within 30 days of completion.</p>
        <p className="mb-4">Not liable for shrinkages.</p>
        
        <p className="font-bold">*** THANK YOU ***</p>
      </div>

      <div className="h-20" />
    </div>
  );
}
