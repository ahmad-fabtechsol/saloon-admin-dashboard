import { useMemo, useState } from "react"
import { FiEye, FiFlag } from "react-icons/fi"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import DynamicTable from "@/components/DynamicTable"
import StatsCard from "@/components/dashboard/StatsCard"
import bookingsData from "@/data/bookings.json"
import { actionColors, bookingFilters, dashboardIconMap } from "@/lib/tableUtils"
import { bookingColumns } from "@/lib/tableColumns"

const { stats, statCards, bookings } = bookingsData

// Resolves the dynamic trendValue for each stat card from the stats object.
function resolveTrendValue(card, stats) {
  if (card.trendType === "pct")
    return `${Math.round((stats[card.valueKey] / stats.total) * 100)}%`
  if (card.trendKey)
    return `↑ ${stats[card.trendKey]}`
  return card.trendValue ?? ""
}

// ─── Bookings page ────────────────────────────────────────────────────────────

export default function Bookings() {
  const navigate = useNavigate()
  const [dateRange, setDateRange] = useState(undefined)
  const filteredData = useMemo(() => {
    if (!dateRange?.from) return bookings
    const from = dateRange.from
    const to = dateRange.to ?? dateRange.from
    return bookings.filter((b) => {
      const d = new Date(b.date)
      return d >= from && d <= to
    })
  }, [dateRange])

  // Context-sensitive actions: Flag only for No-Show bookings
  const columns = [
    ...bookingColumns,
    {
      key: "id",
      label: "Actions",
      render: (_, row) => (
        <div className="flex items-center gap-1.5">
          <button
            title="View"
            onClick={() => navigate(`/booking-details/${row.id}`)}
            className={`rounded-md p-1.5 transition-colors ${actionColors.brand}`}
          >
            <FiEye size={14} />
          </button>
          {row.status === "No-Show" && (
            <button
              title="Flag"
              onClick={() => toast.warning(`Booking #${row.id} flagged as no-show`)}
              className={`rounded-md p-1.5 transition-colors ${actionColors.red}`}
            >
              <FiFlag size={14} />
            </button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {statCards.map((card) => (
          <StatsCard
            key={card.title}
            title={card.title}
            value={stats[card.valueKey]}
            icon={dashboardIconMap[card.icon]}
            trend={card.trend}
            trendValue={resolveTrendValue(card, stats)}
            description={card.description}
            valueColor={card.valueColor}
            warning={card.warning ?? false}
          />
        ))}
      </div>

      {/* ── Bookings table ── */}
      <DynamicTable
        title="All Bookings"
        searchPlaceholder="Search by customer or salon..."
        searchKey={["salon", "service"]}
        exportLabel="Export CSV"
        onExport={() => console.log("export")}
        filters={bookingFilters}
        filterKey="status"
        columns={columns}
        data={filteredData}
        headerExtra={
        <DateRangePicker range={dateRange} onChange={setDateRange} />
        }
      />
    </div>
  )
}
