import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { usePos } from "../state/posStore";

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const { runAction, pendingPasswordUser, validatePasswordComplexity } = usePos();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  if (!pendingPasswordUser) {
    return <Navigate to="/login" replace />;
  }

  const submit = (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (!validatePasswordComplexity(password)) {
      setError(
        "Password must be 8+ chars with uppercase, lowercase, number, and special character."
      );
      return;
    }

    const result = runAction({
      type: "CHANGE_TEMP_PASSWORD",
      payload: { userId: pendingPasswordUser.id, newPassword: password },
    });
    if (!result.ok) {
      setError(result.error || "Unable to change password.");
      return;
    }

    setError("");
    navigate("/dashboard", { replace: true });
  };

  return (
    <div className="login-page container py-4">
      <div className="login-card card border-0 shadow-sm">
        <div className="card-body p-4">
          <h1 className="h3 mb-1">Change Temporary Password</h1>
          <p className="mb-3">Your temporary password must be replaced before continuing.</p>
          <form className="form-grid d-grid gap-3" onSubmit={submit}>
            <label className="form-label mb-0">
            New Password
              <input className="form-control" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>
            <label className="form-label mb-0">
            Confirm Password
              <input className="form-control" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
          </label>
          {error && <p className="form-error">{error}</p>}
            <button type="submit" className="btn btn-primary w-100">
            Update Password
          </button>
        </form>
        </div>
      </div>
    </div>
  );
}
