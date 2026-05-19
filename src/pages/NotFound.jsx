import { useNavigate } from "react-router-dom"
import { Home, Scissors } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted/40 px-4 text-center">
      {/* Brand icon */}
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#145E94] text-white shadow-lg">
        <Scissors className="h-8 w-8" />
      </div>

      {/* 404 heading */}
      <h1 className="text-8xl font-extrabold tracking-tight text-[#145E94]">404</h1>
      <h2 className="mt-2 text-xl font-semibold text-foreground">Page Not Found</h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Looks like this page took the day off. The page you're looking for doesn't exist or has been moved.
      </p>

      {/* Actions */}
      <div className="mt-8 flex items-center gap-3">
        <Button
          onClick={() => navigate(-1)}
          variant="outline"
          className="gap-2"
        >
          Go Back
        </Button>
        <Button
          onClick={() => navigate("/dashboard")}
          className="gap-2 bg-[#145E94] text-white hover:bg-[#145E94]/90"
        >
          <Home className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
    </div>
  )
}
