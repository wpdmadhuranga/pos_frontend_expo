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

  const isWithinRange = (
    price: number,
    min?: number | null,
    max?: number | null,
  ) => {
    if (min != null && price < min) {
      return false;
    }

    if (max != null && price > max) {
      return false;
    }

    return true;
  };

  console.log(
    "[cartInvoiceMapping] Catalog loaded:",
    catalog.length,
    "services",
  );

  for (const entry of cartItems) {
    const cleanId = stripKnownPrefix(entry.id);

    console.log("[cartInvoiceMapping] Checking cart item:", {
      id: entry.id,
      cleanId,
      name: entry.name,
      kind: entry.kind,
      price: entry.price,
      quantity: entry.qty,
    });

    // -----------------------------
    // PRODUCT / PART
    // -----------------------------
    if (entry.kind === "part") {
      let parentService: CatalogItem | undefined;
      let matchedProduct: CatalogItem["products"][number] | undefined;

      for (const service of catalog) {
        const products = service.products ?? [];

        const product = products.find((p) => p.id === cleanId);

        if (product) {
          parentService = service;
          matchedProduct = product;
          break;
        }
      }

      if (!parentService || !matchedProduct) {
        console.error("[cartInvoiceMapping] PRODUCT NOT FOUND", {
          cartId: entry.id,
          cleanId,
          cartName: entry.name,
          catalogProductIds: catalog.flatMap((service) =>
            (service.products ?? []).map((product) => product.id),
          ),
        });

        unresolvedItemIds.push(entry.id);
        continue;
      }

      console.log("[cartInvoiceMapping] Product matched:", {
        productId: matchedProduct.id,
        productName: matchedProduct.name,
        serviceId: parentService.id,
        serviceName: parentService.name,
      });

      if (matchedProduct.canCustomizePrice) {
        const validPrice = isWithinRange(
          entry.price,
          matchedProduct.minPrice,
          matchedProduct.maxPrice,
        );

        if (!validPrice) {
          console.error("[cartInvoiceMapping] Product price invalid:", {
            productId: matchedProduct.id,
            price: entry.price,
            minPrice: matchedProduct.minPrice,
            maxPrice: matchedProduct.maxPrice,
          });

          invalidPriceItemIds.push(entry.id);
          continue;
        }
      }

      items.push({
        serviceId: parentService.id,
        productId: matchedProduct.id,
        price: entry.price,
        quantity: entry.qty,
      });

      continue;
    }

    const service = catalog.find((catalogEntry) => catalogEntry.id === cleanId);

    if (!service) {
      console.error("[cartInvoiceMapping] SERVICE NOT FOUND", {
        cartId: entry.id,
        cleanId,
        cartName: entry.name,
        catalogServiceIds: catalog.map((service) => service.id),
      });

      unresolvedItemIds.push(entry.id);
      continue;
    }

    console.log("[cartInvoiceMapping] Service matched:", {
      serviceId: service.id,
      serviceName: service.name,
    });

    if (service.pricingType === "1") {
      const validPrice = isWithinRange(
        entry.price,
        service.minPrice,
        service.maxPrice,
      );

      if (!validPrice) {
        console.error("[cartInvoiceMapping] Service price invalid:", {
          serviceId: service.id,
          serviceName: service.name,
          price: entry.price,
          minPrice: service.minPrice,
          maxPrice: service.maxPrice,
        });

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

  console.log("[cartInvoiceMapping] Mapping completed:", {
    cartItemCount: cartItems.length,
    invoiceItemCount: items.length,
    unresolvedItemIds,
    invalidPriceItemIds,
  });

  return {
    items,
    unresolvedItemIds,
    invalidPriceItemIds,
  };
}
