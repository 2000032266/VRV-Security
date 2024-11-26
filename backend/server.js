const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bodyParser = require('body-parser');

const app = express();
const port = 5000;

app.use(express.json());

app.use(cors());

app.use(bodyParser.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', 
  password: 'root', 
  database: 'new', 
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    process.exit(1); 
  }
  console.log('Connected to the database');
  insertDefaultPermissions(); 
});


app.post('/roles', (req, res) => {
  const { roleName, permissionIds } = req.body;

  if (!roleName || !Array.isArray(permissionIds)) {
      return res.status(400).json({ error: 'Role name and permission IDs are required' });
  }

  const queryRole = 'INSERT INTO roles (role_name) VALUES (?)';
  db.query(queryRole, [roleName], (err, result) => {
      if (err) {
          console.error('Error adding role:', err);
          return res.status(500).json({ error: 'Error adding role' });
      }
      const roleId = result.insertId;

      const queryPermissions = 'INSERT INTO role_permissions (role_id, permission_id) VALUES ?';
      const values = permissionIds.map((permissionId) => [roleId, permissionId]);
      db.query(queryPermissions, [values], (permissionsErr) => {
          if (permissionsErr) {
              console.error('Error assigning permissions:', permissionsErr);
              return res.status(500).json({ error: 'Error assigning permissions' });
          }
          res.status(201).json({ roleId, roleName, permissionIds });
      });
  });
});

app.get('/roles', (req, res) => {
  const query = `
      SELECT roles.id, roles.role_name, 
             GROUP_CONCAT(permissions.permission_name) AS permissions
      FROM roles
      LEFT JOIN role_permissions ON roles.id = role_permissions.role_id
      LEFT JOIN permissions ON role_permissions.permission_id = permissions.id
      GROUP BY roles.id;
  `;

  db.query(query, (err, results) => {
      if (err) {
          console.error('Error fetching roles:', err);
          return res.status(500).json({ error: 'Error fetching roles' });
      }
      res.json(results);
  });
});



app.put('/roles/:id', (req, res) => {
  const { id } = req.params;
  const { roleName, permissionIds } = req.body;

  if (!roleName || !Array.isArray(permissionIds)) {
      return res.status(400).json({ error: 'Role name and permission IDs are required' });
  }

  const queryRole = 'UPDATE roles SET role_name = ? WHERE id = ?';
  db.query(queryRole, [roleName, id], (err) => {
      if (err) {
          console.error('Error updating role:', err);
          return res.status(500).json({ error: 'Error updating role' });
      }

      const queryDeletePermissions = 'DELETE FROM role_permissions WHERE role_id = ?';
      db.query(queryDeletePermissions, [id], (delErr) => {
          if (delErr) {
              console.error('Error deleting old permissions:', delErr);
              return res.status(500).json({ error: 'Error deleting old permissions' });
          }

          const queryPermissions = 'INSERT INTO role_permissions (role_id, permission_id) VALUES ?';
          const values = permissionIds.map((permissionId) => [id, permissionId]);
          db.query(queryPermissions, [values], (permissionsErr) => {
              if (permissionsErr) {
                  console.error('Error assigning permissions:', permissionsErr);
                  return res.status(500).json({ error: 'Error assigning permissions' });
              }
              res.json({ id, roleName, permissionIds });
          });
      });
  });
});
app.delete('/roles/:id', (req, res) => {
  const { id } = req.params;

  const queryDeletePermissions = 'DELETE FROM role_permissions WHERE role_id = ?';
  db.query(queryDeletePermissions, [id], (delErr) => {
      if (delErr) {
          console.error('Error deleting role permissions:', delErr);
          return res.status(500).json({ error: 'Error deleting role permissions' });
      }

      const queryDeleteRole = 'DELETE FROM roles WHERE id = ?';
      db.query(queryDeleteRole, [id], (err) => {
          if (err) {
              console.error('Error deleting role:', err);
              return res.status(500).json({ error: 'Error deleting role' });
          }
          res.json({ message: 'Role deleted successfully' });
      });
  });
});



const insertDefaultPermissions = () => {
  const defaultPermissions = [
    { permission_name: 'Create', description: 'Allows creating new records' },
    { permission_name: 'Read', description: 'Allows reading/viewing records' },
    { permission_name: 'Update', description: 'Allows updating existing records' },
    { permission_name: 'Delete', description: 'Allows deleting records' },
  ];

  defaultPermissions.forEach(({ permission_name, description }) => {
    const query = 'SELECT * FROM permissions WHERE permission_name = ?';
    db.query(query, [permission_name], (err, results) => {
      if (err) {
        console.error('Error checking permissions:', err);
        return;
      }

      if (results.length === 0) {
        const insertQuery = 'INSERT INTO permissions (permission_name, description) VALUES (?, ?)';
        db.query(insertQuery, [permission_name, description], (insertErr) => {
          if (insertErr) {
            console.error('Error inserting default permission:', insertErr);
          } else {
            console.log(`Default permission '${permission_name}' added.`);
          }
        });
      }
    });
  });
};


app.get('/permissions', (req, res) => {
  const query = 'SELECT * FROM permissions';
  db.query(query, (err, results) => {
      if (err) {
          console.error('Error fetching permissions:', err);
          return res.status(500).json({ error: 'Error fetching permissions' });
      }
      res.json(results);
  });
});


app.post('/permissions', (req, res) => {
  const { permissionName, description } = req.body;

  if (!permissionName || !description) {
      return res.status(400).json({ error: 'Permission name and description are required' });
  }

  const query = 'INSERT INTO permissions (permission_name, description) VALUES (?, ?)';
  db.query(query, [permissionName, description], (err, result) => {
      if (err) {
          console.error('Error adding permission:', err);
          return res.status(500).json({ error: 'Error adding permission' });
      }

      const newPermission = {
          id: result.insertId,
          permission_name: permissionName,
          description,
      };
      res.status(201).json({ permission: newPermission });
  });
});
app.put('/permissions/:id', (req, res) => {
  const { id } = req.params;
  const { permissionName, description } = req.body;

  if (!permissionName || !description) {
      return res.status(400).json({ error: 'Permission name and description are required' });
  }

  const query = 'UPDATE permissions SET permission_name = ?, description = ? WHERE id = ?';
  db.query(query, [permissionName, description, id], (err, result) => {
      if (err) {
          console.error('Error updating permission:', err);
          return res.status(500).json({ error: 'Error updating permission' });
      }

      if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'Permission not found' });
      }

      res.json({ id, permission_name: permissionName, description });
  });
});



app.delete('/permissions/:id', (req, res) => {
  const { id } = req.params;

  const query = 'DELETE FROM permissions WHERE id = ?';
  db.query(query, [id], (err, result) => {
      if (err) {
          console.error('Error deleting permission:', err);
          return res.status(500).json({ error: 'Error deleting permission' });
      }

      if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'Permission not found' });
      }

      res.json({ message: 'Permission deleted successfully' });
  });
});



app.post('/users', (req, res) => {
  const { username, roleId, status } = req.body;

  if (!username || !roleId || status === undefined) {
      return res.status(400).json({ error: 'Username, roleId, and status are required' });
  }

  db.query('SELECT * FROM roles WHERE id = ?', [roleId], (err, result) => {
      if (err) {
          return res.status(500).json({ error: 'Error validating role' });
      }
      if (result.length === 0) {
          return res.status(400).json({ error: 'Invalid roleId' });
      }

      const query = 'INSERT INTO users (username, role_id, status) VALUES (?, ?, ?)';
      db.query(query, [username, roleId, status], (err, result) => {
          if (err) {
              console.error('Error adding user:', err);
              return res.status(500).json({ error: 'Error adding user' });
          }
          res.status(201).json({ id: result.insertId, username, roleId, status });
      });
  });
});


app.get('/users', (req, res) => {
  const query = `
      SELECT users.id, users.username, users.status, roles.role_name AS role
      FROM users
      LEFT JOIN roles ON users.role_id = roles.id
  `;
  db.query(query, (err, results) => {
      if (err) {
          console.error('Error fetching users:', err);
          return res.status(500).json({ error: 'Error fetching users' });
      }
      console.log(results); 
      res.json(results);
  });
});


app.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const { username, roleId, status } = req.body;

  if (!username || !roleId || status === undefined) {
      return res.status(400).json({ error: 'Username, roleId, and status are required' });
  }

  const query = 'UPDATE users SET username = ?, role_id = ?, status = ? WHERE id = ?';
  db.query(query, [username, roleId, status, id], (err, result) => {
      if (err) {
          console.error('Error updating user:', err);
          return res.status(500).json({ error: 'Error updating user' });
      }
      res.json({ id, username, roleId, status });
  });
});

app.delete('/users/:id', (req, res) => {
  const { id } = req.params;

  const query = 'DELETE FROM users WHERE id = ?';
  db.query(query, [id], (err) => {
      if (err) {
          console.error('Error deleting user:', err);
          return res.status(500).json({ error: 'Error deleting user' });
      }
      res.json({ message: 'User deleted successfully' });
  });
});



app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
