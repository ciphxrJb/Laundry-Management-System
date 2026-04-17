const projectId = "imxsejsnzdsczdnsxqzk"
const publicAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlteHNlanNuemRzY3pkbnN4cXprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzMDM1OTksImV4cCI6MjA5MTg3OTU5OX0.NfycSG6tAshJJCJxAZz_eW4hyuf52Zmx3znsIygbqzw"
import { supabase } from './supabase';

// Edge function is deployed as "server"
const API_BASE = `https://${projectId}.supabase.co/functions/v1/server`;

async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const { data } = await supabase.auth.getSession();
  const accessToken = data.session?.access_token;
  const role = data.session?.user?.app_metadata?.role ?? data.session?.user?.user_metadata?.role;

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': accessToken ? `Bearer ${accessToken}` : `Bearer ${publicAnonKey}`,
      ...(role ? { 'X-App-Role': role } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export const api = {
  getMe: () => apiRequest('/me'),

  // Orders
  createOrder: (data: any) => apiRequest('/orders', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  getOrders: () => apiRequest('/orders'),

  updateOrder: (id: string, data: any) => apiRequest(`/orders/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  deleteOrder: (id: string) => apiRequest(`/orders/${id}`, {
    method: 'DELETE',
  }),

  // Dashboard
  getDashboard: () => apiRequest('/dashboard'),

  // Customers
  getCustomers: () => apiRequest('/customers'),

  getCustomer: (id: string) => apiRequest(`/customers/${id}`),

  // Owner tools
  upsertStaffAccount: (data: { email: string; password: string }) => apiRequest('/admin/staff-account', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

export type Order = {
  id: string;
  customerId: string;
  customerName: string;
  phone: string | null;
  serviceType: string;
  weight: number | null;
  price: number;
  status: 'Pending' | 'Washing' | 'Drying' | 'Ready for pickup' | 'Completed';
  paymentStatus: 'Paid' | 'Unpaid';
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Customer = {
  id: string;
  name: string;
  phone: string | null;
  firstVisit: string;
  lastVisit: string;
  totalOrders: number;
  totalSpent: number;
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

export type UserContext = {
  user: {
    id: string;
    email: string;
  };
  role: 'owner' | 'manager' | 'cashier' | 'staff';
  organizationId: string | null;
  shopId: string | null;
};
