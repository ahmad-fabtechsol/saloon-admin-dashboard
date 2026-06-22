import * as React from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import {
  BarChart2,
  Bell,
  CalendarDays,
  Home,
  LogOut,
  MessageSquare,
  Scissors,
  Settings2,
  Users,
} from "lucide-react"

import { useAuth } from "@/hooks/useAuth"
import ConfirmDialog from "@/components/ConfirmDialog"
import UserAvatar from "@/components/UserAvatar"
import whiteLogo from "@/assets/dark-logo.png"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

const navMain = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Salons", url: "/salons", icon: Scissors },
  { title: "Customers", url: "/customers", icon: Users },
  { title: "Bookings", url: "/bookings", icon: CalendarDays },
]

const navSystem = [
  { title: "Reports",       url: "/reports",       icon: BarChart2 },
  { title: "Feedback",      url: "/feedback",      icon: MessageSquare },
  { title: "Notifications", url: "/notifications", icon: Bell },
  { title: "Settings",      url: "/settings",      icon: Settings2 },
]

export function AppSidebar({ ...props }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [confirmLogout, setConfirmLogout] = React.useState(false)

  function handleLogout() {
    setConfirmLogout(false)
    logout()
    toast.success("Signed out successfully")
    navigate("/login")
  }

  return (
    <Sidebar {...props}>
      <SidebarHeader className="px-4 py-4">
        <Link
          to="/dashboard"
          className="flex items-center gap-3 rounded-md focus:outline-none focus:ring-2 focus:ring-sidebar-ring"
          title="Go to dashboard"
        >
          <img
            src={whiteLogo}
            alt="SalonPanda"
            className="h-9 w-9 object-contain"
          />
          <div className="flex flex-col leading-none">
            <span className="font-semibold">SalonPanda</span>
            <span className="text-xs text-sidebar-foreground/60">Management Panel</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                  {item.badge && (
                    <SidebarMenuBadge className="rounded-full bg-[#145E94] text-white">
                      {item.badge}
                    </SidebarMenuBadge>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navSystem.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-4 py-4">
        <div className="flex items-center gap-3">
          <UserAvatar
            src={user?.profilePicture}
            className="h-8 w-8 shrink-0 rounded-full"
            fallback={
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-xs font-semibold text-sidebar-accent-foreground">
                {user?.name?.charAt(0).toUpperCase() ?? "A"}
              </div>
            }
          />
          <div className="flex min-w-0 flex-col leading-none">
            <span className="truncate text-sm font-medium">{user?.name ?? "Admin User"}</span>
            <span className="truncate text-xs text-sidebar-foreground/60">{user?.email ?? ""}</span>
          </div>
          <button
            onClick={() => setConfirmLogout(true)}
            className="ml-auto text-sidebar-foreground/60 hover:text-sidebar-foreground"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </SidebarFooter>

      <SidebarRail />

      <ConfirmDialog
        open={confirmLogout}
        title="Sign out?"
        description="You'll need to log in again to access the dashboard."
        confirmLabel="Sign out"
        cancelLabel="Cancel"
        confirmClass="bg-red-600 text-white hover:bg-red-600/90"
        onConfirm={handleLogout}
        onCancel={() => setConfirmLogout(false)}
      />
    </Sidebar>
  )
}
