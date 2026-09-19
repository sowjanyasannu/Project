/**
 * WhatsApp click-to-chat helpers (spec §24 / §"WHATSAPP INTEGRATION FOR THIS FLOW").
 * MVP uses pre-filled wa.me links; §61.8 flags that official WhatsApp Business
 * API automation will be needed once volume grows past manual chat replies.
 */
export function getWhatsAppNumber(configuredNumber?: string | null): string {
  return (configuredNumber || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "").replace(/\D/g, "");
}

export function buildWhatsAppLink(message: string, configuredNumber?: string | null): string {
  const number = getWhatsAppNumber(configuredNumber);
  const encoded = encodeURIComponent(message);
  return number ? `https://wa.me/${number}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
}

export function productEnquiryMessage(params: {
  productName: string;
  sku: string;
  size?: string;
}): string {
  return [
    "Hello Jobert Apparels,",
    "I am interested in:",
    params.productName,
    `SKU: ${params.sku}`,
    params.size ? `Size: ${params.size}` : undefined,
    "I would like to know more about availability and pricing.",
  ]
    .filter(Boolean)
    .join("\n");
}

export function customRequestMessage(params: {
  requestNumber: string;
  organization?: string | null;
  uniformType: string;
  wearerType?: string | null;
  totalQuantity: number;
  customizationOptions: string[];
}): string {
  return [
    "Hello Jobert Apparels,",
    "I have submitted a custom uniform requirement.",
    `Request ID: ${params.requestNumber}`,
    params.organization ? `Organization: ${params.organization}` : undefined,
    `Uniform: ${params.uniformType}`,
    params.wearerType ? `For: ${params.wearerType}` : undefined,
    `Quantity: ${params.totalQuantity}`,
    params.customizationOptions.length ? "Customization:" : undefined,
    ...params.customizationOptions,
    "Please review my requirement and share the quotation.",
  ]
    .filter(Boolean)
    .join("\n");
}

export function bulkEnquiryMessage(params: {
  requestNumber: string;
  organization?: string | null;
  productRequired: string;
  estimatedQuantity: number;
}): string {
  return [
    "Hello Jobert Apparels,",
    "I have submitted a bulk order enquiry.",
    `Request ID: ${params.requestNumber}`,
    params.organization ? `Organization: ${params.organization}` : undefined,
    `Product: ${params.productRequired}`,
    `Estimated Quantity: ${params.estimatedQuantity}`,
    "Please share pricing and next steps.",
  ]
    .filter(Boolean)
    .join("\n");
}

export function orderHelpMessage(orderNumber: string): string {
  return `Hello Jobert Apparels,\nI need help with my order ${orderNumber}.`;
}
