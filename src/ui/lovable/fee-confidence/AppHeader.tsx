interface AppHeaderProps {
  title: string;
  subtitle?: string;
  modelBadge?: string;
  onLogOut?: () => void;
}

const AppHeader = ({ title, subtitle, modelBadge, onLogOut }: AppHeaderProps) => (
  <header className="fc-card-elevated flex items-center justify-between">
    <div className="flex items-center gap-3">
      <h1 className="text-xl font-bold tracking-tight text-foreground">{title}</h1>
      {modelBadge && <span className="fc-code-tag text-[10px]">{modelBadge}</span>}
    </div>

    <div className="flex items-center gap-2">
      {subtitle && <span className="text-xs text-muted-foreground mr-2">{subtitle}</span>}
      {onLogOut && (
        <button
          type="button"
          onClick={onLogOut}
          className="h-8 px-3 rounded-md border border-input bg-background text-xs font-semibold text-foreground hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
        >
          Log Out
        </button>
      )}
    </div>
  </header>
);

export default AppHeader;