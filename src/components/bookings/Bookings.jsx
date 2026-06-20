import { useEffect, useMemo, useState } from "react"
import { format } from "date-fns"
import { FiCheckCircle, FiEye, FiSlash, FiXCircle } from "react-icons/fi"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"
import DynamicTable from "@/components/DynamicTable"
import ConfirmDialog from "@/components/ConfirmDialog"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { bookingFilters, bookingStatusActions, bookingStatusTransitions } from "@/lib/tableUtils"
import { bookingColumns } from "@/lib/tableColumns"
import { parseApiError } from "@/lib/apiError"
import {
  useGetBookingsQuery,
  useUpdateBookingStatusMutation,
} from "@/store/booking/bookingApiSlice"

const ACTION_ICONS = {
  confirmed: FiCheckCircle,
  completed: FiCheckCircle,
  noShow: FiSlash,
  cancelled: FiXCircle,
}

const CONFIRM_BTN_CLS = {
  green: "bg-emerald-600 text-white hover:bg-emerald-600/90",
  blue: "bg-[#145E94] text-white hover:bg-[#145E94]/90",
  amber: "bg-amber-600 text-white hover:bg-amber-600/90",
  red: "bg-red-600 text-white hover:bg-red-600/90",
}

const PAGE_SIZE = 10

const unwrapBookings = (response) =>
  response?.results ??
  response?.data?.results ??
  response?.data?.bookings ??
  response?.bookings ??
  []

const getPaginationValue = (response, key) =>
  response?.[key] ??
  response?.data?.[key] ??
  response?.pagination?.[key] ??
  response?.data?.pagination?.[key]

const normalizeStatus = (status) => {
  const value = String(status ?? "pending").trim()
  const normalized = value.toLowerCase()
  if (normalized === "no-show" || normalized === "noshow" || normalized === "no_show") return "noShow"
  return value.charAt(0).toLowerCase() + value.slice(1)
}

const formatDateTime = (booking) => {
  const raw =
    booking.dateTime ??
    booking.appointmentAt ??
    booking.startTime ??
    booking.date ??
    booking.createdAt

  if (!raw) return "-"
  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return String(raw)

  return new Intl.DateTimeFormat("en-PK", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)
}

const formatPrice = (booking) => {
  const amount = booking.price ?? booking.totalPrice ?? booking.amount ?? booking.totalAmount
  if (amount === undefined || amount === null || amount === "") return "-"
  if (typeof amount === "number") return `Rs. ${amount.toLocaleString("en-PK")}`
  return String(amount)
}

function toRow(booking) {
  const customer = booking.customer ?? booking.user ?? {}
  const salon = booking.salon ?? {}
  const service = booking.service ?? booking.services?.[0] ?? {}

  return {
    id: booking._id ?? booking.id,
    customer: {
      name: customer.name ?? booking.customerName ?? "-",
      phone: customer.phone ?? customer.phoneNumber ?? booking.customerPhone ?? "",
    },
    salon: salon.name ?? booking.salonName ?? "-",
    service: service.name ?? booking.serviceType ?? "-",
    dateTime: formatDateTime(booking),
    price: formatPrice(booking),
    status: normalizeStatus(booking.status),
  }
}

export default function Bookings() {
  const navigate = useNavigate()
  const [status, setStatus] = useState("all")
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  // { from: Date, to?: Date } | undefined — drives the startDate/endDate query params.
  const [dateRange, setDateRange] = useState(undefined)

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(search.trim())
      setPage(1)
    }, 350)

    return () => window.clearTimeout(timeout)
  }, [search])

  // Only send a range once a start date is picked; end falls back to start for a single day.
  const startDate = dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined
  const endDate = dateRange?.from
    ? format(dateRange.to ?? dateRange.from, "yyyy-MM-dd")
    : undefined

  const { data, isFetching, error, refetch } = useGetBookingsQuery({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
    status: status === "all" ? undefined : status,
    startDate,
    endDate,
  })

  const handleDateRangeChange = (range) => {
    setDateRange(range)
    setPage(1)
  }

  const rows = useMemo(() => unwrapBookings(data).map(toRow), [data])

  const [updateBookingStatus, { isLoading: updatingStatus }] = useUpdateBookingStatusMutation()
  // Pending status change awaiting confirmation: { row, action } | null
  const [pending, setPending] = useState(null)

  const handleConfirm = async () => {
    if (!pending) return
    try {
      await updateBookingStatus({ bookingId: pending.row.id, status: pending.action.status }).unwrap()
      toast.success(`Booking ${pending.action.past}`)
      setPending(null)
    } catch (err) {
      toast.error(parseApiError(err).message)
    }
  }

  const actions = [
    {
      label: "View details",
      icon: FiEye,
      color: "brand",
      onClick: (row) => navigate(`/booking-details/${row.id}`),
    },
    ...bookingStatusActions.map((action) => ({
      label: action.label,
      icon: ACTION_ICONS[action.status],
      color: action.color,
      show: (row) => (bookingStatusTransitions[row.status] ?? []).includes(action.status),
      onClick: (row) => setPending({ row, action }),
    })),
  ]

  return (
    <>
      <DynamicTable
      title="All Bookings"
      searchPlaceholder="Search bookings..."
      searchKey={["salon", "service"]}
      searchValue={search}
      onSearchChange={setSearch}
      headerExtra={
        <DateRangePicker range={dateRange} onChange={handleDateRangeChange} align="end" />
      }
      exportLabel="Export CSV"
      onExport={() => console.log("export")}
      filters={bookingFilters}
      activeFilter={status}
      onFilterChange={(value) => {
        setStatus(value)
        setPage(1)
      }}
      showCounts={false}
      columns={bookingColumns}
      data={rows}
      onRowClick={(row) => navigate(`/booking-details/${row.id}`)}
      actions={actions}
      actionsVariant="menu"
      loading={isFetching}
      error={error ? parseApiError(error).message : null}
      onRetry={refetch}
      page={page}
      totalPages={getPaginationValue(data, "totalPages")}
      totalResults={getPaginationValue(data, "totalResults")}
      onPageChange={setPage}
    />

      <ConfirmDialog
        open={!!pending}
        title={pending ? `${pending.action.label} this booking?` : ""}
        description={
          pending
            ? `This booking will be ${pending.action.past}.`
            : ""
        }
        confirmClass={pending ? CONFIRM_BTN_CLS[pending.action.color] : undefined}
        loading={updatingStatus}
        onConfirm={handleConfirm}
        onCancel={() => setPending(null)}
      />
    </>
  )
}
