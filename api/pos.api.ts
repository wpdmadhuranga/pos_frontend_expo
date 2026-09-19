import AsyncStorage from "@react-native-async-storage/async-storage";
import { CatalogItem } from "../data/types/Catalog";
import { apiClient } from "./client";

const POS_CATALOG_KEY = "pos_catalog";

export async function getPosCatalogApi(token?: string): Promise<CatalogItem[]> {
  return apiClient<CatalogItem[]>("/admin/services", {
    method: "GET",
    token,
  });
}

export async function clearPosCatalogCache(): Promise<void> {
  try {
    await AsyncStorage.removeItem(POS_CATALOG_KEY);
    console.log("[pos_api] pos_catalog cache cleared");
  } catch (error) {
    console.error("[pos_api] Failed to clear pos_catalog cache:", error);
  }
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
  odometerReading?: number;
}

export interface InvoiceInitialPaymentPayload {
  amount: number;
  method: PaymentMethodCode;
  paidAt: string;
  referenceNo?: string;
}

export interface CreateInvoicePayload {
  userId: string;
  customerId?: string;
  customer?: InvoiceCustomerPayload;
  vehicleId?: string;
  vehicle?: InvoiceVehiclePayload;
  odometerAtService?: number;
  notes?: string;
  items: InvoiceItemPayload[];
  initialPayment?: InvoiceInitialPaymentPayload;
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

    await clearPosCatalogCache();

    console.log("[pos_api] pos_catalog cache removed after invoice creation");

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

  customerId?: string | null;
  vehicleId?: string | null;

  userId: string;

  odometerAtService?: number | null;

  status: string;

  subtotal: number;
  discount: number;
  tax: number;
  total: number;

  amountPaid: number;
  paymentStatus: string;

  notes?: string | null;

  createdAt: string;
  updatedAt: string;

  customer?: {
    id: string;
    name: string;
    phone: string;
    email?: string | null;
    address?: string | null;
  } | null;

  vehicle?: {
    id: string;
    plateNumber: string;
    make?: string | null;
    model?: string | null;
    year?: number | null;
    vehicleType?: string | null;
    odometerReading: number;
  } | null;

  items: Array<{
    id: string;
    serviceId?: string | null;
    productId?: string | null;
    brandSnapshot?: string | null;
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
    referenceNo?: string | null;
  }>;
}

export interface DailyRevenueDto {
  date: string;
  revenue: number;
}

export interface PosDashboardInvoicesResponse {
  todayInvoices: InvoiceDetailDto[];
  todayRevenue: number;
  weeklyRevenue: number;
  weeklyRevenueByDay: DailyRevenueDto[];
  monthlyRevenue: number;
  allTimeDuePayments: InvoiceDetailDto[];
  duePaymentsRevenue: number;
}

export async function getInvoiceOverviewApi(
  token?: string,
): Promise<PosDashboardInvoicesResponse> {
  try {
    const result = await apiClient<PosDashboardInvoicesResponse>(
      "/pos/invoices/overview",
      {
        method: "GET",
        token,
      },
    );

    return result;
  } catch (err) {
    throw err;
  }
}

export interface UpdateInvoicePaymentPayload {
  amount: number;
}

export async function updateInvoicePaymentApi(
  invoiceId: string,
  payload: UpdateInvoicePaymentPayload,
  token?: string,
): Promise<any> {
  try {
    const result = await apiClient<any>(`/pos/invoices/${invoiceId}/payment`, {
      method: "PUT",
      body: JSON.stringify(payload),
      token,
    });
    return result;
  } catch (err) {
    throw err;
  }
}
export interface PosCustomerVehicleDto {
  id: string;
  plateNumber: string;
  make?: string | null;
  model?: string | null;
  year?: number | null;
  vehicleType?: string | null;
  odometerReading: number;
}
export interface PosCustomerWithVehiclesDto {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
  vehicles: PosCustomerVehicleDto[];
}
export async function getAllCustomersWithVehiclesApi(
  token?: string,
): Promise<PosCustomerWithVehiclesDto[]> {
  try {
    const result = await apiClient<PosCustomerWithVehiclesDto[]>(
      "/pos/customers/vehicles",
      { method: "GET", token },
    );
    return result;
  } catch (err) {
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
  notes?: string | null;
  createdAt: string;

  items: PosInvoiceItemDto[];
}

export interface CustomerVehicleWithInvoicesDto {
  id: string;
  plateNumber: string;

  make?: string | null;
  model?: string | null;
  year?: number | null;
  vehicleType?: string | null;

  odometerReading: number;
  totalInvoiceCount: number;

  invoices: CustomerInvoiceSummaryDto[];
}

export interface CustomerDetailDto {
  id: string;
  name: string;
  phone: string;

  email?: string | null;
  address?: string | null;
  notes?: string | null;

  vehicles: CustomerVehicleWithInvoicesDto[];

  noVehicleInvoiceCount: number;

  invoicesWithoutVehicle: CustomerInvoiceSummaryDto[];
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
    throw err;
  }
}

export interface PosInvoiceDetailDto {
  id: string;
  invoiceNumber: string;
  customerId?: string | null;
  vehicleId?: string | null;
  userId: string;
  odometerAtService?: number | null;
  status: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  amountPaid: number;
  paymentStatus: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  customer?: {
    id: string;
    name: string;
    phone: string;
    email?: string | null;
    address?: string | null;
  } | null;
  vehicle?: {
    id: string;
    plateNumber: string;
    make?: string | null;
    model?: string | null;
    year?: number | null;
    vehicleType?: string | null;
    odometerReading: number;
  } | null;
  items: any[];
  payments: any[];
}

export interface PagedResultDto<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface SearchInvoicesParams {
  customerName?: string;
  plateNumber?: string;
  date?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  pageSize?: number;
}

export async function searchInvoicesApi(
  params: SearchInvoicesParams,
  token?: string,
): Promise<PagedResult<InvoiceDetailDto>> {
  const query = new URLSearchParams();

  if (params.customerName) query.append("customerName", params.customerName);
  if (params.plateNumber) query.append("plateNumber", params.plateNumber);
  if (params.date) query.append("date", params.date);
  if (params.fromDate) query.append("fromDate", params.fromDate);
  if (params.toDate) query.append("toDate", params.toDate);
  if (params.page) query.append("page", String(params.page));
  if (params.pageSize) query.append("pageSize", String(params.pageSize));

  try {
    const result = await apiClient<PagedResult<InvoiceDetailDto>>(
      `/pos/invoices/search?${query.toString()}`,
      {
        method: "GET",
        token,
      },
    );

    return result;
  } catch (err) {
    throw err;
  }
}
export interface CancelInvoiceResponse {
  message?: string;
  success?: boolean;
  [key: string]: unknown;
}

export async function cancelInvoiceApi(
  invoiceId: string,
  token?: string,
): Promise<CancelInvoiceResponse> {
  try {
    const result = await apiClient<CancelInvoiceResponse>(
      `/pos/invoices/${invoiceId}/cancel`,
      {
        method: "POST",
        token,
      },
    );

    await clearPosCatalogCache();

    console.log(
      "[pos_api] pos_catalog cache removed after invoice cancellation",
    );

    return result;
  } catch (err) {
    console.log("[pos_api] cancelInvoiceApi threw:", err);
    throw err;
  }
}
