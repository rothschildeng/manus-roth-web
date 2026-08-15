import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { House, PackageCheck, ShoppingBag, UserRound, WalletCards } from "lucide-react";
import { mobileNavigationTargets, mobileWalletBalanceLabel } from "@shared/mobileNavigation";
import { Link, useLocation } from "wouter";

const isActive = (location: string, target: string) => target === "/" ? location === "/" : location.startsWith(target);

export default function MobileBottomNav() {
  const [location] = useLocation();
  const { isAuthenticated } = useAuth();
  const wallet = trpc.wallet.overview.useQuery(undefined, { enabled: isAuthenticated });
  const money = mobileWalletBalanceLabel(isAuthenticated, wallet.data?.account.availableBalance);
  const { profile: profileRoute, wallet: walletRoute, orders: ordersRoute } = mobileNavigationTargets(isAuthenticated);

  return <nav className="mobile-bottom-nav" aria-label="Primary mobile navigation">
    <Link href="/" className={isActive(location, "/") ? "is-active" : ""} aria-current={isActive(location, "/") ? "page" : undefined}><House size={17} /><span>Home</span></Link>
    <Link href="/category/indian_giftcard" className={location.startsWith("/category") || location.startsWith("/product") ? "is-active" : ""}><ShoppingBag size={17} /><span>Shop</span></Link>
    <Link href={walletRoute} className={isActive(location, "/wallet") ? "is-active" : ""}><WalletCards size={17} /><span>Wallet</span>{isAuthenticated && money ? <b>{money}</b> : null}</Link>
    <Link href={ordersRoute} className={location.startsWith("/account") ? "is-active" : ""}><PackageCheck size={17} /><span>Orders</span></Link>
    <Link href={profileRoute} className={location.startsWith("/account") || location.startsWith("/login") ? "is-active" : ""}><UserRound size={17} /><span>Profile</span></Link>
  </nav>;
}
