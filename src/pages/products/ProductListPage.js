import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePos } from "../../state/posStore";

export default function ProductListPage() {
  const navigate = useNavigate();
  const { state, currentUser, runAction } = usePos();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return state.products.filter((p) => {
      const statusOk = statusFilter === "All" || p.status === statusFilter;
      if (!statusOk) return false;
      if (!needle) return true;
      return p.name.toLowerCase().includes(needle) || p.barcode === query.trim();
    });
  }, [state.products, query, statusFilter]);

  const toggleStatus = (product) => {
    const nextStatus = product.status === "Active" ? "Inactive" : "Active";
    const ok = window.confirm(
      `${nextStatus === "Inactive" ? "Deactivate" : "Reactivate"} ${product.name}?`
    );
    if (!ok) return;
    runAction({
      type: "SET_PRODUCT_STATUS",
      payload: { actor: currentUser.username, productId: product.id, status: nextStatus },
    });
  };

  return (
    <div className="page d-flex flex-column gap-3">
      <div className="page-header d-flex justify-content-between align-items-start flex-wrap gap-2">
        <div>
          <h1 className="mb-1">Products</h1>
          <p className="mb-0">Search by product name, barcode, or partial text</p>
        </div>
      </div>

      <div className="card panel border-0 shadow-sm">
        <div className="card-body">
          <div className="panel-header d-flex justify-content-between align-items-start flex-wrap gap-2">
          <div>
              <h2 className="h5 mb-1">Product Catalog</h2>
              <p className="mb-0">Active and inactive products are retained for history.</p>
          </div>
            <button className="btn btn-primary" onClick={() => navigate("/products/add")}>
            Add Product
          </button>
        </div>

          <div className="toolbar-inline row g-2 mb-3">
            <div className="col-12 col-lg-8">
          <input
                className="search-input form-control"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name or exact barcode"
          />
            </div>
            <div className="col-12 col-lg-4">
              <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">All</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
            </div>
        </div>

          <div className="table-wrap table-responsive">
            <table className="user-table table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>Name</th>
                <th>Barcode</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="6">No matching products found.</td>
                </tr>
              )}
              {filtered.map((product) => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>{product.barcode}</td>
                  <td>PHP {Number(product.price).toFixed(2)}</td>
                  <td>{product.stock}</td>
                  <td>{product.status}</td>
                  <td>
                    <button className="btn btn-outline-secondary btn-sm me-2" onClick={() => navigate(`/products/edit/${product.id}`)}>
                      Update
                    </button>
                    <button className="btn btn-outline-secondary btn-sm" onClick={() => toggleStatus(product)}>
                      {product.status === "Active" ? "Deactivate" : "Reactivate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </div>
  );
}
