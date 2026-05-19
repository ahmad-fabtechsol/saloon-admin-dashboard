import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import { Lock, User } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/hooks/useAuth"
import { profileSchema, changePasswordSchema } from "@/lib/validations/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

function FieldError({ message }) {
  if (!message) return null
  return <p className="mt-1 text-xs text-destructive">{message}</p>
}

export default function Settings() {
  const { user, patchUser } = useAuth()

  const initials = user?.name
    ?.split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "AU"

  // ── Profile form ──────────────────────────────────────────────────────────
  const {
    register: regProfile,
    handleSubmit: handleProfile,
    formState: { errors: profileErrors, isSubmitting: profileSubmitting },
  } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      name:  user?.name  ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? "0311-1234567",
    },
  })

  function onProfileSubmit(data) {
    patchUser(data)
    toast.success("Profile updated successfully")
  }

  // ── Password form ─────────────────────────────────────────────────────────
  const {
    register: regPassword,
    handleSubmit: handlePassword,
    reset: resetPassword,
    formState: { errors: passwordErrors, isSubmitting: passwordSubmitting },
  } = useForm({ resolver: yupResolver(changePasswordSchema) })

  function onPasswordSubmit(data) {
    console.log("Password changed", data)
    resetPassword()
    toast.success("Password changed successfully")
  }

  return (
    <div className="flex w-full max-w-2xl flex-col gap-5">

      {/* ── My Profile ── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <User className="h-4 w-4" />
            My Profile
          </CardTitle>
        </CardHeader>

        <Separator />

        <CardContent className="pt-5 flex flex-col gap-5">
          {/* Avatar + name */}
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#145E94] text-sm font-bold text-white">
              {initials}
            </div>
            <div className="leading-tight">
              <p className="font-semibold">{user?.name ?? "Admin User"}</p>
              <p className="text-xs text-muted-foreground">Super Admin</p>
            </div>
          </div>

          <form onSubmit={handleProfile(onProfileSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" {...regProfile("name")} />
              <FieldError message={profileErrors.name?.message} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...regProfile("email")} />
              <FieldError message={profileErrors.email?.message} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" type="tel" {...regProfile("phone")} />
              <FieldError message={profileErrors.phone?.message} />
            </div>

            <Button
              type="submit"
              disabled={profileSubmitting}
              className="w-fit bg-[#145E94] text-white hover:bg-[#145E94]/90"
            >
              {profileSubmitting ? "Saving…" : "Update Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* ── Change Password ── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Lock className="h-4 w-4" />
            Change Password
          </CardTitle>
        </CardHeader>

        <Separator />

        <CardContent className="pt-5">
          <form onSubmit={handlePassword(onPasswordSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input id="currentPassword" type="password" {...regPassword("currentPassword")} />
              <FieldError message={passwordErrors.currentPassword?.message} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="newPassword">New Password</Label>
              <Input id="newPassword" type="password" {...regPassword("newPassword")} />
              <FieldError message={passwordErrors.newPassword?.message} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input id="confirmPassword" type="password" {...regPassword("confirmPassword")} />
              <FieldError message={passwordErrors.confirmPassword?.message} />
            </div>

            <Button
              type="submit"
              disabled={passwordSubmitting}
              className="w-fit bg-[#145E94] text-white hover:bg-[#145E94]/90"
            >
              {passwordSubmitting ? "Saving…" : "Change Password"}
            </Button>
          </form>
        </CardContent>
      </Card>

    </div>
  )
}
