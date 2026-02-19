import { useEffect, useMemo, useState } from "react";
import type { CDIOv11, CDOOv11 } from "../../../truthEngine";
import { computeCDOO } from "../../../truthEngine";

/* ---------- Hook Output Contract ----------
   This is the UI-facing compute state: current result/error plus a safe display model.
*/
export type UseComputedScenarioState = {
  result: CDOOv11 | null;   // latest computed output for the current inputs (null if compute failed)
  error: string | null;     // compute failure message suitable for UI display (null if compute succeeded)
  display: CDOOv11 | null;  // result OR lastGood; allows UI to keep showing stable outputs during input errors
  isStale: boolean;         // true when compute failed but we still have a lastGood to display
};

/* ---------- useComputedScenario ----------
   Computes CDOO deterministically from CDIO and provides last-known-good fallback for a smoother UX.
*/
/**
 * UI adapter for Truth Engine.
 *
 * Responsibilities:
 * - Run computeCDOO(cdio) deterministically whenever CDIO changes.
 * - Catch compute errors and surface a user-friendly message.
 * - Preserve last successful result (lastGood) to prevent UI “blanking out” during transient invalid inputs.
 *
 * Invariants:
 * - Never mutates the incoming CDIO.
 * - Never swallows errors silently: error is always set when compute fails.
 */
export function useComputedScenario(cdio: CDIOv11): UseComputedScenarioState {
  /* ---------- Last Known Good ----------
     Persists the most recent successful compute output to support “stale display” behavior.
  */
  const [lastGood, setLastGood] = useState<CDOOv11 | null>(null);

  /* ---------- Compute (Memoized) ----------
     Computes on CDIO changes. Memoization prevents unnecessary recompute across re-renders with identical CDIO reference.
  */
  const { result, error } = useMemo(() => {
    try {
      return { result: computeCDOO(cdio), error: null as string | null };
    } catch (e) {
      // Normalize thrown values into a consistent, UI-safe error message.
      const msg =
        e instanceof Error ? e.message : "Unknown error while computing scenario.";
      return { result: null, error: msg };
    }
  }, [cdio]);

  /* ---------- Promote Successful Result ----------
     Only update lastGood when compute succeeds; failures should not overwrite the last stable output.
  */
  useEffect(() => {
    if (result != null) setLastGood(result);
  }, [result]);

  /* ---------- Display + Stale Flag ----------
     display: shows the current result when available, otherwise shows the lastGood.
     isStale: true only when we are currently failing to compute AND we have a lastGood to show AND there is an error.
  */
  const display = result ?? lastGood;
  const isStale = !result && !!lastGood && !!error;

  return { result, error, display, isStale };
}
