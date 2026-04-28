import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePos } from "../state/posStore";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = usePos();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const result = await login(form);
      setError("");
      if (result.needsPasswordChange) {
        navigate("/change-password", { replace: true });
        return;
      }
      navigate("/dashboard", { replace: true });
    } catch (error) {
      setError(error.errors?.username || error.message || "Invalid username or password.");
    }
  }

  return (
    <div className="login-page container py-4">
      <div className="login-card card border-0 shadow-sm">
        <div className="card-body p-4">
          <h1 className="h3 mb-1">SariPH POS Login</h1>
          <p className="mb-3">Login with an active user account</p>

          <form onSubmit={handleSubmit} className="form-grid d-grid gap-3">
            <label className="form-label mb-0">
            Username
            <input
              type="text"
              name="username"
              className="form-control"
              value={form.username}
              onChange={handleChange}
              placeholder="Enter username"
              required
            />
          </label>

            <label className="form-label mb-0">
            Password
            <input
              type="password"
              name="password"
              className="form-control"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter password"
              required
            />
          </label>

          {error && <p className="form-error">{error}</p>}

            <button type="submit" className="btn btn-primary w-100">
            Login
          </button>
        </form>

          <div className="hint-box mt-3">
          <strong>Seed users:</strong> admin / Admin@123, supervisor1 / Supervisor@123, cashier1 / Cashier@123
          </div>
        </div>
      </div>
    </div>
  );
}
