import { createClient } from '@supabase/supabase-js';
import { supabase } from './supabase';

export type Order = {
  id: string;
  customer_name: string;
  customer_phone: string | null;
  service_type: string;
  weight: number | null;
  item_count: number | null;
  price: number;
  payment_status: 'Paid' | 'Unpaid';
  status: 'Pending' | 'Processing' | 'Ready' | 'Completed' | 'Cancelled';
  notes: string | null;
  created_at: string;
  user_id: string;
};

export type Customer = {
  id: string;
  name: string;
  phone: string | null;
  total_orders: number;
  total_spent: number;
  user_id: string;
};

// HELPER: Get the current Account ID (Auth UID)
async function getUserId(): Promise<string> {
  const { data: { session }, error: authError } = await supabase.auth.getSession();
  if (authError || !session) throw new Error("Please log in to your account.");
  return session.user.id;
}

export const api = {
  // Auth
  getMe: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    return {
      user: session.user,
      shopId: session.user.id, // We use User ID as Shop ID in Unified 2.0
      isAdmin: true,
      role: 'owner'
    };
  },

  // Orders (Unified 2.0)
  getOrders: async () => {
    const userId = await getUserId();
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Order[];
  },

  createOrder: async (orderData: any) => {
    const userId = await getUserId();
    
    // Explicit mapping to Unified 2.0 Schema
    const dbData = {
      user_id: userId,
      customer_name: orderData.customerName || orderData.customer_name,
      customer_phone: orderData.phone || orderData.customer_phone,
      service_type: orderData.serviceType || orderData.service_type,
      weight: orderData.weight,
      item_count: orderData.itemCount || orderData.item_count,
      price: orderData.price,
      payment_status: orderData.paymentStatus || 'Unpaid',
      notes: orderData.notes,
      status: 'Pending'
    };

    const { data, error } = await supabase
      .from('orders')
      .insert(dbData)
      .select()
      .single();

    if (error) {
      console.error("Unified 2.0 Create Error:", error);
      throw new Error(`DB Error: ${error.message}`);
    }
    return { order: data as Order };
  },

  updateOrderStatus: async (id: string, status: Order['status']) => {
    const userId = await getUserId();
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .eq('user_id', userId); // Security: only update your own orders

    if (error) throw error;
  },

  // Customers (Unified 2.0)
  getCustomers: async () => {
    const userId = await getUserId();
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('user_id', userId)
      .order('name');

    if (error) throw error;
    return data as Customer[];
  },

  // Dashboard (Unified 2.0)
  getDashboard: async () => {
    const userId = await getUserId();
    
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    const today = new Date().toISOString().split('T')[0];
    const todayOrders = orders?.filter(o => o.created_at.startsWith(today)) || [];
    const revenue = orders?.reduce((sum, o) => sum + Number(o.price || 0), 0) || 0;
    const pending = orders?.filter(o => o.status === 'Pending').length || 0;

    return {
      totalOrders: orders?.length || 0,
      todayOrders: todayOrders.length,
      revenue,
      pendingOrders: pending
    };
  }
};
