import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { FiCheckCircle, FiEye, FiSlash, FiXCircle } from "react-icons/fi"
import { toast } from "sonner"
import DynamicTable from "@/components/DynamicTable"
import SalonStatusDialog from "@/components/salon/SalonStatusDialog"
import { salonFilters } from "@/lib/tableUtils"
import { salonColumns } from "@/lib/tableColumns"
import {
  useGetSalonsQuery,
  useUpdateSalonStatusMutation,
} from "@/store/salon/salonApiSlice"
import { useApiError } from "@/hooks/useApiError"
import ApiErrorModal from "@/components/ApiErrorModal"
import { parseApiError } from "@/lib/apiError"

const PAGE_SIZE = 10

const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "")

// Past-tense confirmation copy for success toasts.
const PAST = { approved: "approved", rejected: "rejected", suspended: "suspended" }

// Map an API salon document to the flat shape the table columns expect.
function toRow(s) {
  return {
    id: s._id,
    name: s.name,
    type: capitalize(s.type),
    city: s.location?.city ?? "—",
    owner: s.owner?.name ?? "—",
    submitted: s.createdAt
      ? new Date(s.createdAt).toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "—",
    status: s.status,
  }
}

export default function Salons() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { error: apiError, showError, clearError } = useApiError()

  const initialStatus = salonFilters.some((filter) => filter.value === searchParams.get("status"))
    ? searchParams.get("status")
    : "all"
  const [status, setStatus] = useState(initialStatus)
  const [page, setPage] = useState(1)

  useEffect(() => {
    const nextStatus = salonFilters.some((filter) => filter.value === searchParams.get("status"))
      ? searchParams.get("status")
      : "all"
    setStatus(nextStatus)
    setPage(1)
  }, [searchParams])

  // Pending status change awaiting confirmation: { action, row } | null
  const [pending, setPending] = useState(null)

  const { data, isFetching, error, refetch } = useGetSalonsQuery({
    page,
    limit: PAGE_SIZE,
    status: status === "all" ? undefined : status,
    // The "Rejected" tab must not send submissionStatus; other tabs use "submitted".
    submissionStatus: status === "rejected" ? null : "submitted",
  })

  const [updateSalonStatus, { isLoading: updating }] = useUpdateSalonStatusMutation()

  const rows = (data?.results ?? []).map(toRow)

  async function handleConfirm(extra) {
    try {
      await updateSalonStatus({
        salonId: pending.row.id,
        status: pending.action,
        ...extra,
      }).unwrap()
      toast.success(`${pending.row.name} has been ${PAST[pending.action]}`)
      setPending(null) // invalidatesTags refetches the listing automatically
    } catch (err) {
      showError(err)
    }
  }

  const actions = [
    {
      label: "View details",
      icon: FiEye,
      color: "brand",
      onClick: (row) => navigate(`/salon-details/${row.id}`),
    },
    {
      label: "Approve",
      icon: FiCheckCircle,
      color: "green",
      show: (row) => row.status !== "approved",
      onClick: (row) => setPending({ action: "approved", row }),
    },
    {
      label: "Reject",
      icon: FiXCircle,
      color: "red",
      show: (row) => row.status === "pending",
      onClick: (row) => setPending({ action: "rejected", row }),
    },
    {
      label: "Suspend",
      icon: FiSlash,
      color: "amber",
      show: (row) => row.status === "approved",
      onClick: (row) => setPending({ action: "suspended", row }),
    },
  ]

  return (
    <>
      <DynamicTable
        title="All Salons"
        searchPlaceholder="Search salons..."
        searchKey={["name", "city", "owner"]}
        filters={salonFilters}
        activeFilter={status}
        onFilterChange={(value) => {
          setStatus(value)
          setPage(1)
          if (value === "all") setSearchParams({})
          else setSearchParams({ status: value })
        }}
        columns={salonColumns}
        data={rows}
        actions={actions}
        actionsVariant="menu"
        onRowClick={(row) => navigate(`/salon-details/${row.id}`)}
        loading={isFetching}
        error={error ? parseApiError(error).message : null}
        onRetry={refetch}
        page={page}
        totalPages={data?.totalPages}
        totalResults={data?.totalResults}
        onPageChange={setPage}
      />

      <SalonStatusDialog
        open={!!pending}
        action={pending?.action}
        salon={pending?.row}
        loading={updating}
        onConfirm={handleConfirm}
        onCancel={() => setPending(null)}
      />

      <ApiErrorModal error={apiError} onClose={clearError} />
    </>
  )
}
