// Column definitions that include JSX render functions.
// Static config (statusConfig, filters, actionColors) lives in tableUtils.js.

import { Star } from "lucide-react"
import { salonStatusConfig, bookingStatusConfig, bookingPriceColor, notificationTypeConfig } from "@/lib/tableUtils"

// ─── Salons ───────────────────────────────────────────────────────────────────
// Used by: Salons.jsx

export const salonColumns = [
  { key: "name",      label: "Salon Name", bold: true },
  { key: "type",      label: "Type" },
  { key: "city",      label: "City" },
  { key: "owner",     label: "Owner" },
  { key: "submitted", label: "Submitted" },
  {
    key: "status",
    label: "Status",
    render: (val) => {
      const { icon: Icon, cls } = salonStatusConfig[val] ?? salonStatusConfig.Pending
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${cls}`}>
          <Icon className="h-3 w-3" />
          {val}
        </span>
      )
    },
  },
]

// ─── Top Salons (Reports) ─────────────────────────────────────────────────────
// Used by: TopSalons.jsx

export const topSalonsColumns = [
  { key: "name",     label: "Salon",    bold: true },
  { key: "city",     label: "City" },
  { key: "bookings", label: "Bookings" },
  {
    key: "revenue",
    label: "Revenue",
    render: (val) => (
      <span className="font-semibold text-emerald-600">{val}</span>
    ),
  },
  {
    key: "rating",
    label: "Rating",
    render: (val) => (
      <span className="inline-flex items-center gap-1 font-semibold text-amber-500">
        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
        {val}
      </span>
    ),
  },
]

// ─── Bookings ─────────────────────────────────────────────────────────────────
// Used by: Bookings.jsx

export const bookingColumns = [
  {
    key: "id",
    label: "#ID",
    render: (val) => (
      <span className="font-mono text-sm text-muted-foreground">#{val}</span>
    ),
  },
  {
    key: "customer",
    label: "Customer",
    render: (val) => (
      <div className="flex flex-col leading-tight">
        <span className="font-semibold text-sm">{val.name}</span>
        <span className="text-xs text-muted-foreground">{val.phone}</span>
      </div>
    ),
  },
  { key: "salon",    label: "Salon" },
  { key: "service",  label: "Service" },
  { key: "dateTime", label: "Date & Time" },
  {
    key: "price",
    label: "Price",
    render: (val, row) => (
      <span className={bookingPriceColor[row.status] ?? "text-foreground"}>
        {val}
      </span>
    ),
  },
  {
    key: "status",
    label: "Status",
    render: (val) => {
      const { icon: Icon, cls } = bookingStatusConfig[val] ?? bookingStatusConfig.Confirmed
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${cls}`}>
          <Icon className="h-3 w-3" />
          {val}
        </span>
      )
    },
  },
]

// ─── Notifications ────────────────────────────────────────────────────────────
// Used by: Notifications.jsx

export const notificationColumns = [
  {
    key: "type",
    label: "Type",
    render: (val) => {
      const { cls } = notificationTypeConfig[val] ?? notificationTypeConfig.System
      return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${cls}`}>
          {val}
        </span>
      )
    },
  },
  {
    key: "message",
    label: "Message",
    render: (val, row) => (
      <span className={row.status === "Unread" ? "font-semibold text-foreground" : "text-muted-foreground"}>
        {val}
      </span>
    ),
  },
  { key: "time", label: "Time" },
  {
    key: "status",
    label: "Status",
    render: (val) => (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${
        val === "Unread"
          ? "bg-[#145E94]/10 text-[#145E94] ring-[#145E94]/20"
          : "bg-slate-100 text-slate-500 ring-slate-200"
      }`}>
        {val}
      </span>
    ),
  },
]
