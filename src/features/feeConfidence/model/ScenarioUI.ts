export type ScenarioUI = {
  directLabor: string;
  fringePct: string;
  overheadPct: string;
  gnaPct: string;
  feePct: string;
  scenarioName: string;
  contractTypeName: "CPFF"|"TM";
};

export const defaultScenarioUI: ScenarioUI = {
  directLabor: "54254.00",
  fringePct: "28.50",
  overheadPct: "42.00",
  gnaPct: "12.00",
  feePct: "7.50",
  scenarioName: "Proof of Concept Test 1.0",
  contractTypeName: "CPFF",
};
