import axios from 'axios';

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000/api';

export const getAll = async (resource) => {
  const res = await axios.get(`${BACKEND}/${resource}`);
  return res.data;
};

export const getById = async (resource, id) => {
  const res = await axios.get(`${BACKEND}/${resource}/${id}`);
  return res.data;
};

export const getByUserId = async (resource, userId) => {
  const res = await axios.get(`${BACKEND}/${resource}/user/${userId}`);
  return res.data;
};

export const createResource = async (resource, data) => {
  const res = await axios.post(`${BACKEND}/${resource}`, data);
  console.log(`Respuesta del servidor al CREAR ${resource}:`, res.data);
  return res.data;
};

export const updateResource = async (resource, id, data) => {
  const res = await axios.put(`${BACKEND}/${resource}/${id}`, data);
  console.log(`Respuesta del servidor al EDITAR ${resource}:`, res.data);
  return res.data;
};

export const deleteResource = async (resource, id) => {
  const res = await axios.delete(`${BACKEND}/${resource}/${id}`);
  return res.data;
};

export default {getAll, getById, getByUserId, createResource, updateResource, deleteResource 
};