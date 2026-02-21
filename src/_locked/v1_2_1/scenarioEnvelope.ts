// src/features/feeConfidenceCompare/model/ScenarioEnvelope.ts

import type { CDIOv11 } from "../../../truthEngine";
import type { CDOOv11 } from "../../../truthEngine";

export type ScenarioSlot = "A" | "B" | "C";

export type ScenarioEnvelopeUI = {
  scenarioName: string;      // required
  isPinned?: boolean;
  notes?: string;
};

export type ScenarioEnvelope = {
  slot: ScenarioSlot;
  label: string;
  who: string;
  sso?: Record<string, unknown>;
  cdio: CDIOv11;
  cdoo?: CDOOv11;

  ui: ScenarioEnvelopeUI;    // ✅ single ui object

  compute: {
    status: "idle" | "ok" | "error";
    error?: string;
  };
};