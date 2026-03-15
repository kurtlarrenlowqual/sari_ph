const cards = [
  { title: "Total Products", value: 128 },
  { title: "Active Users", value: 14 },
  { title: "Today's Sales", value: "₱12,450" },
  { title: "Pending Post Void", value: 3 },
];

export default function DashboardPage() {
  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Overview</p>
      </div>

      <div className="stats-grid">
        {cards.map((card) => (
          <div className="stat-card" key={card.title}>
            <h3>{card.title}</h3>
            <p>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="content-grid">
        <section className="panel">
          <h2>Recent Activity</h2>
          <ul className="simple-list">
            <li>Cashier 01 completed transaction #1001</li>
            <li>Admin added new product: Notebook</li>
            <li>Supervisor approved 1 post-void request</li>
          </ul>
        </section>

        <section className="panel">
          <h2>Quick Actions</h2>
          <div className="button-group">
            <button className="btn">Add Product</button>
            <button className="btn">Add User</button>
            <button className="btn">Open POS</button>
          </div>
        </section>
      </div>
    </div>
  );
}