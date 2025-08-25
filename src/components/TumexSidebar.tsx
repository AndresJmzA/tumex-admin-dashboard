import { useState } from "react"
import { 
  LayoutDashboard, 
  FileText, 
  Calendar, 
  Users, 
  Boxes, 
  DollarSign, 
  BarChart3,
  Headphones, 
  Settings, 
  HelpCircle, 
  Heart, 
  Menu 
} from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"

// Nuevo orden y nombres de menú principal
const mainNavItems = [
  { title: "Panel Principal", url: "/", icon: LayoutDashboard },
  { title: "Órdenes", url: "/orders", icon: FileText },
  { title: "Calendario", url: "/calendar", icon: Calendar },
  { title: "Personal", url: "/personal", icon: Users },
  { title: "Inventario", url: "/inventory", icon: Boxes },
  { title: "Finanzas", url: "/finances", icon: DollarSign },
  { title: "Reportes", url: "/reports", icon: BarChart3 },
  { title: "Soporte al Cliente", url: "/support", icon: Headphones }
]

// Menú secundario solo para configuración y ayuda
const secondaryNavItems = [
  { title: "Configuración", url: "/settings", icon: Settings },
  { title: "Ayuda", url: "/help", icon: HelpCircle }
]

export function TumexSidebar() {
  const { state } = useSidebar()
  const location = useLocation()
  const currentPath = location.pathname
  const collapsed = state === "collapsed"

  const isActive = (path: string) => {
    if (path === "/") {
      return currentPath === "/"
    }
    return currentPath.startsWith(path)
  }

  const getNavCls = (path: string) => {
    const active = isActive(path)
    return active 
      ? "bg-tumex-primary-600/20 text-tumex-primary-700 font-medium hover:bg-tumex-primary-600/30 backdrop-blur-sm" 
      : "text-gray-700 hover:bg-white/60 hover:text-tumex-primary-600 backdrop-blur-sm"
  }

  return (
    <Sidebar
      className="bg-white/85 backdrop-blur-[20px] border-r border-white/20"
      collapsible="icon"
    >
      {/* Encabezado con Logo */}
      <SidebarHeader className="border-b border-white/20 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-tumex-primary-500 text-white shadow-lg">
            <Heart className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-lg font-bold text-gray-800">TUMex</h1>
              <p className="text-xs text-gray-600">Plataforma Médica</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4 data-[state=expanded]:pr-10">
        {/* Navegación Principal */}
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="text-gray-500 text-xs font-medium mb-2">
              MENÚ PRINCIPAL
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-10 tumex-button-radius">
                    <NavLink 
                      to={item.url} 
                      end={item.url === "/"}
                      className={`${getNavCls(item.url)} transition-all duration-200 border border-transparent hover:border-white/30`}
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {!collapsed && <span className="ml-3">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Navegación Secundaria */}
        <SidebarGroup className="mt-8">
          {!collapsed && (
            <SidebarGroupLabel className="text-gray-500 text-xs font-medium mb-2">
              GESTIONAR
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {secondaryNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-10 tumex-button-radius">
                    <NavLink 
                      to={item.url} 
                      className={`${getNavCls(item.url)} transition-all duration-200 border border-transparent hover:border-white/30`}
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {!collapsed && <span className="ml-3">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Pie de página */}
      <SidebarFooter className="border-t border-white/20 p-4">
      </SidebarFooter>
    </Sidebar>
  )
}
