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
  staff_id?: string;
  staff_name?: string;
};

export type Customer = {
  id: string;
  name: string;
  phone: string | null;
  total_orders: number;
  total_spent: number;
  shop_id: string;
};

export type Service = {
  id: string;
  name: string;
  description: string | null;
  base_price: number;
  price_per_kg: number;
  is_active: boolean;
  shop_id: string;
};

export type Staff = {
  id: string;
  name: string;
  pin: string;
  is_active: boolean;
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

export type CreateOrderInput = {
  customer_name: string;
  customer_phone: string | null;
  service_type: string;
  weight: number | null;
  item_count: number | null;
  price: number;
  payment_status: 'Paid' | 'Unpaid';
  notes: string | null;
  staff_pin: string;
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

    // Get the current shop context from localStorage
    const targetShopId = typeof window !== 'undefined' ? localStorage.getItem('shopId') : null;

    let query = supabase
      .from('memberships')
      .select('shop_id, organization_id, role')
      .eq('user_id', session.user.id);

    // If we have a specific shop in mind, look for THAT membership. 
    // Otherwise, just pick the first one available for this user.
    if (targetShopId && targetShopId !== 'null' && targetShopId !== 'undefined') {
      query = query.eq('shop_id', targetShopId);
    }

    const { data: membership, error: membershipError } = await query.limit(1).maybeSingle();

    if (membershipError || !membership) {
      // If we don't have a membership for this specific shop, 
      // let's try to find ANY membership for this user as a fallback
      if (targetShopId) {
        const { data: fallback } = await supabase
          .from('memberships')
          .select('shop_id, organization_id, role')
          .eq('user_id', session.user.id)
          .limit(1)
          .maybeSingle();

        if (fallback) {
          // Update localStorage so we don't hit this again
          localStorage.setItem('shopId', fallback.shop_id);
          return {
            user: session.user,
            shopId: fallback.shop_id,
            organizationId: fallback.organization_id,
            role: fallback.role,
            isAdmin: fallback.role === 'owner' || fallback.role === 'manager'
          };
        }
      }

      return {
        user: session.user,
        shopId: targetShopId,
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
  } catch (err) {
    console.error("Error in getUserMembership:", err);
    return null;
  }
}

async function getShopId(providedId?: string | null): Promise<string> {
  if (providedId) return providedId;

  const targetShopId = typeof window !== 'undefined' ? localStorage.getItem('shopId') : null;
  if (targetShopId && targetShopId !== 'null' && targetShopId !== 'undefined') return targetShopId;

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
  createShop: async (name: string): Promise<string> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // 1. Get the organization ID from existing membership
    const { data: mem, error: memErr } = await supabase
      .from('memberships')
      .select('organization_id')
      .eq('user_id', user.id)
      .limit(1)
      .single();

    if (memErr) throw new Error('Could not find organization');
    const orgId = mem.organization_id;

    // 2. Create the shop
    const { data: shop, error: shopErr } = await supabase
      .from('shops')
      .insert([{ name, organization_id: orgId }])
      .select()
      .single();

    if (shopErr) throw shopErr;

    // 3. Create the membership link (Owner)
    const { error: linkErr } = await supabase
      .from('memberships')
      .insert([{
        user_id: user.id,
        organization_id: orgId,
        shop_id: shop.id,
        role: 'owner'
      }]);

    if (linkErr) throw linkErr;

    // 4. Seed with initial default services
    await supabase.from('laundry_services').insert([
      { shop_id: shop.id, name: 'Wash Only', base_price: 50, price_per_kg: 15 },
      { shop_id: shop.id, name: 'Dry Only', base_price: 50, price_per_kg: 10 },
      { shop_id: shop.id, name: 'Wash & Dry', base_price: 90, price_per_kg: 25 },
      { shop_id: shop.id, name: 'Rush Wash & Dry', base_price: 150, price_per_kg: 35 }
    ]);

    return shop.id;
  },

  getUserShops: async (): Promise<ShopInfo[]> => {
    const userId = await getUserId();
    // Simplified query - just get the shops linked to these memberships
    const { data, error } = await supabase
      .from('memberships')
      .select(`
        shop:shop_id (
          id,
          name,
          organization:organization_id (
            id,
            name
          )
        )
      `)
      .eq('user_id', userId);

    if (error) {
      console.error("Supabase Error in getUserShops:", error.message, error.details);
      throw error;
    }

    if (!data) return [];

    return data
      .filter((item: any) => item.shop)
      .map((item: any) => ({
        id: item.shop.id,
        name: item.shop.name,
        organization: {
          id: item.shop.organization?.id || 'unknown',
          name: item.shop.organization?.name || 'Unknown Organization',
        }
      }));
  },

  // Orders
  getOrders: async (shopId?: string | null): Promise<Order[]> => {
    const activeShopId = await getShopId(shopId);
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
      .eq('shop_id', activeShopId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Order[];
  },

  createOrder: async (order: CreateOrderInput, shopId?: string | null): Promise<Order> => {
    const activeShopId = await getShopId(shopId);
    const userId = await getUserId();

    // 1. Get or Create Customer
    let customerId = '';

    // Try to find existing customer by phone first, then name
    const { data: existing } = await supabase
      .from('laundry_customers')
      .select('id')
      .eq('shop_id', activeShopId)
      .or(`phone.eq."${order.customer_phone}",name.eq."${order.customer_name}"`)
      .limit(1)
      .maybeSingle();

    if (existing) {
      console.log("Found existing customer:", existing.id);
      customerId = existing.id;
      // Update totals - this is optional, don't let it crash the order
      try {
        await supabase.rpc('increment_customer_stats', {
          customer_id: customerId,
          order_price: order.price
        });
      } catch (e) {
        console.warn("Could not update customer stats, but continuing order...");
      }
    } else {
      console.log("Creating new customer record...");
      const newId = `CUST-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

      const { data: newCust, error: custErr } = await supabase
        .from('laundry_customers')
        .insert([{
          id: newId,
          shop_id: activeShopId,
          name: order.customer_name,
          phone: order.customer_phone,
          total_orders: 1,
          total_spent: order.price
        }])
        .select()
        .single();

      if (custErr) {
        if (custErr.code === '42501' || custErr.message.includes('permission denied')) {
          console.error("Critical RLS Error: Membership not recognized for this branch.");
          throw new Error(`Permission Denied: You don't have write access to this branch (${activeShopId}). Please contact your owner.`);
        }
        throw new Error(`Database Error: ${custErr.message}`);
      }
      customerId = newCust.id;
      console.log("Customer record established:", customerId);
    }

    // 2. Create Order
    const orderId = `ORD-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    console.group(`Creating Order: ${orderId}`);
    console.log("Active Shop ID:", activeShopId);
    console.log("Customer ID:", customerId);
    console.log("User ID:", userId);

    // 2. Verify Staff PIN
    const { data: staff, error: staffErr } = await supabase
      .from('shop_staff')
      .select('id, name')
      .eq('shop_id', activeShopId)
      .eq('pin', order.staff_pin)
      .eq('is_active', true)
      .maybeSingle();

    if (staffErr || !staff) {
      console.error("PIN Verification Failed");
      console.groupEnd();
      throw new Error("Invalid Staff PIN. Please try again.");
    }
    console.log("Staff Verified:", staff.name);

    // Map CreateOrderInput to Database Columns
    const dbOrder = {
      id: orderId,
      shop_id: activeShopId,
      customer_id: customerId,
      customer_name: order.customer_name,
      phone: order.customer_phone,
      service_type: order.service_type,
      weight: order.weight,
      price: order.price,
      payment_status: order.payment_status,
      notes: order.notes,
      status: 'Pending',
      staff_id: staff.id,
      staff_name: staff.name
    };

    const { data, error } = await supabase
      .from('laundry_orders')
      .insert([dbOrder])
      .select()
      .single();

    if (error) {
      console.error("SUPABASE ERROR:", error.message);
      console.error("DETAILS:", error.details);
      console.error("HINT:", error.hint);
      console.groupEnd();

      // Throw a structured error that won't be {} in the UI
      const detailedError = new Error(error.message || "Permission denied or database error");
      // @ts-ignore - adding extra info for the UI toast
      detailedError.details = error.details;
      throw detailedError;
    }

    console.log("Successfully created order:", data);
    console.groupEnd();
    return data as Order;
  },

  updateOrder: async (id: string, updates: Partial<Order>, shopId?: string | null): Promise<Order> => {
    const activeShopId = await getShopId(shopId);
    const { data, error } = await supabase
      .from('laundry_orders')
      .update(updates)
      .eq('id', id)
      .eq('shop_id', activeShopId)
      .select()
      .single();

    if (error) throw error;
    return data as Order;
  },

  updateOrderStatus: async (id: string, status: Order['status'], shopId?: string | null): Promise<void> => {
    const activeShopId = await getShopId(shopId);
    const { error } = await supabase
      .from('laundry_orders')
      .update({ status })
      .eq('id', id)
      .eq('shop_id', activeShopId);

    if (error) throw error;
  },

  deleteOrder: async (id: string, shopId?: string | null): Promise<void> => {
    const activeShopId = await getShopId(shopId);
    const { error } = await supabase
      .from('laundry_orders')
      .delete()
      .eq('id', id)
      .eq('shop_id', activeShopId);

    if (error) throw error;
  },

  // Customers
  getCustomers: async (shopId?: string | null): Promise<Customer[]> => {
    const activeShopId = await getShopId(shopId);
    const { data, error } = await supabase
      .from('laundry_customers')
      .select('*')
      .eq('shop_id', activeShopId)
      .order('name');

    if (error) throw error;
    return data as Customer[];
  },

  // Services
  getServices: async (shopId?: string | null): Promise<Service[]> => {
    const activeShopId = await getShopId(shopId);
    const { data, error } = await supabase
      .from('laundry_services')
      .select('*')
      .eq('shop_id', activeShopId)
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return data as Service[];
  },

  createService: async (service: Omit<Service, 'id' | 'shop_id' | 'is_active'>, shopId?: string | null): Promise<Service> => {
    const activeShopId = await getShopId(shopId);
    const { data, error } = await supabase
      .from('laundry_services')
      .insert([{ ...service, shop_id: activeShopId }])
      .select()
      .single();

    if (error) throw error;
    return data as Service;
  },

  updateService: async (id: string, updates: Partial<Service>): Promise<Service> => {
    const { data, error } = await supabase
      .from('laundry_services')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Service;
  },

  deleteService: async (id: string): Promise<void> => {
    // We do a soft delete (mark as inactive) to preserve order history
    const { error } = await supabase
      .from('laundry_services')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
  },

  seedDefaultServices: async (shopId?: string | null): Promise<void> => {
    const activeShopId = await getShopId(shopId);

    // Check if ACTIVE services already exist
    const { data: existing } = await supabase
      .from('laundry_services')
      .select('id')
      .eq('shop_id', activeShopId)
      .eq('is_active', true)
      .limit(1);

    if (existing && existing.length > 0) {
      throw new Error("Active services already exist for this branch");
    }

    const { error } = await supabase.from('laundry_services').insert([
      { shop_id: activeShopId, name: 'Wash Only', base_price: 50, price_per_kg: 15 },
      { shop_id: activeShopId, name: 'Dry Only', base_price: 50, price_per_kg: 10 },
      { shop_id: activeShopId, name: 'Wash & Dry', base_price: 90, price_per_kg: 25 },
      { shop_id: activeShopId, name: 'Rush Wash & Dry', base_price: 150, price_per_kg: 35 }
    ]);

    if (error) throw error;
  },

  // Staff
  getStaff: async (shopId?: string | null): Promise<Staff[]> => {
    const activeShopId = await getShopId(shopId);
    const { data, error } = await supabase
      .from('shop_staff')
      .select('*')
      .eq('shop_id', activeShopId)
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return data as Staff[];
  },

  createStaff: async (staff: Omit<Staff, 'id' | 'shop_id' | 'is_active'>, shopId?: string | null): Promise<Staff> => {
    const activeShopId = await getShopId(shopId);
    const { data, error } = await supabase
      .from('shop_staff')
      .insert([{ ...staff, shop_id: activeShopId }])
      .select()
      .single();

    if (error) throw error;
    return data as Staff;
  },

  deleteStaff: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('shop_staff')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
  },

  // Dashboard
  getDashboard: async (shopId?: string | null): Promise<DashboardStats> => {
    const activeShopId = await getShopId(shopId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastWeek = new Date();
    lastWeek.setDate(today.getDate() - 7);

    // Optimized parallel multi-query fetch
    const [
      { data: todayOrders },
      { data: weeklyOrders },
      { data: unpaidCount }
    ] = await Promise.all([
      supabase.from('laundry_orders').select('price, status, payment_status').eq('shop_id', activeShopId).gte('created_at', today.toISOString()),
      // Fetch the full week for both revenue calculation AND for the list
      supabase.from('laundry_orders').select('*').eq('shop_id', activeShopId).gte('created_at', lastWeek.toISOString()).order('created_at', { ascending: false }),
      supabase.from('laundry_orders').select('id', { count: 'exact', head: true }).eq('shop_id', activeShopId).eq('payment_status', 'Unpaid')
    ]);

    return {
      totalOrdersToday: todayOrders?.length || 0,
      pendingOrders: todayOrders?.filter(o => o.status === 'Pending' || o.status === 'Processing').length || 0,
      completedOrders: todayOrders?.filter(o => o.status === 'Completed').length || 0,
      readyForPickup: todayOrders?.filter(o => o.status === 'Ready' || o.status === 'Ready for pickup').length || 0,
      totalIncomeToday: todayOrders?.reduce((sum, o) => sum + Number(o.price || 0), 0) || 0,
      totalIncomeWeek: weeklyOrders?.reduce((sum, o) => sum + Number(o.price || 0), 0) || 0,
      unpaidOrders: unpaidCount?.length || 0,
      recentOrders: weeklyOrders || []
    };
  }
};
