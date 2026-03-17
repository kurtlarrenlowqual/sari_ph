import { useMemo, useState } from "react";

const categories = ["All", "School Supplies", "Snacks", "Beverages", "Household"];

const products = [
  { sku: "P-1001", name: "Notebook - 80 Leaves", price: 55, stock: 120, category: "School Supplies" },
  { sku: "P-1002", name: "Ballpen - Blue", price: 12, stock: 340, category: "School Supplies" },
  { sku: "P-1003", name: "Pencil No. 2", price: 9, stock: 220, category: "School Supplies" },
  { sku: "P-1004", name: "Bottled Water 500ml", price: 20, stock: 80, category: "Beverages" },
  { sku: "P-1005", name: "Instant Noodles", price: 22, stock: 95, category: "Snacks" },
  { sku: "P-1006", name: "Laundry Bar Soap", price: 34, stock: 70, category: "Household" },
];

const initialCartItems = [
  { sku: "P-1001", name: "Notebook - 80 Leaves", price: 55, qty: 2 },
  { sku: "P-1002", name: "Ballpen - Blue", price: 12, qty: 3 },
  { sku: "P-1004", name: "Bottled Water 500ml", price: 20, qty: 1 },
];

const customerNames = ["Walk-in Customer", "Jane Santos", "Mark Dela Cruz", "Ana Reyes"];
const discountLevels = [0, 10, 20, 50];

function toPHP(amount) {
  return `PHP ${amount.toFixed(2)}`;
}

function getNextTransaction(seed = 21) {
  return `TXN-2026-0315-${String(seed).padStart(3, "0")}`;
}

export default function POSPage() {
  const [cartItems, setCartItems] = useState(initialCartItems);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSku, setSelectedSku] = useState(initialCartItems[0]?.sku || "");
  const [discount, setDiscount] = useState(10);
  const [cashInput, setCashInput] = useState("300");
  const [customerIndex, setCustomerIndex] = useState(0);
  const [heldSales, setHeldSales] = useState([]);
  const [transactionSeed, setTransactionSeed] = useState(21);
  const [message, setMessage] = useState("Ready for checkout.");

  const filteredProducts = useMemo(() => {
    const needle = searchQuery.trim().toLowerCase();
    return products.filter((product) => {
      const categoryOk = activeCategory === "All" || product.category === activeCategory;
      const searchOk =
        needle.length === 0 ||
        product.name.toLowerCase().includes(needle) ||
        product.sku.toLowerCase().includes(needle);
      return categoryOk && searchOk;
    });
  }, [activeCategory, searchQuery]);

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.qty, 0),
    [cartItems]
  );
  const tax = subtotal * 0.12;
  const total = Math.max(subtotal + tax - discount, 0);
  const cashTendered = Number.parseFloat(cashInput) || 0;
  const change = cashTendered - total;

  const incrementQty = (sku) => {
    setCartItems((prev) =>
      prev.map((item) => (item.sku === sku ? { ...item, qty: item.qty + 1 } : item))
    );
  };

  const decrementQty = (sku) => {
    setCartItems((prev) =>
      prev
        .map((item) => (item.sku === sku ? { ...item, qty: Math.max(item.qty - 1, 0) } : item))
        .filter((item) => item.qty > 0)
    );
    if (selectedSku === sku) {
      setSelectedSku("");
    }
  };

  const addToCart = (product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.sku === product.sku);
      if (existing) {
        return prev.map((item) =>
          item.sku === product.sku ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { sku: product.sku, name: product.name, price: product.price, qty: 1 }];
    });
    setSelectedSku(product.sku);
    setMessage(`${product.name} added to cart.`);
  };

  const applyDiscount = () => {
    const currentIndex = discountLevels.indexOf(discount);
    const next = discountLevels[(currentIndex + 1) % discountLevels.length];
    setDiscount(next);
    setMessage(next === 0 ? "Discount removed." : `Discount set to ${toPHP(next)}.`);
  };

  const voidSelectedItem = () => {
    if (!selectedSku) {
      setMessage("Select a cart item to void.");
      return;
    }
    const removedItem = cartItems.find((item) => item.sku === selectedSku);
    setCartItems((prev) => prev.filter((item) => item.sku !== selectedSku));
    setSelectedSku("");
    if (removedItem) {
      setMessage(`${removedItem.name} removed from cart.`);
    }
  };

  const clearCart = () => {
    if (cartItems.length === 0) {
      setMessage("Cart is already empty.");
      return;
    }
    setCartItems([]);
    setSelectedSku("");
    setMessage("Cart cleared.");
  };

  const holdSale = () => {
    if (cartItems.length === 0) {
      setMessage("No items to hold.");
      return;
    }
    setHeldSales((prev) => [...prev, { id: getNextTransaction(transactionSeed), items: cartItems }]);
    setTransactionSeed((prev) => prev + 1);
    setCartItems([]);
    setSelectedSku("");
    setMessage("Current sale moved to hold queue.");
  };

  const completeSale = () => {
    if (cartItems.length === 0) {
      setMessage("Add items before completing sale.");
      return;
    }
    if (change < 0) {
      setMessage("Insufficient cash tendered.");
      return;
    }
    setMessage(`Sale completed. Change: ${toPHP(change)}.`);
    setCartItems([]);
    setSelectedSku("");
    setDiscount(10);
    setCashInput("0");
    setTransactionSeed((prev) => prev + 1);
  };

  const setQuickCash = (amount) => {
    setCashInput(String(amount));
  };

  const cycleCustomer = () => {
    setCustomerIndex((prev) => (prev + 1) % customerNames.length);
    setMessage(`Customer set to ${customerNames[(customerIndex + 1) % customerNames.length]}.`);
  };

  return (
    <div className="pos-page">
      <div className="page-header pos-header">
        <div>
          <h1>Point of Sale</h1>
          <p>Fast checkout, item lookup, and payment summary</p>
        </div>

        <div className="pos-session-card">
          <p>
            <strong>Cashier:</strong> Demo User
          </p>
          <p>
            <strong>Shift:</strong> Morning Shift
          </p>
          <p>
            <strong>Transaction:</strong> {getNextTransaction(transactionSeed)}
          </p>
          <p>
            <strong>Customer:</strong> {customerNames[customerIndex]}
          </p>
          <p>
            <strong>Held Sales:</strong> {heldSales.length}
          </p>
        </div>
      </div>

      <div className="pos-layout">
        <section className="panel pos-products-panel">
          <div className="pos-toolbar">
            <div className="pos-search-wrap">
              <input
                type="text"
                className="pos-search"
                placeholder="Search by Product Name or Product SKU"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </div>
            <button className="btn" onClick={cycleCustomer}>
              New Customer
            </button>
          </div>

          <div className="pos-category-tabs">
            {categories.map((category) => (
              <button
                key={category}
                className={`pos-tab ${category === activeCategory ? "active" : ""}`}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="pos-product-grid">
            {filteredProducts.map((product) => (
              <article className="pos-product-card" key={product.sku}>
                <p className="pos-sku">{product.sku}</p>
                <h3>{product.name}</h3>
                <p className="pos-stock">
                  {product.category} | Stock: {product.stock}
                </p>
                <div className="pos-product-footer">
                  <span>{toPHP(product.price)}</span>
                  <button className="btn btn-primary" onClick={() => addToCart(product)}>
                    Add
                  </button>
                </div>
              </article>
            ))}
            {filteredProducts.length === 0 && (
              <p className="pos-note">No products found for this filter and search.</p>
            )}
          </div>
        </section>

        <aside className="panel pos-cart-panel">
          <div className="pos-cart-head">
            <h2>Current Cart</h2>
            <button className="btn" onClick={holdSale}>
              Hold Sale
            </button>
          </div>

          <div className="pos-cart-list">
            {cartItems.map((item) => (
              <div
                className={`pos-cart-row ${selectedSku === item.sku ? "selected" : ""}`}
                key={item.sku}
                onClick={() => setSelectedSku(item.sku)}
              >
                <div>
                  <p className="pos-cart-name">{item.name}</p>
                  <p className="pos-cart-sku">{item.sku}</p>
                </div>

                <div className="pos-cart-controls">
                  <button
                    className="btn"
                    onClick={(event) => {
                      event.stopPropagation();
                      decrementQty(item.sku);
                    }}
                  >
                    -
                  </button>
                  <span>{item.qty}</span>
                  <button
                    className="btn"
                    onClick={(event) => {
                      event.stopPropagation();
                      incrementQty(item.sku);
                    }}
                  >
                    +
                  </button>
                </div>

                <div className="pos-cart-price">{toPHP(item.qty * item.price)}</div>
              </div>
            ))}
            {cartItems.length === 0 && <p className="pos-note">Cart is empty.</p>}
          </div>

          <div className="pos-summary">
            <div>
              <span>Subtotal</span>
              <strong>{toPHP(subtotal)}</strong>
            </div>
            <div>
              <span>Tax (12%)</span>
              <strong>{toPHP(tax)}</strong>
            </div>
            <div>
              <span>Discount</span>
              <strong>- {toPHP(discount)}</strong>
            </div>
            <div className="pos-total-row">
              <span>Total Due</span>
              <strong>{toPHP(total)}</strong>
            </div>
            <div>
              <span>Cash Tendered</span>
              <strong>
                <input
                  className="pos-cash-input"
                  type="number"
                  min="0"
                  step="1"
                  value={cashInput}
                  onChange={(event) => setCashInput(event.target.value)}
                />
              </strong>
            </div>
            <div>
              <span>Change</span>
              <strong className={change < 0 ? "pos-negative" : ""}>{toPHP(change)}</strong>
            </div>
            <div className="pos-quick-cash">
              <button className="btn" onClick={() => setQuickCash(100)}>
                100
              </button>
              <button className="btn" onClick={() => setQuickCash(200)}>
                200
              </button>
              <button className="btn" onClick={() => setQuickCash(500)}>
                500
              </button>
              <button className="btn" onClick={() => setQuickCash(1000)}>
                1000
              </button>
            </div>
          </div>

          <div className="pos-actions">
            <button className="btn" onClick={applyDiscount}>
              Apply Discount
            </button>
            <button className="btn" onClick={voidSelectedItem}>
              Void Item
            </button>
            <button className="btn" onClick={clearCart}>
              Clear Cart
            </button>
            <button className="btn btn-primary" onClick={completeSale}>
              Complete Sale
            </button>
          </div>
          <p className="pos-note">{message}</p>
        </aside>
      </div>
    </div>
  );
}
