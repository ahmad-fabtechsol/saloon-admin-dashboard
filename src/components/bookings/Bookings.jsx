import { useEffect, useMemo, useState } from "react"
import { FiEye, FiFlag } from "react-icons/fi"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"
import DynamicTable from "@/components/DynamicTable"
import { bookingFilters } from "@/lib/tableUtils"
import { bookingColumns } from "@/lib/tableColumns"
import { parseApiError } from "@/lib/apiError"
import { useGetBookingsQuery } from "@/store/booking/bookingApiSlice"

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
    service: service.name ?? booking.serviceName ?? "-",
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

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(search.trim())
      setPage(1)
    }, 350)

    return () => window.clearTimeout(timeout)
  }, [search])

  const { data, isFetching, error, refetch } = useGetBookingsQuery({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
    status: status === "all" ? undefined : status,
  })

  const rows = useMemo(() => unwrapBookings(data).map(toRow), [data])

  const actions = [
    {
      label: "View details",
      icon: FiEye,
      color: "brand",
      onClick: (row) => navigate(`/booking-details/${row.id}`),
    },
    {
      label: "Flag no-show",
      icon: FiFlag,
      color: "red",
      show: (row) => row.status === "noShow",
      onClick: (row) => toast.warning(`Booking #${row.id} flagged as no-show`),
    },
  ]

  return (
    <DynamicTable
      title="All Bookings"
      searchPlaceholder="Search bookings..."
      searchKey={["salon", "service"]}
      searchValue={search}
      onSearchChange={setSearch}
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
  )
}
