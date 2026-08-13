import { useEffect, useState } from "react";
import { CatalogItem, CatalogProduct } from "../data/types/Catalog";

interface ServiceProductSheetProps {
  item: CatalogItem | null;
  onClose: () => void;
  onAdd: (
    selectedProduct: CatalogProduct | null,
    quantity: number,
    totalPrice: number,
  ) => void;
}

export function ServiceProductSheet({
  item,
  onClose,
  onAdd,
}: ServiceProductSheetProps) {
  const [selectedProduct, setSelectedProduct] = useState<CatalogProduct | null>(
    null,
  );

  const [qty, setQty] = useState(1);

  const hasProducts = !!item?.products?.length;

  useEffect(() => {
    if (!item) {
      setSelectedProduct(null);
      setQty(1);
      return;
    }

    setSelectedProduct(item.products?.[0] ?? null);
    setQty(1);
  }, [item]);

  if (!item) return null;

  const unitPrice =
    hasProducts && selectedProduct
      ? selectedProduct.sellingPrice
      : item.defaultPrice;

  const totalPrice = unitPrice * qty;

  const handleConfirm = () => {
    onAdd(selectedProduct, qty, totalPrice);
    onClose();
  };

  return (
    <div
      className="absolute inset-0 z-40 flex flex-col justify-end"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="rounded-t-3xl flex flex-col"
        style={{
          background: "#0f1218",
          border: "1px solid rgba(255,255,255,0.09)",
          maxHeight: "88%",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div
            className="w-10 h-1 rounded-full"
            style={{ background: "rgba(255,255,255,0.15)" }}
          />
        </div>

        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-3 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div>
            <h3 className="text-base font-bold" style={{ color: "#e8eaf0" }}>
              {item.name}
            </h3>
            <p className="text-xs" style={{ color: "#4a5568" }}>
              {item.description || item.category.name}
            </p>
          </div>
          <button onClick={onClose} style={{ color: "#4a5568" }}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Scroll area */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5">
          {/* CONDITIONAL RENDERING: If products exist, display product options selector */}
          {hasProducts ? (
            <div>
              <p
                className="text-xs font-semibold mb-2"
                style={{
                  color: "#4a5568",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                Select Option / Brand
              </p>
              <div className="space-y-2">
                {item.products.map((product) => {
                  const active = selectedProduct?.id === product.id;
                  return (
                    <button
                      key={product.id}
                      onClick={() => setSelectedProduct(product)}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all text-left"
                      style={{
                        background: active
                          ? "rgba(0,212,170,0.08)"
                          : "rgba(255,255,255,0.03)",
                        border: active
                          ? "1px solid rgba(0,212,170,0.22)"
                          : "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{
                            background: active
                              ? "#00d4aa"
                              : "rgba(255,255,255,0.08)",
                            border: "2px solid",
                            borderColor: active
                              ? "#00d4aa"
                              : "rgba(255,255,255,0.15)",
                          }}
                        >
                          {active && (
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ background: "#080a0d" }}
                            />
                          )}
                        </div>
                        <div>
                          <p
                            className="text-sm font-medium"
                            style={{ color: "#e8eaf0" }}
                          >
                            {product.brand} — {product.name}
                          </p>
                          <p className="text-xs" style={{ color: "#6b7a94" }}>
                            {product.compatibleVehicleType} · Stock:{" "}
                            {product.stockQuantity}
                          </p>
                        </div>
                      </div>
                      <p
                        className="text-sm font-bold"
                        style={{
                          color: "#00d4aa",
                          fontFamily: "'JetBrains Mono', monospace",
                        }}
                      >
                        ${product.sellingPrice.toFixed(2)}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            // If no child products, show direct service pricing details
            <div
              className="p-4 rounded-2xl"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <p className="text-xs" style={{ color: "#6b7a94" }}>
                Standard Service Rate
              </p>
              <p
                className="text-xl font-bold mt-1"
                style={{ color: "#00d4aa" }}
              >
                ${item.defaultPrice.toFixed(2)}
              </p>
            </div>
          )}

          {/* Quantity Selector */}
          <div>
            <p
              className="text-xs font-semibold mb-2"
              style={{
                color: "#4a5568",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Quantity ({item.unit})
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  color: "#e8eaf0",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                -
              </button>
              <span
                className="text-lg font-bold"
                style={{
                  color: "#e8eaf0",
                  minWidth: "30px",
                  textAlign: "center",
                }}
              >
                {qty}
              </span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  color: "#e8eaf0",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                +
              </button>
            </div>
          </div>

          {/* Summary Footer Box */}
          <div
            className="p-4 rounded-2xl flex items-center justify-between"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div>
              <p className="text-xs" style={{ color: "#6b7a94" }}>
                Total Cost
              </p>
              <p className="text-xl font-bold" style={{ color: "#00d4aa" }}>
                ${totalPrice.toFixed(2)}
              </p>
            </div>
            <button
              onClick={handleConfirm}
              className="px-6 py-3 rounded-xl font-bold text-sm transition-all"
              style={{ background: "#00d4aa", color: "#080a0d" }}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
