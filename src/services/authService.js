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

export const loginWithOtp = (data) => {
  return api.post("/auth/login-otp", data);
};

export const verifyOtp = (data) => {
  return api.post("/auth/verify-otp", data);
};

export const resendOtp = (email) => {
  return api.post("/auth/resend-otp", { email });
};