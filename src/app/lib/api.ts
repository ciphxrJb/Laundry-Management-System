import { projectId, publicAnonKey } from '/utils/supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-62a04e71`;

async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
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
