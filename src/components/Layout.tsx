
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { TumexSidebar } from "@/components/TumexSidebar"
import { Menu, Bell, Search, User } from "lucide-react"

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-gray-50 via-blue-50 to-cyan-50">
        <TumexSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Top Header */}
          <header className="h-16 bg-white/80 backdrop-blur-md border-b border-white/20 flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="lg:hidden p-2 hover:bg-white/60 rounded-tumex-button">
                <Menu className="h-5 w-5" />
              </SidebarTrigger>
              
              {/* Search Bar */}
              <div className="hidden md:flex items-center bg-white/60 backdrop-blur-sm rounded-tumex-button px-4 py-2 w-80 border border-white/30">
                <Search className="h-4 w-4 text-gray-500 mr-2" />
                <input 
                  type="text" 
                  placeholder="Search equipment, orders, suppliers..."
                  className="bg-transparent border-none outline-none text-sm flex-1 placeholder:text-gray-500"
                />
              </div>
            </div>

            {/* Right Header Actions */}
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-white/60 rounded-tumex-button relative backdrop-blur-sm">
                <Bell className="h-5 w-5 text-gray-600" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  3
                </span>
              </button>
              
              <button className="p-2 hover:bg-white/60 rounded-tumex-button backdrop-blur-sm">
                <User className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
