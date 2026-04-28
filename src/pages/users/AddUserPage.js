import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePos } from "../../state/posStore";

export default function AddUserPage() {
  const navigate = useNavigate();
  const { currentUser, runAction } = usePos();
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    role: "Cashier",
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  const submit = (event) => {
    event.preventDefault();
    const result = runAction({
      type: "CREATE_USER",
      payload: { actor: currentUser.username, user: form },
    });

    if (!result.ok) {
      setErrors(result.errors || {});
      setMessage("Unable to create account.");
      return;
    }

    setErrors({});
    setMessage("User account created with Active status.");
    setForm({ fullName: "", username: "", email: "", password: "", role: "Cashier" });
    setTimeout(() => navigate("/users"), 400);
  };

  return (
    <div className="page d-flex flex-column gap-3">
      <div className="page-header d-flex justify-content-between align-items-start flex-wrap gap-2">
        <div>
          <h1 className="mb-1">Add User</h1>
          <p className="mb-0">Create user with unique username and secure password</p>
        </div>
      </div>

      <div className="card panel add-user-panel border-0 shadow-sm">
        <div className="card-body">
          <form className="form-grid row g-3" onSubmit={submit}>
            <label className="form-label col-12 col-md-6 mb-0">
            Full Name
              <input className="form-control" value={form.fullName} onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))} />
            {errors.fullName && <span className="form-error">{errors.fullName}</span>}
          </label>

            <label className="form-label col-12 col-md-6 mb-0">
            Username
              <input className="form-control" value={form.username} onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))} />
            {errors.username && <span className="form-error">{errors.username}</span>}
          </label>

            <label className="form-label col-12 col-md-6 mb-0">
            Email
              <input className="form-control" type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </label>

            <label className="form-label col-12 col-md-6 mb-0">
            Password
            <input
                className="form-control"
              type="password"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
            />
            {errors.password && <span className="form-error">{errors.password}</span>}
          </label>

            <label className="form-label col-12 col-md-6 mb-0">
            Role
              <select className="form-select" value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}>
              <option>Cashier</option>
              <option>Supervisor</option>
              <option>Administrator</option>
            </select>
          </label>

            <div className="form-actions col-12 d-flex justify-content-end gap-2 flex-wrap">
              <button type="button" className="btn btn-secondary" onClick={() => navigate("/users")}>Cancel</button>
              <button type="submit" className="btn btn-primary button-full">Create User</button>
            </div>
          </form>

          {message && <p className="form-message mb-0 mt-3">{message}</p>}
          </div>
      </div>
    </div>
  );
}
