export function mobileNavigationTargets(isAuthenticated: boolean) {
  return {
    wallet: isAuthenticated ? "/wallet" : "/login",
    orders: isAuthenticated ? "/orders" : "/login",
    profile: isAuthenticated ? "/account" : "/login",
  } as const;
}

export function mobileWalletBalanceLabel(isAuthenticated: boolean, serverBalance: unknown): string | null {
  if (!isAuthenticated || serverBalance === undefined || serverBalance === null) return null;
  const balance = Number(serverBalance);
  return Number.isFinite(balance) ? `$${balance.toFixed(2)}` : null;
}
