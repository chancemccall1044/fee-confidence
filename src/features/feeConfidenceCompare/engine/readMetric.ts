import type { CDOOv11 } from "../../../truthEngine";
import type { MetricDef } from "../model/compareMetricCatalog";

export function readMetric(def: MetricDef, cdoo?: CDOOv11): number | null {
  if (!cdoo) return null;
  const v = def.read(cdoo);
  return Number.isFinite(v) ? v : null;
}
