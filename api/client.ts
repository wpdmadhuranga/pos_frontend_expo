const API_BASE_URL = "http://localhost:5264/api";

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
  const { token, headers, ...customOptions } = options;

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
