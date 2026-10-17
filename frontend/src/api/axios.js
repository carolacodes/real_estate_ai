import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "http://localhost:3000/api",

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