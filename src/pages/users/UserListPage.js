import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const STORAGE_KEY = "sari_users";

function getSavedUsers() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function createDefaultUsers() {
  const defaultUsers = [
    { id: 1, fullName: "Admin User", username: "admin", role: "Administrator", status: "Active" },
    { id: 2, fullName: "Cashier 01", username: "cashier01", role: "Cashier", status: "Active" },
  ];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultUsers));
  return defaultUsers;
}

export default function UserListPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const saved = getSavedUsers();
    if (saved && saved.length) {
      setUsers(saved);
      return;
    }
    setUsers(createDefaultUsers());
  }, []);

  const handleAddUser = () => {
    navigate("/users/add");
  };

  return (
    <div>
      <div className="page-header">
        <h1>Users</h1>
        <p>Manage system users, roles, and accounts.</p>
      </div>

      <div className="panel add-user-panel">
        <div className="panel-header">
          <div>
            <h2>User Directory</h2>
            <p>View all users added from the Add User page.</p>
          </div>
          <button className="btn btn-primary" onClick={handleAddUser}>
            Add User
          </button>
        </div>

        <div className="table-wrap">
          <table className="user-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Username</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.fullName}</td>
                  <td>{u.username}</td>
                  <td>{u.role}</td>
                  <td>{u.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="form-notice" style={{ marginTop: "12px" }}>
          New users created in Add User appear instantly here after save.
        </div>
      </div>
    </div>
  );
}