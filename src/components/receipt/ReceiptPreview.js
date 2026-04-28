import React from "react";

function money(value) {
  return `PHP ${Number(value || 0).toFixed(2)}`;
}

export default function ReceiptPreview({ settings, transaction, modeLabel = "" }) {
  if (!transaction) {
    return (
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white">
          <h2 className="h5 mb-0">Receipt Preview</h2>
        </div>
        <div className="card-body">No transaction selected.</div>
      </div>
    );
  }

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-header bg-white">
        <h2 className="h5 mb-0">Receipt Preview</h2>
      </div>
      <div className="card-body">
        <div className="receipt-paper print-area">
          <div className="receipt-header">
            <div className="store-name">{settings.storeName}</div>
            <div className="store-address">{settings.storeAddress}</div>
            <div className="store-phone">{settings.storePhone}</div>
            <div>Transaction ID: {transaction.id}</div>
            {modeLabel && <div className="receipt-tag">{modeLabel}</div>}
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
              {transaction.items.map((item) => (
                <tr key={`${transaction.id}-${item.productId}`}>
                  <td>{item.name}</td>
                  <td className="right">{item.qty}</td>
                  <td className="right">{money(item.price)}</td>
                  <td className="right">{money(item.qty * item.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="receipt-line" />

          <div className="receipt-totals">
            <div className="row">
              <span>Subtotal</span>
              <span>{money(transaction.subtotal)}</span>
            </div>
            <div className="row">
              <span>Discount ({transaction.discount.label})</span>
              <span>- {money(transaction.discount.amount)}</span>
            </div>
            <div className="row total">
              <span>Total</span>
              <span>{money(transaction.total)}</span>
            </div>
            <div className="row">
              <span>Cash</span>
              <span>{money(transaction.payment.cash)}</span>
            </div>
            <div className="row">
              <span>Change</span>
              <span>{money(transaction.payment.change)}</span>
            </div>
            <div className="row">
              <span>Status</span>
              <span>{transaction.status}</span>
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
