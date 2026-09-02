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

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface InvoiceDetailDto {
  id: string;
  invoiceNumber: string;
  customerId: string;
  vehicleId: string;
  userId: string;
  odometerAtService?: number;
  status: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  amountPaid: number;
  paymentStatus: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  customer: {
    id: string;
    name: string;
    phone: string;
    email?: string;
    address?: string;
  };
  vehicle: {
    id: string;
    plateNumber: string;
    make?: string;
    model?: string;
    year?: number;
    vehicleType?: string;
    odometerReading: number;
  };
  invoiceItems: Array<{
    id: string;
    serviceId?: string;
    productId?: string;
    brandSnapshot?: string;
    nameSnapshot: string;
    priceSnapshot: number;
    quantity: number;
    lineTotal: number;
  }>;
  payments: Array<{
    id: string;
    amount: number;
    method: number;
    paidAt: string;
    referenceNo?: string;
  }>;
}

export interface PosDashboardInvoicesResponse {
  todayInvoices: InvoiceDetailDto[];
  weeklyInvoices: PagedResult<InvoiceDetailDto>;
  monthlyInvoices: PagedResult<InvoiceDetailDto>;
  allTimeDuePayments: InvoiceDetailDto[];
}

export async function getInvoiceOverviewApi(
  weeklyPage = 1,
  weeklyPageSize = 10,
  monthlyPage = 1,
  monthlyPageSize = 10,
  token?: string,
): Promise<PosDashboardInvoicesResponse> {
  const queryParams = new URLSearchParams({
    weeklyPage: weeklyPage.toString(),
    weeklyPageSize: weeklyPageSize.toString(),
    monthlyPage: monthlyPage.toString(),
    monthlyPageSize: monthlyPageSize.toString(),
  });

  try {
    const result = await apiClient<PosDashboardInvoicesResponse>(
      `/pos/invoices/overview?${queryParams.toString()}`,
      {
        method: "GET",
        token,
      },
    );
    return result;
  } catch (err) {
    console.log("[pos_api] getInvoiceOverviewApi threw:", err);
    throw err;
  }
}

export interface UpdateInvoicePaymentPayload {
  amountPaid: number;
  paymentStatus: number;
}

export async function updateInvoicePaymentApi(
  invoiceId: string,
  payload: UpdateInvoicePaymentPayload,
  token?: string,
): Promise<any> {
  console.log(
    `[pos_api] updateInvoicePaymentApi called for invoice: ${invoiceId}`,
  );
  try {
    const result = await apiClient<any>(`/pos/invoices/${invoiceId}/payment`, {
      method: "PUT",
      body: JSON.stringify(payload),
      token,
    });
    console.log("[pos_api] updateInvoicePaymentApi succeeded:", result);
    return result;
  } catch (err) {
    console.log("[pos_api] updateInvoicePaymentApi threw:", err);
    throw err;
  }
}

export interface VehicleCustomerDto {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
}

export interface VehicleWithCustomerDto {
  id: string;
  plateNumber: string;
  make?: string;
  model?: string;
  year?: number;
  vehicleType?: string;
  odometerReading: number;
  customer: VehicleCustomerDto;
}

export async function getAllVehiclesWithCustomerApi(
  token?: string,
): Promise<VehicleWithCustomerDto[]> {
  try {
    const result = await apiClient<VehicleWithCustomerDto[]>("/pos/vehicles", {
      method: "GET",
      token,
    });
    return result;
  } catch (err) {
    console.log("[pos_api] getAllVehiclesWithCustomerApi threw:", err);
    throw err;
  }
}
export interface PosInvoiceItemDto {
  id: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface CustomerInvoiceSummaryDto {
  id: string;
  invoiceNumber: string;
  status: string;
  total: number;
  amountPaid: number;
  paymentStatus: string;
  notes?: string;
  createdAt: string;
  items: PosInvoiceItemDto[];
}

export interface CustomerVehicleWithInvoicesDto {
  id: string;
  plateNumber: string;
  make?: string;
  model?: string;
  year?: number;
  vehicleType?: string;
  odometerReading: number;
  invoices: CustomerInvoiceSummaryDto[];
}

export interface CustomerDetailDto {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
  vehicles: CustomerVehicleWithInvoicesDto[];
}

export async function getAllCustomersApi(
  page = 1,
  pageSize = 10,
  token?: string,
): Promise<PagedResult<CustomerDetailDto>> {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
  });

  try {
    const result = await apiClient<PagedResult<CustomerDetailDto>>(
      `/pos/customers?${queryParams.toString()}`,
      {
        method: "GET",
        token,
      },
    );
    return result;
  } catch (err) {
    console.log("[pos_api] getAllCustomersApi threw:", err);
    throw err;
  }
}
