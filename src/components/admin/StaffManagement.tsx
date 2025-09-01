import React, { useState } from 'react';
import { Plus, Search, Filter, Eye, Edit2, ToggleLeft, ToggleRight, Calendar, Clock, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePagination } from '@/hooks/use-pagination';
import { DataTablePagination } from '@/components/common/DataTablePagination';
import { useIsMobile } from '@/hooks/use-mobile';
import { useMutation } from '@tanstack/react-query';
import { signUp } from '@/api/auth.api';

// Mock data
const mockStaff = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice@restaurant.com',
    phone: '+91 9876543210',
    restaurant: 'Spice Garden',
    restaurantId: 'rest1',
    position: 'Chef',
    joinDate: '2024-01-15',
    status: 'active',
    attendanceRate: 95,
    leaveRequests: 2
  },
  {
    id: '2',
    name: 'Bob Smith',
    email: 'bob@restaurant.com',
    phone: '+91 9876543211',
    restaurant: 'Curry House',
    restaurantId: 'rest2',
    position: 'Waiter',
    joinDate: '2024-02-20',
    status: 'active',
    attendanceRate: 88,
    leaveRequests: 1
  }
];

const mockAttendance = [
  { date: '2024-01-15', status: 'present', checkIn: '09:00', checkOut: '18:00' },
  { date: '2024-01-16', status: 'present', checkIn: '09:15', checkOut: '18:10' },
  { date: '2024-01-17', status: 'absent', checkIn: null, checkOut: null }
];

const mockLeaveRequests = [
  {
    id: '1',
    date: '2024-01-20',
    reason: 'Medical appointment',
    status: 'approved',
    appliedOn: '2024-01-18'
  }
];

const mockRestaurants = [
  { id: 'rest1', name: 'Spice Garden' },
  { id: 'rest2', name: 'Curry House' },
  { id: 'rest3', name: 'Royal Kitchen' }
];

const StaffManagement = () => {
  const [staff] = useState(mockStaff);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<typeof mockStaff[0] | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const isMobile = useIsMobile();

  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    phone: '',
    address: '',
    restaurantId: '68b1467308fb326d4d8a7de1',
    position: 'staff',
    isUserType: 'staff',
    file: null
  });

  const { mutate: createManager, isPending } = useMutation({
    mutationKey: ['sign-up'],
    mutationFn: signUp,
    onSuccess: (data) => {
      console.log('Manager created successfully:', data);
      setIsAddModalOpen(false);
      setFormData({
        email: '',
        name: '',
        password: '',
        phone: '',
        address: '',
        restaurantId: '68b1467308fb326d4d8a7de1',
        position: 'staff',
        isUserType: 'staff',
        file: null
      });
    },
    onError: (error) => {
      console.error('Error creating manager:', error);
    }
  });

  const filteredStaff = staff.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || member.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const {
    currentPage,
    totalPages,
    paginatedData: paginatedStaff,
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
    data: filteredStaff,
    itemsPerPage
  });

  const handleViewStaff = (staffMember: typeof mockStaff[0]) => {
    setSelectedStaff(staffMember);
    setIsViewModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'file' ? files[0] : value
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    console.log("formData", formData)
    if (!formData.email || !formData.name || !formData.password || !formData.phone || !formData.address || !formData.restaurantId) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Call the API
    createManager(formData);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Staff Management</h1>
          <p className="text-muted-foreground">Manage restaurant staff and their activities</p>
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Staff
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Staff Member</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input 
                    name="name" 
                    id="name" 
                    placeholder="Enter manager name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input 
                    name="email" 
                    id="email" 
                    type="email" 
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input 
                    name="password" 
                    id="password" 
                    type="password" 
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input 
                    name="phone" 
                    id="phone" 
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="restaurantId">Restaurant *</Label>
                  <Select 
                    value={formData.restaurantId} 
                    onValueChange={(value) => handleSelectChange('restaurantId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select restaurant" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockRestaurants.map(restaurant => (
                        <SelectItem key={restaurant.id} value={restaurant.id}>
                          {restaurant.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Textarea 
                    name="address" 
                    id="address" 
                    placeholder="Enter address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="file">Upload Picture</Label>
                  <Input 
                    name="file" 
                    id="file"
                    type="file" 
                    accept="image/*"
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    className="flex-1" 
                    type="submit"
                    disabled={isPending}
                  >
                    {isPending ? 'Creating...' : 'Save Manager'}
                  </Button>
                  <Button 
                    variant="outline" 
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Staff</p>
                <p className="text-2xl font-bold text-foreground">24</p>
              </div>
              <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Eye className="h-4 w-4 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Present Today</p>
                <p className="text-2xl font-bold text-primary">22</p>
              </div>
              <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Clock className="h-4 w-4 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">On Leave</p>
                <p className="text-2xl font-bold text-amber-600">2</p>
              </div>
              <div className="h-8 w-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-4 w-4 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Leave Requests</p>
                <p className="text-2xl font-bold text-destructive">3</p>
              </div>
              <div className="h-8 w-8 bg-destructive/10 rounded-lg flex items-center justify-center">
                <FileText className="h-4 w-4 text-destructive" />
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
                  placeholder="Search staff..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    reset();
                  }}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={(value) => { setFilterStatus(value); reset(); }}>
              <SelectTrigger className={isMobile ? "w-full" : "w-48"}>
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Staff Table */}
      <Card>
        <CardHeader>
          <CardTitle>Staff Members ({filteredStaff.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff Member</TableHead>
                  {!isMobile && <TableHead>Position</TableHead>}
                  {!isMobile && <TableHead>Restaurant</TableHead>}
                  {!isMobile && <TableHead>Attendance</TableHead>}
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedStaff.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{member.name}</div>
                          <div className="text-sm text-muted-foreground">{member.email}</div>
                          {isMobile && (
                            <div className="text-sm text-muted-foreground">
                              {member.position} • {member.restaurant} • {member.attendanceRate}%
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    {!isMobile && (
                      <TableCell>
                        <Badge variant="outline">{member.position}</Badge>
                      </TableCell>
                    )}
                    {!isMobile && <TableCell>{member.restaurant}</TableCell>}
                    {!isMobile && (
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-medium">{member.attendanceRate}%</div>
                          <div className="w-16 bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{ width: `${member.attendanceRate}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                    )}
                    <TableCell>
                      <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                        {member.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1 sm:gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewStaff(member)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          {member.status === 'active' ? (
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

      {/* View Staff Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Staff Details</DialogTitle>
          </DialogHeader>
          {selectedStaff && (
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="info">Information</TabsTrigger>
                <TabsTrigger value="attendance">Attendance</TabsTrigger>
                <TabsTrigger value="leaves">Leave Requests</TabsTrigger>
              </TabsList>
              
              <TabsContent value="info" className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-lg">
                      {selectedStaff.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">{selectedStaff.name}</h3>
                    <p className="text-muted-foreground">{selectedStaff.position}</p>
                    <Badge variant={selectedStaff.status === 'active' ? 'default' : 'secondary'}>
                      {selectedStaff.status}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <p className="text-sm text-muted-foreground">{selectedStaff.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Phone</label>
                    <p className="text-sm text-muted-foreground">{selectedStaff.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Restaurant</label>
                    <p className="text-sm text-muted-foreground">{selectedStaff.restaurant}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Join Date</label>
                    <p className="text-sm text-muted-foreground">{selectedStaff.joinDate}</p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="attendance" className="space-y-4">
                <div className="grid grid-cols-1 gap-2">
                  {mockAttendance.map((record, index) => (
                    <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{record.date}</p>
                        <Badge variant={record.status === 'present' ? 'default' : 'destructive'}>
                          {record.status}
                        </Badge>
                      </div>
                      <div className="text-right">
                        {record.checkIn && (
                          <div className="text-sm">
                            <p>In: {record.checkIn}</p>
                            <p>Out: {record.checkOut}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="leaves" className="space-y-4">
                <div className="grid grid-cols-1 gap-2">
                  {mockLeaveRequests.map((request) => (
                    <div key={request.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{request.date}</p>
                          <p className="text-sm text-muted-foreground">{request.reason}</p>
                          <p className="text-xs text-muted-foreground">Applied: {request.appliedOn}</p>
                        </div>
                        <Badge variant={request.status === 'approved' ? 'default' : 'secondary'}>
                          {request.status}
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

export default StaffManagement;