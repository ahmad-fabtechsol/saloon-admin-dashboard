import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { FiEye, FiTrash2 } from "react-icons/fi"
import { MessageSquare, AlertTriangle, Clock, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import DynamicTable from "@/components/DynamicTable"
import ConfirmDialog from "@/components/ConfirmDialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { valueColors } from "@/lib/tableUtils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { feedbackFilters, feedbackTypeOptions } from "@/lib/tableUtils"
import { feedbackColumns } from "@/lib/tableColumns"
import { parseApiError } from "@/lib/apiError"
import {
  useGetFeedbacksQuery,
  useGetFeedbackStatsQuery,
  useDeleteFeedbackMutation,
} from "@/store/feedback/feedbackApiSlice"

const PAGE_SIZE = 10

const formatDate = (value) => {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
}

const unwrapFeedbacks = (response) =>
  response?.results ??
  response?.data?.results ??
  response?.data?.feedbacks ??
  response?.feedbacks ??
  []

const getPaginationValue = (response, key) =>
  response?.[key] ??
  response?.data?.[key] ??
  response?.pagination?.[key] ??
  response?.data?.pagination?.[key]

const pickStat = (source, keys) => {
  for (const key of keys) {
    if (source?.[key] !== undefined && source?.[key] !== null) return source[key]
  }
  return 0
}

function toRow(feedback) {
  const user = feedback.user ?? feedback.customer ?? feedback.submittedBy ?? {}
  return {
    id: feedback._id ?? feedback.id,
    subject: feedback.subject ?? feedback.title ?? "Untitled",
    message: feedback.message ?? feedback.description ?? feedback.comment ?? "",
    type: feedback.type ?? "other",
    user: user.name ?? feedback.userName ?? feedback.name ?? "—",
    priority: feedback.priority ?? "",
    created: formatDate(feedback.createdAt ?? feedback.submittedAt),
    status: feedback.status ?? "open",
  }
}

export default function Feedback() {
  const navigate = useNavigate()
  const [status, setStatus] = useState("all")
  const [type, setType] = useState("all")
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(search.trim())
      setPage(1)
    }, 350)
    return () => window.clearTimeout(timeout)
  }, [search])

  const { data: statsData, isLoading: statsLoading } = useGetFeedbackStatsQuery()
  const { data, isFetching, error, refetch } = useGetFeedbacksQuery({
    page,
    limit: PAGE_SIZE,
    status: status === "all" ? undefined : status,
    type: type === "all" ? undefined : type,
    search: debouncedSearch || undefined,
  })

  const [deleteFeedback, { isLoading: deleting }] = useDeleteFeedbackMutation()
  // Row pending deletion confirmation: row | null
  const [pendingDelete, setPendingDelete] = useState(null)

  const rows = useMemo(() => unwrapFeedbacks(data).map(toRow), [data])

  const stats = useMemo(() => {
    const source = statsData?.data ?? statsData?.stats ?? statsData ?? {}
    return [
      {
        title: "Total Feedback",
        icon: MessageSquare,
        value: pickStat(source, ["total", "totalFeedback", "totalFeedbacks", "count"]),
      },
      {
        title: "Open",
        icon: AlertTriangle,
        valueColor: "orange",
        value: pickStat(source, ["open", "openCount"]),
      },
      {
        title: "In Review",
        icon: Clock,
        valueColor: "teal",
        value: pickStat(source, ["inReview", "inReviewCount"]),
      },
      {
        title: "Resolved",
        icon: CheckCircle2,
        valueColor: "green",
        value: pickStat(source, ["resolved", "resolvedCount"]),
      },
    ]
  }, [statsData])

  const handleDelete = async () => {
    if (!pendingDelete) return
    try {
      await deleteFeedback(pendingDelete.id).unwrap()
      toast.success("Feedback deleted")
      setPendingDelete(null)
    } catch (err) {
      toast.error(parseApiError(err).message)
    }
  }

  const actions = [
    {
      label: "View details",
      icon: FiEye,
      color: "brand",
      onClick: (row) => navigate(`/feedback-details/${row.id}`),
    },
    {
      label: "Delete",
      icon: FiTrash2,
      color: "red",
      onClick: (row) => setPendingDelete(row),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* ── Stats ── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statsLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-9 w-9 rounded-lg" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))
          : stats.map((s) => {
              const Icon = s.icon
              return (
                <Card key={s.title}>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-md font-bold uppercase tracking-wide text-muted-foreground">
                      {s.title}
                    </CardTitle>
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar/10 text-sidebar">
                      <Icon className="h-4 w-4" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className={`text-3xl font-bold ${valueColors[s.valueColor ?? "default"]}`}>
                      {new Intl.NumberFormat("en-PK").format(Number(s.value) || 0)}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
      </div>

      {/* ── Table ── */}
      <DynamicTable
        title="All Feedback"
        searchPlaceholder="Search feedback..."
        searchKey={["subject", "message", "user"]}
        searchValue={search}
        onSearchChange={setSearch}
        headerExtra={
          <Select
            value={type}
            onValueChange={(value) => {
              setType(value)
              setPage(1)
            }}
          >
            <SelectTrigger className="h-8 w-40 text-xs">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              {feedbackTypeOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-xs">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
        filters={feedbackFilters}
        activeFilter={status}
        onFilterChange={(value) => {
          setStatus(value)
          setPage(1)
        }}
        showCounts={false}
        columns={feedbackColumns}
        data={rows}
        onRowClick={(row) => navigate(`/feedback-details/${row.id}`)}
        actions={actions}
        actionsVariant="menu"
        loading={isFetching}
        error={error ? parseApiError(error).message : null}
        onRetry={refetch}
        page={page}
        totalPages={getPaginationValue(data, "totalPages")}
        totalResults={getPaginationValue(data, "totalResults")}
        onPageChange={setPage}
      />

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete this feedback?"
        description={
          pendingDelete
            ? `"${pendingDelete.subject}" will be permanently deleted. This cannot be undone.`
            : ""
        }
        confirmClass="bg-red-600 text-white hover:bg-red-600/90"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  )
}
