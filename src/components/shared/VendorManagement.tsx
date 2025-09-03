import React, { useState } from 'react';
import { Plus, Search, Filter, Eye, Edit2, ToggleLeft, ToggleRight, Phone, Mail, MapPin, IndianRupee } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePagination } from '@/hooks/use-pagination';
import { DataTablePagination } from '@/components/common/DataTablePagination';
import { useIsMobile } from '@/hooks/use-mobile';

// Mock data
const mockVendors = [
  {
    id: '1',
    name: 'Fresh Vegetables Co.',
    category: 'Vegetables',
    contact: 'Ramesh Gupta',
    phone: '+91 9876543210',
    email: 'ramesh@freshveg.com',
    address: 'Wholesale Market, Mumbai',
    status: 'active',
    totalPaid: 45000,
    totalDue: 5000,
    lastOrder: '2024-01-15'
  },
  {
    id: '2',
    name: 'Spice World',
    category: 'Spices',
    contact: 'Sunita Shah',
    phone: '+91 9876543211',
    email: 'sunita@spiceworld.com',
    address: 'Spice Market, Mumbai',
    status: 'active',
    totalPaid: 28000,
    totalDue: 2500,
    lastOrder: '2024-01-14'
  },
  {
    id: '3',
    name: 'Dairy Fresh',
    category: 'Dairy',
    contact: 'Amit Kumar',
    phone: '+91 9876543212',
    email: 'amit@dairyfresh.com',
    address: 'Dairy Complex, Mumbai',
    status: 'inactive',
    totalPaid: 15000,
    totalDue: 0,
    lastOrder: '2023-12-20'
  }
];

const mockPaymentHistory = [
  {
    id: '1',
    date: '2024-01-15',
    type: 'payment',
    amount: 5000,
    description: 'Payment for vegetables order',
    method: 'Cash'
  },
  {
    id: '2',
    date: '2024-01-14',
    type: 'order',
    amount: 3000,
    description: 'Fresh vegetables order',
    method: 'Credit'
  },
  {
    id: '3',
    date: '2024-01-12',
    type: 'payment',
    amount: 10000,
    description: 'Payment for previous orders',
    method: 'Bank Transfer'
  }
];

const categories = ['Vegetables', 'Spices', 'Dairy', 'Grains', 'Oils', 'Packaging'];

const VendorManagement = () => {
  const [vendors] = useState(mockVendors);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<typeof mockVendors[0] | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<typeof mockVendors[0] | null>(null);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const isMobile = useIsMobile();

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.contact.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || vendor.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || vendor.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const {
    currentPage,
    totalPages,
    paginatedData: paginatedVendors,
    goToPage,
    nextPage,
    previousPage,
    hasNextPage,
    hasPreviousPage,
    startIndex,
    endIndex,
    totalItems,
    reset
  } = usePagination({
    data: filteredVendors,
    itemsPerPage
  });

  const handleViewVendor = (vendor: typeof mockVendors[0]) => {
    setSelectedVendor(vendor);
    setIsViewModalOpen(true);
  };

  const handleEditVendor = (vendor: typeof mockVendors[0]) => {
    setEditingVendor(vendor);
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditingVendor(null);
  };

  const getTotalDue = () => {
    return vendors.reduce((sum, vendor) => sum + vendor.totalDue, 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Vendor Management</h1>
          <p className="text-muted-foreground">Manage suppliers and track payments</p>
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Vendor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingVendor ? 'Edit Vendor' : 'Add New Vendor'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="vendorName">Vendor Name</Label>
                <Input 
                  id="vendorName" 
                  placeholder="Enter vendor name" 
                  defaultValue={editingVendor?.name || ''}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select defaultValue={editingVendor?.category || ''}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact">Contact Person</Label>
                <Input 
                  id="contact" 
                  placeholder="Enter contact person name" 
                  defaultValue={editingVendor?.contact || ''}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  placeholder="Enter phone number" 
                  defaultValue={editingVendor?.phone || ''}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="Enter email address" 
                  defaultValue={editingVendor?.email || ''}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea 
                  id="address" 
                  placeholder="Enter vendor address" 
                  defaultValue={editingVendor?.address || ''}
                />
              </div>
              <div className="flex gap-2">
                <Button className="flex-1">
                  {editingVendor ? 'Update Vendor' : 'Save Vendor'}
                </Button>
                <Button variant="outline" onClick={handleCloseModal}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Vendors</p>
                <p className="text-2xl font-bold text-foreground">{vendors.length}</p>
              </div>
              <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Plus className="h-4 w-4 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Vendors</p>
                <p className="text-2xl font-bold text-primary">
                  {vendors.filter(vendor => vendor.status === 'active').length}
                </p>
              </div>
              <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <ToggleRight className="h-4 w-4 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Due</p>
                <p className="text-2xl font-bold text-destructive">₹{getTotalDue().toLocaleString()}</p>
              </div>
              <div className="h-8 w-8 bg-destructive/10 rounded-lg flex items-center justify-center">
                <IndianRupee className="h-4 w-4 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Categories</p>
                <p className="text-2xl font-bold text-foreground">
                  {new Set(vendors.map(vendor => vendor.category)).size}
                </p>
              </div>
              <div className="h-8 w-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <Filter className="h-4 w-4 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search vendors..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    reset();
                  }}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterCategory} onValueChange={(value) => { setFilterCategory(value); reset(); }}>
              <SelectTrigger className={isMobile ? "w-full" : "w-48"}>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={(value) => { setFilterStatus(value); reset(); }}>
              <SelectTrigger className={isMobile ? "w-full" : "w-48"}>
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Deactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Vendors Table */}
      <Card>
        <CardHeader>
          <CardTitle>Vendors ({filteredVendors.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor</TableHead>
                  {!isMobile && <TableHead>Category</TableHead>}
                  {!isMobile && <TableHead>Contact</TableHead>}
                  {!isMobile && <TableHead>Total Paid</TableHead>}
                  <TableHead>Due Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedVendors.map((vendor) => (
                  <TableRow key={vendor.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>{vendor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{vendor.name}</div>
                          <div className="text-sm text-muted-foreground">{vendor.contact}</div>
                          {isMobile && (
                            <div className="text-sm text-muted-foreground">
                              {vendor.category} • {vendor.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    {!isMobile && (
                      <TableCell>
                        <Badge variant="outline">{vendor.category}</Badge>
                      </TableCell>
                    )}
                    {!isMobile && (
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-3 w-3" />
                            {vendor.phone}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {vendor.email}
                          </div>
                        </div>
                      </TableCell>
                    )}
                    {!isMobile && (
                      <TableCell>
                        <div className="flex items-center gap-1 text-green-600">
                          <IndianRupee className="h-3 w-3" />
                          <span className="font-medium">{vendor.totalPaid.toLocaleString()}</span>
                        </div>
                      </TableCell>
                    )}
                    <TableCell>
                      <div className="flex items-center gap-1 text-destructive">
                        <IndianRupee className="h-3 w-3" />
                        <span className="font-medium">{vendor.totalDue.toLocaleString()}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={vendor.status === 'active' ? 'default' : 'secondary'}>
                        {vendor.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1 sm:gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewVendor(vendor)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditVendor(vendor)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          {vendor.status === 'active' ? (
                            <ToggleLeft className="h-4 w-4 text-destructive" />
                          ) : (
                            <ToggleRight className="h-4 w-4 text-primary" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <DataTablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            startIndex={startIndex}
            endIndex={endIndex}
            hasNextPage={hasNextPage}
            hasPreviousPage={hasPreviousPage}
            onPageChange={goToPage}
            onNextPage={nextPage}
            onPreviousPage={previousPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </CardContent>
      </Card>

      {/* View Vendor Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Vendor Details</DialogTitle>
          </DialogHeader>
          {selectedVendor && (
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="info">Information</TabsTrigger>
                <TabsTrigger value="payments">Payment History</TabsTrigger>
              </TabsList>
              
              <TabsContent value="info" className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-lg">
                      {selectedVendor.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">{selectedVendor.name}</h3>
                    <p className="text-muted-foreground">{selectedVendor.category}</p>
                    <Badge variant={selectedVendor.status === 'active' ? 'default' : 'secondary'}>
                      {selectedVendor.status}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Contact Person</label>
                    <p className="text-sm text-muted-foreground">{selectedVendor.contact}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Phone</label>
                    <p className="text-sm text-muted-foreground">{selectedVendor.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <p className="text-sm text-muted-foreground">{selectedVendor.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Last Order</label>
                    <p className="text-sm text-muted-foreground">{selectedVendor.lastOrder}</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Address</label>
                  <p className="text-sm text-muted-foreground">{selectedVendor.address}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">₹{selectedVendor.totalPaid.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Total Paid</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-destructive">₹{selectedVendor.totalDue.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Total Due</p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="payments" className="space-y-4">
                <div className="space-y-2">
                  {mockPaymentHistory.map((transaction) => (
                    <div key={transaction.id} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.date} | {transaction.method}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${
                          transaction.type === 'payment' ? 'text-green-600' : 'text-destructive'
                        }`}>
                          {transaction.type === 'payment' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                        </p>
                        <Badge variant={transaction.type === 'payment' ? 'default' : 'secondary'}>
                          {transaction.type}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VendorManagement;