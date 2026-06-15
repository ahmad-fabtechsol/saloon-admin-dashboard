import { useState } from "react"
import { Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import { ArrowLeft, MailCheck, Scissors } from "lucide-react"
import { toast } from "sonner"
import { useErrorModal } from "@/context/ErrorModalProvider"
import { useForgotPasswordMutation } from "@/store/auth/authApiSlice"
import { applyApiError } from "@/lib/apiError"
import { forgotPasswordSchema } from "@/lib/validations/auth"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ForgotPassword() {
  const { showError } = useErrorModal()
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation()
  const [sentTo, setSentTo] = useState(null)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(forgotPasswordSchema),
  })

  async function onSubmit({ email }) {
    try {
      await forgotPassword({ email }).unwrap()
      setSentTo(email)
      toast.success("Password reset link sent to your email")
    } catch (error) {
      applyApiError(error, { setError, showError, fields: ["email"] })
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar text-sidebar-foreground">
            <Scissors className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-semibold">Salon Admin</h1>
          <p className="text-sm text-muted-foreground">Management Panel</p>
        </div>

        <Card>
          {sentTo ? (
            <>
              <CardHeader>
                <div className="mx-auto mb-1 flex h-11 w-11 items-center justify-center rounded-full bg-[#145E94]/10 text-[#145E94]">
                  <MailCheck className="h-6 w-6" />
                </div>
                <CardTitle className="text-center">Check your inbox</CardTitle>
                <CardDescription className="text-center">
                  We&apos;ve sent a password reset link to{" "}
                  <span className="font-medium text-foreground">{sentTo}</span>. Follow the
                  link to set a new password.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/login">
                    <ArrowLeft className="mr-1.5 h-4 w-4" />
                    Back to sign in
                  </Link>
                </Button>
              </CardFooter>
            </>
          ) : (
            <>
              <CardHeader>
                <CardTitle>Forgot password?</CardTitle>
                <CardDescription>
                  Enter your email and we&apos;ll send you a link to reset your password.
                </CardDescription>
              </CardHeader>

              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <CardContent className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@salon.com"
                      aria-invalid={!!errors.email}
                      {...register("email")}
                    />
                    {errors.email && (
                      <p className="text-xs text-destructive">{errors.email.message}</p>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="mt-2 flex flex-col gap-3">
                  <Button
                    type="submit"
                    className="w-full bg-[#145E94] hover:bg-[#145E94]/90 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? "Sending…" : "Send reset link"}
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
            </>
          )}
        </Card>
      </div>
    </div>
  )
}
