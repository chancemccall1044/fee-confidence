import type { CDOOv11 } from "../../..//truthEngine";

/**
 * IDs are stable keys used by compare + narrative layout.
 * Keep these stable once shipped.
 */
export type MetricId =
  | "cost.direct_labor"
  | "cost.fringe_amount"
  | "cost.overhead_amount"
  | "cost.fully_burdened_labor"
  | "cost.gna_amount"
  | "cost.total_cost"
  | "fee.fee_percent"
  | "fee.fee_dollars"
  | "fee.derived_contract_value"
  | "fee.effective_margin_percent";

export type MetricKind = "money" | "rate";

export type MetricDef = {
  id: MetricId;
  label: string;
  section: "Cost Stack" | "Fee Analysis";
  kind: MetricKind;

  /**
   * IMPORTANT:
   * This must read from the already-rounded values in CDOO.
   * No recompute. No input-based math.
   */
  read: (cdoo: CDOOv11) => number;
};

export const METRICS: Record<MetricId, MetricDef> = {
  "cost.direct_labor": {
    id: "cost.direct_labor",
    label: "Direct Labor",
    section: "Cost Stack",
    kind: "money",
    read: (cdoo) => cdoo.cost_stack.direct_labor,
  },
  "cost.fringe_amount": {
    id: "cost.fringe_amount",
    label: "Fringe Amount",
    section: "Cost Stack",
    kind: "money",
    read: (cdoo) => cdoo.cost_stack.fringe_amount,
  },
  "cost.overhead_amount": {
    id: "cost.overhead_amount",
    label: "Overhead Amount",
    section: "Cost Stack",
    kind: "money",
    read: (cdoo) => cdoo.cost_stack.overhead_amount,
  },
  "cost.fully_burdened_labor": {
    id: "cost.fully_burdened_labor",
    label: "Fully Burdened Labor",
    section: "Cost Stack",
    kind: "money",
    read: (cdoo) => cdoo.cost_stack.fully_burdened_labor,
  },
  "cost.gna_amount": {
    id: "cost.gna_amount",
    label: "G&A Amount",
    section: "Cost Stack",
    kind: "money",
    read: (cdoo) => cdoo.cost_stack.gna_amount,
  },
  "cost.total_cost": {
    id: "cost.total_cost",
    label: "Total Cost",
    section: "Cost Stack",
    kind: "money",
    read: (cdoo) => cdoo.cost_stack.total_cost,
  },

  "fee.fee_percent": {
    id: "fee.fee_percent",
    label: "Fee %",
    section: "Fee Analysis",
    kind: "rate",
    read: (cdoo) => cdoo.fee_analysis.fee_percent, // decimal fraction (e.g. 0.10)
  },
  "fee.fee_dollars": {
    id: "fee.fee_dollars",
    label: "Fee $",
    section: "Fee Analysis",
    kind: "money",
    read: (cdoo) => cdoo.fee_analysis.fee_dollars,
  },
  "fee.derived_contract_value": {
    id: "fee.derived_contract_value",
    label: "Derived Contract Value",
    section: "Fee Analysis",
    kind: "money",
    read: (cdoo) => cdoo.fee_analysis.derived_contract_value,
  },
  "fee.effective_margin_percent": {
    id: "fee.effective_margin_percent",
    label: "Effective Margin %",
    section: "Fee Analysis",
    kind: "rate",
    read: (cdoo) => cdoo.fee_analysis.effective_margin_percent, // decimal fraction
  },
};
