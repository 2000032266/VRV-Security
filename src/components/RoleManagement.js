import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [roleName, setRoleName] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [editingRole, setEditingRole] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const permissionsResponse = await axios.get('http://localhost:5000/permissions');
        setPermissions(permissionsResponse.data);

        const rolesResponse = await axios.get('http://localhost:5000/roles');
        setRoles(rolesResponse.data);

        console.log("Fetched Roles: ", rolesResponse.data);
        console.log("Fetched Permissions: ", permissionsResponse.data);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, []);

  
  const fetchRoles = async () => {
    try {
      const rolesResponse = await axios.get('http://localhost:5000/roles');
      setRoles(rolesResponse.data);
    } catch (err) {
      console.error('Error fetching roles:', err);
    }
  };
  
  const handleRoleSubmit = async (e) => {
    e.preventDefault();
    const url = editingRole ? `http://localhost:5000/roles/${editingRole.id}` : 'http://localhost:5000/roles';
    const method = editingRole ? 'put' : 'post';
  
    try {
      await axios({
        method,
        url,
        data: {
          roleName,
          permissionIds: selectedPermissions,
        },
      });
      await fetchRoles(); 
      resetForm();
    } catch (err) {
      console.error('Error submitting role:', err);
    }
  };
  
  const handleEditRole = (role) => {
    setEditingRole(role);
    setRoleName(role.role_name);
    setSelectedPermissions(role.permissions.split(',').map(p => permissions.find(permission => permission.permission_name === p).id));
  };

  const handleDeleteRole = async (roleId) => {
    try {
      await axios.delete(`http://localhost:5000/roles/${roleId}`);
      setRoles(roles.filter(role => role.id !== roleId));
    } catch (err) {
      console.error('Error deleting role:', err);
    }
  };

  const resetForm = () => {
    setRoleName('');
    setSelectedPermissions([]);
    setEditingRole(null);
  };

  return (
    <div className="content1">
      <h2>Role Management</h2>

      <form onSubmit={handleRoleSubmit} className="role-form">
        <div>
          <label>Role Name:</label>
          <input
            type="text"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            required
            className="input-field"
          />
        </div>

        <div>
          <label>Permissions:</label>
          <div className="permissions-container">
            {permissions.map(permission => (
              <div key={permission.id}>
                <input
                  type="checkbox"
                  id={`permission-${permission.id}`}
                  value={permission.id}
                  checked={selectedPermissions.includes(permission.id)}
                  onChange={(e) => {
                    const newSelectedPermissions = e.target.checked
                      ? [...selectedPermissions, permission.id]
                      : selectedPermissions.filter(id => id !== permission.id);
                    setSelectedPermissions(newSelectedPermissions);
                  }}
                  className="checkbox"
                />
                <label htmlFor={`permission-${permission.id}`}>{permission.permission_name}</label>
              </div>
            ))}
          </div>
        </div>

        <div className="button-group">
          <button type="submit" className="submit-btn">{editingRole ? 'Update Role' : 'Add Role'}</button>
        </div>
      </form>

      <h2>Roles List</h2>
      <table>
        <thead>
          <tr>
            <th>Role Name</th>
            <th>Permissions</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {roles.map(role => (
            <tr key={role.id}>
              <td>{role.role_name}</td>
              <td>{role.permissions}</td>
              <td>
                <button onClick={() => handleEditRole(role)} className="action-btn">Edit</button>
                <button onClick={() => handleDeleteRole(role.id)} className="action-btn">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RoleManagement;
