import { useCallback, useState } from "react"

/**
 * Local error state for the <ApiErrorModal /> component (no Context API).
 *
 *   const { error, title, showError, clearError } = useApiError()
 *   ...
 *   catch (err) { showError(err) }            // RTK Query error or string
 *   showError("Link expired", "Invalid link") // optional custom heading
 *   ...
 *   <ApiErrorModal error={error} title={title} onClose={clearError} />
 */
export function useApiError() {
  const [state, setState] = useState({ error: null, title: undefined })

  const showError = useCallback((error, title) => {
    setState({ error, title })
  }, [])

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }))
  }, [])

  return { error: state.error, title: state.title, showError, clearError }
}
