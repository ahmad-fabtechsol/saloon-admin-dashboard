import { useState } from "react"
import StatsCard from "@/components/dashboard/StatsCard"
import RecentActivity from "@/components/dashboard/RecentActivity"
import ErrorState from "@/components/ErrorState"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { dashboardIconMap } from "@/lib/tableUtils"
import { useGetAdminDashboardQuery } from "@/store/dashboard/dashboardApiSlice"

const statDefinitions = [
  {
    title: "Total Salons",
    icon: "Scissors",
    keys: ["totalSalons", "salons", "salonCount"],
  },
  {
    title: "Total Customers",
    icon: "Users",
    keys: ["totalCustomers", "customers", "customerCount"],
    valueColor: "teal",
  },
  {
    title: "Bookings Today",
    icon: "CalendarDays",
    keys: ["bookingsToday", "todayBookings", "bookingCountToday"],
    valueColor: "orange",
  },
  {
    title: "Revenue (MTD)",
    icon: "TrendingUp",
    keys: ["revenueMTD", "mtdRevenue", "monthlyRevenue", "revenue"],
    valueColor: "green",
  },
  {
    title: "No Show Today",
    icon: "TrendingDown",
    keys: ["noShowToday", "noShowsToday", "todayNoShows"],
    valueColor: "red",
  },
]

const unwrapDashboardData = (response) =>
  response?.data?.dashboard ??
  response?.data?.result ??
  response?.data ??
  response?.result ??
  response?.results ??
  response ??
  {}

const pickFirstValue = (source, keys) => {
  for (const key of keys) {
    if (source?.[key] !== undefined && source?.[key] !== null) return source[key]
  }
  return undefined
}

const formatStatValue = (value) => {
  if (value === undefined || value === null || value === "") return "0"
  if (typeof value === "number") return new Intl.NumberFormat("en-PK").format(value)
  return String(value)
}

const resolveStats = (payload) => {
  const stats = payload.stats ?? payload.cards ?? payload.metrics?.stats
  if (Array.isArray(stats) && stats.length) return stats

  const source = payload.metrics ?? payload.summary ?? payload
  return statDefinitions.map((stat) => ({
    ...stat,
    value: formatStatValue(pickFirstValue(source, stat.keys)),
    trend: pickFirstValue(source, [`${stat.keys[0]}Trend`, `${stat.keys[0]}Direction`]) ?? "up",
    trendValue: pickFirstValue(source, [`${stat.keys[0]}TrendValue`, `${stat.keys[0]}Change`]) ?? "",
    description: pickFirstValue(source, [`${stat.keys[0]}Description`]) ?? "",
  }))
}

const resolveActivities = (payload) =>
  payload.activities ??
  payload.recentActivity ??
  payload.activity?.results ??
  payload.activity?.items ??
  payload.recentActivities ??
  payload.activity ??
  []

const resolveActivityPagination = (payload, page, limit) => {
  const activityMeta = payload.activityPagination ?? payload.activitiesPagination ?? payload.activity?.pagination ?? {}
  const totalResults =
    activityMeta.totalResults ??
    activityMeta.total ??
    activityMeta.count ??
    payload.totalActivities ??
    payload.activityTotal
  const totalPages =
    activityMeta.totalPages ??
    activityMeta.pages ??
    (typeof totalResults === "number" ? Math.ceil(totalResults / limit) : undefined)

  return {
    page: activityMeta.page ?? activityMeta.currentPage ?? page,
    totalPages,
    totalResults,
  }
}

const resolvePendingApprovals = (payload) =>
  payload.pendingApprovals ??
  payload.pendingSalons ??
  payload.pendingListings ??
  payload.approvals ??
  []

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-9 w-9 rounded-lg" />
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
      <RecentActivity loading />
    </div>
  )
}

export default function Dashboard() {
  const [activityPage, setActivityPage] = useState(1)
  const { data, error, isLoading, isFetching, refetch } = useGetAdminDashboardQuery({
    activityLimit: 10,
    activityPage,
    pendingLimit: 5,
  })

  if (isLoading) return <DashboardSkeleton />

  if (error) {
    return (
      <ErrorState
        title="Couldn't load dashboard"
        message="The dashboard summary could not be fetched. Please try again."
        onRetry={refetch}
        retrying={isFetching}
      />
    )
  }

  const dashboard = unwrapDashboardData(data)
  const stats = resolveStats(dashboard)
  const activities = resolveActivities(dashboard)
  const activityPagination = resolveActivityPagination(dashboard, activityPage, 10)
  const pendingApprovals = resolvePendingApprovals(dashboard)

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <StatsCard key={s.title} {...s} icon={dashboardIconMap[s.icon]} />
        ))}
      </div>
      <RecentActivity
        activities={activities}
        activityPage={activityPagination.page}
        activityTotalPages={activityPagination.totalPages}
        activityTotalResults={activityPagination.totalResults}
        onActivityPageChange={setActivityPage}
        loading={isFetching}
        pendingApprovals={pendingApprovals}
      />
    </div>
  )
}
