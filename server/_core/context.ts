import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { hasValidAdminGate } from "../adminGate";
import { sdk } from "./sdk";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
  adminGateUnlocked: boolean;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;
  let adminGateUnlocked = false;

  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  if (user?.role === "admin") {
    adminGateUnlocked = await hasValidAdminGate(opts.req, user.openId);
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
    adminGateUnlocked,
  };
}
