export default function AddProductPage() {
  return (
    <div>
      <div className="page-header">
        <h1>Add Product</h1>
        <p>Create a new product entry</p>
      </div>

      <div className="panel">

        <form className="form-grid">

          <label>
            Product Name
            <input type="text" placeholder="Enter product name"/>
          </label>

          <label>
            Price
            <input type="number" placeholder="Enter price"/>
          </label>

          <label>
            Stock
            <input type="number" placeholder="Enter quantity"/>
          </label>

          <label>
            Status
            <select>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </label>

          <button className="btn btn-primary">Save Product</button>

        </form>

        <p style={{marginTop:"10px", color:"#777"}}>
          Form UI will be implemented by product module owner.
        </p>

      </div>
    </div>
  );
}