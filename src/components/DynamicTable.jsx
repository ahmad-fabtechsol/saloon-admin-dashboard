import { useState, useMemo } from "react"
import { MoreVertical, Search } from "lucide-react"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import TableSkeleton from "@/components/TableSkeleton"
import ErrorState from "@/components/ErrorState"
import { actionColors, actionMenuColors } from "@/lib/tableUtils"

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
  actionsVariant = "inline",
  onRowClick,
  headerExtra,
  searchValue,
  onSearchChange,
  // ── Async / server-driven props (all optional) ──
  loading = false,
  error = null,
  onRetry,
  skeletonRows = 8,
  // Controlled filter tabs: when `onFilterChange` is passed the parent owns the
  // active tab and fetches data server-side (so we skip client-side filtering).
  activeFilter: controlledFilter,
  onFilterChange,
  showCounts = true,
  // Server-side pagination: render a footer when `totalPages` is provided.
  page,
  totalPages,
  totalResults,
  onPageChange,
}) {
  const [search, setSearch] = useState("")
  const [internalFilter, setInternalFilter] = useState(filters[0]?.value ?? "all")

  const isServerFiltered = typeof onFilterChange === "function"
  const isServerSearched = typeof onSearchChange === "function"
  const activeFilter = isServerFiltered ? controlledFilter : internalFilter
  const activeSearch = isServerSearched ? searchValue ?? "" : search

  const handleTabClick = (value) => {
    if (isServerFiltered) onFilterChange(value)
    else setInternalFilter(value)
  }

  const handleSearchChange = (value) => {
    if (isServerSearched) onSearchChange(value)
    else setSearch(value)
  }

  const filtered = useMemo(() => {
    let rows = data

    // Skip client-side status filtering when the server already filtered by tab.
    if (!isServerFiltered && filterKey && activeFilter !== "all") {
      rows = rows.filter(
        (row) =>
          String(row[filterKey]).toLowerCase() ===
          String(activeFilter).toLowerCase()
      )
    }

    if (!isServerSearched && search.trim()) {
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
  }, [data, activeFilter, search, filterKey, searchKey, columns, isServerFiltered, isServerSearched])

  const totalForTab = (value) => {
    if (!filterKey || value === "all") return data.length
    return data.filter(
      (row) =>
        String(row[filterKey]).toLowerCase() === String(value).toLowerCase()
    ).length
  }

  // Counts are only meaningful when filtering the full dataset client-side.
  const tabCountsVisible = showCounts && !isServerFiltered
  const colSpan = columns.length + (actions.length > 0 ? 1 : 0)

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
              value={activeSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
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
              const isActive = activeFilter === f.value
              return (
                <button
                  key={f.value}
                  onClick={() => handleTabClick(f.value)}
                  className={`relative shrink-0 px-3 py-3 text-sm transition-colors ${
                    isActive
                      ? "font-semibold text-[#145E94] after:absolute after:right-0 after:bottom-0 after:left-0 after:h-0.5 after:bg-[#145E94]"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f.label}
                  {tabCountsVisible && (
                    <span
                      className={
                        isActive ? " text-[#145E94]" : " text-muted-foreground"
                      }
                    >
                      {" "}
                      ({totalForTab(f.value)})
                    </span>
                  )}
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
            {loading ? (
              <TableSkeleton
                rows={skeletonRows}
                columns={columns.length}
                hasActions={actions.length > 0}
              />
            ) : error ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={colSpan} className="p-0">
                  <ErrorState
                    message={
                      typeof error === "string"
                        ? error
                        : "Something went wrong while fetching the data. Please try again."
                    }
                    onRetry={onRetry}
                  />
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={colSpan}
                  className="py-10 text-center text-muted-foreground"
                >
                  No results found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((row, i) => (
                <TableRow
                  key={row.id ?? i}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={onRowClick ? "cursor-pointer" : undefined}
                >
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
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      {(() => {
                        const visible = actions.filter(
                          (action) => !action.show || action.show(row)
                        )
                        if (visible.length === 0) {
                          return <span className="text-xs text-muted-foreground/60">—</span>
                        }

                        // ── Dropdown (kebab) variant ──
                        if (actionsVariant === "menu") {
                          return (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  aria-label="Open actions menu"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-44">
                                {visible.map((action) => {
                                  const Icon = action.icon
                                  return (
                                    <DropdownMenuItem
                                      key={action.label}
                                      onClick={() => action.onClick(row)}
                                      className={`font-medium ${actionMenuColors[action.color ?? "default"]}`}
                                    >
                                      {Icon && <Icon className="h-4 w-4" />}
                                      {action.label}
                                    </DropdownMenuItem>
                                  )
                                })}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )
                        }

                        // ── Inline buttons variant (default) ──
                        return (
                          <div className="flex items-center gap-1.5">
                            {visible.map((action) => {
                            const Icon = action.icon
                            const cls = actionColors[action.color ?? "default"]

                            // Labeled pill: icon + text (e.g. Approve / Reject)
                            if (Icon && action.showLabel) {
                              return (
                                <button
                                  key={action.label}
                                  onClick={() => action.onClick(row)}
                                  className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${cls}`}
                                >
                                  <Icon size={14} />
                                  {action.label}
                                </button>
                              )
                            }

                            return Icon ? (
                              <button
                                key={action.label}
                                onClick={() => action.onClick(row)}
                                title={action.label}
                                className={`rounded-md p-1.5 transition-colors ${cls}`}
                              >
                                <Icon size={14} />
                              </button>
                            ) : (
                              <button
                                key={action.label}
                                onClick={() => action.onClick(row)}
                                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${cls}`}
                              >
                                {action.label}
                              </button>
                            )
                            })}
                          </div>
                        )
                      })()}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* ── Pagination footer (server-side) ── */}
        {typeof totalPages === "number" && totalPages > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t px-6 py-3 text-sm">
            <span className="text-muted-foreground">
              {typeof totalResults === "number" && (
                <>
                  {totalResults.toLocaleString()} result
                  {totalResults === 1 ? "" : "s"}
                  <span className="mx-1.5">·</span>
                </>
              )}
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs"
                disabled={loading || page <= 1}
                onClick={() => onPageChange?.(page - 1)}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs"
                disabled={loading || page >= totalPages}
                onClick={() => onPageChange?.(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
