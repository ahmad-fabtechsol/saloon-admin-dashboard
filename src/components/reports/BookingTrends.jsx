import { Bar, BarChart, Legend, ResponsiveContainer, Tooltip, XAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { chartColors, tooltipStyle } from "@/lib/chartUtils"

export default function BookingTrends({ totalThisMonth, completionRate, statusLast7 }) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Booking Trends
        </CardTitle>
        <div className="flex items-baseline gap-6">
          <div>
            <p className="text-2xl font-bold">{totalThisMonth.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total this month</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-emerald-600">{completionRate} completed</p>
            <p className="text-xs text-muted-foreground">Completion rate</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 pt-0">
        <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Status Breakdown — Last 7 Days
        </p>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={statusLast7} barCategoryGap="30%" barGap={1}>
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: chartColors.axis }}
            />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
            <Legend
              iconType="square"
              iconSize={8}
              wrapperStyle={{ fontSize: 11, paddingTop: 4 }}
            />
            <Bar dataKey="Completed" stackId="a" fill={chartColors.completed} radius={[0, 0, 0, 0]} />
            <Bar dataKey="Cancelled" stackId="a" fill={chartColors.cancelled} />
            <Bar dataKey="NoShow"    stackId="a" fill={chartColors.noShow}    radius={[3, 3, 0, 0]} name="No-Show" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
