import React, { useEffect, useMemo, useState } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, CloudFog } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getSocket } from '@/hooks/webSocket';
import { useNavigate } from 'react-router';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const navigate = useNavigate();

  const socket = getSocket();
  const handleCheckNotification = (data: any) => {
    setUnreadCount(data?.data ? data?.data : data?.unreadNotification);
  };

  useEffect(() => {
    console.log("🚀 ~ MainLayout ~ socket:", socket)
    if (socket) {
      const handleConnect = () => {
        console.log("🚀 ~ MainLayout ~ handleConnect ~ socket:", socket)
        socket.emit("check-notification", {});
      };
      
      socket.on("connect", handleConnect);
      socket.on("check-notification", handleCheckNotification);

      if (socket.connected) {
        handleConnect();
      }
      return () => {
        socket.off("connect", handleConnect);
        socket.off("check-notification", handleCheckNotification);
      };
    } else {
      console.error("Socket not available");
    }
  }, [socket?.id]);
  if (!user) return null;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          {/* Top Header */}
          <header className="sticky top-0 z-50 h-[4.4rem] border-b border-border bg-card shadow-sm flex items-center justify-between px-6">
            <div className="flex items-center space-x-4">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative" aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`} onClick={() =>
                { 
                  socket.emit("check-notification", {});
                  navigate("/notifications");
                  }}>
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[1rem] h-5 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] leading-5 text-center font-semibold">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Button>

              {/* User Avatar */}
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {user.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user?.restaurantId?.name || user?.email}</p>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto p-6 bg-background">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};