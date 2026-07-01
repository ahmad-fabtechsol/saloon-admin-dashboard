import { useState } from "react"
import { FiCheckCircle, FiTrash2 } from "react-icons/fi"
import { toast } from "sonner"
import DynamicTable from "@/components/DynamicTable"
import ConfirmDialog from "@/components/ConfirmDialog"
import { Button } from "@/components/ui/button"
import { notificationFilters } from "@/lib/tableUtils"
import { notificationColumns } from "@/lib/tableColumns"
import { parseApiError } from "@/lib/apiError"
import {
  useGetNotificationsQuery,
  useGetUnreadNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useDeleteAllNotificationsMutation,
} from "@/store/notification/notificationApiSlice"

const PAGE_SIZE = 10

const KNOWN_TYPES = [
  "message",
  "booking",
  "listing",
  "verification",
  "user",
  "flagged",
  "inquiry",
  "system",
]

// Normalise the API `type` to one of the configured badge keys.
function normalizeType(value) {
  const key = String(value ?? "").toLowerCase()
  return KNOWN_TYPES.includes(key) ? key : "system"
}

function isRead(n) {
  if (typeof n.isRead === "boolean") return n.isRead
  if (typeof n.read === "boolean") return n.read
  return String(n.status ?? "").toLowerCase() === "read"
}

function formatTime(value) {
  if (!value) return "—"
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

// Tolerate the various envelopes the list endpoints might use.
const unwrap = (response) =>
  response?.results ??
  response?.data?.results ??
  response?.notifications ??
  response?.data?.notifications ??
  (Array.isArray(response?.data) ? response.data : null) ??
  []

const paginationValue = (response, key) =>
  response?.[key] ?? response?.data?.[key] ?? response?.pagination?.[key]

function toRow(n) {
  return {
    id: n._id ?? n.id,
    type: normalizeType(n.type ?? n.category),
    message: n.message ?? n.body ?? n.text ?? n.title ?? "",
    time: formatTime(n.createdAt ?? n.timestamp ?? n.time),
    status: isRead(n) ? "Read" : "Unread",
  }
}

export default function Notifications() {
  const [status, setStatus] = useState("all")
  const [page, setPage] = useState(1)
  // Pending confirmation for a bulk action: "read-all" | "clear-all" | null
  const [pendingBulk, setPendingBulk] = useState(null)

  const showUnread = status === "Unread"

  const allQuery = useGetNotificationsQuery(
    { page, limit: PAGE_SIZE },
    { skip: showUnread, pollingInterval: 30000 }
  )
  const unreadQuery = useGetUnreadNotificationsQuery(
    { page, limit: PAGE_SIZE },
    { skip: !showUnread, pollingInterval: 30000 }
  )
  const active = showUnread ? unreadQuery : allQuery
  const { data, isFetching, error, refetch } = active

  const [markRead] = useMarkNotificationReadMutation()
  const [markAllRead, { isLoading: markingAll }] = useMarkAllNotificationsReadMutation()
  const [deleteAll, { isLoading: clearing }] = useDeleteAllNotificationsMutation()

  const rows = unwrap(data).map(toRow)
  const totalResults = paginationValue(data, "totalResults")

  async function handleMarkRead(row) {
    try {
      await markRead(row.id).unwrap()
      toast.success("Notification marked as read")
    } catch (err) {
      toast.error(parseApiError(err).message)
    }
  }

  async function handleBulkConfirm() {
    try {
      if (pendingBulk === "read-all") {
        await markAllRead().unwrap()
        toast.success("All notifications marked as read")
      } else {
        await deleteAll().unwrap()
        toast.success("All notifications cleared")
        setPage(1)
      }
      setPendingBulk(null)
    } catch (err) {
      toast.error(parseApiError(err).message)
    }
  }

  const actions = [
    {
      label: "Mark as read",
      icon: FiCheckCircle,
      color: "brand",
      show: (row) => row.status === "Unread",
      onClick: handleMarkRead,
    },
  ]

  return (
    <>
      <DynamicTable
        title="Notifications"
        searchPlaceholder="Search notifications..."
        searchKey={["message", "type"]}
        exportLabel="Mark All Read"
        onExport={() => setPendingBulk("read-all")}
        headerExtra={
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPendingBulk("clear-all")}
            disabled={rows.length === 0}
            className="h-8 border-red-300 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <FiTrash2 className="mr-1.5 h-3.5 w-3.5" />
            Clear All
          </Button>
        }
        filters={notificationFilters}
        activeFilter={status}
        onFilterChange={(value) => {
          setStatus(value)
          setPage(1)
        }}
        columns={notificationColumns}
        data={rows}
        actions={actions}
        actionsVariant="menu"
        loading={isFetching}
        error={error ? parseApiError(error).message : null}
        onRetry={refetch}
        page={page}
        totalPages={paginationValue(data, "totalPages")}
        totalResults={totalResults}
        onPageChange={setPage}
      />

      <ConfirmDialog
        open={pendingBulk === "read-all"}
        title="Mark all as read?"
        description="Every notification will be marked as read."
        confirmLabel="Mark All Read"
        loading={markingAll}
        onConfirm={handleBulkConfirm}
        onCancel={() => setPendingBulk(null)}
      />

      <ConfirmDialog
        open={pendingBulk === "clear-all"}
        title="Clear all notifications?"
        description="All notifications will be permanently deleted. This cannot be undone."
        confirmLabel="Clear All"
        confirmClass="bg-red-600 text-white hover:bg-red-600/90"
        loading={clearing}
        onConfirm={handleBulkConfirm}
        onCancel={() => setPendingBulk(null)}
      />
    </>
  )
}
