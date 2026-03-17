import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ProductListPage({ products = [], onDelete }) {
  const navigate = useNavigate();

  const styles = {
    wrapper: { fontFamily: "'Inter', system-ui, sans-serif", color: "#111827", padding: "2rem", maxWidth: "1000px", margin: "0 auto" },
    header: { marginBottom: "2rem" },
    h1: { fontSize: "1.875rem", fontWeight: "700", margin: "0 0 0.25rem 0" },
    subtitle: { color: "#6b7280", margin: "0", fontSize: "1rem" },
    panel: { background: "#ffffff", borderRadius: "0.75rem", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)", padding: "2rem", border: "1px solid #f3f4f6" },
    headerActions: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" },
    h2: { margin: "0", fontSize: "1.25rem", color: "#111827" },
    button: { padding: "0.625rem 1.25rem", backgroundColor: "#4f46e5", color: "white", border: "none", borderRadius: "0.5rem", fontSize: "0.875rem", fontWeight: "600", cursor: "pointer" },
    tableContainer: { overflowX: "auto", borderRadius: "0.5rem", border: "1px solid #e5e7eb" },
    table: { width: "100%", borderCollapse: "collapse", textAlign: "left" },
    th: { padding: "1rem 1.5rem", backgroundColor: "#f9fafb", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: "600", color: "#6b7280", borderBottom: "1px solid #e5e7eb" },
    td: { padding: "1rem 1.5rem", fontSize: "0.875rem", color: "#111827", borderBottom: "1px solid #e5e7eb" },
    statusBadgeActive: { padding: "0.25rem 0.75rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: "600", backgroundColor: "#d1fae5", color: "#065f46" },
    statusBadgeInactive: { padding: "0.25rem 0.75rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: "600", backgroundColor: "#fee2e2", color: "#991b1b" },
    actionBtn: { marginRight: "10px", padding: "0.4rem 0.8rem", cursor: "pointer", border: "1px solid #d1d5db", borderRadius: "0.375rem", background: "white", fontSize: "0.75rem" },
    deleteBtn: { padding: "0.4rem 0.8rem", cursor: "pointer", border: "1px solid #fca5a5", borderRadius: "0.375rem", background: "#fef2f2", color: "#dc2626", fontSize: "0.75rem" },
    emptyState: { textAlign: "center", padding: "2rem", color: "#6b7280" }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <h1 style={styles.h1}>Products</h1>
        <p style={styles.subtitle}>Manage product inventory and pricing</p>
      </div>

      <div style={styles.panel}>
        <div style={styles.headerActions}>
          <h2 style={styles.h2}>Product List</h2>
          {/* Navigate to the add URL */}
          <button style={styles.button} onClick={() => navigate('/products/add')}>+ Add Product</button>
        </div>

        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Price</th>
                <th style={styles.th}>Stock</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr><td colSpan="6" style={styles.emptyState}>No products found.</td></tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id}>
                    <td style={styles.td}>#{product.id}</td>
                    <td style={styles.td}><strong>{product.name}</strong></td>
                    <td style={styles.td}>₱{Number(product.price).toFixed(2)}</td>
                    <td style={styles.td}>{product.stock}</td>
                    <td style={styles.td}>
                      <span style={product.status === "Active" ? styles.statusBadgeActive : styles.statusBadgeInactive}>
                        {product.status}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {/* Navigate to the edit URL with the specific product ID */}
                      <button style={styles.actionBtn} onClick={() => navigate(`/products/edit/${product.id}`)}>Edit</button>
                      <button style={styles.deleteBtn} onClick={() => onDelete(product.id)}>Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}