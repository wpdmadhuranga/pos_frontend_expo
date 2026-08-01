import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, ReactNode, useContext, useState } from "react";

const AUTH_STORAGE_KEY = "authSession";

interface AuthPayload extends Record<string, unknown> {
  token?: string;
  accessToken?: string;
}

function extractToken(payload: AuthPayload): string | null {
  if (typeof payload.token === "string") {
    return payload.token;
  }

  if (typeof payload.accessToken === "string") {
    return payload.accessToken;
  }

  return null;
}

interface AuthContextType {
  loggedIn: boolean;
  token: string | null;
  authData: AuthPayload | null;
  signIn: (payload: AuthPayload) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [authData, setAuthData] = useState<AuthPayload | null>(null);

  const signIn = async (payload: AuthPayload) => {
    const nextToken = extractToken(payload);

    if (!nextToken) {
      throw new Error("No token found in login response.");
    }

    setToken(nextToken);
    setAuthData(payload);
    setLoggedIn(true);
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload));
  };

  const signOut = async () => {
    setToken(null);
    setAuthData(null);
    setLoggedIn(false);
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ loggedIn, token, authData, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
