import { useMemo, useState } from "react";
import ReceiptPreview from "../../components/receipt/ReceiptPreview";
import { loadSettings } from "../../state/settings";
import { usePos } from "../../state/posStore";

export default function ReprintReceiptPage() {
  const { state, currentUser, runAction } = usePos();
  const [searchId, setSearchId] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [selectedTxId, setSelectedTxId] = useState("");
  const [message, setMessage] = useState("");
  const settings = loadSettings();

  const isCashier = currentUser?.role === "Cashier";
  const isSupervisor = currentUser?.role === "Supervisor";

  const transactions = state.transactions;
  const lastTransaction = state.transactions[0] || null;

  const filteredForSupervisor = useMemo(() => {
    return transactions.filter((tx) => {
      const byId = !searchId || tx.id.toLowerCase().includes(searchId.trim().toLowerCase());
      const byDate = !searchDate || tx.createdAt.slice(0, 10) === searchDate;
      return byId && byDate;
    });
  }, [transactions, searchId, searchDate]);

  const selectedTransaction =
    transactions.find((tx) => tx.id === selectedTxId) || (isCashier ? lastTransaction : null);

  const reprint = (transaction, label) => {
    if (!transaction) return;
    runAction({
      type: "SET_RECEIPT_VIEW",
      payload: { transactionId: transaction.id, mode: label },
    });
    runAction({
      type: "LOG_REPRINT",
      payload: {
        actor: currentUser.username,
        transactionId: transaction.id,
        byRole: currentUser.role,
        label,
      },
    });
    window.print();
    setMessage(`Reprint completed: ${label}`);
  };

  return (
    <div className="page d-flex flex-column gap-3">
      <div className="page-header d-flex justify-content-between align-items-start flex-wrap gap-2">
        <div>
          <h1 className="mb-1">Reprint Receipt</h1>
          <p className="mb-0">Reprints do not create duplicate sales records.</p>
        </div>
      </div>

      {isCashier && (
        <div className="card panel border-0 shadow-sm">
          <div className="card-body">
            <h2 className="h5">Cashier Reprint</h2>
            <p>Only the latest completed transaction is available.</p>
          <button
            className="btn btn-primary"
            disabled={!lastTransaction}
            onClick={() => reprint(lastTransaction, "REPRINT")}
          >
            Reprint Last Transaction
          </button>
          {lastTransaction && (
            <div style={{ marginTop: "12px" }}>
              <ReceiptPreview settings={settings} transaction={lastTransaction} modeLabel="REPRINT" />
            </div>
          )}
          </div>
        </div>
      )}

      {isSupervisor && (
        <div className="card panel border-0 shadow-sm">
          <div className="card-body">
            <h2 className="h5">Supervisor Reprint</h2>
            <div className="toolbar-inline row g-2 mb-3">
              <div className="col-12 col-md-8">
                <input
                  className="form-control"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  placeholder="Search transaction ID"
                />
              </div>
              <div className="col-12 col-md-4">
                <input className="form-control" type="date" value={searchDate} onChange={(e) => setSearchDate(e.target.value)} />
              </div>
            </div>

            <div className="table-wrap table-responsive">
              <table className="user-table table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>Transaction ID</th>
                    <th>Date</th>
                    <th>Cashier</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredForSupervisor.length === 0 && (
                    <tr>
                      <td colSpan="5">No transactions found.</td>
                    </tr>
                  )}
                  {filteredForSupervisor.map((tx) => (
                    <tr
                      key={tx.id}
                      className={selectedTxId === tx.id ? "table-selected" : ""}
                      onClick={() => setSelectedTxId(tx.id)}
                    >
                      <td>{tx.id}</td>
                      <td>{new Date(tx.createdAt).toLocaleString()}</td>
                      <td>{tx.cashierUsername}</td>
                      <td>PHP {tx.total.toFixed(2)}</td>
                      <td>{tx.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selectedTransaction && (
              <div style={{ marginTop: "12px" }}>
                <ReceiptPreview
                  settings={settings}
                  transaction={selectedTransaction}
                  modeLabel="Duplicate Copy"
                />
                <button
                  className="btn btn-primary"
                  onClick={() => reprint(selectedTransaction, "Duplicate Copy")}
                >
                  Print Duplicate Copy
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {message && <p className="form-message mb-0">{message}</p>}
    </div>
  );
}
