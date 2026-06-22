import { useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import { Camera, Loader2, User } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/hooks/useAuth"
import useImageUpload from "@/hooks/useImageUpload"
import UserAvatar from "@/components/UserAvatar"
import {
  useUpdateProfileMutation,
  useLazyGetMeQuery,
} from "@/store/user/userApiSlice"
import { parseApiError } from "@/lib/apiError"
import { profileSchema } from "@/lib/validations/auth"
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
  const { uploadImage } = useImageUpload("profilePicture")
  const [updateProfile] = useUpdateProfileMutation()
  const [fetchMe] = useLazyGetMeQuery()

  const fileInputRef = useRef(null)
  const [profilePicture, setProfilePicture] = useState(user?.profilePicture ?? "")
  const [uploading, setUploading] = useState(false)

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
    formState: { errors: profileErrors, isSubmitting: profileSubmitting, dirtyFields },
  } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      name:  user?.name  ?? "",
      email: user?.email ?? "",
      phone: user?.contact ?? user?.phone ?? "",
    },
  })

  async function handlePhotoSelect(event) {
    const file = event.target.files?.[0]
    event.target.value = "" // allow re-selecting the same file
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file")
      return
    }

    const localUri = URL.createObjectURL(file)
    setUploading(true)
    try {
      const { fileUrl } = await uploadImage({
        uri: localUri,
        fileName: file.name,
        type: file.type,
        fileSize: file.size,
      })
      setProfilePicture(fileUrl)
      toast.success("Photo uploaded")
    } catch (err) {
      toast.error(parseApiError(err).message || "Failed to upload photo")
    } finally {
      setUploading(false)
      URL.revokeObjectURL(localUri)
    }
  }

  async function onProfileSubmit(data) {
    // Only send fields the user actually changed.
    const payload = {}
    if (dirtyFields.name) payload.name = data.name
    if (dirtyFields.phone) payload.contact = data.phone
    if (profilePicture !== (user?.profilePicture ?? "")) {
      payload.profilePicture = profilePicture
    }

    if (Object.keys(payload).length === 0) {
      toast.info("No changes to save")
      return
    }

    try {
      await updateProfile(payload).unwrap()

      // Refetch the canonical profile and sync it into the auth store so the
      // header/sidebar avatars and name update everywhere.
      const me = await fetchMe().unwrap()
      const freshUser = me?.data ?? me?.user ?? me
      if (freshUser && typeof freshUser === "object") {
        patchUser(freshUser)
        setProfilePicture(freshUser.profilePicture ?? profilePicture)
      }

      toast.success("Profile updated successfully")
    } catch (err) {
      toast.error(parseApiError(err).message || "Failed to update profile")
    }
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
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="group relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-[#145E94] text-base font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#145E94] focus:ring-offset-2"
                title="Change profile photo"
              >
                <UserAvatar
                  src={profilePicture}
                  className="h-full w-full"
                  fallback={<span>{initials}</span>}
                />

                {/* Hover overlay (camera) */}
                <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <Camera className="h-5 w-5 text-white" />
                </span>

                {/* Uploading overlay (always visible while in flight) */}
                {uploading && (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <Loader2 className="h-5 w-5 animate-spin text-white" />
                  </span>
                )}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoSelect}
              />
            </div>

            <div className="leading-tight">
              <p className="font-semibold">{user?.name ?? "Admin User"}</p>
              <p className="text-xs text-muted-foreground">Super Admin</p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="mt-1 text-xs font-medium text-[#145E94] hover:underline disabled:opacity-60"
              >
                {uploading ? "Uploading…" : "Change photo"}
              </button>
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
              <Input
                id="email"
                type="email"
                disabled
                className="cursor-not-allowed bg-muted text-muted-foreground"
                {...regProfile("email")}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Email can&apos;t be changed.
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" type="tel" {...regProfile("phone")} />
              <FieldError message={profileErrors.phone?.message} />
            </div>

            <Button
              type="submit"
              disabled={profileSubmitting || uploading}
              className="w-fit bg-[#145E94] text-white hover:bg-[#145E94]/90"
            >
              {profileSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {profileSubmitting ? "Saving…" : "Update Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>

    </div>
  )
}
