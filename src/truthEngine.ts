// truthEngine.ts
// FSS Truth Engine (CDIO -> CDOO) with deterministic rounding
// Rounding Doctrine (FSS v1.1):
// - Round currency to 2 decimals after each calculation step
// - Use round-half-away-from-zero for ties
// - No extended precision carry-forward

export type ContractType = "CPFF" | "TM";

export interface CDIOv11 {
  cdio_version: "1.1";
  scenario_id: string;
  contract_type: ContractType;
  cost_inputs: {
    direct_labor: number | string;     // USD dollars (2 decimals preferred)
    fringe_rate: number | string;      // decimal (e.g., 0.2850)
    overhead_rate: number | string;    // decimal
    gna_rate: number | string;         // decimal
  };
  fee_input: {
    fee_percent: number | string;      // decimal (e.g., 0.0750)
  };
  // provenance optional, ignored by Truth Engine for calculations
  provenance?: Record<string, unknown>;
}

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
    fee_percent: number;               // decimal
    fee_dollars: number;
    derived_contract_value: number;
    effective_margin_percent: number;  // decimal (e.g., 0.0698 == 6.98% margin / 100)
  };
  meta: {
    rounding: "HALF_AWAY_FROM_ZERO";
    currency_decimals: 2;
    rate_precision: "PPM_1e6";
  };
}

/**
 * Parses USD into integer cents (BigInt) deterministically.
 * Accepts number or string. Strings may contain commas and leading $.
 */
function parseMoneyToCents(input: number | string): bigint {
  const s0 = String(input).trim().replace(/\$/g, "").replace(/,/g, "");
  if (!/^-?\d+(\.\d+)?$/.test(s0)) throw new Error(`Invalid money: ${input}`);

  const neg = s0.startsWith("-");
  const s = neg ? s0.slice(1) : s0;

  const [wholeRaw, fracRaw = ""] = s.split(".");
  const whole = BigInt(wholeRaw || "0");

  const fracPadded = (fracRaw + "000").slice(0, 3); // 3 digits for rounding
  const d0 = BigInt(fracPadded[0] ?? "0");
  const d1 = BigInt(fracPadded[1] ?? "0");
  const d2 = BigInt(fracPadded[2] ?? "0"); // rounding digit

  let cents = whole * 100n + d0 * 10n + d1;

  // half-away-from-zero: if rounding digit >= 5, bump cent by 1
  if (d2 >= 5n) cents += 1n;

  return neg ? -cents : cents;
}


/**
 * Parses a decimal rate into parts-per-million (PPM, 1e6) as BigInt.
 * Example: "0.2850" -> 285000
 * Uses truncation beyond 6 decimals (can be tightened later if desired).
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

/**
 * Round-half-away-from-zero for integer division numerator/denominator.
 * denominator must be positive.
 */
function divRoundHalfAwayFromZero(numerator: bigint, denominator: bigint): bigint {
  if (denominator <= 0n) throw new Error("denominator must be positive");
  if (numerator === 0n) return 0n;

  const neg = numerator < 0n;
  const a = neg ? -numerator : numerator;

  const q = a / denominator;
  const r = a % denominator;

  // Compare 2*r to denominator for half threshold
  const twiceR = 2n * r;
  const rounded = twiceR >= denominator ? q + 1n : q;

  return neg ? -rounded : rounded;
}

/**
 * Multiply integer cents by PPM rate, return integer cents with HALF_AWAY_FROM_ZERO.
 * cents * ppm / 1_000_000
 */
function applyRateCents(cents: bigint, ratePPM: bigint): bigint {
  // allow negative, though typical inputs are >= 0
  const numerator = cents * ratePPM;
  return divRoundHalfAwayFromZero(numerator, 1_000_000n);
}

function centsToNumber(cents: bigint): number {
  // Safe for typical contract scales; if you expect > ~$90T, keep as string.
  return Number(cents) / 100;
}

function ppmToDecimal(ppm: bigint): number {
  return Number(ppm) / 1_000_000;
}

/**
 * Truth Engine: CDIO v1.1 -> CDOO v1.1
 */
function assertRate0to100(label: string, ppm: bigint) {
  if (ppm < 0n || ppm > 1_000_000n) {
    throw new Error(`${label} must be between 0% and 100%`);
  }
}

function assertCentsNonNegative(label: string, cents: bigint) {
  if (cents < 0n) throw new Error(`${label} must be ≥ 0`);
}

export function computeCDOO(cd: CDIOv11): CDOOv11 {
  // Parse inputs
  const DL = parseMoneyToCents(cd.cost_inputs.direct_labor);
  const FR = parseRateToPPM(cd.cost_inputs.fringe_rate);
  const OR = parseRateToPPM(cd.cost_inputs.overhead_rate);
  const GR = parseRateToPPM(cd.cost_inputs.gna_rate);
  const FP = parseRateToPPM(cd.fee_input.fee_percent);

  // Domain validation (v1.0.x hardening)
  assertCentsNonNegative("Direct labor", DL);
  assertRate0to100("Fringe rate", FR);
  assertRate0to100("Overhead rate", OR);
  assertRate0to100("G&A rate", GR);
  assertRate0to100("Fee percent", FP);

  // Canonical equations with round2 (cents) after each step:
  // FA = round2(DL × FR)
  const FA = applyRateCents(DL, FR);

  // OA = round2((DL + FA) × OR)
  const OA = applyRateCents(DL + FA, OR);

  // FBL = round2(DL + FA + OA)
  // (Already integer cents, but we keep it explicit.)
  const FBL = DL + FA + OA;

  // GA = round2(FBL × GR)
  const GA = applyRateCents(FBL, GR);

  // TC = round2(FBL + GA)
  const TC = FBL + GA;

  // FD = round2(TC × FP)
  const FD = applyRateCents(TC, FP);

  // DCV = round2(TC + FD)
  const DCV = TC + FD;

  // EM = FD ÷ DCV (decimal fraction)
  // Use PPM precision for determinism, then convert to decimal.
  // (Display layer can render percent with 2 decimals.)
  const EM_PPM = DCV === 0n ? 0n : divRoundHalfAwayFromZero(FD * 1_000_000n, DCV);
  const EM = ppmToDecimal(EM_PPM); // e.g., 0.0698

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
      effective_margin_percent: EM, // decimal fraction (0.0698)
    },
    meta: {
      rounding: "HALF_AWAY_FROM_ZERO",
      currency_decimals: 2,
      rate_precision: "PPM_1e6",
    },
  };
}
