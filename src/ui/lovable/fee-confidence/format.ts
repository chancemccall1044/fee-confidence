// src/ui/lovable/fee-confidence/format.ts

// Lovable UI formatting — v1.2.2 normalization
// Financial tool: all currency = 2 decimal places

export const fmtCurrency = (v: number): string =>
  Number.isFinite(v)
    ? v.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : "—";

export const fmtPct1 = (v: number): string =>
  Number.isFinite(v) ? `${v.toFixed(1)}%` : "—";

export const fmtPct2 = (v: number): string =>
  Number.isFinite(v) ? `${v.toFixed(2)}%` : "—";

export const fmtDeltaCurrency = (v: number): string => {
  if (!Number.isFinite(v)) return "—";
  const sign = v >= 0 ? "+" : "";
  return `${sign}${fmtCurrency(v)}`;
};

export const fmtDeltaPct1 = (v: number): string => {
  if (!Number.isFinite(v)) return "—";
  const sign = v > 0 ? "+" : "";
  return `${sign}${v.toFixed(1)}%`;
};

export const fmtDeltaPct2 = (v: number): string => {
  if (!Number.isFinite(v)) return "—";
  const sign = v > 0 ? "+" : "";
  return `${sign}${v.toFixed(2)}%`;
};