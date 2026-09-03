import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

const API_BASE_URL = "http://192.168.8.145:5264/api";
const AUTH_STORAGE_KEY = "authSession";

interface RequestOptions extends RequestInit {
  token?: string;
}

export interface ApiResponse<T> {
  status: number;
  data: T;
}

async function parseJsonResponse(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<ApiResponse<T>> {
  let { token, headers, ...customOptions } = options;

  if (!token) {
    try {
      const raw = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (raw) {
        const payload = JSON.parse(raw);
        token = payload.token || payload.accessToken;
      }
    } catch (e) {
      console.warn("[client] Failed to auto-load token from storage", e);
    }
  }

  const headersMap: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };

  console.log(
    "[client] →",
    customOptions.method || "GET",
    `${API_BASE_URL}${endpoint}`,
    {
      headers: headersMap,
      body: customOptions.body,
    },
  );

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...customOptions,
    headers: headersMap,
  });

  console.log("[client] ←", response.status, `${API_BASE_URL}${endpoint}`);

  if (response.status === 401) {
    console.warn(
      "[client] 401 Unauthorized detected. Clearing session and redirecting...",
    );
    try {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      router.replace("/login");
    } catch (e) {
      console.error(
        "[client] Failed to clear auth session or redirect on 401",
        e,
      );
    }
  }

  const data = (await parseJsonResponse(response)) as T;
  console.log("[client] response body:", data);

  if (!response.ok) {
    const errorData = data as { message?: string };
    throw new Error(
      errorData?.message || "Something went wrong with the API request.",
    );
  }

  return {
    status: response.status,
    data,
  };
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const response = await request<T>(endpoint, options);
  return response.data;
}

export async function apiClientWithMeta<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<ApiResponse<T>> {
  return request<T>(endpoint, options);
}
