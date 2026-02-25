import { AlertCircle, X } from "lucide-react";
import type { ErrorBannerProps } from "./types";

const ErrorBanner = ({ message, onDismiss }: ErrorBannerProps) => {
  if (!message) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      className="flex items-start gap-3 rounded-md border border-destructive/30 bg-destructive/8 px-4 py-3"
    >
      <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-destructive" />

      <p className="text-sm text-destructive flex-1">{message}</p>

      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 text-destructive/60 hover:text-destructive transition-colors focus:outline-none focus:ring-2 focus:ring-destructive/40 rounded"
          aria-label="Dismiss error"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default ErrorBanner;