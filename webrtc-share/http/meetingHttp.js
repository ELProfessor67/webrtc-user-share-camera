import { api } from ".";

export const createRequest = async (formData) => await api.post("/meetings/create", formData);
export const getAllMeetings = async () => await api.get("/meetings/all");
export const getMeetingById = async (id) => await api.get(`/meetings/${id}`);
export const updateMeeting = async (id, formData) => await api.put(`/meetings/${id}`, formData);
export const deleteMeeting = async (id) => await api.delete(`/meetings/${id}`);
