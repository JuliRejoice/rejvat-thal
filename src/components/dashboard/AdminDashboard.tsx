import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Building2,
  DollarSign,
  Users,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  Plus
} from 'lucide-react';

const AdminDashboard = () => {
  // Mock data - in real app this would come from your backend
  const restaurantStats = [
    { name: 'Spice Garden', income: 45000, expense: 28000, customers: 150, status: 'active' },
    { name: 'Curry Palace', income: 38000, expense: 25000, customers: 120, status: 'active' },
    { name: 'Tiffin Express', income: 32000, expense: 22000, customers: 100, status: 'active' },
    { name: 'Meal Master', income: 0, expense: 0, customers: 0, status: 'inactive' }
  ];

  const totalIncome = restaurantStats.reduce((sum, r) => sum + r.income, 0);
  const totalExpense = restaurantStats.reduce((sum, r) => sum + r.expense, 0);
  const totalCustomers = restaurantStats.reduce((sum, r) => sum + r.customers, 0);
  const balance = totalIncome - totalExpense;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">Overview of all restaurant operations</p>
        </div>
        <Button className="bg-gradient-primary">
          <Plus className="mr-2 h-4 w-4" />
          Add Restaurant
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <div className="p-2 bg-metrics-income/10 rounded-lg">
              <TrendingUp className="h-4 w-4 text-metrics-income" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-metrics-income">₹{totalIncome.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-metrics-income">+12.5%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expense</CardTitle>
            <div className="p-2 bg-metrics-expense/10 rounded-lg">
              <TrendingDown className="h-4 w-4 text-metrics-expense" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-metrics-expense">₹{totalExpense.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-metrics-expense">+8.2%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
            <div className="p-2 bg-metrics-balance/10 rounded-lg">
              <DollarSign className="h-4 w-4 text-metrics-balance" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-metrics-balance">₹{balance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-metrics-balance">+18.7%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <div className="p-2 bg-metrics-customers/10 rounded-lg">
              <Users className="h-4 w-4 text-metrics-customers" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-metrics-customers">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-metrics-customers">+5.3%</span> from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Restaurant Overview */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Restaurant Overview
              </CardTitle>
              <p className="text-sm text-muted-foreground">Performance summary of all restaurants</p>
            </div>
            <Button variant="outline" size="sm">
              <Eye className="mr-2 h-4 w-4" />
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {restaurantStats.map((restaurant, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Building2 className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{restaurant.name}</h3>
                    <p className="text-sm text-muted-foreground">{restaurant.customers} active customers</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <p className="text-sm text-metrics-income font-medium">₹{restaurant.income.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Income</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-metrics-expense font-medium">₹{restaurant.expense.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Expense</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-metrics-balance font-medium">₹{(restaurant.income - restaurant.expense).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Balance</p>
                  </div>
                  <Badge variant={restaurant.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                    {restaurant.status === 'active' ? (
                      <CheckCircle className="mr-1 h-3 w-3" />
                    ) : (
                      <Clock className="mr-1 h-3 w-3" />
                    )}
                    {restaurant.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-warning" />
              Pending Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-warning/5 border border-warning/20 rounded-lg">
                <div>
                  <p className="font-medium text-sm">Leave Request</p>
                  <p className="text-xs text-muted-foreground">Spice Garden - Staff Member</p>
                </div>
                <Button size="sm" variant="outline">Review</Button>
              </div>
              <div className="flex items-center justify-between p-3 bg-danger/5 border border-danger/20 rounded-lg">
                <div>
                  <p className="font-medium text-sm">High Expense Alert</p>
                  <p className="text-xs text-muted-foreground">Curry Palace - ₹15,000 expense</p>
                </div>
                <Button size="sm" variant="outline">Check</Button>
              </div>
              <div className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <div>
                  <p className="font-medium text-sm">New Manager Registration</p>
                  <p className="text-xs text-muted-foreground">Tiffin Express - Approval Needed</p>
                </div>
                <Button size="sm" variant="outline">Approve</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="p-1 bg-success/10 rounded-full">
                  <CheckCircle className="h-3 w-3 text-success" />
                </div>
                <div>
                  <p className="text-sm font-medium">Restaurant Activated</p>
                  <p className="text-xs text-muted-foreground">Spice Garden was activated by Admin</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="p-1 bg-primary/10 rounded-full">
                  <Users className="h-3 w-3 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">New Customer Added</p>
                  <p className="text-xs text-muted-foreground">25 new customers joined this week</p>
                  <p className="text-xs text-muted-foreground">4 hours ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="p-1 bg-metrics-income/10 rounded-full">
                  <TrendingUp className="h-3 w-3 text-metrics-income" />
                </div>
                <div>
                  <p className="text-sm font-medium">Income Updated</p>
                  <p className="text-xs text-muted-foreground">Monthly income report generated</p>
                  <p className="text-xs text-muted-foreground">6 hours ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;