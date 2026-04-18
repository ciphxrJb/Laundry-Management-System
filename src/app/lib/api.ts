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

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const api = {
  getMe: async () => { await delay(300); return { user: { id: 'mock-user-id', email: 'admin@laundry.com' } }; },

  // Orders
  createOrder: async (data: any) => { 
    await delay(600); 
    const mockId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    return { order: { id: mockId, ...data } }; 
  },

  getOrders: async () => { await delay(400); return { orders: [] }; },

  updateOrder: async (id: string, data: any) => { await delay(400); return { order: { id, ...data } }; },

  deleteOrder: async (id: string) => { await delay(400); return { success: true }; },

  // Dashboard
  getDashboard: async () => { 
    await delay(500); 
    return {
      totalOrdersToday: 0,
      pendingOrders: 0,
      completedOrders: 0,
      readyForPickup: 0,
      totalIncomeToday: 0,
      totalIncomeWeek: 0,
      unpaidOrders: 0,
      recentOrders: []
    }; 
  },

  // Customers
  getCustomers: async () => { 
    await delay(400); 
    return { 
      customers: [
        { 
          id: 'cust-1', 
          name: 'Juan Dela Cruz', 
          phone: '09171234567', 
          firstVisit: '2026-01-10', 
          lastVisit: '2026-04-15', 
          totalOrders: 12, 
          totalSpent: 1450.50,
          preferences: 'Uses own detergent (Ariel). Hang dry only.'
        },
        { 
          id: 'cust-2', 
          name: 'Maria Santos', 
          phone: '09189876543', 
          firstVisit: '2026-02-20', 
          lastVisit: '2026-04-18', 
          totalOrders: 5, 
          totalSpent: 620.00,
          preferences: 'Fold only. No starch.'
        }
      ] as Customer[]
    }; 
  },

  getCustomer: async (id: string) => { await delay(400); return { customer: { id, name: 'Mock Customer', phone: '0917-000-0000' }, orders: [] }; },

  // Owner tools
  upsertStaffAccount: async (data: { email: string; password: string }) => { await delay(500); return { success: true }; },
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
  itemCount: number | null;
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
  preferences: string | null;
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
