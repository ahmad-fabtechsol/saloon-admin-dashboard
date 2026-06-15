import { createContext, useCallback, useContext, useMemo, useState } from "react"
import { AlertCircle } from "lucide-react"

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

const ErrorModalContext = createContext(null)

const INITIAL = {
  open: false,
  title: "Something went wrong",
  message: "",
  errors: [], // [{ key, message }] — field-level errors from the API
}

/**
 * App-wide modal for surfacing API errors.
 *
 * - `showError(message, title?)`  — show a plain message.
 * - `showApiError(error, title?)` — parse an RTK Query error and show its
 *   field errors (the `errors` map) as "key: message" rows; falls back to the
 *   top-level message when there are none.
 */
export function ErrorModalProvider({ children }) {
  const [state, setState] = useState(INITIAL)

  const hideError = useCallback(() => {
    setState((prev) => ({ ...prev, open: false }))
  }, [])

  const showError = useCallback((message, title = "Something went wrong") => {
    setState({
      open: true,
      title,
      message: message || "An unexpected error occurred.",
      errors: [],
    })
  }, [])

  const showApiError = useCallback((error, title) => {
    const { message, fieldErrors } = parseApiError(error)
    const errors = Object.entries(fieldErrors).map(([key, msg]) => ({
      key,
      message: msg,
    }))
    setState({
      open: true,
      // When the API returns field errors we surface those, using the top-level
      // message as the heading instead of the body.
      title: title || message || "Something went wrong",
      message: errors.length ? "" : message || "An unexpected error occurred.",
      errors,
    })
  }, [])

  const value = useMemo(
    () => ({ showError, showApiError, hideError }),
    [showError, showApiError, hideError]
  )

  const hasFieldErrors = state.errors.length > 0

  return (
    <ErrorModalContext.Provider value={value}>
      {children}

      <Dialog open={state.open} onOpenChange={(open) => !open && hideError()}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <div className="mx-auto mb-1 flex h-11 w-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertCircle className="h-6 w-6" />
            </div>
            <DialogTitle className="text-center">{state.title}</DialogTitle>
            {!hasFieldErrors && (
              <DialogDescription className="text-center">
                {state.message}
              </DialogDescription>
            )}
          </DialogHeader>

          {hasFieldErrors && (
            <ul className="flex flex-col gap-1.5 rounded-md border border-destructive/20 bg-destructive/5 p-3 text-sm">
              {state.errors.map((e) => (
                <li key={e.key} className="text-foreground">
                  <span className="font-semibold capitalize text-destructive">
                    {e.key}
                  </span>
                  : {e.message}
                </li>
              ))}
            </ul>
          )}

          <DialogFooter className="sm:justify-center">
            <Button
              onClick={hideError}
              className="bg-[#145E94] text-white hover:bg-[#145E94]/90"
            >
              Dismiss
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ErrorModalContext.Provider>
  )
}

export function useErrorModal() {
  const ctx = useContext(ErrorModalContext)
  if (!ctx) {
    throw new Error("useErrorModal must be used within an ErrorModalProvider")
  }
  return ctx
}
