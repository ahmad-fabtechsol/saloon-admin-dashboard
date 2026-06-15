import { AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

/**
 * Generic inline error screen with an optional retry action. Used inside the
 * table body (and reusable anywhere a data fetch can fail).
 */
export default function ErrorState({
  title = "Couldn't load data",
  message = "Something went wrong while fetching the data. Please try again.",
  onRetry,
  retrying = false,
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold">{title}</p>
        {message && (
          <p className="mx-auto max-w-sm text-xs text-muted-foreground">{message}</p>
        )}
      </div>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          disabled={retrying}
          className="mt-1"
        >
          <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${retrying ? "animate-spin" : ""}`} />
          {retrying ? "Retrying…" : "Try again"}
        </Button>
      )}
    </div>
  )
}
