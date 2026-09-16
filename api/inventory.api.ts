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

export interface StockUpdateResponseDto {
  id?: string;
  productId?: string;
  quantityOnHand?: number;
  quantity?: number;
  note?: string;
  message?: string;
  [key: string]: unknown;
}

export interface CreateInventoryItemPayload {
  name: string;
  sku?: string;
  unit: string;
  quantityOnHand: number;
  reorderLevel: number;
  unitCost: number;
  linkToExistingProductId?: string;
  createAsProduct: boolean;
  productBrand?: string;
  productPartNumber?: string;
  productCompatibleVehicleType?: string;
  productSellingPrice?: number;
  productServiceId?: string;
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

export async function stockInApi(
  id: string,
  payload: { quantity: number; note?: string },
): Promise<StockUpdateResponseDto> {
  console.log("[inventory_api] stockInApi called:", id, payload);
  try {
    const result = await apiClient<StockUpdateResponseDto>(
      `/inventory/${id}/stock-in`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );
    console.log("[inventory_api] stockInApi succeeded:", result);
    return result;
  } catch (err) {
    console.log("[inventory_api] stockInApi threw:", err);
    throw err;
  }
}

export async function stockOutApi(
  id: string,
  payload: { quantity: number; note?: string },
): Promise<StockUpdateResponseDto> {
  console.log("[inventory_api] stockOutApi called:", id, payload);
  try {
    const result = await apiClient<StockUpdateResponseDto>(
      `/inventory/${id}/stock-out`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );
    console.log("[inventory_api] stockOutApi succeeded:", result);
    return result;
  } catch (err) {
    console.log("[inventory_api] stockOutApi threw:", err);
    throw err;
  }
}

export async function createInventoryItemApi(
  payload: CreateInventoryItemPayload,
): Promise<InventoryItemDto> {
  console.log("[inventory_api] createInventoryItemApi called:", payload);
  try {
    const result = await apiClient<InventoryItemDto>("/inventory", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    console.log("[inventory_api] createInventoryItemApi succeeded:", result);
    return result;
  } catch (err) {
    console.log("[inventory_api] createInventoryItemApi threw:", err);
    throw err;
  }
}
