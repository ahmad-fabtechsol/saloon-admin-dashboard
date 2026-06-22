import { useMemo, useState } from "react"
import { format } from "date-fns"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import RevenueOverview from "@/components/reports/RevenueOverview"
import BookingTrends from "@/components/reports/BookingTrends"
import TopSalons from "@/components/reports/TopSalons"
import NoShowReport from "@/components/reports/NoShowReport"
import CustomerGrowth from "@/components/reports/CustomerGrowth"
import { parseApiError } from "@/lib/apiError"
import { useGetAdminReportsQuery } from "@/store/reports/reportsApiSlice"

const TOP_SALONS_LIMIT = 10

const formatCurrency = (value) => `Rs. ${Number(value ?? 0).toLocaleString()}`
const formatPercent = (value) => `${Number(value ?? 0)}%`
const capitalize = (value) =>
  typeof value === "string" && value.length
    ? value.charAt(0).toUpperCase() + value.slice(1)
    : value

// ─── API → component-prop mappers ─────────────────────────────────────────────

const mapRevenue = (revenue) => ({
  thisMonth: formatCurrency(revenue?.totalThisMonth),
  today: formatCurrency(revenue?.today),
  dailyLast7: revenue?.dailyLast7Days ?? [],
})

const mapBookings = (bookings) => ({
  totalThisMonth: bookings?.totalThisMonth ?? 0,
  completionRate: formatPercent(bookings?.completionRate),
  statusLast7: (bookings?.statusBreakdownLast7Days ?? []).map((d) => ({
    day: d.day,
    Completed: d.completed,
    Cancelled: d.cancelled,
    NoShow: d.noShow,
  })),
})

const mapTopSalons = (salons) =>
  (salons ?? []).map((s) => ({
    id: s.salonId,
    name: s.name,
    city: s.city,
    bookings: s.bookings,
    revenue: formatCurrency(s.revenue),
    rating: s.rating,
  }))

const mapNoShow = (noShow) => ({
  thisMonth: noShow?.thisMonth ?? 0,
  rate: formatPercent(noShow?.noShowRate),
  suspended: noShow?.suspended ?? 0,
  topOffenders: (noShow?.topOffenders ?? []).map((o) => ({
    name: o.name,
    count: o.noShows,
    status: capitalize(o.status),
  })),
})

const mapCustomerGrowth = (growth) => ({
  totalUsers: growth?.totalUsers ?? 0,
  newThisMonth: growth?.thisMonth ?? 0,
  newSalonsThisMonth: growth?.newSalonsThisMonth ?? 0,
  approvalRate: formatPercent(growth?.approvalRate),
  signupsLast7: (growth?.newSignupsLast7Days ?? []).map((d) => ({
    day: d.day,
    signups: d.count,
  })),
})

export default function Reports() {
  const [dateRange, setDateRange] = useState(undefined)

  const { data, isFetching, error, refetch } = useGetAdminReportsQuery({
    from: dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined,
    to: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
    topSalonsLimit: TOP_SALONS_LIMIT,
  })

  const report = data?.data

  const revenue = useMemo(() => mapRevenue(report?.revenueOverview), [report])
  const bookings = useMemo(() => mapBookings(report?.bookingTrends), [report])
  const topSalons = useMemo(() => mapTopSalons(report?.topPerformingSalons), [report])
  const noShow = useMemo(() => mapNoShow(report?.noShowReport), [report])
  const customerGrowth = useMemo(() => mapCustomerGrowth(report?.customerGrowth), [report])

  const rangeLabel = dateRange?.from
    ? dateRange.to
      ? `${format(dateRange.from, "MMM d")} – ${format(dateRange.to, "MMM d, yyyy")}`
      : format(dateRange.from, "MMM d, yyyy")
    : null

  return (
    <div className="flex flex-col gap-4">
      {/* ── Page header with search + date range filter ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-semibold">Reports</h1>
          {rangeLabel && (
            <p className="text-xs text-muted-foreground">{rangeLabel}</p>
          )}
        </div>
        <DateRangePicker
          range={dateRange}
          onChange={setDateRange}
          align="end"
        />
      </div>

      {error && (
        <div className="flex items-center justify-between rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
          <span>{parseApiError(error).message}</span>
          <button onClick={refetch} className="font-semibold underline">
            Retry
          </button>
        </div>
      )}

      {/* ── Top row: Revenue + Booking Trends ── */}
      <div className="grid gap-4 lg:grid-cols-2">
        <RevenueOverview
          thisMonth={revenue.thisMonth}
          today={revenue.today}
          dailyLast7={revenue.dailyLast7}
        />
        <BookingTrends
          totalThisMonth={bookings.totalThisMonth}
          completionRate={bookings.completionRate}
          statusLast7={bookings.statusLast7}
        />
      </div>

      {/* ── Bottom row: Top Salons + No-Show + Customer Growth ── */}
      <div className="grid gap-4 lg:grid-cols-[1fr_auto_auto] xl:grid-cols-[1.6fr_1fr_1fr]">
        <TopSalons salons={topSalons} loading={isFetching} />
        <NoShowReport
          thisMonth={noShow.thisMonth}
          rate={noShow.rate}
          suspended={noShow.suspended}
          topOffenders={noShow.topOffenders}
        />
        <CustomerGrowth
          totalUsers={customerGrowth.totalUsers}
          newThisMonth={customerGrowth.newThisMonth}
          newSalonsThisMonth={customerGrowth.newSalonsThisMonth}
          approvalRate={customerGrowth.approvalRate}
          signupsLast7={customerGrowth.signupsLast7}
        />
      </div>
    </div>
  )
}
