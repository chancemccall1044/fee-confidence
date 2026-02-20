import type { MetricId } from "../model/compareMetricCatalog";

export type GoldBlock =
  | { type: "section"; title: string }
  | { type: "metricRow"; metricId: MetricId };

export const GOLD_LAYOUT: GoldBlock[] = [
  { type: "section", title: "Cost Stack" },
  { type: "metricRow", metricId: "cost.direct_labor" },
  { type: "metricRow", metricId: "cost.fringe_amount" },
  { type: "metricRow", metricId: "cost.overhead_amount" },
  { type: "metricRow", metricId: "cost.fully_burdened_labor" },
  { type: "metricRow", metricId: "cost.gna_amount" },
  { type: "metricRow", metricId: "cost.total_cost" },

  { type: "section", title: "Fee Analysis" },
  { type: "metricRow", metricId: "fee.fee_percent" },
  { type: "metricRow", metricId: "fee.fee_dollars" },
  { type: "metricRow", metricId: "fee.derived_contract_value" },
  { type: "metricRow", metricId: "fee.effective_margin_percent" },
];
