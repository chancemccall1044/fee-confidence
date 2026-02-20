// src/features/feeConfidenceCompare/model/ScenarioEnvelope.ts

import type { CDIOv11 } from "../../../truthEngine";
import type { CDOOv11 } from "../../../truthEngine";

export type ScenarioSlot = "A" | "B" | "C";

export type ScenarioEnvelope = {
  slot: ScenarioSlot;

  // UI label (Base, Alt 1, etc)
  label: string;

  // Internal identity (NOT canonical)
  who: string;

  // Optional internal SSO wrapper (not part of CDIO/CDOO)
  sso?: Record<string, unknown>;

  // Canonical input (pure)
  cdio: CDIOv11;

  // Canonical computed output (pure)
  cdoo?: CDOOv11;

  // Compute state
  compute: {
    status: "idle" | "ok" | "error";
    error?: string;
  };

  // Optional UI state (not canonical)
  ui?: {
    isPinned?: boolean;
    notes?: string;
  };
};
