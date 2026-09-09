import { apiClient } from "./client";

export interface InventoryItemDto {
  id: string;
  name: string;
  sku?: string;
  unitCost?: number;
  sellingPrice?: number;
  quantityOnHand?: number;
  reorderLevel?: number;
  unit?: string;
  linkedCategoryName?: string;
  linkedProductName?: string;
  linkedServiceName?: string;
}

export async function getInventoryApi(
  token?: string,
): Promise<InventoryItemDto[]> {
  console.log("[inventory_api] getInventoryApi called, GET /inventory");
  try {
    const result = await apiClient<InventoryItemDto[]>("/inventory", {
      method: "GET",
      token,
    });
    console.log("[inventory_api] getInventoryApi succeeded:", result);
    return result;
  } catch (err) {
    console.log("[inventory_api] getInventoryApi threw:", err);
    throw err;
  }
}
