import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";
import { LOGO_DATA_URI } from "../constants/logo";

interface InvoiceItem {
  name: string;
  qty: number;
  rate: number;
  amount: number;
}

interface InvoicePayload {
  invoiceNo: string;
  date: string;
  vehicleNo: string;
  odometer: string;
  nextService: string;
  items: InvoiceItem[];
  total: number;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
}

/** Table rows on the printed form; shorter invoices are padded to this. */
const MIN_ROWS = 14;

/** Prevents item names like "Oil & Filter" or "<5W-30>" from breaking the HTML. */
function escapeHtml(value: string): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function money(value: number): string {
  return Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
  });
}

/** Splits an amount into rupees and cents, like the printed Rs. | Cts. columns. */
function splitMoney(value: number): { rs: string; cts: string } {
  const n = Number(value) || 0;
  const [rs, cts] = n.toFixed(2).split(".");
  return { rs: Number(rs).toLocaleString("en-US"), cts };
}

function buildItemsHtml(items: InvoiceItem[]): string {
  const rows = items
    .filter((item) => item.qty > 0)
    .map((item) => {
      const amt = splitMoney(item.amount);
      return `
        <tr>
          <td class="c">${item.qty}</td>
          <td class="desc">${escapeHtml(item.name)}</td>
          <td class="r">${money(item.rate)}</td>
          <td class="r">${amt.rs}</td>
          <td class="c">${amt.cts}</td>
        </tr>`;
    });

  // Pad with empty rows so the invoice looks like the printed book.
  for (let i = rows.length; i < MIN_ROWS; i++) {
    rows.push(
      `<tr><td></td><td class="desc"></td><td></td><td></td><td></td></tr>`,
    );
  }
  return rows.join("");
}

function buildInvoiceHtml(data: InvoicePayload, logoSrc: string): string {
  const itemsHtml = buildItemsHtml(data.items);
  const total = splitMoney(data.total);

  const logoHtml = logoSrc
    ? `<img class="logo" src="${logoSrc}" alt="MSC Logo">`
    : "";

  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <style>
        :root { --blue: #0b2a94; --light: #e8eefb; }
        * { box-sizing: border-box; }
        body {
          font-family: 'Times New Roman', Georgia, serif;
          color: var(--blue);
          margin: 0; padding: 12px; font-size: 13px; background: #fff;
          -webkit-print-color-adjust: exact; print-color-adjust: exact;
        }
        .invoice-box {
          max-width: 720px; margin: auto; padding: 14px;
          border: 3px solid var(--blue); border-radius: 12px;
        }

        /* Header */
.header {
  display: flex; align-items: center; justify-content: center;
  gap: 8px;
  border-bottom: 2px solid var(--blue);
  padding-bottom: 8px; margin-bottom: 12px;
}
.header .logo { width: 70px; height: auto; flex-shrink: 0; }
.header .text { text-align: center; }
.header h1 {
  margin: 0; font-siz e: 30px; font-weight: bold;
  font-variant: small-caps; letter-spacing: 0.5px; line-height: 1.05;
}
.header p { margin: 3px 0 0; font-size: 12px; font-weight: bold; }
        /* Info box */
        .info-box {
          display: flex; border: 1.5px solid var(--blue);
          border-radius: 10px; margin-bottom: 12px;
        }
        .info-col { flex: 1; padding: 8px 12px; }
        .info-col + .info-col { border-left: 1.5px solid var(--blue); }
        .info-row { display: flex; padding: 4px 0; font-weight: bold; font-size: 14px; }
        .info-row .label { width: 95px; }
        .info-row .sep { width: 14px; }
        .info-row .val {
          flex: 1; font-weight: normal;
          border-bottom: 1px dotted var(--blue); min-height: 16px;
        }

        /* Items table */
        .items-table {
          width: 100%; border-collapse: collapse; table-layout: fixed;
          border: 1.5px solid var(--blue);
        }
        .items-table th {
          background: var(--blue); color: #fff; padding: 5px;
          border: 1px solid #fff; font-size: 14px; text-align: center;
        }
        .items-table th.sub { font-size: 11px; padding: 2px; }
        .items-table td {
          border: 1px solid var(--blue); height: 20px; padding: 1px 6px;
          font-size: 12px; font-weight: bold; overflow: hidden;
        }
        .items-table td.desc { padding-left: 14px; }
        .items-table td.c { text-align: center; }
        .items-table td.r { text-align: right; }
        .total-row td { background: var(--light); font-size: 15px; height: 26px; }
        .total-row .label { text-align: center; }

        /* Footer */
        .footer-box {
          border: 1.5px solid var(--blue); border-radius: 10px;
          padding: 8px 14px; margin-top: 12px; font-weight: bold; font-size: 14px;
        }
        .footer-row { display: flex; padding: 4px 0; }
        .footer-row .label { width: 100px; }
        .footer-row .sep { width: 14px; }
        .footer-row .val {
          flex: 1; font-weight: normal;
          border-bottom: 1px dotted var(--blue); min-height: 16px;
        }

        .thank-you {
          text-align: center; margin-top: 14px; font-size: 16px;
          font-style: italic; font-weight: bold;
        }
        .thank-you .stars { font-style: normal; letter-spacing: 8px; margin-top: 2px; }
      </style>
    </head>
    <body>
      <div class="invoice-box">

        <div class="header">
          ${logoHtml}
          <div class="text">
            <h1>Micro Service Centre</h1>
            <p>No.411/1A, Makumbura, Pannipitiya.</p>
            <p>Tel: 011 3154093 / 071 3942436 / 0719842598 (WhatsApp)</p>
          </div>
        </div>

        <div class="info-box">
          <div class="info-col">
            <div class="info-row"><span class="label">Vehicle No</span><span class="sep">:</span><span class="val">${escapeHtml(data.vehicleNo)}</span></div>
            <div class="info-row"><span class="label">Service At</span><span class="sep">:</span><span class="val">${escapeHtml(data.odometer)} km</span></div>
          </div>
          <div class="info-col">
            <div class="info-row"><span class="label">Date</span><span class="sep">:</span><span class="val">${escapeHtml(data.date)}</span></div>
            <div class="info-row"><span class="label">Next Service</span><span class="sep">:</span><span class="val">${escapeHtml(data.nextService)} km</span></div>
          </div>
        </div>

        <table class="items-table">
          <colgroup>
            <col style="width:9%"><col style="width:41%"><col style="width:18%">
            <col style="width:22%"><col style="width:10%">
          </colgroup>
          <thead>
            <tr>
              <th rowspan="2">Qty</th>
              <th rowspan="2">Description</th>
              <th rowspan="2">Rate</th>
              <th colspan="2">Amount</th>
            </tr>
            <tr>
              <th class="sub">Rs.</th>
              <th class="sub">Cts.</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
            <tr class="total-row">
              <td colspan="2"></td>
              <td class="label">Total</td>
              <td class="r">${total.rs}</td>
              <td class="c">${total.cts}</td>
            </tr>
          </tbody>
        </table>

        <div class="footer-box">
          <div class="footer-row"><span class="label">Phone No</span><span class="sep">:</span><span class="val">${escapeHtml(data.customerPhone || "")}</span></div>
          <div class="footer-row"><span class="label">Address</span><span class="sep">:</span><span class="val">${escapeHtml(data.customerAddress || "")}</span></div>
        </div>

        <div class="thank-you">
          Thank you for your visit!
          <div class="stars">★ ★ ★</div>
        </div>

      </div>
    </body>
  </html>`;
}

/**
 * Builds the invoice PDF and shows it to the user.
 *  - Web:    prints through a hidden iframe.
 *  - Mobile: creates a PDF file and opens the native share sheet.
 *
 * Errors are re-thrown so the caller can tell the user what went wrong.
 */
export async function generateAndShareInvoice(
  data: InvoicePayload,
): Promise<void> {
  try {
    console.log("[PDFGenerator] Starting invoice generation...");

    const htmlContent = buildInvoiceHtml(data, LOGO_DATA_URI);

    if (Platform.OS === "web") {
      console.log(
        "[PDFGenerator] Running on Web - rendering via hidden iframe.",
      );

      const existingIframe = document.getElementById("print-iframe");
      if (existingIframe) {
        document.body.removeChild(existingIframe);
      }

      const iframe = document.createElement("iframe");
      iframe.id = "print-iframe";
      iframe.style.position = "absolute";
      iframe.style.width = "0px";
      iframe.style.height = "0px";
      iframe.style.border = "none";
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(htmlContent);
        doc.close();

        iframe.contentWindow!.focus();
        setTimeout(() => {
          iframe.contentWindow?.print();
        }, 500);
      }
      return;
    }

    console.log("[PDFGenerator] Calling Print.printToFileAsync...");
    const file = await Print.printToFileAsync({
      html: htmlContent,
      width: 595, // A4 in points
      height: 842,
    });
    console.log("[PDFGenerator] PDF created at:", file?.uri);

    if (!file || !file.uri) {
      throw new Error("PDF file URI is undefined after generation.");
    }

    const isSharingAvailable = await Sharing.isAvailableAsync();
    console.log("[PDFGenerator] Sharing available:", isSharingAvailable);

    if (isSharingAvailable) {
      try {
        await Sharing.shareAsync(file.uri, {
          mimeType: "application/pdf",
          UTI: "com.adobe.pdf",
          dialogTitle: `Invoice ${data.invoiceNo}`,
        });
        console.log("[PDFGenerator] Share sheet closed.");
        return;
      } catch (shareError) {
        // Seen in Expo Go on Android: "Not allowed to read file under given
        // URL" for files created by expo-print. Fall back to the system print
        // dialog, which has a "Save as PDF" option and needs no file access.
        console.warn(
          "[PDFGenerator] shareAsync failed, falling back to the print dialog:",
          shareError,
        );
      }
    }

    await Print.printAsync({ html: htmlContent });
    console.log("[PDFGenerator] Print dialog opened.");
  } catch (error) {
    console.error(
      "[PDFGenerator] Error caught during PDF generation or sharing:",
      error,
    );
    throw error;
  }
}
