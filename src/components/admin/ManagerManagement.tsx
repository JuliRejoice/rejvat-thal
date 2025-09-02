import React, { useState } from 'react';
import { Plus, Search, Filter, Eye, Edit2, ToggleLeft, ToggleRight, Mail, Phone, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { usePagination } from '@/hooks/use-pagination';
import { DataTablePagination } from '@/components/common/DataTablePagination';
import { useIsMobile } from '@/hooks/use-mobile';
import { useMutation } from '@tanstack/react-query';
import { signUp } from '@/api/auth.api';
import { StaffManagerForm } from '../common/StaffManagerForm';
import { useToast } from '@/hooks/use-toast';

const mockManagers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@restaurant.com',
    phone: '+91 9876543210',
    restaurant: 'Spice Garden',
    restaurantId: 'rest1',
    joinDate: '2024-01-15',
    status: 'active',
    address: '123 Main St, Mumbai',
    avatar: null
  },
  {
    id: '2',
    name: 'Sarah Wilson',
    email: 'sarah@restaurant.com',
    phone: '+91 9876543211',
    restaurant: 'Curry House',
    restaurantId: 'rest2',
    joinDate: '2024-02-20',
    status: 'inactive',
    address: '456 Park Ave, Delhi',
    avatar: null
  }
];

const mockRestaurants = [
  { id: 'rest1', name: 'Spice Garden' },
  { id: 'rest2', name: 'Curry House' },
  { id: 'rest3', name: 'Royal Kitchen' }
];

const ManagerManagement = () => {
  const [managers, setManagers] = useState(mockManagers);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedManager, setSelectedManager] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const { mutate: createManager, isPending } = useMutation({
    mutationKey: ['sign-up'],
    mutationFn: signUp,
    onSuccess: () => {
      toast({
        variant: "default",
        title: "Manger created",
        description: "Manger created successfully.",
      });
      setIsAddModalOpen(false);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create staff. Try again.",
      });
      console.error("Error creating staff:", error);
    },
  });

  const filteredManagers = managers.filter(manager => {
    const matchesSearch = manager.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         manager.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || manager.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const {
    currentPage,
    totalPages,
    paginatedData: paginatedManagers,
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
    data: filteredManagers,
    itemsPerPage
  });

  const handleStatusToggle = (managerId) => {
    console.log('Toggle status for manager:', managerId);
  };

  const handleViewManager = (manager) => {
    setSelectedManager(manager);
    setIsViewModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manager Management</h1>
          <p className="text-muted-foreground">Manage restaurant managers across all locations</p>
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Manager
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Add New Manager</DialogTitle>
            </DialogHeader>
            <StaffManagerForm
              restaurants={mockRestaurants}
              onSubmit={createManager}
              isPending={isPending}
              type="manager"
              onCancel={() => setIsAddModalOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search managers..."
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

      {/* Managers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Managers ({filteredManagers.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Manager</TableHead>
                  {!isMobile && <TableHead>Restaurant</TableHead>}
                  {!isMobile && <TableHead>Contact</TableHead>}
                  {!isMobile && <TableHead>Join Date</TableHead>}
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedManagers.map((manager) => (
                  <TableRow key={manager.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={manager.avatar || ''} />
                          <AvatarFallback>{manager.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{manager.name}</div>
                          <div className="text-sm text-muted-foreground">{manager.email}</div>
                          {isMobile && (
                            <div className="text-sm text-muted-foreground">
                              {manager.restaurant} • {manager.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    {!isMobile && (
                      <TableCell>
                        <div className="font-medium">{manager.restaurant}</div>
                      </TableCell>
                    )}
                    {!isMobile && (
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-3 w-3" />
                            {manager.phone}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {manager.email}
                          </div>
                        </div>
                      </TableCell>
                    )}
                    {!isMobile && <TableCell>{manager.joinDate}</TableCell>}
                    <TableCell>
                      <Badge variant={manager.status === 'active' ? 'default' : 'secondary'}>
                        {manager.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1 sm:gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewManager(manager)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusToggle(manager.id)}
                        >
                          {manager.status === 'active' ? (
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

      {/* View Manager Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Manager Details</DialogTitle>
          </DialogHeader>
          {selectedManager && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedManager.avatar || ''} />
                  <AvatarFallback className="text-lg">
                    {selectedManager.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{selectedManager.name}</h3>
                  <Badge variant={selectedManager.status === 'active' ? 'default' : 'secondary'}>
                    {selectedManager.status}
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Email</span>
                  </div>
                  <p className="text-sm text-muted-foreground pl-6">{selectedManager.email}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Phone</span>
                  </div>
                  <p className="text-sm text-muted-foreground pl-6">{selectedManager.phone}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Address</span>
                  </div>
                  <p className="text-sm text-muted-foreground pl-6">{selectedManager.address}</p>
                </div>
                
                <div className="space-y-2">
                  <span className="text-sm font-medium">Restaurant</span>
                  <p className="text-sm text-muted-foreground">{selectedManager.restaurant}</p>
                </div>
                
                <div className="space-y-2">
                  <span className="text-sm font-medium">Join Date</span>
                  <p className="text-sm text-muted-foreground">{selectedManager.joinDate}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManagerManagement;