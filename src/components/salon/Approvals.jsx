import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  ImageOff,
  Scissors,
  Store,
  X,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import ErrorState from "@/components/ErrorState"
import ReviewDialog from "@/components/salon/ReviewDialog"
import {
  useGetPendingApprovalsQuery,
  useReviewPendingChangesMutation,
  useReviewServiceMutation,
} from "@/store/salon/salonApiSlice"
import { useApiError } from "@/hooks/useApiError"
import ApiErrorModal from "@/components/ApiErrorModal"
import { parseApiError } from "@/lib/apiError"

const PAGE_SIZE = 10

// camelCase / snake_case → "Title Case"
function humanize(key) {
  return String(key)
    .replace(/[_-]+/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

// Badge styling per known _pendingType. Unknown types fall back to neutral.
const TYPE_CONFIG = {
  new_service: { label: "New Service", cls: "bg-[#145E94]/10 text-[#145E94] ring-[#145E94]/20" },
  updated_service: { label: "Service Update", cls: "bg-[#145E94]/10 text-[#145E94] ring-[#145E94]/20" },
  pending_changes: { label: "Profile Update", cls: "bg-amber-50 text-amber-700 ring-amber-200" },
  salon_update: { label: "Profile Update", cls: "bg-amber-50 text-amber-700 ring-amber-200" },
  profile_update: { label: "Profile Update", cls: "bg-amber-50 text-amber-700 ring-amber-200" },
}

// A pending item is a service review when its type mentions "service" or it
// carries service fields; everything else is treated as salon pending-changes.
function isServiceItem(item) {
  const type = item?._pendingType ?? ""
  return /service/i.test(type) || item?.serviceName != null
}

const PHOTO_KEYS = ["photos", "images", "newPhotos", "photo", "image"]
function getPhotos(obj) {
  if (!obj || typeof obj !== "object") return []
  for (const key of PHOTO_KEYS) {
    const val = obj[key]
    if (Array.isArray(val) && val.length) return val.filter((u) => typeof u === "string")
    if (typeof val === "string" && val) return [val]
  }
  return []
}

// Context / internal keys that are rendered explicitly or not at all — the rest
// of a salon-change item is surfaced as a generic "changed field" row.
const HIDDEN_KEYS = new Set([
  ...PHOTO_KEYS,
  "_id",
  "id",
  "__v",
  "entityId",
  "salonId",
  "salonName",
  "ownerName",
  "ownerContact",
  "city",
  "_pendingType",
  "status",
  "createdAt",
  "updatedAt",
  "serviceName",
  "serviceCategory",
])

function formatValue(v) {
  if (v == null || v === "") return "—"
  if (typeof v === "boolean") return v ? "Yes" : "No"
  if (Array.isArray(v)) {
    const flat = v.filter((x) => x != null && typeof x !== "object")
    return flat.length ? flat.join(", ") : `${v.length} item${v.length === 1 ? "" : "s"}`
  }
  if (typeof v === "object") {
    const parts = Object.entries(v)
      .filter(([, val]) => val != null && val !== "" && typeof val !== "object")
      .map(([k, val]) => `${humanize(k)}: ${val}`)
    return parts.length ? parts.join(" · ") : "—"
  }
  return String(v)
}

function formatDate(iso) {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
}

function TypeBadge({ type }) {
  const cfg = TYPE_CONFIG[type] ?? {
    label: type ? humanize(type) : "Pending",
    cls: "bg-slate-100 text-slate-600 ring-slate-200",
  }
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${cfg.cls}`}
    >
      {cfg.label}
    </span>
  )
}

function PhotoGrid({ photos, alt }) {
  return (
    <div className="flex flex-wrap gap-3">
      {photos.map((url, i) => (
        <a
          key={i}
          href={url}
          target="_blank"
          rel="noreferrer"
          className="h-24 w-24 overflow-hidden rounded-lg border bg-muted"
        >
          <img
            src={url}
            alt={`${alt} ${i + 1}`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform hover:scale-105"
          />
        </a>
      ))}
    </div>
  )
}

function PageHeader({ total }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <h1 className="text-lg font-semibold">Pending Approvals</h1>
      {total > 0 && (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
          <Clock className="h-3 w-3" />
          {total} awaiting review
        </span>
      )}
    </div>
  )
}

function PendingItemCard({ item, onReview, onOpenSalon, isMutating }) {
  const isService = isServiceItem(item)
  const photos = getPhotos(item)
  const changeRows = Object.entries(item).filter(
    ([k, v]) => !HIDDEN_KEYS.has(k) && !k.startsWith("_") && v != null && v !== ""
  )

  const title = isService
    ? (item.serviceName ?? "Unnamed service")
    : (item.salonName ?? "Salon profile changes")

  const context = [item.salonName, item.city, item.ownerName].filter(Boolean)
  // Avoid repeating the salon name in the context line when it's already the title.
  const contextLine = (isService ? context : context.slice(1)).join(" · ")
  const submitted = formatDate(item.updatedAt ?? item.createdAt)

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-5">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              {isService ? <Scissors className="h-5 w-5" /> : <Store className="h-5 w-5" />}
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-base font-semibold">{title}</h2>
                <TypeBadge type={item._pendingType} />
              </div>
              {contextLine && (
                <p className="mt-0.5 truncate text-sm text-muted-foreground">{contextLine}</p>
              )}
            </div>
          </div>
          {submitted && (
            <span className="shrink-0 text-xs text-muted-foreground">{submitted}</span>
          )}
        </div>

        {/* Details */}
        <div className="divide-y rounded-lg border px-4">
          {isService && item.serviceCategory && (
            <Row label="Category">{item.serviceCategory}</Row>
          )}
          {item.ownerContact && <Row label="Owner Contact">{item.ownerContact}</Row>}
          {changeRows.map(([key, value]) => (
            <Row key={key} label={humanize(key)}>
              {formatValue(value)}
            </Row>
          ))}
          {!isService && changeRows.length === 0 && photos.length === 0 && (
            <Row label="Changes">
              <span className="text-muted-foreground">
                Open the salon to review the submitted changes.
              </span>
            </Row>
          )}
        </div>

        {/* New photos, when the item carries them */}
        {photos.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">New Photos</p>
            <PhotoGrid photos={photos} alt={`${title} photo`} />
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          {item.salonId ? (
            <button
              onClick={() => onOpenSalon(item.salonId)}
              className="inline-flex items-center gap-1 text-sm text-[#145E94] hover:underline"
            >
              View salon
              <ExternalLink className="h-3.5 w-3.5" />
            </button>
          ) : (
            <span />
          )}

          <div className="flex gap-2">
            <Button
              size="sm"
              className="bg-emerald-600 text-white hover:bg-emerald-600/90"
              disabled={isMutating}
              onClick={() => onReview({ item, action: "approve" })}
            >
              <CheckCircle2 className="mr-1.5 h-4 w-4" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
              disabled={isMutating}
              onClick={() => onReview({ item, action: "reject" })}
            >
              <X className="mr-1.5 h-4 w-4" />
              Reject
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function Row({ label, children }) {
  return (
    <div className="grid grid-cols-[140px_1fr] items-start gap-4 py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium break-words">{children}</span>
    </div>
  )
}

export default function Approvals() {
  const navigate = useNavigate()
  const { error: apiError, showError, clearError } = useApiError()
  const [page, setPage] = useState(1)

  // Pending review awaiting confirmation: { item, action } | null
  const [pending, setPending] = useState(null)

  const { data, isFetching, isLoading, error, refetch } = useGetPendingApprovalsQuery(
    { page, limit: PAGE_SIZE },
    { pollingInterval: 30000 }
  )

  const [reviewPendingChanges, { isLoading: updatingChanges }] =
    useReviewPendingChangesMutation()
  const [reviewService, { isLoading: updatingService }] = useReviewServiceMutation()
  const submitting = updatingChanges || updatingService

  const items = data?.results ?? []
  const totalPages = data?.totalPages ?? 1
  const totalResults = data?.totalResults ?? items.length

  async function handleConfirm(extra) {
    if (!pending) return
    const { item, action } = pending
    const service = isServiceItem(item)
    try {
      if (service) {
        const serviceId = item.entityId ?? item._id
        await reviewService({ serviceId, action, ...extra }).unwrap()
      } else {
        const salonId = item.salonId ?? item.entityId
        await reviewPendingChanges({ salonId, action, ...extra }).unwrap()
      }
      const verb = action === "approve" ? "approved" : "rejected"
      const label = service
        ? (item.serviceName ?? "Service")
        : `${item.salonName ?? "Salon"} changes`
      toast.success(`${label} ${verb}`)
      setPending(null)
    } catch (err) {
      showError(err)
    }
  }

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <PageHeader total={0} />
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="flex flex-col gap-4 p-5">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <Skeleton className="h-5 w-48" />
              </div>
              <Skeleton className="h-16 w-full" />
              <div className="flex justify-end gap-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // ── Error ──
  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <PageHeader total={0} />
        <Card>
          <CardContent className="p-0">
            <ErrorState
              title="Couldn't load pending approvals"
              message={parseApiError(error).message}
              onRetry={refetch}
              retrying={isFetching}
            />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader total={totalResults} />

      {items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <ImageOff className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold">All caught up</p>
              <p className="text-xs text-muted-foreground">
                There are no salons or services awaiting review right now.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {items.map((item) => (
            <PendingItemCard
              key={item._id ?? `${item._pendingType}-${item.entityId}`}
              item={item}
              onReview={setPending}
              onOpenSalon={(salonId) => navigate(`/salon-details/${salonId}`)}
              isMutating={submitting}
            />
          ))}

          {totalPages > 1 && (
            <div className="flex items-center justify-end gap-2">
              <span className="mr-2 text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || isFetching}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages || isFetching}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}

      <ReviewDialog
        open={!!pending}
        action={pending?.action}
        title={
          pending
            ? `${pending.action === "approve" ? "Approve" : "Reject"} ${
                isServiceItem(pending.item) ? "this service" : "these changes"
              }?`
            : ""
        }
        description={
          pending
            ? pending.action === "approve"
              ? isServiceItem(pending.item)
                ? `"${pending.item.serviceName ?? "This service"}" will be approved and made visible.`
                : `The submitted changes for "${pending.item.salonName ?? "this salon"}" will go live.`
              : isServiceItem(pending.item)
                ? `"${pending.item.serviceName ?? "This service"}" will be rejected. Provide a reason for the owner.`
                : `The submitted changes for "${pending.item.salonName ?? "this salon"}" will be rejected. Provide a reason for the owner.`
            : ""
        }
        loading={submitting}
        onConfirm={handleConfirm}
        onCancel={() => setPending(null)}
      />

      <ApiErrorModal error={apiError} onClose={clearError} />
    </div>
  )
}
