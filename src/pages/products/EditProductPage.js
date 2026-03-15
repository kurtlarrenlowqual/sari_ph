export default function EditProductPage() {
  return (
    <div>
      <div className="page-header">
        <h1>Edit Product</h1>
        <p>Update product information</p>
      </div>

      <div className="panel">

        <form className="form-grid">

          <label>
            Product Name
            <input type="text" defaultValue="Notebook"/>
          </label>

          <label>
            Price
            <input type="number" defaultValue="50"/>
          </label>

          <label>
            Stock
            <input type="number" defaultValue="120"/>
          </label>

          <button className="btn btn-primary">Update Product</button>

        </form>

        <p style={{marginTop:"10px", color:"#777"}}>
          Edit product functionality will be implemented later.
        </p>

      </div>
    </div>
  );
}