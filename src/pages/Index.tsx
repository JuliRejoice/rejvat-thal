import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoginForm } from '@/components/auth/LoginForm';
import { MainLayout } from '@/components/layout/MainLayout';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import ManagerDashboard from '@/components/dashboard/ManagerDashboard';
import StaffDashboard from '@/components/dashboard/StaffDashboard';
import RestaurantManagement from '@/components/admin/RestaurantManagement';
import IncomeExpenseManagement from '@/components/admin/IncomeExpenseManagement';
import ManagerIncomeExpense from '@/components/manager/ManagerIncomeExpense';
// import CustomerManagement from '@/components/admin/CustomerManagement';
import CustomerManagement from '@/components/common/CustomerManagement';
import AttendanceManagement from '@/components/staff/AttendanceManagement';
import ManagerManagement from '@/components/admin/ManagerManagement';
import StaffManagement from '@/components/admin/StaffManagement';
import MenuItems from '@/components/shared/MenuItems';
import MealPlans from '@/components/shared/MealPlans';
import DailyTiffinSummary from '@/components/shared/DailyTiffinSummary';
import VendorManagement from '@/components/shared/vendor/VendorManagement';
import Settings from '@/components/admin/Settings';
import Notifications from '@/components/shared/Notifications';
import InventoryManagement from '@/components/manager/InventoryManagement';
import MonthlyMenuPlan from '@/components/manager/MonthlyMenuPlan';
import LeaveRequestHistory from '@/components/staff/LeaveRequestHistory';
import ExpenseCategoryManagement from '@/components/admin/ExpenseCategoryManagement';
import { ForgetPassForm } from '@/components/auth/ForgetPass';
import { OTPVerificationForm } from '@/components/auth/OtpVerification';
import { ResetPasswordForm } from '@/components/auth/ResetPass';
import AreaManagement from '@/components/manager/AreaManagement';
import AddTiffin from '@/components/common/AddTiffin';
import Invoice from '@/components/manager/InvoiceManagement';

// Placeholder components for other routes
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center min-h-96">
    <div className="text-center">
      <h1 className="text-2xl font-bold text-foreground mb-2">{title}</h1>
      <p className="text-muted-foreground">
        This page will be implemented with backend integration
      </p>
    </div>
  </div>
);

// Layout wrapper component that conditionally applies MainLayout
const RouteLayout = ({ children, useLayout = true }: { children: React.ReactNode; useLayout?: boolean }) => {
  if (!useLayout) {
    return <>{children}</>;
  }
  return <MainLayout>{children}</MainLayout>;
};

const Index = () => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/forget-password" element={<ForgetPassForm />} />
        <Route path="/otp-verification" element={<OTPVerificationForm />} />
        <Route path="/reset-password" element={<ResetPasswordForm />} />
        {/* <Route
          path="/add-tiffin"
          element={
            <RouteLayout useLayout={false}>
              <AddTiffin />
            </RouteLayout>
          }
        /> */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Authenticated routes
  return (
    <Routes>
      {/* Public routes that are still accessible when authenticated */}
      {/* <Route
        path="/add-tiffin"
        element={
          <RouteLayout useLayout={false}>
            <AddTiffin />
          </RouteLayout>
        }
      /> */}

      {/* Protected routes with MainLayout */}
      <Route element={<MainLayout><Outlet /></MainLayout>}>
        {/* Dashboard Route */}
        <Route path="/" element={
          user?.role === 'admin' ? (
            <AdminDashboard />
          ) : user?.role === 'manager' ? (
            <ManagerDashboard />
          ) : (
            <AttendanceManagement />
          )}
        />

        {/* Admin Routes */}
        {user?.role === "admin" && (
          <>
            <Route path="/restaurants" element={<RestaurantManagement />} />
            <Route path="/finance" element={<IncomeExpenseManagement />} />
            <Route path="/managers" element={<ManagerManagement />} />
            <Route path="/staff" element={<StaffManagement />} />
            <Route path="/customers" element={<CustomerManagement />} />
            <Route path="/items" element={<MenuItems />} />
            <Route path="/meals" element={<MealPlans />} />
            <Route path="/daily-summary" element={<DailyTiffinSummary />} />
            <Route path="/vendors" element={<VendorManagement />} />
            <Route
              path="/expense-categories"
              element={<ExpenseCategoryManagement />}
            />
            <Route path="/settings" element={<Settings />} />
            <Route path="/notifications" element={<Notifications />} />
          </>
        )}

        {/* Manager Routes */}
        {user?.role === "manager" && (
          <>

            <Route path="/finance" element={<ManagerIncomeExpense />} />
            <Route path="/staff" element={<StaffManagement />} />
            <Route path="/customers" element={<CustomerManagement />} />
            <Route path="/items" element={<MenuItems />} />
            <Route path="/meals" element={<MealPlans />} />
            <Route path="/daily-summary" element={<DailyTiffinSummary />} />
            <Route path="/vendors" element={<VendorManagement />} />
            <Route path="/inventory" element={<InventoryManagement />} />
            <Route path="/menu-plan" element={<MonthlyMenuPlan />} />
            <Route
              path="/expense-categories"
              element={<ExpenseCategoryManagement />}
            />
            <Route path="/manage-area" element={<AreaManagement />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/invoice" element={<Invoice />} />
          </>
        )}

        {/* Staff Routes */}
        {user?.role === "staff" && (
          <>
            <Route path="/attendance" element={<AttendanceManagement />} />
            <Route path="/leave-requests" element={<LeaveRequestHistory />} />
          </>
        )}

     

        {/* Fallback route for authenticated users */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

export default Index;
