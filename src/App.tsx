import { useMemo, useState, type ReactNode, type InputHTMLAttributes } from "react";
import { defaultScenarioUI, type ScenarioUI } from "./features/feeConfidence/model/ScenarioUI";
import { useComputedScenario } from "./features/feeConfidence/hooks/useComputedScenario";
import { percentToDecimalString } from "./features/feeConfidence/converters/percent";
import type { CDIOv11 } from "./truthEngine";

const APP_PASSCODE = "honkytonky";

/* ---------- Format Helpers ---------- */

const money = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(n);

const pct = (decimal: number) =>
  `${(decimal * 100).toFixed(2)}%`;

const show = <T,>(
  result: T | null | undefined,
  formatter: (value: T) => string
): string => {
  return result != null ? formatter(result) : "";
};

/* ---------- UI Components ---------- */
function PasscodeGate({
  onUnlock,
}: {
  onUnlock: (who: string) => void;
}) {
  const [pass, setPass] = useState("");
  const [who, setWho] = useState("");
  const [err, setErr] = useState<string | null>(null);

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#f9fafb", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 420, background: "white", border: "1px solid #e5e7eb", borderRadius: 16, padding: 20, boxShadow: "0 2px 6px rgba(0,0,0,0.04)" }}>
        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>Fee Confidence</div>
        <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 14 }}>
          Enter passcode to continue.
        </div>

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
                border: `1px solid ${err ? "#fca5a5" : "#e5e7eb"}`
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (pass !== APP_PASSCODE) {
                    setErr("Wrong passcode.");
                    return;
                  }
                  if (!who.trim()) {
                    setErr("Please enter your name.");
                    return;
                  }
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
              if (pass !== APP_PASSCODE) {
                setErr("Wrong passcode.");
                return;
              }

              if (!who.trim()) {
                setErr("Please enter your name.");
                return;
              }

              onUnlock(who.trim());
            }}
            style={{ height: 40, borderRadius: 10, border: "1px solid #e5e7eb", background: "#111827", color: "white", fontWeight: 700 }}
          >
            Unlock
          </button>
        </div>
      </div>
    </div>
  );
}


/* ---------- UI Components ---------- */

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div style={{ display: "grid", gap: 4 }}>
    <div style={{ fontSize: 12, color: "#6b7280" }}>{label}</div>
    <div style={{ fontSize: 18, fontWeight: 700 }}>{value}</div>
  </div>
);

const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <div style={{ display: "grid", gap: 6 }}>
    <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 600 }}>{label}</div>
    {children}
  </div>
);
type SelectInputProps = React.ComponentProps<"select"> & { invalid?: boolean };

const SelectInput = ({ invalid, ...props }: SelectInputProps) => (
  <select
    {...props}
    style={{
      width: "100%",
      maxWidth: "85%",
      height: 40,
      padding: "0 12px",
      borderRadius: 10,
      border: `1px solid ${invalid ? "#fca5a5" : "#e5e7eb"}`,
      boxShadow: invalid ? "0 0 0 3px rgba(239,68,68,0.10)" : "none",
      background: "white",
      fontSize: 14,
      outline: "none",
      display: "block",
      boxSizing: "border-box",
      ...(props.style ?? {}),
    }
    }

    onFocus={(e) => {
      e.currentTarget.style.borderColor = "#c7d2fe";
      e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.12)";
      props.onFocus?.(e);
    }}
    onBlur={(e) => {
      e.currentTarget.style.borderColor = invalid ? "#fca5a5" : "#e5e7eb";
      e.currentTarget.style.boxShadow = invalid ? "0 0 0 3px rgba(239,68,68,0.10)" : "none";
      props.onBlur?.(e);
    }}

  />
);

const TextInput = ({
  invalid,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) => (
  <input
    {...props}
    style={{
      width: "100%",
      maxWidth: "80%",
      height: 40,
      padding: "0 12px",
      borderRadius: 10,
      border: `1px solid ${invalid ? "#fca5a5" : "#e5e7eb"}`,
      boxShadow: invalid ? "0 0 0 3px rgba(239,68,68,0.10)" : "none",
      background: "white",
      fontSize: 14,
      outline: "none",
      ...(props.style ?? {}),
    }}
    onFocus={(e) => {
      e.currentTarget.style.borderColor = "#c7d2fe"; // subtle indigo tint
      e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.12)";
      props.onFocus?.(e);
    }}
    onBlur={(e) => {
      e.currentTarget.style.borderColor = invalid ? "#fca5a5" : "#e5e7eb";
      e.currentTarget.style.boxShadow = invalid ? "0 0 0 3px rgba(239,68,68,0.10)" : "none";
      props.onBlur?.(e);
    }}

  />
);

const Row = ({
  label,
  code,
  value,
  strong,
}: {
  label: string;
  code?: string;
  value: string;
  strong?: boolean;
}) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      gap: 16,
      padding: "10px 0",
      borderBottom: "1px solid #eef2f7",
      fontWeight: strong ? 700 : 500,
    }}
  >
    <div style={{ color: "#111827" }}>
      {label}
      {code && (
        <span style={{ color: "#9ca3af", fontSize: 12, marginLeft: 6 }}>
          {code}
        </span>
      )}
    </div>
    <div style={{ color: "#111827" }}>{value}</div>
  </div>
);


/* ---------- App ---------- */

function AuthedApp({ who, onLogout }: { who: string; onLogout: () => void }) {
  const [ui, setUi] = useState<ScenarioUI>(defaultScenarioUI);

  const cdio = useMemo<CDIOv11>(() => {
    return {
      cdio_version: "1.1",
      scenario_id: ui.scenarioName,
      contract_type: ui.contractTypeName,
      cost_inputs: {
        direct_labor: ui.directLabor,
        fringe_rate: percentToDecimalString(ui.fringePct),
        overhead_rate: percentToDecimalString(ui.overheadPct),
        gna_rate: percentToDecimalString(ui.gnaPct),
      },
      fee_input: {
        fee_percent: percentToDecimalString(ui.feePct),
      },
    };
  }, [
    ui.directLabor,
    ui.fringePct,
    ui.overheadPct,
    ui.gnaPct,
    ui.feePct,
    ui.scenarioName,
    ui.contractTypeName,
  ]);

  const { result, error, display, isStale } = useComputedScenario(cdio);

  const isParseableNumber = (s: string) => {
    const cleaned = s.trim().replace(/\$/g, "").replace(/,/g, "");
    if (cleaned === "") return false;
    return Number.isFinite(Number(cleaned));
  };

  const invalid = {
    directLabor: !isParseableNumber(ui.directLabor),
    fringePct: !isParseableNumber(ui.fringePct),
    overheadPct: !isParseableNumber(ui.overheadPct),
    gnaPct: !isParseableNumber(ui.gnaPct),
    feePct: !isParseableNumber(ui.feePct),
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f9fafb",
        padding: "32px 20px",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div style={{ width: "100%", maxWidth: 1000, margin: "0 auto" }}>
        {/* App header (NOT part of export card) */}
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 16,
            padding: 24,
            background: "white",
            boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
            marginTop: 2,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <h1 style={{ fontSize: 36, fontWeight: 800, margin: 0 }}>Fee Confidence</h1>
              <div
                style={{
                  padding: "4px 10px",
                  fontSize: 12,
                  fontWeight: 700,
                  borderRadius: 999,
                  background: "#eef2ff",
                  color: "#3730a3",
                }}
              >
                v1.1.0
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {who && (
                <div style={{ fontSize: 14, color: "#6b7280" }}>
                  Logged in as <b style={{ color: "#111827" }}>{who}</b>
                </div>
              )}

              <button
                onClick={onLogout}
                style={{
                  height: 32,
                  padding: "0 12px",
                  borderRadius: 8,
                  border: "1px solid #e5e7eb",
                  background: "white",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* ---------- Gold Output ---------- */}
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 16,
            padding: 24,
            background: "white",
            boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
            marginTop: 24,
          }}
        >

          {/* ... keep your existing Gold Output content here ... */}
          {/* Header Section */}
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 24 }}>
            <div>
              <div style={{ fontSize: 14, color: "#6b7280" }}>Scenario</div>
              <div style={{ fontSize: 24, fontWeight: 800 }}>{ui.scenarioName}</div>
              <div style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>
                Contract Type: <b style={{ color: "#111827" }}>{result?.contract_type ?? ui.contractTypeName}</b> •
                Rounding: <b style={{ color: "#111827" }}>{result?.meta.rounding ?? "HALF_AWAY_FROM_ZERO"}</b>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(200px, 1fr))", gap: 20 }}>
              <Stat label="Derived Contract Value" value={show(display?.fee_analysis.derived_contract_value, money)} />
              <Stat label="Total Cost" value={show(display?.cost_stack.total_cost, money)} />
              <Stat label="Fee Dollars" value={show(display?.fee_analysis.fee_dollars, money)} />
              <Stat label="Effective Margin" value={show(display?.fee_analysis.effective_margin_percent, pct)} />
            </div>
          </div>

          {/* Narrative Block */}
          <div
            style={{
              marginTop: 20,
              padding: 14,
              borderRadius: 12,
              background: "#f3f4f6",
              fontSize: 14,
              color: "#111827",
            }}
          >
            {result ? (
              <>
                Based on declared cost assumptions and a fee of <b>{show(result.fee_analysis.fee_percent, pct)}</b>,
                the derived contract value is <b>{show(result.fee_analysis.derived_contract_value, money)}</b> with an
                effective margin of <b>{show(result.fee_analysis.effective_margin_percent, pct)}</b>.
              </>
            ) : (
              <>
                Enter valid inputs to compute the derived contract value, fee dollars, and effective margin.
              </>
            )}
          </div>

          {/* Cost & Fee Sections */}
          <div style={{ opacity: isStale ? 0.35 : 1, transition: "opacity 120ms ease", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, marginTop: 28 }}>
            <div>
              <div style={{ fontWeight: 800, marginBottom: 10 }}>Cost Construction</div>
              <Row label="Direct Labor" code="DL" value={show(display?.cost_stack.direct_labor, money)} />
              <Row label="Fringe Amount" code="FA" value={show(display?.cost_stack.fringe_amount, money)} />
              <Row label="Overhead Amount" code="OA" value={show(display?.cost_stack.overhead_amount, money)} />
              <Row
                label="Fully Burdened Labor"
                code="FBL"
                value={show(display?.cost_stack.fully_burdened_labor, money)}
                strong
              />
              <Row label="G&A Amount" code="GA" value={show(display?.cost_stack.gna_amount, money)} />
              <Row label="Total Cost" code="TC" value={show(display?.cost_stack.total_cost, money)} strong />
            </div>

            <div>
              <div style={{ fontWeight: 800, marginBottom: 10 }}>Fee & Outcome</div>
              <Row label="Fee Percent" code="FP" value={show(display?.fee_analysis.fee_percent, pct)} />
              <Row label="Fee Dollars" code="FD" value={show(display?.fee_analysis.fee_dollars, money)} />
              <Row
                label="Derived Contract Value"
                code="DCV"
                value={show(display?.fee_analysis.derived_contract_value, money)}
                strong
              />
              <Row
                label="Effective Margin"
                code="EM"
                value={show(display?.fee_analysis.effective_margin_percent, pct)}
                strong
              />
            </div>

          </div>
          {/* JSON Toggle */}
          <details style={{ marginTop: 20 }}>
            <summary style={{ cursor: result ? "pointer" : "not-allowed", opacity: result ? 1 : 0.6 }}>
              show Canonical Output (CDOO JSON)
            </summary>
            {result ? (
              <pre
                style={{
                  padding: 14,
                  border: "1px solid #e5e7eb",
                  borderRadius: 12,
                  background: "#fafafa",
                  overflowX: "auto",
                  marginTop: 10,
                }}
              >
                {JSON.stringify(result, null, 2)}
              </pre>
            ) : (
              <div style={{ marginTop: 10, fontSize: 12, color: "#6b7280" }}>
                Fix inputs to view CDOO output.
              </div>
            )}
          </details>
        </div>

        {/* ---------- Assumptions (Input Controls) ---------- */}
        <details style={{ marginTop: 24 }}>
          <summary style={{ cursor: "pointer", fontWeight: 700, fontSize: 16, marginBottom: 12 }}>
            Assumptions & Inputs
          </summary>
          {/* Error banner */}
          {error && (
            <div
              style={{
                marginBottom: 16,
                padding: 12,
                borderRadius: 12,
                border: "1px solid #fecaca",
                background: "#fff1f2",
                color: "#7f1d1d",
                fontSize: 13,
                whiteSpace: "pre-wrap",
              }}
            >
              <b>Can’t compute:</b> {error}
            </div>
          )}
          <div
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 16,
              padding: 20,
              background: "white",
              boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
              marginTop: 12,
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(260px, 1fr))", gap: 16 }}>
              <Field label="Scenario Name">
                <TextInput
                  value={ui.scenarioName}
                  onChange={(e) =>
                    setUi((prev: ScenarioUI) => ({
                      ...prev,
                      scenarioName: e.target.value,
                    }))
                  }
                />
              </Field>

              <Field label="Contract Type">
                <SelectInput
                  value={ui.contractTypeName}
                  onChange={(e) =>
                    setUi((prev) => ({
                      ...prev,
                      contractTypeName: e.target.value as typeof prev.contractTypeName,
                    }))
                  }
                >
                  <option value="CPFF">CPFF</option>
                  <option value="TM">TM</option>
                </SelectInput>
              </Field>


              <Field label="Direct Labor ($)">
                <TextInput
                  value={ui.directLabor}
                  onChange={(e) =>
                    setUi((prev: ScenarioUI) => ({ ...prev, directLabor: e.target.value }))
                  }
                  inputMode="decimal"
                  invalid={invalid.directLabor}
                />
              </Field>

              <Field label="Fringe (%)">
                <TextInput
                  value={ui.fringePct}
                  onChange={(e) =>
                    setUi((prev: ScenarioUI) => ({ ...prev, fringePct: e.target.value }))
                  }
                  inputMode="decimal"
                  invalid={invalid.fringePct}
                />
              </Field>

              <Field label="Overhead (%)">
                <TextInput
                  value={ui.overheadPct}
                  onChange={(e) =>
                    setUi((prev: ScenarioUI) => ({ ...prev, overheadPct: e.target.value }))
                  }
                  inputMode="decimal"
                  invalid={invalid.overheadPct}
                />
              </Field>

              <Field label="G&A (%)">
                <TextInput
                  value={ui.gnaPct}
                  onChange={(e) =>
                    setUi((prev: ScenarioUI) => ({ ...prev, gnaPct: e.target.value }))
                  }
                  inputMode="decimal"
                  invalid={invalid.gnaPct}
                />
              </Field>

              <Field label="Fee (%)">
                <TextInput
                  value={ui.feePct}
                  onChange={(e) =>
                    setUi((prev: ScenarioUI) => ({ ...prev, feePct: e.target.value }))
                  }
                  inputMode="decimal"
                  invalid={invalid.feePct}
                />
              </Field>
            </div>

            <div style={{ marginTop: 14, fontSize: 12, color: "#6b7280" }}>
              Inputs are CDIO v1.1 fields. Percent inputs are converted to decimals for canonical calculation.
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}

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

