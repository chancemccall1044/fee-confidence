import { useEffect, useMemo, useState } from "react";
import type { ScenarioEnvelope, ScenarioSlot, ScenarioEnvelopeUI } from "../model/scenarioEnvelope";
import type { CDIOv11 } from "../../../truthEngine";
import { computeCDOO } from "../../../truthEngine";

const defaultLabel: Record<ScenarioSlot, string> = {
  A: "Base",
  B: "Alt 1",
  C: "Alt 2",
};

function normalizeScenarioName(name: string | undefined, fallback: string) {
  const v = (name ?? "").trim();
  return v.length ? v : fallback;
}

function mkEnvelope(
  slot: ScenarioSlot,
  who: string,
  ui: ScenarioEnvelopeUI,
  toCDIO: (ui: ScenarioEnvelopeUI) => CDIOv11
): ScenarioEnvelope {
  const label = defaultLabel[slot];

  const nextUI: ScenarioEnvelopeUI = structuredClone({
    ...ui,
    scenarioName: normalizeScenarioName(ui.scenarioName, label),
  });

  const cdio = toCDIO(nextUI);

  // ✅ HERE: compute once for new envelopes
  let cdoo: ScenarioEnvelope["cdoo"] = undefined;
  let compute: ScenarioEnvelope["compute"] = { status: "idle" };

  try {
    cdoo = computeCDOO(cdio);
    compute = { status: "ok" };
  } catch (err) {
    compute = {
      status: "error",
      error: err instanceof Error ? err.message : "Unknown compute error.",
    };
  }

  return {
    slot,
    label,
    who,
    ui: nextUI,
    cdio,
    cdoo,
    compute,
  };
}

export function useScenarioSet(initial: {
  who: string;
  ui: ScenarioEnvelopeUI;
  toCDIO: (ui: ScenarioEnvelopeUI) => CDIOv11;
}) {
  const { who, ui, toCDIO } = initial;

  const [envelopes, setEnvelopes] = useState<ScenarioEnvelope[]>(() => [
    mkEnvelope("A", who, ui, toCDIO),
  ]);

  // Keep "who" in sync (do not overwrite scenario edits)
useEffect(() => {
  // Intentional: keep "who" in sync without overwriting scenario edits.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  setEnvelopes((prev) => prev.map((e) => ({ ...e, who })));
}, [who]);

  const slots = useMemo(() => envelopes.map((e) => e.slot), [envelopes]);

  const upsert = (slot: ScenarioSlot, patch: Partial<ScenarioEnvelope>) => {
    setEnvelopes((prev) => prev.map((e) => (e.slot === slot ? { ...e, ...patch } : e)));
  };

  const setCdio = (slot: ScenarioSlot, cdio: CDIOv11) => {
    // If you still want this setter, keep it consistent by computing here too.
    try {
      const cdoo = computeCDOO(cdio);
      upsert(slot, { cdio, cdoo, compute: { status: "ok" } });
    } catch (err) {
      upsert(slot, {
        cdio,
        cdoo: undefined,
        compute: { status: "error", error: err instanceof Error ? err.message : "Unknown compute error." },
      });
    }
  };

  const updateEnvelopeUI = (slot: ScenarioSlot, patch: Partial<ScenarioEnvelopeUI>) => {
    setEnvelopes((prev) =>
      prev.map((e) => {
        if (e.slot !== slot) return e;

        const nextUI: ScenarioEnvelopeUI = { ...e.ui, ...patch };

        if ("scenarioName" in patch) {
          nextUI.scenarioName = normalizeScenarioName(nextUI.scenarioName, e.label);
        }

        const cdio = toCDIO(nextUI);

        // ✅ HERE: recompute on edits
        try {
          const cdoo = computeCDOO(cdio);
          return {
            ...e,
            ui: nextUI,
            cdio,
            cdoo,
            compute: { status: "ok" },
          };
        } catch (err) {
          return {
            ...e,
            ui: nextUI,
            cdio,
            cdoo: undefined,
            compute: { status: "error", error: err instanceof Error ? err.message : "Unknown compute error." },
          };
        }
      })
    );
  };

  const addSlot = (slot: Exclude<ScenarioSlot, "A">) => {
    setEnvelopes((prev) => {
      if (prev.some((e) => e.slot === slot)) return prev;
      if (prev.length >= 3) return prev;

      const base = prev.find((e) => e.slot === "A");
      if (!base) return prev;

      const clonedUI = structuredClone(base.ui) as ScenarioEnvelopeUI;

      // Give new slot a distinct default name if it matches base
      const baseKey = normalizeScenarioName(base.ui.scenarioName, base.label).toLowerCase();
      const newDefault = defaultLabel[slot];
      const clonedKey = normalizeScenarioName(clonedUI.scenarioName, newDefault).toLowerCase();

      if (clonedKey === baseKey) clonedUI.scenarioName = newDefault;

      return [...prev, mkEnvelope(slot, base.who, clonedUI, toCDIO)];
    });
  };

  const removeSlot = (slot: Exclude<ScenarioSlot, "A">) => {
    setEnvelopes((prev) => prev.filter((e) => e.slot !== slot));
  };

  const rename = (slot: ScenarioSlot, label: string) => upsert(slot, { label });

  return {
    envelopes,
    slots,
    setCdio,
    addSlot,
    removeSlot,
    updateEnvelopeUI,
    rename,
    upsert,
  };
}