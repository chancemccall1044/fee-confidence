import type { ScenarioNameProps } from "./types";

const ScenarioName = ({
  value,
  onChange,
  validationMessage,
  isValid = true,
}: ScenarioNameProps) => (
  <div className="flex flex-col gap-1.5">
    <label className="fc-label" htmlFor="scenario-name">
      Scenario Name
    </label>
    <input
      id="scenario-name"
      type="text"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      className={`h-9 rounded-md border bg-card px-3 text-sm font-medium text-card-foreground outline-none transition-colors
        placeholder:text-muted-foreground
        focus:ring-2 focus:ring-ring focus:ring-offset-1
        ${!isValid ? "border-destructive focus:ring-destructive" : "border-input"}`}
      placeholder="e.g. Base Case Q3"
    />
    {validationMessage && (
      <p
        className={`text-xs ${
          isValid ? "text-muted-foreground" : "text-destructive"
        }`}
      >
        {validationMessage}
      </p>
    )}
  </div>
);

export default ScenarioName;
