import { api } from ".";

export const loginRequest = async (formData) => await api.post("/login", formData);
export const registerRequest = async (formData) => await api.post("/register", formData);
export const verifyRequest = async (formData) => await api.post("/verify", formData);
export const loadMeRequest = async () => await api.get("/me");
export const logoutRequest = async () => await api.get("/logout");
export const updateUserRequest = async (formData) => await api.put("/user/update", formData);
export const changePasswordRequest = async (formData) => await api.put("/user/change-password", formData);
export const forgotPasswordRequest = async (formData) => await api.post("/forgot-password", formData);
export const resetPasswordRequest = async (token, formData) => await api.put(`/reset-password/${token}`, formData);