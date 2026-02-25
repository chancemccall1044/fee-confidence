import CodeTag from "./CodeTag";
import type { CostStackRow } from "./types";
import { fmtCurrency, fmtPct1 } from "./format";

interface CostStackCardProps {
  rows: CostStackRow[];
  totalLabel?: string;
  totalValue: number;
}

const CostStackCard = ({
  rows,
  totalLabel = "Total Cost",
  totalValue,
}: CostStackCardProps) => (
  <div className="fc-card-elevated">
    <h3 className="fc-section-title mb-4">Cost Stack</h3>

    <div className="grid gap-0.5">
      {rows.map((row) => (
        <div
          key={row.code}
          className="flex items-center justify-between gap-4 py-1 border-b border-border last:border-0"
        >
          <div className="flex items-center gap-2 min-w-0">
            <CodeTag>{row.code}</CodeTag>
            <span className="fc-label truncate">{row.label}</span>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            {row.percentage !== undefined && (
              <span className="text-xs text-muted-foreground tabular-nums w-14 text-right font-mono">
                {fmtPct1(row.percentage)}
              </span>
            )}
            <span className="fc-value w-28">{fmtCurrency(row.value)}</span>
          </div>
        </div>
      ))}
    </div>

    <div className="mt-3 pt-3 border-t-2 border-foreground/20 flex items-center justify-between">
      <span className="text-sm font-semibold text-foreground">{totalLabel}</span>
      <span className="fc-value w-28 text-foreground">{fmtCurrency(totalValue)}</span>
    </div>
  </div>
);

export default CostStackCard;