import type { Request, Response } from "express";
import { listActivePaymentOrders } from "../db";
import { sdk } from "../_core/sdk";
import { refreshPaymentOrder } from "./monitor";

export async function scanActivePayments(req: Request, res: Response) {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron || !user.taskUid) return res.status(403).json({ error: "cron-only" });

    const activeOrders = await listActivePaymentOrders();
    const settled = await Promise.allSettled(activeOrders.map((order) => refreshPaymentOrder(order.orderId)));
    const failed = settled.filter((result) => result.status === "rejected").length;
    return res.json({ ok: true, scanned: activeOrders.length, failed, taskUid: user.taskUid });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown payment scan failure";
    console.error("[payments.scan]", error);
    return res.status(500).json({ error: message, timestamp: new Date().toISOString() });
  }
}
