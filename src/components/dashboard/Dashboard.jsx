import StatsCard from "@/components/dashboard/StatsCard"
import RecentActivity from "@/components/dashboard/RecentActivity"
import dashboardData from "@/data/dashboard.json"
import { dashboardIconMap } from "@/lib/tableUtils"

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardData.stats.map((s) => (
          <StatsCard key={s.title} {...s} icon={dashboardIconMap[s.icon]} />
        ))}
      </div>
      <RecentActivity />
    </div>
  )
}
