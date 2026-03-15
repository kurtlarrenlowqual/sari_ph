export default function POSPage() {
  return (
    <div>

      <div className="page-header">
        <h1>Point of Sale</h1>
        <p>Process customer purchases</p>
      </div>

      <div className="content-grid">

        <div className="panel">
          <h2>Product List</h2>

          <input placeholder="Search product..." style={{marginBottom:"10px"}}/>

          <ul>
            <li>Notebook - ₱50</li>
            <li>Ballpen - ₱10</li>
            <li>Pencil - ₱8</li>
          </ul>

        </div>

        <div className="panel">

          <h2>Cart</h2>

          <p>No items added yet.</p>

          <hr/>

          <p>Total: ₱0</p>

          <button className="btn btn-primary">
            Complete Sale
          </button>

        </div>

      </div>

      <p style={{marginTop:"15px", color:"#777"}}>
        POS functionality will be implemented in the next phase.
      </p>

    </div>
  );
}