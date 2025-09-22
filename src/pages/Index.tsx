import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoginForm } from '@/components/auth/LoginForm';
import { MainLayout } from '@/components/layout/MainLayout';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import ManagerDashboard from '@/components/dashboard/ManagerDashboard';
import StaffDashboard from '@/components/dashboard/StaffDashboard';
import RestaurantManagement from '@/components/admin/RestaurantManagement';
import IncomeExpenseManagement from '@/components/admin/IncomeExpenseManagement';
import ManagerIncomeExpense from '@/components/manager/ManagerIncomeExpense';
import CustomerManagement from '@/components/shared/CustomerManagement';
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

// Placeholder components for other routes
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center min-h-96">
    <div className="text-center">
      <h1 className="text-2xl font-bold text-foreground mb-2">{title}</h1>
      <p className="text-muted-foreground">This page will be implemented with backend integration</p>
    </div>
  </div>
);

const Index = () => {
  const { isAuthenticated, user } = useAuth();
  // console.log("🚀 ~ Index ~ user:", user, isAuthenticated)

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/forgot-password" element={<ForgetPassForm />} />
        <Route path="/reset-password" element={<ResetPasswordForm />} />
        <Route path="/otp-verification" element={<OTPVerificationForm />} />
        
        {/* Redirect all other routes to login when not authenticated */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <MainLayout>
      <Routes>
        {/* Dashboard Route */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route 
          path="/dashboard" 
          element={
            user?.role === 'admin' ? <AdminDashboard /> :
            user?.role === 'manager' ? <ManagerDashboard /> :
            <AttendanceManagement />
          } 
        />

        {/* Admin Routes */}
        {user?.role === 'admin' && (
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
            <Route path="/expense-categories" element={<ExpenseCategoryManagement />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/notifications" element={<Notifications />} />
          </>
        )}

        {/* Manager Routes */}
        {user?.role === 'manager' && (
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
          </>
        )}

        {/* Staff Routes */}
        {user?.role === 'staff' && (
          <>
            {/* <Route path="/attendance" element={<AttendanceManagement />} /> */}
            <Route path="/leave-requests" element={<LeaveRequestHistory />} />
          </>
        )}

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </MainLayout>
  );
};

export default Index;
