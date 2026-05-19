import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { CheckCircle2, ChevronLeft, MapPin, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import salonsData from "@/data/salons.json"

const { salonDetails, verificationChecklist, rejectionReasons } = salonsData

function InfoRow({ label, children }) {
  return (
    <div className="grid grid-cols-[140px_1fr] items-start gap-4 border-b py-3 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{children}</span>
    </div>
  )
}

function SectionLabel({ children }) {
  return (
    <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </p>
  )
}

export default function SalonDetail() {
  const navigate = useNavigate()
  const { id } = useParams()

  const salon = salonDetails[id]

  const [checks, setChecks] = useState(
    Object.fromEntries(verificationChecklist.map((c) => [c.id, c.defaultChecked]))
  )
  const [rejectionReason, setRejectionReason] = useState("")

  function toggle(key) {
    setChecks((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  if (!salon) {
    return (
      <div className="flex flex-col gap-4">
        <button
          onClick={() => navigate("/salons")}
          className="flex w-fit items-center gap-1 text-sm text-[#145E94] hover:underline"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Salons
        </button>
        <p className="text-muted-foreground">Salon not found.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Back + title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/salons")}
          className="flex items-center gap-1 text-sm text-[#145E94] hover:underline"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Salons
        </button>
        <Separator orientation="vertical" className="h-4" />
        <h1 className="text-lg font-semibold">{salon.name}</h1>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        {/* ── Left panel ── */}
        <Card>
          <CardContent className="p-6 flex flex-col gap-6">

            {/* Salon Information */}
            <div>
              <SectionLabel>Salon Information</SectionLabel>
              <div className="divide-y rounded-lg border px-4">
                <InfoRow label="Salon Name">{salon.name}</InfoRow>
                <InfoRow label="Type">{salon.type}</InfoRow>
                <InfoRow label="Address">{salon.address}</InfoRow>
                <InfoRow label="Landmark">{salon.landmark}</InfoRow>
                <InfoRow label="Phone">{salon.phone}</InfoRow>
                <InfoRow label="GPS">
                  <span className="flex items-center gap-2">
                    {salon.gps}
                    <a
                      href={`https://maps.google.com/?q=${salon.gps}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-md border border-[#145E94]/30 bg-[#145E94]/10 px-2 py-0.5 text-xs text-[#145E94] hover:bg-[#145E94]/20"
                    >
                      <MapPin className="h-3 w-3" />
                      Maps
                    </a>
                  </span>
                </InfoRow>
              </div>
            </div>

            {/* Owner Information */}
            <div>
              <SectionLabel>Owner Information</SectionLabel>
              <div className="divide-y rounded-lg border px-4">
                <InfoRow label="Name">{salon.owner.name}</InfoRow>
                <InfoRow label="Phone">
                  <span className="flex items-center gap-2">
                    {salon.owner.phone}
                    {salon.owner.otpVerified && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-600 ring-1 ring-emerald-200">
                        <CheckCircle2 className="h-3 w-3" />
                        OTP Verified
                      </span>
                    )}
                  </span>
                </InfoRow>
                <InfoRow label="Email">{salon.owner.email}</InfoRow>
                <InfoRow label="Submitted">{salon.owner.submitted}</InfoRow>
              </div>
            </div>

            {/* Salon Photos */}
            <div>
              <SectionLabel>Salon Photos</SectionLabel>
              <div className="flex gap-3">
                {salon.photos.map((emoji, i) => (
                  <div
                    key={i}
                    className="flex h-20 w-20 items-center justify-center rounded-lg border bg-muted text-3xl"
                  >
                    {emoji}
                  </div>
                ))}
              </div>
            </div>

            {/* Services */}
            <div>
              <SectionLabel>Services</SectionLabel>
              <div className="divide-y rounded-lg border px-4">
                {salon.services.map((s) => (
                  <InfoRow key={s.name} label={s.name}>
                    <span className="font-semibold">{s.price}</span>
                  </InfoRow>
                ))}
              </div>
            </div>

          </CardContent>
        </Card>

        {/* ── Right panel ── */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardContent className="p-5 flex flex-col gap-5">

              {/* Verification Checklist */}
              <div>
                <SectionLabel>Verification Checklist</SectionLabel>
                <div className="flex flex-col gap-2.5">
                  {verificationChecklist.map((item) => (
                    <div key={item.id} className="flex items-center gap-2.5">
                      <Checkbox
                        id={item.id}
                        checked={checks[item.id]}
                        onCheckedChange={() => toggle(item.id)}
                        className="data-[state=checked]:bg-[#145E94] data-[state=checked]:border-[#145E94]"
                      />
                      <Label
                        htmlFor={item.id}
                        className="cursor-pointer text-sm font-normal"
                      >
                        {item.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Admin Actions */}
              <div>
                <SectionLabel>Admin Action</SectionLabel>
                <div className="flex flex-col gap-2">
                  <Button
                    className="w-full bg-[#145E94] hover:bg-[#145E94]/90 text-white"
                    onClick={() => console.log("Approved", id)}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Approve Salon
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => console.log("Rejected", id)}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Rejection Reason */}
              <div>
                <SectionLabel>Rejection Reason</SectionLabel>
                <Select value={rejectionReason} onValueChange={setRejectionReason}>
                  <SelectTrigger className="w-full text-sm">
                    <SelectValue placeholder="Select reason..." />
                  </SelectTrigger>
                  <SelectContent>
                    {rejectionReasons.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
