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
  shop_id: string;
};

export type Customer = {
  id: string;
  name: string;
  phone: string | null;
  total_orders: number;
  total_spent: number;
  shop_id: string;
};

export type DashboardStats = {
  totalOrdersToday: number;
  pendingOrders: number;
  completedOrders: number;
  readyForPickup: number;
  totalIncomeToday: number;
  totalIncomeWeek: number;
  unpaidOrders: number;
  recentOrders: Order[];
};

// HELPER: Get the current Account ID (Auth UID)
async function getUserId(): Promise<string> {
  const { data: { session }, error: authError } = await supabase.auth.getSession();
  if (authError || !session) throw new Error("Please log in to your account.");
  return session.user.id;
}

// HELPER: Get the current Shop ID from membership
async function getShopId(): Promise<string> {
  const me = await api.getMe();
  if (!me || !me.shopId) throw new Error("No shop access. Please contact admin.");
  return me.shopId;
}

export const api = {
  // Auth
  getMe: async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) return null;

      // Query user's membership to get shop, organization, and role
      const { data: membership, error: membershipError } = await supabase
        .from('memberships')
        .select('shop_id, organization_id, role')
        .eq('user_id', session.user.id)
        .single();

      if (membershipError || !membership) {
        // No membership found - user not assigned to a shop
        return {
          user: session.user,
          shopId: null,
          organizationId: null,
          role: null,
          isAdmin: false
        };
      }

      return {
        user: session.user,
        shopId: membership.shop_id,
        organizationId: membership.organization_id,
        role: membership.role,
        isAdmin: membership.role === 'owner' || membership.role === 'manager'
      };
    } catch {
      return null;
    }
  },

  // Orders (Unified 2.0)
  getOrders: async () => {
    const shopId = await getShopId();
    const { data, error } = await supabase
      .from('laundry_orders')
      .select('*')
      .eq('shop_id', shopId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Order[];
  },

  createOrder: async (orderData: any) => {
    const userId = await getUserId();
    const shopId = await getShopId();
    
    // Explicit mapping to Unified 2.0 Schema
    const dbData = {
      user_id: userId,
      shop_id: shopId,
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
      .from('laundry_orders')
      .insert(dbData)
      .select()
      .single();

    if (error) {
      console.error("Unified 2.0 Create Error:", error);
      throw new Error(`DB Error: ${error.message}`);
    }

    // --- AUTO-CUSTOMER TRACKING ---
    // Check if customer already exists for this shop
    const { data: existingCustomers } = await supabase
      .from('laundry_customers')
      .select('*')
      .eq('shop_id', shopId)
      .eq('name', dbData.customer_name)
      .limit(1);

    const existingCustomer = existingCustomers?.[0];

    if (existingCustomer) {
      // Update existing customer's lifetime value and visits
      await supabase
        .from('customers')
        .update({
          total_orders: (existingCustomer.total_orders || 0) + 1,
          total_spent: Number(existingCustomer.total_spent || 0) + Number(dbData.price),
          phone: dbData.customer_phone || existingCustomer.phone // update phone if they gave a new one
        })
        .eq('id', existingCustomer.id);
    } else {
      // Create new customer profile
      await supabase
        .from('laundry_customers')
        .insert({
          shop_id: shopId,
          name: dbData.customer_name,
          phone: dbData.customer_phone,
          total_orders: 1,
          total_spent: Number(dbData.price)
        });
    }

    return { order: data as Order };
  },

  updateOrderStatus: async (id: string, status: Order['status']) => {
    const shopId = await getShopId();
    const { error } = await supabase
      .from('laundry_orders')
      .update({ status })
      .eq('id', id)
      .eq('shop_id', shopId); // Security: only update orders in your shop

    if (error) throw error;
  },

  // Customers (Unified 2.0)
  getCustomers: async () => {
    const shopId = await getShopId();
    const { data, error } = await supabase
      .from('laundry_customers')
      .select('*')
      .eq('shop_id', shopId)
      .order('name');

    if (error) throw error;
    return data as Customer[];
  },

  // Dashboard (Unified 2.0)
  getDashboard: async () => {
    const shopId = await getShopId();
    
    const { data: orders, error } = await supabase
      .from('laundry_orders')
      .select('*')
      .eq('shop_id', shopId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const today = new Date().toISOString().split('T')[0];
    
    // Safety check
    const validOrders = orders || [];

    const todayOrdersObj = validOrders.filter(o => o.created_at.startsWith(today));
    
    // Weekly calculation (last 7 days rough calc)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const weeklyOrders = validOrders.filter(o => new Date(o.created_at) >= sevenDaysAgo);

    return {
      totalOrdersToday: todayOrdersObj.length,
      pendingOrders: validOrders.filter(o => o.status === 'Pending' || o.status === 'Processing').length,
      completedOrders: validOrders.filter(o => o.status === 'Completed').length,
      readyForPickup: validOrders.filter(o => o.status === 'Ready').length,
      totalIncomeToday: todayOrdersObj.reduce((sum, o) => sum + Number(o.price || 0), 0),
      totalIncomeWeek: weeklyOrders.reduce((sum, o) => sum + Number(o.price || 0), 0),
      unpaidOrders: validOrders.filter(o => o.payment_status === 'Unpaid').length,
      recentOrders: validOrders.slice(0, 5) // Send the 5 most recent orders
    };
  }
};
