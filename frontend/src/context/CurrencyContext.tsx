import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";

// Static FX rates relative to USD (demo). Replace with live API in production.
export const RATES: Record<string, number> = {
  USD: 1, EUR: 0.92, GBP: 0.79, CAD: 1.36, AUD: 1.50,
  NGN: 1600, KES: 130, ZAR: 18, GHS: 14, XOF: 605,
  INR: 83, JPY: 155, CNY: 7.2, BRL: 5.1, MXN: 17,
};

export const CURRENCIES = Object.keys(RATES);

// Country → currency map for geo-based defaulting.
const COUNTRY_CCY: Record<string, string> = {
  US: "USD", CA: "CAD", GB: "GBP", AU: "AUD",
  NG: "NGN", KE: "KES", ZA: "ZAR", GH: "GHS",
  CI: "XOF", SN: "XOF", BJ: "XOF", TG: "XOF", BF: "XOF", ML: "XOF", NE: "XOF",
  IN: "INR", JP: "JPY", CN: "CNY", BR: "BRL", MX: "MXN",
  DE: "EUR", FR: "EUR", IT: "EUR", ES: "EUR", NL: "EUR", IE: "EUR", PT: "EUR", BE: "EUR", AT: "EUR", FI: "EUR", GR: "EUR",
};

const TZ_COUNTRY: Record<string, string> = {
  "Africa/Lagos": "NG", "Africa/Nairobi": "KE", "Africa/Johannesburg": "ZA",
  "Africa/Accra": "GH", "Africa/Abidjan": "CI", "Africa/Dakar": "SN",
  "America/New_York": "US", "America/Chicago": "US", "America/Los_Angeles": "US",
  "America/Toronto": "CA", "America/Vancouver": "CA",
  "America/Sao_Paulo": "BR", "America/Mexico_City": "MX",
  "Europe/London": "GB", "Europe/Paris": "FR", "Europe/Berlin": "DE",
  "Europe/Madrid": "ES", "Europe/Rome": "IT", "Europe/Amsterdam": "NL",
  "Asia/Kolkata": "IN", "Asia/Tokyo": "JP", "Asia/Shanghai": "CN",
  "Australia/Sydney": "AU",
};

function detectCurrency(): string {
  try {
    const saved = localStorage.getItem("hk_currency");
    if (saved && RATES[saved]) return saved;
    // Try locale region first (e.g. "en-NG" → "NG")
    const lang = navigator.language || "en-US";
    const region = lang.split("-")[1]?.toUpperCase();
    if (region && COUNTRY_CCY[region]) return COUNTRY_CCY[region];
    // Fall back to timezone-based country
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const country = TZ_COUNTRY[tz];
    if (country && COUNTRY_CCY[country]) return COUNTRY_CCY[country];
  } catch { /* noop */ }
  return "USD";
}

type Ctx = {
  currency: string;
  setCurrency: (c: string) => void;
  convert: (usd: number) => number;
  format: (usd: number) => string;
  auto: boolean;
};

const CurrencyCtx = createContext<Ctx | null>(null);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrencyState] = useState<string>(() => detectCurrency());
  const [auto, setAuto] = useState<boolean>(() => !localStorage.getItem("hk_currency"));

  useEffect(() => {
    if (!auto) localStorage.setItem("hk_currency", currency);
  }, [currency, auto]);

  const setCurrency = (c: string) => {
    if (!RATES[c]) return;
    setAuto(false);
    setCurrencyState(c);
  };

  const value = useMemo<Ctx>(() => ({
    currency,
    setCurrency,
    auto,
    convert: (usd) => usd * (RATES[currency] ?? 1),
    format: (usd) => {
      const v = usd * (RATES[currency] ?? 1);
      try {
        return new Intl.NumberFormat(navigator.language || "en-US", {
          style: "currency", currency, maximumFractionDigits: ["JPY", "NGN", "XOF"].includes(currency) ? 0 : 2,
        }).format(v);
      } catch {
        return `${currency} ${v.toFixed(2)}`;
      }
    },
  }), [currency, auto]);

  return <CurrencyCtx.Provider value={value}>{children}</CurrencyCtx.Provider>;
};

export const useCurrency = () => {
  const c = useContext(CurrencyCtx);
  if (!c) throw new Error("useCurrency must be used inside CurrencyProvider");
  return c;
};
