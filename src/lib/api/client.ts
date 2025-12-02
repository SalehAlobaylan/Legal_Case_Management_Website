/*
 * File: src/lib/api/client.ts
 * Purpose: Create and configure a shared Axios HTTP client for talking to the Fastify backend API.
 * Used by: Data-fetching hooks and services that need authenticated requests with automatic 401 handling.
 */

import axios, { AxiosError, AxiosInstance } from "axios";
import { useAuthStore } from "@/lib/store/auth-store";

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - add token
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

    // Response interceptor - handle errors
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired - logout
          useAuthStore.getState().logout();
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
        }
        return Promise.reject(error);
      }
    );
  }

  getInstance() {
    return this.client;
  }
}

export const apiClient = new ApiClient().getInstance();
