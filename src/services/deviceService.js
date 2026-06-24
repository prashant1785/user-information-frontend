import api from "../api/axiosConfig";

export const getDevices = (role) => {
  const endpoint =
    role === "SUPER_ADMIN" || role === "DEVELOPER"
      ? "/devices/all"
      : "/devices/my";

  return api.get(endpoint);
};

export const addDevice = (device) => {
  return api.post("/devices/add", device);
};

export const deleteDevice = (deviceId) => {
  return api.delete(`/devices/delete/${deviceId}`);
};