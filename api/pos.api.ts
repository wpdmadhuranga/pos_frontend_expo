import { CatalogItem } from "../data/types/Catalog";
import { apiClient } from "./client";

export async function getPosCatalogApi(token?: string): Promise<CatalogItem[]> {
  return apiClient<CatalogItem[]>("/admin/services", {
    method: "GET",
    token,
  });
}

export const PAYMENT_METHOD_CODE = {
  cash: 0,
  card: 1,
  bank: 2,
} as const;

export type PaymentMethodCode =
  (typeof PAYMENT_METHOD_CODE)[keyof typeof PAYMENT_METHOD_CODE];

export interface InvoiceItemPayload {
  serviceId: string;
  productId?: string;
  price?: number;
  quantity: number;
}

export interface InvoiceCustomerPayload {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
}

export interface InvoiceVehiclePayload {
  plateNumber: string;
  make: string;
  model: string;
  year: number;
  vehicleType: string;
  odometerReading: number;
}

export interface InvoiceInitialPaymentPayload {
  amount: number;
  method: PaymentMethodCode;
  paidAt: string;
  referenceNo?: string;
}

export interface CreateInvoicePayload {
  userId: string;
  customer: InvoiceCustomerPayload;
  vehicle: InvoiceVehiclePayload;
  odometerAtService: number;
  notes?: string;
  items: InvoiceItemPayload[];
  initialPayment: InvoiceInitialPaymentPayload;
}

export interface CreateInvoiceResponse extends Record<string, unknown> {
  id?: string;
  invoiceNumber?: string;
}

export async function createInvoiceApi(
  payload: CreateInvoicePayload,
  token?: string,
): Promise<CreateInvoiceResponse> {
  console.log(
    "[pos_api] createInvoiceApi called, POST /pos/invoices, token present:",
    !!token,
  );
  try {
    const result = await apiClient<CreateInvoiceResponse>("/pos/invoices", {
      method: "POST",
      body: JSON.stringify(payload),
      token,
    });
    console.log("[pos_api] createInvoiceApi succeeded:", result);
    return result;
  } catch (err) {
    console.log("[pos_api] createInvoiceApi threw:", err);
    throw err;
  }
}
