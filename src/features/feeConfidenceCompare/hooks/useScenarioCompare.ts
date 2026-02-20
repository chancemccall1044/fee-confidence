import { useMemo } from "react";
import type { ScenarioEnvelope, ScenarioSlot } from "../model/scenarioEnvelope";
import { GOLD_LAYOUT } from "../narrative/goldLayout";
import { buildCompareView } from "../engine/buildCompareView";
import { useComputedScenario } from "../../feeConfidence/hooks/useComputedScenario";

export function useScenarioCompare(
  envelopes: ScenarioEnvelope[],
  baseline: ScenarioSlot = "A"
) {
  const a = envelopes.find((e) => e.slot === "A");
  const b = envelopes.find((e) => e.slot === "B");
  const c = envelopes.find((e) => e.slot === "C");

  if (!a) {
    throw new Error("useScenarioCompare requires Scenario A to exist.");
  }

  // Always provide a CDIOv11 to satisfy useComputedScenario signature
  const fallbackCdio = a.cdio;

  const resA = useComputedScenario(a.cdio);
  const resB = useComputedScenario(b?.cdio ?? fallbackCdio);
  const resC = useComputedScenario(c?.cdio ?? fallbackCdio);

  const computedEnvelopes = useMemo(() => {
    const next: ScenarioEnvelope[] = [];

    next.push({
      ...a,
      cdoo: resA.result ?? undefined,
      compute: resA.error
        ? { status: "error", error: String(resA.error) }
        : { status: resA.result ? "ok" : "idle" },
    });

    if (b) {
      next.push({
        ...b,
        cdoo: resB.result ?? undefined,
        compute: resB.error
          ? { status: "error", error: String(resB.error) }
          : { status: resB.result ? "ok" : "idle" },
      });
    }

    if (c) {
      next.push({
        ...c,
        cdoo: resC.result ?? undefined,
        compute: resC.error
          ? { status: "error", error: String(resC.error) }
          : { status: resC.result ? "ok" : "idle" },
      });
    }

    return next;
  }, [
    a,
    b,
    c,
    resA.result,
    resA.error,
    resB.result,
    resB.error,
    resC.result,
    resC.error,
  ]);

  const view = useMemo(() => {
    return buildCompareView(GOLD_LAYOUT, computedEnvelopes, baseline);
  }, [computedEnvelopes, baseline]);

  return { view, computedEnvelopes };
}
