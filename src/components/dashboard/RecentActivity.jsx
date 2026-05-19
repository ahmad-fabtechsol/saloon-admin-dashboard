import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import dashboardData from "@/data/dashboard.json"

const { activities, pendingApprovals } = dashboardData

function RecentActivity() {
  return (
    <div className="grid gap-4 lg:grid-cols-4">
      {/* Activity feed */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col divide-y p-0">
          {activities.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between px-6 py-3.5"
            >
              <div className="flex items-center gap-3">
                <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${item.dot}`} />
                <p className="text-sm">
                  <span className="font-semibold">{item.name}</span>{" "}
                  <span className="text-muted-foreground">{item.action}</span>
                </p>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">{item.time}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Pending approvals */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <span>⚠️</span> Pending Approvals
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {pendingApprovals.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-2 rounded-lg bg-amber-50 p-3 dark:bg-amber-950/20"
            >
              <div>
                <p className="text-sm font-semibold">{item.name}</p>
                <p className="text-xs text-muted-foreground">
                  {item.city} · {item.time}
                </p>
              </div>
              <Button size="sm" className="w-full bg-[#145E94] hover:bg-[#145E94]/90 text-white text-xs">
                Review →
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

export default RecentActivity
