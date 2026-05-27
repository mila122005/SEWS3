import axios from "axios";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000/api";

export const registerUser = async (userData) => {
  const response = await axios.post(`${BACKEND}/register`, userData);
  return response.data;
};

export const verifyAccount = async (token) => {
  const response = await axios.get(`${BACKEND}/verify/${token}`);
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await axios.post(`${BACKEND}/forgot-password`, { email });
  return response.data;
};

export const resetPassword = async (token, newPassword) => {
  const response = await axios.post(`${BACKEND}/reset-password/${token}`, { newPassword });
  return response.data;
};

export const googleSignIn = async (idToken) => {
  const response = await axios.post(`${BACKEND}/google`, { idToken });
  return response.data;
};