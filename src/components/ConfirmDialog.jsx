import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

/**
 * Generic confirmation dialog for destructive / status-changing actions.
 *
 * @param {boolean}  open
 * @param {string}   title
 * @param {string}   description
 * @param {string}   confirmLabel  text for the confirm button (default "Yes")
 * @param {string}   cancelLabel   text for the dismiss button (default "No")
 * @param {string}   confirmClass  optional Tailwind classes for the confirm button
 * @param {boolean}  loading       mutation in flight — disables both buttons
 * @param {Function} onConfirm
 * @param {Function} onCancel      close without acting
 */
export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Yes",
  cancelLabel = "No",
  confirmClass,
  loading = false,
  onConfirm,
  onCancel,
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button className={confirmClass} onClick={onConfirm} disabled={loading}>
            {loading ? "Updating…" : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
