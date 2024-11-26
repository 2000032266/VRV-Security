import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

export const getUsers = () => {
  return api.get('/users');
};

export const addUser = (user) => {
  return api.post('/users', user);
};

export const getRoles = () => {
  return api.get('/roles');
};

export const addRole = (role) => {
  return api.post('/roles', role);
};
