import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/products", label: "Products" },
  { to: "/users", label: "Users" },
  { to: "/sales/pos", label: "POS" },
  { to: "/receipts/new", label: "New Receipt" },
  { to: "/receipts/reprint", label: "Reprint" },
  { to: "/supervisor/post-void", label: "Post Void" },
  { to: "/supervisor/settings", label: "Supervisor Settings" },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h1>RetailPOS</h1>
        <p>Case Study UI</p>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              isActive ? "sidebar-link active" : "sidebar-link"
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}