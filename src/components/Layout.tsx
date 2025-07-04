import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TumexSidebar } from "@/components/TumexSidebar";
import { Menu, Bell, Search, User } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-gray-50 via-blue-50 to-cyan-50 overflow-x-hidden">
        <TumexSidebar />
        
        <div className="flex-1 flex flex-col overflow-x-hidden">
          {/* Encabezado Superior */}
          <header className="h-14 sm:h-16 bg-white/80 backdrop-blur-md border-b border-white/20 flex items-center justify-between px-3 sm:px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="lg:hidden p-2 hover:bg-white/60 rounded-tumex-button">
                <Menu className="h-5 w-5" />
              </SidebarTrigger>
            </div>

            {/* Acciones del Encabezado Derecho */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button className="p-2 hover:bg-white/60 rounded-tumex-button relative backdrop-blur-sm">
                <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center">
                  3
                </span>
              </button>
              
              <button className="p-2 hover:bg-white/60 rounded-tumex-button backdrop-blur-sm">
                <User className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
              </button>
            </div>
          </header>

          {/* Contenido Principal */}
          <main className="flex-1 p-2 sm:p-3 lg:p-6 overflow-x-hidden">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
