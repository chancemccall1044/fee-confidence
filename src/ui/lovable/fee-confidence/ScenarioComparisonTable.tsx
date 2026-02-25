// src/ui/lovable/fee-confidence/ScenarioComparisonTable.tsx
import CodeTag from "./CodeTag";
import {
  fmtCurrency,
  fmtPct1,
  fmtPct2,
  fmtDeltaCurrency,
  fmtDeltaPct1,
  fmtDeltaPct2,
} from "./format";

type Format = "currency" | "percent" | "percent2";

const formatValue = (v: number, fmt: Format) => {
  switch (fmt) {
    case "currency":
      return fmtCurrency(v);
    case "percent":
      return fmtPct1(v);
    case "percent2":
      return fmtPct2(v);
  }
};

const formatDelta = (v: number, fmt: Format) => {
  switch (fmt) {
    case "currency":
      return fmtDeltaCurrency(v);
    case "percent":
      return fmtDeltaPct1(v);
    case "percent2":
      return fmtDeltaPct2(v);
  }
};

interface RowDef {
  code?: string;
  label: string;
  sublabel?: string;
  isHeader?: boolean;
  isTotal?: boolean;
  isPrimary?: boolean;
  format: Format;
  key: string;
}

interface ScenarioColumn {
  name: string;
  values: Record<string, number>;
}

interface ScenarioComparisonTableProps {
  rows: RowDef[];
  scenarios: ScenarioColumn[];
  deltas: (Record<string, number> | null)[];
}

const ScenarioComparisonTable = ({ rows, scenarios, deltas }: ScenarioComparisonTableProps) => {
  const scenarioCount = scenarios.length;

  return (
    <div className="fc-card-elevated overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b-2 border-foreground/15">
            <th className="text-left py-2 pr-4 w-48">
              <span className="fc-section-title">Metric</span>
            </th>
            {scenarios.map((s, i) => (
              <th key={i} className="text-right py-2 px-3 min-w-[140px]">
                <span className="fc-section-title">{s.name}</span>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row, ri) => {
            if (row.isHeader) {
              return (
                <tr key={ri}>
                  <td colSpan={scenarioCount + 1} className="pt-5 pb-1.5 border-b border-foreground/10">
                    <span className="fc-section-title">{row.label}</span>
                  </td>
                </tr>
              );
            }

            const isPrimary = !!row.isPrimary;
            const isTotal = !!row.isTotal;

            return (
              <tr
                key={ri}
                className={`
                  border-b border-border last:border-0
                  ${isPrimary ? "bg-primary/8 border-l-[3px] border-l-primary" : ""}
                  ${isTotal ? "border-t-2 border-t-foreground/15" : ""}
                `}
              >
                <td className={`py-1.5 pr-4 align-top ${isPrimary ? "py-3" : ""}`}>
                  <div className="flex items-center gap-2">
                    {row.code && <CodeTag>{row.code}</CodeTag>}
                    <div className="min-w-0">
                      <span
                        className={`block truncate ${
                          isTotal || isPrimary ? "text-sm font-semibold text-foreground" : "fc-label"
                        }`}
                      >
                        {row.label}
                      </span>
                      {row.sublabel && (
                        <span className="block text-[10px] text-muted-foreground/60 font-mono truncate">
                          {row.sublabel}
                        </span>
                      )}
                    </div>
                  </div>
                </td>

                {scenarios.map((scenario, si) => {
                  const value = scenario.values[row.key];
                  const delta = deltas[si]?.[row.key];
                  const isBaseline = si === 0;

                  return (
                    <td key={si} className={`text-right px-3 align-top ${isPrimary ? "py-3" : "py-1.5"}`}>
                      <span
                        className={`block tabular-nums ${
                          isPrimary
                            ? "text-lg font-extrabold text-foreground"
                            : isTotal
                              ? "text-sm font-semibold text-foreground"
                              : "fc-value text-sm"
                        }`}
                      >
                        {value !== undefined ? formatValue(value, row.format) : "—"}
                      </span>

                      {!isBaseline && delta !== undefined && delta !== null && (
                        <span
                          className={`block text-xs tabular-nums font-mono mt-0.5 ${
                            delta > 0 ? "text-fc-success" : delta < 0 ? "text-destructive" : "text-muted-foreground"
                          }`}
                        >
                          {formatDelta(delta, row.format)}
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ScenarioComparisonTable;