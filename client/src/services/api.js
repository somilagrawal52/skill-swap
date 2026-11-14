import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export default API;
export const createSkill = (title, description) => API.post("/skills/create", { title, description });
export const getAllSkills = () => API.get("/skills/all");
export const getUserSkills = (userId) => API.get(`/skills/user/${userId}`);
export const searchUsersBySkill = (query) =>
  API.get("/skills/search", { params: { q: query } });
export const sendSwapRequest = (toUser, offeredSkill, requestedSkill) =>
  API.post("/requests/send", { toUser, offeredSkill, requestedSkill });

export const getMyRequests = () => API.get("/requests/my");

export const respondSwapRequest = (requestId, status) =>
  API.put(`/requests/respond/${requestId}`, { status });
