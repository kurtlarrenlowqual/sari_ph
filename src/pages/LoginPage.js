import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    navigate("/dashboard");
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>RetailPOS Login</h1>
        <p>Demo frontend for prelim presentation</p>

        <form onSubmit={handleSubmit} className="form-grid">
          <label>
            Username
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Enter username"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter password"
              required
            />
          </label>

          <button type="submit" className="btn btn-primary">
            Login
          </button>
        </form>

        <div className="hint-box">
          <strong>Demo Note:</strong> This login is UI-only for presentation.
        </div>
      </div>
    </div>
  );
}