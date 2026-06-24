import api from "../api/axiosConfig";

export const register = (data) => {
  return api.post("/auth/register", data);
};

export const login = (data) => {
  return api.post("/auth/login", data);
};

export const getCurrentUser = () => {
  return api.get("/users");
};