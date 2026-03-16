import React, { useState } from "react";

export default function CartEditor({ items, onChange }) {
  const [draft, setDraft] = useState({ name: "", qty: 1, price: "" });

  const handleAdd = (e) => {
    e.preventDefault();
    if (!draft.name.trim() || !draft.price) return;
    const priceNumber = parseFloat(draft.price);
    const qtyNumber = parseInt(draft.qty, 10) || 1;
    if (isNaN(priceNumber) || priceNumber < 0) return;

    const nextItems = [
      ...items,
      { id: Date.now().toString(), name: draft.name.trim(), qty: qtyNumber, price: priceNumber },
    ];
    onChange(nextItems);
    setDraft({ name: "", qty: 1, price: "" });
  };

  const handleItemChange = (id, field, value) => {
    const nextItems = items.map((item) => {
      if (item.id !== id) return item;
      if (field === "name") {
        return { ...item, name: value };
      }
      if (field === "qty") {
        const qtyNumber = parseInt(value, 10) || 1;
        return { ...item, qty: qtyNumber };
      }
      if (field === "price") {
        const priceNumber = parseFloat(value) || 0;
        return { ...item, price: priceNumber };
      }
      return item;
    });
    onChange(nextItems);
  };

  const handleRemove = (id) => {
    onChange(items.filter((item) => item.id !== id));
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2>Cart Items</h2>
      </div>
      <div className="card-body">
        <form className="cart-form" onSubmit={handleAdd}>
          <input
            type="text"
            placeholder="Item name"
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          />
          <input
            type="number"
            min="1"
            placeholder="Qty"
            value={draft.qty}
            onChange={(e) => setDraft({ ...draft, qty: e.target.value })}
          />
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="Price"
            value={draft.price}
            onChange={(e) => setDraft({ ...draft, price: e.target.value })}
          />
          <button type="submit">Add</button>
        </form>

        <table className="cart-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan="5" className="empty-row">
                  No items yet.
                </td>
              </tr>
            )}
            {items.map((item) => (
              <tr key={item.id}>
                <td>
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => handleItemChange(item.id, "name", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="1"
                    value={item.qty}
                    onChange={(e) => handleItemChange(item.id, "qty", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.price}
                    onChange={(e) => handleItemChange(item.id, "price", e.target.value)}
                  />
                </td>
                <td>₱{(item.qty * item.price).toFixed(2)}</td>
                <td>
                  <button type="button" onClick={() => handleRemove(item.id)}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

