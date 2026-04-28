import { useNavigate } from "react-router-dom";

export default function POSPage() {
  const navigate = useNavigate();

  return (
    <div className="pos-fullscreen">

      <div className="pos-header">
        <button
          onClick={() => navigate(-1)}
          style={{
            marginBottom: "12px",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#222"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1>Point of Sale</h1>
        <p>Process customer purchases</p>
      </div>

      <div className="content-grid">

        <div className="panel">
          <h2>Product List</h2>
          <input placeholder="Search product..." style={{marginBottom:"10px"}}/>
          <ul>
            <li>Notebook - ₱50</li>
            <li>Ballpen - ₱10</li>
            <li>Pencil - ₱8</li>
          </ul>
        </div>

        <div className="panel">
          <h2>Cart</h2>
          <p>No items added yet.</p>
          <hr/>
          <p>Total: ₱0</p>
          <button className="btn btn-primary">Complete Sale</button>
        </div>

      </div>

    </div>
  );
}