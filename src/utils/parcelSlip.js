import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import JsBarcode from "jsbarcode";
import moment from "moment";

/**
 * Parcel slip design requirements:
 * - Company name with logo
 * - Courier name
 * - White and black design (easy for print)
 * - Client address
 * - Estimate delivery time
 * - QR code (redirects to parcel tracking page, shows status when scanned)
 * - Barcode (for inventory: when merchants scan, deduct stock, store history)
 * - Company terms shortly
 */
export const generateParcelSlip = async (order, options = {}) => {
  if (!order) {
    throw new Error("Order data is required");
  }

  const trackingId = order.shippingTrackingId || `SC-${order.id}`;
  // Company domain from API (auth/me): customDomain, subdomain, or env fallback
  const trackingPageBase =
    options.trackingPageUrl ||
    options.companyDomain ||
    import.meta.env.VITE_APP_URL ||
    import.meta.env.VITE_TRACKING_PAGE_URL ||
    (typeof window !== "undefined" ? window.location.origin : "https://squadcart.com");
  const trackingUrl = `${trackingPageBase.replace(/\/$/, "")}/track-order?trackingId=${encodeURIComponent(trackingId)}`;

  const companyName = options.companyName || "SquadCart";
  const companyLogo = options.companyLogo || null;
  const courierName = order.shippingProvider || "SquadCart";
  const clientName = order.customer?.name || order.customerName || "N/A";
  const clientAddress = order.customerAddress || "N/A";
  const clientPhone = order.customerPhone || order.customer?.phone || "";

  // Estimate delivery: INSIDEDHAKA 2-3 days, OUTSIDEDHAKA 4-5 days from ship date
  const shipDate = order.updatedAt || order.createdAt || new Date();
  const daysToAdd = (order.deliveryType || "INSIDEDHAKA") === "INSIDEDHAKA" ? 3 : 5;
  const estimatedDelivery = moment(shipDate).add(daysToAdd, "days").format("DD MMM YYYY");

  const companyTerms =
    options.companyTerms ||
    "The sender acknowledges that this parcel may be carried by air and will be subject to security procedures. The sender declares that the parcel does not contain any dangerous or prohibited goods. A false declaration is a criminal offence.";

  // Generate QR code as data URL
  const qrDataUrl = await QRCode.toDataURL(trackingUrl, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 80,
    color: { dark: "#000000", light: "#ffffff" },
  });

  // Generate barcode as data URL (using canvas)
  const canvas = document.createElement("canvas");
  JsBarcode(canvas, trackingId, {
    format: "CODE128",
    width: 2,
    height: 40,
    displayValue: true,
    fontSize: 10,
    margin: 2,
    lineColor: "#000000",
    background: "#ffffff",
  });
  const barcodeDataUrl = canvas.toDataURL("image/png");

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a6",
  });

  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();

  // Layout metrics
  const margin = 7; // inner content margin for nicer breathing room
  let y = margin + 12; // will be reset after header

  // Black and white design for easy printing
  const black = "#000000";
  const white = "#ffffff";

  // Header: Company name + logo
  const headerHeight = 24;
  const headerTop = 0;
  const headerLeft = 0;
  const headerWidth = w;

  doc.setFillColor(white);
  doc.rect(headerLeft, headerTop, headerWidth, headerHeight, "F");

  if (companyLogo) {
    try {
      doc.addImage(companyLogo, "PNG", headerLeft + 3, headerTop + 3, 18, 18);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(black);
      doc.text(companyName, headerLeft + 24, headerTop + 11);
    } catch {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(black);
      doc.text(companyName, headerLeft + 3, headerTop + 11);
    }
  } else {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(black);
    doc.text(companyName, headerLeft + 3, headerTop + 11);
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(`Courier: ${courierName}`, headerLeft + 3, headerTop + 19);

  // QR code in header, right aligned
  const qrSize = 18;
  const qrX = headerLeft + headerWidth - qrSize - 3;
  const qrY = headerTop + 3;
  doc.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize);
  doc.setFontSize(7);
  doc.text("Scan to track", qrX + qrSize / 2, qrY + qrSize + 4, {
    align: "center",
  });

  // Start content just under header, aligned to inner margin
  y = headerTop + headerHeight + 5;

  // DELIVER TO (Client address)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("DELIVER TO", margin, y);
  y += 6;

  const addressBoxLeft = margin;
  const addressBoxWidth = w - margin * 2;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  const addrLines = doc.splitTextToSize(
    `${clientName}\n${clientAddress}${clientPhone ? `\n${clientPhone}` : ""}`,
    addressBoxWidth - 4,
  );
  addrLines.forEach((line) => {
    doc.text(line, addressBoxLeft + 2, y);
    y += 4;
  });
  y += 2;

  // Estimate delivery time
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("Est. Delivery:", margin, y);
  doc.setFont("helvetica", "normal");
  doc.text(estimatedDelivery, margin + 28, y);
  y += 8;

  // Barcode
  const barcodeWidth = w - margin * 2;
  const barcodeHeight = 18;
  doc.addImage(barcodeDataUrl, "PNG", margin, y, barcodeWidth, barcodeHeight);
  y += 22;
  doc.setFontSize(7);
  doc.text(`Tracking ID: ${trackingId}`, w / 2, y, { align: "center" });
  y += 6;

  // Company terms (short)
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  const termsLines = doc.splitTextToSize(companyTerms, w - margin * 2);
  termsLines.forEach((line) => {
    doc.text(line, margin, y);
    y += 3.5;
  });

  const fileName = `Parcel_Slip_${trackingId}_${moment().format("YYYYMMDD")}.pdf`;
  doc.save(fileName);
};
