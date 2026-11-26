import axios from "axios";

const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // When hosted on the same origin in production, use relative /api path
  if (import.meta.env.PROD) {
    return "/api";
  }
  return "http://localhost:5000/api";
};

const API = axios.create({
  baseURL: getBaseUrl(),
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;

// ================= AUTH & PROFILE =================
export const loginUser = (email, password) => API.post("/auth/login", { email, password });
export const registerUser = (name, email, password) => API.post("/auth/register", { name, email, password });
export const getMyProfile = () => API.get("/auth/me");
export const updateMyProfile = (profileData) => API.put("/auth/profile", profileData);
export const getUserProfile = (userId) => API.get(`/auth/profile/${userId}`);

// ================= SKILLS =================
export const getAllSkills = (params = {}) => API.get("/skills/all", { params });
export const getUserSkills = (userId) => API.get(`/skills/user/${userId}`);
export const createSkill = (skillData) => API.post("/skills/create", skillData);
export const updateSkill = (id, skillData) => API.put(`/skills/${id}`, skillData);
export const deleteSkill = (id) => API.delete(`/skills/${id}`);
export const searchUsersBySkill = (query) => API.get("/skills/search", { params: { q: query } });
export const getSmartMatches = () => API.get("/skills/matches");

// ================= SWAP REQUESTS =================
export const sendSwapRequest = (toUser, offeredSkill, requestedSkill, message = "", exchangeType = "direct_barter") =>
  API.post("/requests/send", { toUser, offeredSkill, requestedSkill, message, exchangeType });

export const getMyRequests = () => API.get("/requests/incoming");
export const getIncomingRequests = () => API.get("/requests/incoming");
export const getSentRequests = () => API.get("/requests/sent");
export const respondSwapRequest = (requestId, status) =>
  API.put(`/requests/respond/${requestId}`, { status });
export const cancelSwapRequest = (requestId) =>
  API.put(`/requests/cancel/${requestId}`);
export const completeSwapRequest = (requestId) =>
  API.put(`/requests/complete/${requestId}`);
export const updateSessionNotes = (requestId, { sessionNotes, meetingLink }) =>
  API.put(`/requests/notes/${requestId}`, { sessionNotes, meetingLink });

// ================= REVIEWS =================
export const createReview = (swapRequestId, rating, comment) =>
  API.post("/reviews", { swapRequestId, rating, comment });
export const getUserReviews = (userId) => API.get(`/reviews/user/${userId}`);

// ================= NOTIFICATIONS =================
export const getNotifications = () => API.get("/notifications");
export const markNotificationRead = (id) => API.put(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => API.put("/notifications/read-all");

// ================= USERS / COMMUNITY =================
export const getCommunityUsers = (params = {}) => API.get("/users", { params });
