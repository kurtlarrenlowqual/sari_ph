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
import ReprintReceiptPage from "./pages/receipts/ReprintReceiptPage";
import PostVoidApprovalPage from "./pages/supervisor/PostVoidApprovalPage";

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

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />

      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />

        <Route path="/products" element={<ProductListPage />} />
        <Route path="/products/add" element={<AddProductPage />} />
        <Route path="/products/edit/:id" element={<EditProductPage />} />

        <Route path="/users" element={<UserListPage />} />
        <Route path="/users/add" element={<AddUserPage />} />

        <Route path="/sales/pos" element={<POSPage />} />
        <Route path="/receipts/reprint" element={<ReprintReceiptPage />} />
        <Route path="/supervisor/post-void" element={<PostVoidApprovalPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}