import api from "../api/axiosConfig";

export const getAllUsers = () => {
  return api.get("/users/all");
};

export const downloadUsersPdf = async () => {
  const response = await api.get("/pdf/users", { responseType: "blob" });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "users.pdf");
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
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