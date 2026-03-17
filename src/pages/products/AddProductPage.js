import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePos } from "../../state/posStore";

export default function AddProductPage() {
  const navigate = useNavigate();
  const { currentUser, runAction } = usePos();
  const [form, setForm] = useState({ name: "", barcode: "", price: "", stock: "" });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  const submit = (e) => {
    e.preventDefault();
    const result = runAction({
      type: "CREATE_PRODUCT",
      payload: {
        actor: currentUser.username,
        product: {
          name: form.name,
          barcode: form.barcode,
          price: form.price,
          stock: form.stock,
        },
      },
    });

    if (!result.ok) {
      setErrors(result.errors || {});
      setMessage("Please fix validation errors.");
      return;
    }

    setErrors({});
    setMessage("Product created successfully and set to Active.");
    setTimeout(() => navigate("/products"), 400);
  };

  return (
    <div className="page d-flex flex-column gap-3">
      <div className="page-header d-flex justify-content-between align-items-start flex-wrap gap-2">
        <div>
          <h1 className="mb-1">Add Product</h1>
          <p className="mb-0">Required: name, barcode, price, stock</p>
        </div>
      </div>

      <div className="card panel add-user-panel border-0 shadow-sm">
        <div className="card-body">
          <form className="form-grid row g-3" onSubmit={submit}>
            <label className="form-label col-12 mb-0">
            Product Name
              <input className="form-control" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
            {errors.name && <span className="form-error">{errors.name}</span>}
          </label>

            <label className="form-label col-12 mb-0">
            Barcode
              <input className="form-control" value={form.barcode} onChange={(e) => setForm((p) => ({ ...p, barcode: e.target.value }))} />
            {errors.barcode && <span className="form-error">{errors.barcode}</span>}
          </label>

            <label className="form-label col-12 col-md-6 mb-0">
            Unit Price
            <input
                className="form-control"
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
            />
            {errors.price && <span className="form-error">{errors.price}</span>}
          </label>

            <label className="form-label col-12 col-md-6 mb-0">
            Initial Stock
            <input
                className="form-control"
              type="number"
              step="1"
              min="0"
              value={form.stock}
              onChange={(e) => setForm((p) => ({ ...p, stock: e.target.value }))}
            />
            {errors.stock && <span className="form-error">{errors.stock}</span>}
          </label>

            <div className="form-actions col-12 d-flex justify-content-end gap-2 flex-wrap">
              <button type="button" className="btn btn-secondary" onClick={() => navigate("/products")}>Cancel</button>
              <button className="btn btn-primary" type="submit">Save Product</button>
            </div>
          </form>

          {message && <p className="form-message mb-0 mt-3">{message}</p>}
          </div>
        </div>
    </div>
  );
}
