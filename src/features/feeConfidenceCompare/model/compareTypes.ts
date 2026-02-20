import type { MetricId, MetricKind } from "./compareMetricCatalog";
import type { ScenarioSlot } from "./scenarioEnvelope";

export type CompareRow =
  | { type: "section"; title: string }
  | {
      type: "metric";
      metricId: MetricId;
      label: string;
      kind: MetricKind;

      // Values per slot (A/B/C). Missing if not computed yet.
      values: Partial<Record<ScenarioSlot, number>>;

      // Deltas vs baseline (default baseline = "A")
      deltasVsBaseline: Partial<Record<ScenarioSlot, number>>;
    };

export type CompareView = {
  slots: ScenarioSlot[];     // active slots, in order (A,B,C)
  baseline: ScenarioSlot;    // "A"
  rows: CompareRow[];
};
