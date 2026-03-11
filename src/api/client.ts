import axios from "axios"

// TODO: Replace with real backend URL when available
export const apiClient = axios.create({
  baseURL: "TODO_BACKEND_URL",
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

// TODO: Add response interceptor for error handling and refresh token logic
// apiClient.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     if (error.response?.status === 401) {
//       // TODO: implement refresh token logic
//     }
//     return Promise.reject(error)
//   }
// )
