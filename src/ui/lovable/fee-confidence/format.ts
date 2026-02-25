export const fmtCurrency = (v: number) =>
  Number.isFinite(v)
    ? v.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
      })
    : "—";

export const fmtPct1 = (v: number) =>
  Number.isFinite(v) ? `${v.toFixed(1)}%` : "—";

export const fmtPct2 = (v: number) =>
  Number.isFinite(v) ? `${v.toFixed(2)}%` : "—";