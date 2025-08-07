import axios from "axios";

const base = process.env.REACT_APP_API_URL || "http://localhost:2025";

// Create Axios instances
const AuthAPI = axios.create({ baseURL: `${base}/api/v1` });
const API = axios.create({ baseURL: `${base}/api` });

// Attach access token to all requests
[AuthAPI, API].forEach((instance) => {
  instance.interceptors.request.use((req) => {
    const token = localStorage.getItem("token");
    if (token) req.headers.Authorization = `Bearer ${token}`;
    return req;
  });
});

// Token Refreshing State
let isRefreshing = false;
let refreshSubscribers = [];

const onTokenRefreshed = (newToken) => {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (cb) => {
  refreshSubscribers.push(cb);
};

// Function to refresh access token
const refreshToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) throw new Error("Refresh token not found");

  const res = await AuthAPI.post("/auth/refresh-token", { refreshToken });
  const newAccessToken = res.data.accessToken;
  localStorage.setItem("token", newAccessToken);
  return newAccessToken;
};

// Setup interceptors globally
export const setupInterceptors = (setSessionExpired) => {
  [AuthAPI, API].forEach((instance) => {
    instance.interceptors.response.use(
      (res) => res,
      async (err) => {
        const originalRequest = err.config;

        const isTokenError =
          err?.response?.status === 401 ||
          (err?.response?.status === 400 &&
            err?.response?.data?.message === "Token is not valid");

        if (isTokenError && !originalRequest._retry) {
          originalRequest._retry = true;

          const refreshToken = localStorage.getItem("refreshToken");

          if (!refreshToken) {
            console.warn("🔒 No refresh token. Logging out.");
            setSessionExpired(true);
            return Promise.reject(err);
          }

          try {
            console.log("🔄 Attempting token refresh...");

            const res = await AuthAPI.post("/auth/refresh-token", { refreshToken });

            const newAccessToken = res.data.accessToken;

            // Save new token
            localStorage.setItem("token", newAccessToken);

            // Update header and retry original request
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

            return instance(originalRequest); // Retry request
          } catch (refreshErr) {
            console.error("❌ Refresh token failed:", refreshErr.response?.data);
            setSessionExpired(true);
            return Promise.reject(refreshErr);
          }
        }

        return Promise.reject(err);
      }
    );
  });
};


export { AuthAPI, API };
