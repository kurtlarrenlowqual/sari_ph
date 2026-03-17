import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AddProductPage({ onAdd }) {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [status, setStatus] = useState('Active');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !price || !stock) return alert("Please fill all fields");
    
    onAdd({ name, price: Number(price), stock: Number(stock), status });
    navigate('/products'); // Go back to product list after saving
  };

  const styles = {
    wrapper: { fontFamily: "'Inter', system-ui, sans-serif", color: "#111827", padding: "2rem", maxWidth: "800px", margin: "0 auto" },
    header: { marginBottom: "2rem" },
    h1: { fontSize: "1.875rem", fontWeight: "700", margin: "0 0 0.25rem 0" },
    subtitle: { color: "#6b7280", margin: "0", fontSize: "1rem" },
    panel: { background: "#ffffff", borderRadius: "0.75rem", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)", padding: "2rem", border: "1px solid #f3f4f6" },
    formGrid: { display: "flex", flexDirection: "column", gap: "1.5rem" },
    inputGroup: { display: "flex", flexDirection: "column", gap: "0.5rem" },
    label: { fontSize: "0.875rem", fontWeight: "600", color: "#374151" },
    input: { padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: "0.5rem", fontSize: "0.875rem", backgroundColor: "#f9fafb", width: "100%", boxSizing: "border-box" },
    buttonGroup: { display: "flex", gap: "1rem", marginTop: "1rem" },
    buttonPrimary: { padding: "0.75rem 1.5rem", backgroundColor: "#4f46e5", color: "white", border: "none", borderRadius: "0.5rem", fontWeight: "600", cursor: "pointer" },
    buttonSecondary: { padding: "0.75rem 1.5rem", backgroundColor: "#ffffff", color: "#374151", border: "1px solid #d1d5db", borderRadius: "0.5rem", fontWeight: "600", cursor: "pointer" }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <h1 style={styles.h1}>Add Product</h1>
        <p style={styles.subtitle}>Create a new product entry in the catalog</p>
      </div>

      <div style={styles.panel}>
        <form style={styles.formGrid} onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Product Name</label>
            <input style={styles.input} type="text" value={name} onChange={e => setName(e.target.value)} />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Price (₱)</label>
            <input style={styles.input} type="number" value={price} onChange={e => setPrice(e.target.value)} />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Stock Quantity</label>
            <input style={styles.input} type="number" value={stock} onChange={e => setStock(e.target.value)} />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Status</label>
            <select style={styles.input} value={status} onChange={e => setStatus(e.target.value)}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div style={styles.buttonGroup}>
            <button style={styles.buttonPrimary} type="submit">Save Product</button>
            <button style={styles.buttonSecondary} type="button" onClick={() => navigate('/products')}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
