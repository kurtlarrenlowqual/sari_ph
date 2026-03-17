import { useEffect, useState } from "react";
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Sidebar from "./components/layout/Sidebar";
import { GuestOnlyRoute, ProtectedRoute } from "./components/auth/RouteGuards";

import LoginPage from "./pages/LoginPage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import DashboardPage from "./pages/DashboardPage";

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
import ReportsPage from "./pages/reports/ReportsPage";

function AppLayout() {
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="app-shell">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-area">
        <Navbar onMenuToggle={() => setSidebarOpen((prev) => !prev)} />
        <main className="page-content container-fluid">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route element={<GuestOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      <Route path="/change-password" element={<ChangePasswordPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/reports" element={<ReportsPage />} />

          <Route element={<ProtectedRoute allowedRoles={["Administrator"]} />}>
            <Route path="/products" element={<ProductListPage />} />
            <Route path="/products/add" element={<AddProductPage />} />
            <Route path="/products/edit/:id" element={<EditProductPage />} />

            <Route path="/users" element={<UserListPage />} />
            <Route path="/users/add" element={<AddUserPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["Cashier"]} />}>
            <Route path="/sales/pos" element={<POSPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["Cashier", "Supervisor"]} />}>
            <Route path="/receipts/new" element={<ReceiptPage />} />
            <Route path="/receipts/reprint" element={<ReprintReceiptPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["Supervisor"]} />}>
            <Route path="/supervisor/post-void" element={<PostVoidApprovalPage />} />
            <Route path="/supervisor/settings" element={<SupervisorSettingsPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
