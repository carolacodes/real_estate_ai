import axios from "axios";
import { resolveApiBaseUrl } from "./baseUrl.js";

const api = axios.create({
  baseURL: resolveApiBaseUrl(
    import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:3000/api" : undefined),
    import.meta.env.DEV,
  ),

  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error?.message ||
      error.message ||
      "Something went wrong";

    const apiError = new Error(message);
    apiError.status = error.response?.status;
    return Promise.reject(apiError);
  }
);

export default api;
