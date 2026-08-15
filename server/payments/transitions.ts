export type ManualOrderStatus = "awaiting_payment" | "detected" | "confirming" | "pending_admin" | "approved" | "fulfillment_ready" | "delivered" | "rejected" | "expired";
export type ManualOrderAction = "approve" | "reject" | "ready" | "deliver";

/** Manual-only order-state guard. No action here creates product delivery; it only records the administrator's stated handoff stage. */
export function transitionManualOrder(status: ManualOrderStatus, action: ManualOrderAction): ManualOrderStatus | null {
  if (action === "approve" && status === "pending_admin") return "approved";
  if (action === "reject" && ["pending_admin", "confirming", "detected"].includes(status)) return "rejected";
  if (action === "ready" && status === "approved") return "fulfillment_ready";
  if (action === "deliver" && status === "fulfillment_ready") return "delivered";
  return null;
}
