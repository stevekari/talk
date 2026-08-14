import api from "./axios";

export function searchUsers(query) {
  if (!query || !query.trim()) return Promise.resolve([]);

  return api
    .get("/users/search", { params: { q: query }, silentAuth: true })
    .then((res) => res.data)
    .catch(() => []);
}

export function getMe() {
  return api.get("/users/me").then((res) => res.data);
}

export function updateProfile(payload) {
  return api
    .put("/users/me", payload, { silentAuth: true })
    .then((res) => res.data);
}
