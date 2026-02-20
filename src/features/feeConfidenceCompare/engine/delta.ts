import type { CDOOv11 } from "../../../truthEngine";
import type { MetricDef } from "../model/compareMetricCatalog";
import { roundMoney2 } from "./round";

export function computeDelta(def: MetricDef, base: CDOOv11, alt: CDOOv11): number {
  const d = def.read(alt) - def.read(base);

  // Key rule: inputs are rounded CDOO values only.
  // We only apply presentation-grade rounding to delta for money.
  return def.kind === "money" ? roundMoney2(d) : d;
}
