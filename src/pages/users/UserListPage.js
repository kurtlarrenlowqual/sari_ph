export default function UserListPage() {
  return (
    <div>
      <div className="page-header">
        <h1>Users</h1>
        <p>Manage system users and roles</p>
      </div>

      <div className="panel">

        <button className="btn btn-primary" style={{marginBottom:"15px"}}>
          Add User
        </button>

        <table style={{width:"100%"}}>
          <thead>
            <tr style={{background:"#eee"}}>
              <th>ID</th>
              <th>Name</th>
              <th>Role</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>1</td>
              <td>Admin User</td>
              <td>Administrator</td>
              <td>Active</td>
            </tr>

            <tr>
              <td>2</td>
              <td>Cashier 01</td>
              <td>Cashier</td>
              <td>Active</td>
            </tr>
          </tbody>
        </table>

        <p style={{marginTop:"10px", color:"#777"}}>
          User management UI to be completed by assigned member.
        </p>

      </div>
    </div>
  );
}