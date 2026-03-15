export default function Navbar() {
  return (
    <header className="navbar">
      <div>
        <h2 className="navbar-title">SariPH</h2>
        <p className="navbar-subtitle">POS and Inventory</p>
      </div>

      <div className="navbar-user">
        <span className="user-role">Administrator</span>
        <span className="user-name">Demo User</span>
      </div>
    </header>
  );
}