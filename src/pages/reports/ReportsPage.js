import { usePos } from "../../state/posStore";

function money(value) {
  return `PHP ${Number(value || 0).toFixed(2)}`;
}

export default function ReportsPage() {
  const { state } = usePos();

  return (
    <div className="page d-flex flex-column gap-3">
      <div className="page-header reports-header d-flex justify-content-between align-items-start flex-wrap gap-2">
        <div>
          <h1 className="mb-1">Audit & Reporting</h1>
          <p className="page-subtitle mb-0">
            Canceled sales, voided items, post-void actions, user activity, and transaction history.
          </p>
        </div>
      </div>

      <div className="card panel reports-transaction-panel border-0 shadow-sm">
        <div className="card-body">
          <h2 className="h5">Transaction History</h2>
          <div className="table-wrap table-responsive">
            <table className="user-table table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>ID</th>
                <th>Date</th>
                <th>Cashier</th>
                <th>Status</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {state.transactions.length === 0 && (
                <tr><td colSpan="5">No transactions yet.</td></tr>
              )}
              {state.transactions.map((tx) => (
                <tr key={tx.id}>
                  <td>{tx.id}</td>
                  <td>{new Date(tx.createdAt).toLocaleString()}</td>
                  <td>{tx.cashierUsername}</td>
                  <td>{tx.status}</td>
                  <td>{money(tx.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      </div>

      <div className="row g-3">
        <section className="col-lg-6">
          <div className="card panel reports-card border-0 shadow-sm h-100">
            <div className="card-body">
              <h2 className="h5">Canceled Transactions</h2>
          <ul className="simple-list log-list">
            {state.canceledSales.length === 0 && <li>No canceled sales logged.</li>}
            {state.canceledSales.map((c) => (
              <li key={c.id}>
                {new Date(c.timestamp).toLocaleString()} | {c.actor} | {c.reason}
              </li>
            ))}
          </ul>
            </div>
          </div>
        </section>

        <section className="col-lg-6">
          <div className="card panel reports-card border-0 shadow-sm h-100">
            <div className="card-body">
              <h2 className="h5">Voided Items</h2>
          <ul className="simple-list log-list">
            {state.voidedItems.length === 0 && <li>No voided items logged.</li>}
            {state.voidedItems.map((v) => (
              <li key={v.id}>
                {new Date(v.timestamp).toLocaleString()} | {v.actor} | {v.item.name} x{v.item.qty} | {v.reason}
              </li>
            ))}
          </ul>
            </div>
          </div>
        </section>
      </div>

      <div className="row g-3">
        <section className="col-lg-6">
          <div className="card panel reports-card border-0 shadow-sm h-100">
            <div className="card-body">
              <h2 className="h5">Post-Void Sales</h2>
          <ul className="simple-list log-list">
            {state.postVoidRequests.length === 0 && <li>No post-void requests logged.</li>}
            {state.postVoidRequests.map((r) => (
              <li key={r.id}>
                {r.transactionId} | {r.status} | requested by {r.requestedBy}
                {r.decidedBy ? ` | decided by ${r.decidedBy}` : ""}
              </li>
            ))}
          </ul>
            </div>
          </div>
        </section>

        <section className="col-lg-6">
          <div className="card panel reports-card border-0 shadow-sm h-100">
            <div className="card-body">
              <h2 className="h5">User Activity Log</h2>
          <ul className="simple-list log-list">
            {state.auditLogs.length === 0 && <li>No activity logs.</li>}
            {state.auditLogs.slice(0, 30).map((log) => (
              <li key={log.id}>
                {new Date(log.timestamp).toLocaleString()} | {log.performedBy} | {log.action} | {log.details}
              </li>
            ))}
          </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
