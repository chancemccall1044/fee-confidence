import type { CompareView, CompareRow } from "../model/compareTypes";
import type { ScenarioEnvelope, ScenarioSlot } from "../model/scenarioEnvelope";
import { METRICS } from "../model/compareMetricCatalog";
import type { GoldBlock } from "../narrative/goldLayout";
import { readMetric } from "./readMetric";
import { computeDelta } from "./delta";

export function buildCompareView(
  layout: GoldBlock[],
  envelopes: ScenarioEnvelope[],
  baseline: ScenarioSlot = "A"
): CompareView {
  const slots = envelopes.map((e) => e.slot);

  const bySlot: Partial<Record<ScenarioSlot, ScenarioEnvelope>> = {};
  for (const e of envelopes) bySlot[e.slot] = e;

  const baselineCdoo = bySlot[baseline]?.cdoo;

  const rows: CompareRow[] = layout.map((block) => {
    if (block.type === "section") {
      return { type: "section", title: block.title };
    }

    const def = METRICS[block.metricId];

    // Values per slot
    const values: Partial<Record<ScenarioSlot, number>> = {};
    for (const slot of slots) {
      const cdoo = bySlot[slot]?.cdoo;
      const v = readMetric(def, cdoo);
      if (v != null) values[slot] = v;
    }

    // Deltas vs baseline (only if baseline exists and alt exists)
    const deltasVsBaseline: Partial<Record<ScenarioSlot, number>> = {};
    if (baselineCdoo) {
      for (const slot of slots) {
        if (slot === baseline) continue;
        const altCdoo = bySlot[slot]?.cdoo;
        if (!altCdoo) continue;
        deltasVsBaseline[slot] = computeDelta(def, baselineCdoo, altCdoo);
      }
    }

    return {
      type: "metric",
      metricId: def.id,
      label: def.label,
      kind: def.kind,
      values,
      deltasVsBaseline,
    };
  });

  return { slots, baseline, rows };
}
