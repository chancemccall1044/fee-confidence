// src/features/feeConfidenceCompare/model/ScenarioEnvelope.ts

import type { CDIOv11, CDOOv11 } from "../../../truthEngine";
import type { ScenarioUI } from "../../feeConfidence/model/ScenarioUI";

export type ScenarioSlot = "A" | "B" | "C";

// Envelope UI becomes the *full* edit surface.
// Add compare-only metadata here as optional fields.
export type ScenarioEnvelopeUI = ScenarioUI & {
  isPinned?: boolean;
  notes?: string;
};

export type ScenarioEnvelope = {
  slot: ScenarioSlot;
  label: string;
  who: string;
  sso?: Record<string, unknown>;

  // Canonical objects can be derived from ui, but keeping them cached is fine.
  cdio: CDIOv11;
  cdoo?: CDOOv11;

  ui: ScenarioEnvelopeUI;

  compute: {
    status: "idle" | "ok" | "error";
    error?: string;
  };
};