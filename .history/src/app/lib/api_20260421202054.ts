import { supabase } from './supabase';

// Types
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

export type UserMembership = {
  user: any;
  shopId: string | null;
  organizationId: string | null;
  role: string | null;
  isAdmin: boolean;
};

export type ShopInfo = {
  id: string;
  name: string;
  organization: {
    id: string;
    name: string;
  };
};

// Helper functions
async function getUserId(): Promise<string> {
  const { data: { session }, error: authError } = await supabase.auth.getSession();
  if (authError || !session) throw new Error("Please log in to your account.");
  return session.user.id;
}

async function getUserMembership(): Promise<UserMembership | null> {
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
}

async function getShopId(): Promise<string> {
  const membership = await getUserMembership();
  if (!membership || !membership.shopId) {
    throw new Error("No shop access. Please contact admin.");
  }
  return membership.shopId;
}

// API object with better TypeScript structure
export const api = {
  // Auth
  getMe: getUserMembership,

  // Shops
  getUserShops: async (): Promise<ShopInfo[]> => {
    const userId = await getUserId();
    const { data, error } = await supabase
      .from('memberships')
      .select(`
        shop_id,
        shops:shop_id (
          id,
          name,
          organization_id,
          organizations:organization_id (
            id,
            name
          )
        )
      `)
      .eq('user_id', userId);

    if (error) throw error;

    return data.map((item: any) => ({
      id: item.shops.id,
      name: item.shops.name,
      organization: {
        id: item.shops.organizations.id,
        name: item.shops.organizations.name,
      }
    }));
  },

  // Orders
  getOrders: async (): Promise<Order[]> => {
    const shopId = await getShopId();
    const { data, error } = await supabase
      .from('laundry_orders')
      .select(`
        *,
        customers:customer_id (
          id,
          name,
          phone
        )
      `)
      .eq('shop_id', shopId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Order[];
  },

  createOrder: async (order: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Promise<Order> => {
    const shopId = await getShopId();
    const { data, error } = await supabase
      .from('laundry_orders')
      .insert({ ...order, shop_id: shopId })
      .select()
      .single();

    if (error) throw error;
    return data as Order;
  },

  updateOrder: async (id: string, updates: Partial<Order>): Promise<Order> => {
    const shopId = await getShopId();
    const { data, error } = await supabase
      .from('laundry_orders')
      .update(updates)
      .eq('id', id)
      .eq('shop_id', shopId)
      .select()
      .single();

    if (error) throw error;
    return data as Order;
  },

  updateOrderStatus: async (id: string, status: Order['status']): Promise<void> => {
    const shopId = await getShopId();
    const { error } = await supabase
      .from('laundry_orders')
      .update({ status })
      .eq('id', id)
      .eq('shop_id', shopId);

    if (error) throw error;
  },

  deleteOrder: async (id: string): Promise<void> => {
    const shopId = await getShopId();
    const { error } = await supabase
      .from('laundry_orders')
      .delete()
      .eq('id', id)
      .eq('shop_id', shopId);

    if (error) throw error;
  },

  // Customers
  getCustomers: async (): Promise<Customer[]> => {
    const shopId = await getShopId();
    const { data, error } = await supabase
      .from('laundry_customers')
      .select('*')
      .eq('shop_id', shopId)
      .order('name');

    if (error) throw error;
    return data as Customer[];
  },

  // Dashboard
  getDashboard: async (): Promise<DashboardStats> => {
    const shopId = await getShopId();

    const { data: orders, error } = await supabase
      .from('laundry_orders')
      .select('*')
      .eq('shop_id', shopId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const today = new Date().toISOString().split('T')[0];
    const validOrders = orders || [];
    const todayOrdersObj = validOrders.filter(o => o.created_at.startsWith(today));

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
      recentOrders: validOrders.slice(0, 5)
    };
  }
};
