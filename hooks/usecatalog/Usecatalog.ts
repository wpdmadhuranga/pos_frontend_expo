import { useCallback, useEffect, useState } from "react";
import { getPosCatalogApi } from "../../api/pos.api";
import { CatalogItem } from "../../data/types/Catalog";

export function useCatalog() {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCatalog = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getPosCatalogApi();
      setItems(data);
    } catch (err: any) {
      setError(err.message || "Failed to load POS catalog");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  return { items, loading, error, refresh: fetchCatalog };
}
