import axios, { type InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/shared/stores/useAuthStore";
import type { ApiResponse } from "./response";

interface RetriableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 10_000,
  // refresh token은 서버가 httpOnly 쿠키로 관리하므로 요청에 쿠키를 포함시킨다.
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const accessToken = useAuthStore.getState().accessToken;
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

const REISSUE_URL = "/api/auth/reissue";

// 401이 동시에 여러 번 터져도 reissue는 한 번만 호출되도록 진행 중인 요청을 공유한다.
let reissuePromise: Promise<string | null> | null = null;

function reissueAccessToken(): Promise<string | null> {
  if (!reissuePromise) {
    reissuePromise = apiClient
      .post<ApiResponse<{ accessToken: string; tokenType: string }>>(REISSUE_URL)
      .then((res) => {
        const accessToken = res.data.data.accessToken;
        useAuthStore.getState().setAccessToken(accessToken);
        return accessToken;
      })
      .catch(() => {
        useAuthStore.getState().clear();
        return null;
      })
      .finally(() => {
        reissuePromise = null;
      });
  }
  return reissuePromise;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined;

    const isReissueCall = originalRequest?.url === REISSUE_URL;
    const shouldRetry =
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isReissueCall;

    if (!shouldRetry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    const newAccessToken = await reissueAccessToken();

    if (!newAccessToken) {
      return Promise.reject(error);
    }

    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
    return apiClient(originalRequest);
  },
);
