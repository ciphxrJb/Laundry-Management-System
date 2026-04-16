import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-62a04e71/health", (c) => {
  return c.json({ status: "ok" });
});

// ============================================
// LAUNDRY SHOP MANAGEMENT SYSTEM API
// ============================================

// Create new order
app.post("/make-server-62a04e71/orders", async (c) => {
  try {
    const body = await c.req.json();
    const { customerName, phone, serviceType, weight, price, paymentStatus, notes } = body;

    if (!customerName || !serviceType || !price) {
      return c.json({ error: "Missing required fields: customerName, serviceType, price" }, 400);
    }

    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const customerId = phone || `customer_${Date.now()}`;
    const now = new Date().toISOString();
    const today = new Date().toISOString().split('T')[0];

    // Create order object
    const order = {
      id: orderId,
      customerId,
      customerName,
      phone: phone || null,
      serviceType,
      weight: weight || null,
      price: parseFloat(price),
      status: "Pending",
      paymentStatus: paymentStatus || "Unpaid",
      notes: notes || null,
      createdAt: now,
      updatedAt: now,
    };

    // Save order
    await kv.set(`orders:${orderId}`, order);

    // Update customer info
    let customer = await kv.get(`customers:${customerId}`);
    if (!customer) {
      customer = {
        id: customerId,
        name: customerName,
        phone: phone || null,
        firstVisit: now,
        lastVisit: now,
        totalOrders: 0,
        totalSpent: 0,
      };
    }
    customer.lastVisit = now;
    customer.totalOrders = (customer.totalOrders || 0) + 1;
    customer.totalSpent = (customer.totalSpent || 0) + parseFloat(price);
    await kv.set(`customers:${customerId}`, customer);

    // Add to daily orders index
    const dailyOrdersKey = `ordersByDate:${today}`;
    const dailyOrders = (await kv.get(dailyOrdersKey)) || [];
    dailyOrders.push(orderId);
    await kv.set(dailyOrdersKey, dailyOrders);

    return c.json({ success: true, order });
  } catch (error) {
    console.log("Error creating order:", error);
    return c.json({ error: `Failed to create order: ${error}` }, 500);
  }
});

// Get all orders
app.get("/make-server-62a04e71/orders", async (c) => {
  try {
    const allOrders = await kv.getByPrefix("orders:");
    const orders = allOrders.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return c.json({ orders });
  } catch (error) {
    console.log("Error fetching orders:", error);
    return c.json({ error: `Failed to fetch orders: ${error}` }, 500);
  }
});

// Update order status
app.put("/make-server-62a04e71/orders/:id", async (c) => {
  try {
    const orderId = c.req.param("id");
    const body = await c.req.json();
    
    const order = await kv.get(`orders:${orderId}`);
    if (!order) {
      return c.json({ error: "Order not found" }, 404);
    }

    const updatedOrder = {
      ...order,
      ...body,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`orders:${orderId}`, updatedOrder);
    return c.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.log("Error updating order:", error);
    return c.json({ error: `Failed to update order: ${error}` }, 500);
  }
});

// Delete order
app.delete("/make-server-62a04e71/orders/:id", async (c) => {
  try {
    const orderId = c.req.param("id");
    const order = await kv.get(`orders:${orderId}`);
    
    if (!order) {
      return c.json({ error: "Order not found" }, 404);
    }

    await kv.del(`orders:${orderId}`);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting order:", error);
    return c.json({ error: `Failed to delete order: ${error}` }, 500);
  }
});

// Get dashboard stats
app.get("/make-server-62a04e71/dashboard", async (c) => {
  try {
    const allOrders = await kv.getByPrefix("orders:");
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const todayOrders = allOrders.filter(o => o.createdAt.startsWith(today));
    const weekOrders = allOrders.filter(o => new Date(o.createdAt) >= weekAgo);

    const stats = {
      totalOrdersToday: todayOrders.length,
      pendingOrders: allOrders.filter(o => o.status === "Pending" || o.status === "Washing" || o.status === "Drying").length,
      completedOrders: allOrders.filter(o => o.status === "Completed").length,
      readyForPickup: allOrders.filter(o => o.status === "Ready for pickup").length,
      totalIncomeToday: todayOrders.filter(o => o.paymentStatus === "Paid").reduce((sum, o) => sum + o.price, 0),
      totalIncomeWeek: weekOrders.filter(o => o.paymentStatus === "Paid").reduce((sum, o) => sum + o.price, 0),
      unpaidOrders: allOrders.filter(o => o.paymentStatus === "Unpaid" && o.status !== "Completed").length,
      recentOrders: allOrders
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10),
    };

    return c.json(stats);
  } catch (error) {
    console.log("Error fetching dashboard stats:", error);
    return c.json({ error: `Failed to fetch dashboard stats: ${error}` }, 500);
  }
});

// Get all customers
app.get("/make-server-62a04e71/customers", async (c) => {
  try {
    const customers = await kv.getByPrefix("customers:");
    const sortedCustomers = customers.sort((a, b) => 
      new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime()
    );
    return c.json({ customers: sortedCustomers });
  } catch (error) {
    console.log("Error fetching customers:", error);
    return c.json({ error: `Failed to fetch customers: ${error}` }, 500);
  }
});

// Get customer with order history
app.get("/make-server-62a04e71/customers/:id", async (c) => {
  try {
    const customerId = c.req.param("id");
    const customer = await kv.get(`customers:${customerId}`);
    
    if (!customer) {
      return c.json({ error: "Customer not found" }, 404);
    }

    const allOrders = await kv.getByPrefix("orders:");
    const customerOrders = allOrders
      .filter(o => o.customerId === customerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return c.json({ customer, orders: customerOrders });
  } catch (error) {
    console.log("Error fetching customer details:", error);
    return c.json({ error: `Failed to fetch customer details: ${error}` }, 500);
  }
});

Deno.serve(app.fetch);