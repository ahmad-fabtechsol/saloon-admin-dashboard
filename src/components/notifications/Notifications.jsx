import { useState } from "react"
import { FiCheckCircle, FiTrash2 } from "react-icons/fi"
import { toast } from "sonner"
import DynamicTable from "@/components/DynamicTable"
import notifications from "@/data/notifications.json"
import { notificationFilters } from "@/lib/tableUtils"
import { notificationColumns } from "@/lib/tableColumns"

export default function Notifications() {
  const [data, setData] = useState(notifications)

  const unreadCount = data.filter((n) => n.status === "Unread").length

  function markRead(row) {
    setData((prev) =>
      prev.map((n) => (n.id === row.id ? { ...n, status: "Read" } : n))
    )
    toast.success("Notification marked as read")
  }

  function markAllRead() {
    setData((prev) => prev.map((n) => ({ ...n, status: "Read" })))
    toast.success("All notifications marked as read")
  }

  function deleteNotification(row) {
    setData((prev) => prev.filter((n) => n.id !== row.id))
    toast.error("Notification deleted")
  }

  const actions = [
    {
      label: "Mark as read",
      icon: FiCheckCircle,
      color: "brand",
      show: (row) => row.status === "Unread",
      onClick: (row) => markRead(row),
    },
    {
      label: "Delete",
      icon: FiTrash2,
      color: "red",
      onClick: (row) => deleteNotification(row),
    },
  ]

  return (
    <DynamicTable
      title={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
      searchPlaceholder="Search notifications..."
      searchKey={["message", "type"]}
      exportLabel="Mark All Read"
      onExport={markAllRead}
      filters={notificationFilters}
      filterKey="status"
      columns={notificationColumns}
      data={data}
      actions={actions}
      actionsVariant="menu"
    />
  )
}
