import CodeTag from "./CodeTag";
import type { FeeAnalysisData } from "./types";

interface FeeAnalysisCardProps {
  data: FeeAnalysisData;
}

const fmt = (v: number) =>
  v.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 });

const pct = (v: number) => `${v.toFixed(2)}%`;

const FeeAnalysisCard = ({ data }: FeeAnalysisCardProps) => {
  const rows = [
    { code: "FA", label: "Fee Amount", value: fmt(data.feeAmount) },
    { code: "FP", label: "Fee Percent", value: pct(data.feePercent) },
    { code: "CV", label: "Contract Value", value: fmt(data.contractValue) },
    { code: "TC", label: "Total Cost", value: fmt(data.totalCost) },
  ];

  return (
    <div className="fc-card-elevated">
      <h3 className="fc-section-title mb-4">Fee Analysis</h3>
      <div className="grid gap-2">
        {rows.map((row) => (
          <div
            key={row.code}
            className="flex items-center justify-between gap-4 py-1.5 border-b border-border last:border-0"
          >
            <div className="flex items-center gap-2">
              <CodeTag>{row.code}</CodeTag>
              <span className="fc-label">{row.label}</span>
            </div>
            <span className="fc-value w-28">{row.value}</span>
          </div>
        ))}
      </div>
      {/* Effective margin emphasis band */}
      <div className="mt-4 rounded-md bg-secondary px-5 py-4 flex items-center justify-between border border-border">
        <div className="flex items-center gap-2">
          <CodeTag>EM</CodeTag>
          <span className="text-sm font-bold text-foreground">Effective Margin</span>
        </div>
        <span className="text-xl font-extrabold tabular-nums text-foreground">
          {pct(data.effectiveMargin)}
        </span>
      </div>
    </div>
  );
};

export default FeeAnalysisCard;
