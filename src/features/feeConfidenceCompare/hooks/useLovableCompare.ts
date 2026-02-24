import { useMemo } from "react";
import type { ScenarioEnvelope } from "../model/scenarioEnvelope";
import { METRICS } from "../model/compareMetricCatalog";

type Format = "currency" | "percent" | "percent2";

export type LovableRowDef = {
  code?: string;
  label: string;
  sublabel?: string;
  isHeader?: boolean;
  isTotal?: boolean;
  isPrimary?: boolean;
  format: Format;
  key: string;
};

export type LovableScenarioColumn = {
  name: string;
  values: Record<string, number>;
};

function computeDeltas(base: Record<string, number>, cur: Record<string, number>) {
  const out: Record<string, number> = {};
  for (const k of Object.keys(base)) out[k] = (cur[k] ?? 0) - (base[k] ?? 0);
  return out;
}

export function useLovableCompare(envelopes: ScenarioEnvelope[]) {
  const rows: LovableRowDef[] = useMemo(
    () => [
      { isHeader: true, label: "Cost Stack", format: "currency", key: "" },

      { code: "DL", label: "Direct Labor", sublabel: "cost.direct_labor", format: "currency", key: "cost.direct_labor" },
      { code: "FR", label: "Fringe Amount", sublabel: "cost.fringe_amount", format: "currency", key: "cost.fringe_amount" },
      { code: "OH", label: "Overhead Amount", sublabel: "cost.overhead_amount", format: "currency", key: "cost.overhead_amount" },
      { code: "FBL", label: "Fully Burdened Labor", sublabel: "cost.fully_burdened_labor", format: "currency", key: "cost.fully_burdened_labor" },
      { code: "GA", label: "G&A Amount", sublabel: "cost.gna_amount", format: "currency", key: "cost.gna_amount" },
      { code: "TC", label: "Total Cost", sublabel: "cost.total_cost", format: "currency", key: "cost.total_cost", isTotal: true },

      { isHeader: true, label: "Fee Analysis", format: "currency", key: "" },

      { code: "FP", label: "Fee %", sublabel: "fee.fee_percent", format: "percent2", key: "fee.fee_percent" },
      { code: "F$", label: "Fee $", sublabel: "fee.fee_dollars", format: "currency", key: "fee.fee_dollars" },
      { code: "DCV", label: "Derived Contract Value", sublabel: "fee.derived_contract_value", format: "currency", key: "fee.derived_contract_value" },
      { code: "EM", label: "Effective Margin", sublabel: "fee.effective_margin_percent", format: "percent2", key: "fee.effective_margin_percent", isPrimary: true },
    ],
    []
  );

  const scenarios = useMemo<LovableScenarioColumn[]>(() => {
    return envelopes.map((e) => {
      const values: Record<string, number> = {};

      // If compute failed or hasn't happened yet, keep zeros (or you could use NaN).
      if (e.cdoo) {
        for (const metricId of Object.keys(METRICS) as (keyof typeof METRICS)[]) {
          const def = METRICS[metricId];
          const raw = def.read(e.cdoo);

          // Your compare table expects percent values already in "XX.YY%" form.
          // METRICS returns decimals for rates, so convert here.
          values[metricId] = def.kind === "rate" ? raw * 100 : raw;
        }
      } else {
        for (const metricId of Object.keys(METRICS) as (keyof typeof METRICS)[]) {
          values[metricId] = 0;
        }
      }

      return { name: `Scenario ${e.slot}`, values };
    });
  }, [envelopes]);

  const deltas = useMemo(() => {
    if (scenarios.length === 0) return [];
    const base = scenarios[0].values;
    return scenarios.map((s, i) => (i === 0 ? null : computeDeltas(base, s.values)));
  }, [scenarios]);

  const errors = useMemo(
    () => envelopes.map((e) => (e.compute.status === "error" ? e.compute.error ?? "Compute error" : null)),
    [envelopes]
  );

  return { rows, scenarios, deltas, errors };
}