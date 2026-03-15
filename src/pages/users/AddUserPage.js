export default function AddUserPage() {
  return (
    <div>
      <div className="page-header">
        <h1>Add User</h1>
        <p>Create a new system account</p>
      </div>

      <div className="panel">

        <form className="form-grid">

          <label>
            Full Name
            <input type="text"/>
          </label>

          <label>
            Username
            <input type="text"/>
          </label>

          <label>
            Password
            <input type="password"/>
          </label>

          <label>
            Role
            <select>
              <option>Administrator</option>
              <option>Supervisor</option>
              <option>Cashier</option>
            </select>
          </label>

          <button className="btn btn-primary">
            Create User
          </button>

        </form>

        <p style={{marginTop:"10px", color:"#777"}}>
          Backend connection will be implemented later.
        </p>

      </div>
    </div>
  );
}