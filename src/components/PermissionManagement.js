import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PermissionManagement = () => {
  const [permissions, setPermissions] = useState([]); 
  const [newPermission, setNewPermission] = useState({ permission_name: '', description: '' }); 
  const [editPermission, setEditPermission] = useState(null); 
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState(null); 

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:5000/permissions'); 
      setPermissions(response.data); 
    } catch (err) {
      setError('Error fetching permissions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPermission = async () => {
    if (!newPermission.permission_name || !newPermission.description) {
      setError('Please fill in both fields');
      return;
    }

    setError(null);
    try {
      const response = await axios.post('http://localhost:5000/permissions', {
        permissionName: newPermission.permission_name,
        description: newPermission.description,
      }); 

      setPermissions((prevPermissions) => [...prevPermissions, response.data.permission]);
      setNewPermission({ permission_name: '', description: '' }); 
    } catch (err) {
      setError('Error adding permission');
      console.error(err);
    }
  };

  const handleEditPermission = (permission) => {
    setEditPermission({ ...permission }); 
  };

  const handleSavePermission = async () => {
    if (!editPermission?.permission_name || !editPermission?.description) {
      setError('Please fill in both fields');
      return;
    }
  
    setError(null);
    try {
      const response = await axios.put(
        `http://localhost:5000/permissions/${editPermission.id}`,
        {
          permissionName: editPermission.permission_name,
          description: editPermission.description,
        }
      );
  
      if (response.status === 200) {
        setPermissions((prevPermissions) =>
          prevPermissions.map((perm) =>
            perm.id === editPermission.id ? { ...perm, ...response.data } : perm
          )
        );
      }
      setEditPermission(null);
    } catch (err) {
      setError('Error updating permission');
      console.error(err);
    }
  };
  

  const handleDeletePermission = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/permissions/${id}`); 

      setPermissions(permissions.filter((perm) => perm.id !== id));
    } catch (err) {
      setError('Error deleting permission');
      console.error(err);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Permission Management</h2>

      {}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {}
      <div style={{ marginBottom: '20px' }}>
        <h3>Add Permission</h3>
        <input
          type="text"
          placeholder="Permission Name"
          value={newPermission.permission_name}
          onChange={(e) => setNewPermission({ ...newPermission, permission_name: e.target.value })}
          style={{ marginRight: '10px', padding: '5px' }}
        />
        <input
          type="text"
          placeholder="Description"
          value={newPermission.description}
          onChange={(e) => setNewPermission({ ...newPermission, description: e.target.value })}
          style={{ marginRight: '10px', padding: '5px' }}
        />
        <button
          onClick={handleAddPermission}
          style={{
            backgroundColor: '#007BFF',
            color: 'white',
            border: 'none',
            padding: '8px 15px',
            cursor: 'pointer',
          }}
        >
          Add Permission
        </button>
      </div>

      {}
      <div>
        <h3>Permissions List</h3>
        {loading ? (
          <p>Loading permissions...</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Permission Name</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Description</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {permissions.map((perm) => (
                <tr key={perm.id}>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    {editPermission?.id === perm.id ? (
                      <input
                        type="text"
                        value={editPermission.permission_name || ''}
                        onChange={(e) =>
                          setEditPermission({ ...editPermission, permission_name: e.target.value })
                        }
                        style={{ padding: '5px' }}
                      />
                    ) : (
                      perm.permission_name
                    )}
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    {editPermission?.id === perm.id ? (
                      <input
                        type="text"
                        value={editPermission.description || ''}
                        onChange={(e) =>
                          setEditPermission({ ...editPermission, description: e.target.value })
                        }
                        style={{ padding: '5px' }}
                      />
                    ) : (
                      perm.description
                    )}
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    {editPermission?.id === perm.id ? (
                      <button
                        onClick={handleSavePermission}
                        style={{ backgroundColor: '#28a745', color: 'white', padding: '5px 10px' }}
                      >
                        Save
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEditPermission(perm)}
                          style={{
                            backgroundColor: '#ffc107',
                            color: 'white',
                            padding: '5px 10px',
                            marginRight: '5px',
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeletePermission(perm.id)}
                          style={{
                            backgroundColor: '#dc3545',
                            color: 'white',
                            padding: '5px 10px',
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

export default PermissionManagement;