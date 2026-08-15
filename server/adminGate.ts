import crypto from "node:crypto";
import type { Request, Response } from "express";
import { SignJWT, jwtVerify } from "jose";
import { parse } from "cookie";
import { ADMIN_GATE_COOKIE } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { ENV } from "./_core/env";

const GATE_DURATION_SECONDS = 60 * 60 * 12;

function signingKey() {
  const seed = `${ENV.cookieSecret}:${process.env.ADMIN_PANEL_PASSWORD ?? ""}`;
  return crypto.createHash("sha256").update(seed).digest();
}

export function verifyAdminPassword(candidate: string) {
  const configured = process.env.ADMIN_PANEL_PASSWORD;
  if (!configured || !candidate) return false;
  const configuredBytes = Buffer.from(configured);
  const candidateBytes = Buffer.from(candidate);
  return configuredBytes.length === candidateBytes.length && crypto.timingSafeEqual(configuredBytes, candidateBytes);
}

export async function issueAdminGateToken(openId: string) {
  return new SignJWT({ scope: "admin-gate" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(openId)
    .setIssuedAt()
    .setExpirationTime(`${GATE_DURATION_SECONDS}s`)
    .sign(signingKey());
}

export async function hasValidAdminGate(req: Request, openId: string) {
  const token = parse(req.headers.cookie ?? "")[ADMIN_GATE_COOKIE];
  if (!token) return false;
  try {
    const verified = await jwtVerify(token, signingKey());
    return verified.payload.scope === "admin-gate" && verified.payload.sub === openId;
  } catch {
    return false;
  }
}

export function setAdminGateCookie(req: Request, res: Response, token: string) {
  res.cookie(ADMIN_GATE_COOKIE, token, {
    ...getSessionCookieOptions(req),
    maxAge: GATE_DURATION_SECONDS * 1000,
  });
}

export function clearAdminGateCookie(req: Request, res: Response) {
  res.clearCookie(ADMIN_GATE_COOKIE, { ...getSessionCookieOptions(req), maxAge: -1 });
}
