export default function ReprintReceiptPage() {
  return (
    <div>

      <div className="page-header">
        <h1>Reprint Receipt</h1>
        <p>Search and reprint past transactions</p>
      </div>

      <div className="panel">

        <input
          type="text"
          placeholder="Enter transaction ID"
          style={{marginBottom:"10px"}}
        />

        <button className="btn">Search</button>

        <div style={{marginTop:"20px"}}>
          <h3>Receipt Preview</h3>

          <p>Transaction #: 1001</p>
          <p>Total: ₱120</p>

          <button className="btn btn-primary">
            Print Receipt
          </button>
        </div>

      </div>

    </div>
  );
}