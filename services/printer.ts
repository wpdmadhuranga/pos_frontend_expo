import { PaymentMethod } from "../components/CartSheet";
import { CartItem } from "../context/CartContext";

export interface InvoiceData {
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  timestamp: string;
}

/**
 * Stub for Bluetooth thermal-printer invoice printing.
 *
 * Future work: wire this up to a Bluetooth ESC/POS printer library
 * (e.g. react-native-bluetooth-escpos-printer, react-native-thermal-receipt-printer,
 * or a native module), format `invoice` into ESC/POS commands, and send over
 * the paired device's Bluetooth serial connection.
 *
 * Kept async + Promise-returning now so call sites don't need to change
 * when real printing is added — just fill in the body below.
 */
export async function printInvoice(invoice: InvoiceData): Promise<void> {
  // TODO: replace with real Bluetooth ESC/POS printing.
  console.log("[printer] Printing invoice (stub):", invoice);
}