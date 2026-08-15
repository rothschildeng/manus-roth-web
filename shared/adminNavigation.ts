export const ADMIN_DESKS = [
  {
    path: "/admin/payments",
    label: "Payment review",
    summary: "Review confirmed payment orders and move approved orders through the manual fulfillment lifecycle.",
    boundary: "No automatic approval or delivery",
  },
  {
    path: "/admin/wallet",
    label: "Wallet reviews",
    summary: "Approve or reject masked wallet and Flipkart gift-card deposit requests after private verification.",
    boundary: "Masked references only",
  },
  {
    path: "/admin/vcc",
    label: "VCC handoffs",
    summary: "Prepare a metadata-only VCC handoff only after the order is manually approved.",
    boundary: "No PAN, CVV, expiry, or delivery link",
  },
  {
    path: "/admin/catalog",
    label: "Catalog controls",
    summary: "Change visibility for imported catalog routes while retaining source-backed prices and product data.",
    boundary: "Availability only — no price edits",
  },
  {
    path: "/similarweb-analytics",
    label: "SimilarWeb analytics",
    summary: "Review available public traffic-estimate reports for the published domain without fabricating unavailable metrics.",
    boundary: "External estimates only",
  },
] as const;

export const isAdminDeskPath = (path: string) => path === "/admin" || ADMIN_DESKS.some((desk) => desk.path === path);
