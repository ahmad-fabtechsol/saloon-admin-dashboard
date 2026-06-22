import { useMemo, useState } from "react"
import DynamicTable from "@/components/DynamicTable"
import { topSalonsColumns } from "@/lib/tableColumns"

const PAGE_SIZE = 5

export default function TopSalons({ salons = [], loading }) {
  const [page, setPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(salons.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)

  const pageRows = useMemo(
    () => salons.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [salons, currentPage]
  )

  return (
    <DynamicTable
      title="🏆 Top Performing Salons"
      columns={topSalonsColumns}
      data={pageRows}
      loading={loading}
      page={currentPage}
      totalPages={totalPages}
      totalResults={salons.length}
      onPageChange={setPage}
    />
  )
}
