import CodeTag from "./CodeTag";
import type { InputField } from "./types";

interface InputsCardProps {
  fields: InputField[];
  onAddScenario?: () => void;
  onImport?: () => void;
}

const InputsCard = ({ fields, onAddScenario, onImport }: InputsCardProps) => (
  <div className="fc-card-secondary flex flex-col gap-4">
    <div className="grid gap-3">
      {fields.map((field) => (
        <div key={field.code} className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            {field.code && <CodeTag>{field.code}</CodeTag>}
            <span className="fc-label">{field.label}</span>
          </div>
          <input
            type="text"
            inputMode="decimal"
            value={field.value}
            onChange={(e) => field.onChange?.(e.target.value)}
            className={`h-9 rounded-md border bg-card px-3 text-sm font-mono tabular-nums text-right text-card-foreground outline-none transition-colors
              focus:ring-2 focus:ring-ring focus:ring-offset-1
              ${field.error ? "border-destructive" : "border-input"}`}
          />
          {field.error && (
            <p className="text-xs text-destructive">{field.error}</p>
          )}
        </div>
      ))}
    </div>
    {(onAddScenario || onImport) && (
      <div className="flex items-center gap-2 pt-2 border-t border-border">
        {onAddScenario && (
          <button
            type="button"
            onClick={onAddScenario}
            className="flex-1 h-9 rounded-md border border-foreground bg-background text-sm font-semibold text-foreground hover:bg-accent transition-colors"
          >
            Add Scenario
          </button>
        )}
        {onImport && (
          <button
            type="button"
            onClick={onImport}
            className="flex-1 h-9 rounded-md border border-foreground bg-background text-sm font-semibold text-foreground hover:bg-accent transition-colors"
          >
            Import
          </button>
        )}
      </div>
    )}
  </div>
);

export default InputsCard;
