import { apiClientWithMeta } from "./client";

interface LoginCredentials {
  phoneOrEmail: string;
  password: string;
}

interface LoginResponseData extends Record<string, unknown> {
  token?: string;
  accessToken?: string;
}

interface LoginApiResult {
  status: number;
  token: string;
  data: LoginResponseData;
}

export async function loginApi(
  credentials: LoginCredentials,
): Promise<LoginApiResult> {
  const response = await apiClientWithMeta<LoginResponseData>("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });

  if (response.status !== 200) {
    throw new Error("Login failed. Invalid response status.");
  }

  const token =
    typeof response.data.token === "string"
      ? response.data.token
      : typeof response.data.accessToken === "string"
        ? response.data.accessToken
        : null;

  if (!token) {
    throw new Error("Login succeeded but no token was returned.");
  }

  return {
    status: response.status,
    token,
    data: response.data,
  };
}
