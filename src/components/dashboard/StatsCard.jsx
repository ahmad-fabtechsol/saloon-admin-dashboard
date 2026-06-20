import { AlertTriangle, TrendingDown, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { valueColors } from "@/lib/tableUtils"

function StatsCard({ title, value, icon: Icon, trend, trendValue, description, valueColor = "default", warning = false }) {
  const StatIcon = Icon ?? AlertTriangle
  const isUp = trend === "up"

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-md font-bold uppercase tracking-wide text-muted-foreground">
          {title}
        </CardTitle>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar/10 text-sidebar">
          <StatIcon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        <p className={`text-3xl font-bold ${valueColors[valueColor]}`}>{value}</p>
        <div className="flex items-center gap-1 text-xs">
          {warning ? (
            <>
              <AlertTriangle className="h-3 w-3 text-orange-500" />
              <span className="text-orange-500">{description}</span>
            </>
          ) : (
            <>
              {isUp
                ? <TrendingUp className="h-3 w-3 text-emerald-500" />
                : <TrendingDown className="h-3 w-3 text-destructive" />
              }
              <span className={isUp ? "text-emerald-500" : "text-destructive"}>
                {trendValue}
              </span>
              <span className="text-muted-foreground">{description}</span>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default StatsCard
