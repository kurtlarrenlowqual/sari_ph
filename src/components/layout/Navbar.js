import { useNavigate } from "react-router-dom";
import { usePos } from "../../state/posStore";

export default function Navbar({ onMenuToggle }) {
  const navigate = useNavigate();
  const { currentUser, runAction } = usePos();

  const logout = () => {
    runAction({ type: "LOGOUT" });
    navigate("/login", { replace: true });
  };

  return (
    <header className="app-navbar d-flex justify-content-between align-items-center gap-3 flex-wrap">
      <div className="d-flex align-items-center gap-3 navbar-left">
        <button
          className="btn btn-secondary navbar-menu-btn"
          onClick={onMenuToggle}
          type="button"
          aria-label="Toggle navigation"
        >
          <span className="menu-icon" aria-hidden="true">☰</span>
          <span>Menu</span>
        </button>
        <div className="navbar-branding">
          <h2 className="navbar-title mb-0">SariPH</h2>
          <p className="navbar-subtitle mb-0">POS and Inventory</p>
        </div>
      </div>

      <div className="navbar-user d-flex align-items-center gap-3">
        <div className="navbar-user-meta d-flex flex-column">
          <span className="user-role">{currentUser?.role || "Guest"}</span>
          <span className="user-name">{currentUser?.fullName || "Not logged in"}</span>
        </div>
        {currentUser && (
          <button className="btn btn-outline-primary btn-sm" onClick={logout}>
            Logout
          </button>
        )}
      </div>
    </header>
  );
}
