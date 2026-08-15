import { and, desc, eq, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { GiftCardEntitlement, InsertPaymentOrder, InsertPaymentTransaction, InsertSavedAddress, InsertUser, giftCardEntitlements, orderNotifications, paymentOrders, paymentTransactions, productAvailability, productFavorites, referralCodes, referralEvents, savedAddresses, users, vccEntitlements, walletAccounts, walletDeposits, walletLedger, walletNotifications } from "../drizzle/schema";
import { ENV } from './_core/env';
import { maskDepositReference } from "./wallet/rules";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createPaymentOrder(order: InsertPaymentOrder) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  await db.insert(paymentOrders).values(order);
  return getPaymentOrder(order.orderId);
}

/** Creates a wallet-funded order atomically. It always enters manual review and never triggers fulfilment. */
export async function createWalletCheckoutOrder(input: { orderId: string; userId: number; itemId: string; expectedUsd: string; expiresAt: Date }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  return db.transaction(async (tx) => {
    await tx.insert(walletAccounts).values({ userId: input.userId, currency: "USD", availableBalance: "0.00", version: 0 }).onDuplicateKeyUpdate({ set: { userId: input.userId } });
    const account = (await tx.select().from(walletAccounts).where(and(eq(walletAccounts.userId, input.userId), eq(walletAccounts.currency, "USD"))).limit(1))[0];
    if (!account) throw new Error("Wallet account could not be initialized");
    const cost = balanceNumber(input.expectedUsd);
    const available = balanceNumber(account.availableBalance);
    if (!Number.isFinite(cost) || cost <= 0) throw new Error("This product does not have a valid wallet price");
    if (available < cost) throw new Error("Insufficient wallet balance. Submit a Flipkart gift-card deposit request first.");
    const balanceAfter = available - cost;
    const update = await tx.update(walletAccounts).set({ availableBalance: balanceAfter.toFixed(2), version: account.version + 1 }).where(and(eq(walletAccounts.id, account.id), eq(walletAccounts.version, account.version)));
    if (update[0].affectedRows !== 1) throw new Error("Wallet balance changed. Refresh and try again.");
    await tx.insert(walletLedger).values({ walletAccountId: account.id, userId: input.userId, kind: "order_debit", amount: (-cost).toFixed(2), balanceAfter: balanceAfter.toFixed(2), idempotencyKey: `order:${input.orderId}:wallet-debit`, description: `Wallet order request: ${input.orderId}` });
    await tx.insert(paymentOrders).values({ orderId: input.orderId, customerId: input.userId, itemId: input.itemId, chain: "WALLET", asset: "USD", expectedUsd: cost.toFixed(2), expectedAmount: cost.toFixed(2), receivingAddress: "wallet-balance", status: "pending_admin", confirmations: 1, requiredConfirmations: 1, expiresAt: input.expiresAt });
    await tx.insert(orderNotifications).values({ orderId: input.orderId, customerId: input.userId, event: "pending_review", channel: "in_app", status: "recorded" });
    return (await tx.select().from(paymentOrders).where(eq(paymentOrders.orderId, input.orderId)).limit(1))[0];
  });
}

/** Debits the wallet once and creates every requested cart line in the same transaction. */
export async function createWalletCheckoutOrders(input: { userId: number; orders: Array<{ orderId: string; itemId: string; expectedUsd: string; quantity: number }>; expiresAt: Date }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  if (!input.orders.length) throw new Error("At least one cart item is required");
  return db.transaction(async (tx) => {
    await tx.insert(walletAccounts).values({ userId: input.userId, currency: "USD", availableBalance: "0.00", version: 0 }).onDuplicateKeyUpdate({ set: { userId: input.userId } });
    const account = (await tx.select().from(walletAccounts).where(and(eq(walletAccounts.userId, input.userId), eq(walletAccounts.currency, "USD"))).limit(1))[0];
    if (!account) throw new Error("Wallet account could not be initialized");
    const total = input.orders.reduce((sum, order) => sum + balanceNumber(order.expectedUsd), 0);
    if (!Number.isFinite(total) || total <= 0) throw new Error("Cart contains an invalid wallet price");
    const available = balanceNumber(account.availableBalance);
    if (available < total) throw new Error("Insufficient wallet balance. Submit a Flipkart or crypto deposit request first.");
    const balanceAfter = available - total;
    const update = await tx.update(walletAccounts).set({ availableBalance: balanceAfter.toFixed(2), version: account.version + 1 }).where(and(eq(walletAccounts.id, account.id), eq(walletAccounts.version, account.version)));
    if (update[0].affectedRows !== 1) throw new Error("Wallet balance changed. Refresh and try again.");
    const firstOrderId = input.orders[0]!.orderId;
    await tx.insert(walletLedger).values({ walletAccountId: account.id, userId: input.userId, kind: "order_debit", amount: (-total).toFixed(2), balanceAfter: balanceAfter.toFixed(2), idempotencyKey: `cart:${firstOrderId}:wallet-debit`, description: `Wallet checkout for ${input.orders.length} order request(s)` });
    await tx.insert(paymentOrders).values(input.orders.map((order) => ({ orderId: order.orderId, customerId: input.userId, itemId: order.itemId, quantity: order.quantity, purpose: "purchase" as const, chain: "WALLET" as const, asset: "USD", expectedUsd: order.expectedUsd, expectedAmount: order.expectedUsd, receivingAddress: "wallet-balance", status: "pending_admin" as const, confirmations: 1, requiredConfirmations: 1, expiresAt: input.expiresAt })));
    await tx.insert(orderNotifications).values(input.orders.map((order) => ({ orderId: order.orderId, customerId: input.userId, event: "pending_review" as const, channel: "in_app" as const, status: "recorded" as const })));
    return tx.select().from(paymentOrders).where(inArray(paymentOrders.orderId, input.orders.map((order) => order.orderId)));
  });
}

/** Creates a crypto wallet-funding order plus a masked deposit record. Credit remains impossible until payment confirmation and manual review. */
export async function createCryptoWalletDeposit(input: { orderId: string; userId: number; chain: InsertPaymentOrder["chain"]; asset: string; expectedUsd: string; expectedAmount: string; receivingAddress: string; requiredConfirmations: number; expiresAt: Date }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const requestCode = `ROTH-${crypto.randomUUID().replaceAll("-", "").slice(0, 8).toUpperCase()}`;
  return db.transaction(async (tx) => {
    await tx.insert(paymentOrders).values({ orderId: input.orderId, customerId: input.userId, itemId: `Crypto wallet deposit · $${input.expectedUsd}`, quantity: 1, purpose: "wallet_deposit", chain: input.chain, asset: input.asset, expectedUsd: input.expectedUsd, expectedAmount: input.expectedAmount, receivingAddress: input.receivingAddress, status: "awaiting_payment", confirmations: 0, requiredConfirmations: input.requiredConfirmations, expiresAt: input.expiresAt });
    await tx.insert(walletDeposits).values({ requestCode, userId: input.userId, paymentOrderId: input.orderId, currency: "USD", requestedAmount: input.expectedUsd, proposedBonus: "0.00", sourceType: "crypto_review", referenceMasked: `${input.chain.replaceAll("_", " ")} · ${input.orderId.slice(-6).toUpperCase()}`, status: "awaiting_payment" });
    const deposit = (await tx.select().from(walletDeposits).where(eq(walletDeposits.paymentOrderId, input.orderId)).limit(1))[0];
    const order = (await tx.select().from(paymentOrders).where(eq(paymentOrders.orderId, input.orderId)).limit(1))[0];
    return { deposit, order };
  });
}

export async function markCryptoDepositPendingReview(orderId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  return db.transaction(async (tx) => {
    const deposit = (await tx.select().from(walletDeposits).where(eq(walletDeposits.paymentOrderId, orderId)).limit(1))[0];
    if (!deposit || deposit.status !== "awaiting_payment") return deposit;
    await tx.update(walletDeposits).set({ status: "pending_review", reviewNote: "Crypto payment confirmed; awaiting manual credit approval" }).where(eq(walletDeposits.id, deposit.id));
    await tx.insert(walletNotifications).values({ userId: deposit.userId, depositRequestId: deposit.id, event: "deposit_created", channel: "in_app", status: "recorded" });
    return (await tx.select().from(walletDeposits).where(eq(walletDeposits.id, deposit.id)).limit(1))[0];
  });
}

export async function getPaymentOrder(orderId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const result = await db.select().from(paymentOrders).where(eq(paymentOrders.orderId, orderId)).limit(1);
  return result[0];
}

export async function recordPaymentTransaction(transaction: InsertPaymentTransaction) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const existing = await db.select().from(paymentTransactions).where(and(eq(paymentTransactions.chain, transaction.chain), eq(paymentTransactions.txHash, transaction.txHash))).limit(1);
  if (existing[0]) {
    if (existing[0].orderId !== transaction.orderId) throw new Error("Payment transaction is already associated with another order");
    return existing[0];
  }
  await db.insert(paymentTransactions).values(transaction);
  return transaction;
}

export async function updatePaymentOrder(orderId: string, patch: Partial<InsertPaymentOrder>) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  await db.update(paymentOrders).set(patch).where(eq(paymentOrders.orderId, orderId));
  return getPaymentOrder(orderId);
}

export async function listPaymentOrders(status?: InsertPaymentOrder["status"]) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const query = status ? db.select().from(paymentOrders).where(eq(paymentOrders.status, status)) : db.select().from(paymentOrders);
  return query.orderBy(desc(paymentOrders.createdAt));
}

export async function listPaymentOrdersForCustomer(customerId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  return db.select().from(paymentOrders).where(eq(paymentOrders.customerId, customerId)).orderBy(desc(paymentOrders.createdAt));
}

export async function listPaymentTransactions(orderId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  return db.select().from(paymentTransactions).where(eq(paymentTransactions.orderId, orderId)).orderBy(desc(paymentTransactions.observedAt));
}

export async function listActivePaymentOrders() {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  return db.select().from(paymentOrders).where(inArray(paymentOrders.status, ["awaiting_payment", "detected", "confirming"]));
}

export async function getProductAvailabilityMap() {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const rows = await db.select().from(productAvailability);
  return Object.fromEntries(rows.map((row) => [row.productId, row.unavailable]));
}

export async function setProductAvailability(productId: string, unavailable: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  await db.insert(productAvailability).values({ productId, unavailable }).onDuplicateKeyUpdate({ set: { unavailable } });
}

export async function listProductFavorites(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  return db.select().from(productFavorites).where(eq(productFavorites.userId, userId)).orderBy(desc(productFavorites.createdAt));
}

export async function toggleProductFavorite(userId: number, productId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const existing = await db.select().from(productFavorites).where(and(eq(productFavorites.userId, userId), eq(productFavorites.productId, productId))).limit(1);
  if (existing[0]) {
    await db.delete(productFavorites).where(eq(productFavorites.id, existing[0].id));
    return { productId, isFavorite: false };
  }
  await db.insert(productFavorites).values({ userId, productId });
  return { productId, isFavorite: true };
}

export async function listSavedAddresses(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  return db.select().from(savedAddresses).where(eq(savedAddresses.userId, userId)).orderBy(desc(savedAddresses.isDefault), desc(savedAddresses.updatedAt));
}

export async function saveAddress(userId: number, address: Omit<InsertSavedAddress, "id" | "userId" | "createdAt" | "updatedAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  if (address.isDefault) await db.update(savedAddresses).set({ isDefault: false }).where(eq(savedAddresses.userId, userId));
  await db.insert(savedAddresses).values({ ...address, userId });
  return listSavedAddresses(userId);
}

export async function deleteSavedAddress(userId: number, id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  await db.delete(savedAddresses).where(and(eq(savedAddresses.id, id), eq(savedAddresses.userId, userId)));
}

export async function listOrderNotifications(customerId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  return db.select().from(orderNotifications).where(eq(orderNotifications.customerId, customerId)).orderBy(desc(orderNotifications.createdAt));
}

export async function recordOrderNotification(orderId: string, customerId: number | null, event: "payment_confirmed" | "pending_review" | "approved" | "rejected" | "fulfillment_ready" | "delivered") {
  const db = await getDb();
  if (!db || !customerId) return;
  await db.insert(orderNotifications).values({ orderId, customerId, event, channel: "in_app", status: "recorded" });
}

const balanceNumber = (value: unknown) => Number.parseFloat(String(value));

export async function getWalletAccount(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  await db.insert(walletAccounts).values({ userId, currency: "USD", availableBalance: "0.00", version: 0 }).onDuplicateKeyUpdate({ set: { userId } });
  const result = await db.select().from(walletAccounts).where(and(eq(walletAccounts.userId, userId), eq(walletAccounts.currency, "USD"))).limit(1);
  if (!result[0]) throw new Error("Wallet account could not be initialized");
  return result[0];
}

export async function listWalletLedger(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  return db.select().from(walletLedger).where(eq(walletLedger.userId, userId)).orderBy(desc(walletLedger.createdAt));
}

export async function createWalletDeposit(userId: number, input: { requestedAmount: number; reference: string; sourceType: "gift_card_review" | "other_manual" }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const requestCode = `ROTH-${crypto.randomUUID().replaceAll("-", "").slice(0, 8).toUpperCase()}`;
  await db.insert(walletDeposits).values({ requestCode, userId, currency: "USD", requestedAmount: input.requestedAmount.toFixed(2), proposedBonus: "0.00", sourceType: input.sourceType, referenceMasked: maskDepositReference(input.reference), status: "pending_review" });
  const result = await db.select().from(walletDeposits).where(eq(walletDeposits.requestCode, requestCode)).limit(1);
  const deposit = result[0];
  if (deposit) await db.insert(walletNotifications).values({ userId, depositRequestId: deposit.id, event: "deposit_created", channel: "in_app", status: "recorded" });
  return deposit;
}

export async function listWalletDepositsForUser(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  return db.select().from(walletDeposits).where(eq(walletDeposits.userId, userId)).orderBy(desc(walletDeposits.createdAt));
}

export async function listWalletNotifications(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  return db.select().from(walletNotifications).where(eq(walletNotifications.userId, userId)).orderBy(desc(walletNotifications.createdAt));
}

export async function listWalletDepositsForAdmin(status?: "pending_review" | "approved" | "rejected" | "cancelled") {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const query = status ? db.select().from(walletDeposits).where(eq(walletDeposits.status, status)) : db.select().from(walletDeposits);
  return query.orderBy(desc(walletDeposits.createdAt));
}

export async function approveWalletDeposit(depositId: number, adminId: number, reviewNote?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  return db.transaction(async (tx) => {
    const deposit = (await tx.select().from(walletDeposits).where(eq(walletDeposits.id, depositId)).limit(1))[0];
    if (!deposit || deposit.status !== "pending_review") throw new Error("Only pending wallet deposits can be approved");
    if (deposit.sourceType === "crypto_review" && deposit.paymentOrderId) {
      const payment = (await tx.select().from(paymentOrders).where(eq(paymentOrders.orderId, deposit.paymentOrderId)).limit(1))[0];
      if (!payment || payment.purpose !== "wallet_deposit" || payment.status !== "pending_admin") throw new Error("Crypto deposits can be credited only after the linked payment is confirmed and pending manual review");
    }
    await tx.insert(walletAccounts).values({ userId: deposit.userId, currency: "USD", availableBalance: "0.00", version: 0 }).onDuplicateKeyUpdate({ set: { userId: deposit.userId } });
    const account = (await tx.select().from(walletAccounts).where(and(eq(walletAccounts.userId, deposit.userId), eq(walletAccounts.currency, "USD"))).limit(1))[0];
    if (!account) throw new Error("Wallet account could not be initialized");
    const deposited = balanceNumber(deposit.requestedAmount);
    const bonus = balanceNumber(deposit.proposedBonus);
    const balanceAfterCredit = balanceNumber(account.availableBalance) + deposited;
    const balanceAfter = balanceAfterCredit + bonus;
    await tx.insert(walletLedger).values({ walletAccountId: account.id, userId: deposit.userId, depositRequestId: deposit.id, kind: "deposit_credit", amount: deposited.toFixed(2), balanceAfter: balanceAfterCredit.toFixed(2), idempotencyKey: `deposit:${deposit.id}:credit`, description: `Manual deposit approved: ${deposit.requestCode}`, createdByAdminId: adminId });
    if (bonus > 0) await tx.insert(walletLedger).values({ walletAccountId: account.id, userId: deposit.userId, depositRequestId: deposit.id, kind: "deposit_bonus", amount: bonus.toFixed(2), balanceAfter: balanceAfter.toFixed(2), idempotencyKey: `deposit:${deposit.id}:bonus`, description: `Manual deposit bonus: ${deposit.requestCode}`, createdByAdminId: adminId });
    await tx.update(walletAccounts).set({ availableBalance: balanceAfter.toFixed(2), version: account.version + 1 }).where(eq(walletAccounts.id, account.id));
    await tx.update(walletDeposits).set({ status: "approved", adminId, reviewNote: reviewNote?.trim() || null }).where(eq(walletDeposits.id, deposit.id));
    await tx.insert(walletNotifications).values({ userId: deposit.userId, depositRequestId: deposit.id, event: "deposit_approved", channel: "in_app", status: "recorded" });
    return (await tx.select().from(walletDeposits).where(eq(walletDeposits.id, deposit.id)).limit(1))[0];
  });
}

export async function rejectWalletDeposit(depositId: number, adminId: number, reviewNote?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const deposit = (await db.select().from(walletDeposits).where(eq(walletDeposits.id, depositId)).limit(1))[0];
  if (!deposit || deposit.status !== "pending_review") throw new Error("Only pending wallet deposits can be rejected");
  await db.update(walletDeposits).set({ status: "rejected", adminId, reviewNote: reviewNote?.trim() || null }).where(eq(walletDeposits.id, deposit.id));
  await db.insert(walletNotifications).values({ userId: deposit.userId, depositRequestId: deposit.id, event: "deposit_rejected", channel: "in_app", status: "recorded" });
  return (await db.select().from(walletDeposits).where(eq(walletDeposits.id, deposit.id)).limit(1))[0];
}

export async function getOrCreateReferralCode(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const current = (await db.select().from(referralCodes).where(eq(referralCodes.ownerUserId, userId)).limit(1))[0];
  if (current) return current;
  const code = `ROTH-${crypto.randomUUID().replaceAll("-", "").slice(0, 7).toUpperCase()}`;
  await db.insert(referralCodes).values({ ownerUserId: userId, code });
  return (await db.select().from(referralCodes).where(eq(referralCodes.ownerUserId, userId)).limit(1))[0]!;
}

export async function listReferralEvents(referrerUserId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  return db.select().from(referralEvents).where(eq(referralEvents.referrerUserId, referrerUserId)).orderBy(desc(referralEvents.createdAt));
}

export async function applyReferralCode(referredUserId: number, code: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const referral = (await db.select().from(referralCodes).where(eq(referralCodes.code, code.trim().toUpperCase())).limit(1))[0];
  if (!referral || referral.ownerUserId === referredUserId) throw new Error("Referral code is not available");
  const existing = (await db.select().from(referralEvents).where(eq(referralEvents.referredUserId, referredUserId)).limit(1))[0];
  if (existing) throw new Error("A referral code has already been applied to this account");
  await db.insert(referralEvents).values({ referralCodeId: referral.id, referrerUserId: referral.ownerUserId, referredUserId, status: "registered", bonusAmount: "0.00" });
  return { status: "registered" as const };
}

export async function listGiftCardEntitlements(userId: number): Promise<GiftCardEntitlement[]> {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  return db.select().from(giftCardEntitlements).where(eq(giftCardEntitlements.userId, userId)).orderBy(desc(giftCardEntitlements.createdAt));
}

export async function listVccEntitlements(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  return db.select().from(vccEntitlements).where(eq(vccEntitlements.userId, userId)).orderBy(desc(vccEntitlements.createdAt));
}

export async function listVccEntitlementsForAdmin() {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  return db.select().from(vccEntitlements).orderBy(desc(vccEntitlements.updatedAt));
}

export async function prepareVccEntitlement(input: { orderId: string; userId: number; title: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const existing = (await db.select().from(vccEntitlements).where(eq(vccEntitlements.orderId, input.orderId)).limit(1))[0];
  if (existing) throw new Error("A VCC handoff record already exists for this order");
  await db.insert(vccEntitlements).values({ userId: input.userId, orderId: input.orderId, title: input.title, maskedReference: `ROTH / SECURE-${input.orderId.slice(-6).toUpperCase()}`, status: "prepared", handoffNote: "Secure handoff prepared" });
  return (await db.select().from(vccEntitlements).where(eq(vccEntitlements.orderId, input.orderId)).limit(1))[0];
}

export async function markVccEntitlementHandedOff(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const entitlement = (await db.select().from(vccEntitlements).where(eq(vccEntitlements.id, id)).limit(1))[0];
  if (!entitlement || entitlement.status !== "prepared") throw new Error("Only prepared VCC handoffs can be marked complete");
  await db.update(vccEntitlements).set({ status: "handed_off", handoffNote: "Manual secure handoff recorded" }).where(eq(vccEntitlements.id, id));
  return (await db.select().from(vccEntitlements).where(eq(vccEntitlements.id, id)).limit(1))[0];
}
