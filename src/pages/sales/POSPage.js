import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePos } from "../../state/posStore";

function toPhp(amount) {
  return `PHP ${Number(amount || 0).toFixed(2)}`;
}

const discountChoices = [
  { value: "SENIOR_CITIZEN", label: "Senior Citizen" },
  { value: "PWD", label: "PWD" },
  { value: "ATHLETE", label: "Athlete" },
  { value: "SOLO_PARENT", label: "Solo Parent" },
];

export default function POSPage() {
  const navigate = useNavigate();
  const { state, currentUser, discountRules, runAction } = usePos();

  const [query, setQuery] = useState("");
  const [barcodeInput, setBarcodeInput] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [selectedCartId, setSelectedCartId] = useState("");
  const [discountType, setDiscountType] = useState("NONE");
  const [stagedDiscount, setStagedDiscount] = useState("SENIOR_CITIZEN");
  const [cashInput, setCashInput] = useState("");
  const [message, setMessage] = useState("Ready for checkout.");

  const activeProducts = state.products.filter((p) => p.status === "Active");

  const filteredProducts = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return activeProducts.filter((p) => {
      if (!needle) return true;
      return p.name.toLowerCase().includes(needle) || p.barcode.includes(needle);
    });
  }, [activeProducts, query]);

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.qty, 0),
    [cartItems]
  );
  const discountAmount = Number((subtotal * (discountRules[discountType]?.rate || 0)).toFixed(2));
  const total = Number(Math.max(subtotal - discountAmount, 0).toFixed(2));
  const cash = Number(cashInput || 0);
  const change = Number((cash - total).toFixed(2));

  const addProduct = (product) => {
    if (product.stock <= 0) {
      setMessage("Product is out of stock.");
      return;
    }
    const currentQty = cartItems.find((c) => c.productId === product.id)?.qty || 0;
    if (currentQty + 1 > product.stock) {
      setMessage("Cannot exceed available stock.");
      return;
    }

    setCartItems((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [
        ...prev,
        {
          lineId: `${product.id}-${Date.now()}`,
          productId: product.id,
          barcode: product.barcode,
          name: product.name,
          price: product.price,
          qty: 1,
        },
      ];
    });
    setMessage(`${product.name} added to cart.`);
  };

  const scanBarcode = () => {
    const code = barcodeInput.trim();
    if (!code) return;
    const product = activeProducts.find((p) => p.barcode === code);
    if (!product) {
      setMessage("No active product found with that barcode.");
      return;
    }
    addProduct(product);
    setBarcodeInput("");
  };

  const updateQty = (lineId, delta) => {
    setCartItems((prev) =>
      prev
        .map((line) => {
          if (line.lineId !== lineId) return line;
          const product = state.products.find((p) => p.id === line.productId);
          const maxStock = product?.stock ?? 0;
          const nextQty = line.qty + delta;
          if (nextQty <= 0) return { ...line, qty: 0 };
          if (nextQty > maxStock) return line;
          return { ...line, qty: nextQty };
        })
        .filter((line) => line.qty > 0)
    );
  };

  const applyDiscount = () => {
    if (discountType !== "NONE") {
      setMessage("Only one discount can be applied per sale.");
      return;
    }
    setDiscountType(stagedDiscount);
    setMessage(`${discountRules[stagedDiscount].label} discount applied.`);
  };

  const voidSelectedItem = () => {
    if (!selectedCartId) {
      setMessage("Select an item from cart first.");
      return;
    }
    const item = cartItems.find((c) => c.lineId === selectedCartId);
    if (!item) return;
    const reason = window.prompt("Reason for voiding this item:", "Wrong scan") || "Wrong scan";
    runAction({
      type: "VOID_ITEM_LOG",
      payload: {
        actor: currentUser.username,
        item,
        reason,
      },
    });
    setCartItems((prev) => prev.filter((c) => c.lineId !== selectedCartId));
    setSelectedCartId("");
    setMessage(`Voided ${item.name}.`);
  };

  const cancelSale = () => {
    if (cartItems.length === 0) {
      setMessage("There is no ongoing sale to cancel.");
      return;
    }
    const reason = window.prompt("Reason for canceling this sale:", "Customer canceled order") || "Customer canceled order";
    runAction({
      type: "CANCEL_SALE",
      payload: {
        actor: currentUser.username,
        cartItems,
        reason,
      },
    });
    setCartItems([]);
    setSelectedCartId("");
    setDiscountType("NONE");
    setCashInput("");
    setMessage("Sale canceled. No receipt generated.");
  };

  const completeSale = () => {
    const result = runAction({
      type: "COMPLETE_SALE",
      payload: {
        actor: currentUser.username,
        cartItems,
        payment: { cash },
        discountType,
      },
    });

    if (!result.ok) {
      setMessage(result.error || "Unable to complete sale.");
      return;
    }

    setCartItems([]);
    setSelectedCartId("");
    setDiscountType("NONE");
    setCashInput("");
    setMessage(`Sale completed. Change: ${toPhp(result.transaction.payment.change)}`);
    navigate(`/receipts/new?transactionId=${result.transaction.id}`);
  };

  return (
    <div className="pos-page d-flex flex-column gap-3">
      <div className="page-header pos-header d-flex justify-content-between align-items-start flex-wrap gap-3">
        <div>
          <h1 className="mb-1">Point of Sale</h1>
          <p className="mb-0">Scan/select products and complete payment</p>
        </div>
        <div className="pos-session-card">
          <p><strong>Cashier:</strong> {currentUser.fullName}</p>
          <p><strong>Role:</strong> {currentUser.role}</p>
          <p><strong>Items in Cart:</strong> {cartItems.length}</p>
        </div>
      </div>

      <div className="pos-layout row g-3">
        <section className="col-xl-8">
          <div className="card panel pos-products-panel border-0 shadow-sm h-100">
            <div className="card-body">
          <div className="pos-toolbar">
            <input
              type="text"
              className="pos-search form-control"
              placeholder="Search by product name or barcode"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <br></br>
          <div className="scan-bar">
            <input
              className="form-control"
              type="text"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              placeholder="Scan/enter exact barcode"
            />
            <button className="btn btn-secondary" onClick={scanBarcode}>Scan</button>
          </div>

          <div className="pos-product-grid">
            {filteredProducts.map((product) => (
              <article className="pos-product-card" key={product.id}>
                <p className="pos-sku">{product.barcode}</p>
                <h3>{product.name}</h3>
                <p className="pos-stock">Stock: {product.stock}</p>
                <div className="pos-product-footer">
                  <span>{toPhp(product.price)}</span>
                  <button className="btn btn-primary btn-sm" onClick={() => addProduct(product)}>
                    Add
                  </button>
                </div>
              </article>
            ))}
            {filteredProducts.length === 0 && (
              <p className="pos-note">No active products found.</p>
            )}
          </div>
            </div>
          </div>
        </section>

        <aside className="col-xl-4">
          <div className="card panel pos-cart-panel border-0 shadow-sm h-100">
            <div className="card-body">
          <div className="pos-cart-head">
            <h2 className="h5 mb-0">Current Cart</h2>
            <button className="btn btn-secondary btn-sm" onClick={cancelSale}>Cancel Sale</button>
          </div>

          <div className="pos-cart-list">
            {cartItems.map((item) => (
              <div
                key={item.lineId}
                className={`pos-cart-row ${selectedCartId === item.lineId ? "selected" : ""}`}
                onClick={() => setSelectedCartId(item.lineId)}
              >
                <div>
                  <p className="pos-cart-name">{item.name}</p>
                  <p className="pos-cart-sku">{item.barcode}</p>
                </div>
                <div className="pos-cart-controls">
                  <button className="btn btn-outline-secondary btn-sm" onClick={(e) => { e.stopPropagation(); updateQty(item.lineId, -1); }}>-</button>
                  <span>{item.qty}</span>
                  <button className="btn btn-outline-secondary btn-sm" onClick={(e) => { e.stopPropagation(); updateQty(item.lineId, 1); }}>+</button>
                </div>
                <div className="pos-cart-price">{toPhp(item.qty * item.price)}</div>
              </div>
            ))}
            {cartItems.length === 0 && <p className="pos-note">Cart is empty.</p>}
          </div>

          <div className="pos-summary">
            <div><span>Subtotal</span><strong>{toPhp(subtotal)}</strong></div>
            <div><span>Discount</span><strong>- {toPhp(discountAmount)}</strong></div>
            <div className="pos-total-row"><span>Total Due</span><strong>{toPhp(total)}</strong></div>
            <div>
              <span>Cash Tendered</span>
              <input
                className="pos-cash-input form-control"
                type="number"
                min="0"
                step="0.01"
                value={cashInput}
                onChange={(e) => setCashInput(e.target.value)}
              />
            </div>
            <div><span>Change</span><strong className={change < 0 ? "pos-negative" : ""}>{toPhp(change)}</strong></div>
          </div>

          <div className="discount-box">
            <label className="form-label mb-0">
              Discount Type
              <select className="form-select" value={stagedDiscount} onChange={(e) => setStagedDiscount(e.target.value)} disabled={discountType !== "NONE"}>
                {discountChoices.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </label>
            <button className="btn btn-secondary" onClick={applyDiscount} disabled={discountType !== "NONE" || cartItems.length === 0}>
              Apply Discount
            </button>
            {discountType !== "NONE" && (
              <p className="pos-note">Applied: {discountRules[discountType].label} ({discountRules[discountType].rate * 100}%)</p>
            )}
          </div>

          <div className="pos-actions">
            <button className="btn btn-secondary" onClick={voidSelectedItem}>Void Item</button>
            <button className="btn btn-primary" onClick={completeSale}>Complete Sale</button>
          </div>
          <p className="pos-note">{message}</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
