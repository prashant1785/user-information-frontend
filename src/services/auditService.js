import api from "../api/axiosConfig";

export const getAuditLogs = (requestBody) => {
  return api.post("/audit/logs", requestBody);
};