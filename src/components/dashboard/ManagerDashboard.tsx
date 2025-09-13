import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, TrendingDown, Users, Calendar, Plus, FileText, Clock, Package, ShoppingBag } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getDashboardOverview, type ApiResponse, type DashboardResponse, type OverviewCardProps } from '@/api/dashboard.api';
import { Dirham } from '../Svg';
import { BalanceOverviewSkeleton } from '../manager/ManagerIncomeExpenseSkeletons';

const ManagerDashboard = () => {
  const { data, isLoading, } = useQuery<ApiResponse<DashboardResponse>>({
    queryKey: ["get-dashboard-overview"],
    queryFn: () => getDashboardOverview(`/transaction/getByRestaurantOverview?restaurantId=${'68b16a9eb7c6bbda40b2b4dd'}`),
  });

  const dashboardData = data?.payload;
  const overViewDetails = [
    { title: "Total Income", value: dashboardData?.overall?.income ?? 0, icon: <TrendingUp className="h-4 w-4 text-metrics-income" />, color: "text-metrics-income", bg: "bg-metrics-income/10" },
    { title: "Total Expense", value: dashboardData?.overall?.expense ?? 0, icon: <TrendingDown className="h-4 w-4 text-metrics-expense" />, color: "text-metrics-expense", bg: "bg-metrics-expense/10" },
    { title: "Net Balance", value: dashboardData?.overall?.totalBalance ?? 0, icon: <DollarSign className="h-4 w-4 text-metrics-balance" />, color: "text-metrics-balance", bg: "bg-metrics-balance/10" },
  ]

  const OverviewCard = memo(({ title, value, icon, color, bg }: OverviewCardProps) => {
    return (
      <Card className="shadow-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <div className={`p-2 ${bg} rounded-lg`}>{icon}</div>
        </CardHeader>
        <CardContent>
          <div className={`flex items-center text-2xl font-bold ${color}`}>
            <Dirham className="pt-px mr-1" /> {value.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground"></p>
        </CardContent>
      </Card>
    );
  });
  OverviewCard.displayName = "OverviewCard";
  // const recentTransactions = [
  //   { type: 'income', amount: 2500, description: 'Tiffin subscription payment', time: '2 hours ago' },
  //   { type: 'expense', amount: 800, description: 'Vegetable purchase from vendor', time: '3 hours ago' },
  //   { type: 'income', amount: 1200, description: 'Monthly meal plan payment', time: '4 hours ago' },
  //   { type: 'expense', amount: 450, description: 'Gas cylinder refill', time: '5 hours ago' }
  // ];

  // const todayCustomers = [
  //   { name: 'Rajesh Kumar', plan: 'Punjabi Thali', status: 'delivered', time: '12:30 PM' },
  //   { name: 'Priya Singh', plan: 'Gujarati Thali', status: 'preparing', time: '01:00 PM' },
  //   { name: 'Amit Patel', plan: 'Custom Meal', status: 'pending', time: '01:30 PM' },
  //   { name: 'Sneha Sharma', plan: 'South Indian', status: 'delivered', time: '12:00 PM' }
  // ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manager Dashboard</h1>
          <p className="text-muted-foreground">Today's restaurant operations overview</p>
        </div>
      </div>

      {/* Today's Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading ? <BalanceOverviewSkeleton count={3} /> : overViewDetails.map((item, idx) => (
          <OverviewCard
            key={idx}
            title={item.title}
            value={item.value}
            icon={item.icon}
            color={item.color}
            bg={item.bg}
          />
        ))}
      </div>

      {/* Meal Orders Summary */}
      {/* <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Today's Tiffin Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
              <ShoppingBag className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-orange-800">Breakfast</h3>
              <p className="text-2xl font-bold text-orange-600">{todayStats.breakfastOrders}</p>
              <p className="text-sm text-orange-700">Orders</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
              <Package className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-green-800">Lunch</h3>
              <p className="text-2xl font-bold text-green-600">{todayStats.lunchOrders}</p>
              <p className="text-sm text-green-700">Orders</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
              <ShoppingBag className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-purple-800">Dinner</h3>
              <p className="text-2xl font-bold text-purple-600">{todayStats.dinnerOrders}</p>
              <p className="text-sm text-purple-700">Orders</p>
            </div>
          </div>
        </CardContent>
      </Card> */}

      {/* Recent Transactions & Today's Deliveries */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Recent Transactions
              </CardTitle>
              <Button variant="outline" size="sm">View All</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map((transaction, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      transaction.type === 'income' 
                        ? 'bg-metrics-income/10 text-metrics-income' 
                        : 'bg-metrics-expense/10 text-metrics-expense'
                    }`}>
                      {transaction.type === 'income' ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{transaction.description}</p>
                      <p className="text-xs text-muted-foreground">{transaction.time}</p>
                    </div>
                  </div>
                  <div className={`font-semibold ${
                    transaction.type === 'income' ? 'text-metrics-income' : 'text-metrics-expense'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Today's Deliveries
              </CardTitle>
              <Button variant="outline" size="sm">View All</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todayCustomers.map((customer, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{customer.name}</p>
                      <p className="text-xs text-muted-foreground">{customer.plan} • {customer.time}</p>
                    </div>
                  </div>
                  <Badge 
                    variant={
                      customer.status === 'delivered' ? 'default' : 
                      customer.status === 'preparing' ? 'secondary' : 'outline'
                    }
                    className="capitalize"
                  >
                    {customer.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div> */}
    </div>
  );
};

export default ManagerDashboard;