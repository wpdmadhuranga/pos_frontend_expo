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
  amount: number;
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
  email?: string | null;
  address?: string | null;
  notes?: string | null;
}

export interface VehicleWithCustomerDto {
  id: string;
  plateNumber: string;
  make?: string | null;
  model?: string | null;
  year?: number | null;
  vehicleType?: string | null;
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

  console.log(
    `[pos_api] getAllCustomersApi: page=${page}, pageSize=${pageSize}`,
  );

  try {
    const result = await apiClient<PagedResult<CustomerDetailDto>>(
      `/pos/customers?${queryParams.toString()}`,
      {
        method: "GET",
        token,
      },
    );

    console.log("[pos_api] getAllCustomersApi succeeded:", {
      page: result.page,
      pageSize: result.pageSize,
      totalCount: result.totalCount,
      totalPages: result.totalPages,
      returnedItems: result.items.length,
    });

    return result;
  } catch (err) {
    console.log("[pos_api] getAllCustomersApi threw:", err);

    throw err;
  }
}

// types (add if not already present)
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
  date?: string; // YYYY-MM-DD
  fromDate?: string; // YYYY-MM-DD
  toDate?: string; // YYYY-MM-DD
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
    console.log("[pos_api] searchInvoicesApi threw:", err);
    throw err;
  }
}

export async function cancelInvoiceApi(
  invoiceId: string,
  token?: string,
): Promise<void> {
  console.log(`[pos_api] cancelInvoiceApi called for invoice: ${invoiceId}`);

  try {
    await apiClient<void>(`/pos/invoices/${invoiceId}/cancel`, {
      method: "POST",
      token,
    });

    console.log("[pos_api] cancelInvoiceApi succeeded");
  } catch (err) {
    console.log("[pos_api] cancelInvoiceApi threw:", err);
    throw err;
  }
}
