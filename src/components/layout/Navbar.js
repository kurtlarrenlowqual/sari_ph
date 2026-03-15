export default function Navbar() {
  return (
    <header className="navbar">
      <div>
        <h2 className="navbar-title">POS and Inventory System</h2>
        <p className="navbar-subtitle">React UI Prototype</p>
      </div>

      <div className="navbar-user">
        <span className="user-role">Administrator</span>
        <span className="user-name">Demo User</span>
      </div>
    </header>
  );
}