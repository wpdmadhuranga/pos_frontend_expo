export interface CatalogCategory {
  id: string;
  name: string;
  sortOrder: number;
}

export interface CatalogProduct {
  id: string;
  brand: string;
  name: string;
  partNumber: string;
  compatibleVehicleType: string | null;
  costPrice: number;
  sellingPrice: number;
  stockQuantity: number;
  unit: string;
  isActive: boolean;
  minPrice?: number;
  maxPrice?: number;
  canCustomizePrice: boolean;
}

export interface CatalogItem {
  id: string;
  name: string;
  description: string;
  defaultPrice: number;
  pricingType: "0" | "1"; // "1" = charge defaultPrice directly, "0" = staff picks a product
  minPrice?: number;
  maxPrice?: number;
  unit: string;
  isActive: boolean;
  sortOrder: number;
  category: CatalogCategory;
  products: CatalogProduct[];
}