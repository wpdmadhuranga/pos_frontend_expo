import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

import { getPosCatalogApi } from "../../api/pos.api";
import { CatalogItem } from "../../data/types/Catalog";

const CATALOG_STORAGE_KEY = "pos_catalog";

export function useCatalog() {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCatalog = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("[useCatalog] Fetching catalog from API...");

      const data = await getPosCatalogApi();

      if (!Array.isArray(data)) {
        throw new Error("Invalid catalog response");
      }

      await AsyncStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(data));

      setItems(data);

      console.log("[useCatalog] Catalog refreshed:", data.length, "services");

      return data;
    } catch (err: any) {
      console.error("[useCatalog] Failed to fetch catalog:", err);

      setError(err?.message || "Failed to load POS catalog");

      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCatalog = useCallback(async () => {
    try {
      setError(null);

      const cachedCatalog = await AsyncStorage.getItem(CATALOG_STORAGE_KEY);

      if (cachedCatalog) {
        try {
          const parsedCatalog: CatalogItem[] = JSON.parse(cachedCatalog);

          if (Array.isArray(parsedCatalog)) {
            setItems(parsedCatalog);
            setLoading(false);

            console.log(
              "[useCatalog] Loaded catalog from cache:",
              parsedCatalog.length,
              "services",
            );
          }
        } catch (error) {
          console.error("[useCatalog] Failed to parse cached catalog:", error);

          await AsyncStorage.removeItem(CATALOG_STORAGE_KEY);
        }
      }

      await fetchCatalog();
    } catch (err: any) {
      console.error("[useCatalog] loadCatalog failed:", err);

      setError(err?.message || "Failed to load POS catalog");
      setLoading(false);
    }
  }, [fetchCatalog]);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  return {
    items,
    loading,
    error,

    refresh: fetchCatalog,
    reload: loadCatalog,
  };
}
