import { boolean, decimal, int, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const paymentOrders = mysqlTable("paymentOrders", {
  id: int("id").autoincrement().primaryKey(),
  orderId: varchar("orderId", { length: 64 }).notNull().unique(),
  customerId: int("customerId"),
  itemId: varchar("itemId", { length: 256 }).notNull(),
  quantity: int("quantity").default(1).notNull(),
  purpose: mysqlEnum("purpose", ["purchase", "wallet_deposit"]).default("purchase").notNull(),
  chain: mysqlEnum("chain", ["TON", "USDT_BEP20", "SOLANA", "BTC", "ETH", "WALLET"]).notNull(),
  asset: varchar("asset", { length: 24 }).notNull(),
  expectedUsd: decimal("expectedUsd", { precision: 18, scale: 2 }).notNull(),
  expectedAmount: decimal("expectedAmount", { precision: 36, scale: 18 }).notNull(),
  receivingAddress: varchar("receivingAddress", { length: 128 }).notNull(),
  status: mysqlEnum("status", ["awaiting_payment", "detected", "confirming", "pending_admin", "approved", "fulfillment_ready", "delivered", "rejected", "expired"]).default("awaiting_payment").notNull(),
  txHash: varchar("txHash", { length: 160 }),
  confirmations: int("confirmations").default(0).notNull(),
  requiredConfirmations: int("requiredConfirmations").default(1).notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const paymentTransactions = mysqlTable("paymentTransactions", {
  id: int("id").autoincrement().primaryKey(),
  orderId: varchar("orderId", { length: 64 }).notNull(),
  chain: mysqlEnum("chain", ["TON", "USDT_BEP20", "SOLANA", "BTC", "ETH", "WALLET"]).notNull(),
  txHash: varchar("txHash", { length: 160 }).notNull(),
  amount: decimal("amount", { precision: 36, scale: 18 }).notNull(),
  confirmations: int("confirmations").default(0).notNull(),
  observedAt: timestamp("observedAt").defaultNow().notNull(),
}, (table) => [uniqueIndex("paymentTransactions_chain_txHash_unique").on(table.chain, table.txHash)]);

export const productAvailability = mysqlTable("productAvailability", {
  id: int("id").autoincrement().primaryKey(),
  productId: varchar("productId", { length: 256 }).notNull().unique(),
  unavailable: boolean("unavailable").default(false).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const savedAddresses = mysqlTable("savedAddresses", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  label: varchar("label", { length: 64 }).notNull(),
  recipientName: varchar("recipientName", { length: 160 }).notNull(),
  line1: varchar("line1", { length: 255 }).notNull(),
  line2: varchar("line2", { length: 255 }),
  city: varchar("city", { length: 120 }).notNull(),
  region: varchar("region", { length: 120 }),
  postalCode: varchar("postalCode", { length: 32 }).notNull(),
  country: varchar("country", { length: 96 }).notNull(),
  phone: varchar("phone", { length: 48 }),
  isDefault: boolean("isDefault").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const productFavorites = mysqlTable("productFavorites", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  productId: varchar("productId", { length: 256 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [uniqueIndex("productFavorites_user_product_unique").on(table.userId, table.productId)]);

export const orderNotifications = mysqlTable("orderNotifications", {
  id: int("id").autoincrement().primaryKey(),
  orderId: varchar("orderId", { length: 64 }).notNull(),
  customerId: int("customerId"),
  event: mysqlEnum("event", ["payment_confirmed", "pending_review", "approved", "rejected", "fulfillment_ready", "delivered"]).notNull(),
  channel: mysqlEnum("channel", ["in_app", "email", "whatsapp", "telegram"]).default("in_app").notNull(),
  status: mysqlEnum("status", ["recorded", "queued", "sent", "failed"]).default("recorded").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/** One customer wallet per supported internal display currency. Balances only change through walletLedger entries. */
export const walletAccounts = mysqlTable("walletAccounts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  currency: mysqlEnum("currency", ["USD"]).default("USD").notNull(),
  availableBalance: decimal("availableBalance", { precision: 18, scale: 2 }).default("0.00").notNull(),
  version: int("version").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [uniqueIndex("walletAccounts_user_currency_unique").on(table.userId, table.currency)]);

/** Immutable financial audit trail. Customer funds are only added after a protected manual decision. */
export const walletLedger = mysqlTable("walletLedger", {
  id: int("id").autoincrement().primaryKey(),
  walletAccountId: int("walletAccountId").notNull(),
  userId: int("userId").notNull(),
  depositRequestId: int("depositRequestId"),
  kind: mysqlEnum("kind", ["deposit_credit", "deposit_bonus", "manual_adjustment", "order_debit"]).notNull(),
  amount: decimal("amount", { precision: 18, scale: 2 }).notNull(),
  balanceAfter: decimal("balanceAfter", { precision: 18, scale: 2 }).notNull(),
  idempotencyKey: varchar("idempotencyKey", { length: 96 }).notNull().unique(),
  description: varchar("description", { length: 255 }).notNull(),
  createdByAdminId: int("createdByAdminId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/** Deposit requests intentionally retain only a masked reference. The gift-card code itself is never stored or sent to a bot. */
export const walletDeposits = mysqlTable("walletDeposits", {
  id: int("id").autoincrement().primaryKey(),
  requestCode: varchar("requestCode", { length: 32 }).notNull().unique(),
  userId: int("userId").notNull(),
  paymentOrderId: varchar("paymentOrderId", { length: 64 }).unique(),
  currency: mysqlEnum("currency", ["USD"]).default("USD").notNull(),
  requestedAmount: decimal("requestedAmount", { precision: 18, scale: 2 }).notNull(),
  proposedBonus: decimal("proposedBonus", { precision: 18, scale: 2 }).default("0.00").notNull(),
  sourceType: mysqlEnum("sourceType", ["gift_card_review", "crypto_review", "other_manual"]).default("gift_card_review").notNull(),
  referenceMasked: varchar("referenceMasked", { length: 128 }).notNull(),
  status: mysqlEnum("status", ["awaiting_payment", "pending_review", "approved", "rejected", "cancelled"]).default("pending_review").notNull(),
  adminId: int("adminId"),
  reviewNote: varchar("reviewNote", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const walletNotifications = mysqlTable("walletNotifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  depositRequestId: int("depositRequestId").notNull(),
  event: mysqlEnum("event", ["deposit_created", "deposit_approved", "deposit_rejected"]).notNull(),
  channel: mysqlEnum("channel", ["in_app", "email", "whatsapp", "telegram"]).default("in_app").notNull(),
  status: mysqlEnum("status", ["recorded", "queued", "sent", "failed"]).default("recorded").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const referralCodes = mysqlTable("referralCodes", {
  id: int("id").autoincrement().primaryKey(),
  ownerUserId: int("ownerUserId").notNull().unique(),
  code: varchar("code", { length: 32 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const referralEvents = mysqlTable("referralEvents", {
  id: int("id").autoincrement().primaryKey(),
  referralCodeId: int("referralCodeId").notNull(),
  referrerUserId: int("referrerUserId").notNull(),
  referredUserId: int("referredUserId").notNull().unique(),
  status: mysqlEnum("status", ["registered", "qualified", "credited", "rejected"]).default("registered").notNull(),
  bonusAmount: decimal("bonusAmount", { precision: 18, scale: 2 }).default("0.00").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/** Issued entitlements list only masked code fragments; raw redeemable values require a separately approved secure vault. */
export const giftCardEntitlements = mysqlTable("giftCardEntitlements", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  orderId: varchar("orderId", { length: 64 }),
  title: varchar("title", { length: 255 }).notNull(),
  codeMasked: varchar("codeMasked", { length: 128 }).notNull(),
  status: mysqlEnum("status", ["issued", "redeemed", "expired"]).default("issued").notNull(),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/** VCC handoff records are deliberately metadata-only. Card number, CVV, expiry, and usable credentials never enter this application database. */
export const vccEntitlements = mysqlTable("vccEntitlements", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  orderId: varchar("orderId", { length: 64 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  maskedReference: varchar("maskedReference", { length: 128 }).notNull(),
  status: mysqlEnum("status", ["prepared", "handed_off", "revoked"]).default("prepared").notNull(),
  handoffNote: varchar("handoffNote", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type PaymentOrder = typeof paymentOrders.$inferSelect;
export type InsertPaymentOrder = typeof paymentOrders.$inferInsert;
export type PaymentTransaction = typeof paymentTransactions.$inferSelect;
export type InsertPaymentTransaction = typeof paymentTransactions.$inferInsert;
export type ProductAvailability = typeof productAvailability.$inferSelect;
export type InsertProductAvailability = typeof productAvailability.$inferInsert;
export type SavedAddress = typeof savedAddresses.$inferSelect;
export type InsertSavedAddress = typeof savedAddresses.$inferInsert;
export type ProductFavorite = typeof productFavorites.$inferSelect;
export type InsertProductFavorite = typeof productFavorites.$inferInsert;
export type OrderNotification = typeof orderNotifications.$inferSelect;
export type InsertOrderNotification = typeof orderNotifications.$inferInsert;
export type WalletAccount = typeof walletAccounts.$inferSelect;
export type InsertWalletAccount = typeof walletAccounts.$inferInsert;
export type WalletLedgerEntry = typeof walletLedger.$inferSelect;
export type InsertWalletLedgerEntry = typeof walletLedger.$inferInsert;
export type WalletDeposit = typeof walletDeposits.$inferSelect;
export type InsertWalletDeposit = typeof walletDeposits.$inferInsert;
export type WalletNotification = typeof walletNotifications.$inferSelect;
export type VccEntitlement = typeof vccEntitlements.$inferSelect;
export type ReferralCode = typeof referralCodes.$inferSelect;
export type ReferralEvent = typeof referralEvents.$inferSelect;
export type GiftCardEntitlement = typeof giftCardEntitlements.$inferSelect;
