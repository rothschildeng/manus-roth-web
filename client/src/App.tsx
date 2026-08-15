// Obsidian Gallery; graphite surfaces, Aurelia Lime signal, editorial asymmetry, restrained motion, no generic purple gradient.
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import PaymentAdmin from "./pages/PaymentAdmin";
import CatalogAdmin from "./pages/CatalogAdmin";
import CategoryPage from "./pages/CategoryPage";
import ProductPage from "./pages/ProductPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import ConfirmationPage from "./pages/ConfirmationPage";
import AccountPage from "./pages/AccountPage";
import LoginPage from "./pages/LoginPage";
import WishlistPage from "./pages/WishlistPage";
import WalletPage from "./pages/WalletPage";
import ReferralPage from "./pages/ReferralPage";
import GiftCardsPage from "./pages/GiftCardsPage";
import OffersPage from "./pages/OffersPage";
import WalletAdmin from "./pages/WalletAdmin";
import OrdersPage from "./pages/OrdersPage";
import SettingsPage from "./pages/SettingsPage";
import VccPage from "./pages/VccPage";
import VccVaultPage from "./pages/VccVaultPage";
import VccAdmin from "./pages/VccAdmin";
import AdminOverview from "./pages/AdminOverview";
import SimilarWebAnalyticsPage from "./pages/SimilarWebAnalyticsPage";
import TrustPage from "./pages/TrustPage";
import SupportPage from "./pages/SupportPage";
import PolicyPage from "./pages/PolicyPage";
import { CartProvider } from "./contexts/CartContext";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/category/vcc"} component={VccPage} />
      <Route path={"/category/:category"} component={CategoryPage} />
      <Route path={"/product/:id"} component={ProductPage} />
      <Route path={"/cart"} component={CartPage} />
      <Route path={"/checkout"} component={CheckoutPage} />
      <Route path={"/confirmation/:orderId"} component={ConfirmationPage} />
      <Route path={"/account"} component={AccountPage} />
      <Route path={"/login"} component={LoginPage} />
      <Route path={"/wishlist"} component={WishlistPage} />
      <Route path={"/wallet"} component={WalletPage} />
      <Route path={"/refer"} component={ReferralPage} />
      <Route path={"/gift-cards"} component={GiftCardsPage} />
      <Route path={"/offers"} component={OffersPage} />
      <Route path={"/admin"} component={AdminOverview} />
      <Route path={"/similarweb-analytics"} component={SimilarWebAnalyticsPage} />
      <Route path={"/admin/wallet"} component={WalletAdmin} />
      <Route path={"/orders"} component={OrdersPage} />
      <Route path={"/settings"} component={SettingsPage} />
      <Route path={"/vcc"} component={VccPage} />
      <Route path={"/my-vcc"} component={VccVaultPage} />
      <Route path={"/admin/vcc"} component={VccAdmin} />
      <Route path={"/track/:orderId"} component={ConfirmationPage} />
      <Route path={"/trust"} component={TrustPage} />
      <Route path={"/support"} component={SupportPage} />
      <Route path={"/:policy"} component={PolicyPage} />
      <Route path={"/admin/payments"} component={PaymentAdmin} />
      <Route path={"/admin/catalog"} component={CatalogAdmin} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
      >
        <CartProvider><TooltipProvider><Toaster /><Router /></TooltipProvider></CartProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
