/**
 * LOCKED: v1.2.x — Scenario name uniqueness validation
 * - Scenario name stored on ScenarioEnvelope.ui.scenarioName
 * - Active envelope selection safe (A/B/C)
 * - Add B/C disabled when nameError exists
 * - Uniqueness check normalizes whitespace + case
 *
 * Next work should happen in v1.3.x branch/copy.
 */
import { useMemo, useState } from "react";
import { defaultScenarioUI, type ScenarioUI } from "./features/feeConfidence/model/ScenarioUI";
import { useComputedScenario } from "./features/feeConfidence/hooks/useComputedScenario";
import { percentToDecimalString } from "./features/feeConfidence/converters/percent";
import type { CDIOv11 } from "./truthEngine";
import { useScenarioSet } from "./features/feeConfidenceCompare/hooks/useScenarioSet";
import { useLovableCompare } from "./features/feeConfidenceCompare/hooks/useLovableCompare";

import AppHeader from "./ui/lovable/fee-confidence/AppHeader";
import ScenarioName from "./ui/lovable/fee-confidence/ScenarioName";
import ErrorBanner from "./ui/lovable/fee-confidence/ErrorBanner";
import InputsCard from "./ui/lovable/fee-confidence/InputsCard";
import CostStackCard from "./ui/lovable/fee-confidence/CostStackCard";
import FeeAnalysisCard from "./ui/lovable/fee-confidence/FeeAnalysisCard";
import JsonOutputDrawer from "./ui/lovable/fee-confidence/JsonOutputDrawer";
import CollapsibleCard from "./ui/lovable/fee-confidence/CollapsibleCard";
import ScenarioComparisonTable from "./ui/lovable/fee-confidence/ScenarioComparisonTable";

import type { InputField, CostStackRow, FeeAnalysisData } from "./ui/lovable/fee-confidence/types";

/* ---------- App Constants ----------
   Local friction gate for internal use only (NOT authentication/authorization).
*/
const APP_PASSCODE = "honkytonky";

/* ---------- PasscodeGate ----------
   Lightweight “keep honest people honest” gate; stores unlock + identity in browser storage.
   (Kept as-is for v1.2.x; not part of the Lovable component set listed.)
*/
function PasscodeGate({ onUnlock }: { onUnlock: (who: string) => void }) {
  const [pass, setPass] = useState("");
  const [who, setWho] = useState("");
  const [err, setErr] = useState<string | null>(null);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#f9fafb",
        padding: 24,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "white",
          border: "1px solid #e5e7eb",
          borderRadius: 16,
          padding: 20,
          boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>Fee Confidence</div>
        <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 14 }}>Enter passcode to continue.</div>

        <div style={{ display: "grid", gap: 10 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6 }}>Name</div>
            <input
              value={who}
              onChange={(e) => setWho(e.target.value)}
              placeholder="e.g., Mike"
              style={{ width: "94%", height: 40, padding: "0 12px", borderRadius: 10, border: "1px solid #e5e7eb" }}
            />
          </div>

          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6 }}>Passcode</div>
            <input
              value={pass}
              placeholder="••••••••"
              type="password"
              style={{
                width: "94%",
                height: 40,
                padding: "0 12px",
                borderRadius: 10,
                border: `1px solid ${err ? "#fca5a5" : "#e5e7eb"}`,
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (pass !== APP_PASSCODE) return setErr("Wrong passcode.");
                  if (!who.trim()) return setErr("Please enter your name.");
                  onUnlock(who.trim());
                }
              }}
              onChange={(e) => {
                setPass(e.target.value);
                if (err) setErr(null);
              }}
            />
          </div>

          {err && <div style={{ fontSize: 12, color: "#7f1d1d" }}>{err}</div>}

          <button
            onClick={() => {
              if (pass !== APP_PASSCODE) return setErr("Wrong passcode.");
              if (!who.trim()) return setErr("Please enter your name.");
              onUnlock(who.trim());
            }}
            style={{
              height: 40,
              borderRadius: 10,
              border: "1px solid #e5e7eb",
              background: "#111827",
              color: "white",
              fontWeight: 700,
            }}
          >
            Unlock
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- AuthedApp ---------- */

function AuthedApp({ who, onLogout }: { who: string; onLogout: () => void }) {
  const [activeSlot, setActiveSlot] = useState<"A" | "B" | "C">("A");
  const [jsonCollapsed, setJsonCollapsed] = useState(true);
  const [inputsCollapsed, setInputsCollapsed] = useState(true);

  // UI -> CDIO mapper (used by useScenarioSet)
  const toCDIO = (u: ScenarioUI): CDIOv11 => ({
    cdio_version: "1.1",
    scenario_id: u.scenarioName,
    contract_type: u.contractTypeName,
    cost_inputs: {
      direct_labor: u.directLabor,
      fringe_rate: percentToDecimalString(u.fringePct),
      overhead_rate: percentToDecimalString(u.overheadPct),
      gna_rate: percentToDecimalString(u.gnaPct),
    },
    fee_input: {
      fee_percent: percentToDecimalString(u.feePct),
    },
  });

  const scenarioSet = useScenarioSet({
    who,
    ui: defaultScenarioUI,
    toCDIO,
  });

  const { envelopes, slots, addSlot, removeSlot, updateEnvelopeUI } = scenarioSet;

  // Active envelope selection (safe even if B/C removed)
  const activeEnvelope = envelopes.find((e) => e.slot === activeSlot) ?? envelopes[0];
  const effectiveActiveSlot = activeEnvelope.slot;
  const activeUI = activeEnvelope.ui;

  // Compute only for the active scenario (compare view computes its own columns)
  const cdio = activeEnvelope.cdio;
  const { result, error, display, isStale } = useComputedScenario(cdio);

  const lovable = useLovableCompare(envelopes);

  /* ---------- UI Validation (Parseability Only) ---------- */
  const isParseableNumber = (s: string) => {
    const cleaned = s.trim().replace(/\$/g, "").replace(/,/g, "");
    if (cleaned === "") return false;
    return Number.isFinite(Number(cleaned));
  };

  const normalizeName = (s: string) => s.trim().replace(/\s+/g, " ").toLowerCase();

  const getScenarioNameError = (name: string, selfSlot: string) => {
    const key = normalizeName(name);
    if (!key) return "Scenario name is required.";

    const conflict = envelopes.find((e) => e.slot !== selfSlot && normalizeName(e.ui.scenarioName) === key);
    return conflict ? `Scenario name must be unique (conflicts with Scenario ${conflict.slot}).` : null;
  };

  const nameError = getScenarioNameError(activeUI.scenarioName, effectiveActiveSlot);

  const invalid = {
    directLabor: !isParseableNumber(activeUI.directLabor),
    fringePct: !isParseableNumber(activeUI.fringePct),
    overheadPct: !isParseableNumber(activeUI.overheadPct),
    gnaPct: !isParseableNumber(activeUI.gnaPct),
    feePct: !isParseableNumber(activeUI.feePct),
  };

  const canAddB = !slots.includes("B");
  const canAddC = slots.includes("B") && !slots.includes("C");

  const onAddScenario = () => {
    if (!!nameError) return; // keep: disabled when nameError exists
    if (canAddB) return addSlot("B");
    if (canAddC) return addSlot("C");
  };

  const slotButton = (slot: "A" | "B" | "C") => {
    const exists = slots.includes(slot);
    const selected = effectiveActiveSlot === slot;

    return (
      <button
        key={slot}
        type="button"
        onClick={() => exists && setActiveSlot(slot)}
        disabled={!exists}
        className={[
          "h-8 w-9 rounded-md border text-xs font-extrabold transition-colors",
          exists ? "opacity-100" : "opacity-40 cursor-not-allowed",
          selected ? "bg-foreground text-background border-foreground" : "bg-background text-foreground border-border",
        ].join(" ")}
        title={exists ? `Switch to Scenario ${slot}` : `Scenario ${slot} not added`}
      >
        {slot}
      </button>
    );
  };

  // ---- Adapters for Lovable presentational components (smallest possible) ----

  const inputFields: InputField[] = useMemo(() => {
    const fields: InputField[] = [
      {
        code: "DL",
        label: "Direct Labor ($)",
        value: activeUI.directLabor,
        onChange: (v) => updateEnvelopeUI(effectiveActiveSlot, { directLabor: v }),
        error: invalid.directLabor ? "Enter a valid number." : undefined,
      },
      {
        code: "FR",
        label: "Fringe (%)",
        value: activeUI.fringePct,
        onChange: (v) => updateEnvelopeUI(effectiveActiveSlot, { fringePct: v }),
        error: invalid.fringePct ? "Enter a valid number." : undefined,
      },
      {
        code: "OH",
        label: "Overhead (%)",
        value: activeUI.overheadPct,
        onChange: (v) => updateEnvelopeUI(effectiveActiveSlot, { overheadPct: v }),
        error: invalid.overheadPct ? "Enter a valid number." : undefined,
      },
      {
        code: "GA",
        label: "G&A (%)",
        value: activeUI.gnaPct,
        onChange: (v) => updateEnvelopeUI(effectiveActiveSlot, { gnaPct: v }),
        error: invalid.gnaPct ? "Enter a valid number." : undefined,
      },
      {
        code: "FP",
        label: "Fee (%)",
        value: activeUI.feePct,
        onChange: (v) => updateEnvelopeUI(effectiveActiveSlot, { feePct: v }),
        error: invalid.feePct ? "Enter a valid number." : undefined,
      },
    ];

    return fields;
  }, [
    activeUI.directLabor,
    activeUI.fringePct,
    activeUI.overheadPct,
    activeUI.gnaPct,
    activeUI.feePct,
    effectiveActiveSlot,
    invalid.directLabor,
    invalid.fringePct,
    invalid.overheadPct,
    invalid.gnaPct,
    invalid.feePct,
    updateEnvelopeUI,
  ]);

  const costRows: CostStackRow[] = useMemo(() => {
    const cs = display?.cost_stack;
    if (!cs) return [];

    return [
      { code: "DL", label: "Direct Labor", value: cs.direct_labor },
      { code: "FA", label: "Fringe Amount", value: cs.fringe_amount },
      { code: "OA", label: "Overhead Amount", value: cs.overhead_amount },
      { code: "FBL", label: "Fully Burdened Labor", value: cs.fully_burdened_labor },
      { code: "GA", label: "G&A Amount", value: cs.gna_amount },
      { code: "TC", label: "Total Cost", value: cs.total_cost },
    ];
  }, [display?.cost_stack]);

  const feeData: FeeAnalysisData = useMemo(() => {
    const fa = display?.fee_analysis;

    // Lovable cards expect "percent units" (e.g., 12.34) because they format with `${v.toFixed()}%` (no *100).
    const feePercent = fa ? fa.fee_percent * 100 : 0;
    const effectiveMargin = fa ? fa.effective_margin_percent * 100 : 0;

    return {
      feePercent,
      feeAmount: fa?.fee_dollars ?? 0,
      effectiveMargin,
      contractValue: fa?.derived_contract_value ?? 0,
      totalCost: display?.cost_stack?.total_cost ?? 0,
    };
  }, [display?.fee_analysis, display?.cost_stack?.total_cost]);

  const headerSubtitle = who ? `Logged in as ${who}` : undefined;

  return (
    <div className="min-h-screen bg-background px-5 py-8">
      <div className="mx-auto w-full max-w-[1400px] px-2 grid gap-6">
        {/* Header */}
        <div className="grid gap-3">
          <AppHeader
            title="Fee Confidence"
            subtitle={headerSubtitle}
            modelBadge={`v${import.meta.env.VITE_APP_VERSION ?? "1.2.x"}`}
            onLogOut={onLogout}
          />

          {/* Scenario controls row */}
          <div className="fc-card-secondary flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground mr-1">Scenario</span>
              {slotButton("A")}
              {slotButton("B")}
              {slotButton("C")}
            </div>

            <div className="flex items-center gap-2">
              {canAddB && (
                <button
                  type="button"
                  onClick={() => addSlot("B")}
                  disabled={!!nameError}
                  className={[
                    "h-9 px-3 rounded-md border text-sm font-semibold transition-colors",
                    "border-foreground bg-background text-foreground hover:bg-accent",
                    nameError ? "opacity-50 cursor-not-allowed" : "",
                  ].join(" ")}
                >
                  + B
                </button>
              )}

              {canAddC && (
                <button
                  type="button"
                  onClick={() => addSlot("C")}
                  disabled={!!nameError}
                  className={[
                    "h-9 px-3 rounded-md border text-sm font-semibold transition-colors",
                    "border-foreground bg-background text-foreground hover:bg-accent",
                    nameError ? "opacity-50 cursor-not-allowed" : "",
                  ].join(" ")}
                >
                  + C
                </button>
              )}

              {slots.includes("C") && (
                <button
                  type="button"
                  onClick={() => removeSlot("C")}
                  className="h-9 px-3 rounded-md border border-border bg-background text-sm font-semibold text-destructive hover:bg-accent transition-colors"
                >
                  − C
                </button>
              )}

              {slots.includes("B") && !slots.includes("C") && (
                <button
                  type="button"
                  onClick={() => removeSlot("B")}
                  className="h-9 px-3 rounded-md border border-border bg-background text-sm font-semibold text-destructive hover:bg-accent transition-colors"
                >
                  − B
                </button>
              )}
            </div>
          </div>
        </div>

                {/* Main layout: content + right rail */}
        <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_360px] md:items-start">
          {/* LEFT: Results / Compare */}
          <div className="grid gap-6">
            {/* Gold Output / Results */}
            <div className="fc-card-elevated grid gap-5">
              {/* Topline / context */}
              <div className="flex flex-col gap-2">
                <div className="text-sm text-muted-foreground">Scenario</div>
                <div className="text-2xl font-extrabold tracking-tight text-foreground">
                  {activeUI.scenarioName}
                </div>
                <div className="text-xs text-muted-foreground">
                  Contract Type:{" "}
                  <b className="text-foreground">
                    {result?.contract_type ?? activeUI.contractTypeName}
                  </b>{" "}
                  • Rounding:{" "}
                  <b className="text-foreground">
                    {result?.meta.rounding ?? "HALF_AWAY_FROM_ZERO"}
                  </b>
                </div>
              </div>

              {/* Summary band */}
              <div className="rounded-md bg-secondary px-5 py-4 border border-border text-sm text-secondary-foreground">
                {result ? (
                  <>
                    Based on declared cost assumptions and a fee of{" "}
                    <b>{((display?.fee_analysis?.fee_percent ?? 0) * 100).toFixed(2)}%</b>, the
                    derived contract value is{" "}
                    <b>
                      {(display?.fee_analysis?.derived_contract_value ?? 0).toLocaleString("en-US", {
                        style: "currency",
                        currency: "USD",
                        minimumFractionDigits: 0,
                      })}
                    </b>{" "}
                    with an effective margin of{" "}
                    <b>{((display?.fee_analysis?.effective_margin_percent ?? 0) * 100).toFixed(2)}%</b>.
                  </>
                ) : (
                  <>Enter valid inputs to compute the derived contract value, fee dollars, and effective margin.</>
                )}
              </div>

              {/* Error banner (compute failures) */}
              <ErrorBanner message={error ? `Can’t compute: ${error}` : null} />

              {/* Detailed tables / cards */}
              {slots.length === 1 ? (
                <div
                  className={[
                    "grid gap-6 md:grid-cols-2 transition-opacity",
                    isStale ? "opacity-35" : "opacity-100",
                  ].join(" ")}
                >
                  <CostStackCard
                    rows={costRows}
                    totalLabel="Total Cost"
                    totalValue={display?.cost_stack?.total_cost ?? 0}
                  />
                  <FeeAnalysisCard data={feeData} />
                </div>
              ) : (
                <ScenarioComparisonTable
                  rows={lovable.rows}
                  scenarios={lovable.scenarios}
                  deltas={lovable.deltas}
                />
              )}

              {/* Canonical JSON */}
              <JsonOutputDrawer
                data={(result ?? {}) as Record<string, unknown>}
                collapsed={jsonCollapsed}
                onToggle={() => setJsonCollapsed((v) => !v)}
              />
            </div>
          </div>

          {/* RIGHT: Inputs rail (always visible on md+) */}
          <div className="grid gap-4">
            <div className="fc-card-secondary grid gap-4">
              <ScenarioName
                value={activeUI.scenarioName}
                onChange={(v) => updateEnvelopeUI(effectiveActiveSlot, { scenarioName: v })}
                isValid={!nameError}
                validationMessage={nameError ?? undefined}
              />

              <div className="flex flex-col gap-1.5">
                <label className="fc-label" htmlFor="contract-type">
                  Contract Type
                </label>
                <select
                  id="contract-type"
                  value={activeUI.contractTypeName}
                  onChange={(e) =>
                    updateEnvelopeUI(effectiveActiveSlot, {
                      contractTypeName: e.target.value as ScenarioUI["contractTypeName"],
                    })
                  }
                  className="h-9 rounded-md border border-input bg-card px-3 text-sm font-medium text-card-foreground outline-none transition-colors
                    focus:ring-2 focus:ring-ring focus:ring-offset-1"
                >
                  <option value="CPFF">CPFF</option>
                  <option value="TM">TM</option>
                </select>
              </div>

              <InputsCard
                fields={inputFields}
                onAddScenario={slots.length < 3 ? onAddScenario : undefined}
                // onImport={...} // leave undefined until you wire import behavior
              />

              <p className="text-xs text-muted-foreground">
                Inputs are CDIO v1.1 fields. Percent inputs are converted to decimals for canonical calculation.
              </p>
            </div>

            {/* Optional: keep collapsible inputs for small screens only (no duplicates on md+) */}
            <div className="md:hidden">
              <CollapsibleCard
                title="Assumptions & Inputs"
                defaultCollapsed={true}
                collapsed={inputsCollapsed}
                onToggle={() => setInputsCollapsed((v) => !v)}
                variant="secondary"
              >
                <div className="grid gap-5">
                  <ScenarioName
                    value={activeUI.scenarioName}
                    onChange={(v) => updateEnvelopeUI(effectiveActiveSlot, { scenarioName: v })}
                    isValid={!nameError}
                    validationMessage={nameError ?? undefined}
                  />
                  <InputsCard fields={inputFields} />
                </div>
              </CollapsibleCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- App Root ---------- */

export default function App() {
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem("fc_unlocked") === "1");
  const [who, setWho] = useState(() => localStorage.getItem("fc_who") ?? "");

  if (!unlocked) {
    return (
      <PasscodeGate
        onUnlock={(whoName) => {
          sessionStorage.setItem("fc_unlocked", "1");
          localStorage.setItem("fc_who", whoName);
          setWho(whoName);
          setUnlocked(true);
        }}
      />
    );
  }

  return (
    <AuthedApp
      who={who}
      onLogout={() => {
        sessionStorage.removeItem("fc_unlocked");
        setUnlocked(false);
      }}
    />
  );
}