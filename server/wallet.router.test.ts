import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";
import { catalogProductId, getFullCatalog } from "./catalog";
import { z } from "zod";

const db = vi.hoisted(() => ({
  applyReferralCode: vi.fn(), approveWalletDeposit: vi.fn(), createCryptoWalletDeposit: vi.fn(), createWalletCheckoutOrder: vi.fn(), createWalletCheckoutOrders: vi.fn(), createWalletDeposit: vi.fn(), deleteSavedAddress: vi.fn(), getOrCreateReferralCode: vi.fn(), getPaymentOrder: vi.fn(), getProductAvailabilityMap: vi.fn(), getWalletAccount: vi.fn(), listGiftCardEntitlements: vi.fn(), listOrderNotifications: vi.fn(), listPaymentOrders: vi.fn(), listPaymentOrdersForCustomer: vi.fn(), listProductFavorites: vi.fn(), listReferralEvents: vi.fn(), listSavedAddresses: vi.fn(), listVccEntitlements: vi.fn(), listVccEntitlementsForAdmin: vi.fn(), listWalletDepositsForAdmin: vi.fn(), listWalletDepositsForUser: vi.fn(), listWalletLedger: vi.fn(), listWalletNotifications: vi.fn(), markCryptoDepositPendingReview: vi.fn(), markVccEntitlementHandedOff: vi.fn(), prepareVccEntitlement: vi.fn(), recordOrderNotification: vi.fn(), rejectWalletDeposit: vi.fn(), saveAddress: vi.fn(), setProductAvailability: vi.fn(), toggleProductFavorite: vi.fn(), updatePaymentOrder: vi.fn(),
}));

vi.mock("./db", () => db);
vi.mock("./telegram/client", () => ({ sendTelegramMessage: vi.fn().mockResolvedValue(undefined) }));
vi.mock("./telegram/config", () => ({ getTelegramAdminChatId: vi.fn(() => ""), getTelegramConfig: vi.fn(() => undefined) }));
vi.mock("./payments/config", () => ({ paymentChainSchema: z.enum(["TON", "USDT_BEP20", "SOLANA", "BTC", "ETH"]), getWalletConfig: vi.fn(() => ({ address: "test-wallet-address", asset: "USDT", requiredConfirmations: 15 })) }));
vi.mock("./payments/rates", () => ({ fetchDisplayFxRates: vi.fn(), quoteCatalogPriceToUsd: vi.fn(async () => ({ usd: 5, sourceCurrency: "USD" })), quoteUsdToAsset: vi.fn(async () => ({ amount: "25.000000", rate: 1, quotedAt: new Date() })) }));

import { appRouter } from "./routers";

const createContext = (role: "user" | "admin" = "user"): TrpcContext => ({ user: { id: 7, openId: "wallet-user", name: "Wallet User", email: "wallet@example.com", loginMethod: "manus", role, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }, adminGateUnlocked: role === "admin", req: {} as TrpcContext["req"], res: {} as TrpcContext["res"] });

describe("wallet router", () => {
  beforeEach(() => vi.clearAllMocks());

  it("aggregates account, ledger, deposits, notifications, referrals, and gift-card records", async () => {
    db.getWalletAccount.mockResolvedValue({ id: 1, availableBalance: "27.00" });
    db.listWalletLedger.mockResolvedValue([{ id: 1 }]);
    db.listWalletDepositsForUser.mockResolvedValue([{ id: 2 }]);
    db.listWalletNotifications.mockResolvedValue([{ id: 3 }]);
    db.getOrCreateReferralCode.mockResolvedValue({ id: 4, code: "ROTH-123" });
    db.listReferralEvents.mockResolvedValue([{ id: 5 }]);
    db.listGiftCardEntitlements.mockResolvedValue([{ id: 6 }]);
    const result = await appRouter.createCaller(createContext()).wallet.overview();
    expect(result.account.availableBalance).toBe("27.00");
    expect(result.notifications).toEqual([{ id: 3 }]);
    expect(result.referralCode.code).toBe("ROTH-123");
  });

  it("rejects deposits below the server-enforced $25 minimum", async () => {
    await expect(appRouter.createCaller(createContext()).wallet.createDeposit({ amount: 24.99, sourceType: "gift_card_review", reference: "REF-1234" })).rejects.toThrow();
    expect(db.createWalletDeposit).not.toHaveBeenCalled();
  });

  it("creates a pending manual-review Flipkart deposit for a valid request", async () => {
    db.createWalletDeposit.mockResolvedValue({ id: 9, requestCode: "ROTH-ABC123", requestedAmount: "25.00", currency: "USD", referenceMasked: "•••• 1234" });
    const result = await appRouter.createCaller(createContext()).wallet.createDeposit({ amount: 25, sourceType: "gift_card_review", reference: "REF-1234" });
    expect(db.createWalletDeposit).toHaveBeenCalledWith(7, { requestedAmount: 25, sourceType: "gift_card_review", reference: "REF-1234" });
    expect(result?.requestCode).toBe("ROTH-ABC123");
  });

  it("creates a protected wallet-funded order request and disables direct checkout", async () => {
    const product = getFullCatalog().find((entry) => !entry.quoteOnly)!;
    db.getProductAvailabilityMap.mockResolvedValue({});
    db.createWalletCheckoutOrder.mockResolvedValue({ orderId: "walletorder123456789012", status: "pending_admin", expectedAmount: "5.00", asset: "USD" });
    const caller = appRouter.createCaller(createContext());
    await expect(caller.payment.createWalletOrder({ itemId: catalogProductId(product), displayPrice: product.pay })).resolves.toMatchObject({ status: "pending_admin", asset: "USD" });
    expect(db.createWalletCheckoutOrder).toHaveBeenCalledWith(expect.objectContaining({ userId: 7, itemId: catalogProductId(product) }));
    await expect(caller.payment.createOrder({ itemId: catalogProductId(product), displayPrice: product.pay, chain: "USDT_BEP20", expiresInMinutes: 30 })).rejects.toThrow("Direct payment checkout is disabled");
  });

  it("creates every cart line atomically with its requested quantity", async () => {
    const [first, second] = getFullCatalog().filter((entry) => !entry.quoteOnly).slice(0, 2);
    db.getProductAvailabilityMap.mockResolvedValue({});
    db.createWalletCheckoutOrders.mockResolvedValue([{ orderId: "firstwalletorder", itemId: catalogProductId(first!), quantity: 2, status: "pending_admin", expectedAmount: "10.00", asset: "USD" }, { orderId: "secondwalletorder", itemId: catalogProductId(second!), quantity: 3, status: "pending_admin", expectedAmount: "15.00", asset: "USD" }]);
    const result = await appRouter.createCaller(createContext()).payment.createWalletOrders({ items: [{ itemId: catalogProductId(first!), displayPrice: first!.pay, quantity: 2 }, { itemId: catalogProductId(second!), displayPrice: second!.pay, quantity: 3 }] });
    expect(result).toHaveLength(2);
    expect(db.createWalletCheckoutOrders).toHaveBeenCalledWith(expect.objectContaining({ userId: 7, orders: expect.arrayContaining([expect.objectContaining({ itemId: catalogProductId(first!), quantity: 2 }), expect.objectContaining({ itemId: catalogProductId(second!), quantity: 3 })]) }));
  });

  it("creates a protected crypto wallet-deposit request without enabling direct product checkout", async () => {
    db.createCryptoWalletDeposit.mockResolvedValue({ deposit: { id: 20, status: "awaiting_payment" }, order: { orderId: "cryptodepositorder", expectedAmount: "25.000001", expiresAt: new Date() } });
    const result = await appRouter.createCaller(createContext()).wallet.createCryptoDeposit({ amount: 25, chain: "USDT_BEP20", expiresInMinutes: 30 });
    expect(result.address).toBe("test-wallet-address");
    expect(result.asset).toBe("USDT");
    expect(db.createCryptoWalletDeposit).toHaveBeenCalledWith(expect.objectContaining({ userId: 7, chain: "USDT_BEP20", expectedUsd: "25.00", receivingAddress: "test-wallet-address" }));
  });

  it("blocks product-order approval actions for a crypto wallet-deposit record", async () => {
    db.getPaymentOrder.mockResolvedValue({ orderId: "cryptodepositorder", purpose: "wallet_deposit", status: "pending_admin", customerId: 7 });
    await expect(appRouter.createCaller(createContext("admin")).payment.approve({ orderId: "cryptodepositorder" })).rejects.toThrow("dedicated admin wallet review desk");
    expect(db.updatePaymentOrder).not.toHaveBeenCalled();
  });

  it("registers referral applications against the authenticated account", async () => {
    db.applyReferralCode.mockResolvedValue({ status: "registered" });
    await expect(appRouter.createCaller(createContext()).wallet.applyReferral({ code: "ROTH-HELLO" })).resolves.toEqual({ status: "registered" });
    expect(db.applyReferralCode).toHaveBeenCalledWith(7, "ROTH-HELLO");
  });

  it("allows only an admin caller to approve a wallet deposit", async () => {
    db.approveWalletDeposit.mockResolvedValue({ id: 10, status: "approved" });
    await expect(appRouter.createCaller(createContext("admin")).adminWallet.approveDeposit({ depositId: 10 })).resolves.toEqual({ id: 10, status: "approved" });
    await expect(appRouter.createCaller(createContext("user")).adminWallet.approveDeposit({ depositId: 10 })).rejects.toThrow();
  });

  it("allows an admin to reject a pending deposit while blocking non-admin rejection", async () => {
    db.rejectWalletDeposit.mockResolvedValue({ id: 11, status: "rejected" });
    await expect(appRouter.createCaller(createContext("admin")).adminWallet.rejectDeposit({ depositId: 11, reviewNote: "Reference could not be verified" })).resolves.toEqual({ id: 11, status: "rejected" });
    expect(db.rejectWalletDeposit).toHaveBeenCalledWith(11, 7, "Reference could not be verified");
    await expect(appRouter.createCaller(createContext("user")).adminWallet.rejectDeposit({ depositId: 11 })).rejects.toThrow();
  });

  it("returns only the authenticated customer’s masked VCC handoff records", async () => {
    db.listVccEntitlements.mockResolvedValue([{ id: 12, maskedReference: "ROTH / SECURE-ABC123", status: "prepared" }]);
    await expect(appRouter.createCaller(createContext()).vcc.mine()).resolves.toEqual([{ id: 12, maskedReference: "ROTH / SECURE-ABC123", status: "prepared" }]);
    expect(db.listVccEntitlements).toHaveBeenCalledWith(7);
  });

  it("permits only an administrator to prepare and mark a secure VCC handoff", async () => {
    const orderId = "vccorder123456";
    const itemId = "💳 Basic Virtual ($50–200) — $50 Balance — Best for subscriptions";
    db.getPaymentOrder.mockResolvedValue({ orderId, itemId, status: "approved", customerId: 7 });
    db.prepareVccEntitlement.mockResolvedValue({ id: 13, status: "prepared" });
    db.markVccEntitlementHandedOff.mockResolvedValue({ id: 13, status: "handed_off" });
    await expect(appRouter.createCaller(createContext("admin")).vcc.prepare({ orderId })).resolves.toEqual({ id: 13, status: "prepared" });
    expect(db.prepareVccEntitlement).toHaveBeenCalledWith({ orderId, userId: 7, title: itemId });
    await expect(appRouter.createCaller(createContext("admin")).vcc.markHandedOff({ id: 13 })).resolves.toEqual({ id: 13, status: "handed_off" });
    await expect(appRouter.createCaller(createContext("admin")).vcc.prepare({ orderId, handoffNote: "4111 1111 1111 1111" } as unknown as { orderId: string })).rejects.toThrow();
    expect(db.prepareVccEntitlement).toHaveBeenCalledTimes(1);
    await expect(appRouter.createCaller(createContext("user")).vcc.prepare({ orderId })).rejects.toThrow();
  });
});
