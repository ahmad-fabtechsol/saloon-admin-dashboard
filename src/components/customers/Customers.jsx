import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { FiEye, FiPauseCircle, FiUserCheck, FiUserX } from "react-icons/fi"
import { toast } from "sonner"
import DynamicTable from "@/components/DynamicTable"
import ApiErrorModal from "@/components/ApiErrorModal"
import ConfirmDialog from "@/components/ConfirmDialog"
import { customerFilters, customerStatusConfig } from "@/lib/tableUtils"
import { parseApiError } from "@/lib/apiError"
import { useApiError } from "@/hooks/useApiError"
import {
  useGetCustomersQuery,
  useUpdateCustomerStatusMutation,
} from "@/store/customer/customerApiSlice"

const PAGE_SIZE = 10

const formatDate = (value) => {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

const normalizeStatus = (status) => String(status ?? "active").toLowerCase()

// Confirmation copy + confirm-button styling per target status.
const STATUS_ACTION_COPY = {
  active: { label: "Activate", verb: "activated", confirmClass: "bg-emerald-600 text-white hover:bg-emerald-600/90" },
  suspended: { label: "Suspend", verb: "suspended", confirmClass: "bg-amber-600 text-white hover:bg-amber-600/90" },
  blocked: { label: "Block", verb: "blocked", confirmClass: "bg-red-600 text-white hover:bg-red-600/90" },
}

const unwrapCustomers = (response) =>
  response?.results ??
  response?.data?.results ??
  response?.data?.customers ??
  response?.customers ??
  []

const getPaginationValue = (response, key) =>
  response?.[key] ??
  response?.data?.[key] ??
  response?.pagination?.[key] ??
  response?.data?.pagination?.[key]

function toRow(customer) {
  return {
    id: customer._id ?? customer.id,
    name: customer.name ?? customer.fullName ?? "-",
    phone: customer.phone ?? customer.phoneNumber ?? "-",
    joined: formatDate(customer.createdAt ?? customer.joinedAt),
    bookings: customer.bookingsCount ?? customer.totalBookings ?? customer.bookings ?? 0,
    noShows: customer.noShowsCount ?? customer.noShowCount ?? customer.noShows ?? 0,
    status: normalizeStatus(customer.status),
  }
}

export default function Customers() {
  const navigate = useNavigate()
  const { error: apiError, showError, clearError } = useApiError()

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

  const { data, isFetching, error, refetch } = useGetCustomersQuery({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
    status: status === "all" ? undefined : status,
  })

  const [updateCustomerStatus, { isLoading: updating }] = useUpdateCustomerStatusMutation()

  const rows = useMemo(() => unwrapCustomers(data).map(toRow), [data])

  const columns = [
    { key: "name", label: "Name", bold: true },
    { key: "phone", label: "Phone" },
    { key: "joined", label: "Joined" },
    { key: "bookings", label: "Bookings" },
    {
      key: "noShows",
      label: "No-Shows",
      render: (val) => (
        <span className={`font-medium ${val === 0 ? "text-emerald-600" : "text-red-500"}`}>
          {val}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (val) => {
        const config = customerStatusConfig[val] ?? customerStatusConfig.active
        const Icon = config.icon
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${config.cls}`}>
            <Icon className="h-3 w-3" />
            {config.label}
          </span>
        )
      },
    },
  ]

  // Pending status change awaiting confirmation: { row, status } | null
  const [pending, setPending] = useState(null)

  const handleConfirm = async () => {
    if (!pending) return
    try {
      await updateCustomerStatus({ customerId: pending.row.id, status: pending.status }).unwrap()
      toast.success(`${pending.row.name} is now ${customerStatusConfig[pending.status]?.label ?? pending.status}`)
      setPending(null)
    } catch (err) {
      showError(err)
    }
  }

  const actions = [
    {
      label: "View details",
      icon: FiEye,
      color: "brand",
      onClick: (row) => navigate(`/customer-details/${row.id}`),
    },
    {
      label: "Activate",
      icon: FiUserCheck,
      color: "green",
      show: (row) => row.status !== "active",
      onClick: (row) => setPending({ row, status: "active" }),
    },
    {
      label: "Suspend",
      icon: FiPauseCircle,
      color: "amber",
      show: (row) => row.status !== "suspended",
      onClick: (row) => setPending({ row, status: "suspended" }),
    },
    {
      label: "Block",
      icon: FiUserX,
      color: "red",
      show: (row) => row.status !== "blocked",
      onClick: (row) => setPending({ row, status: "blocked" }),
    },
  ]

  return (
    <>
      <DynamicTable
        title="All Customers"
        searchPlaceholder="Search customers..."
        searchKey={["name", "phone"]}
        searchValue={search}
        onSearchChange={setSearch}
        exportLabel="Export"
        onExport={() => console.log("export")}
        filters={customerFilters}
        activeFilter={status}
        onFilterChange={(value) => {
          setStatus(value)
          setPage(1)
        }}
        showCounts={false}
        columns={columns}
        data={rows}
        actions={actions}
        actionsVariant="menu"
        loading={isFetching || updating}
        error={error ? parseApiError(error).message : null}
        onRetry={refetch}
        page={page}
        totalPages={getPaginationValue(data, "totalPages")}
        totalResults={getPaginationValue(data, "totalResults")}
        onPageChange={setPage}
      />

      <ConfirmDialog
        open={!!pending}
        title={pending ? `${STATUS_ACTION_COPY[pending.status]?.label} this customer?` : ""}
        description={
          pending
            ? `${pending.row.name} will be ${STATUS_ACTION_COPY[pending.status]?.verb}.`
            : ""
        }
        confirmClass={pending ? STATUS_ACTION_COPY[pending.status]?.confirmClass : undefined}
        loading={updating}
        onConfirm={handleConfirm}
        onCancel={() => setPending(null)}
      />

      <ApiErrorModal error={apiError} onClose={clearError} />
    </>
  )
}
