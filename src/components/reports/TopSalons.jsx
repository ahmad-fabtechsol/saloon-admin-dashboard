import DynamicTable from "@/components/DynamicTable"
import { topSalonsColumns } from "@/lib/tableColumns"

export default function TopSalons({ salons }) {
  return (
    <DynamicTable
      title="🏆 Top Performing Salons"
      columns={topSalonsColumns}
      data={salons}
    />
  )
}
