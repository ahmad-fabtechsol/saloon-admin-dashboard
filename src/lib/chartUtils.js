// ─── Chart color tokens ───────────────────────────────────────────────────────
// Used by: RevenueOverview.jsx, BookingTrends.jsx, CustomerGrowth.jsx

export const chartColors = {
  // Revenue bar chart — blue brand gradient
  revenue:   "#145E94",
  revenueHover: "#0e4a73",

  // Booking status stacked bar chart
  completed: "#10b981",   // emerald-500
  cancelled: "#ef4444",   // red-500
  noShow:    "#f59e0b",   // amber-500

  // Customer growth bar chart
  growth:    "#10b981",   // emerald-500
  growthHover: "#059669", // emerald-600

  // Axis / grid lines
  axis:      "#94a3b8",   // slate-400
  grid:      "#e2e8f0",   // slate-200
}

// ─── Shared tooltip style ─────────────────────────────────────────────────────
// Used by: all chart components — passed to Recharts <Tooltip contentStyle={...}>

export const tooltipStyle = {
  backgroundColor: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  fontSize: "12px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
}

// ─── No-Show offender badge ───────────────────────────────────────────────────
// Used by: NoShowReport.jsx

export const offenderStatusStyle = {
  Suspended: "text-red-500 font-semibold",
  Caution:   "text-amber-500 font-semibold",
}

export const offenderIcon = {
  Suspended: "🚫",
  Caution:   "⚠️",
}
