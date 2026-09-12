import { CartItem } from "../context/CartContext";
import { CatalogItem } from "../data/types/Catalog";
import { InvoiceItemPayload } from "./pos.api";

export interface CartMappingResult {
  items: InvoiceItemPayload[];
  unresolvedItemIds: string[];
  invalidPriceItemIds: string[];
}

const KNOWN_ID_PREFIXES = [
  "item-",
  "service-",
  "part-",
  "product-",
  "package-",
  "pkg-",
  "svc-",
];

function stripKnownPrefix(id: string): string {
  for (const prefix of KNOWN_ID_PREFIXES) {
    if (id.startsWith(prefix)) {
      return id.slice(prefix.length);
    }
  }
  return id;
}

export function mapCartItemsToInvoiceItems(
  cartItems: CartItem[],
  catalog: CatalogItem[],
): CartMappingResult {
  const unresolvedItemIds: string[] = [];
  const invalidPriceItemIds: string[] = [];
  const items: InvoiceItemPayload[] = [];

  const isWithinRange = (price: number, min?: number, max?: number) => {
    if (min !== undefined && price < min) return false;
    if (max !== undefined && price > max) return false;
    return true;
  };

  for (const entry of cartItems) {
    const cleanId = stripKnownPrefix(entry.id);

    if (entry.kind === "part") {
      const parentService = catalog.find((service) =>
        service.products.some((product) => product.id === cleanId),
      );

      if (!parentService) {
        unresolvedItemIds.push(entry.id);
        continue;
      }

      const product = parentService.products.find((p) => p.id === cleanId)!;

      if (product.canCustomizePrice) {
        if (!isWithinRange(entry.price, product.minPrice, product.maxPrice)) {
          invalidPriceItemIds.push(entry.id);
          continue;
        }
      }

      items.push({
        serviceId: parentService.id,
        productId: product.id,
        price: entry.price,
        quantity: entry.qty,
      });
      continue;
    }

    const service = catalog.find((catalogEntry) => catalogEntry.id === cleanId);
    if (!service) {
      unresolvedItemIds.push(entry.id);
      continue;
    }

    if (service.pricingType === "1") {
      if (!isWithinRange(entry.price, service.minPrice, service.maxPrice)) {
        invalidPriceItemIds.push(entry.id);
        continue;
      }
    }

    items.push({
      serviceId: service.id,
      price: entry.price,
      quantity: entry.qty,
    });
  }

  return { items, unresolvedItemIds, invalidPriceItemIds };
}
