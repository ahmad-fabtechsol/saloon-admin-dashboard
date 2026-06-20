import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { CheckCircle2, ChevronLeft, MapPin, Slash, XCircle } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import ErrorState from "@/components/ErrorState"
import ConfirmDialog from "@/components/ConfirmDialog"
import { bookingStatusConfig, bookingStatusActions, bookingStatusTransitions } from "@/lib/tableUtils"
import { parseApiError } from "@/lib/apiError"
import {
  useGetBookingByIdQuery,
  useUpdateBookingStatusMutation,
} from "@/store/booking/bookingApiSlice"

const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "—")

const ACTION_ICONS = {
  confirmed: CheckCircle2,
  completed: CheckCircle2,
  noShow: Slash,
  cancelled: XCircle,
}

const ACTION_BUTTON_CLS = {
  green: "bg-emerald-600 text-white hover:bg-emerald-600/90",
  blue: "bg-[#145E94] text-white hover:bg-[#145E94]/90",
  amber: "border border-amber-300 text-amber-700 hover:bg-amber-50 hover:text-amber-800",
  red: "border border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700",
}

const normalizeStatus = (status) => {
  const value = String(status ?? "pending").trim()
  const normalized = value.toLowerCase()
  if (normalized === "no-show" || normalized === "noshow" || normalized === "no_show") return "noShow"
  return value.charAt(0).toLowerCase() + value.slice(1)
}

const formatDateTime = (raw) => {
  if (!raw) return "—"
  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return String(raw)
  return new Intl.DateTimeFormat("en-PK", { dateStyle: "medium", timeStyle: "short" }).format(date)
}

const formatPrice = (amount) => {
  if (amount === undefined || amount === null || amount === "") return "—"
  if (typeof amount === "number") return `Rs. ${amount.toLocaleString("en-PK")}`
  return String(amount)
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

function StatusBadge({ status }) {
  const cfg = bookingStatusConfig[status] ?? bookingStatusConfig.pending
  const Icon = cfg.icon
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${cfg.cls}`}
    >
      {Icon && <Icon className="h-3.5 w-3.5" />}
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
      Back to Bookings
    </button>
  )
}

export default function BookingDetails() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { data, isLoading, error, refetch } = useGetBookingByIdQuery(id)
  const [updateBookingStatus, { isLoading: updatingStatus }] = useUpdateBookingStatusMutation()
  // Pending status change awaiting confirmation: action object | null
  const [pending, setPending] = useState(null)

  const booking = data?.data ?? data?.result ?? data ?? null

  const handleConfirm = async () => {
    if (!pending) return
    try {
      await updateBookingStatus({ bookingId: id, status: pending.status }).unwrap()
      toast.success(`Booking ${pending.past}`)
      setPending(null)
    } catch (err) {
      toast.error(parseApiError(err).message)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <BackButton onClick={() => navigate("/bookings")} />
        <Card>
          <CardContent className="flex flex-col gap-4 p-6">
            <Skeleton className="h-6 w-48" />
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-5 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="flex flex-col gap-4">
        <BackButton onClick={() => navigate("/bookings")} />
        <Card>
          <CardContent className="p-0">
            <ErrorState
              title={error ? "Couldn't load booking" : "Booking not found"}
              message={
                error
                  ? parseApiError(error).message
                  : "This booking may have been removed."
              }
              onRetry={error ? refetch : undefined}
            />
          </CardContent>
        </Card>
      </div>
    )
  }

  const customer = booking.customer ?? booking.user ?? {}
  const salon = booking.salon ?? {}
  const loc = salon.location ?? {}
  const coords = loc.coordinates ?? {}
  const status = normalizeStatus(booking.status)
  const start = formatDateTime(booking.startDate ?? booking.dateTime ?? booking.startTime ?? booking.date)
  const end = formatDateTime(booking.endDate ?? booking.endTime)
  const created = formatDateTime(booking.createdAt)
  const price = formatPrice(booking.price ?? booking.totalPrice ?? booking.amount ?? booking.totalAmount)

  const allowed = bookingStatusTransitions[status] ?? []
  const availableActions = bookingStatusActions.filter((a) => allowed.includes(a.status))

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <BackButton onClick={() => navigate("/bookings")} />
        <Separator orientation="vertical" className="h-4" />
        <h1 className="text-lg font-semibold">{booking.title ?? "Booking"}</h1>
        <StatusBadge status={status} />
      </div>

      <Card>
        <CardContent className="flex flex-col gap-6 p-6">
          <div>
            <SectionLabel>Booking Information</SectionLabel>
            <div className="divide-y rounded-lg border px-4">
              <InfoRow label="Booking ID">{booking._id ?? booking.id ?? id}</InfoRow>
              <InfoRow label="Status">
                <StatusBadge status={status} />
              </InfoRow>
              <InfoRow label="Service Type">{capitalize(booking.serviceType ?? booking.type)}</InfoRow>
              <InfoRow label="Starts">{start}</InfoRow>
              <InfoRow label="Ends">{end}</InfoRow>
              <InfoRow label="Price">{price}</InfoRow>
              <InfoRow label="Booked On">{created}</InfoRow>
            </div>
          </div>

          <div>
            <SectionLabel>Customer</SectionLabel>
            <div className="flex items-center gap-4 rounded-lg border p-4">
              {customer.profilePicture && (
                <img
                  src={customer.profilePicture}
                  alt={customer.name ?? "Customer"}
                  loading="lazy"
                  className="h-12 w-12 shrink-0 rounded-full border object-cover"
                />
              )}
              <div className="flex flex-col">
                <span className="text-sm font-medium">{customer.name ?? "—"}</span>
                <span className="text-sm text-muted-foreground">
                  {customer.contact ?? customer.phone ?? customer.phoneNumber ?? "—"}
                </span>
              </div>
            </div>
          </div>

          <div>
            <SectionLabel>Salon</SectionLabel>
            <div className="divide-y rounded-lg border px-4">
              <InfoRow label="Name">{salon.name}</InfoRow>
              <InfoRow label="Type">{capitalize(salon.type)}</InfoRow>
              <InfoRow label="Phone">{salon.phoneNo ?? salon.phone}</InfoRow>
              <InfoRow label="Address">{loc.address}</InfoRow>
              <InfoRow label="City / State">
                {[loc.city, loc.state].filter(Boolean).join(", ") || "—"}
              </InfoRow>
              {coords.lat != null && coords.lng != null && (
                <InfoRow label="Location">
                  <a
                    href={`https://maps.google.com/?q=${coords.lat},${coords.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-md border border-[#145E94]/30 bg-[#145E94]/10 px-2 py-0.5 text-xs text-[#145E94] hover:bg-[#145E94]/20"
                  >
                    <MapPin className="h-3 w-3" />
                    View on Maps
                  </a>
                </InfoRow>
              )}
            </div>
          </div>

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
                      alt={`${salon.name ?? "Salon"} photo ${i + 1}`}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform hover:scale-105"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {availableActions.length > 0 && (
        <Card>
          <CardContent className="flex flex-col gap-3 p-6">
            <SectionLabel>Admin Actions</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {availableActions.map((action) => {
                const Icon = ACTION_ICONS[action.status]
                return (
                  <Button
                    key={action.status}
                    variant={action.color === "amber" || action.color === "red" ? "outline" : "default"}
                    className={ACTION_BUTTON_CLS[action.color]}
                    disabled={updatingStatus}
                    onClick={() => setPending(action)}
                  >
                    {Icon && <Icon className="mr-2 h-4 w-4" />}
                    {action.label}
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <ConfirmDialog
        open={!!pending}
        title={pending ? `${pending.label} this booking?` : ""}
        description={pending ? `This booking will be ${pending.past}.` : ""}
        confirmClass={pending ? ACTION_BUTTON_CLS[pending.color] : undefined}
        loading={updatingStatus}
        onConfirm={handleConfirm}
        onCancel={() => setPending(null)}
      />
    </div>
  )
}
