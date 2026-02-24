import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { CollapsibleCardProps } from "./types";

const CollapsibleCard = ({
  title,
  defaultCollapsed = false,
  collapsed: controlledCollapsed,
  onToggle,
  children,
  variant = "default",
  headerRight,
}: CollapsibleCardProps & { variant?: "default" | "secondary"; headerRight?: React.ReactNode }) => {
  const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed);
  const isCollapsed = controlledCollapsed ?? internalCollapsed;

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalCollapsed((prev) => !prev);
    }
  };

  return (
    <div className={variant === "secondary" ? "fc-card-secondary" : "fc-card"}>
      <div className="flex w-full items-center justify-between gap-2">
        <button
          type="button"
          onClick={handleToggle}
          className="flex items-center gap-2 text-left"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="fc-section-title">{title}</span>
        </button>
        {headerRight}
      </div>
      {!isCollapsed && <div className="mt-4">{children}</div>}
    </div>
  );
};

export default CollapsibleCard;
