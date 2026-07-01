import { useEffect, useState } from "react"
import { RotateCcw } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { parseApiError } from "@/lib/apiError"
import {
  useGetNotificationSettingsQuery,
  useUpdateNotificationSettingsMutation,
  useResetNotificationSettingsMutation,
} from "@/store/notification/notificationApiSlice"

// Known push categories with friendly copy. Any extra keys the API returns are
// still rendered (humanized) so new categories don't silently disappear.
const PUSH_SETTINGS = [
  {
    key: "newUserRegistration",
    label: "New User Registration",
    desc: "When a new user signs up on the platform.",
  },
  {
    key: "newSalonSubmission",
    label: "New Salon Submission",
    desc: "When a salon submits its profile for approval.",
  },
  {
    key: "newBooking",
    label: "New Booking",
    desc: "When a customer creates a new booking.",
  },
]

const humanize = (key) =>
  String(key)
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase())

const unwrapPush = (response) => {
  const settings = response?.data ?? response?.settings ?? response ?? {}
  return settings.push ?? settings.pushSettings ?? {}
}

export default function NotificationSettingsPanel() {
  const { data, isLoading, error, refetch } = useGetNotificationSettingsQuery()
  const [updateSettings, { isLoading: saving }] = useUpdateNotificationSettingsMutation()
  const [resetSettings, { isLoading: resetting }] = useResetNotificationSettingsMutation()

  // Local mirror of the push flags for snappy toggling.
  const [push, setPush] = useState({})
  // Which key is mid-flight (to disable just that row's switch).
  const [pendingKey, setPendingKey] = useState(null)

  useEffect(() => {
    if (data) setPush(unwrapPush(data))
  }, [data])

  // Merge known categories with any extras returned by the server.
  const rows = [
    ...PUSH_SETTINGS,
    ...Object.keys(push)
      .filter((k) => !PUSH_SETTINGS.some((s) => s.key === k))
      .map((k) => ({ key: k, label: humanize(k), desc: "" })),
  ]

  const isOn = (key) => push[key] !== false // default to enabled when unspecified
  const busy = saving || resetting

  async function persist(nextPush, { key, successMsg } = {}) {
    const prev = push
    setPush(nextPush)
    if (key) setPendingKey(key)
    try {
      await updateSettings({ push: nextPush }).unwrap()
      if (successMsg) toast.success(successMsg)
    } catch (err) {
      setPush(prev) // revert on failure
      toast.error(parseApiError(err).message)
    } finally {
      setPendingKey(null)
    }
  }

  function handleToggle(key, value) {
    persist({ ...push, [key]: value }, { key })
  }

  function handleEnableAll() {
    const next = rows.reduce((acc, r) => ({ ...acc, [r.key]: true }), { ...push })
    persist(next, { successMsg: "All notifications enabled" })
  }

  async function handleReset() {
    try {
      const result = await resetSettings().unwrap()
      const fresh = unwrapPush(result)
      if (Object.keys(fresh).length) setPush(fresh)
      else refetch()
      toast.success("Notification settings reset to defaults")
    } catch (err) {
      toast.error(parseApiError(err).message)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
        <div>
          <CardTitle className="text-base">Notification Settings</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose which push notifications you want to receive.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          disabled={busy || isLoading}
          className="h-8 text-xs text-muted-foreground"
        >
          <RotateCcw className={`mr-1.5 h-3.5 w-3.5 ${resetting ? "animate-spin" : ""}`} />
          Reset to defaults
        </Button>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-4">
                <div className="flex flex-1 flex-col gap-1.5">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-56" />
                </div>
                <Skeleton className="h-5 w-9 rounded-full" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <p className="text-sm text-muted-foreground">{parseApiError(error).message}</p>
            <Button variant="outline" size="sm" onClick={refetch}>
              Try again
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Push Notifications
              </p>
              <button
                onClick={handleEnableAll}
                disabled={busy}
                className="text-xs font-medium text-[#145E94] hover:underline disabled:opacity-50"
              >
                Enable all
              </button>
            </div>

            <div className="divide-y rounded-lg border">
              {rows.map((row) => (
                <div
                  key={row.key}
                  className="flex items-center justify-between gap-4 px-4 py-3"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{row.label}</span>
                    {row.desc && (
                      <span className="text-xs text-muted-foreground">{row.desc}</span>
                    )}
                  </div>
                  <Switch
                    checked={isOn(row.key)}
                    disabled={busy || pendingKey === row.key}
                    onCheckedChange={(value) => handleToggle(row.key, value)}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
