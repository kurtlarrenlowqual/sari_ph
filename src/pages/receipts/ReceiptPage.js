import React, { useEffect, useState } from "react";
import CartEditor from "../../components/receipt/CartEditor";
import ReceiptPreview from "../../components/receipt/ReceiptPreview";
import { loadSettings } from "../../state/settings";

export default function ReceiptPage() {
  const [items, setItems] = useState([]);
  const [settings, setSettings] = useState(loadSettings);

  useEffect(() => {
    const handleStorage = () => {
      setSettings(loadSettings());
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="page receipt-page">
      <div className="page-header">
        <h1>Receipt</h1>
        <div className="page-actions">
          <button onClick={handlePrint}>Print Receipt</button>
        </div>
      </div>

      <div className="receipt-layout">
        <div className="receipt-left">
          <CartEditor items={items} onChange={setItems} />
        </div>
        <div className="receipt-right">
          <ReceiptPreview settings={settings} items={items} />
        </div>
      </div>
    </div>
  );
}

