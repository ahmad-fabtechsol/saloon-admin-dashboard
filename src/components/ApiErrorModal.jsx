import { AlertTriangle, XCircle } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { parseApiError } from "@/lib/apiError"

/**
 * Normalise whatever was handed to the modal (an RTK Query error object, a
 * plain string, or null) into a render-ready shape.
 */
function normalize(error, title) {
  if (error == null) return null

  if (typeof error === "string") {
    return { heading: title || error, body: title ? error : "", errors: [] }
  }

  const { message, fieldErrors } = parseApiError(error)
  const errors = Object.entries(fieldErrors).map(([key, msg]) => ({
    key,
    message: msg,
  }))
  const msg = message || "An unexpected error occurred."

  return {
    // Use the API message as the heading unless a custom title is supplied.
    heading: title || msg,
    body: errors.length ? "" : title ? msg : "",
    errors,
  }
}

/**
 * Dynamic, self-contained modal for rendering API errors. Drive it with local
 * state — no context required:
 *
 *   const { error, title, showError, clearError } = useApiError()
 *   ...
 *   <ApiErrorModal error={error} title={title} onClose={clearError} />
 */
export default function ApiErrorModal({ error, title, onClose }) {
  const data = normalize(error, title)
  const open = data != null

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose?.()}>
      <DialogContent showClose={false} className="max-w-sm gap-0 overflow-hidden p-0">
        {/* Accent bar */}
        <div className="h-1.5 w-full bg-destructive" />

        <div className="flex flex-col items-center gap-4 px-6 pb-6 pt-7">
          <DialogHeader className="items-center gap-3">
            <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
              <span className="absolute inset-0 animate-ping rounded-full bg-destructive/10" />
              <AlertTriangle className="relative h-7 w-7 text-destructive" />
            </div>
            <DialogTitle className="text-center text-base font-semibold">
              {data?.heading}
            </DialogTitle>
            {data?.body && !data?.errors.length && (
              <DialogDescription className="text-center leading-relaxed">
                {data.body}
              </DialogDescription>
            )}
          </DialogHeader>

          {data?.errors.length > 0 && (
            <ul className="w-full divide-y divide-destructive/15 overflow-hidden rounded-lg border border-destructive/20 bg-destructive/5 text-sm">
              {data.errors.map((e) => (
                <li key={e.key} className="flex items-start gap-2 px-3 py-2.5">
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                  <span className="text-foreground">
                    <span className="font-semibold capitalize">{e.key}</span>
                    <span className="text-muted-foreground"> — {e.message}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}

          <DialogFooter className="w-full">
            <Button
              onClick={onClose}
              className="w-full bg-[#145E94] text-white hover:bg-[#145E94]/90"
            >
              Dismiss
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
