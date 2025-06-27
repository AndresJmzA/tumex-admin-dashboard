
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { TumexSidebar } from "@/components/TumexSidebar"
import { Menu, Bell, Search, User } from "lucide-react"

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <TumexSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Top Header */}
          <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="lg:hidden p-2 hover:bg-gray-100 rounded-tumex-button">
                <Menu className="h-5 w-5" />
              </SidebarTrigger>
              
              {/* Search Bar */}
              <div className="hidden md:flex items-center bg-gray-100 rounded-tumex-button px-4 py-2 w-80">
                <Search className="h-4 w-4 text-gray-500 mr-2" />
                <input 
                  type="text" 
                  placeholder="Search equipment, orders, suppliers..."
                  className="bg-transparent border-none outline-none text-sm flex-1"
                />
              </div>
            </div>

            {/* Right Header Actions */}
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-gray-100 rounded-tumex-button relative">
                <Bell className="h-5 w-5 text-gray-600" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  3
                </span>
              </button>
              
              <button className="p-2 hover:bg-gray-100 rounded-tumex-button">
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
