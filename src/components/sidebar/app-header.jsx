import { useState } from "react"
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import { Bell, LogOut, User } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/hooks/useAuth"
import ConfirmDialog from "@/components/ConfirmDialog"
import UserAvatar from "@/components/UserAvatar"
import { AppSidebar } from "@/components/sidebar/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import ThemeToggle from "@/components/ThemeToggle"

const routeLabels = {
  "/dashboard": ["Home", "Dashboard"],
  "/salons": ["Home", "Salons"],
  "/customers": ["Home", "Customers"],
  "/bookings": ["Home", "Bookings"],
  "/reports": ["System", "Reports"],
  "/feedback": ["System", "Feedback"],
  "/settings": ["System", "Settings"],
}

const notifications = [
  {
    id: 1,
    title: "New booking received",
    desc: "Appointment #1042 confirmed",
    time: "2m ago",
    unread: true,
  },
  {
    id: 2,
    title: "Salon profile updated",
    desc: "Elite Cuts updated their info",
    time: "1h ago",
    unread: true,
  },
  {
    id: 3,
    title: "New customer registered",
    desc: "Sara Ahmed joined the platform",
    time: "3h ago",
    unread: false,
  },
]

export default function AppHeader() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [section, page] = routeLabels[pathname] ?? ["Home", "Page"]
  const [confirmLogout, setConfirmLogout] = useState(false)

  const unreadCount = notifications.filter((n) => n.unread).length
  const initials =
    user?.name
      ?.split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "AU"

  function handleLogout() {
    logout()
    toast.success("Signed out successfully")
    navigate("/login")
  }

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          {/* ── Sticky header ── */}
          <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />

            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden text-muted-foreground md:block">
                  {section}
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{page}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <div className="ml-auto flex items-center gap-1">
              {/* Theme toggle */}
              <ThemeToggle />

              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-10 w-10 rounded-full"
                  >
                    <Bell className="h-6 w-6" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-[#145E94] px-1 text-[10px] font-semibold text-white">
                        {unreadCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                      <span className="rounded-full bg-orange-500/10 px-2 py-0.5 text-xs font-medium text-orange-600">
                        {unreadCount} new
                      </span>
                    )}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {notifications.map((n) => (
                    <DropdownMenuItem
                      key={n.id}
                      className="flex flex-col items-start gap-0.5 px-3 py-2.5"
                    >
                      <div className="flex w-full items-center gap-2">
                        {n.unread && (
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" />
                        )}
                        <span
                          className={`flex-1 text-sm font-medium ${!n.unread && "pl-3.5"}`}
                        >
                          {n.title}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {n.time}
                        </span>
                      </div>
                      <p className="pl-3.5 text-xs text-muted-foreground">
                        {n.desc}
                      </p>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="justify-center text-xs text-muted-foreground">
                    View all notifications
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Profile */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <UserAvatar
                      src={user?.profilePicture}
                      className="h-7 w-7 rounded-full"
                      fallback={
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sidebar text-xs font-semibold text-sidebar-foreground">
                          {initials}
                        </span>
                      }
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuLabel className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium">
                      {user?.name ?? "Admin User"}
                    </span>
                    <span className="text-xs font-normal text-muted-foreground">
                      {user?.email ?? ""}
                    </span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/settings")}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setConfirmLogout(true)}
                    className="text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* ── Page content renders here ── */}
          <div className="flex flex-1 flex-col gap-4 p-6">
            <Outlet />
          </div>
        </SidebarInset>

        <ConfirmDialog
          open={confirmLogout}
          title="Sign out?"
          description="You'll need to log in again to access the dashboard."
          confirmLabel="Sign out"
          cancelLabel="Cancel"
          confirmClass="bg-red-600 text-white hover:bg-red-600/90"
          onConfirm={() => {
            setConfirmLogout(false)
            handleLogout()
          }}
          onCancel={() => setConfirmLogout(false)}
        />
      </SidebarProvider>
    </TooltipProvider>
  )
}
