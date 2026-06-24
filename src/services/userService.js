import api from "../api/axiosConfig";

export const getAllUsers = () => {
  return api.get("/users/all");
};

export const updateUserRole = (id, role) => {
  return api.put(`/super-admin/users/${id}/role`, {
    role,
  });
};

export const deleteUser = (userId) => {
  return api.delete(`/super-admin/users/delete/${userId}`);
};

export const createUserByAdmin = (data) => {
  return api.post("/super-admin/users/create", data);
};