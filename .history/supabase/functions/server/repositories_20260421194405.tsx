import type { SupabaseClient } from "jsr:@supabase/supabase-js@2.49.8";
import * as kv from "./kv_store.tsx";

type OrderStatus = "Pending" | "Washing" | "Drying" | "Ready for pickup" | "Completed";
type PaymentStatus = "Paid" | "Unpaid";

type OrderRecord = {
  id: string;
  customerId: string;
  customerName: string;
  phone: string | null;
  serviceType: string;
  weight: number | null;
  price: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  shopId?: string | null;
};

type CustomerRecord = {
  id: string;
  name: string;
  phone: string | null;
  firstVisit: string;
  lastVisit: string;
  totalOrders: number;
  totalSpent: number;
  shopId?: string | null;
};

const isMissingTableError = (error: any) =>
  error?.code === "42P01" || String(error?.message || "").toLowerCase().includes("does not exist");

const mapOrderRow = (row: any): OrderRecord => ({
  id: row.id,
  customerId: row.customer_id,
  customerName: row.customer_name,
  phone: row.phone,
  serviceType: row.service_type,
  weight: row.weight,
  price: row.price,
  status: row.status,
  paymentStatus: row.payment_status,
  notes: row.notes,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  shopId: row.shop_id,
});

const mapCustomerRow = (row: any): CustomerRecord => ({
  id: row.id,
  name: row.name,
  phone: row.phone,
  firstVisit: row.first_visit,
  lastVisit: row.last_visit,
  totalOrders: row.total_orders,
  totalSpent: row.total_spent,
  shopId: row.shop_id,
});

export class LaundryRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async createOrder(input: {
    customerName: string;
    phone: string | null;
    serviceType: string;
    weight: number | null;
    price: number;
    paymentStatus: PaymentStatus;
    notes: string | null;
    shopId?: string | null;
  }) {
    const now = new Date().toISOString();
    const orderId = `order_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    const customerId = input.phone || `customer_${Date.now()}`;

    try {
      const { data: existingCustomer, error: customerReadError } = await this.supabase
        .from("laundry_customers")
        .select("*")
        .eq("id", customerId)
        .maybeSingle();
      if (customerReadError) throw customerReadError;

      const customerUpsert = existingCustomer
        ? {
            ...existingCustomer,
            name: input.customerName,
            phone: input.phone,
            last_visit: now,
            total_orders: Number(existingCustomer.total_orders || 0) + 1,
            total_spent: Number(existingCustomer.total_spent || 0) + input.price,
          }
        : {
            id: customerId,
            name: input.customerName,
            phone: input.phone,
            first_visit: now,
            last_visit: now,
            total_orders: 1,
            total_spent: input.price,
            shop_id: input.shopId || null,
          };

      const { error: customerUpsertError } = await this.supabase
        .from("laundry_customers")
        .upsert(customerUpsert);
      if (customerUpsertError) throw customerUpsertError;

      const orderRow = {
        id: orderId,
        customer_id: customerId,
        customer_name: input.customerName,
        phone: input.phone,
        service_type: input.serviceType,
        weight: input.weight,
        price: input.price,
        status: "Pending",
        payment_status: input.paymentStatus,
        notes: input.notes,
        shop_id: input.shopId || null,
      };

      const { data: insertedOrder, error: orderError } = await this.supabase
        .from("laundry_orders")
        .insert(orderRow)
        .select("*")
        .single();
      if (orderError) throw orderError;

      return mapOrderRow(insertedOrder);
    } catch (error) {
      if (!isMissingTableError(error)) throw error;

      const fallbackOrder: OrderRecord = {
        id: orderId,
        customerId,
        customerName: input.customerName,
        phone: input.phone,
        serviceType: input.serviceType,
        weight: input.weight,
        price: input.price,
        status: "Pending",
        paymentStatus: input.paymentStatus,
        notes: input.notes,
        createdAt: now,
        updatedAt: now,
        shopId: input.shopId || null,
      };

      await kv.set(`orders:${orderId}`, fallbackOrder);
      const existingCustomer = await kv.get(`customers:${customerId}`);
      const customer = existingCustomer || {
        id: customerId,
        name: input.customerName,
        phone: input.phone,
        firstVisit: now,
        lastVisit: now,
        totalOrders: 0,
        totalSpent: 0,
        shopId: input.shopId || null,
      };
      customer.lastVisit = now;
      customer.totalOrders = (customer.totalOrders || 0) + 1;
      customer.totalSpent = (customer.totalSpent || 0) + input.price;
      await kv.set(`customers:${customerId}`, customer);

      return fallbackOrder;
    }
  }

  async getOrders(shopId: string) {
    try {
      const { data, error } = await this.supabase
        .from("laundry_orders")
        .select("*")
        .eq("shop_id", shopId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map(mapOrderRow);
    } catch (error) {
      if (!isMissingTableError(error)) throw error;
      const orders = await kv.getByPrefix("orders:");
      return orders.filter(o => o.shopId === shopId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  }

  async getOrderById(orderId: string) {
    try {
      const { data, error } = await this.supabase
        .from("laundry_orders")
        .select("*")
        .eq("id", orderId)
        .maybeSingle();
      if (error) throw error;
      return data ? mapOrderRow(data) : null;
    } catch (error) {
      if (!isMissingTableError(error)) throw error;
      return await kv.get(`orders:${orderId}`);
    }
  }

  async updateOrder(orderId: string, changes: Record<string, unknown>) {
    const updatedAt = new Date().toISOString();
    try {
      const patch: Record<string, unknown> = { updated_at: updatedAt };
      if (typeof changes.status === "string") patch.status = changes.status;
      if (typeof changes.paymentStatus === "string") patch.payment_status = changes.paymentStatus;
      if (typeof changes.notes === "string" || changes.notes === null) patch.notes = changes.notes;

      const { data, error } = await this.supabase
        .from("laundry_orders")
        .update(patch)
        .eq("id", orderId)
        .select("*")
        .maybeSingle();
      if (error) throw error;
      return data ? mapOrderRow(data) : null;
    } catch (error) {
      if (!isMissingTableError(error)) throw error;
      const order = await kv.get(`orders:${orderId}`);
      if (!order) return null;
      const updatedOrder = { ...order, ...changes, updatedAt };
      await kv.set(`orders:${orderId}`, updatedOrder);
      return updatedOrder;
    }
  }

  async deleteOrder(orderId: string) {
    try {
      const { error } = await this.supabase.from("laundry_orders").delete().eq("id", orderId);
      if (error) throw error;
      return;
    } catch (error) {
      if (!isMissingTableError(error)) throw error;
      await kv.del(`orders:${orderId}`);
    }
  }

  async getCustomers(shopId: string) {
    try {
      const { data, error } = await this.supabase
        .from("laundry_customers")
        .select("*")
        .eq("shop_id", shopId)
        .order("last_visit", { ascending: false });
      if (error) throw error;
      return (data || []).map(mapCustomerRow);
    } catch (error) {
      if (!isMissingTableError(error)) throw error;
      const customers = await kv.getByPrefix("customers:");
      return customers.filter(c => c.shopId === shopId).sort((a, b) => new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime());
    }
  }
}
