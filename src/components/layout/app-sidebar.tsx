"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { LayoutDashboard, Package, TrendingUp, Zap, BarChart3, Bell, SlidersHorizontal, Settings, LogOut } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useStore } from "@/store/useStore"

const items = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Live Inventory", url: "/inventory", icon: Package },
  { title: "Forecasts", url: "/forecasts", icon: TrendingUp },
  { title: "Optimizations", url: "/optimizations", icon: Zap },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Alerts", url: "/alerts", icon: Bell },
  { title: "Simulator", url: "/simulator", icon: SlidersHorizontal },
  { title: "Settings", url: "/settings", icon: Settings },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const logout = useStore(state => state.logout)

  const handleLogout = () => {
    document.cookie = 'zaiko_auth=; Max-Age=0; path=/';
    logout();
    router.push('/login');
  }

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xl font-bold tracking-tight text-primary mb-4 px-2 mt-4">
            zAIko
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton isActive={pathname === item.url}>
                    <Link href={item.url} className="flex items-center gap-2 w-full">
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem className="mt-4">
                <SidebarMenuButton onClick={handleLogout} className="text-destructive hover:text-destructive">
                  <LogOut />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
