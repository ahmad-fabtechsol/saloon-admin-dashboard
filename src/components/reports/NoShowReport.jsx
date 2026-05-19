import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { offenderIcon, offenderStatusStyle } from "@/lib/chartUtils"

function StatPill({ value, label, valueClass = "text-foreground" }) {
  return (
    <div className="flex flex-col items-center">
      <p className={`text-2xl font-bold ${valueClass}`}>{value}</p>
      <p className="text-xs text-muted-foreground text-center">{label}</p>
    </div>
  )
}

export default function NoShowReport({ thisMonth, rate, suspended, topOffenders }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <span>🚩</span> No-Show Report
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {/* Summary stats */}
        <div className="flex items-center justify-around">
          <StatPill value={thisMonth}  label="This Month"    valueClass="text-red-500" />
          <StatPill value={rate}       label="No-Show Rate"  valueClass="text-amber-500" />
          <StatPill value={suspended}  label="Suspended" />
        </div>

        {/* Top offenders */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Top Offenders
          </p>
          <ul className="flex flex-col gap-2">
            {topOffenders.map((o) => (
              <li key={o.name} className="flex items-center justify-between text-sm">
                <span className="font-medium">{o.name}</span>
                <span className={offenderStatusStyle[o.status]}>
                  {offenderIcon[o.status]} {o.count} no-shows · {o.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
