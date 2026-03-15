export default function ProductListPage() {
  return (
    <div>
      <div className="page-header">
        <h1>Products</h1>
        <p>Manage product inventory and pricing</p>
      </div>

      <div className="panel">
        <h2>Product List</h2>

        <div style={{marginBottom: "15px"}}>
          <button className="btn btn-primary">Add Product</button>
        </div>

        <table style={{width: "100%", borderCollapse: "collapse"}}>
          <thead>
            <tr style={{background:"#eee"}}>
              <th style={{padding:"10px"}}>ID</th>
              <th>Name</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>1</td>
              <td>Notebook</td>
              <td>₱50</td>
              <td>120</td>
              <td>Active</td>
            </tr>

            <tr>
              <td>2</td>
              <td>Ballpen</td>
              <td>₱10</td>
              <td>300</td>
              <td>Active</td>
            </tr>
          </tbody>
        </table>

        <p style={{marginTop:"10px", color:"#777"}}>
          Product UI to be completed by assigned group member.
        </p>
      </div>
    </div>
  );
}