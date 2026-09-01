import AsyncStorage from "@react-native-async-storage/async-storage";

import { CatalogItem } from "../data/types/Catalog";

const AUTH_SESSION_KEY = "authSession";
const POS_CATALOG_KEY = "pos_catalog";

export interface AuthSession {
  token: string;
  userId: string;
  name: string;
  role: string;
  expiresAt: string;
}

export async function getAuthSession(): Promise<AuthSession | null> {
  const raw = await AsyncStorage.getItem(AUTH_SESSION_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export async function setAuthSession(session: AuthSession): Promise<void> {
  await AsyncStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
}

export async function clearAuthSession(): Promise<void> {
  await AsyncStorage.removeItem(AUTH_SESSION_KEY);
}

export async function getCachedCatalog(): Promise<CatalogItem[]> {
  const raw = await AsyncStorage.getItem(POS_CATALOG_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CatalogItem[]) : [];
  } catch {
    return [];
  }
}

export async function setCachedCatalog(catalog: CatalogItem[]): Promise<void> {
  await AsyncStorage.setItem(POS_CATALOG_KEY, JSON.stringify(catalog));
}
