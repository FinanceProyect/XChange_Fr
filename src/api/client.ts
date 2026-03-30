import axios from "axios"
import { showToast } from "../lib/toastBus"

export const apiClient = axios.create({
  baseURL: "/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

// TODO: Add request interceptor to attach auth token
// apiClient.interceptors.request.use((config) => {
//   const token = getAuthToken()
//   if (token) config.headers.Authorization = `Bearer ${token}`
//   return config
// })

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const message =
      error.response?.data?.message ??
      error.message ??
      "Ocurrió un error inesperado";

    showToast({ message, variant: "error" });

    return Promise.reject(error);
  },
)
