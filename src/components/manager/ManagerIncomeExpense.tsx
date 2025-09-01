import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Upload,
  Calendar,
  Receipt,
  ShoppingCart
} from 'lucide-react';

const ManagerIncomeExpense = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [isAddingIncome, setIsAddingIncome] = useState(false);

  // Mock data
  const balanceData = {
    openingBalance: 45000,
    totalIncome: 18000,
    totalExpense: 10000,
    closingBalance: 53000,
    cashBalance: 32000,
    cardBalance: 15000,
    upiBalance: 6000
  };

  const transactions = [
    {
      id: 1,
      type: 'income',
      category: 'Tiffin Subscription',
      amount: 8500,
      paymentMethod: 'UPI',
      time: '10:30 AM',
      description: 'Monthly subscription renewals - 15 customers',
      image: null
    },
    {
      id: 2,
      type: 'expense',
      category: 'Raw Materials',
      amount: 3200,
      paymentMethod: 'Cash',
      time: '11:15 AM',
      description: 'Daily vegetable and grocery purchase',
      image: 'receipt_001.jpg'
    },
    {
      id: 3,
      type: 'income',
      category: 'Daily Orders',
      amount: 5500,
      paymentMethod: 'Card',
      time: '01:20 PM',
      description: 'Lunch orders - 22 customers',
      image: null
    },
    {
      id: 4,
      type: 'expense',
      category: 'Utilities',
      amount: 1800,
      paymentMethod: 'Bank Transfer',
      time: '02:45 PM',
      description: 'Gas cylinder refill and electricity bill',
      image: 'bill_002.jpg'
    }
  ];

  const expenseCategories = [
    'Raw Materials',
    'Utilities',
    'Staff Salary',
    'Rent',
    'Equipment',
    'Transportation',
    'Marketing',
    'Others'
  ];

  const paymentMethods = ['Cash', 'Card', 'UPI', 'Bank Transfer'];

  const AddExpenseModal = () => (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>Add Expense Entry</DialogTitle>
        <DialogDescription>
          Record a new expense transaction for your restaurant
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div>
          <Label htmlFor="expense-category">Expense Category</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {expenseCategories.map((category) => (
                <SelectItem key={category} value={category.toLowerCase()}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="expense-amount">Amount (₹)</Label>
          <Input id="expense-amount" type="number" placeholder="0.00" />
        </div>
        <div>
          <Label htmlFor="expense-payment">Payment Method</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select payment method" />
            </SelectTrigger>
            <SelectContent>
              {paymentMethods.map((method) => (
                <SelectItem key={method} value={method.toLowerCase()}>
                  {method}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="expense-date">Date</Label>
          <Input id="expense-date" type="date" defaultValue={selectedDate} />
        </div>
        <div>
          <Label htmlFor="expense-image">Upload Receipt/Bill</Label>
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
            <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
          </div>
        </div>
        <div>
          <Label htmlFor="expense-notes">Notes</Label>
          <Textarea 
            id="expense-notes" 
            placeholder="Enter description or additional notes..."
            rows={3}
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => setIsAddingExpense(false)}>
          Cancel
        </Button>
        <Button onClick={() => setIsAddingExpense(false)}>
          Add Expense
        </Button>
      </DialogFooter>
    </DialogContent>
  );

  const AddIncomeModal = () => (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>Add Income Entry</DialogTitle>
        <DialogDescription>
          Record a new income transaction for your restaurant
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div>
          <Label htmlFor="income-amount">Amount (₹)</Label>
          <Input id="income-amount" type="number" placeholder="0.00" />
        </div>
        <div>
          <Label htmlFor="income-payment">Payment Method</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select payment method" />
            </SelectTrigger>
            <SelectContent>
              {paymentMethods.map((method) => (
                <SelectItem key={method} value={method.toLowerCase()}>
                  {method}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="income-date">Date</Label>
          <Input id="income-date" type="date" defaultValue={selectedDate} />
        </div>
        <div>
          <Label htmlFor="income-image">Upload Receipt/Proof</Label>
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
            <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
          </div>
        </div>
        <div>
          <Label htmlFor="income-notes">Notes</Label>
          <Textarea 
            id="income-notes" 
            placeholder="Enter description or additional notes..."
            rows={3}
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => setIsAddingIncome(false)}>
          Cancel
        </Button>
        <Button onClick={() => setIsAddingIncome(false)}>
          Add Income
        </Button>
      </DialogFooter>
    </DialogContent>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Income & Expense Management</h1>
          <p className="text-muted-foreground">Track and manage your restaurant's financial transactions</p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isAddingExpense} onOpenChange={setIsAddingExpense}>
            <DialogTrigger asChild>
              <Button variant="destructive">
                <TrendingDown className="mr-2 h-4 w-4" />
                Add Expense
              </Button>
            </DialogTrigger>
            <AddExpenseModal />
          </Dialog>
          <Dialog open={isAddingIncome} onOpenChange={setIsAddingIncome}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-success">
                <TrendingUp className="mr-2 h-4 w-4" />
                Add Income
              </Button>
            </DialogTrigger>
            <AddIncomeModal />
          </Dialog>
        </div>
      </div>

      {/* Date Filter */}
      <Card className="shadow-card">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-xs">
              <Label htmlFor="date">Select Date</Label>
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <Button>
              <Calendar className="mr-2 h-4 w-4" />
              Filter
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
            <p className="text-xs text-muted-foreground">Start of day</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-metrics-income" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-metrics-income">₹{balanceData.totalIncome.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+15.2% from yesterday</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Expense</CardTitle>
            <TrendingDown className="h-4 w-4 text-metrics-expense" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-metrics-expense">₹{balanceData.totalExpense.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">-8.1% from yesterday</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Closing Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-metrics-balance" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-metrics-balance">₹{balanceData.closingBalance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Net: +₹{(balanceData.totalIncome - balanceData.totalExpense).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Method Wise Balance */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Payment Method Wise Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Cash</span>
                <Badge variant="outline">₹{balanceData.cashBalance.toLocaleString()}</Badge>
              </div>
              <div className="text-sm text-muted-foreground">Available in cash drawer</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Card/UPI</span>
                <Badge variant="outline">₹{(balanceData.cardBalance + balanceData.upiBalance).toLocaleString()}</Badge>
              </div>
              <div className="text-sm text-muted-foreground">Digital payments</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Total</span>
                <Badge className="bg-primary">₹{balanceData.closingBalance.toLocaleString()}</Badge>
              </div>
              <div className="text-sm text-muted-foreground">Overall balance</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction List */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Transaction History - {new Date(selectedDate).toLocaleDateString()}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Proof</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
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
                    <span className={transaction.type === 'income' ? 'text-metrics-income font-medium' : 'text-metrics-expense font-medium'}>
                      {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{transaction.paymentMethod}</Badge>
                  </TableCell>
                  <TableCell>{transaction.time}</TableCell>
                  <TableCell className="max-w-xs">
                    <p className="text-sm truncate">{transaction.description}</p>
                  </TableCell>
                  <TableCell>
                    {transaction.image ? (
                      <Badge variant="secondary" className="text-xs">
                        <Receipt className="mr-1 h-3 w-3" />
                        Attached
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs">No attachment</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManagerIncomeExpense;