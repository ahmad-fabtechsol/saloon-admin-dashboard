import { useEffect } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { useApiError } from "@/hooks/useApiError"
import { useResetPasswordMutation } from "@/store/auth/authApiSlice"
import { applyFieldErrors } from "@/lib/apiError"
import ApiErrorModal from "@/components/ApiErrorModal"
import { resetPasswordSchema } from "@/lib/validations/auth"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { PasswordInput } from "@/components/ui/password-input"
import { Label } from "@/components/ui/label"
import BrandLogo from "@/components/BrandLogo"

export default function ResetPassword() {
  const { error: apiError, title: apiErrorTitle, showError, clearError } = useApiError()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token")
  const [resetPassword, { isLoading }] = useResetPasswordMutation()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(resetPasswordSchema),
  })

  // A missing token means the link is malformed/expired — surface it once.
  useEffect(() => {
    if (!token) {
      showError(
        "This password reset link is invalid or has expired. Please request a new one.",
        "Invalid reset link"
      )
    }
  }, [token, showError])

  async function onSubmit({ password }) {
    try {
      await resetPassword({ token, password }).unwrap()
      toast.success("Your password has been reset. Please sign in.")
      navigate("/login")
    } catch (err) {
      const mapped = applyFieldErrors(err, setError, ["password"])
      if (!mapped) showError(err)
    }
  }

  return (
    <>
    <div className="flex min-h-svh items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2">
          <BrandLogo imageClassName="h-14 w-14" />
          <h1 className="text-xl font-semibold">SalonPanda</h1>
          <p className="text-sm text-muted-foreground">Management Panel</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Reset password</CardTitle>
            <CardDescription>Enter and confirm your new password below.</CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password">New password</Label>
                <PasswordInput
                  id="password"
                  placeholder="••••••••"
                  aria-invalid={!!errors.password}
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="confirmPassword">Confirm new password</Label>
                <PasswordInput
                  id="confirmPassword"
                  placeholder="••••••••"
                  aria-invalid={!!errors.confirmPassword}
                  {...register("confirmPassword")}
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-destructive">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </CardContent>

            <CardFooter className="mt-2 flex flex-col gap-3">
              <Button
                type="submit"
                className="w-full bg-[#145E94] hover:bg-[#145E94]/90 text-white"
                disabled={isLoading || !token}
              >
                {isLoading ? "Resetting…" : "Reset password"}
              </Button>
              <Link
                to="/login"
                className="flex items-center justify-center text-sm font-medium text-[#145E94] underline-offset-4 hover:underline"
              >
                <ArrowLeft className="mr-1.5 h-4 w-4" />
                Back to sign in
              </Link>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>

      <ApiErrorModal
        error={apiError}
        title={apiErrorTitle}
        onClose={clearError}
      />
    </>
  )
}
