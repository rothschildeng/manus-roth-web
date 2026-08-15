export const MINIMUM_WALLET_DEPOSIT_USD = 25;

export type WalletDepositStatus = "pending_review" | "approved" | "rejected" | "cancelled";
export type WalletDepositAction = "approve" | "reject" | "cancel";

export function maskDepositReference(reference: string) {
  const normalized = reference.replace(/\s+/g, "").toUpperCase();
  return normalized.length <= 4 ? "••••" : `•••• ${normalized.slice(-4)}`;
}

export function transitionWalletDeposit(status: WalletDepositStatus, action: WalletDepositAction): WalletDepositStatus | null {
  if (status !== "pending_review") return null;
  if (action === "approve") return "approved";
  if (action === "reject") return "rejected";
  return "cancelled";
}
