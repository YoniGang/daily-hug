const BASE = "http://localhost:3001/api";

async function request(path, options = {}) {
  const token = localStorage.getItem("dailyhug_token");
  const headers = options.headers || { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  if (res.status === 401 && !path.startsWith("/auth/")) {
    localStorage.removeItem("dailyhug_token");
    window.location.reload();
    throw new Error("Unauthorized");
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `API ${res.status}: ${path}`);
  }
  return res.json();
}

// Auth
export const authRegister = (email, password, name) =>
  request("/auth/register", { method: "POST", body: JSON.stringify({ email, password, name }) });
export const authLogin = (email, password) =>
  request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
export const getMe = () => request("/me");
export const pairPartner = (partnerEmail) =>
  request("/pair", { method: "POST", body: JSON.stringify({ partnerEmail }) });

// Admin
export const adminGetUsers = () => request("/admin/users");
export const adminUpdateUser = (id, data) =>
  request(`/admin/users/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const adminResetPassword = (id, newPassword) =>
  request(`/admin/users/${id}/password`, { method: "PUT", body: JSON.stringify({ newPassword }) });
export const adminDeleteUser = (id) =>
  request(`/admin/users/${id}`, { method: "DELETE" });

// Feed
export const getFeed = () => request("/feed");
export const addFeedPost = (post) =>
  request("/feed", { method: "POST", body: JSON.stringify(post) });

// Happy Jar
export const getHappyJar = () => request("/happy-jar");
export const addHappyJarItem = (item) =>
  request("/happy-jar", { method: "POST", body: JSON.stringify(item) });
export const deleteHappyJarItem = (id) =>
  request(`/happy-jar/${id}`, { method: "DELETE" });

// Gratitude
export const getGratitude = () => request("/gratitude");
export const addGratitudeEntry = (items) =>
  request("/gratitude", { method: "POST", body: JSON.stringify({ items }) });
export const updateGratitudeEntry = (id, items) =>
  request(`/gratitude/${id}`, { method: "PUT", body: JSON.stringify({ items }) });

// Notes
export const getNotes = () => request("/notes");
export const addNote = (text, color) =>
  request("/notes", { method: "POST", body: JSON.stringify({ text, color }) });
export const updateNote = (id, text, color) =>
  request(`/notes/${id}`, { method: "PUT", body: JSON.stringify({ text, color }) });
export const deleteNote = (id) =>
  request(`/notes/${id}`, { method: "DELETE" });
export const reorderNotes = (orderedIds) =>
  request("/notes/reorder", { method: "PUT", body: JSON.stringify({ orderedIds }) });

// SOS Sentences
export const getSosSentences = () => request("/sos-sentences");

// Reset
export const resetAll = (data) =>
  request("/reset", { method: "POST", body: JSON.stringify(data) });

// Partner (Send Love)
export function sendPartnerDaily(content, emoji, imageBlob) {
  if (!imageBlob) {
    return request("/partner/daily", { method: "POST", body: JSON.stringify({ content, emoji }) });
  }
  const fd = new FormData();
  fd.append("content", content);
  if (emoji) fd.append("emoji", emoji);
  fd.append("image", imageBlob, "photo.jpg");
  return request("/partner/daily", { method: "POST", body: fd, headers: {} });
}

export function sendPartnerJar(item, imageBlob) {
  if (!imageBlob) {
    return request("/partner/jar", { method: "POST", body: JSON.stringify(item) });
  }
  const fd = new FormData();
  for (const [k, v] of Object.entries(item)) fd.append(k, v);
  fd.append("image", imageBlob, "photo.jpg");
  // Let browser set Content-Type with boundary
  return request("/partner/jar", { method: "POST", body: fd, headers: {} });
}

export function sendPartnerFeed(post, imageBlob) {
  if (!imageBlob) {
    return request("/partner/feed", { method: "POST", body: JSON.stringify(post) });
  }
  const fd = new FormData();
  for (const [k, v] of Object.entries(post)) fd.append(k, v);
  fd.append("image", imageBlob, "photo.jpg");
  return request("/partner/feed", { method: "POST", body: fd, headers: {} });
}
