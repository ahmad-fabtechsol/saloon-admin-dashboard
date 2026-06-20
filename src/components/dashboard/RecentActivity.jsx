import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

const ACTIVITY_PAGE_SIZE = 10

const dotColors = {
  approved: "bg-emerald-500",
  rejected: "bg-red-500",
  suspended: "bg-red-500",
  pending: "bg-orange-500",
  submitted: "bg-orange-500",
  customer: "bg-blue-500",
  booking: "bg-[#145E94]",
}

const getActivityDot = (item) => {
  if (item.dot) return item.dot
  const type = String(item.type ?? item.status ?? item.action ?? "").toLowerCase()
  return Object.entries(dotColors).find(([key]) => type.includes(key))?.[1] ?? "bg-muted-foreground"
}

const getItemId = (item, index) => item.id ?? item._id ?? item.salonId ?? `${item.name ?? "item"}-${index}`

const getName = (item) =>
  item.name ??
  item.salonName ??
  item.customerName ??
  item.title ??
  item.user?.name ??
  item.salon?.name ??
  ""

const getAction = (item) =>
  item.action ??
  item.message ??
  item.description ??
  item.event ??
  item.status ??
  ""

const getTime = (item) =>
  item.time ??
  item.createdAtLabel ??
  item.submittedAtLabel ??
  item.updatedAtLabel ??
  item.createdAt ??
  item.submittedAt ??
  ""

const formatDisplayTime = (value) => {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat("en-PK", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)
}

const getCity = (item) =>
  item.city ??
  item.location?.city ??
  item.address?.city ??
  item.salon?.city ??
  "Unknown city"

function RecentActivity({
  activities = [],
  pendingApprovals = [],
  loading = false,
  activityPage,
  activityTotalPages,
  activityTotalResults,
  onActivityPageChange,
}) {
  const navigate = useNavigate()
  const [localActivityPage, setLocalActivityPage] = useState(1)

  const isServerPaginated = typeof onActivityPageChange === "function" && typeof activityTotalPages === "number"
  const totalActivityPages = isServerPaginated
    ? Math.max(1, activityTotalPages)
    : Math.max(1, Math.ceil(activities.length / ACTIVITY_PAGE_SIZE))
  const currentActivityPage = Math.min(activityPage ?? localActivityPage, totalActivityPages)
  const paginatedActivities = useMemo(() => {
    if (isServerPaginated) return activities
    const start = (currentActivityPage - 1) * ACTIVITY_PAGE_SIZE
    return activities.slice(start, start + ACTIVITY_PAGE_SIZE)
  }, [activities, currentActivityPage, isServerPaginated])

  const handleActivityPageChange = (nextPage) => {
    const boundedPage = Math.min(totalActivityPages, Math.max(1, nextPage))
    if (isServerPaginated) onActivityPageChange(boundedPage)
    else setLocalActivityPage(boundedPage)
  }

  return (
    <div className="grid gap-4 lg:grid-cols-4">
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col divide-y p-0">
          {loading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center justify-between px-6 py-3.5">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-2.5 w-2.5 rounded-full" />
                  <Skeleton className="h-4 w-56" />
                </div>
                <Skeleton className="h-3 w-14" />
              </div>
            ))
          ) : paginatedActivities.length ? (
            paginatedActivities.map((item, index) => (
              <div
                key={getItemId(item, index)}
                className="flex items-center justify-between gap-4 px-6 py-3.5"
              >
                <div className="flex items-center gap-3">
                  <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${getActivityDot(item)}`} />
                  <p className="text-sm">
                    <span className="font-semibold">{getName(item)}</span>{" "}
                    <span className="text-muted-foreground">{getAction(item)}</span>
                  </p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">{formatDisplayTime(getTime(item))}</span>
              </div>
            ))
          ) : (
            <div className="px-6 py-8 text-sm text-muted-foreground">
              No recent activity found.
            </div>
          )}
          {!loading && totalActivityPages > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 text-sm">
              <span className="text-muted-foreground">
                {typeof activityTotalResults === "number" && (
                  <>
                    {activityTotalResults.toLocaleString()} result
                    {activityTotalResults === 1 ? "" : "s"}
                    <span className="mx-1.5">·</span>
                  </>
                )}
                Page {currentActivityPage} of {totalActivityPages}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs"
                  disabled={currentActivityPage <= 1}
                  onClick={() => handleActivityPageChange(currentActivityPage - 1)}
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs"
                  disabled={currentActivityPage >= totalActivityPages}
                  onClick={() => handleActivityPageChange(currentActivityPage + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <span>!</span> Pending Approvals
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex flex-col gap-2 rounded-lg bg-amber-50 p-3 dark:bg-amber-950/20">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-8 w-full" />
              </div>
            ))
          ) : pendingApprovals.length ? (
            pendingApprovals.map((item, index) => (
              <div
                key={getItemId(item, index)}
                className="flex flex-col gap-2 rounded-lg bg-amber-50 p-3 dark:bg-amber-950/20"
              >
                <div>
                  <p className="text-sm font-semibold">{getName(item)}</p>
                  <p className="text-xs text-muted-foreground">
                    {getCity(item)} · {formatDisplayTime(getTime(item))}
                  </p>
                </div>
                <Button
                  size="sm"
                  className="w-full bg-[#145E94] hover:bg-[#145E94]/90 text-white text-xs"
                  onClick={() => navigate("/salons?status=pending")}
                >
                  Review
                </Button>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No pending approvals.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default RecentActivity
