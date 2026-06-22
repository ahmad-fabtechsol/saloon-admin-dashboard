import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ChevronLeft, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import ErrorState from "@/components/ErrorState"
import ConfirmDialog from "@/components/ConfirmDialog"
import {
  feedbackStatusConfig,
  feedbackTypeConfig,
  feedbackPriorityConfig,
  feedbackStatusOptions,
  feedbackPriorityOptions,
} from "@/lib/tableUtils"
import { parseApiError } from "@/lib/apiError"
import {
  useGetFeedbackByIdQuery,
  useUpdateFeedbackMutation,
  useDeleteFeedbackMutation,
} from "@/store/feedback/feedbackApiSlice"

const formatDateTime = (raw) => {
  if (!raw) return "—"
  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return String(raw)
  return new Intl.DateTimeFormat("en-PK", { dateStyle: "medium", timeStyle: "short" }).format(date)
}

function InfoRow({ label, children }) {
  return (
    <div className="grid grid-cols-[140px_1fr] items-start gap-4 border-b py-3 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{children ?? "—"}</span>
    </div>
  )
}

function SectionLabel({ children }) {
  return (
    <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </p>
  )
}

function Badge({ config }) {
  if (!config) return <span className="text-sm">—</span>
  const Icon = config.icon
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${config.cls}`}>
      {Icon && <Icon className="h-3.5 w-3.5" />}
      {config.label}
    </span>
  )
}

function BackButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex w-fit items-center gap-1 text-sm text-[#145E94] hover:underline"
    >
      <ChevronLeft className="h-4 w-4" />
      Back to Feedback
    </button>
  )
}

export default function FeedbackDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { data, isLoading, error, refetch } = useGetFeedbackByIdQuery(id)
  const [updateFeedback, { isLoading: saving }] = useUpdateFeedbackMutation()
  const [deleteFeedback, { isLoading: deleting }] = useDeleteFeedbackMutation()

  const feedback = data?.data ?? data?.result ?? data ?? null

  const [form, setForm] = useState({ status: "", priority: "", adminNote: "", adminResponse: "" })
  const [confirmDelete, setConfirmDelete] = useState(false)

  // Seed the form once the feedback loads (or changes).
  useEffect(() => {
    if (feedback) {
      setForm({
        status: feedback.status ?? "open",
        priority: feedback.priority ?? "",
        adminNote: feedback.adminNote ?? "",
        adminResponse: feedback.adminResponse ?? "",
      })
    }
  }, [feedback])

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const handleSave = async () => {
    try {
      await updateFeedback({
        feedbackId: id,
        status: form.status || undefined,
        priority: form.priority || undefined,
        adminNote: form.adminNote,
        adminResponse: form.adminResponse,
      }).unwrap()
      toast.success("Feedback updated")
    } catch (err) {
      toast.error(parseApiError(err).message)
    }
  }

  const handleDelete = async () => {
    try {
      await deleteFeedback(id).unwrap()
      toast.success("Feedback deleted")
      navigate("/feedback")
    } catch (err) {
      toast.error(parseApiError(err).message)
      setConfirmDelete(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <BackButton onClick={() => navigate("/feedback")} />
        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <Card>
            <CardContent className="flex flex-col gap-4 p-6">
              <Skeleton className="h-6 w-48" />
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-5 w-full" />
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col gap-3 p-5">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error || !feedback) {
    return (
      <div className="flex flex-col gap-4">
        <BackButton onClick={() => navigate("/feedback")} />
        <Card>
          <CardContent className="p-0">
            <ErrorState
              title={error ? "Couldn't load feedback" : "Feedback not found"}
              message={
                error ? parseApiError(error).message : "This feedback may have been removed."
              }
              onRetry={error ? refetch : undefined}
            />
          </CardContent>
        </Card>
      </div>
    )
  }

  const user = feedback.user ?? feedback.customer ?? feedback.submittedBy ?? {}
  const subject = feedback.subject ?? feedback.title ?? "Feedback"
  const message = feedback.message ?? feedback.description ?? feedback.comment ?? "—"

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <BackButton onClick={() => navigate("/feedback")} />
        <Separator orientation="vertical" className="h-4" />
        <h1 className="text-lg font-semibold">{subject}</h1>
        <Badge config={feedbackStatusConfig[feedback.status]} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        {/* ── Left: feedback content ── */}
        <Card>
          <CardContent className="flex flex-col gap-6 p-6">
            <div>
              <SectionLabel>Details</SectionLabel>
              <div className="divide-y rounded-lg border px-4">
                <InfoRow label="Type">
                  <Badge config={feedbackTypeConfig[feedback.type]} />
                </InfoRow>
                <InfoRow label="Status">
                  <Badge config={feedbackStatusConfig[feedback.status]} />
                </InfoRow>
                <InfoRow label="Priority">
                  {feedback.priority ? (
                    <Badge config={feedbackPriorityConfig[feedback.priority]} />
                  ) : (
                    "—"
                  )}
                </InfoRow>
                <InfoRow label="Submitted">{formatDateTime(feedback.createdAt)}</InfoRow>
              </div>
            </div>

            <div>
              <SectionLabel>Message</SectionLabel>
              <p className="whitespace-pre-wrap rounded-lg border p-4 text-sm">{message}</p>
            </div>

            <div>
              <SectionLabel>Submitted By</SectionLabel>
              <div className="divide-y rounded-lg border px-4">
                <InfoRow label="Name">{user.name ?? feedback.userName}</InfoRow>
                <InfoRow label="Contact">
                  {user.contact ?? user.phone ?? user.email ?? feedback.userEmail}
                </InfoRow>
              </div>
            </div>

            {feedback.adminResponse && (
              <div>
                <SectionLabel>Current Response to User</SectionLabel>
                <p className="whitespace-pre-wrap rounded-lg border border-[#145E94]/20 bg-[#145E94]/5 p-4 text-sm">
                  {feedback.adminResponse}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Right: manage panel ── */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardContent className="flex flex-col gap-5 p-5">
              <SectionLabel>Manage Feedback</SectionLabel>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="status">Status</Label>
                <Select value={form.status} onValueChange={(v) => setField("status", v)}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {feedbackStatusOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="priority">Priority</Label>
                <Select value={form.priority} onValueChange={(v) => setField("priority", v)}>
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {feedbackPriorityOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="adminNote">Internal Note</Label>
                <Textarea
                  id="adminNote"
                  rows={3}
                  value={form.adminNote}
                  onChange={(e) => setField("adminNote", e.target.value)}
                  placeholder="Private note for the team…"
                  disabled={saving}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="adminResponse">Response to User</Label>
                <Textarea
                  id="adminResponse"
                  rows={4}
                  value={form.adminResponse}
                  onChange={(e) => setField("adminResponse", e.target.value)}
                  placeholder="Message the user will see…"
                  disabled={saving}
                />
              </div>

              <Button onClick={handleSave} disabled={saving} className="w-full">
                {saving ? "Saving…" : "Save Changes"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col gap-3 p-5">
              <SectionLabel>Danger Zone</SectionLabel>
              <Button
                variant="outline"
                className="w-full border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() => setConfirmDelete(true)}
                disabled={deleting}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Feedback
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this feedback?"
        description={`"${subject}" will be permanently deleted. This cannot be undone.`}
        confirmClass="bg-red-600 text-white hover:bg-red-600/90"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  )
}
