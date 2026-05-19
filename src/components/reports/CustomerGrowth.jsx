import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { chartColors, tooltipStyle } from "@/lib/chartUtils"

export default function CustomerGrowth({ totalUsers, newThisMonth, newSalonsThisMonth, approvalRate, signupsLast7 }) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <span>📈</span> Customer Growth
        </CardTitle>
        <div className="flex items-baseline gap-4">
          <div>
            <p className="text-2xl font-bold">{totalUsers}</p>
            <p className="text-xs text-muted-foreground">Total users</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-emerald-600">{newThisMonth}</p>
            <p className="text-xs text-muted-foreground">This month</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 pt-0 flex flex-col gap-3">
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            New Signups — Last 7 Days
          </p>
          <ResponsiveContainer width="100%" height={90}>
            <BarChart data={signupsLast7} barCategoryGap="35%">
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: chartColors.axis }}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v) => [v, "Signups"]}
                cursor={{ fill: "rgba(0,0,0,0.04)" }}
              />
              <Bar dataKey="signups" fill={chartColors.growth} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Footer stats */}
        <div className="flex items-center justify-between border-t pt-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">New Salons this month</p>
            <p className="font-bold text-[#145E94]">+{newSalonsThisMonth}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Approval rate</p>
            <p className="font-bold text-emerald-600">{approvalRate}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
