import api from "../api/axiosConfig";

export const getDevices = (role) => {
  const endpoint =
    role === "SUPER_ADMIN" || role === "DEVELOPER"
      ? "/devices/all"
      : "/devices/my";

  return api.get(endpoint);
};

export const downloadDevicesPdf = async () => {
  const response = await api.get("/pdf/devices", { responseType: "blob" });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "devices.pdf");
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const addDevice = (device) => {
  return api.post("/devices/add", device);
};

export const deleteDevice = (deviceId) => {
  return api.delete(`/devices/delete/${deviceId}`);
};