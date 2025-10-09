import React, { useEffect, useState } from 'react';
import { Plus, Search, Filter, Upload, IndianRupee, Package, Truck, Receipt, Calendar, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { usePagination } from '@/hooks/use-pagination';
import { DataTablePagination } from '@/components/common/DataTablePagination';
import { useIsMobile } from '@/hooks/use-mobile';
import { getAllVendors } from '@/api/vendor.api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import AddOrderDialog from './AddOrderDialog';
import { AddInventoryOrder, getInventoryList, getInventoryOverview } from '@/api/inventory.api';
import { useAuth } from '@/contexts/AuthContext';
import AddPaymentDialog from './AddPaymentDialog';
import { getPaymentMethods, getVendorPayment, vendorPayment } from '@/api/paymentMethod.api';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const TableSkeleton = () => (
  <div className="space-y-4 px-4">
    {Array.from({ length: 5 }).map((_, index) => (
      <TableRow key={index} className="h-12">
        {/* Vendor Column */}
        <TableCell className="px-8 py-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-6 w-32 mb-1" />

            </div>
          </div>
        </TableCell>
        <TableCell className="max-w-[200px]">
          <Skeleton className="h-6 w-full" />
        </TableCell>

        <TableCell className="px-12 py-3">

          <Skeleton className="h-6 w-24" />


        </TableCell>
        <TableCell className="px-12 py-3">
          <div className="flex items-center gap-1">
            <Skeleton className="h-6 w-24" />

          </div>
        </TableCell>

        {/* Due Amount Column */}
        <TableCell className="px-12 py-3">
          <div className="flex items-center gap-1">
            <Skeleton className="h-6 w-24" />

          </div>
        </TableCell>

        <TableCell className="px-12 py-3">
          <div className="flex items-center gap-1">
            <Skeleton className="h-6 w-24" />

          </div>
        </TableCell>

        {/* Status Column */}
        <TableCell className="px-12 py-3">
          <Skeleton className="h-6 w-16 rounded-full" />
        </TableCell>



      </TableRow>
    ))}
  </div>
);

// Mock data
const mockVendors = [
  { id: '1', name: 'Fresh Vegetables Co.', category: 'Vegetables' },
  { id: '2', name: 'Spice World', category: 'Spices' },
  { id: '3', name: 'Dairy Fresh', category: 'Dairy' }
];

const mockOrders = [
  {
    id: '1',
    vendorName: 'Fresh Vegetables Co.',
    items: 'Onions, Tomatoes, Potatoes',
    amount: 3500,
    date: '2024-01-15',
    status: 'received',
    notes: 'Fresh quality vegetables',
    image: null
  },
  {
    id: '2',
    vendorName: 'Spice World',
    items: 'Turmeric, Red Chili, Coriander',
    amount: 1200,
    date: '2024-01-14',
    status: 'pending',
    notes: 'Premium quality spices',
    image: null
  }
];

const mockPayments = [
  {
    id: '1',
    vendorName: 'Fresh Vegetables Co.',
    amount: 5000,
    date: '2024-01-15',
    method: 'Cash',
    notes: 'Payment for vegetables order',
    image: null
  },
  {
    id: '2',
    vendorName: 'Dairy Fresh',
    amount: 2800,
    date: '2024-01-14',
    method: 'Bank Transfer',
    notes: 'Monthly dairy payment',
    image: null
  }
];

const InventoryManagement = () => {

  const [isAddOrderModalOpen, setIsAddOrderModalOpen] = useState(false);
  const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState('all');
  const [ordersPage, setOrdersPage] = useState(1);
  const [paymentsPage, setPaymentsPage] = useState(1);
  const [ordersPageSize, setOrdersPageSize] = useState(10);
  const [paymentsPageSize, setPaymentsPageSize] = useState(10);
  const { user } = useAuth();

  const queryClient = useQueryClient();


  // Fetch payment methods
  const { data: paymentMethods } = useQuery({
    queryKey: ['paymentMethods'],
    queryFn: getPaymentMethods,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: overviewData } = useQuery({
    queryKey: ['inventoryOverview'],
    queryFn: () => getInventoryOverview({
      restaurantId: user?.restaurantId._id,
      vendorExpCatId: '68bff6c834305c04a6926d1f'
    }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });



  // Add this near your other state declarations
  const stats = {
    totalOrders: overviewData?.payload?.totalOrderValue || 0,
    totalPayments: overviewData?.payload?.totaPayments || 0,
    pendingAmount: overviewData?.payload?.totalPendingAmount || 0,
    activeVendors: overviewData?.payload?.totalActiveVendor || 0,
  };

  const { data: vendorsData, isLoading: vendorsLoading, error: vendorsError } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => getAllVendors({
      page: 1,
      limit: 100,
      search: '',
      isActive: true
    })
  });

  // Orders query
  const { data: orderData, isLoading: ordersLoading } = useQuery({
    queryKey: ['orders', ordersPage, ordersPageSize],
    queryFn: () => getInventoryList({
      page: ordersPage,
      limit: ordersPageSize,
      search: '',
      isActive: true,
      restaurantId: user?.restaurantId._id,
    })
  });

  // Payments query
  const { data: paymentData, isLoading: paymentsLoading } = useQuery({
    queryKey: ['payments', paymentsPage, paymentsPageSize, selectedMethod],
    queryFn: () => getVendorPayment({
      page: paymentsPage,
      limit: paymentsPageSize,
      search: '',
      isActive: true,
      restaurantId: user?.restaurantId._id,
      expenseCategoryId: "68bff6c834305c04a6926d1f",
      method: selectedMethod === 'all' ? undefined : selectedMethod
    })
  });
  const vendors = vendorsData?.payload?.data;
  const orders = orderData?.payload?.data;
  const payments = paymentData?.payload?.items || [];
  const totalPayments = paymentData?.payload?.total || 0;
  const totalPaymentPages = Math.ceil(totalPayments / paymentsPageSize) || 1;

  const { control, register } = useForm();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      setSelectedImage(file);
    }
  };

  const getTotalOrders = () => {
    // return orders.reduce((sum, order) => sum + order.amount, 0);
  };

  const getTotalPayments = () => {
    // return payments.reduce((sum, payment) => sum + payment.amount, 0);
  };

  const getPendingAmount = () => {
    // return getTotalOrders() - getTotalPayments();
  };

  const handleAddPayment = async (data) => {
    const formData = new FormData()
    formData.append("vendorId", data.vendorId)
    formData.append("amount", String(data.amount))
    formData.append("date", data.date)
    formData.append("method", data.method)
    if (data.image) {
      formData.append("image", data.image as File)
    }
    formData.append("description", data.description)
    formData.append("expenseCategoryId", "68bff6c834305c04a6926d1f")

    try {
      const response = await vendorPayment(formData);
      await queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast({
        variant: "default",
        title: "Success",
        description: response.message || "Payment added successfully",
      })
      setIsAddPaymentModalOpen(false)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add payment",
      })
    }
  }

  const handleAddOrder = async (data) => {
    const formData = new FormData()
    formData.append("vendorId", data.vendor)
    formData.append("items", data.orderItems)
    formData.append("amount", String(data.amount))
    formData.append("orderDate", data.orderDate)
    if (data.orderImage) {
      formData.append("image", data.orderImage as File)
    }
    formData.append("notes", data.orderNotes ?? "")

    try {
      const response = await AddInventoryOrder(formData);
      await queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({
        variant: "default",
        title: "Success",
        description: response.message || "Order added successfully",
      });
      setIsAddOrderModalOpen(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add order",
      });
    }
    setIsAddOrderModalOpen(false)
  }

  const filteredPayments = payments?.filter(payment =>
    selectedMethod === 'all' || payment.methodId === selectedMethod
  ) || [];


  

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Inventory Management</h1>
          <p className="text-muted-foreground">Manage vendor orders and payments</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsAddOrderModalOpen(true)}>Add Order</Button>
          <Button onClick={() => setIsAddPaymentModalOpen(true)}>Add Payment</Button>
          {/* <Dialog open={isAddOrderModalOpen} onOpenChange={setIsAddOrderModalOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Package className="h-4 w-4" />
                Add Order
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Vendor Order</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="vendor">Select Vendor</Label>
                  <Controller
                    control={control}
                    name="vendor"
                    render={({ field }) => (
                      <Select {...field}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose vendor" />
                        </SelectTrigger>
                        <SelectContent>
                          {vendors?.map((vendor) => (
                            <SelectItem key={vendor.id} value={vendor.id}>
                              {vendor.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="orderItems">Order Items</Label>
                  <Textarea id="orderItems" placeholder="Enter order items (e.g., Onions 10kg, Tomatoes 5kg)" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (₹)</Label>
                  <Input id="amount" type="number" placeholder="Enter total amount" />
                </div>  
                <div className="space-y-2">
                  <Label htmlFor="orderDate">Order Date</Label>
                  <Input id="orderDate" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="orderImage">Upload Receipt/Image</Label>
                  <Input
                    id="orderImage"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="orderNotes">Notes</Label>
                  <Textarea id="orderNotes" placeholder="Additional notes" />
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1">Save Order</Button>
                  <Button variant="outline" onClick={() => setIsAddOrderModalOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog> */}

          <AddOrderDialog vendors={vendors} isOpen={isAddOrderModalOpen} setIsOpen={setIsAddOrderModalOpen}
            onSubmit={handleAddOrder}
          />
          <AddPaymentDialog vendors={vendors} isOpen={isAddPaymentModalOpen} setIsOpen={setIsAddPaymentModalOpen} onSubmit={handleAddPayment} />
          {/* <Dialog open={isAddPaymentModalOpen} onOpenChange={setIsAddPaymentModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <IndianRupee className="h-4 w-4" />
                Add Payment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Payment to Vendor</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="paymentVendor">Select Vendor</Label>
                  <Select
                  
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose vendor" />
                    </SelectTrigger>
                    <SelectContent>
                      {vendors?.map(vendor => (
                        <SelectItem key={vendor.id} value={vendor.id}>
                          {vendor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentAmount">Amount (₹)</Label>
                  <Input id="paymentAmount" type="number" placeholder="Enter payment amount" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentDate">Payment Date</Label>
                  <Input id="paymentDate" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="upi">UPI</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentImage">Upload Receipt/Image</Label>
                  <Input
                    id="paymentImage"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentNotes">Notes</Label>
                  <Textarea id="paymentNotes" placeholder="Payment notes" />
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1">Save Payment</Button>
                  <Button variant="outline" onClick={() => setIsAddPaymentModalOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog> */}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold text-foreground">₹{stats.totalOrders}</p>
              </div>
              <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Package className="h-4 w-4 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Payments</p>
                <p className="text-2xl font-bold text-green-600">₹{stats.totalPayments}</p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                <IndianRupee className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Amount</p>
                <p className="text-2xl font-bold text-destructive">₹{stats.pendingAmount}</p>
              </div>
              <div className="h-8 w-8 bg-destructive/10 rounded-lg flex items-center justify-center">
                <Receipt className="h-4 w-4 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Vendors</p>
                <p className="text-2xl font-bold text-foreground">{stats.activeVendors}</p>
              </div>
              <div className="h-8 w-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <Truck className="h-4 w-4 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders and Payments Tabs */}
      <Card>
        <Tabs defaultValue="orders" className="w-full">
          <CardHeader>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="orders">Vendor Orders ({orders?.length}) </TabsTrigger>
              <TabsTrigger value="payments">Payments ({payments?.length})</TabsTrigger>
            </TabsList>
          </CardHeader>

          <TabsContent value="orders">
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input placeholder="Search orders..." className="pl-10" />
                    </div>
                  </div>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-48">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="received">Received</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {ordersLoading ? (
                  <TableSkeleton />
                ) : (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Vendor</TableHead>
                          <TableHead>Items</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Date</TableHead>
                          {/* <TableHead>Status</TableHead> */}
                          <TableHead>Notes</TableHead>
                          <TableHead>Proof</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders?.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback>{order.vendor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{order.vendor.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="max-w-xs truncate">{order.items}</div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <IndianRupee className="h-3 w-3" />
                                <span className="font-medium">{order.amount.toLocaleString()}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(order.orderDate).toLocaleDateString()}
                              </div>
                            </TableCell>
                            {/* <TableCell>
                          <Badge variant={order.status === 'received' ? 'default' : 'secondary'}>
                            {order.status}
                          </Badge>
                        </TableCell> */}
                            <TableCell>
                              <div className="max-w-xs truncate text-muted-foreground">
                                {order.notes}
                              </div>
                            </TableCell>

                            <TableCell>
                              {order.imageUrl ? (
                                <Badge
                                  variant="secondary"
                                  className="text-xs cursor-pointer hover:bg-secondary/80 transition-colors"
                                  onClick={() => setImagePreview(order.imageUrl)}
                                >
                                  <Receipt className="mr-1 h-3 w-3" />
                                  Attached
                                </Badge>
                              ) : (
                                <span className="text-xs text-muted-foreground">No receipt</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {orderData?.payload?.total > 0 && (
                      <div className="mt-4">
                        <div className="text-sm text-muted-foreground mb-2">
                          Showing {Math.min((ordersPage - 1) * ordersPageSize + 1, orderData.payload.total)}-{Math.min(ordersPage * ordersPageSize, orderData.payload.total)} of {orderData.payload.total} orders
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setOrdersPage(p => Math.max(p - 1, 1))}
                            disabled={ordersPage === 1}
                          >
                            Previous
                          </Button>
                          <div className="text-sm">
                            Page {ordersPage} of {Math.ceil(orderData.payload.total / ordersPageSize)}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setOrdersPage(p => Math.min(p + 1, Math.ceil(orderData.payload.total / ordersPageSize)))}
                            disabled={ordersPage >= Math.ceil(orderData.payload.total / ordersPageSize)}
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                    <DataTablePagination
                      currentPage={ordersPage}
                      totalItems={orderData?.payload?.totalCount || 0}
                      itemsPerPage={ordersPageSize}
                      totalPages={Math.ceil(orderData?.payload?.totalCount/ordersPageSize) || 1}
                      startIndex={(ordersPage - 1) * ordersPageSize + 1}
                      endIndex={Math.min(ordersPage * ordersPageSize, orderData?.payload?.totalCount || 0)}
                      hasNextPage={ordersPage < (Math.ceil(orderData?.payload?.totalCount/ordersPageSize) || 1)}
                      hasPreviousPage={ordersPage > 1}
                      onPageChange={setOrdersPage}
                      onNextPage={() => setOrdersPage(p => Math.min(p + 1, orderData?.payload?.totalPages || 1))}
                      onPreviousPage={() => setOrdersPage(p => Math.max(p - 1, 1))}
                      onItemsPerPageChange={setOrdersPageSize}
                    />
                  </>
                )}
              </div>
            </CardContent>
          </TabsContent>

          <TabsContent value="payments">
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input placeholder="Search payments..." className="pl-10" />
                    </div>
                  </div>
                  <Select
                    value={selectedMethod}
                    onValueChange={setSelectedMethod}
                  >
                    <SelectTrigger className="w-48">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Methods</SelectItem>
                      {paymentMethods?.payload?.data.map((method) => (
                        <SelectItem key={method._id} value={method._id}>
                          {method.type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead>Proof</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.map((payment) => (
                      <TableRow key={payment._id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{payment?.vendor?.name?.split(' ').map(n => n[0]).join('') || <User className="h-4 w-4" />}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{payment?.vendor?.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-green-600">
                            <IndianRupee className="h-3 w-3" />
                            <span className="font-medium">{payment.amount.toLocaleString()}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(payment.date).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{payment.method.type}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate text-muted-foreground">
                            {payment.description}
                          </div>
                        </TableCell>
                        <TableCell>
                          {payment.proof ? (
                            <Badge
                              variant="secondary"
                              className="text-xs cursor-pointer hover:bg-secondary/80 transition-colors"
                              onClick={() => setImagePreview(payment.proof)}
                            >
                              <Receipt className="mr-1 h-3 w-3" />
                              Attached
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">No proof</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <DataTablePagination
                  currentPage={paymentsPage}
                  totalPages={paymentData?.payload?.totalPages || 1}
                  totalItems={paymentData?.payload?.totalRecord || 0}
                  itemsPerPage={paymentsPageSize}
                  startIndex={(paymentsPage - 1) * paymentsPageSize + 1}
                  endIndex={Math.min(paymentsPage * paymentsPageSize, paymentData?.payload?.totalRecord || 0)}
                  hasNextPage={paymentsPage < paymentData?.payload?.totalPages}
                  hasPreviousPage={paymentsPage > 1}
                  onPageChange={setPaymentsPage}
                  onNextPage={() => setPaymentsPage(p => Math.min(p + 1, paymentData?.payload?.totalPages))}
                  onPreviousPage={() => setPaymentsPage(p => Math.max(p - 1, 1))}
                  onItemsPerPageChange={setPaymentsPageSize}
                />
              </div>
            </CardContent>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Image Preview Dialog */}
      <Dialog open={!!imagePreview} onOpenChange={(open) => !open && setImagePreview(null)}>
        <DialogContent className="max-w-3xl min-h-[300px]">
          <DialogHeader>
            <DialogTitle>Receipt Image</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center">
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Receipt"
                className="max-h-[70vh] max-w-full object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryManagement;