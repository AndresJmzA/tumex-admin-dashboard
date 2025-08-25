import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DynamicSidebar } from "@/components/DynamicSidebar";
import { Menu, Bell, Search, User, LogIn, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { NotificationCenter } from "@/components/NotificationCenter";
import { useNotifications } from "@/hooks/useNotifications";
import { UserSwitcher } from "@/components/UserSwitcher";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const { unreadCount } = useNotifications();
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-gray-50 via-blue-50 to-cyan-50 overflow-x-hidden">
        <DynamicSidebar />
        
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
              <button 
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-tumex-primary-600 hover:bg-tumex-primary-50 rounded-lg transition-colors"
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Login Page</span>
              </button>
              
              {/* User Switcher - Solo mostrar si hay usuario autenticado */}
              {user && (
                <UserSwitcher />
              )}
              
              {user && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 hidden sm:inline">
                    {user.email}
                  </span>
                  <button 
                    onClick={logout}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </div>
              )}
              
              <button 
                onClick={() => setIsNotificationCenterOpen(true)}
                className="p-2 hover:bg-white/60 rounded-tumex-button relative backdrop-blur-sm"
              >
                <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center font-medium">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
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

      {/* Notification Center */}
      <NotificationCenter
        isOpen={isNotificationCenterOpen}
        onClose={() => setIsNotificationCenterOpen(false)}
        onNotificationClick={(notification) => {
          console.log('Notification clicked:', notification);
          // Aquí se manejaría la navegación según el tipo de notificación
          if (notification.actions && notification.actions.length > 0) {
            const firstAction = notification.actions[0];
            if (firstAction.url) {
              navigate(firstAction.url);
            }
          }
        }}
      />
    </SidebarProvider>
  );
}
