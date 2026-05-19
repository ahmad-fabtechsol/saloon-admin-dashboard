import { useNavigate } from "react-router-dom"
import { FiCheckCircle, FiEye, FiXCircle } from "react-icons/fi"
import { toast } from "sonner"
import DynamicTable from "@/components/DynamicTable"
import salonsData from "@/data/salons.json"
import { salonFilters } from "@/lib/tableUtils"
import { salonColumns } from "@/lib/tableColumns"

export default function Salons() {
  const navigate = useNavigate()

  const actions = [
    { label: "View",    icon: FiEye,         color: "brand", onClick: (row) => navigate(`/salon-details/${row.id}`) },
    { label: "Approve", icon: FiCheckCircle, color: "green", onClick: (row) => toast.success(`${row.name} has been approved`) },
    { label: "Reject",  icon: FiXCircle,     color: "red",   onClick: (row) => toast.error(`${row.name} has been rejected`) },
  ]

  return (
    <DynamicTable
      title="All Salons"
      searchPlaceholder="Search salons..."
      searchKey={["name", "city", "owner"]}
      exportLabel="Export"
      onExport={() => console.log("export")}
      filters={salonFilters}
      filterKey="status"
      columns={salonColumns}
      data={salonsData.list}
      actions={actions}
    />
  )
}
