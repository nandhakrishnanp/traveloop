import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://super-duper-enigma-xxv99jxr44wfpqqp-8080.app.github.dev/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add JWT token
axiosInstance.interceptors.request.use(
  (config) => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default axiosInstance;
