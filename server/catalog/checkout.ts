import { catalogProductId, getFullCatalog, type CatalogItem } from ".";

export type CheckoutEligibility = {
  itemId: string;
  displayPrice: string;
  availability: Record<string, boolean>;
};

/** Resolves the only product a checkout may use. This has no payment, balance, or persistence side effects. */
export function resolveCatalogCheckout({ itemId, displayPrice, availability }: CheckoutEligibility): CatalogItem {
  const product = getFullCatalog().find((item) => catalogProductId(item) === itemId);
  if (!product || product.pay !== displayPrice) throw new Error("This catalog item or displayed price is no longer valid");
  if (availability[itemId]) throw new Error("This catalog item is currently unavailable");
  return product;
}
