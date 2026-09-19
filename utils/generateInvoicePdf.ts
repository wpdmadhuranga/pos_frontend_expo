import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";

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
}

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

function buildInvoiceHtml(data: InvoicePayload): string {
  const validItems = data.items.filter((item) => item.qty > 0);

  const itemsHtml = validItems
    .map(
      (item) => `
      <tr>
        <td style="text-align: center; border: 1px solid #003366; padding: 6px; font-weight: bold;">${item.qty}</td>
        <td style="border: 1px solid #003366; padding: 6px;">${escapeHtml(item.name)}</td>
        <td style="text-align: right; border: 1px solid #003366; padding: 6px;">${money(item.rate)}</td>
        <td style="text-align: right; border: 1px solid #003366; padding: 6px;" colspan="2">${money(item.amount)}</td>
      </tr>
    `,
    )
    .join("");

  return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #002244; padding: 15px; font-size: 13px; background: #fff; }
            .invoice-box { max-width: 700px; margin: auto; padding: 10px; border: 3px solid #003366; border-radius: 6px; }
            .header { text-align: center; border-bottom: 2px solid #003366; padding-bottom: 8px; margin-bottom: 10px; }
            .header h1 { margin: 0; font-size: 22px; font-weight: bold; color: #003366; }
            .header p { margin: 2px 0; font-size: 11px; font-weight: 600; color: #002244; }
            .info-table { width: 100%; border-collapse: collapse; margin-bottom: 12px; border: 2px solid #003366; }
            .info-table td { padding: 6px 10px; border: 1px solid #003366; font-size: 12px; font-weight: bold; }
            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
            .items-table th { background-color: #003366; color: #fff; border: 1px solid #003366; padding: 6px; font-size: 12px; text-align: center; }
            .items-table td { font-size: 12px; }
            .total-row { background-color: #f0f4f8; font-weight: bold; font-size: 14px; text-align: right; }
            .footer-box { border: 2px solid #003366; padding: 8px; margin-top: 15px; font-size: 12px; font-weight: bold; }
            .footer-box p { margin: 4px 0; }
            .thank-you { text-align: center; font-size: 13px; font-weight: bold; margin-top: 15px; color: #003366; }
          </style>
        </head>
        <body>
          <div class="invoice-box">
            <div class="header">
              <div style="font-size: 24px; font-weight: 900; color: #003366; margin-bottom: 2px;">[ Msc ] MICRO SERVICE CENTRE</div>
              <p>No.411/1A, Makumbura, Pannipitia.</p>
              <p>Tel: 011 3154093 / 071 3942436 / 0719842598</p>
            </div>

            <table class="info-table">
              <tr>
                <td style="width: 50%;">Vehicle No : <span style="font-weight: normal;">${escapeHtml(data.vehicleNo)}</span></td>
                <td style="width: 50%;">Date : <span style="font-weight: normal;">${escapeHtml(data.date)}</span></td>
              </tr>
              <tr>
                <td>Service At : <span style="font-weight: normal;">${escapeHtml(data.odometer)} km</span></td>
                <td>Next Service : <span style="font-weight: normal;">${escapeHtml(data.nextService)} km</span></td>
              </tr>
            </table>

            <table class="items-table">
              <thead>
                <tr>
                  <th style="width: 10%;">Qty</th>
                  <th style="width: 50%; text-align: left; padding-left: 10px;">Description</th>
                  <th style="width: 20%;">Rate (Rs.)</th>
                  <th style="width: 20%;" colspan="2">Amount (Rs.)</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
                <tr class="total-row">
                  <td colspan="3" style="text-align: right; border: 1px solid #003366; padding: 8px;">Total :</td>
                  <td colspan="2" style="text-align: right; border: 1px solid #003366; padding: 8px; color: #003366;">
                    Rs. ${money(data.total)}
                  </td>
                </tr>
              </tbody>
            </table>

            <div class="footer-box">
              <p>Phone No : <span style="font-weight: normal;">${escapeHtml(data.customerPhone)}</span></p>
              <p>Address &nbsp;&nbsp;&nbsp;: <span style="font-weight: normal;">Service Center Customer Record</span></p>
            </div>

            <div class="thank-you">
              Thank you for your visit!<br>★ ★ ★
            </div>
          </div>
        </body>
      </html>
    `;
}

/**
 * Builds the invoice PDF and shows it to the user.
 *  - Web:    prints through a hidden iframe (unchanged behaviour).
 *  - Mobile: creates a PDF file and opens the native share sheet.
 *
 * Errors are re-thrown so the caller can tell the user what went wrong.
 * (Previously they were only logged, so a mobile failure looked like success.)
 */
export async function generateAndShareInvoice(
  data: InvoicePayload,
): Promise<void> {
  try {
    console.log("[PDFGenerator] Starting invoice generation...");

    const htmlContent = buildInvoiceHtml(data);

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
        }, 300);
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
