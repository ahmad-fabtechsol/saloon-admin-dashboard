import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { chartColors, tooltipStyle } from "@/lib/chartUtils"

export default function RevenueOverview({ thisMonth, today, dailyLast7 }) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Revenue Overview
        </CardTitle>
        <div className="flex items-baseline gap-6">
          <div>
            <p className="text-2xl font-bold text-emerald-600">{thisMonth}</p>
            <p className="text-xs text-muted-foreground">This month</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-[#145E94]">{today}</p>
            <p className="text-xs text-muted-foreground">Today</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 pt-0">
        <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Daily Revenue — Last 7 Days
        </p>
        <ResponsiveContainer width="100%" height={110}>
          <BarChart data={dailyLast7} barCategoryGap="30%">
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: chartColors.axis }}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(v) => [`Rs. ${v.toLocaleString()}`, "Revenue"]}
              cursor={{ fill: "rgba(0,0,0,0.04)" }}
            />
            <Bar dataKey="amount" fill={chartColors.revenue} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
