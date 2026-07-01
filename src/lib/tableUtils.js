import {
  AlertTriangle,
  Ban,
  CalendarDays,
  CheckCircle2,
  PauseCircle,
  Scissors,
  TrendingDown,
  TrendingUp,
  Users,
  XCircle,
  CalendarCheck,
} from "lucide-react"

// ─── Shared ───────────────────────────────────────────────────────────────────
// Used by: DynamicTable.jsx (actions prop renderer), Customers.jsx, Salons.jsx, Bookings.jsx

export const actionColors = {
  brand:   "border border-[#145E94]/30 bg-[#145E94]/10 text-[#145E94] hover:bg-[#145E94]/20",
  blue:    "border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100",
  green:   "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
  red:     "border border-red-200 bg-red-50 text-red-600 hover:bg-red-100",
  amber:   "border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100",
  default: "border border-border bg-muted text-foreground hover:bg-muted/80",
}

// Text colors for the same actions when rendered inside a dropdown menu.
export const actionMenuColors = {
  brand:   "text-[#145E94]",
  blue:    "text-blue-600",
  green:   "text-emerald-600",
  red:     "text-red-600",
  amber:   "text-amber-600",
  default: "text-foreground",
}

// ─── StatsCard ────────────────────────────────────────────────────────────────
// Used by: StatsCard.jsx — maps the valueColor prop to a Tailwind text class

export const valueColors = {
  default: "text-foreground",
  teal:    "text-teal-600",
  green:   "text-emerald-600",
  orange:  "text-orange-500",
  red:     "text-red-500",
}

// ─── Salons ───────────────────────────────────────────────────────────────────
// Used by: Salons.jsx — status badge rendering and filter tab config
// Column definitions with JSX renders live in tableColumns.jsx

// Keyed by the API `status` value (lowercase). `label` is the display text.
export const salonStatusConfig = {
  pending:   { label: "Pending",   dot: "bg-amber-500 animate-pulse", cls: "bg-amber-50 text-amber-700 ring-amber-200" },
  approved:  { label: "Approved",  dot: "bg-emerald-500",             cls: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  rejected:  { label: "Rejected",  dot: "bg-red-500",                 cls: "bg-red-50 text-red-600 ring-red-200" },
  suspended: { label: "Suspended", dot: "bg-slate-400",               cls: "bg-slate-100 text-slate-600 ring-slate-200" },
}

// `value` is sent to the API as the `status` query param ("all" omits it).
export const salonFilters = [
  { label: "All",       value: "all" },
  { label: "Pending",   value: "pending" },
  { label: "Approved",  value: "approved" },
  { label: "Rejected",  value: "rejected" },
  { label: "Suspended", value: "suspended" },
]

// ─── Customers ────────────────────────────────────────────────────────────────
// Used by: Customers.jsx — status badge rendering and filter tab config
// Column definitions with JSX renders live in tableColumns.jsx

export const customerStatusConfig = {
  active:    { label: "Active",    icon: CheckCircle2, cls: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  suspended: { label: "Suspended", icon: PauseCircle,  cls: "bg-amber-50 text-amber-700 ring-amber-200" },
  blocked:   { label: "Blocked",   icon: Ban,          cls: "bg-red-50 text-red-600 ring-red-200" },
}

export const customerFilters = [
  { label: "All",       value: "all" },
  { label: "Suspended", value: "suspended" },
  { label: "Blocked",   value: "blocked" },
]

// ─── Bookings ─────────────────────────────────────────────────────────────────
// Used by: Bookings.jsx — status badge rendering, filter tabs, price color map
// Column definitions with JSX renders live in tableColumns.jsx

export const bookingStatusConfig = {
  pending: { label: "Pending", icon: PauseCircle, cls: "bg-amber-50 text-amber-700 ring-amber-200" },
  confirmed: { label: "Confirmed", icon: CheckCircle2, cls: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  completed: { label: "Completed", icon: CheckCircle2, cls: "bg-[#145E94]/10 text-[#145E94] ring-[#145E94]/20" },
  cancelled: { label: "Cancelled", icon: XCircle, cls: "bg-red-50 text-red-600 ring-red-200" },
  noShow: { label: "No-Show", icon: PauseCircle, cls: "bg-amber-50 text-amber-700 ring-amber-200" },
}

export const bookingPriceColor = {
  pending: "text-muted-foreground",
  confirmed: "font-semibold text-emerald-600",
  completed: "font-semibold text-[#145E94]",
  cancelled: "text-muted-foreground",
  noShow: "text-muted-foreground",
}

// Admin status actions and the transitions allowed from each current status.
// Target statuses map to the PATCH /bookings/admin/{id}/status payload.
export const bookingStatusActions = [
  { status: "confirmed", label: "Confirm",        color: "green", past: "confirmed" },
  { status: "completed", label: "Mark Completed", color: "blue",  past: "completed" },
  { status: "noShow",    label: "Mark No-Show",   color: "amber", past: "marked as no-show" },
  { status: "cancelled", label: "Cancel",         color: "red",   past: "cancelled" },
]

// Any booking can be moved to any other status (actions available from every tab);
// the only one hidden is the status it is already in.
const BOOKING_TARGETS = ["confirmed", "completed", "noShow", "cancelled"]
export const bookingStatusTransitions = {
  pending:   BOOKING_TARGETS,
  confirmed: BOOKING_TARGETS.filter((s) => s !== "confirmed"),
  completed: BOOKING_TARGETS.filter((s) => s !== "completed"),
  cancelled: BOOKING_TARGETS.filter((s) => s !== "cancelled"),
  noShow:    BOOKING_TARGETS.filter((s) => s !== "noShow"),
}

export const bookingFilters = [
  { label: "All",       value: "all" },
  { label: "Pending",   value: "pending" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
  { label: "No-Show",   value: "noShow" },
]

// ─── Feedback ─────────────────────────────────────────────────────────────────
// Used by: Feedback.jsx / FeedbackDetail.jsx — status/type/priority badges and filter tabs
// Column definitions with JSX renders live in tableColumns.jsx

export const feedbackStatusConfig = {
  open:      { label: "Open",       icon: AlertTriangle, cls: "bg-[#145E94]/10 text-[#145E94] ring-[#145E94]/20" },
  inReview:  { label: "In Review",  icon: PauseCircle,   cls: "bg-amber-50 text-amber-700 ring-amber-200" },
  resolved:  { label: "Resolved",   icon: CheckCircle2,  cls: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  closed:    { label: "Closed",     icon: XCircle,       cls: "bg-slate-100 text-slate-600 ring-slate-200" },
}

// API type values: [appBug, appSuggestion, appOther, customerReport, salonReport, bookingReport, general]
export const feedbackTypeConfig = {
  appBug:         { label: "App Bug",         cls: "bg-red-50 text-red-600 ring-red-200" },
  appSuggestion:  { label: "App Suggestion",  cls: "bg-[#145E94]/10 text-[#145E94] ring-[#145E94]/20" },
  appOther:       { label: "App Other",       cls: "bg-slate-100 text-slate-600 ring-slate-200" },
  customerReport: { label: "Customer Report", cls: "bg-amber-50 text-amber-700 ring-amber-200" },
  salonReport:    { label: "Salon Report",    cls: "bg-purple-50 text-purple-600 ring-purple-200" },
  bookingReport:  { label: "Booking Report",  cls: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  general:        { label: "General",         cls: "bg-slate-100 text-slate-600 ring-slate-200" },
  other:          { label: "Other",           cls: "bg-slate-100 text-slate-600 ring-slate-200" },
}

export const feedbackPriorityConfig = {
  low:    { label: "Low",    cls: "bg-slate-100 text-slate-600 ring-slate-200" },
  medium: { label: "Medium", cls: "bg-amber-50 text-amber-700 ring-amber-200" },
  high:   { label: "High",   cls: "bg-red-50 text-red-600 ring-red-200" },
  urgent: { label: "Urgent", cls: "bg-red-100 text-red-700 ring-red-300" },
}

// Status filter tabs — `value` is sent as the API `status` param ("all" omits it).
export const feedbackFilters = [
  { label: "All",       value: "all" },
  { label: "Open",      value: "open" },
  { label: "In Review", value: "inReview" },
  { label: "Resolved",  value: "resolved" },
  { label: "Closed",    value: "closed" },
]

// Type dropdown options — `value` is sent as the API `type` param ("all" omits it).
export const feedbackTypeOptions = [
  { label: "All Types",       value: "all" },
  { label: "App Bug",         value: "appBug" },
  { label: "App Suggestion",  value: "appSuggestion" },
  { label: "App Other",       value: "appOther" },
  { label: "Customer Report", value: "customerReport" },
  { label: "Salon Report",    value: "salonReport" },
  { label: "Booking Report",  value: "bookingReport" },
  { label: "General",         value: "general" },
]

// Editable options for the detail page update form.
export const feedbackStatusOptions = [
  { label: "Open",      value: "open" },
  { label: "In Review", value: "inReview" },
  { label: "Resolved",  value: "resolved" },
  { label: "Closed",    value: "closed" },
]

// API accepts only [low, medium, high].
export const feedbackPriorityOptions = [
  { label: "Low",    value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High",   value: "high" },
]

// ─── Notifications ────────────────────────────────────────────────────────────
// Used by: Notifications.jsx — type badge styles and filter tab config

// Keyed by the API notification `type` (lowercase).
export const notificationTypeConfig = {
  message:      { label: "Message",      cls: "bg-[#145E94]/10 text-[#145E94] ring-[#145E94]/20" },
  booking:      { label: "Booking",      cls: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  listing:      { label: "Listing",      cls: "bg-amber-50 text-amber-700 ring-amber-200" },
  verification: { label: "Verification", cls: "bg-purple-50 text-purple-600 ring-purple-200" },
  user:         { label: "User",         cls: "bg-blue-50 text-blue-600 ring-blue-200" },
  flagged:      { label: "Flagged",      cls: "bg-red-50 text-red-600 ring-red-200" },
  inquiry:      { label: "Inquiry",      cls: "bg-teal-50 text-teal-700 ring-teal-200" },
  system:       { label: "System",       cls: "bg-slate-100 text-slate-600 ring-slate-200" },
}

export const notificationFilters = [
  { label: "All",    value: "all" },
  { label: "Unread", value: "Unread" },
]

// ─── Dashboard ────────────────────────────────────────────────────────────────
// Used by: Dashboard.jsx — maps icon name strings from dashboard.json to Lucide components

// Shared icon map — used by Dashboard.jsx and Bookings.jsx to resolve
// icon name strings from JSON into Lucide component references.

export const dashboardIconMap = {
  AlertTriangle,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  Scissors,
  TrendingDown,
  TrendingUp,
  Users,
  XCircle,
}
