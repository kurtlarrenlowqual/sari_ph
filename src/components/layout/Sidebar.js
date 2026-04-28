import { NavLink } from "react-router-dom";
import { usePos } from "../../state/posStore";

const navItems = [
  { to: "/dashboard", label: "Dashboard", roles: ["Cashier", "Supervisor", "Administrator"] },
  { to: "/products", label: "Products", roles: ["Administrator"] },
  { to: "/users", label: "Users", roles: ["Administrator"] },
  { to: "/sales/pos", label: "POS", roles: ["Cashier"] },
  { to: "/receipts/new", label: "Receipt", roles: ["Cashier", "Supervisor"] },
  { to: "/receipts/reprint", label: "Reprint", roles: ["Cashier", "Supervisor"] },
  { to: "/supervisor/post-void", label: "Post Void", roles: ["Supervisor"] },
  { to: "/supervisor/settings", label: "Settings", roles: ["Supervisor"] },
  { to: "/reports", label: "Audit & Reports", roles: ["Supervisor", "Administrator"] },
];

export default function Sidebar({ isOpen, onClose }) {
  const { currentUser } = usePos();

  const visibleItems = navItems.filter((item) =>
    currentUser ? item.roles.includes(currentUser.role) : false
  );

  return (
    <>
      <button
        className={`sidebar-backdrop ${isOpen ? "show" : ""}`}
        onClick={onClose}
        aria-label="Close navigation"
        type="button"
      />
      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-brand">
          <h1 className="mb-1">RetailPOS</h1>
          <p className="mb-0">Case Study UI</p>
        </div>

        <nav className="sidebar-nav nav nav-pills flex-column gap-2">
          {visibleItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? "sidebar-link nav-link active" : "sidebar-link nav-link")}
              onClick={onClose}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
