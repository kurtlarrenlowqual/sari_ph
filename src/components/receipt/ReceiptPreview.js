import React from "react";

export default function ReceiptPreview({ settings, items }) {
  const subtotal = items.reduce((sum, item) => sum + item.qty * item.price, 0);
  const taxAmount = (subtotal * (settings.taxRate || 0)) / 100;
  const total = subtotal + taxAmount;

  return (
    <div className="card">
      <div className="card-header">
        <h2>Receipt Preview</h2>
      </div>
      <div className="card-body">
        <div className="receipt-paper print-area">
          <div className="receipt-header">
            <div className="store-name">{settings.storeName}</div>
            <div className="store-address">{settings.storeAddress}</div>
            <div className="store-phone">{settings.storePhone}</div>
          </div>

          {settings.headerNote && <div className="receipt-note">{settings.headerNote}</div>}

          <div className="receipt-line" />

          <table className="receipt-items">
            <thead>
              <tr>
                <th>Item</th>
                <th className="right">Qty</th>
                <th className="right">Price</th>
                <th className="right">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr>
                  <td colSpan="4" className="empty-row">
                    No items.
                  </td>
                </tr>
              )}
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td className="right">{item.qty}</td>
                  <td className="right">₱{item.price.toFixed(2)}</td>
                  <td className="right">₱{(item.qty * item.price).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="receipt-line" />

          <div className="receipt-totals">
            <div className="row">
              <span>Subtotal</span>
              <span>₱{subtotal.toFixed(2)}</span>
            </div>
            <div className="row">
              <span>Tax ({settings.taxRate || 0}%)</span>
              <span>₱{taxAmount.toFixed(2)}</span>
            </div>
            <div className="row total">
              <span>Total</span>
              <span>₱{total.toFixed(2)}</span>
            </div>
          </div>

          {settings.footerNote && (
            <>
              <div className="receipt-line" />
              <div className="receipt-footer-text">{settings.footerNote}</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

