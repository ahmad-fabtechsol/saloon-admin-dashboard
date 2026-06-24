import { useEffect, useState } from "react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

/**
 * Confirmation dialog for an approve / reject review action — shared by the
 * salon pending-changes and the per-service review flows.
 *
 * Rejecting requires a reason (sent as `rejectionReason`); approving is a
 * simple confirm.
 *
 * @param {boolean}  open
 * @param {"approve"|"reject"} action
 * @param {string}   title       dialog heading
 * @param {string}   description supporting copy under the heading
 * @param {boolean}  loading     mutation in flight
 * @param {Function} onConfirm   called with extra body fields ({} or { rejectionReason })
 * @param {Function} onCancel    close without acting
 */
export default function ReviewDialog({
  open,
  action,
  title,
  description,
  loading = false,
  onConfirm,
  onCancel,
}) {
  const [reason, setReason] = useState("")
  const [reasonError, setReasonError] = useState("")

  // Reset the form whenever the dialog (re)opens.
  useEffect(() => {
    if (open) {
      setReason("")
      setReasonError("")
    }
  }, [open, action, title])

  const isReject = action === "reject"

  function handleConfirm() {
    if (isReject && !reason.trim()) {
      setReasonError("Rejection reason is required")
      return
    }
    onConfirm(isReject ? { rejectionReason: reason.trim() } : {})
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {isReject && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rejectionReason">Rejection reason</Label>
            <Textarea
              id="rejectionReason"
              rows={4}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value)
                if (reasonError) setReasonError("")
              }}
              placeholder="Explain why this is being rejected…"
              aria-invalid={!!reasonError}
              disabled={loading}
            />
            {reasonError && <p className="text-xs text-destructive">{reasonError}</p>}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button
            className={
              isReject
                ? "bg-red-600 text-white hover:bg-red-600/90"
                : "bg-emerald-600 text-white hover:bg-emerald-600/90"
            }
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? "Submitting…" : isReject ? "Reject" : "Approve"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
