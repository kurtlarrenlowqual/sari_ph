import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { usePos } from "../../state/posStore";

export default function EditProductPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { state, runAction, currentUser } = usePos();
  const product = state.products.find((p) => p.id === id);
  const [form, setForm] = useState({ name: "", barcode: "", price: "", stock: "" });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!product) return;
    setForm({
      name: product.name,
      barcode: product.barcode,
      price: String(product.price),
      stock: String(product.stock),
    });
  }, [product]);

  if (!product) return <div className="card border-0 shadow-sm"><div className="card-body">Product not found.</div></div>;

  const submit = (e) => {
    e.preventDefault();
    const result = runAction({
      type: "UPDATE_PRODUCT",
      payload: {
        actor: currentUser.username,
        productId: product.id,
        updates: {
          name: form.name,
          price: form.price,
          stock: form.stock,
        },
      },
    });

    if (!result.ok) {
      setErrors(result.errors || {});
      setMessage(result.error || "Please fix validation errors.");
      return;
    }

    setErrors({});
    setMessage("Product updated successfully.");
  };

  return (
    <div className="page d-flex flex-column gap-3">
      <div className="page-header d-flex justify-content-between align-items-start flex-wrap gap-2">
        <div>
          <h1 className="mb-1">Update Product</h1>
          <p className="mb-0">Barcode is locked and cannot be changed.</p>
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
            Barcode (Read-only)
              <input className="form-control" value={form.barcode} readOnly />
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
            Stock Quantity
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
              <button type="button" className="btn btn-secondary" onClick={() => navigate("/products")}>Back</button>
              <button className="btn btn-primary" type="submit">Update Product</button>
            </div>
          </form>
          {message && <p className="form-message mb-0 mt-3">{message}</p>}
          </div>
      </div>
    </div>
  );
}
