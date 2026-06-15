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

// Per-status copy + confirm button styling.
const COPY = {
  approved: {
    title: "Approve this salon?",
    description: (name) => `"${name}" will be approved and made active on the platform.`,
    confirmLabel: "Approve",
    confirmClass: "bg-emerald-600 text-white hover:bg-emerald-600/90",
  },
  suspended: {
    title: "Suspend this salon?",
    description: (name) => `"${name}" will be suspended and hidden from customers.`,
    confirmLabel: "Suspend",
    confirmClass: "bg-amber-600 text-white hover:bg-amber-600/90",
  },
  rejected: {
    title: "Reject this salon?",
    description: (name) => `"${name}" will be rejected. Please provide a reason for the owner.`,
    confirmLabel: "Reject",
    confirmClass: "bg-red-600 text-white hover:bg-red-600/90",
  },
}

/**
 * Confirmation dialog for salon status changes. For "rejected" it requires a
 * rejection reason; for "approved" / "suspended" it's a simple confirm.
 *
 * @param {string}   action     "approved" | "rejected" | "suspended"
 * @param {object}   salon      the row being acted on ({ id, name, ... })
 * @param {boolean}  loading    mutation in flight
 * @param {Function} onConfirm  called with extra body fields ({} or { rejectionReason })
 * @param {Function} onCancel   close without acting
 */
export default function SalonStatusDialog({
  open,
  action,
  salon,
  loading = false,
  onConfirm,
  onCancel,
}) {
  const [reason, setReason] = useState("")
  const [reasonError, setReasonError] = useState("")

  // Reset the form whenever the dialog (re)opens for a different action/salon.
  useEffect(() => {
    if (open) {
      setReason("")
      setReasonError("")
    }
  }, [open, action, salon?.id])

  const copy = COPY[action] ?? COPY.approved
  const isReject = action === "rejected"

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
          <DialogTitle>{copy.title}</DialogTitle>
          <DialogDescription>
            {copy.description(salon?.name ?? "This salon")}
          </DialogDescription>
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
              placeholder="Let the owner know why this salon was rejected…"
              aria-invalid={!!reasonError}
              disabled={loading}
            />
            {reasonError && (
              <p className="text-xs text-destructive">{reasonError}</p>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button
            className={copy.confirmClass}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? "Updating…" : copy.confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
