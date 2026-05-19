import { useState } from "react"
import { format } from "date-fns"
import reportsData from "@/data/reports.json"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import RevenueOverview from "@/components/reports/RevenueOverview"
import BookingTrends from "@/components/reports/BookingTrends"
import TopSalons from "@/components/reports/TopSalons"
import NoShowReport from "@/components/reports/NoShowReport"
import CustomerGrowth from "@/components/reports/CustomerGrowth"

const { revenue, bookings, topSalons, noShow, customerGrowth } = reportsData

export default function Reports() {
  const [dateRange, setDateRange] = useState(undefined)

  const rangeLabel = dateRange?.from
    ? dateRange.to
      ? `${format(dateRange.from, "MMM d")} – ${format(dateRange.to, "MMM d, yyyy")}`
      : format(dateRange.from, "MMM d, yyyy")
    : null

  return (
    <div className="flex flex-col gap-4">
      {/* ── Page header with date range filter ── */}
      <div className="flex items-center justify-between">
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
        <TopSalons salons={topSalons} />
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
