import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import { Scissors } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/hooks/useAuth"
import { useErrorModal } from "@/context/ErrorModalProvider"
import { useLoginMutation } from "@/store/auth/authApiSlice"
import { applyApiError } from "@/lib/apiError"
import { loginSchema } from "@/lib/validations/auth"
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
import { PasswordInput } from "@/components/ui/password-input"
import { Label } from "@/components/ui/label"

export default function Login() {
  const { setSession } = useAuth()
  const { showError } = useErrorModal()
  const navigate = useNavigate()
  const [login, { isLoading }] = useLoginMutation()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
  })

  async function onSubmit(values) {
    try {
      const data = await login(values).unwrap()
      setSession({
        user: data.admin,
        token: data.tokens?.access?.token,
        refreshToken: data.tokens?.refresh?.token,
      })
      toast.success(`Welcome back${data.admin?.name ? `, ${data.admin.name}` : ""}!`)
      navigate("/dashboard")
    } catch (error) {
      applyApiError(error, {
        setError,
        showError,
        fields: ["email", "password"],
      })
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar text-sidebar-foreground">
            <Scissors className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-semibold">SalonPanda</h1>
          <p className="text-sm text-muted-foreground">Management Panel</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>Sign in to your account to continue</CardDescription>
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

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password">Password</Label>
                <PasswordInput
                  id="password"
                  placeholder="••••••••"
                  aria-invalid={!!errors.password}
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password.message}</p>
                )}
                <Link
                  to="/forgot-password"
                  className="self-end text-xs font-medium text-[#145E94] underline-offset-4 hover:underline mb-4"
                >
                  Forgot password?
                </Link>
              </div>
            </CardContent>

            <CardFooter className="mt-2">
              <Button type="submit" className="w-full bg-[#145E94] hover:bg-[#145E94]/90 text-white" disabled={isLoading}>
                {isLoading ? "Signing in…" : "Sign in"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
