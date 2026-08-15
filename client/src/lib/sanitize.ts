const INTERNAL_MARKERS = [
  "(missing from GitHub)",
  "user-supplied pricing",
  "catalog illustration",
  "brand mark",
];

/** Keeps internal catalog/sourcing metadata out of customer-facing brand labels. */
export function cleanBrand(raw: string, fallback = "ROTH DIGITAL"): string {
  if (!raw) return fallback;
  if (INTERNAL_MARKERS.some((marker) => raw.toLowerCase().includes(marker.toLowerCase()))) {
    return fallback;
  }
  return raw.trim();
}

/** Generates accessible image text from the clean customer-facing brand only. */
export function brandAlt(brand: string): string {
  return cleanBrand(brand);
}
