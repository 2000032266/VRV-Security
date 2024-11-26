import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserManagement = () => {
  const [users, setUsers] = useState([]); 
  const [roles, setRoles] = useState([]); 
  const [newUser, setNewUser] = useState({ username: '', role_id: '', status: true }); 
  const [editUser, setEditUser] = useState(null); 
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState(null); 
  const [formError, setFormError] = useState(null); 

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:5000/users'); 
      setUsers(response.data); 
    } catch (err) {
      setError('Error fetching users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await axios.get('http://localhost:5000/roles'); 
      setRoles(response.data); 
    } catch (err) {
      setError('Error fetching roles');
      console.error(err);
    }
  };

  const handleAddUser = async () => {
    setFormError(null);
    if (!newUser.username || !newUser.role_id) {
      setFormError('Please fill in all fields');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/users', newUser); 

      setUsers((prevUsers) => [...prevUsers, response.data.user]);
      setNewUser({ username: '', role_id: '', status: true }); 
    } catch (err) {
      setFormError('Error adding user');
      console.error(err);
    }
  };

  const handleEditUser = (user) => {
    setEditUser({ ...user }); 
  };

  const handleSaveUser = async () => {
    setFormError(null);
    if (!editUser?.username || !editUser?.role_id) {
      setFormError('Please fill in all fields');
      return;
    }

    try {
      const response = await axios.put(
        `http://localhost:5000/users/${editUser.id}`,
        editUser
      );  

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === editUser.id ? response.data.user : user
        )
      );
      setEditUser(null); 
    } catch (err) {
      setFormError('Error updating user');
      console.error(err);
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/users/${id}`);

    
      setUsers(users.filter((user) => user.id !== id));
    } catch (err) {
      setFormError('Error deleting user');
      console.error(err);
    }
  };

 
  const handleInputChange = (e, field) => {
    const value = e.target.value;
    setNewUser((prevUser) => ({ ...prevUser, [field]: value }));
  };

  
  const handleEditChange = (e, field) => {
    const value = e.target.value;
    setEditUser((prevEditUser) => ({ ...prevEditUser, [field]: value }));
  };


    

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>User Management</h2>

      {}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {}
      <div style={{ marginBottom: '20px' }}>
        <h3>Add User</h3>
        {formError && <p style={{ color: 'red' }}>{formError}</p>}
        <input
          type="text"
          placeholder="Username"
          value={newUser.username}
          onChange={(e) => handleInputChange(e, 'username')}
          style={{ marginRight: '10px', padding: '5px' }}
        />
        <select
          value={newUser.role_id}
          onChange={(e) => handleInputChange(e, 'role_id')}
          style={{ marginRight: '10px', padding: '5px' }}
        >
          <option value="">Select Role</option>
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.role_name}
            </option>
          ))}
        </select>
        <select
          value={newUser.status}
          onChange={(e) => handleInputChange(e, 'status')}
          style={{ marginRight: '10px', padding: '5px' }}
        >
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        <button
          onClick={handleAddUser}
          style={{
            backgroundColor: '#007BFF',
            color: 'white',
            border: 'none',
            padding: '8px 15px',
            cursor: 'pointer',
          }}
        >
          Add User
        </button>
      </div>

      {}
      <div>
        <h3>Users List</h3>
        {loading ? (
          <p>Loading users...</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Username</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Role</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Status</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    {editUser?.id === user.id ? (
                      <input
                        type="text"
                        value={editUser.username || ''}
                        onChange={(e) => handleEditChange(e, 'username')}
                        style={{ padding: '5px' }}
                      />
                    ) : (
                      user.username
                    )}
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    {editUser?.id === user.id ? (
                      <select
                        value={editUser.role_id}
                        onChange={(e) => handleEditChange(e, 'role_id')}
                        style={{ padding: '5px' }}
                      >
                        {roles.map((role) => (
                          <option key={role.id} value={role.id}>
                            {role.role_name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      user.role_name
                    )}
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    {editUser?.id === user.id ? (
                      <select
                        value={editUser.status}
                        onChange={(e) => handleEditChange(e, 'status')}
                        style={{ padding: '5px' }}
                      >
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    ) : (
                      user.status ? 'Active' : 'Inactive'
                    )}
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    {editUser?.id === user.id ? (
                      <>
                        <button
                          onClick={handleSaveUser}
                          style={{
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            padding: '5px 10px',
                            marginRight: '5px',
                            cursor: 'pointer',
                          }}
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditUser(null)}
                          style={{
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            padding: '5px 10px',
                            cursor: 'pointer',
                          }}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEditUser(user)}
                          style={{
                            backgroundColor: '#ffc107',
                            color: 'white',
                            border: 'none',
                            padding: '5px 10px',
                            marginRight: '5px',
                            cursor: 'pointer',
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          style={{
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            padding: '5px 10px',
                            cursor: 'pointer',
                          }}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default UserManagement;

