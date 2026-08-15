// ─── Shared product catalog data ───────────────────────────────────────────
// Single source of truth for the ROTH DIGITAL product catalog. Used by the
// Telegram bot (artifacts/api-server/src/bot.ts) and the website storefront.
// Pure data only — no env access, no side effects.

export interface PayGet {
  pay: string;
  get: string;
  /** Original (pre-sale) price — present only while a storewide sale is active. */
  origPay?: string;
}

export interface LabelPay {
  label: string;
  pay: string;
  /** Original (pre-sale) price — present only while a storewide sale is active. */
  origPay?: string;
  /** Manual quote only: intentionally excluded from cart and crypto checkout. */
  quoteOnly?: boolean;
  /** Colour variants (electronics). Colour never changes the price; the final
   *  order productName becomes `${label} · ${colour}`. */
  colors?: string[];
}

export interface CardPricing {
  monthly?: number;
  yearly?: number;
  multiMonthly?: number;
  multiYearly?: number;
  lifetime?: number;
  multiLifetime?: number;
}

export const INDIAN_BRANDS: Record<string, PayGet[]> = {
  "🛒 Amazon India": [
    { pay: "₹1,549", get: "₹5,000" },
    { pay: "₹2,999", get: "₹7,000" },
    { pay: "₹4,999", get: "₹11,500" },
    { pay: "₹9,999", get: "₹15,000" },
    { pay: "₹19,999", get: "₹36,000" },
  ],
  "🛍️ Flipkart": [
    { pay: "₹2,999", get: "₹7,000" },
    { pay: "₹4,999", get: "₹11,500" },
    { pay: "₹9,999", get: "₹15,000" },
    { pay: "₹19,999", get: "₹36,000" },
  ],
  "👗 Myntra": [
    { pay: "₹1,549", get: "₹5,000" },
    { pay: "₹2,999", get: "₹7,000" },
    { pay: "₹4,999", get: "₹11,500" },
    { pay: "₹19,999", get: "₹36,000" },
  ],
  "👔 AJIO": [
    { pay: "₹1,549", get: "₹5,000" },
    { pay: "₹2,999", get: "₹7,000" },
    { pay: "₹4,999", get: "₹11,500" },
  ],
  "🧵 Meesho": [
    { pay: "₹1,549", get: "₹5,000" },
    { pay: "₹2,999", get: "₹7,000" },
  ],
  "💄 Nykaa": [
    { pay: "₹1,549", get: "₹5,000" },
    { pay: "₹2,999", get: "₹7,000" },
    { pay: "₹4,999", get: "₹11,500" },
  ],
  "🍔 Swiggy": [
    { pay: "₹1,549", get: "₹5,000" },
    { pay: "₹2,999", get: "₹7,000" },
  ],
  "🍕 Zomato": [
    { pay: "₹1,549", get: "₹5,000" },
    { pay: "₹2,999", get: "₹7,000" },
  ],
  "🛵 Ola": [
    { pay: "₹1,549", get: "₹5,000" },
    { pay: "₹2,999", get: "₹7,000" },
  ],
  "🎮 Google Play India": [
    { pay: "₹1,549", get: "₹5,000" },
    { pay: "₹2,999", get: "₹7,000" },
    { pay: "₹4,999", get: "₹11,500" },
  ],
  "🎬 Netflix India": [
    { pay: "₹1,549", get: "₹5,000" },
    { pay: "₹2,999", get: "₹7,000" },
  ],
  "🍔 BigBasket": [
    { pay: "₹1,549", get: "₹5,000" },
    { pay: "₹2,999", get: "₹7,000" },
  ],
  "✈️ MakeMyTrip": [
    { pay: "₹2,999", get: "₹7,000" },
    { pay: "₹4,999", get: "₹11,500" },
  ],
  "🏨 Airbnb India": [
    { pay: "₹2,999", get: "₹7,000" },
    { pay: "₹4,999", get: "₹11,500" },
  ],
  "🛒 Tata CLiQ": [
    { pay: "₹1,549", get: "₹5,000" },
    { pay: "₹2,999", get: "₹7,000" },
  ],
  "💊 PharmEasy": [
    { pay: "₹1,549", get: "₹5,000" },
    { pay: "₹2,999", get: "₹7,000" },
  ],
  "🎓 Coursera India": [
    { pay: "₹2,999", get: "₹7,000" },
    { pay: "₹4,999", get: "₹11,500" },
  ],
};

export const INTL_BRANDS: Record<string, PayGet[]> = {
  "🛒 Amazon US": [
    { pay: "$15", get: "$50" },
    { pay: "$30", get: "$70" },
    { pay: "$50", get: "$120" },
    { pay: "$100", get: "$150" },
    { pay: "$200", get: "$360" },
  ],
  "🍎 iTunes US": [
    { pay: "$15", get: "$50" },
    { pay: "$30", get: "$70" },
    { pay: "$50", get: "$120" },
    { pay: "$100", get: "$150" },
  ],
  "🎮 Google Play US": [
    { pay: "$15", get: "$50" },
    { pay: "$30", get: "$70" },
    { pay: "$50", get: "$120" },
  ],
  "🇬🇧 Amazon UK": [
    { pay: "£30", get: "$70" },
    { pay: "£50", get: "$120" },
  ],
  "🇬🇧 iTunes UK": [
    { pay: "£15", get: "$50" },
    { pay: "£25", get: "$70" },
  ],
  "🇬🇧 Google Play UK": [{ pay: "£15", get: "$50" }],
  "🇮🇩 Steam ID": [{ pay: "50K IDR", get: "$7" }],
  "🇮🇩 Google Play ID": [{ pay: "50K IDR", get: "$7" }],
  "🏪 Walmart": [
    { pay: "$25", get: "$50" },
    { pay: "$50", get: "$120" },
  ],
  "🛍️ eBay": [
    { pay: "$25", get: "$50" },
    { pay: "$50", get: "$120" },
  ],
  "🚗 Uber": [{ pay: "$15", get: "$50" }],
  "💳 PayPal": [{ pay: "$10", get: "$50" }],
  "🍎 Apple Pay": [
    { pay: "$15", get: "$50" },
    { pay: "$50", get: "$120" },
  ],
  "🎮 Steam": [
    { pay: "$20", get: "$50" },
    { pay: "$50", get: "$120" },
  ],
  "🎯 Xbox": [
    { pay: "$15", get: "$50" },
    { pay: "$50", get: "$120" },
  ],
  "🎮 PSN": [
    { pay: "$15", get: "$50" },
    { pay: "$50", get: "$120" },
  ],
  "🎮 Nintendo eShop US": [
    { pay: "$15", get: "$50" },
    { pay: "$25", get: "$70" },
    { pay: "$50", get: "$120" },
  ],
  "⚔️ Razer Gold US": [
    { pay: "$10", get: "$50" },
    { pay: "$25", get: "$70" },
    { pay: "$50", get: "$120" },
  ],
  "💬 Discord Nitro": [
    { pay: "$5", get: "$10" },
    { pay: "$25", get: "$50" },
  ],
  "🎬 Netflix US": [
    { pay: "$15", get: "$50" },
    { pay: "$30", get: "$70" },
    { pay: "$50", get: "$120" },
  ],
  "🎵 Spotify US": [
    { pay: "$10", get: "$30" },
    { pay: "$25", get: "$60" },
  ],
  "🎮 Roblox Gift Card": [
    { pay: "$10", get: "$10" },
    { pay: "$25", get: "$25" },
    { pay: "$50", get: "$50" },
  ],
  "📱 Apple App Store US": [
    { pay: "$15", get: "$50" },
    { pay: "$30", get: "$70" },
    { pay: "$50", get: "$120" },
  ],
  "🇦🇪 Amazon UAE": [
    { pay: "$15", get: "$50" },
    { pay: "$30", get: "$70" },
  ],
  "🇦🇪 Google Play UAE": [
    { pay: "$10", get: "$30" },
    { pay: "$25", get: "$60" },
  ],
  "🇸🇦 iTunes Saudi": [
    { pay: "$15", get: "$50" },
    { pay: "$30", get: "$70" },
  ],
  "🇧🇷 Google Play Brazil": [
    { pay: "$10", get: "$30" },
    { pay: "$25", get: "$60" },
  ],
  "🇹🇷 Steam Turkey": [
    { pay: "$5", get: "$20" },
    { pay: "$15", get: "$50" },
  ],
  "🎮 Garena Shells": [
    { pay: "$10", get: "$30" },
    { pay: "$25", get: "$70" },
  ],
};

export const BINANCE_PKGS: PayGet[] = [
  { pay: "$30", get: "$70" },
  { pay: "$50", get: "$120" },
  { pay: "$100", get: "$150" },
  { pay: "$200", get: "$360" },
];

export const GAME_TITLES: Record<string, LabelPay[]> = {
  "🔥 Free Fire Diamonds": [
    { label: "100 💎", pay: "$0.30" },
    { label: "310 💎", pay: "$0.90" },
    { label: "520 💎", pay: "$1.50" },
    { label: "1060 💎", pay: "$3.00" },
    { label: "2180 💎", pay: "$6.00" },
    { label: "5600 💎", pay: "$15.00" },
  ],
  "🎯 BGMI UC (India)": [
    { label: "60 UC", pay: "₹29" },
    { label: "325 UC", pay: "₹139" },
    { label: "660 UC", pay: "₹269" },
    { label: "1800 UC", pay: "₹679" },
    { label: "3850 UC", pay: "₹1,349" },
    { label: "8100 UC", pay: "₹2,699" },
  ],
  "🟫 Roblox Robux": [
    { label: "400 Robux", pay: "$1.50" },
    { label: "800 Robux", pay: "$3.00" },
    { label: "1700 Robux", pay: "$6.00" },
    { label: "4500 Robux", pay: "$15.00" },
    { label: "10000 Robux", pay: "$30.00" },
  ],
  "🔫 PUBG Mobile UC": [
    { label: "60 UC", pay: "$0.99" },
    { label: "325 UC", pay: "$4.99" },
    { label: "660 UC", pay: "$9.99" },
    { label: "1800 UC", pay: "$24.99" },
    { label: "3850 UC", pay: "$49.99" },
    { label: "8100 UC", pay: "$99.99" },
  ],
  "⚔️ Mobile Legends Diamonds": [
    { label: "86 Diamonds", pay: "$1.99" },
    { label: "172 Diamonds", pay: "$3.99" },
    { label: "257 Diamonds", pay: "$5.99" },
    { label: "706 Diamonds", pay: "$14.99" },
    { label: "2195 Diamonds", pay: "$44.99" },
    { label: "5532 Diamonds", pay: "$99.99" },
  ],
  "🎴 Clash of Clans Gems": [
    { label: "80 Gems", pay: "$0.99" },
    { label: "500 Gems", pay: "$4.99" },
    { label: "1200 Gems", pay: "$9.99" },
    { label: "2500 Gems", pay: "$19.99" },
    { label: "6500 Gems", pay: "$49.99" },
    { label: "14000 Gems", pay: "$99.99" },
  ],
  "💥 COD Mobile CP": [
    { label: "80 CP", pay: "$0.99" },
    { label: "400 CP", pay: "$4.99" },
    { label: "800 CP", pay: "$9.99" },
    { label: "2000 CP", pay: "$24.99" },
    { label: "5000 CP", pay: "$49.99" },
    { label: "10000 CP", pay: "$99.99" },
  ],
  "🌟 Genshin Impact Genesis Crystals": [
    { label: "60 Crystals", pay: "$0.99" },
    { label: "300 Crystals", pay: "$4.99" },
    { label: "980 Crystals", pay: "$14.99" },
    { label: "1980 Crystals", pay: "$29.99" },
    { label: "3280 Crystals", pay: "$49.99" },
    { label: "6480 Crystals", pay: "$99.99" },
  ],
  "⚡ Valorant VP": [
    { label: "475 VP", pay: "$4.99" },
    { label: "1000 VP", pay: "$9.99" },
    { label: "2050 VP", pay: "$19.99" },
    { label: "3650 VP", pay: "$34.99" },
    { label: "5350 VP", pay: "$49.99" },
    { label: "11000 VP", pay: "$99.99" },
  ],
  "🏆 Clash Royale Gems": [
    { label: "80 Gems", pay: "$0.99" },
    { label: "500 Gems", pay: "$4.99" },
    { label: "1200 Gems", pay: "$9.99" },
    { label: "6500 Gems", pay: "$49.99" },
  ],
  "⛏️ Minecraft": [
    { label: "Java Edition", pay: "$19.99" },
    { label: "Bedrock Edition", pay: "$9.99" },
  ],
};

// Prices are ~80% below official India retail — reseller rates.
// Official refs: Spotify ₹119, YouTube ₹139, Netflix ₹499/₹799,
// Disney+ ₹299–499, Prime ₹299/3mo, ChatGPT/Claude ~₹1,699.
export const STREAMING_PKGS: Record<string, LabelPay[]> = {
  "🤖 ChatGPT Plus": [
    { label: "1 Month", pay: "₹349" },
    { label: "3 Months", pay: "₹999" },
  ],
  "🧠 Claude Pro": [
    { label: "1 Month", pay: "₹349" },
    { label: "3 Months", pay: "₹999" },
  ],
  "🎬 Netflix": [
    { label: "1 Month Standard", pay: "₹99" },
    { label: "1 Month Premium 4K", pay: "₹159" },
  ],
  "🎵 Spotify": [
    { label: "1 Month", pay: "₹25" },
    { label: "3 Months", pay: "₹69" },
  ],
  "📺 YouTube Premium": [
    { label: "1 Month", pay: "₹29" },
    { label: "3 Months", pay: "₹79" },
  ],
  "🎥 Disney+ Hotstar": [
    { label: "1 Month", pay: "₹79" },
    { label: "3 Months", pay: "₹199" },
  ],
  "📡 Prime Video": [
    { label: "1 Month", pay: "₹49" },
    { label: "3 Months", pay: "₹129" },
  ],
};

export const PREMIUM_SUBS: Record<string, LabelPay[]> = {
  "🤖 ChatGPT / OpenAI": [
    { label: "ChatGPT Plus — 2 days warranty", pay: "$2.6" },
    { label: "ChatGPT Plus iCloud — No warranty", pay: "$1.3" },
    { label: "ChatGPT Business Slot — Full warranty", pay: "$15.2" },
    { label: "ChatGPT Pro 5x Inapp — Full warranty", pay: "$72.2" },
    { label: "ChatGPT Pro 20x Inapp — Full warranty", pay: "$136.9" },
    { label: "CDK GPT Plus K12 EDU 2 Years — 24H warranty", pay: "$8.76" },
  ],
  "🧠 Claude Pro / MAX": [
    { label: "Claude Pro Slot 1 Month — Full warranty", pay: "$18.28" },
    { label: "Claude Pro Gift 1 Month — 7D warranty", pay: "$16.00" },
    { label: "Claude MAX 5x Upgrade — Full warranty", pay: "$83" },
  ],
  "⚡ Grok (xAI)": [
    { label: "Super Grok 7–12 Days — 7D warranty", pay: "$1.5" },
    { label: "Super Grok 1 Month — 3D warranty", pay: "$2.00" },
    { label: "Super Grok 1 Month — 5D warranty", pay: "$2.29" },
    { label: "Super Grok 3 Months — Full warranty", pay: "$16.14" },
    { label: "Super Grok 3 Months — No warranty", pay: "$1.1" },
    { label: "Super Grok 6 Months — Full warranty", pay: "$18.6" },
    { label: "Super Grok 6 Months — No warranty", pay: "$1.9" },
    { label: "Super Grok 12 Months — Full warranty", pay: "$36.9" },
    { label: "Super Grok 12 Months — No warranty", pay: "$3.4" },
  ],
  "🖱️ Cursor": [
    { label: "Cursor Pro 1 Month — 28D warranty", pay: "$14.86" },
    { label: "Cursor Pro+ 1 Month — 28D warranty", pay: "$38.09" },
    { label: "Cursor Pro+ — No warranty", pay: "$30.4" },
    { label: "Cursor Ultra — No warranty", pay: "$76" },
  ],
  "💻 OpenCode": [
    { label: "OpenCode Go — Full warranty", pay: "$3.8" },
    { label: "OpenCode Zen — Full warranty", pay: "$14.1" },
  ],
  "🔍 Google AI PRO": [{ label: "Google AI PRO 5TB Drive 18 Months", pay: "$1" }],
  "💎 Gemini": [
    { label: "Gemini Pro Slot 1 Year — 3M warranty", pay: "$3.8" },
    { label: "Gemini AI Pro 18 Months (Link)", pay: "$2.82" },
    { label: "CDK Gemini Pro 1 Year — No warranty", pay: "$1.65" },
  ],
  "🎵 Spotify Premium": [
    { label: "3 Months — Full warranty", pay: "$6" },
    { label: "6 Months — Full warranty", pay: "$9.1" },
    { label: "6 Months — Full warranty (Alt)", pay: "$10" },
    { label: "12 Months — Full warranty", pay: "$13.3" },
    { label: "12 Months — Full warranty (Alt)", pay: "$15" },
  ],
  "📺 Netflix": [
    { label: "Netflix Slot 1 Month — Full warranty", pay: "$3" },
    { label: "Netflix Extra 1 Month Private — 28D warranty", pay: "$2.86" },
  ],
  "🎬 CapCut": [
    { label: "CapCut Pro Personal 7 Days — 5D warranty", pay: "$0.40" },
    { label: "CapCut Pro Personal 1 Month — 28D warranty", pay: "$2.25" },
    { label: "CapCut Pro Team 1 Month — 28D warranty", pay: "$2.67" },
    { label: "CapCut Pro Team 1 Month — 30D warranty", pay: "$2.48" },
  ],
  "🪟 Microsoft": [
    { label: "Microsoft 365 Premium Slot 1 Year — Full warranty", pay: "$4.19" },
    { label: "Microsoft Premium Admin 9 Months — No warranty", pay: "$2.2" },
  ],
  "🎨 Canva": [{ label: "Canva Pro/Edu Slot 1 Year — Full warranty", pay: "$3.8" }],
  "✏️ Figma": [{ label: "Figma Pro Edu 2 Years — 1M warranty", pay: "$5" }],
  "🎮 Xbox": [
    { label: "Xbox Gift Code Random — Active warranty", pay: "$0.96" },
    { label: "Xbox Game Pass Ultimate 1 Year — 28D warranty", pay: "$18.28" },
  ],
  "🎵 Suno AI": [
    { label: "Suno Pro 1 Month — 5D warranty", pay: "$8.76" },
    { label: "Suno Premium 1 Month — 5D warranty", pay: "$19.05" },
  ],
  "🔊 ElevenLabs": [{ label: "ElevenLabs Creator 1 Month — 28D warranty", pay: "Contact" }],
  "🐦 X (Twitter)": [{ label: "X Premium 3 Months — 180D warranty", pay: "$13.33" }],
  "🔒 VPN": [
    { label: "ExpressVPN 1 Month — 28D warranty", pay: "$1.11" },
    { label: "HMA VPN Key 1 Month (Android/PC)", pay: "$0.73" },
    { label: "HMA VPN Account 30 Days — 28D warranty", pay: "$0.96" },
  ],
  "🎨 Adobe": [{ label: "Adobe Full App 1 Month — 3D warranty", pay: "$2.10" }],
  "🖼️ Meitu": [{ label: "Meitu SVIP+ 1 Month — 28D warranty", pay: "$1.69" }],
  "🎬 Kiro": [{ label: "Kiro Power 200$ — 10k Credits opus 4.8", pay: "$4.1" }],
};

export const VCC_STORE: Record<string, LabelPay[]> = {
  "💳 Basic Virtual ($50–200)": [
    { label: "$50 Balance — Best for subscriptions", pay: "$22" },
    { label: "$100 Balance", pay: "$28" },
    { label: "$200 Balance", pay: "$34" },
  ],
  "💳 Standard Virtual ($200–500)": [
    { label: "$200 Balance — Online shopping", pay: "$42" },
    { label: "$350 Balance", pay: "$54" },
    { label: "$500 Balance", pay: "$66" },
  ],
  "💳 Business Virtual ($500–1500)": [
    { label: "$500 Balance — B2B / Alibaba", pay: "$85" },
    { label: "$1,000 Balance", pay: "$115" },
    { label: "$1,500 Balance", pay: "$145" },
  ],
  "🥈 Silver Premium ($1k–2.5k)": [
    { label: "$1,000 — Electronics / Flights", pay: "$145" },
    { label: "$1,500", pay: "$180" },
    { label: "$2,500", pay: "$220" },
  ],
  "🥇 Gold Premium ($2.5k–5k)": [
    { label: "$2,500 — Amazon / Walmart", pay: "$265" },
    { label: "$3,500", pay: "$340" },
    { label: "$5,000", pay: "$420" },
  ],
  "💎 Diamond Premium ($5k–10k)": [
    { label: "$5,000 — Bulk / B2B / Reseller", pay: "$480" },
    { label: "$7,500", pay: "$630" },
    { label: "$10,000", pay: "$780" },
  ],
  "🖤 Black Unlimited ($10k+)": [{ label: "$10,000+ — Corporate / VIP", pay: "$900+" }],
  "📱 Electronics Order (Service Fee)": [
    { label: "iPhone / Laptop — Service fee (card $1,500+)", pay: "$60" },
    { label: "High-value electronics", pay: "$100" },
  ],
  "✈️ Flight Tickets (Service Fee)": [
    { label: "Flight booking — Service fee (card $800+)", pay: "$42" },
    { label: "Business class booking", pay: "$72" },
  ],
  "🎁 Gift Cards Order (Service Fee)": [
    { label: "Amazon / Visa / Steam GC (card $300+)", pay: "$24" },
    { label: "Large denomination GC", pay: "$48" },
  ],
  "🏨 Hotel Bookings (Service Fee)": [
    { label: "Hotel booking — Service fee (card $600+)", pay: "$36" },
    { label: "Luxury hotel booking", pay: "$66" },
  ],
  "📦 Bulk Reseller Orders (Service Fee)": [
    { label: "Full inventory restock (card $5,000+)", pay: "$180" },
    { label: "Large bulk order", pay: "$250+" },
  ],
};

export const CARD_SHOP_BRANDS: Record<string, CardPricing> = {
  "🎨 Adobe Creative Cloud": { monthly: 15, yearly: 150, multiMonthly: 45, multiYearly: 450 },
  "🖼️ Adobe Stock": { monthly: 12, yearly: 120, multiMonthly: 35, multiYearly: 350 },
  "🎨 Canva Pro": { monthly: 8, yearly: 80, multiMonthly: 25, multiYearly: 250 },
  "🖌️ Figma": { monthly: 10, yearly: 100, multiMonthly: 30, multiYearly: 300 },
  "🎨 Affinity Suite": { lifetime: 20, multiLifetime: 55 },
  "✍️ Grammarly Premium": { monthly: 10, yearly: 100, multiMonthly: 28, multiYearly: 280 },
  "🤖 ChatGPT Plus": { monthly: 14, yearly: 140, multiMonthly: 40, multiYearly: 400 },
  "🤖 Jasper AI": { monthly: 18, yearly: 180, multiMonthly: 50, multiYearly: 500 },
  "📝 Notion AI": { monthly: 7, yearly: 70, multiMonthly: 22, multiYearly: 220 },
  "🎧 Avid Pro Tools": { monthly: 16, yearly: 160, multiMonthly: 48, multiYearly: 480 },
  "🎵 Artlist": { monthly: 12, yearly: 120, multiMonthly: 36, multiYearly: 360 },
  "🎬 Motion Array": { monthly: 14, yearly: 140, multiMonthly: 42, multiYearly: 420 },
  "🎵 Splice": { monthly: 10, yearly: 100, multiMonthly: 32, multiYearly: 320 },
  "💼 Microsoft 365": { monthly: 6, yearly: 60, multiMonthly: 18, multiYearly: 180 },
  "✅ Todoist Pro": { monthly: 5, yearly: 50, multiMonthly: 15, multiYearly: 150 },
  "📋 ClickUp": { monthly: 7, yearly: 70, multiMonthly: 25, multiYearly: 250 },
  "🛠️ Jira": { monthly: 8, yearly: 80, multiMonthly: 28, multiYearly: 280 },
  "💬 Slack": { monthly: 7, yearly: 70, multiMonthly: 22, multiYearly: 220 },
  "💵 YNAB": { monthly: 9, yearly: 90, multiMonthly: 26, multiYearly: 260 },
  "📊 QuickBooks": { monthly: 14, yearly: 140, multiMonthly: 40, multiYearly: 400 },
  "📷 Shutterstock": { monthly: 18, yearly: 180, multiMonthly: 50, multiYearly: 500 },
  "🎞️ Envato Elements": { monthly: 10, yearly: 100, multiMonthly: 30, multiYearly: 300 },
  "🎶 Epidemic Sound": { monthly: 12, yearly: 120, multiMonthly: 35, multiYearly: 350 },
};

// ─── Electronics (physical devices) ────────────────────────────────────────
// Real devices sold from the store. Buy Now runs through the normal wallet /
// crypto-deposit + admin-approval flow; resellers can also negotiate via the
// "Make Offer" button on the storefront (see product_offers).
const TITANIUM_16 = ["Black Titanium", "White Titanium", "Natural Titanium", "Desert Titanium"];
const IPHONE_16_COLORS = ["Black", "White", "Pink", "Teal", "Ultramarine"];
const IPAD_AIR_COLORS = ["Space Gray", "Blue", "Purple", "Starlight"];
const MAC_PRO_COLORS = ["Space Black", "Silver"];
const MAC_AIR_COLORS = ["Sky Blue", "Midnight", "Starlight", "Silver"];

export const ELECTRONICS: Record<string, LabelPay[]> = {
  "📱 iPhone": [
    { label: "iPhone 16 Pro Max · 1TB", pay: "$1,599", colors: TITANIUM_16 },
    { label: "iPhone 16 Pro Max · 256GB", pay: "$1,149", colors: TITANIUM_16 },
    { label: "iPhone 16 Pro · 512GB", pay: "$1,199", colors: TITANIUM_16 },
    { label: "iPhone 16 Pro · 128GB", pay: "$949", colors: TITANIUM_16 },
    { label: "iPhone 16 Plus · 128GB", pay: "$849", colors: IPHONE_16_COLORS },
    { label: "iPhone 16 · 128GB", pay: "$749", colors: IPHONE_16_COLORS },
    { label: "iPhone 16e · 128GB", pay: "$549", colors: ["Black", "White"] },
    { label: "iPhone 15 Pro Max · 256GB", pay: "$999", colors: ["Black Titanium", "Natural Titanium", "Blue Titanium"] },
    { label: "iPhone 15 · 128GB", pay: "$699", colors: ["Pink", "Blue", "Black", "Green", "Yellow"] },
  ],
  "📲 iPad": [
    { label: "iPad Pro 13-inch · M4 · 512GB", pay: "$1,499", colors: MAC_PRO_COLORS },
    { label: "iPad Pro 11-inch · M4 · 256GB", pay: "$999", colors: MAC_PRO_COLORS },
    { label: "iPad Air 13-inch · M3 · 256GB", pay: "$799", colors: IPAD_AIR_COLORS },
    { label: "iPad Air 11-inch · M3 · 128GB", pay: "$599", colors: IPAD_AIR_COLORS },
    { label: "iPad mini · A17 Pro · 128GB", pay: "$499", colors: IPAD_AIR_COLORS },
    { label: "iPad 11th Gen · A16 · 128GB", pay: "$349", colors: ["Silver", "Blue", "Pink", "Yellow"] },
  ],
  "💻 MacBook": [
    { label: "MacBook Pro 16-inch · M4 Max · 1TB / 36GB", pay: "$3,499", colors: MAC_PRO_COLORS },
    { label: "MacBook Pro 14-inch · M4 Pro · 512GB / 24GB", pay: "$1,999", colors: MAC_PRO_COLORS },
    { label: "MacBook Pro 14-inch · M4 · 512GB / 16GB", pay: "$1,599", colors: MAC_PRO_COLORS },
    { label: "MacBook Air 15-inch · M4 · 512GB / 16GB", pay: "$1,399", colors: MAC_AIR_COLORS },
    { label: "MacBook Air 15-inch · M2 · 512GB / 16GB", pay: "$1,299", colors: ["Midnight", "Starlight", "Silver", "Space Gray"] },
    { label: "MacBook Air 13-inch · M4 · 256GB / 16GB", pay: "$999", colors: MAC_AIR_COLORS },
  ],
  "🖥️ Windows Laptops": [
    { label: "Dell XPS 16 · Ultra 9 · 32GB / 1TB", pay: "$2,399" },
    { label: "ThinkPad X1 Carbon Gen 12 · i7 · 32GB", pay: "$2,199" },
    { label: "HP Spectre x360 16 · i7 · 16GB / 1TB", pay: "$1,899" },
    { label: "Acer Predator Helios 16 · i9 · RTX 4070", pay: "$1,799" },
  ],
};

// ─── Storewide sale ─────────────────────────────────────────────────────────
// Applied IN PLACE to every price collection at module load, before any
// consumer reads them. Labels always keep the ORIGINAL price text (product
// identity — gift-card vault keys, stock keys and order history stay stable);
// `pay` becomes the discounted price and `origPay` keeps the base price.
// Set SALE_PERCENT to 0 to end the sale (single switch, then redeploy).
export const SALE_PERCENT = 30;

/** Discounted price string, or null when no sale / price is not parseable
 *  (e.g. "Contact", "$900+", "50K IDR" — those stay untouched). */
export function applySale(pay: string): string | null {
  if (SALE_PERCENT <= 0) return null;
  const m = /^([₹$£])([\d,]+(?:\.\d+)?)$/.exec(pay.trim());
  if (!m) return null;
  const sym = m[1]!;
  const base = parseFloat(m[2]!.replace(/,/g, ""));
  if (!isFinite(base) || base <= 0) return null;
  const cut = base * (1 - SALE_PERCENT / 100);
  if (sym === "₹") return `₹${Math.round(cut).toLocaleString("en-IN")}`;
  const hadDecimals = m[2]!.includes(".");
  const rounded = hadDecimals ? Math.round(cut * 100) / 100 : Math.round(cut);
  return `${sym}${rounded.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

/** {pay: salePrice, origPay: basePrice} when discounted, else {pay} unchanged. */
export function salePair(pay: string): { pay: string; origPay?: string } {
  const sale = applySale(pay);
  return sale && sale !== pay ? { pay: sale, origPay: pay } : { pay };
}

/** Label for Pay→Get packages — ALWAYS built from the original (pre-sale)
 *  price so product identity stays stable across sales. */
export function payGetLabel(p: PayGet): string {
  return `Pay ${p.origPay ?? p.pay} → Get ${p.get}`;
}

(function applyStorewideSale(): void {
  if (SALE_PERCENT <= 0) return;
  const payGetGroups: PayGet[][] = [
    ...Object.values(INDIAN_BRANDS),
    ...Object.values(INTL_BRANDS),
    BINANCE_PKGS,
  ];
  for (const pkgs of payGetGroups) {
    for (const p of pkgs) {
      const s = salePair(p.pay);
      if (s.origPay) { p.origPay = s.origPay; p.pay = s.pay; }
    }
  }
  const labelPayGroups: LabelPay[][] = [
    ...Object.values(GAME_TITLES),
    ...Object.values(STREAMING_PKGS),
    ...Object.values(PREMIUM_SUBS),
    ...Object.values(VCC_STORE),
    ...Object.values(ELECTRONICS),
  ];
  for (const pkgs of labelPayGroups) {
    for (const p of pkgs) {
      const s = salePair(p.pay);
      if (s.origPay) { p.origPay = s.origPay; p.pay = s.pay; }
    }
  }
})();

// User-supplied entries accepted only after a duplicate audit against the
// connected GitHub catalog. These are explicit final display prices, so they
// intentionally bypass the repository's storewide-sale transform above.
export const USER_SUPPLIED_PREMIUM_GROUP = "📌 User-supplied additions (missing from GitHub)";
export const USER_SUPPLIED_PREMIUM: LabelPay[] = [
  { label: "ChatGPT Plus FW", pay: "$5.00" },
  { label: "ChatGPT Plus 1 Month — No warranty", pay: "$2.06" },
  { label: "ChatGPT Plus 1 Month — 28D warranty", pay: "$11.81" },
  { label: "PixverseAI 30,000 Credits 1 Month — 1D warranty", pay: "$39.99" },
  { label: "Slot Add Family 0 Credit (Antigravity 20x) Flow — 28D warranty", pay: "$17.32" },
  { label: "Gmail Random IP 2010–2016 (Trial YouTube)", pay: "$1.49" },
  { label: "TikTok Vietnamese, FL Really", pay: "$1.11" },
  { label: "TikTok America (US) New", pay: "$0.61" },
  { label: "HIGGS Starter — 24H warranty", pay: "$4.57" },
  { label: "HIGGS Plus ($49 Plan) — 2D warranty", pay: "$20.19" },
  { label: "Higgsfield 1 Year — No warranty", pay: "$90.00" },
  { label: "Higgsfield 1 Year — Full warranty", pay: "$120.00" },
  { label: "Code ElevenLabs Creator 1 Month", pay: "$4.50" },
];

export const USER_SUPPLIED_AWS_GROUP = "☁️ AWS services — user-supplied pricing";
export const USER_SUPPLIED_AWS_SERVICES: LabelPay[] = [
  { label: "Developer Support · monthly", pay: "$20.30", origPay: "$29" },
  { label: "Business Support · monthly", pay: "$70", origPay: "$100" },
  { label: "Lightsail Basic · monthly", pay: "$2.45", origPay: "$3.50" },
  { label: "Lightsail Small · monthly", pay: "$8.40", origPay: "$12" },
  { label: "CloudFront Pro · monthly", pay: "$10.50", origPay: "$15" },
  { label: "EC2 t3.micro · monthly", pay: "$5.25", origPay: "~$7.50" },
  { label: "Savings Plan (compute) · annual", pay: "$700", origPay: "$1,000" },
  { label: "Reserved Instances · custom annual quote · 30% off", pay: "Custom quote", quoteOnly: true },
  { label: "Enterprise Discount (EDP) · annual · minimum $100,000 original", pay: "$70,000", origPay: "$100,000" },
];

// ─── Flattened catalog for storefront / search use ─────────────────────────

export type StoreCategory =
  | "indian_giftcard"
  | "intl_giftcard"
  | "binance_card"
  | "game_topup"
  | "streaming"
  | "premium_sub"
  | "vcc"
  | "card_shop"
  | "cloud_services"
  | "electronics";

export interface CatalogItem {
  category: StoreCategory;
  group: string;
  label: string;
  pay: string;
  get?: string;
  /** Original (pre-sale) price — present only while a storewide sale is active. */
  origPay?: string;
  colors?: string[];
  quoteOnly?: boolean;
}

/**
 * Stable product identity used for visibility controls, favorites, and order
 * validation. A label alone is not safe because terms such as "1 Month" occur
 * under multiple product groups with different prices.
 */
export function catalogProductId(item: Pick<CatalogItem, "group" | "label">): string {
  return `${item.group} — ${item.label}`;
}

export function getFullCatalog(): CatalogItem[] {
  const out: CatalogItem[] = [];

  for (const [brand, pkgs] of Object.entries(INDIAN_BRANDS)) {
    for (const p of pkgs) out.push({ category: "indian_giftcard", group: brand, label: payGetLabel(p), pay: p.pay, get: p.get, origPay: p.origPay });
  }
  for (const [brand, pkgs] of Object.entries(INTL_BRANDS)) {
    for (const p of pkgs) out.push({ category: "intl_giftcard", group: brand, label: payGetLabel(p), pay: p.pay, get: p.get, origPay: p.origPay });
  }
  for (const p of BINANCE_PKGS) {
    out.push({ category: "binance_card", group: "🟡 Binance Card", label: payGetLabel(p), pay: p.pay, get: p.get, origPay: p.origPay });
  }
  for (const [game, pkgs] of Object.entries(GAME_TITLES)) {
    for (const p of pkgs) out.push({ category: "game_topup", group: game, label: p.label, pay: p.pay, origPay: p.origPay });
  }
  for (const [svc, pkgs] of Object.entries(STREAMING_PKGS)) {
    for (const p of pkgs) out.push({ category: "streaming", group: svc, label: p.label, pay: p.pay, origPay: p.origPay });
  }
  for (const [cat, pkgs] of Object.entries(PREMIUM_SUBS)) {
    for (const p of pkgs) out.push({ category: "premium_sub", group: cat, label: p.label, pay: p.pay, origPay: p.origPay });
  }
  for (const p of USER_SUPPLIED_PREMIUM) {
    out.push({ category: "premium_sub", group: USER_SUPPLIED_PREMIUM_GROUP, label: p.label, pay: p.pay });
  }
  for (const p of USER_SUPPLIED_AWS_SERVICES) {
    out.push({ category: "cloud_services", group: USER_SUPPLIED_AWS_GROUP, label: p.label, pay: p.pay, origPay: p.origPay, quoteOnly: p.quoteOnly });
  }
  for (const [cat, pkgs] of Object.entries(VCC_STORE)) {
    for (const p of pkgs) out.push({ category: "vcc", group: cat, label: p.label, pay: p.pay, origPay: p.origPay });
  }
  for (const [brand, pricing] of Object.entries(CARD_SHOP_BRANDS)) {
    if (pricing.monthly) out.push({ category: "card_shop", group: brand, label: "Monthly (1-use)", ...salePair("$" + pricing.monthly) });
    if (pricing.multiMonthly) out.push({ category: "card_shop", group: brand, label: "Monthly (Multi-use)", ...salePair("$" + pricing.multiMonthly) });
    if (pricing.yearly) out.push({ category: "card_shop", group: brand, label: "Yearly (1-use)", ...salePair("$" + pricing.yearly) });
    if (pricing.multiYearly) out.push({ category: "card_shop", group: brand, label: "Yearly (Multi-use)", ...salePair("$" + pricing.multiYearly) });
    if (pricing.lifetime) out.push({ category: "card_shop", group: brand, label: "Lifetime (1-use)", ...salePair("$" + pricing.lifetime) });
    if (pricing.multiLifetime) out.push({ category: "card_shop", group: brand, label: "Lifetime (Multi-use)", ...salePair("$" + pricing.multiLifetime) });
  }
  for (const [group, pkgs] of Object.entries(ELECTRONICS)) {
    for (const p of pkgs) out.push({ category: "electronics", group, label: p.label, pay: p.pay, origPay: p.origPay, colors: p.colors });
  }

  return out;
}

// Server-authoritative price verification. The website submits a product `label`
// and its displayed `pay` price; both must correspond to a real catalog entry so
// a crafted request cannot understate the price it will be charged. Built lazily
// and cached (the catalog is static at runtime).
let priceIndex: Map<string, Set<string>> | null = null;

export function isValidCatalogPrice(productName: string, price: string): boolean {
  if (!priceIndex) {
    priceIndex = new Map();
    const barePays = new Map<string, Set<string>>();
    const add = (key: string, item: { pay: string; origPay?: string }) => {
      const set = priceIndex!.get(key) ?? new Set<string>();
      set.add(item.pay);
      // During a sale the original price stays valid too (stale carts/keyboards
      // pay the old, higher price rather than failing).
      if (item.origPay) set.add(item.origPay);
      priceIndex!.set(key, set);
    };
    for (const item of getFullCatalog()) {
      if (item.quoteOnly) continue;
      // Canonical, collision-free key: "<group> — <label>".
      add(catalogProductId(item), item);
      add(item.label, item);
      const pays = barePays.get(item.label) ?? new Set<string>();
      pays.add(item.pay);
      barePays.set(item.label, pays);
      // Colour variants order as "<label> · <Colour>" — index every variant so
      // the same server-authoritative price check covers colour selections.
      for (const c of item.colors ?? []) {
        add(`${item.label} · ${c}`, item);
        add(`${catalogProductId(item)} · ${c}`, item);
      }
    }
    // A bare label shared by items with DIFFERENT prices (e.g. "1 Month" across
    // streaming services) is ambiguous: accepting it would let a crafted request
    // pay the cheapest colliding price. Those items must order via the composite
    // "<group> — <label>" form, so drop the ambiguous bare keys entirely.
    for (const [label, pays] of Array.from(barePays.entries())) {
      if (pays.size > 1) priceIndex.delete(label);
    }
  }
  return priceIndex.get(productName)?.has(price) ?? false;
}

// Reverse lookup: productName → original (pre-sale) price. Used by the
// gift-card vault so inventory uploaded at base prices still auto-attaches to
// orders placed at the sale price.
let baseIndex: Map<string, string> | null = null;

export function basePriceFor(productName: string): string | null {
  if (!baseIndex) {
    baseIndex = new Map();
    const conflicting = new Set<string>();
    for (const item of getFullCatalog()) {
      if (!item.origPay) continue;
      baseIndex.set(catalogProductId(item), item.origPay);
      const prev = baseIndex.get(item.label);
      if (prev !== undefined && prev !== item.origPay) conflicting.add(item.label);
      else baseIndex.set(item.label, item.origPay);
      for (const c of item.colors ?? []) {
        baseIndex.set(`${item.label} · ${c}`, item.origPay);
        baseIndex.set(`${catalogProductId(item)} · ${c}`, item.origPay);
      }
    }
    // Never guess for ambiguous bare labels (same label, different base price
    // across products) — a wrong guess could claim the wrong vault denomination.
    for (const label of Array.from(conflicting.values())) baseIndex.delete(label);
  }
  return baseIndex.get(productName) ?? null;
}

export const CATEGORY_LABELS: Record<StoreCategory, string> = {
  indian_giftcard: "🎁 Indian Gift Cards",
  intl_giftcard: "🌍 International Gift Cards",
  binance_card: "🟡 Binance Cards",
  game_topup: "🎮 Game Top-ups",
  streaming: "📺 Streaming",
  premium_sub: "🔑 Premium Subscriptions",
  vcc: "💳 VCC Store",
  card_shop: "💎 Premium Card Shop",
  cloud_services: "☁️ Cloud Services",
  electronics: "📱 Electronics",
};
