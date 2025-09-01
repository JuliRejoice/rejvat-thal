import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Filter,
  Download,
  Eye,
  CreditCard,
  Banknote,
  Smartphone
} from 'lucide-react';

const IncomeExpenseManagement = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedRestaurant, setSelectedRestaurant] = useState('all');
  const [viewType, setViewType] = useState('transactions');

  // Mock data
  const restaurants = [
    { id: 'all', name: 'All Restaurants' },
    { id: 'rest1', name: 'Spice Garden' },
    { id: 'rest2', name: 'Curry Palace' },
    { id: 'rest3', name: 'Tiffin Express' }
  ];

  const balanceData = {
    openingBalance: 125000,
    totalIncome: 45000,
    totalExpense: 28000,
    closingBalance: 142000,
    cashBalance: 85000,
    cardBalance: 35000,
    upiBalance: 22000
  };

  const transactions = [
    {
      id: 1,
      restaurant: 'Spice Garden',
      type: 'income',
      category: 'Tiffin Subscription',
      amount: 15000,
      paymentMethod: 'UPI',
      time: '10:30 AM',
      description: 'Monthly tiffin subscription payments',
      customerCount: 25
    },
    {
      id: 2,
      restaurant: 'Curry Palace',
      type: 'expense',
      category: 'Raw Materials',
      amount: 8500,
      paymentMethod: 'Cash',
      time: '11:15 AM',
      description: 'Vegetable and grocery purchase',
      vendor: 'Fresh Mart Suppliers'
    },
    {
      id: 3,
      restaurant: 'Spice Garden',
      type: 'income',
      category: 'Daily Orders',
      amount: 12500,
      paymentMethod: 'Card',
      time: '01:20 PM',
      description: 'Lunch orders payment',
      customerCount: 45
    },
    {
      id: 4,
      restaurant: 'Tiffin Express',
      type: 'expense',
      category: 'Staff Salary',
      amount: 15000,
      paymentMethod: 'Bank Transfer',
      time: '02:45 PM',
      description: 'Monthly staff salary payment',
      staffCount: 5
    }
  ];

  const paymentMethodStats = [
    { method: 'Cash', income: 18500, expense: 12000, icon: Banknote, color: 'text-green-600' },
    { method: 'Card', income: 15000, expense: 8000, icon: CreditCard, color: 'text-blue-600' },
    { method: 'UPI', income: 11500, expense: 5000, icon: Smartphone, color: 'text-purple-600' },
    { method: 'Bank Transfer', income: 0, expense: 3000, icon: DollarSign, color: 'text-orange-600' }
  ];

  const restaurantBalances = [
    { name: 'Spice Garden', opening: 45000, income: 18000, expense: 10000, closing: 53000 },
    { name: 'Curry Palace', opening: 35000, income: 15000, expense: 12000, closing: 38000 },
    { name: 'Tiffin Express', opening: 25000, income: 12000, expense: 6000, closing: 31000 },
    { name: 'Meal Master', opening: 20000, income: 0, expense: 0, closing: 20000 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Income & Expense Management</h1>
          <p className="text-muted-foreground">Track financial transactions across all restaurants</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button variant="outline">
            <Eye className="mr-2 h-4 w-4" />
            Detailed View
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="shadow-card">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
              <div>
                <Label htmlFor="date">Select Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="restaurant">Restaurant</Label>
                <Select value={selectedRestaurant} onValueChange={setSelectedRestaurant}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {restaurants.map((restaurant) => (
                      <SelectItem key={restaurant.id} value={restaurant.id}>
                        {restaurant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="viewType">View</Label>
                <Select value={viewType} onValueChange={setViewType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="transactions">Transaction List</SelectItem>
                    <SelectItem value="balance">Balance Summary</SelectItem>
                    <SelectItem value="payment">Payment Method Wise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button>
              <Filter className="mr-2 h-4 w-4" />
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Balance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Opening Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{balanceData.openingBalance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Start of day balance</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-metrics-income" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-metrics-income">₹{balanceData.totalIncome.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+12.5% from yesterday</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expense</CardTitle>
            <TrendingDown className="h-4 w-4 text-metrics-expense" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-metrics-expense">₹{balanceData.totalExpense.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">-5.2% from yesterday</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Closing Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-metrics-balance" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-metrics-balance">₹{balanceData.closingBalance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Net profit: ₹{(balanceData.totalIncome - balanceData.totalExpense).toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Method Wise Balance */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Payment Method Wise Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {paymentMethodStats.map((payment, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <payment.icon className={`h-5 w-5 ${payment.color}`} />
                  <Badge variant="outline">{payment.method}</Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Income:</span>
                    <span className="font-medium text-metrics-income">₹{payment.income.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Expense:</span>
                    <span className="font-medium text-metrics-expense">₹{payment.expense.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium border-t pt-1">
                    <span>Balance:</span>
                    <span className="text-metrics-balance">₹{(payment.income - payment.expense).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Transaction List or Balance View */}
      {viewType === 'transactions' ? (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Transaction Details - {new Date(selectedDate).toLocaleDateString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Restaurant</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">{transaction.restaurant}</TableCell>
                    <TableCell>
                      <Badge variant={transaction.type === 'income' ? 'default' : 'destructive'}>
                        {transaction.type === 'income' ? (
                          <TrendingUp className="mr-1 h-3 w-3" />
                        ) : (
                          <TrendingDown className="mr-1 h-3 w-3" />
                        )}
                        {transaction.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{transaction.category}</TableCell>
                    <TableCell>
                      <span className={transaction.type === 'income' ? 'text-metrics-income' : 'text-metrics-expense'}>
                        {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{transaction.paymentMethod}</Badge>
                    </TableCell>
                    <TableCell>{transaction.time}</TableCell>
                    <TableCell>{transaction.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Restaurant-wise Balance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Restaurant</TableHead>
                  <TableHead>Opening Balance</TableHead>
                  <TableHead>Income</TableHead>
                  <TableHead>Expense</TableHead>
                  <TableHead>Closing Balance</TableHead>
                  <TableHead>Net Change</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {restaurantBalances.map((restaurant, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{restaurant.name}</TableCell>
                    <TableCell>₹{restaurant.opening.toLocaleString()}</TableCell>
                    <TableCell className="text-metrics-income">+₹{restaurant.income.toLocaleString()}</TableCell>
                    <TableCell className="text-metrics-expense">-₹{restaurant.expense.toLocaleString()}</TableCell>
                    <TableCell className="font-medium">₹{restaurant.closing.toLocaleString()}</TableCell>
                    <TableCell>
                      <span className={restaurant.income - restaurant.expense > 0 ? 'text-metrics-income' : 'text-metrics-expense'}>
                        {restaurant.income - restaurant.expense > 0 ? '+' : ''}₹{(restaurant.income - restaurant.expense).toLocaleString()}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default IncomeExpenseManagement;