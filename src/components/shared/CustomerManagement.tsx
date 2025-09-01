import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  UserPlus,
  Search,
  Eye,
  Edit,
  MapPin,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Pause,
  Play
} from 'lucide-react';

const CustomerManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Mock data
  const customers = [
    {
      id: 1,
      name: 'Rajesh Kumar',
      phone: '+91 9876543210',
      email: 'rajesh@email.com',
      address: '123 MG Road, Bangalore',
      reference: 'Priya Singh',
      status: 'active',
      joinedDate: '2024-01-15',
      totalOrders: 45,
      totalPaid: 18000,
      pendingDue: 1500,
      currentPlan: 'Punjabi Thali',
      planType: 'Monthly',
      deliveryCharges: true,
      nextDelivery: '2024-12-01'
    },
    {
      id: 2,
      name: 'Priya Singh',
      phone: '+91 9876543211',
      email: 'priya@email.com',
      address: '456 Brigade Road, Bangalore',
      reference: 'Self',
      status: 'active',
      joinedDate: '2024-02-20',
      totalOrders: 32,
      totalPaid: 12500,
      pendingDue: 0,
      currentPlan: 'Gujarati Thali',
      planType: 'Weekly',
      deliveryCharges: false,
      nextDelivery: '2024-12-01'
    },
    {
      id: 3,
      name: 'Amit Patel',
      phone: '+91 9876543212',
      email: 'amit@email.com',
      address: '789 Commercial Street, Bangalore',
      reference: 'Rajesh Kumar',
      status: 'paused',
      joinedDate: '2024-03-10',
      totalOrders: 18,
      totalPaid: 7200,
      pendingDue: 800,
      currentPlan: 'Custom Meal',
      planType: 'Daily',
      deliveryCharges: true,
      nextDelivery: '2024-12-15'
    }
  ];

  const paymentHistory = [
    { date: '2024-11-25', amount: 2500, type: 'credit', method: 'UPI', description: 'Monthly plan payment' },
    { date: '2024-11-20', amount: 500, type: 'debit', method: 'Cash', description: 'Delivery charges' },
    { date: '2024-11-15', amount: 1200, type: 'credit', method: 'Card', description: 'Advance payment' },
    { date: '2024-11-10', amount: 300, type: 'debit', method: 'UPI', description: 'Extra items' }
  ];

  const tiffinInfo = [
    { meal: 'Breakfast', items: '2 Paratha, Sabji, Pickle', price: 80, days: 'Mon-Sat' },
    { meal: 'Lunch', items: '4 Roti, 2 Sabji, Dal, Rice, Salad', price: 150, days: 'Mon-Sun' },
    { meal: 'Dinner', items: '3 Roti, Sabji, Dal, Pickle', price: 120, days: 'Mon-Sat' }
  ];

  const CreateCustomerModal = () => (
    <DialogContent>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Add New Customer
        </DialogTitle>
        <DialogDescription>
          Create a new customer profile with their tiffin preferences
        </DialogDescription>
      </DialogHeader>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          // Here you would typically save to backend
          console.log('Creating customer:', Object.fromEntries(formData));
          setIsCreateModalOpen(false);
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" name="name" placeholder="Enter full name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" name="phone" placeholder="+91 9876543210" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" name="email" type="email" placeholder="customer@email.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reference">Reference</Label>
            <Input id="reference" name="reference" placeholder="Referred by" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Textarea id="address" name="address" placeholder="Complete delivery address" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="plan">Tiffin Plan</Label>
            <Select name="plan">
              <SelectTrigger>
                <SelectValue placeholder="Select plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="punjabi">Punjabi Thali</SelectItem>
                <SelectItem value="gujarati">Gujarati Thali</SelectItem>
                <SelectItem value="south-indian">South Indian</SelectItem>
                <SelectItem value="custom">Custom Meal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="planType">Plan Type</Label>
            <Select name="planType">
              <SelectTrigger>
                <SelectValue placeholder="Select plan type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" className="bg-gradient-primary">
            Create Customer
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );

  const CustomerDetailsModal = ({ customer }: { customer: any }) => (
    <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          {customer.name} - Customer Details
        </DialogTitle>
        <DialogDescription>
          Complete customer information, tiffin details, and payment history
        </DialogDescription>
      </DialogHeader>
      
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="info">Customer Info</TabsTrigger>
          <TabsTrigger value="tiffin">Tiffin Info</TabsTrigger>
          <TabsTrigger value="payment">Payment History</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="info" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{customer.phone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{customer.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{customer.address}</span>
                </div>
              </div>
              <div className="space-y-3">
                <p><span className="font-medium">Reference:</span> {customer.reference}</p>
                <p><span className="font-medium">Joined:</span> {customer.joinedDate}</p>
                <p><span className="font-medium">Total Orders:</span> {customer.totalOrders}</p>
                <p><span className="font-medium">Status:</span> 
                  <Badge variant={customer.status === 'active' ? 'default' : 'secondary'} className="ml-2">
                    {customer.status}
                  </Badge>
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tiffin" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Current Tiffin Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Meal</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Days</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tiffinInfo.map((meal, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{meal.meal}</TableCell>
                      <TableCell>{meal.items}</TableCell>
                      <TableCell>₹{meal.price}</TableCell>
                      <TableCell>{meal.days}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                <p><span className="font-medium">Plan Type:</span> {customer.planType}</p>
                <p><span className="font-medium">Delivery Charges:</span> {customer.deliveryCharges ? 'Yes (₹20/day)' : 'No'}</p>
                <p><span className="font-medium">Next Delivery:</span> {customer.nextDelivery}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="payment" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Payment History</CardTitle>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total Paid: ₹{customer.totalPaid}</p>
                  <p className="text-sm font-medium text-danger">Pending Due: ₹{customer.pendingDue}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {paymentHistory.map((payment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        payment.type === 'credit' 
                          ? 'bg-metrics-income/10 text-metrics-income' 
                          : 'bg-metrics-expense/10 text-metrics-expense'
                      }`}>
                        <DollarSign className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">{payment.description}</p>
                        <p className="text-sm text-muted-foreground">{payment.date} • {payment.method}</p>
                      </div>
                    </div>
                    <div className={`font-semibold ${
                      payment.type === 'credit' ? 'text-metrics-income' : 'text-metrics-expense'
                    }`}>
                      {payment.type === 'credit' ? '+' : '-'}₹{payment.amount}
                    </div>
                  </div>
                ))}
              </div>
              {customer.pendingDue > 0 && (
                <div className="mt-4">
                  <Button className="w-full bg-gradient-primary">
                    <DollarSign className="mr-2 h-4 w-4" />
                    Receive Due Payment - ₹{customer.pendingDue}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="actions" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="mr-2 h-4 w-4" />
                  Mark Pause Dates
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Package className="mr-2 h-4 w-4" />
                  Add/Edit Tiffin Plan
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <DollarSign className="mr-2 h-4 w-4" />
                  Update Payment
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Customer Info
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Status Control</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {customer.status === 'active' ? (
                  <Button variant="destructive" className="w-full">
                    <Pause className="mr-2 h-4 w-4" />
                    Pause Service
                  </Button>
                ) : (
                  <Button variant="success" className="w-full">
                    <Play className="mr-2 h-4 w-4" />
                    Resume Service
                  </Button>
                )}
                <Button variant="outline" className="w-full">
                  <XCircle className="mr-2 h-4 w-4" />
                  Deactivate Customer
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </DialogContent>
  );

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.phone.includes(searchTerm);
    const matchesFilter = filterStatus === 'all' || customer.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Customer Management</h1>
          <p className="text-muted-foreground">Manage customer information, tiffin plans, and payments</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary">
              <UserPlus className="mr-2 h-4 w-4" />
              Add Customer
            </Button>
          </DialogTrigger>
          <CreateCustomerModal />
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card className="shadow-card">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search customers by name or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('all')}
                size="sm"
              >
                All
              </Button>
              <Button
                variant={filterStatus === 'active' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('active')}
                size="sm"
              >
                Active
              </Button>
              <Button
                variant={filterStatus === 'paused' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('paused')}
                size="sm"
              >
                Paused
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserPlus className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{customers.length}</p>
                <p className="text-sm text-muted-foreground">Total Customers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-success" />
              <div>
                <p className="text-2xl font-bold">{customers.filter(c => c.status === 'active').length}</p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-8 w-8 text-metrics-income" />
              <div>
                <p className="text-2xl font-bold">₹{customers.reduce((sum, c) => sum + c.totalPaid, 0).toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-warning" />
              <div>
                <p className="text-2xl font-bold">₹{customers.reduce((sum, c) => sum + c.pendingDue, 0).toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Pending Dues</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer List */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Customer List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Due</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-sm text-muted-foreground">Ref: {customer.reference}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="text-sm">{customer.phone}</p>
                      <p className="text-sm text-muted-foreground">{customer.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{customer.currentPlan}</p>
                      <p className="text-sm text-muted-foreground">{customer.planType}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-metrics-income">₹{customer.totalPaid.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">{customer.totalOrders} orders</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={customer.pendingDue > 0 ? 'destructive' : 'default'}>
                      ₹{customer.pendingDue}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={customer.status === 'active' ? 'default' : 'secondary'}>
                      {customer.status === 'active' ? (
                        <CheckCircle className="mr-1 h-3 w-3" />
                      ) : (
                        <Pause className="mr-1 h-3 w-3" />
                      )}
                      {customer.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <CustomerDetailsModal customer={customer} />
                      </Dialog>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
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

export default CustomerManagement;