/*
 * File: src/lib/api/client.ts
 * Purpose: Shared Axios client for the Fastify backend.
 *
 * Responsibilities:
 *  - Inject bearer token from useAuthStore on every request.
 *  - Normalize every error rejection into an `ApiError` so downstream
 *    callers (hooks, mutations, global query cache) can branch on
 *    `error.code` rather than poking at the raw Axios shape.
 *  - Special-case 401 to log out and redirect to /login (existing behaviour).
 */

import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { useAuthStore } from "@/lib/store/auth-store";
import { ApiError } from "./ApiError";

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - inject auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
          config.headers = config.headers ?? {};
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - normalize errors into ApiError
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const apiError = ApiError.fromAxiosError(error);

        // Token-expired / invalid -> hard logout + redirect.
        // Still throw the typed error so callers can branch on .code.
        if (apiError.status === 401) {
          useAuthStore.getState().logout();
          if (typeof window !== "undefined") {
            // Avoid redirect loop if we're already on /login
            if (!window.location.pathname.startsWith("/login")) {
              window.location.href = "/login";
            }
          }
        }

        return Promise.reject(apiError);
      }
    );
  }

  getInstance() {
    return this.client;
  }

  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.get(url, config);
  }

  post<T = any>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.client.post(url, data, config);
  }

  put<T = any>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.client.put(url, data, config);
  }

  patch<T = any>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.client.patch(url, data, config);
  }

  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.delete(url, config);
  }
}

export const apiClient = new ApiClient();
