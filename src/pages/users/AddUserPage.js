import { useState } from "react";
import { useNavigate } from "react-router-dom";

const STORAGE_KEY = "sari_users";

function getSavedUsers() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function setSavedUsers(users) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

export default function AddUserPage() {
  const [user, setUser] = useState({ fullName: "", username: "", password: "", role: "Cashier" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (field) => (event) => {
    setUser((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!user.fullName.trim() || !user.username.trim() || !user.password.trim()) {
      setMessage("Please complete all fields before creating a user.");
      return;
    }

    const existingUsers = getSavedUsers();
    const newUser = {
      id: existingUsers.length + 1,
      fullName: user.fullName.trim(),
      username: user.username.trim(),
      role: user.role,
      status: "Active",
      createdAt: new Date().toISOString(),
    };
    setSavedUsers([...existingUsers, newUser]);

    setMessage(`User '${user.username}' created successfully.`);
    setUser({ fullName: "", username: "", password: "", role: "Cashier" });

    setTimeout(() => {
      navigate("/users");
    }, 300);
  };

  const handleReset = () => {
    setUser({ fullName: "", username: "", password: "", role: "Cashier" });
    setMessage("");
  };

  return (
    <div>
      <div className="page-header">
        <h1>Add User</h1>
        <p>Create a new system account</p>
      </div>

      <div className="panel add-user-panel">
        <div className="panel-header">
          <div>
            <h2>User details</h2>
            <p>Fill in the user information to add an account.</p>
          </div>
          <span className="badge">UI only</span>
        </div>

        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Full Name
            <input type="text" value={user.fullName} onChange={handleChange("fullName")} placeholder="Ex: Juan Dela Cruz" />
          </label>

          <label>
            Username
            <input type="text" value={user.username} onChange={handleChange("username")} placeholder="Ex: jdelacruz" />
          </label>

          <label>
            Password
            <input type="password" value={user.password} onChange={handleChange("password")} placeholder="Enter password" />
          </label>

          <label>
            Role
            <select value={user.role} onChange={handleChange("role")}>
              <option>Administrator</option>
              <option>Supervisor</option>
              <option>Cashier</option>
            </select>
          </label>

          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={handleReset}>
              Reset
            </button>
            <button type="submit" className="btn btn-primary button-full">
              Create User
            </button>
          </div>
        </form>

        {message && <p className="form-message">{message}</p>}

        <p className="hint-box">
          After creating, you will be redirected to the User Directory automatically.
        </p>
      </div>
    </div>
  );
}