import CollapsibleCard from "./CollapsibleCard";

interface JsonOutputDrawerProps {
  data: Record<string, unknown>;
  collapsed?: boolean;
  onToggle?: () => void;
  onExport?: () => void;
}

const JsonOutputDrawer = ({
  data,
  collapsed,
  onToggle,
  onExport,
}: JsonOutputDrawerProps) => (
  <CollapsibleCard
    title="show Canonical Output (CDOO JSON)"
    defaultCollapsed={true}
    collapsed={collapsed}
    onToggle={onToggle}
    headerRight={
      onExport ? (
        <button
          type="button"
          onClick={onExport}
          className="h-7 px-3 rounded-md border border-foreground bg-background text-xs font-semibold text-foreground hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
        >
          Export
        </button>
      ) : null
    }
  >
    <pre className="overflow-x-auto rounded-md bg-secondary p-4 text-xs font-mono leading-relaxed text-secondary-foreground max-h-80 overflow-y-auto">
      {JSON.stringify(data, null, 2)}
    </pre>
  </CollapsibleCard>
);

export default JsonOutputDrawer;