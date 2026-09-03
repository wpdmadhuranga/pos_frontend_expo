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

      const data = await getPosCatalogApi();

      await AsyncStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(data));

      setItems(data);
    } catch (err: any) {
      setError(err.message || "Failed to load POS catalog");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadCachedCatalog = async () => {
      const cachedCatalog = await AsyncStorage.getItem(CATALOG_STORAGE_KEY);

      if (cachedCatalog) {
        try {
          const parsedCatalog: CatalogItem[] = JSON.parse(cachedCatalog);
          setItems(parsedCatalog);
          setLoading(false);
        } catch (error) {
          console.error("Failed to parse cached catalog:", error);
          await AsyncStorage.removeItem(CATALOG_STORAGE_KEY);
        }
      }

      fetchCatalog();
    };

    loadCachedCatalog();
  }, [fetchCatalog]);

  return {
    items,
    loading,
    error,
    refresh: fetchCatalog,
  };
}
