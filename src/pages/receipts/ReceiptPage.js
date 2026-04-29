import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ReceiptPreview from "../../components/receipt/ReceiptPreview";
import { loadSettings } from "../../state/settings";
import { usePos } from "../../state/posStore";

export default function ReceiptPage() {
  const [searchParams] = useSearchParams();
  const { state, currentUser, runAction, loadTransactions, createPostVoidRequest } = usePos();
  const [message, setMessage] = useState("");
  const settings = loadSettings();

  const transactionId = searchParams.get("transactionId") || state.receipt.lastTransactionId;
  const transaction = useMemo(
    () => state.transactions.find((t) => t.id === transactionId) || null,
    [state.transactions, transactionId]
  );

  useEffect(() => {
    if (!transaction) {
      loadTransactions().catch(() => {});
    }
  }, [transaction, loadTransactions]);

  useEffect(() => {
    if (!transaction) return;
    if (searchParams.get("transactionId")) {
      window.print();
    }
  }, [transaction, searchParams]);

  const print = () => {
    if (!transaction) return;
    runAction({ type: "SET_RECEIPT_VIEW", payload: { transactionId: transaction.id, mode: "ORIGINAL" } });
    window.print();
  };

  const requestPostVoid = async () => {
    if (!transaction) return;
    const reason = window.prompt("Reason for post-void request:", "Customer return issue");
    try {
      await createPostVoidRequest({
        transactionId: transaction.id,
        requestedBy: currentUser.id,
        reason: reason || "",
      });
      setMessage("Post-void request submitted to supervisor.");
    } catch (error) {
      setMessage(error.message || "Unable to create post-void request.");
    }
  };

  return (
    <div className="page receipt-page d-flex flex-column gap-3">
      <div className="page-header d-flex justify-content-between align-items-start flex-wrap gap-2">
        <h1 className="mb-0">Receipt</h1>
        <div className="page-actions d-flex gap-2 flex-wrap">
          <button onClick={print} className="btn btn-primary" disabled={!transaction}>Print Receipt</button>
          {currentUser?.role === "Cashier" && transaction?.status === "Completed" && (
            <button onClick={requestPostVoid} className="btn btn-secondary">Request Post-Void</button>
          )}
        </div>
      </div>

      <ReceiptPreview settings={settings} transaction={transaction} modeLabel={""} />
      {message && <p className="form-message mb-0">{message}</p>}
    </div>
  );
}
