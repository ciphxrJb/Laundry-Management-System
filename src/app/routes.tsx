import { createBrowserRouter } from "react-router";
import { Dashboard } from "./components/Dashboard";
import { NewOrder } from "./components/NewOrder";
import { OrderManagement } from "./components/OrderManagement";
import { Customers } from "./components/Customers";
import { Receipt } from "./components/Receipt";
import { Layout } from "./components/Layout";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "new-order", Component: NewOrder },
      { path: "orders", Component: OrderManagement },
      { path: "customers", Component: Customers },
      { path: "receipt/:id", Component: Receipt },
    ],
  },
]);
