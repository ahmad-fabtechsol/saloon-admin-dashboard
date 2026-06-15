import { TableCell, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * Skeleton placeholder rows for a DynamicTable. Renders inside <TableBody> so
 * the table header, filter tabs and search stay visible while data loads.
 *
 * @param {number}  rows        number of placeholder rows
 * @param {number}  columns     number of data columns
 * @param {boolean} hasActions  whether an extra actions column is present
 */
export default function TableSkeleton({ rows = 8, columns = 4, hasActions = false }) {
  const total = columns + (hasActions ? 1 : 0)

  return Array.from({ length: rows }).map((_, r) => (
    <TableRow key={`skeleton-${r}`} className="hover:bg-transparent">
      {Array.from({ length: total }).map((_, c) => {
        const isActions = hasActions && c === total - 1
        return (
          <TableCell key={c}>
            <Skeleton
              className={`h-4 ${
                isActions ? "h-7 w-7 rounded-md" : c === 0 ? "w-32" : "w-20"
              }`}
            />
          </TableCell>
        )
      })}
    </TableRow>
  ))
}
