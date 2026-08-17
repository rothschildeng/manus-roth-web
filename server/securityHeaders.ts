import type { RequestHandler } from "express";

type CspDirectives = Record<string, string[]>;

const baseCspDirectives: CspDirectives = {
  "default-src": ["'self'"],
  "base-uri": ["'self'"],
  "form-action": ["'self'"],
  "frame-ancestors": ["'none'"],
  "object-src": ["'none'"],
  "script-src": ["'self'"],
  "style-src": ["'self'"],
  "img-src": ["'self'", "https://d36hbw14aib5lz.cloudfront.net", "data:", "blob:"],
  "font-src": ["'self'"],
  "connect-src": ["'self'"],
  "media-src": ["'self'"],
};

function originFromEnv(value: string | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return url.origin;
  } catch {
    return null;
  }
}

export function buildContentSecurityPolicy(
  nodeEnv = process.env.NODE_ENV,
  analyticsEndpoint = process.env.VITE_ANALYTICS_ENDPOINT,
): string {
  const directives: CspDirectives = Object.fromEntries(
    Object.entries(baseCspDirectives).map(([name, sources]) => [name, [...sources]]),
  );
  const analyticsOrigin = originFromEnv(analyticsEndpoint);
  if (analyticsOrigin) {
    directives["script-src"].push(analyticsOrigin);
    directives["connect-src"].push(analyticsOrigin);
  }

  // Vite's development client needs its websocket and eval-based HMR runtime.
  // Production responses remain strict and do not include either exception.
  if (nodeEnv === "development") {
    directives["script-src"].push("'unsafe-inline'", "'unsafe-eval'");
    directives["style-src"].push("'unsafe-inline'");
    directives["connect-src"].push("ws:", "wss:");
  }

  return Object.entries(directives)
    .map(([name, sources]) => `${name} ${Array.from(new Set(sources)).join(" ")}`)
    .join("; ");
}

export const securityHeadersMiddleware: RequestHandler = (req, res, next) => {
  res.setHeader("Content-Security-Policy", buildContentSecurityPolicy());
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  // Managed storage returns a signed CloudFront redirect. Keep the requested
  // same-origin policy for application responses, but allow only this managed
  // asset route to be consumed cross-origin after the redirect.
  res.setHeader("Cross-Origin-Resource-Policy", req.path.startsWith("/manus-storage/") ? "cross-origin" : "same-origin");
  next();
};

export const securityHeaders = {
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
};
