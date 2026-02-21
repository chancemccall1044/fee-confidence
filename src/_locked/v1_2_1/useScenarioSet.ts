import { useEffect, useMemo, useState } from "react";
import type { ScenarioEnvelope, ScenarioSlot } from "../model/scenarioEnvelope";
import type { CDIOv11 } from "../../../truthEngine";

// You probably already have a defaultScenarioUI somewhere.
// For now, you can pass in an initial CDIO from the caller.
const defaultLabel: Record<ScenarioSlot, string> = {
  A: "Base",
  B: "Alt 1",
  C: "Alt 2",
};

function mkEnvelope(slot: ScenarioSlot, who: string, cdio: CDIOv11): ScenarioEnvelope {
  return {
    slot,
    label: defaultLabel[slot],
    who,
    cdio,
    ui: { scenarioName: cdio.scenario_id || defaultLabel[slot] },
    compute: { status: "idle" },
  };
}

export function useScenarioSet(initial: { who: string; cdio: CDIOv11 }) {
  const [envelopes, setEnvelopes] = useState<ScenarioEnvelope[]>(() => [
    mkEnvelope("A", initial.who, initial.cdio),
  ]);

  useEffect(() => {
    setEnvelopes((prev) =>
      prev.map((e) =>
        e.slot === "A"
          ? {
            ...e,
            who: initial.who,
            cdio: initial.cdio,
            ui: { ...e.ui, scenarioName: initial.cdio.scenario_id },
            compute: { status: "idle" },
          }
          : e
      )
    );
  }, [initial.who, initial.cdio]);

  const slots = useMemo(() => envelopes.map((e) => e.slot), [envelopes]);

  const upsert = (slot: ScenarioSlot, patch: Partial<ScenarioEnvelope>) => {
    setEnvelopes((prev) =>
      prev.map((e) => (e.slot === slot ? { ...e, ...patch } : e))
    );
  };

  const setCdio = (slot: ScenarioSlot, cdio: CDIOv11) => {
    upsert(slot, { cdio, compute: { status: "idle" } });
  };

  const addSlot = (slot: Exclude<ScenarioSlot, "A">) => {
    setEnvelopes((prev) => {
      if (prev.some((e) => e.slot === slot)) return prev;
      if (prev.length >= 3) return prev;

      const base = prev.find((e) => e.slot === "A");
      if (!base) return prev;

      // clone CDIO from base as a starting point
      const cloned = structuredClone(base.cdio) as CDIOv11;

      return [...prev, mkEnvelope(slot, base.who, cloned)];
    });
  };

  const removeSlot = (slot: Exclude<ScenarioSlot, "A">) => {
    setEnvelopes((prev) => prev.filter((e) => e.slot !== slot));
  };

  const rename = (slot: ScenarioSlot, label: string) => upsert(slot, { label });
  const updateEnvelopeUI = (slot: ScenarioSlot, patch: Partial<ScenarioEnvelope["ui"]>) => {
    setEnvelopes((prev) =>
      prev.map((e) => (e.slot === slot ? { ...e, ui: { ...e.ui, ...patch } } : e))
    );
  };
  return {
    envelopes,
    slots,
    setCdio,
    addSlot,
    removeSlot,
    updateEnvelopeUI,
    rename,

    upsert, // handy later
  };
}
