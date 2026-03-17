import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Sidebar from "./components/layout/Sidebar";

import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";

// groupmates will build these pages later
import ProductListPage from "./pages/products/ProductListPage";
import AddProductPage from "./pages/products/AddProductPage";
import EditProductPage from "./pages/products/EditProductPage";

import UserListPage from "./pages/users/UserListPage";
import AddUserPage from "./pages/users/AddUserPage";

import POSPage from "./pages/sales/POSPage";
import ReceiptPage from "./pages/receipts/ReceiptPage";
import ReprintReceiptPage from "./pages/receipts/ReprintReceiptPage";
import PostVoidApprovalPage from "./pages/supervisor/PostVoidApprovalPage";
import SupervisorSettingsPage from "./pages/supervisor/SupervisorSettingsPage";

function AppLayout() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-area">
        <Navbar />
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// 1. Accept the props here
export default function AppRoutes({ products, onAdd, onUpdate, onDelete }) {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />

      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* 2. Pass the data ONLY to the product pages */}
        <Route path="/products" element={<ProductListPage products={products} onDelete={onDelete} />} />
        <Route path="/products/add" element={<AddProductPage onAdd={onAdd} />} />
        <Route path="/products/edit/:id" element={<EditProductPage products={products} onUpdate={onUpdate} />} />

        <Route path="/users" element={<UserListPage />} />
        <Route path="/users/add" element={<AddUserPage />} />

        <Route path="/sales/pos" element={<POSPage />} />
        <Route path="/receipts/new" element={<ReceiptPage />} />
        <Route path="/receipts/reprint" element={<ReprintReceiptPage />} />
        <Route path="/supervisor/post-void" element={<PostVoidApprovalPage />} />
        <Route path="/supervisor/settings" element={<SupervisorSettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}