import { trpc } from "@/lib/trpc";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

export const LANGUAGE_OPTIONS = {
  en: "English",
  hi: "हिन्दी",
  ur: "اردو",
  bn: "বাংলা",
  ta: "தமிழ்",
  te: "తెలుగు",
  mr: "मराठी",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  pt: "Português",
  ar: "العربية",
  zh: "中文",
  ja: "日本語",
  ko: "한국어",
  ru: "Русский",
  id: "Bahasa Indonesia",
  th: "ไทย",
  tr: "Türkçe",
  it: "Italiano",
} as const;

export type StoreLanguage = keyof typeof LANGUAGE_OPTIONS;
export type StoreCurrency = "USD" | "INR" | "GBP" | "EUR" | "AED" | "IDR" | "JPY" | "CNY" | "KRW" | "AUD" | "CAD" | "SGD" | "HKD" | "NZD" | "CHF" | "SEK" | "NOK" | "DKK" | "PLN" | "TRY" | "SAR" | "QAR" | "KWD" | "THB" | "MYR" | "PHP" | "VND" | "BRL" | "MXN" | "ZAR" | "NGN" | "PKR" | "BDT";

export const CURRENCY_OPTIONS: Record<StoreCurrency, string> = {
  USD: "USD / $", INR: "INR / ₹", GBP: "GBP / £", EUR: "EUR / €", AED: "AED / د.إ", IDR: "IDR / Rp", JPY: "JPY / ¥", CNY: "CNY / ¥", KRW: "KRW / ₩", AUD: "AUD / A$", CAD: "CAD / C$", SGD: "SGD / S$", HKD: "HKD / HK$", NZD: "NZD / NZ$", CHF: "CHF", SEK: "SEK / kr", NOK: "NOK / kr", DKK: "DKK / kr", PLN: "PLN / zł", TRY: "TRY / ₺", SAR: "SAR / ﷼", QAR: "QAR / ر.ق", KWD: "KWD / د.ك", THB: "THB / ฿", MYR: "MYR / RM", PHP: "PHP / ₱", VND: "VND / ₫", BRL: "BRL / R$", MXN: "MXN / Mex$", ZAR: "ZAR / R", NGN: "NGN / ₦", PKR: "PKR / ₨", BDT: "BDT / ৳",
};

const localeByLanguage: Record<StoreLanguage, string> = {
  en: "en-US", hi: "hi-IN", ur: "ur-PK", bn: "bn-BD", ta: "ta-IN", te: "te-IN", mr: "mr-IN", es: "es-ES", fr: "fr-FR", de: "de-DE", pt: "pt-BR", ar: "ar-SA", zh: "zh-CN", ja: "ja-JP", ko: "ko-KR", ru: "ru-RU", id: "id-ID", th: "th-TH", tr: "tr-TR", it: "it-IT",
};

const parsePrice = (value: string): { amount: number; currency: "USD" | "INR" | "GBP" | "IDR" } | null => {
  const normalized = value.trim();
  const symbolMatch = /^~?([₹$£])([\d,]+(?:\.\d+)?)$/.exec(normalized);
  if (symbolMatch) return { amount: Number(symbolMatch[2].replaceAll(",", "")), currency: symbolMatch[1] === "$" ? "USD" : symbolMatch[1] === "₹" ? "INR" : "GBP" };
  const idrMatch = /^([\d,]+(?:\.\d+)?)\s*K\s*IDR$/i.exec(normalized);
  if (idrMatch) return { amount: Number(idrMatch[1].replaceAll(",", "")) * 1_000, currency: "IDR" };
  return null;
};

const numberFormat = (currency: StoreCurrency, language: StoreLanguage) => new Intl.NumberFormat(localeByLanguage[language], { style: "currency", currency, maximumFractionDigits: currency === "IDR" || currency === "JPY" || currency === "KRW" || currency === "VND" ? 0 : 2 });

type StorePreferencesValue = {
  language: StoreLanguage;
  currency: StoreCurrency;
  languageLabels: typeof LANGUAGE_OPTIONS;
  currencyLabels: typeof CURRENCY_OPTIONS;
  setLanguage: (language: StoreLanguage) => void;
  setCurrency: (currency: StoreCurrency) => void;
  formatPrice: (price: string) => string;
  isRatesLoading: boolean;
};

const StorePreferencesContext = createContext<StorePreferencesValue | null>(null);
const savedOption = <T extends string>(key: string, options: readonly T[], fallback: T): T => { const saved = localStorage.getItem(key) as T | null; return saved && options.includes(saved) ? saved : fallback; };

export function StorePreferencesProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<StoreLanguage>(() => savedOption("roth-language", Object.keys(LANGUAGE_OPTIONS) as StoreLanguage[], "en"));
  const [currency, setCurrencyState] = useState<StoreCurrency>(() => savedOption("roth-currency", Object.keys(CURRENCY_OPTIONS) as StoreCurrency[], "USD"));
  const fxRates = trpc.catalog.fxRates.useQuery(undefined, { staleTime: 15 * 60_000, refetchOnWindowFocus: false });
  const setLanguage = (value: StoreLanguage) => { setLanguageState(value); localStorage.setItem("roth-language", value); };
  const setCurrency = (value: StoreCurrency) => { setCurrencyState(value); localStorage.setItem("roth-currency", value); };
  useEffect(() => { document.documentElement.lang = language; }, [language]);
  const formatPrice = useMemo(() => (price: string) => {
    const parsed = parsePrice(price);
    if (!parsed || currency === parsed.currency) return price;
    const sourceRate = fxRates.data?.[parsed.currency] ?? 1;
    const targetRate = fxRates.data?.[currency];
    if (!targetRate || !Number.isFinite(targetRate) || !Number.isFinite(sourceRate)) return price;
    const approximation = price.trim().startsWith("~") ? "~" : "";
    return `${approximation}${numberFormat(currency, language).format(parsed.amount / sourceRate * targetRate)}`;
  }, [currency, fxRates.data, language]);
  const value = useMemo(() => ({ language, currency, languageLabels: LANGUAGE_OPTIONS, currencyLabels: CURRENCY_OPTIONS, setLanguage, setCurrency, formatPrice, isRatesLoading: fxRates.isLoading }), [currency, formatPrice, fxRates.isLoading, language]);
  return <StorePreferencesContext.Provider value={value}>{children}</StorePreferencesContext.Provider>;
}

export function useStorePreferences() {
  const context = useContext(StorePreferencesContext);
  if (!context) throw new Error("useStorePreferences must be used inside StorePreferencesProvider");
  return context;
}
