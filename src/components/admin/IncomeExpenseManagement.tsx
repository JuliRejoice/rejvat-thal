import React, { useMemo, useState } from 'react';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useMutation, useQueries } from '@tanstack/react-query';
import { getRestaurants } from '@/api/restaurant.api';
import { getIncomeExpense, getTransactionByMethod, createIncomeExpense } from '@/api/incomeExpense.api';
import { useToast } from '@/hooks/use-toast';
import { IncomeExpenseForm } from '@/components/common/IncomeExpenseForm';

const IncomeExpenseManagement = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedRestaurant, setSelectedRestaurant] = useState('all');
  const [viewType, setViewType] = useState('transactions');
  const [openAddIncome, setOpenAddIncome] = useState(false);
  const [openAddExpense, setOpenAddExpense] = useState(false);

  const { toast } = useToast();

  const queryArgs = useMemo(() => ({
    restaurantId: selectedRestaurant !== 'all' ? selectedRestaurant : undefined,
    startDate: selectedDate,
    endDate: selectedDate,
  }), [selectedDate, selectedRestaurant]);

  const queriesResults = useQueries({
    queries: [
      {
        queryKey: ['restaurants-admin'],
        queryFn: () => getRestaurants({}),
      },
      {
        queryKey: ['transactions-admin', queryArgs],
        queryFn: () => getIncomeExpense(queryArgs),
      },
      {
        queryKey: ['transactions-by-method-admin', queryArgs],
        queryFn: () => getTransactionByMethod(queryArgs),
      },
    ],
  });

  const [restaurantsQuery, transactionsQuery, byMethodQuery] = queriesResults;

  const restaurants = useMemo(() => {
    const base = [{ id: 'all', name: 'All Restaurants' }];
    const data = restaurantsQuery.data?.payload?.data || [];
    return base.concat(data.map((r: any) => ({ id: r._id, name: r.name })));
  }, [restaurantsQuery.data]);

  const balanceData = {
    openingBalance: 125000,
    totalIncome: 45000,
    totalExpense: 28000,
    closingBalance: 142000,
    cashBalance: 85000,
    cardBalance: 35000,
    upiBalance: 22000
  };

  

  const paymentMethodStats = useMemo(() => {
    const rows = byMethodQuery.data?.payload?.data || [];
    return rows.map((row: any) => ({
      method: row.method?.type || 'N/A',
      income: row.income || 0,
      expense: row.expense || 0,
      icon: row.method?.type === 'Card' ? CreditCard : row.method?.type === 'UPI' ? Smartphone : Banknote,
      color: row.income - row.expense >= 0 ? 'text-green-600' : 'text-red-600',
    }));
  }, [byMethodQuery.data]);

  const restaurantBalances: any[] = [];

  const transactions = transactionsQuery.data?.payload?.data || [];

  const { mutate: createTxn, isPending: isCreating } = useMutation({
    mutationKey: ['create-income-expense-admin'],
    mutationFn: createIncomeExpense,
    onSuccess: () => {
      toast({ variant: 'default', title: 'Success', description: 'Transaction added.' });
      setOpenAddIncome(false);
      setOpenAddExpense(false);
      transactionsQuery.refetch();
      byMethodQuery.refetch();
    },
    onError: (error) => {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to add transaction.' });
      console.error('Error adding transaction:', error);
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Income & Expense Management</h1>
          <p className="text-muted-foreground">Track financial transactions across all restaurants</p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={openAddExpense} onOpenChange={(o) => setOpenAddExpense(o)}>
            <DialogTrigger asChild>
              <Button variant="destructive">
                <TrendingDown className="mr-2 h-4 w-4" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl rounded-2xl shadow-lg">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold">Add Expense</DialogTitle>
              </DialogHeader>
              <IncomeExpenseForm
                type="expense"
                onSubmit={(data: any) => createTxn(data)}
                isPending={isCreating}
                showRestaurantSelector={true}
                onCancel={() => setOpenAddExpense(false)}
              />
            </DialogContent>
          </Dialog>
          <Dialog open={openAddIncome} onOpenChange={(o) => setOpenAddIncome(o)}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-success">
                <TrendingUp className="mr-2 h-4 w-4" />
                Add Income
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl rounded-2xl shadow-lg">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold">Add Income</DialogTitle>
              </DialogHeader>
              <IncomeExpenseForm
                type="income"
                onSubmit={(data: any) => createTxn(data)}
                isPending={isCreating}
                showRestaurantSelector={true}
                onCancel={() => setOpenAddIncome(false)}
              />
            </DialogContent>
          </Dialog>
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
                {transactions.map((transaction: any) => (
                  <TableRow key={transaction._id}>
                    <TableCell className="font-medium">{transaction?.restaurantId?.name || 'N/A'}</TableCell>
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
                    <TableCell>{transaction?.expenseCategoryId?.name || 'N/A'}</TableCell>
                    <TableCell>
                      <span className={transaction.type === 'income' ? 'text-metrics-income' : 'text-metrics-expense'}>
                        {transaction.type === 'income' ? '+' : '-'}₹{Number(transaction.amount).toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{transaction?.method?.type || 'N/A'}</Badge>
                    </TableCell>
                    <TableCell>{new Date(transaction.date)?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</TableCell>
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