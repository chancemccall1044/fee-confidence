import type { CompareView } from "../model/compareTypes"; // adjust if your type lives elsewhere

type Props = {
  view: CompareView;
  money: (n: number) => string;
  pct: (decimal: number) => string;
};

type Kind = "money" | "rate" | "text";

type SectionRow = { type: "section"; title: string };

const isNumber = (v: unknown): v is number =>
  typeof v === "number" && Number.isFinite(v);

const toKind = (k: unknown): Kind => {
  if (k === "money" || k === "rate" || k === "text") return k;
  // default fallback keeps behavior stable if data is malformed
  return "text";
};

const isSectionRow = (row: unknown): row is SectionRow => {
  if (typeof row !== "object" || row === null) return false;
  const r = row as Record<string, unknown>;
  return r.type === "section" && typeof r.title === "string";
};

export function CompareTable({ view, money, pct }: Props) {
  const slots = view.slots ?? ["A"];
  const deltaSlots = slots.filter((s) => s !== view.baseline);

  const cell = (v: unknown, kind: Kind) => {
    if (v == null) return "—";
    if (kind === "money") return isNumber(v) ? money(v) : "—";
    if (kind === "rate") return isNumber(v) ? pct(v) : "—";
    return String(v);
  };

  const deltaCell = (d: unknown, kind: Kind) => {
    if (d == null) return "—";
    const formatted = cell(d, kind);
    return isNumber(d) && d > 0 ? `+${formatted}` : formatted;
  };

  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 16,
        padding: 24,
        background: "white",
        boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
        marginTop: 24,
      }}
    >
      <div style={{ fontWeight: 800, marginBottom: 12 }}>Compare</div>

      {/* header row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `240px repeat(${slots.length}, 1fr) repeat(${deltaSlots.length}, 1fr)`,
          gap: 12,
          fontWeight: 700,
          fontSize: 12,
          color: "#6b7280",
          paddingBottom: 6,
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <div></div>
        {slots.map((s) => (
          <div key={s} style={{ textAlign: "right" }}>
            {s}
          </div>
        ))}
        {deltaSlots.map((s) => (
          <div key={`d-${s}`} style={{ textAlign: "right" }}>
            Δ{s}
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
        {view.rows.map((row: unknown, idx: number) => {
          // row is unknown because CompareView might not be fully typed yet.

          if (isSectionRow(row)) {
            return (
              <div
                key={idx}
                style={{ marginTop: 12, fontWeight: 800, color: "#111827" }}
              >
                {row.title}
              </div>
            );
          }

          // metric row fallback
          const r = row as {
            label?: unknown;
            metricId?: unknown;
            kind?: unknown;
            values?: Record<string, unknown> | null;
            deltasVsBaseline?: Record<string, unknown> | null;
          };

          const label = typeof r.label === "string" ? r.label : "";
          const metricId = typeof r.metricId === "string" ? r.metricId : "";
          const kind = toKind(r.kind);

          return (
            <div
              key={idx}
              style={{
                display: "grid",
                gridTemplateColumns: `240px repeat(${slots.length}, 1fr) repeat(${deltaSlots.length}, 1fr)`,
                gap: 12,
                alignItems: "center",
                padding: "8px 0",
                borderBottom: "1px solid #eef2f7",
              }}
            >
              <div style={{ color: "#111827", fontWeight: 600 }}>
                {label}
                <span style={{ color: "#9ca3af", fontSize: 12, marginLeft: 6 }}>
                  {metricId}
                </span>
              </div>

              {slots.map((s: string) => (
                <div
                  key={s}
                  style={{
                    textAlign: "right",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {cell(r.values?.[s], kind)}
                </div>
              ))}

              {deltaSlots.map((s: string) => (
                <div
                  key={`d-${s}`}
                  style={{
                    textAlign: "right",
                    fontVariantNumeric: "tabular-nums",
                    color: "#374151",
                  }}
                >
                  {deltaCell(r.deltasVsBaseline?.[s], kind)}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 10, fontSize: 12, color: "#6b7280" }}>
        Deltas are computed from rounded CDOO outputs only.
      </div>
    </div>
  );
}