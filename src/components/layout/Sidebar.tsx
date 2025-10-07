import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Building2,
  DollarSign,
  Users,
  UserCheck,
  PieChart,
  Bell,
  Settings,
  Truck,
  Tags,
  ShoppingBag,
  LogOut,
  FileText,
  Clock,
  ClipboardList,
  Clipboard,
} from "lucide-react";
import smallLogo from "../../asset/img/smallLogo.png";
import logo from "../../asset/img/logo.png";

// Navigation items based on role
const getNavigationItems = (role: string) => {
  const baseItems = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  ];

  if (role === "admin") {
    return [
      ...baseItems,
      { title: "Restaurants", url: "/restaurants", icon: Building2 },
      { title: "Finance Overview", url: "/finance", icon: PieChart },
      { title: "Managers", url: "/managers", icon: UserCheck },
      { title: "Staff Members", url: "/staff", icon: Users },
      // { title: 'Customers', url: '/customers', icon: UserPlus },
      { title: "Menu Items", url: "/items", icon: ClipboardList },
      { title: "Meal Plans", url: "/meals", icon: ShoppingBag },
      // { title: 'Daily Summary', url: '/daily-summary', icon: Calendar },
      { title: "Vendors", url: "/vendors", icon: Truck },
      { title: "Expense Categories", url: "/expense-categories", icon: Tags },
      { title: "Settings", url: "/settings", icon: Settings },
      { title: "Notifications", url: "/notifications", icon: Bell },
    ];
  }

  if (role === "manager") {
    return [
      ...baseItems,
      { title: "Income & Expense", url: "/finance", icon: DollarSign },
      { title: "Staff Management", url: "/staff", icon: Users },
      // { title: 'Customer Management', url: '/customers', icon: UserPlus },
      { title: "Menu Items", url: "/items", icon: ClipboardList },
      { title: "Meal Plans", url: "/meals", icon: ShoppingBag },
      // { title: 'Meal Plans', url: '/meals', icon: ShoppingBag },
      // { title: 'Daily Tiffin Summary', url: '/daily-summary', icon: Calendar },
      { title: "Vendor Management", url: "/vendors", icon: Truck },
      { title: "Inventory", url: "/inventory", icon: ClipboardList },
      { title: "Monthly Menu Plan", url: "/menu-plan", icon: FileText },
      { title: "Expense Categories", url: "/expense-categories", icon: Tags },
      { title: "Notifications", url: "/notifications", icon: Bell },
    ];
  }

  if (role === "staff") {
    return [
      // ...baseItems,
      { title: "Mark Attendance", url: "/dashboard", icon: Clock },
      { title: "Leave Requests", url: "/leave-requests", icon: FileText },
    ];
  }

  return baseItems;
};

export const AppSidebar = () => {
  const { user, logout } = useAuth();
  const { state } = useSidebar();
  const location = useLocation();
  const collapsed = state === "collapsed";
  if (!user) return null;

  const navigationItems = getNavigationItems(user.role);
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
      : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground";

  return (
    <Sidebar
      className={`${
        collapsed ? "w-16" : "w-64"
      } bg-gradient-sidebar border-sidebar-border`}
      collapsible="icon"
    >
      <SidebarHeader className="border-b border-sidebar-border pt-4 pb-0">
        <div className="flex items-center justify-center">
          {!collapsed ? (
            <div className="flex justify-center mb-3">
              <img
                src={logo}
                alt="Logo"
                className={collapsed ? "w-8" : "w-52"}
              />
            </div>
          ) : (
            <div className="flex justify-center mb-3">
              <img
                src={smallLogo}
                alt="Logo"
                className={collapsed ? "w-8" : "w-52"}
              />
            </div>
          )}
          {!collapsed && (
            <div>
              {/* {user.restaurantName && (
                <p className="text-xs text-sidebar-foreground">{user.restaurantName}</p>
              )} */}
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="flex-1 overflow-y-auto">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70 uppercase tracking-wider text-xs font-semibold">
            {user.role === "admin"
              ? "Admin Portal"
              : user.role === "manager"
              ? "Mangaer Portal"
              : "Staff Portal"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={`${getNavCls} ${
                        location.pathname === item.url
                          ? "!bg-accent !text-black text-accent-foreground"
                          : ""
                      }`}
                      title={collapsed ? item.title : undefined}
                    >
                      <item.icon
                        className={`h-4 w-4 ${collapsed ? "mx-auto" : "mr-3"}`}
                      />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              {user.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-primary-foreground truncate">
                {user.name}
              </p>
              <p className="text-xs text-sidebar-foreground capitalize">
                {user.role}
              </p>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/50"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span className="ml-2">Logout</span>}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};
