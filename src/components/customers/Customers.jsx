import { useNavigate } from "react-router-dom"
import { FiEye, FiUserCheck, FiUserX } from "react-icons/fi"
import { toast } from "sonner"
import DynamicTable from "@/components/DynamicTable"
import customers from "@/data/customers.json"
import { customerFilters, customerStatusConfig } from "@/lib/tableUtils"


export default function Customers() {
  const navigate = useNavigate()

  const columns = [
    { key: "name",     label: "Name",     bold: true },
    { key: "phone",    label: "Phone" },
    { key: "joined",   label: "Joined" },
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
        const { icon: Icon, cls } = customerStatusConfig[val] ?? customerStatusConfig.Active
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${cls}`}>
            <Icon className="h-3 w-3" />
            {val}
          </span>
        )
      },
    },
  ]

  const actions = [
    {
      label: "View details",
      icon: FiEye,
      color: "brand",
      onClick: (row) => navigate(`/customer-details/${row.id}`),
    },
    {
      label: "Block",
      icon: FiUserX,
      color: "red",
      show: (row) => row.status === "Active",
      onClick: (row) => toast.error(`${row.name} has been blocked`),
    },
    {
      label: "Unblock",
      icon: FiUserCheck,
      color: "green",
      show: (row) => row.status === "Suspended" || row.status === "Blocked",
      onClick: (row) => toast.success(`${row.name} has been unblocked`),
    },
  ]

  return (
    <DynamicTable
      title={`All Customers (${customers.length.toLocaleString()})`}
      searchPlaceholder="Search by name or phone..."
      searchKey={["name", "phone"]}
      exportLabel="Export"
      onExport={() => console.log("export")}
      filters={customerFilters}
      filterKey="status"
      columns={columns}
      data={customers}
      actions={actions}
      actionsVariant="menu"
    />
  )
}
