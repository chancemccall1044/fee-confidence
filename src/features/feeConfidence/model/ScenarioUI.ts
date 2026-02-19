/* ---------- ScenarioUI (View Model) ----------
   UI-layer representation of a scenario.
   NOTE: This is NOT the canonical CDIO model.
   All values are stored as strings to preserve raw user input and avoid premature numeric coercion.
*/
export type ScenarioUI = {
  directLabor: string;       // USD dollars, string-formatted (e.g., "54254.00")
  fringePct: string;         // Percent form (e.g., "28.50" means 28.50%)
  overheadPct: string;       // Percent form
  gnaPct: string;            // Percent form
  feePct: string;            // Percent form
  scenarioName: string;      // UI label only (not used by Truth Engine math)
  contractTypeName: "CPFF" | "TM"; // Mirrors ContractType but kept separate for UI decoupling
};

/* ---------- Default Scenario ----------
   Initial UI state when the app loads.
   Chosen to represent a plausible modeling case (not a regression vector).
   Safe to modify for UX reasons; does not affect Truth Engine doctrine.
*/
export const defaultScenarioUI: ScenarioUI = {
  directLabor: "54254.00",
  fringePct: "28.50",
  overheadPct: "42.00",
  gnaPct: "12.00",
  feePct: "7.50",
  scenarioName: "Proof of Concept Test 1.0",
  contractTypeName: "CPFF",
};
