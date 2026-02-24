/** Shared prop types for Fee Confidence presentational components */

export interface CostStackRow {
  code: string;
  label: string;
  value: number;
  percentage?: number;
}

export interface FeeAnalysisData {
  feePercent: number;
  feeAmount: number;
  effectiveMargin: number;
  contractValue: number;
  totalCost: number;
}

export interface InputField {
  code: string;
  label: string;
  value: string;
  onChange?: (value: string) => void;
  error?: string;
}

export interface ErrorBannerProps {
  message: string | null;
  onDismiss?: () => void;
}

export interface ScenarioNameProps {
  value: string;
  onChange?: (value: string) => void;
  validationMessage?: string;
  isValid?: boolean;
}

export interface CollapsibleCardProps {
  title: string;
  defaultCollapsed?: boolean;
  collapsed?: boolean;
  onToggle?: () => void;
  children: React.ReactNode;
}

/** A single scenario's complete display data */
export interface ScenarioData {
  name: string;
  inputs: InputField[];
  costStack: CostStackRow[];
  totalCost: number;
  feeAnalysis: FeeAnalysisData;
}

/** Row definition for the comparison table */
export interface ComparisonRow {
  code: string;
  label: string;
  /** Optional sub-label (e.g. a field path) */
  sublabel?: string;
  /** If true, this row is a section header */
  isHeader?: boolean;
  /** If true, this row is a total/summary row */
  isTotal?: boolean;
  /** If true, this row is the primary outcome (Effective Margin) */
  isPrimary?: boolean;
  /** Format type for display */
  format: "currency" | "percent" | "percent2";
  /** Key to look up value from scenario data */
  valueKey: string;
}
