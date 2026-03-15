export default function PostVoidApprovalPage() {
  return (
    <div>

      <div className="page-header">
        <h1>Post Void Approvals</h1>
        <p>Supervisor approval for voided items</p>
      </div>

      <div className="panel">

        <table style={{width:"100%"}}>
          <thead>
            <tr style={{background:"#eee"}}>
              <th>Transaction</th>
              <th>Item</th>
              <th>Requested By</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>#1003</td>
              <td>Notebook</td>
              <td>Cashier 01</td>
              <td>
                <button className="btn">Approve</button>
                <button className="btn">Reject</button>
              </td>
            </tr>
          </tbody>
        </table>

        <p style={{marginTop:"10px", color:"#777"}}>
          Approval logic will be implemented in backend phase.
        </p>

      </div>

    </div>
  );
}