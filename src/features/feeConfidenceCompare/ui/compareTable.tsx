import type { CompareView } from "../model/compareTypes"; // adjust if your type lives elsewhere

type Props = {
  view: CompareView;
  money: (n: number) => string;
  pct: (decimal: number) => string;
};

export function CompareTable({ view, money, pct }: Props) {
  const slots = view.slots ?? ["A"];
  const deltaSlots = slots.filter((s) => s !== view.baseline);

  const cell = (v: any, kind: string) => {
    if (v == null) return "—";
    if (kind === "money") return money(v);
    if (kind === "rate") return pct(v);
    return String(v);
  };

  const deltaCell = (d: any, kind: string) => {
    if (d == null) return "—";
    const formatted = cell(d, kind);
    return typeof d === "number" && d > 0 ? `+${formatted}` : formatted;
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
        {view.rows.map((row: any, idx: number) => {
          if (row.type === "section") {
            return (
              <div key={idx} style={{ marginTop: 12, fontWeight: 800, color: "#111827" }}>
                {row.title}
              </div>
            );
          }

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
                {row.label}
                <span style={{ color: "#9ca3af", fontSize: 12, marginLeft: 6 }}>{row.metricId}</span>
              </div>

              {slots.map((s: string) => (
                <div key={s} style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                  {cell(row.values?.[s], row.kind)}
                </div>
              ))}

              {deltaSlots.map((s: string) => (
                <div key={`d-${s}`} style={{ textAlign: "right", fontVariantNumeric: "tabular-nums", color: "#374151" }}>
                  {deltaCell(row.deltasVsBaseline?.[s], row.kind)}
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
