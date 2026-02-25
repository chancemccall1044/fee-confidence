import { useId } from "react";
import type { ScenarioNameProps } from "./types";

const ScenarioName = ({
  value,
  onChange,
  validationMessage,
  isValid = true,
}: ScenarioNameProps) => {
  const inputId = useId();
  const messageId = `${inputId}-message`;

  return (
    <div className="flex flex-col gap-1.5">
      <label className="fc-label" htmlFor={inputId}>
        Scenario Name
      </label>

      <input
        id={inputId}
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        aria-invalid={!isValid}
        aria-describedby={validationMessage ? messageId : undefined}
        autoComplete="off"
        className={`h-9 rounded-md border bg-card px-3 text-sm font-medium text-card-foreground transition-colors
          placeholder:text-muted-foreground
          focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1
          ${!isValid ? "border-destructive focus:ring-destructive" : "border-input"}`}
        placeholder="e.g. Base Case Q3"
      />

      {validationMessage && (
        <p
          id={messageId}
          className={`text-xs ${
            isValid ? "text-muted-foreground" : "text-destructive"
          }`}
        >
          {validationMessage}
        </p>
      )}
    </div>
  );
};

export default ScenarioName;