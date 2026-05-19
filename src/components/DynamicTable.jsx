import { useState, useMemo } from "react"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { actionColors } from "@/lib/tableUtils"

export default function DynamicTable({
  title,
  searchPlaceholder = "Search...",
  searchKey,
  exportLabel = "Export",
  onExport,
  filters = [],
  filterKey,
  columns = [],
  data = [],
  actions = [],
  headerExtra,
}) {
  const [search, setSearch] = useState("")
  const [activeFilter, setActiveFilter] = useState(filters[0]?.value ?? "all")

  const filtered = useMemo(() => {
    let rows = data

    if (filterKey && activeFilter !== "all") {
      rows = rows.filter(
        (row) =>
          String(row[filterKey]).toLowerCase() ===
          String(activeFilter).toLowerCase()
      )
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      const keys = searchKey
        ? Array.isArray(searchKey)
          ? searchKey
          : [searchKey]
        : columns.map((c) => c.key)
      rows = rows.filter((row) =>
        keys.some((k) =>
          String(row[k] ?? "")
            .toLowerCase()
            .includes(q)
        )
      )
    }

    return rows
  }, [data, activeFilter, search, filterKey, searchKey, columns])

  const totalForTab = (value) => {
    if (!filterKey || value === "all") return data.length
    return data.filter(
      (row) =>
        String(row[filterKey]).toLowerCase() === String(value).toLowerCase()
    ).length
  }

  return (
    <Card>
      {/* ── Header ── */}
      <CardHeader className="flex flex-wrap items-center justify-between gap-4 pb-0">
        <h2 className="text-base font-semibold">
          {title}{" "}
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="h-8 w-48 pl-8 text-sm"
            />
          </div>
          {headerExtra}
          {onExport && (
            <Button
              size="sm"
              variant="outline"
              onClick={onExport}
              className="h-8 text-xs"
            >
              {exportLabel}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* ── Filter tabs ── */}
        {filters.length > 0 && (
          <div className="flex border-b px-6 overflow-x-auto scrollbar-none">
            {filters.map((f) => {
              const count = totalForTab(f.value)
              const isActive = activeFilter === f.value
              return (
                <button
                  key={f.value}
                  onClick={() => setActiveFilter(f.value)}
                  className={`relative shrink-0 px-3 py-3 text-sm transition-colors ${
                    isActive
                      ? "font-semibold text-[#145E94] after:absolute after:right-0 after:bottom-0 after:left-0 after:h-0.5 after:bg-[#145E94]"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f.label}{" "}
                  <span
                    className={
                      isActive ? "text-[#145E94]" : "text-muted-foreground"
                    }
                  >
                    ({count})
                  </span>
                </button>
              )
            })}
          </div>
        )}

        {/* ── Table ── */}
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.key}>{col.label}</TableHead>
              ))}
              {actions.length > 0 && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (actions.length > 0 ? 1 : 0)}
                  className="py-10 text-center text-muted-foreground"
                >
                  No results found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((row, i) => (
                <TableRow key={row.id ?? i}>
                  {columns.map((col) => (
                    <TableCell key={col.key}>
                      {col.render ? (
                        col.render(row[col.key], row)
                      ) : (
                        <span
                          className={
                            col.bold ? "font-semibold" : "text-muted-foreground"
                          }
                        >
                          {row[col.key]}
                        </span>
                      )}
                    </TableCell>
                  ))}
                  {actions.length > 0 && (
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {actions.map((action) => {
                          const Icon = action.icon
                          return Icon ? (
                            <button
                              key={action.label}
                              onClick={() => action.onClick(row)}
                              title={action.label}
                              className={`rounded-md p-1.5 transition-colors ${actionColors[action.color ?? "default"]}`}
                            >
                              <Icon size={14} />
                            </button>
                          ) : (
                            <button
                              key={action.label}
                              onClick={() => action.onClick(row)}
                              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${actionColors[action.color ?? "default"]}`}
                            >
                              {action.label}
                            </button>
                          )
                        })}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
