// src/api/pos.api.ts

import { CatalogItem } from "../data/types/Catalog";
import { apiClient } from "./client";

/**
 * Fetch all catalog items, services, and associated products for the POS screen.
 * Endpoint: GET /admin/services
 */
export async function getPosCatalogApi(token?: string): Promise<CatalogItem[]> {
  // If your endpoint requires authentication, pass the token option
  return apiClient<CatalogItem[]>("/admin/services", {
    method: "GET",
    token, // Optional: pass if authentication is required for this route
  });
}
