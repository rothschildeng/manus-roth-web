import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { clearAdminGateCookie, issueAdminGateToken, setAdminGateCookie, verifyAdminPassword } from "./adminGate";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { systemRouter } from "./_core/systemRouter";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { applyReferralCode, approveWalletDeposit, createCryptoWalletDeposit, createWalletCheckoutOrder, createWalletCheckoutOrders, createWalletDeposit, deleteSavedAddress, getOrCreateReferralCode, getPaymentOrder, getProductAvailabilityMap, getWalletAccount, listGiftCardEntitlements, listOrderNotifications, listPaymentOrders, listPaymentOrdersForCustomer, listProductFavorites, listReferralEvents, listSavedAddresses, listVccEntitlements, listVccEntitlementsForAdmin, listWalletDepositsForAdmin, listWalletDepositsForUser, listWalletLedger, listWalletNotifications, markVccEntitlementHandedOff, prepareVccEntitlement, recordOrderNotification, rejectWalletDeposit, saveAddress, setProductAvailability, toggleProductFavorite, updatePaymentOrder } from "./db";
import { getWalletConfig, paymentChainSchema } from "./payments/config";
import { refreshPaymentOrder } from "./payments/monitor";
import { fetchDisplayFxRates, quoteCatalogPriceToUsd, quoteUsdToAsset } from "./payments/rates";
import { uniquePaymentAmount } from "./payments/amounts";
import { CATEGORY_LABELS, getFullCatalog, SALE_PERCENT } from "./catalog";
import { resolveCatalogCheckout } from "./catalog/checkout";
import { transitionManualOrder } from "./payments/transitions";
import { sendTelegramMessage } from "./telegram/client";
import { getTelegramAdminChatId, getTelegramConfig } from "./telegram/config";
import { MINIMUM_WALLET_DEPOSIT_USD } from "./wallet/rules";
import { getSimilarWebOverview } from "./similarweb";

const orderInput = z.object({
  itemId: z.string().trim().min(1).max(256),
  displayPrice: z.string().trim().min(1).max(32),
  chain: paymentChainSchema,
  expiresInMinutes: z.coerce.number().int().min(5).max(120).default(30),
});

const walletOrderInput = z.object({
  itemId: z.string().trim().min(1).max(256),
  displayPrice: z.string().trim().min(1).max(32),
});

const walletOrderItemsInput = z.object({
  items: z.array(walletOrderInput.extend({ quantity: z.coerce.number().int().min(1).max(10) })).min(1).max(20),
});

const addressInput = z.object({
  label: z.string().trim().min(1).max(64),
  recipientName: z.string().trim().min(1).max(160),
  line1: z.string().trim().min(1).max(255),
  line2: z.string().trim().max(255).optional(),
  city: z.string().trim().min(1).max(120),
  region: z.string().trim().max(120).optional(),
  postalCode: z.string().trim().min(1).max(32),
  country: z.string().trim().min(1).max(96),
  phone: z.string().trim().max(48).optional(),
  isDefault: z.boolean().default(false),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  adminGate: router({
    status: protectedProcedure.query(({ ctx }) => ({ isAdmin: ctx.user.role === "admin", unlocked: ctx.user.role === "admin" && ctx.adminGateUnlocked })),
    unlock: protectedProcedure.input(z.object({ password: z.string().min(1).max(256) })).mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Administrator access required" });
      if (!verifyAdminPassword(input.password)) throw new TRPCError({ code: "FORBIDDEN", message: "Invalid administrator password" });
      setAdminGateCookie(ctx.req, ctx.res, await issueAdminGateToken(ctx.user.openId));
      return { unlocked: true } as const;
    }),
    lock: protectedProcedure.mutation(({ ctx }) => {
      clearAdminGateCookie(ctx.req, ctx.res);
      return { unlocked: false } as const;
    }),
  }),
  catalog: router({
    list: publicProcedure.query(async () => ({
      products: getFullCatalog(),
      categories: CATEGORY_LABELS,
      salePercent: SALE_PERCENT,
      availability: await getProductAvailabilityMap(),
    })),
    fxRates: publicProcedure.query(() => fetchDisplayFxRates()),
  }),
  favorites: router({
    list: protectedProcedure.query(async ({ ctx }) => (await listProductFavorites(ctx.user.id)).map((favorite) => favorite.productId)),
    toggle: protectedProcedure.input(z.object({ productId: z.string().trim().min(1).max(256) })).mutation(async ({ input, ctx }) => {
      if (!getFullCatalog().some((product) => `${product.group} — ${product.label}` === input.productId)) throw new TRPCError({ code: "BAD_REQUEST", message: "Product is no longer available in the catalog" });
      return toggleProductFavorite(ctx.user.id, input.productId);
    }),
  }),
  adminCatalog: router({
    setAvailability: adminProcedure.input(z.object({ productId: z.string().trim().min(1).max(256), unavailable: z.boolean() })).mutation(async ({ input }) => {
      if (!getFullCatalog().some((product) => `${product.group} — ${product.label}` === input.productId)) throw new TRPCError({ code: "BAD_REQUEST", message: "Product is not in the repository catalog" });
      await setProductAvailability(input.productId, input.unavailable);
      return { success: true };
    }),
  }),
  similarWeb: router({
    overview: adminProcedure.query(() => getSimilarWebOverview()),
  }),
  profile: router({
    addresses: protectedProcedure.query(({ ctx }) => listSavedAddresses(ctx.user.id)),
    saveAddress: protectedProcedure.input(addressInput).mutation(({ input, ctx }) => saveAddress(ctx.user.id, input)),
    deleteAddress: protectedProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ input, ctx }) => {
      await deleteSavedAddress(ctx.user.id, input.id);
      return { success: true };
    }),
    notifications: protectedProcedure.query(({ ctx }) => listOrderNotifications(ctx.user.id)),
  }),
  wallet: router({
    overview: protectedProcedure.query(async ({ ctx }) => {
      const [account, ledger, deposits, notifications, referralCode, referralEvents, giftCards] = await Promise.all([getWalletAccount(ctx.user.id), listWalletLedger(ctx.user.id), listWalletDepositsForUser(ctx.user.id), listWalletNotifications(ctx.user.id), getOrCreateReferralCode(ctx.user.id), listReferralEvents(ctx.user.id), listGiftCardEntitlements(ctx.user.id)]);
      return { account, ledger, deposits, notifications, referralCode, referralEvents, giftCards };
    }),
    createDeposit: protectedProcedure.input(z.object({ amount: z.coerce.number().min(MINIMUM_WALLET_DEPOSIT_USD).max(10_000), sourceType: z.enum(["gift_card_review", "other_manual"]), reference: z.string().trim().min(4).max(128) })).mutation(async ({ input, ctx }) => {
      const deposit = await createWalletDeposit(ctx.user.id, { requestedAmount: input.amount, sourceType: input.sourceType, reference: input.reference });
      const chatId = getTelegramAdminChatId();
      if (deposit && chatId && getTelegramConfig("admin")) await sendTelegramMessage("admin", Number(chatId), `<b>ROTH WALLET REVIEW</b>\nRequest: <b>${deposit.requestCode}</b>\nAmount: <b>$${deposit.requestedAmount} ${deposit.currency}</b>\nReference: <code>${deposit.referenceMasked}</code>\n\nMasked reference only. Use your approved secure verification process before any manual credit.`).catch(() => undefined);
      return deposit;
    }),
    createCryptoDeposit: protectedProcedure.input(z.object({ amount: z.coerce.number().min(MINIMUM_WALLET_DEPOSIT_USD).max(10_000), chain: paymentChainSchema, expiresInMinutes: z.coerce.number().int().min(5).max(120).default(30) })).mutation(async ({ input, ctx }) => {
      let wallet;
      try {
        wallet = getWalletConfig(input.chain);
      } catch (error) {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: error instanceof Error ? error.message : "Crypto deposit is not configured" });
      }
      const orderId = crypto.randomUUID().replaceAll("-", "").slice(0, 24);
      const quote = await quoteUsdToAsset(input.chain, input.amount);
      const deposit = await createCryptoWalletDeposit({ orderId, userId: ctx.user.id, chain: input.chain, asset: wallet.asset, expectedUsd: input.amount.toFixed(2), expectedAmount: uniquePaymentAmount(input.chain, quote.amount, orderId), receivingAddress: wallet.address, requiredConfirmations: wallet.requiredConfirmations, expiresAt: new Date(Date.now() + input.expiresInMinutes * 60_000) });
      return { ...deposit, asset: wallet.asset, address: wallet.address };
    }),
    applyReferral: protectedProcedure.input(z.object({ code: z.string().trim().min(6).max(32) })).mutation(({ input, ctx }) => applyReferralCode(ctx.user.id, input.code)),
  }),
  adminWallet: router({
    deposits: adminProcedure.input(z.object({ status: z.enum(["pending_review", "approved", "rejected", "cancelled"]).optional() }).optional()).query(({ input }) => listWalletDepositsForAdmin(input?.status)),
    approveDeposit: adminProcedure.input(z.object({ depositId: z.number().int().positive(), reviewNote: z.string().trim().max(255).optional() })).mutation(({ input, ctx }) => approveWalletDeposit(input.depositId, ctx.user.id, input.reviewNote)),
    rejectDeposit: adminProcedure.input(z.object({ depositId: z.number().int().positive(), reviewNote: z.string().trim().max(255).optional() })).mutation(({ input, ctx }) => rejectWalletDeposit(input.depositId, ctx.user.id, input.reviewNote)),
  }),
  vcc: router({
    mine: protectedProcedure.query(({ ctx }) => listVccEntitlements(ctx.user.id)),
    adminList: adminProcedure.query(() => listVccEntitlementsForAdmin()),
    prepare: adminProcedure.input(z.object({ orderId: z.string().min(8).max(64) }).strict()).mutation(async ({ input }) => {
      const order = await getPaymentOrder(input.orderId);
      const catalogProduct = order ? getFullCatalog().find((product) => `${product.group} — ${product.label}` === order.itemId) : null;
      if (!order || !catalogProduct || catalogProduct.category !== "vcc" || !order.customerId || !["approved", "fulfillment_ready"].includes(order.status)) throw new TRPCError({ code: "BAD_REQUEST", message: "Only approved signed-in VCC orders can enter secure handoff preparation" });
      return prepareVccEntitlement({ orderId: order.orderId, userId: order.customerId, title: order.itemId });
    }),
    markHandedOff: adminProcedure.input(z.object({ id: z.number().int().positive() }).strict()).mutation(({ input }) => markVccEntitlementHandedOff(input.id)),
  }),
  payment: router({
    createOrder: publicProcedure.input(orderInput).mutation(() => {
      throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Direct payment checkout is disabled. Sign in, fund your wallet through the manual Flipkart review flow, then create a wallet order request." });
    }),
    createWalletOrder: protectedProcedure.input(walletOrderInput).mutation(async ({ input, ctx }) => {
      const availability = await getProductAvailabilityMap();
      let catalogProduct;
      try {
        catalogProduct = resolveCatalogCheckout({ itemId: input.itemId, displayPrice: input.displayPrice, availability });
      } catch (error) {
        throw new TRPCError({ code: "BAD_REQUEST", message: error instanceof Error ? error.message : "This catalog item is unavailable" });
      }
      const catalogQuote = await quoteCatalogPriceToUsd(catalogProduct.pay);
      if (catalogQuote.usd > 100_000) throw new TRPCError({ code: "BAD_REQUEST", message: "This order exceeds the checkout limit" });
      const orderId = crypto.randomUUID().replaceAll("-", "").slice(0, 24);
      return createWalletCheckoutOrder({ orderId, userId: ctx.user.id, itemId: input.itemId, expectedUsd: catalogQuote.usd.toFixed(2), expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60_000) });
    }),
    createWalletOrders: protectedProcedure.input(walletOrderItemsInput).mutation(async ({ input, ctx }) => {
      const availability = await getProductAvailabilityMap();
      const orders = [] as Array<{ orderId: string; itemId: string; expectedUsd: string; quantity: number }>;
      for (const item of input.items) {
        let catalogProduct;
        try {
          catalogProduct = resolveCatalogCheckout({ itemId: item.itemId, displayPrice: item.displayPrice, availability });
        } catch (error) {
          throw new TRPCError({ code: "BAD_REQUEST", message: error instanceof Error ? error.message : "This catalog item is unavailable" });
        }
        const catalogQuote = await quoteCatalogPriceToUsd(catalogProduct.pay);
        const total = catalogQuote.usd * item.quantity;
        if (total > 100_000) throw new TRPCError({ code: "BAD_REQUEST", message: "This order exceeds the checkout limit" });
        orders.push({ orderId: crypto.randomUUID().replaceAll("-", "").slice(0, 24), itemId: item.itemId, expectedUsd: total.toFixed(2), quantity: item.quantity });
      }
      return createWalletCheckoutOrders({ userId: ctx.user.id, orders, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60_000) });
    }),
    getStatus: publicProcedure.input(z.object({ orderId: z.string().min(8).max(64) })).query(({ input }) => getPaymentOrder(input.orderId)),
    refresh: publicProcedure.input(z.object({ orderId: z.string().min(8).max(64) })).mutation(({ input }) => refreshPaymentOrder(input.orderId)),
    myOrders: protectedProcedure.query(({ ctx }) => listPaymentOrdersForCustomer(ctx.user.id)),
    adminList: adminProcedure.input(z.object({ status: z.enum(["awaiting_payment", "detected", "confirming", "pending_admin", "approved", "rejected", "expired"]).optional() }).optional()).query(({ input }) => listPaymentOrders(input?.status)),
    approve: adminProcedure.input(z.object({ orderId: z.string().min(8).max(64) })).mutation(async ({ input }) => {
      const order = await getPaymentOrder(input.orderId);
      const nextStatus = order ? transitionManualOrder(order.status, "approve") : null;
      if (!order || order.purpose === "wallet_deposit" || !nextStatus) throw new TRPCError({ code: "BAD_REQUEST", message: "Wallet deposits must be credited from the dedicated admin wallet review desk after confirmation" });
      const updated = await updatePaymentOrder(input.orderId, { status: nextStatus });
      await recordOrderNotification(input.orderId, order.customerId, "approved");
      return updated;
    }),
    reject: adminProcedure.input(z.object({ orderId: z.string().min(8).max(64) })).mutation(async ({ input }) => {
      const order = await getPaymentOrder(input.orderId);
      const nextStatus = order ? transitionManualOrder(order.status, "reject") : null;
      if (!order || order.purpose === "wallet_deposit" || !nextStatus) throw new TRPCError({ code: "BAD_REQUEST", message: "Wallet deposits must be rejected from the dedicated admin wallet review desk" });
      const updated = await updatePaymentOrder(input.orderId, { status: nextStatus });
      await recordOrderNotification(input.orderId, order.customerId, "rejected");
      return updated;
    }),
    advanceFulfillment: adminProcedure.input(z.object({ orderId: z.string().min(8).max(64), action: z.enum(["ready", "deliver"]) })).mutation(async ({ input }) => {
      const order = await getPaymentOrder(input.orderId);
      const nextStatus = order ? transitionManualOrder(order.status, input.action) : null;
      if (!order || order.purpose === "wallet_deposit" || !nextStatus) throw new TRPCError({ code: "BAD_REQUEST", message: "Wallet deposit records do not enter fulfilment" });
      const updated = await updatePaymentOrder(input.orderId, { status: nextStatus });
      await recordOrderNotification(input.orderId, order.customerId, nextStatus === "fulfillment_ready" ? "fulfillment_ready" : "delivered");
      return updated;
    }),
  }),
});

export type AppRouter = typeof appRouter;
