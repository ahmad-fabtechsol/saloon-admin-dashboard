import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { CheckCircle2, ChevronLeft, MapPin, Slash, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import ErrorState from "@/components/ErrorState"
import SalonStatusDialog from "@/components/salon/SalonStatusDialog"
import { salonStatusConfig } from "@/lib/tableUtils"
import {
  useGetSalonByIdQuery,
  useUpdateSalonStatusMutation,
} from "@/store/salon/salonApiSlice"
import { useErrorModal } from "@/context/ErrorModalProvider"
import { parseApiError } from "@/lib/apiError"

const DAY_ORDER = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]
const DAY_LABELS = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
}
const PAST = { approved: "approved", rejected: "rejected", suspended: "suspended" }

const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "")

function InfoRow({ label, children }) {
  return (
    <div className="grid grid-cols-[140px_1fr] items-start gap-4 border-b py-3 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{children}</span>
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

function StatusBadge({ status }) {
  const cfg = salonStatusConfig[status] ?? salonStatusConfig.pending
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${cfg.cls}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
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
      Back to Salons
    </button>
  )
}

export default function SalonDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { showApiError } = useErrorModal()

  const { data, isLoading, error, refetch } = useGetSalonByIdQuery(id)
  const [updateSalonStatus, { isLoading: updating }] = useUpdateSalonStatusMutation()

  // Pending status change awaiting confirmation: { action } | null
  const [pending, setPending] = useState(null)

  const salon = data?.data

  async function handleConfirm(extra) {
    try {
      await updateSalonStatus({
        salonId: id,
        status: pending.action,
        ...extra,
      }).unwrap()
      toast.success(`${salon?.name ?? "Salon"} has been ${PAST[pending.action]}`)
      setPending(null) // invalidatesTags refetches this salon automatically
    } catch (err) {
      showApiError(err)
    }
  }

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <BackButton onClick={() => navigate("/salons")} />
        <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
          <Card>
            <CardContent className="flex flex-col gap-4 p-6">
              <Skeleton className="h-6 w-48" />
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-5 w-full" />
              ))}
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col gap-3 p-5">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // ── Error ──
  if (error || !salon) {
    return (
      <div className="flex flex-col gap-4">
        <BackButton onClick={() => navigate("/salons")} />
        <Card>
          <CardContent className="p-0">
            <ErrorState
              title={error ? "Couldn't load salon" : "Salon not found"}
              message={
                error
                  ? parseApiError(error).message
                  : "This salon may have been removed."
              }
              onRetry={error ? refetch : undefined}
            />
          </CardContent>
        </Card>
      </div>
    )
  }

  const loc = salon.location ?? {}
  const coords = loc.coordinates ?? {}
  const gps =
    coords.lat != null && coords.lng != null ? `${coords.lat}, ${coords.lng}` : null
  const workingHours = [...(salon.workingHours ?? [])].sort(
    (a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day)
  )

  // Context-sensitive admin actions, mirroring the listing page.
  const canApprove = salon.status !== "approved"
  const canReject = salon.status === "pending"
  const canSuspend = salon.status === "approved"
  const hasActions = canApprove || canReject || canSuspend

  return (
    <div className="flex flex-col gap-4">
      {/* Back + title */}
      <div className="flex flex-wrap items-center gap-3">
        <BackButton onClick={() => navigate("/salons")} />
        <Separator orientation="vertical" className="h-4" />
        <h1 className="text-lg font-semibold">{salon.name}</h1>
        <StatusBadge status={salon.status} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        {/* ── Left panel ── */}
        <Card>
          <CardContent className="flex flex-col gap-6 p-6">
            {/* Salon Information */}
            <div>
              <SectionLabel>Salon Information</SectionLabel>
              <div className="divide-y rounded-lg border px-4">
                <InfoRow label="Salon Name">{salon.name}</InfoRow>
                <InfoRow label="Type">{capitalize(salon.type)}</InfoRow>
                <InfoRow label="Phone">{salon.phoneNo ?? "—"}</InfoRow>
                <InfoRow label="Address">{loc.address ?? "—"}</InfoRow>
                <InfoRow label="Landmark">{salon.landmark ?? "—"}</InfoRow>
                <InfoRow label="City / State">
                  {[loc.city, loc.state].filter(Boolean).join(", ") || "—"}
                </InfoRow>
                <InfoRow label="Country">
                  {[loc.country, loc.postalCode].filter(Boolean).join(" ") || "—"}
                </InfoRow>
                {gps && (
                  <InfoRow label="GPS">
                    <span className="flex items-center gap-2">
                      {gps}
                      <a
                        href={`https://maps.google.com/?q=${coords.lat},${coords.lng}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-md border border-[#145E94]/30 bg-[#145E94]/10 px-2 py-0.5 text-xs text-[#145E94] hover:bg-[#145E94]/20"
                      >
                        <MapPin className="h-3 w-3" />
                        Maps
                      </a>
                    </span>
                  </InfoRow>
                )}
              </div>
            </div>

            {/* Owner Information */}
            {salon.owner && (
              <div>
                <SectionLabel>Owner Information</SectionLabel>
                <div className="divide-y rounded-lg border px-4">
                  <InfoRow label="Name">{salon.owner.name ?? "—"}</InfoRow>
                  <InfoRow label="Contact">{salon.owner.contact ?? "—"}</InfoRow>
                  <InfoRow label="Role">{capitalize(salon.owner.role)}</InfoRow>
                </div>
              </div>
            )}

            {/* Salon Photos */}
            {salon.photos?.length > 0 && (
              <div>
                <SectionLabel>Salon Photos</SectionLabel>
                <div className="flex flex-wrap gap-3">
                  {salon.photos.map((url, i) => (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="h-24 w-24 overflow-hidden rounded-lg border bg-muted"
                    >
                      <img
                        src={url}
                        alt={`${salon.name} photo ${i + 1}`}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform hover:scale-105"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Working Hours */}
            {workingHours.length > 0 && (
              <div>
                <SectionLabel>Working Hours</SectionLabel>
                <div className="divide-y rounded-lg border px-4">
                  {workingHours.map((wh) => (
                    <InfoRow key={wh.day} label={DAY_LABELS[wh.day] ?? wh.day}>
                      {wh.isOpen ? (
                        `${wh.startTime} – ${wh.endTime}`
                      ) : (
                        <span className="text-muted-foreground">Closed</span>
                      )}
                    </InfoRow>
                  ))}
                </div>
              </div>
            )}

            {/* Daily Breaks */}
            {salon.dailyBreaks?.length > 0 && (
              <div>
                <SectionLabel>Daily Breaks</SectionLabel>
                <div className="divide-y rounded-lg border px-4">
                  {salon.dailyBreaks.map((br, i) => (
                    <InfoRow key={i} label={br.name ?? `Break ${i + 1}`}>
                      <span className="flex flex-col">
                        <span>
                          {br.startTime} – {br.endTime}
                        </span>
                        {br.days?.length > 0 && (
                          <span className="text-xs text-muted-foreground">
                            {br.days.map((d) => capitalize(d)).join(", ")}
                          </span>
                        )}
                      </span>
                    </InfoRow>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Right panel ── */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardContent className="flex flex-col gap-5 p-5">
              <div>
                <SectionLabel>Current Status</SectionLabel>
                <StatusBadge status={salon.status} />
              </div>

              <Separator />

              <div>
                <SectionLabel>Admin Action</SectionLabel>
                {hasActions ? (
                  <div className="flex flex-col gap-2">
                    {canApprove && (
                      <Button
                        className="w-full bg-emerald-600 text-white hover:bg-emerald-600/90"
                        onClick={() => setPending({ action: "approved" })}
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Approve Salon
                      </Button>
                    )}
                    {canReject && (
                      <Button
                        variant="outline"
                        className="w-full border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => setPending({ action: "rejected" })}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Reject Salon
                      </Button>
                    )}
                    {canSuspend && (
                      <Button
                        variant="outline"
                        className="w-full border-amber-300 text-amber-700 hover:bg-amber-50 hover:text-amber-800"
                        onClick={() => setPending({ action: "suspended" })}
                      >
                        <Slash className="mr-2 h-4 w-4" />
                        Suspend Salon
                      </Button>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No actions available for this status.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <SalonStatusDialog
        open={!!pending}
        action={pending?.action}
        salon={salon}
        loading={updating}
        onConfirm={handleConfirm}
        onCancel={() => setPending(null)}
      />
    </div>
  )
}
