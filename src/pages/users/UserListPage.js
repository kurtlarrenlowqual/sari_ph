import { useMemo, useState } from "react";
import { usePos } from "../../state/posStore";

const initialEdit = { fullName: "", email: "", role: "Cashier" };

export default function UserListPage() {
  const { state, currentUser, runAction } = usePos();
  const [selectedId, setSelectedId] = useState(null);
  const [editForm, setEditForm] = useState(initialEdit);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [newPassword, setNewPassword] = useState("");

  const users = state.users;
  const selected = useMemo(() => users.find((u) => u.id === selectedId) || null, [users, selectedId]);

  const pickUser = (user) => {
    setSelectedId(user.id);
    setEditForm({ fullName: user.fullName, email: user.email, role: user.role });
    setErrors({});
    setMessage("");
    setNewPassword("");
  };

  const saveUser = () => {
    if (!selected) return;
    const result = runAction({
      type: "UPDATE_USER",
      payload: {
        actor: currentUser.username,
        userId: selected.id,
        updates: editForm,
      },
    });

    if (!result.ok) {
      setErrors(result.errors || {});
      setMessage(result.error || "Unable to update user.");
      return;
    }
    setErrors({});
    setMessage("User profile updated.");
  };

  const toggleStatus = () => {
    if (!selected) return;
    const targetStatus = selected.status === "Active" ? "Inactive" : "Active";
    const confirmed = window.confirm(
      `${targetStatus === "Inactive" ? "Deactivate" : "Reactivate"} ${selected.username}? If user is currently logged in, access should be terminated on next route check.`
    );
    if (!confirmed) return;

    const result = runAction({
      type: "SET_USER_STATUS",
      payload: { actor: currentUser.username, userId: selected.id, status: targetStatus },
    });

    if (!result.ok) {
      setMessage(result.error || "Unable to change status.");
      return;
    }
    setMessage(`User status changed to ${targetStatus}.`);
  };

  const resetTemporary = () => {
    if (!selected) return;
    const result = runAction({
      type: "RESET_USER_PASSWORD",
      payload: {
        actor: currentUser.username,
        userId: selected.id,
        mode: "temporary",
      },
    });
    if (!result.ok) {
      setMessage(result.error || "Unable to reset password.");
      return;
    }
    setMessage(`Temporary password: ${result.temporaryPassword}. User must change on next login.`);
  };

  const resetManual = () => {
    if (!selected) return;
    const result = runAction({
      type: "RESET_USER_PASSWORD",
      payload: {
        actor: currentUser.username,
        userId: selected.id,
        mode: "manual",
        value: newPassword,
      },
    });
    if (!result.ok) {
      setMessage(result.error || "Unable to set new password.");
      return;
    }
    setMessage("Password updated successfully.");
    setNewPassword("");
  };

  return (
    <div className="page d-flex flex-column gap-3">
      <div className="page-header d-flex justify-content-between align-items-start flex-wrap gap-2">
        <div>
          <h1 className="mb-1">Users</h1>
          <p className="mb-0">Update user details, roles, status, and reset passwords</p>
        </div>
      </div>

      <div className="row g-3">
        <section className="col-xl-7">
          <div className="card panel border-0 shadow-sm h-100">
            <div className="card-body">
              <h2 className="h5">User Directory</h2>
              <div className="table-wrap table-responsive">
                <table className="user-table table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} onClick={() => pickUser(u)} className={selectedId === u.id ? "table-selected" : ""}>
                    <td>{u.username}</td>
                    <td>{u.fullName}</td>
                    <td>{u.email}</td>
                    <td>{u.role}</td>
                    <td>{u.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
              </div>
            </div>
          </div>
        </section>

        <section className="col-xl-5">
          <div className="card panel border-0 shadow-sm h-100">
            <div className="card-body">
              <h2 className="h5">Edit User</h2>
          {!selected && <p>Select a user from the table.</p>}
          {selected && (
                <div className="form-grid d-grid gap-3">
                  <label className="form-label mb-0">
                Username (Read-only)
                    <input className="form-control" value={selected.username} readOnly />
              </label>

                  <label className="form-label mb-0">
                Full Name
                <input
                      className="form-control"
                  value={editForm.fullName}
                  onChange={(e) => setEditForm((p) => ({ ...p, fullName: e.target.value }))}
                />
                {errors.fullName && <span className="form-error">{errors.fullName}</span>}
              </label>

                  <label className="form-label mb-0">
                Email
                <input
                      className="form-control"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))}
                />
                {errors.email && <span className="form-error">{errors.email}</span>}
              </label>

                  <label className="form-label mb-0">
                Role
                    <select className="form-select" value={editForm.role} onChange={(e) => setEditForm((p) => ({ ...p, role: e.target.value }))}>
                  <option>Cashier</option>
                  <option>Supervisor</option>
                  <option>Administrator</option>
                </select>
                {errors.role && <span className="form-error">{errors.role}</span>}
              </label>

                  <div className="form-actions d-flex gap-2 flex-wrap">
                <button className="btn btn-primary" type="button" onClick={saveUser}>
                  Save Changes
                </button>
                    <button className="btn btn-secondary" type="button" onClick={toggleStatus}>
                  {selected.status === "Active" ? "Deactivate" : "Reactivate"}
                </button>
              </div>

                  <div className="password-box">
                    <h3 className="h6 mb-2">Password Reset</h3>
                    <div className="button-group">
                      <button className="btn btn-secondary" type="button" onClick={resetTemporary}>
                    Generate Temporary Password
                  </button>
                </div>
                    <label className="form-label mb-0">
                  Set New Password
                  <input
                        className="form-control"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Complexity required"
                  />
                </label>
                    <button className="btn btn-secondary" type="button" onClick={resetManual}>
                  Set Password
                </button>
              </div>
            </div>
          )}

              {message && <p className="form-message mb-0 mt-3">{message}</p>}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
