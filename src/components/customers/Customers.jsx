import { useNavigate } from "react-router-dom"
import { FiEye, FiUserCheck, FiUserX } from "react-icons/fi"
import { toast } from "sonner"
import DynamicTable from "@/components/DynamicTable"
import customers from "@/data/customers.json"
import { actionColors, customerFilters, customerStatusConfig } from "@/lib/tableUtils"


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
    {
      key: "id",
      label: "Actions",
      render: (_, row) => (
        <div className="flex items-center gap-1.5">
          <button
            title="View"
            onClick={() => navigate(`/customer-details/${row.id}`)}
            className={`rounded-md p-1.5 transition-colors ${actionColors.brand}`}
          >
            <FiEye size={14} />
          </button>
          {row.status === "Active" && (
            <button
              title="Block"
              onClick={() => toast.error(`${row.name} has been blocked`)}
              className={`rounded-md p-1.5 transition-colors ${actionColors.red}`}
            >
              <FiUserX size={14} />
            </button>
          )}
          {(row.status === "Suspended" || row.status === "Blocked") && (
            <button
              title="Unblock"
              onClick={() => toast.success(`${row.name} has been unblocked`)}
              className={`rounded-md p-1.5 transition-colors ${actionColors.green}`}
            >
              <FiUserCheck size={14} />
            </button>
          )}
        </div>
      ),
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
    />
  )
}
