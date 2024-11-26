import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import UserManagement from './components/UserManagement';
import RoleManagement from './components/RoleManagement';
import PermissionManagement from './components/PermissionManagement';

import './style.css';

const App = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchPermissions();
  }, []);

  const fetchUsers = async () => {
    const response = await fetch('http://localhost:5000/users');
    const data = await response.json();
    setUsers(data);
  };

  const fetchRoles = async () => {
    const response = await fetch('http://localhost:5000/roles');
    const data = await response.json();
    setRoles(data);
  };

  const fetchPermissions = async () => {
    const response = await fetch('http://localhost:5000/permissions');
    const data = await response.json();
    setPermissions(data);
  };

  return (
<Router>
  <div>
    <h1>Admin Dashboard</h1>
    <div className="wrapper">
      <div className="sidebar">
        <ul>
          <li><a href="/user-management">User Management</a></li>
          <li><a href="/role-management">Role Management</a></li>
          <li><a href="/permission-management">Permission Management</a></li>
        </ul>
      </div>
      <div className="content">
        <Routes>
          <Route path="/user-management" element={<UserManagement users={users} />} />
          <Route path="/role-management" element={<RoleManagement roles={roles} />} />
          <Route path="/permission-management" element={<PermissionManagement permissions={permissions} />} />
        </Routes>
      </div>
    </div>
  </div>
</Router>

  );
};

export default App;
