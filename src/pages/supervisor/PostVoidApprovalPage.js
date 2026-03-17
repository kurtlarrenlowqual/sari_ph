import { useMemo, useState } from "react";
import ReceiptPreview from "../../components/receipt/ReceiptPreview";
import { loadSettings } from "../../state/settings";
import { usePos } from "../../state/posStore";

export default function PostVoidApprovalPage() {
  const { state, currentUser, runAction } = usePos();
  const settings = loadSettings();
  const [selectedRequestId, setSelectedRequestId] = useState("");
  const [decisionReason, setDecisionReason] = useState("");
  const [message, setMessage] = useState("");

  const pendingRequests = state.postVoidRequests.filter((r) => r.status === "Pending");

  const selectedRequest = useMemo(
    () => state.postVoidRequests.find((r) => r.id === selectedRequestId) || null,
    [state.postVoidRequests, selectedRequestId]
  );

  const transaction = selectedRequest
    ? state.transactions.find((t) => t.id === selectedRequest.transactionId) || null
    : null;

  const decide = (decision) => {
    if (!selectedRequest) return;
    const result = runAction({
      type: "DECIDE_POST_VOID",
      payload: {
        actor: currentUser.username,
        requestId: selectedRequest.id,
        decision,
        reason: decisionReason,
      },
    });

    if (!result.ok) {
      setMessage(result.error || "Unable to process decision.");
      return;
    }

    setMessage(`Post-void request ${decision.toLowerCase()}.`);
    setDecisionReason("");
    setSelectedRequestId("");
  };

  return (
    <div className="page d-flex flex-column gap-3">
      <div className="page-header d-flex justify-content-between align-items-start flex-wrap gap-2">
        <div>
          <h1 className="mb-1">Post Void Approvals</h1>
          <p className="mb-0">Supervisor-only approvals/rejections with required reason</p>
        </div>
      </div>

      <div className="row g-3">
        <section className="col-xl-7">
          <div className="card panel border-0 shadow-sm h-100">
            <div className="card-body">
              <h2 className="h5">Pending Requests</h2>
              <div className="table-wrap table-responsive">
                <table className="user-table table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Transaction</th>
                  <th>Requested By</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {pendingRequests.length === 0 && (
                  <tr>
                    <td colSpan="4">No pending post-void requests.</td>
                  </tr>
                )}
                {pendingRequests.map((request) => (
                  <tr
                    key={request.id}
                    className={selectedRequestId === request.id ? "table-selected" : ""}
                    onClick={() => setSelectedRequestId(request.id)}
                  >
                    <td>{request.id}</td>
                    <td>{request.transactionId}</td>
                    <td>{request.requestedBy}</td>
                    <td>{request.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
              </div>
            </div>
          </div>
        </section>

        <section className="col-xl-5">
          <div className="card panel border-0 shadow-sm h-100">
            <div className="card-body">
              <h2 className="h5">Decision Panel</h2>
          {!selectedRequest && <p>Select a pending request to review full transaction details.</p>}
          {selectedRequest && transaction && (
            <>
              <ReceiptPreview settings={settings} transaction={transaction} />
                  <label className="form-label mt-3">
                Decision Reason (required)
                <textarea
                      className="form-control"
                  rows="3"
                  value={decisionReason}
                  onChange={(e) => setDecisionReason(e.target.value)}
                  placeholder="Provide reason for approval or rejection"
                />
              </label>
                  <div className="form-actions d-flex gap-2 flex-wrap">
                <button className="btn btn-primary" onClick={() => decide("Approved")}>Approve</button>
                    <button className="btn btn-secondary" onClick={() => decide("Rejected")}>Reject</button>
              </div>
            </>
          )}
              {message && <p className="form-message mb-0 mt-3">{message}</p>}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
