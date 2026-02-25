import { useId, useState, type ReactNode } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { CollapsibleCardProps } from "./types";

type Props = CollapsibleCardProps & {
  variant?: "default" | "secondary";
  headerRight?: ReactNode;
};

const CollapsibleCard = ({
  title,
  defaultCollapsed = false,
  collapsed: controlledCollapsed,
  onToggle,
  children,
  variant = "default",
  headerRight,
}: Props) => {
  const contentId = useId();
  const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed);
  const isCollapsed = controlledCollapsed ?? internalCollapsed;

  const handleToggle = () => {
    if (onToggle) onToggle();
    else setInternalCollapsed((prev) => !prev);
  };

  return (
    <div className={variant === "secondary" ? "fc-card-secondary" : "fc-card"}>
      <div className="flex w-full items-center justify-between gap-2">
        <button
          type="button"
          onClick={handleToggle}
          className="flex items-center gap-2 text-left"
          aria-expanded={!isCollapsed}
          aria-controls={contentId}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="fc-section-title">{title}</span>
        </button>

        {/* Keep headerRight clickable without affecting toggle */}
        <div className="shrink-0">{headerRight}</div>
      </div>

      {!isCollapsed && (
        <div id={contentId} className="mt-4">
          {children}
        </div>
      )}
    </div>
  );
};

export default CollapsibleCard;