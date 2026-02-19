// truthEngine.ts
// Fee Confidence — Truth Engine
// Purpose: Deterministic CDIO v1.1 → CDOO v1.1 computation with explicit rounding doctrine.
// Risk note: Any change in parsing, rounding, or step order can change money outputs. Treat as “core math”.

/* ---------- Rounding Doctrine ----------
   FSS v1.1 doctrine: round currency to cents after each step using round-half-away-from-zero; no extended precision carry-forward.
*/
export type ContractType = "CPFF" | "TM";

/* ---------- Canonical Input Model (CDIO v1.1) ----------
   Defines the only accepted input shape for Truth Engine compute; UI may be looser, but Truth Engine normalizes here.
*/
export interface CDIOv11 {
  cdio_version: "1.1";
  scenario_id: string;

  // Contract type is carried through for reporting/labeling.
  // NOTE: v1.1 Truth Engine does not branch math by contract_type (yet).
  contract_type: ContractType;

  cost_inputs: {
    direct_labor: number | string; // USD dollars (2 decimals preferred)
    fringe_rate: number | string; // decimal (e.g., 0.2850)
    overhead_rate: number | string; // decimal
    gna_rate: number | string; // decimal
  };
  fee_input: {
    fee_percent: number | string; // decimal (e.g., 0.0750)
  };

  // Optional metadata, intentionally ignored by compute to keep calculations pure/deterministic.
  provenance?: Record<string, unknown>;
}

/* ---------- Canonical Output Model (CDOO v1.1) ----------
   Defines the output shape produced by Truth Engine; all money values are returned as USD numbers for UI display.
*/
export interface CDOOv11 {
  cdoo_version: "1.1";
  scenario_id: string;
  contract_type: ContractType;
  cost_stack: {
    direct_labor: number;
    fringe_amount: number;
    overhead_amount: number;
    fully_burdened_labor: number;
    gna_amount: number;
    total_cost: number;
  };
  fee_analysis: {
    fee_percent: number; // decimal
    fee_dollars: number;
    derived_contract_value: number;
    effective_margin_percent: number; // decimal fraction (e.g., 0.0698 == 6.98%)
  };
  meta: {
    rounding: "HALF_AWAY_FROM_ZERO";
    currency_decimals: 2;
    rate_precision: "PPM_1e6";
  };
}

/* ---------- Parsing: Money → Cents (BigInt) ----------
   Normalizes USD inputs into integer cents to avoid floating point drift and ensure deterministic rounding.
*/
/**
 * Parses USD into integer cents (BigInt) deterministically.
 * - Accepts number or string.
 * - Strings may contain commas and a leading $.
 * - Ingestion truncates beyond 2 decimals (doctrine: Truth Engine operates at cents precision).
 */
function parseMoneyToCents(input: number | string): bigint {
  const s = String(input).trim().replace(/\$/g, "").replace(/,/g, "");
  if (!/^-?\d+(\.\d+)?$/.test(s)) throw new Error(`Invalid money: ${input}`);

  const neg = s.startsWith("-");
  const [wholeRaw, fracRaw = ""] = (neg ? s.slice(1) : s).split(".");
  const whole = BigInt(wholeRaw || "0");
  const frac2 = (fracRaw + "00").slice(0, 2); // truncate beyond 2 for ingestion
  const cents = whole * 100n + BigInt(frac2);
  return neg ? -cents : cents;
}

/* ---------- Parsing: Rates → PPM (BigInt) ----------
   Normalizes decimal rates into parts-per-million (1e6) integers for deterministic multiplication/division.
*/
/**
 * Parses a decimal rate into parts-per-million (PPM, 1e6) as BigInt.
 * Example: "0.2850" -> 285000
 * Note: Ingestion truncates beyond 6 decimals. If we later need “true rounding” at parse time, change here carefully.
 */
function parseRateToPPM(input: number | string): bigint {
  const s = String(input).trim().replace(/,/g, "");
  if (!/^-?\d+(\.\d+)?$/.test(s)) throw new Error(`Invalid rate: ${input}`);

  const neg = s.startsWith("-");
  const [wholeRaw, fracRaw = ""] = (neg ? s.slice(1) : s).split(".");
  const whole = BigInt(wholeRaw || "0");
  const frac6 = (fracRaw + "000000").slice(0, 6); // truncate beyond 6
  const ppm = whole * 1_000_000n + BigInt(frac6);
  return neg ? -ppm : ppm;
}

/* ---------- Rounding Primitive ----------
   Implements the doctrine “round-half-away-from-zero” for deterministic integer division.
*/
/**
 * Integer division with round-half-away-from-zero for ties.
 * - denominator must be positive
 * - works for negative numerators (symmetry around zero)
 * Example:  5/2  -> 3,  -5/2 -> -3
 */
function divRoundHalfAwayFromZero(numerator: bigint, denominator: bigint): bigint {
  if (denominator <= 0n) throw new Error("denominator must be positive");
  if (numerator === 0n) return 0n;

  const neg = numerator < 0n;
  const a = neg ? -numerator : numerator;

  const q = a / denominator;
  const r = a % denominator;

  // Compare 2*r to denominator for half threshold.
  // If exactly half (twiceR === denominator), we round away from zero.
  const twiceR = 2n * r;
  const rounded = twiceR >= denominator ? q + 1n : q;

  return neg ? -rounded : rounded;
}

/* ---------- Rate Application (Cents × PPM → Cents) ----------
   Multiplies currency (cents) by a rate (PPM) and returns cents, rounded per doctrine.
*/
/**
 * Apply a PPM rate to an integer cents value.
 * Formula: round_half_away_from_zero(cents * ppm / 1_000_000)
 * Note: Keeps everything as integers until the final display conversion.
 */
function applyRateCents(cents: bigint, ratePPM: bigint): bigint {
  const numerator = cents * ratePPM;
  return divRoundHalfAwayFromZero(numerator, 1_000_000n);
}

/* ---------- Display Conversions ----------
   Converts deterministic BigInt values into JS numbers for rendering/UI. (Truth stays integer internally.)
*/
function centsToNumber(cents: bigint): number {
  // Safe for typical contract scales; if we ever expect extreme values, return strings instead.
  return Number(cents) / 100;
}

function ppmToDecimal(ppm: bigint): number {
  return Number(ppm) / 1_000_000;
}

/* ---------- Truth Engine Compute ----------
   CDIO v1.1 → CDOO v1.1. Step order matters because rounding occurs after each step.
*/

/* ---------- DO NOT BREAK (Read Before Editing) ----------
   1) Do NOT change step order: rounding occurs after each step and outputs will change.
   2) Do NOT replace BigInt math with float math: you will introduce drift and nondeterminism.
   3) Do NOT “simplify” by combining formulas: fewer round points = different results.
   If behavior must change, bump the model version and add a regression test vector first.
*/

/**
 * Computes the canonical output model from canonical inputs.
 *
 * IMPORTANT INVARIANTS:
 * - All intermediate currency values are integer cents (BigInt).
 * - Rounding to cents is applied at each rate-application step (FA, OA, GA, FD).
 * - Do not “optimize” by combining steps or using floats; that will change results.
 */
export function computeCDOO(cd: CDIOv11): CDOOv11 {
  
  /* ---------- Input Normalization ----------
     Convert all user inputs into deterministic integer representations (cents + PPM).
  */
  const DL = parseMoneyToCents(cd.cost_inputs.direct_labor);
  const FR = parseRateToPPM(cd.cost_inputs.fringe_rate);
  const OR = parseRateToPPM(cd.cost_inputs.overhead_rate);
  const GR = parseRateToPPM(cd.cost_inputs.gna_rate);
  const FP = parseRateToPPM(cd.fee_input.fee_percent);

  /* ---------- Canonical Equations ----------
     All currency calculations are in cents; comments show formulas with round2() implied by cents rounding.
  */

  // FA = round2(DL × FR)
  const FA = applyRateCents(DL, FR);

  // OA = round2((DL + FA) × OR)
  const OA = applyRateCents(DL + FA, OR);

  // FBL = round2(DL + FA + OA)
  // (Already integer cents; shown explicitly to preserve step clarity.)
  const FBL = DL + FA + OA;

  // GA = round2(FBL × GR)
  const GA = applyRateCents(FBL, GR);

  // TC = round2(FBL + GA)
  const TC = FBL + GA;

  // FD = round2(TC × FP)
  const FD = applyRateCents(TC, FP);

  // DCV = round2(TC + FD)
  const DCV = TC + FD;

  /* ---------- Effective Margin ----------
     EM = FD / DCV (decimal fraction).
     We compute using PPM precision for determinism, then convert to a decimal for display.
  */
  const EM_PPM = DCV === 0n ? 0n : divRoundHalfAwayFromZero(FD * 1_000_000n, DCV);
  const EM = ppmToDecimal(EM_PPM);

  /* ---------- Assemble Canonical Output ----------
     Return values as numbers for UI display, while preserving meta describing doctrine/precision.
  */
  return {
    cdoo_version: "1.1",
    scenario_id: cd.scenario_id,
    contract_type: cd.contract_type,
    cost_stack: {
      direct_labor: centsToNumber(DL),
      fringe_amount: centsToNumber(FA),
      overhead_amount: centsToNumber(OA),
      fully_burdened_labor: centsToNumber(FBL),
      gna_amount: centsToNumber(GA),
      total_cost: centsToNumber(TC),
    },
    fee_analysis: {
      fee_percent: ppmToDecimal(FP),
      fee_dollars: centsToNumber(FD),
      derived_contract_value: centsToNumber(DCV),
      effective_margin_percent: EM, // decimal fraction (0.0698 == 6.98%)
    },
    meta: {
      rounding: "HALF_AWAY_FROM_ZERO",
      currency_decimals: 2,
      rate_precision: "PPM_1e6",
    },
  };
}
/* ---------- Regression Test Vector (Golden Case) ----------
   Purpose: Detect unintended math drift when refactoring.

   INPUT:
     DL = 1000.00
     FR = 0.10
     OR = 0.20
     GR = 0.05
     FP = 0.10

   EXPECTED OUTPUT:
     FA  = 100.00
     OA  = 220.00
     FBL = 1320.00
     GA  = 66.00
     TC  = 1386.00
     FD  = 138.60
     DCV = 1524.60
     EM  ≈ 0.0909 (9.09%)

   If any of these values change without a model version bump,
   you have changed the rounding or step-order doctrine.
*/

