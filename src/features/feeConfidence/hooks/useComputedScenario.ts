import { useEffect, useMemo, useState } from "react";
import type { CDIOv11, CDOOv11 } from "../../../truthEngine";
import { computeCDOO } from "../../../truthEngine";

export type UseComputedScenarioState = {
  result: CDOOv11 | null;
  error: string | null;
  display: CDOOv11 | null;
  isStale: boolean;
};

export function useComputedScenario(cdio: CDIOv11): UseComputedScenarioState {
  const [lastGood, setLastGood] = useState<CDOOv11 | null>(null);

  const { result, error } = useMemo(() => {
    try {
      return { result: computeCDOO(cdio), error: null as string | null };
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "Unknown error while computing scenario.";
      return { result: null, error: msg };
    }
  }, [cdio]);

  useEffect(() => {
    if (result != null) {
      // We intentionally cache the last successful compute result for “stale display” UX.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLastGood(result);
    }
  }, [result]);

  const display = result ?? lastGood;
  const isStale = !result && !!lastGood && !!error;

  return { result, error, display, isStale };
}