import { Link } from "react-router-dom";
import { usePos } from "../state/posStore";

function toPhp(value) {
  return `PHP ${Number(value || 0).toFixed(2)}`;
}

export default function DashboardPage() {
  const { state, currentUser } = usePos();

  const totalProducts = state.products.length;
  const activeUsers = state.users.filter((u) => u.status === "Active").length;
  const today = new Date().toISOString().slice(0, 10);
  const todaysSales = state.transactions
    .filter((t) => t.createdAt.startsWith(today) && t.status === "Completed")
    .reduce((sum, t) => sum + t.total, 0);
  const pendingPostVoid = state.postVoidRequests.filter((r) => r.status === "Pending").length;

  const cards = [
    { title: "Total Products", value: totalProducts },
    { title: "Active Users", value: activeUsers },
    { title: "Today's Sales", value: toPhp(todaysSales) },
    { title: "Pending Post Void", value: pendingPostVoid },
  ];

  return (
    <div className="page d-flex flex-column gap-3">
      <div className="page-header dashboard-header d-flex justify-content-between align-items-start flex-wrap gap-2">
        <div>
          <h1 className="mb-1">Dashboard</h1>
          <p className="page-subtitle mb-0">Overview of activity and quick actions</p>
        </div>
        <p className="page-meta mb-0">Welcome, {currentUser?.fullName || "User"}</p>
      </div>

      <div className="row g-3 dashboard-stats">
        {cards.map((card) => (
          <div className="col-sm-6 col-xl-3" key={card.title}>
            <div className="card stat-card border-0 shadow-sm h-100">
              <div className="card-body">
                <h3 className="h6 mb-2">{card.title}</h3>
                <p className="mb-0">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-3 dashboard-grid">
        <section className="col-xl-8">
          <div className="card panel dashboard-activity-panel border-0 shadow-sm h-100">
            <div className="card-body">
              <h2 className="h5">Recent Activity</h2>
          <ul className="simple-list log-list">
            {state.auditLogs.slice(0, 8).map((log) => (
              <li key={log.id}>
                [{new Date(log.timestamp).toLocaleString()}] {log.action} - {log.details}
              </li>
            ))}
          </ul>
            </div>
          </div>
        </section>

        <section className="col-xl-4">
          <div className="card panel quick-actions-panel border-0 shadow-sm h-100">
            <div className="card-body">
              <h2 className="h5">Quick Actions</h2>
              <div className="button-group d-grid gap-2">
            {currentUser?.role === "Administrator" && (
              <Link className="btn btn-secondary" to="/products/add">
                Add Product
              </Link>
            )}
            {currentUser?.role === "Administrator" && (
              <Link className="btn btn-secondary" to="/users/add">
                Add User
              </Link>
            )}
            {currentUser?.role === "Cashier" && (
              <Link className="btn btn-secondary" to="/sales/pos">
                Open POS
              </Link>
            )}
            {(currentUser?.role === "Supervisor" || currentUser?.role === "Administrator") && (
              <Link className="btn btn-secondary" to="/reports">
                View Reports
              </Link>
            )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
