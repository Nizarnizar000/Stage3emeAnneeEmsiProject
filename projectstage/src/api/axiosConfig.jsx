import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8081/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API error:", error.config?.method, error.config?.url, error.response?.status, error.response?.data);

    if (error.response?.status === 401 || error.response?.status === 403) {
      const hasToken = !!localStorage.getItem("token");
      // Ne déconnecte que si on avait vraiment un token invalide/expiré,
      // pas juste parce qu'une requête a échoué pour une autre raison.
      if (hasToken) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;