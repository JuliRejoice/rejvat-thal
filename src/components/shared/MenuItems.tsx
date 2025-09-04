import React, { useState } from 'react';
import { Plus, Search, Filter, Edit2, ToggleLeft, ToggleRight, IndianRupee } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { usePagination } from '@/hooks/use-pagination';
import { DataTablePagination } from '@/components/common/DataTablePagination';
import { useIsMobile } from '@/hooks/use-mobile';

// Mock data
const mockItems = [
  {
    id: '1',
    name: 'Roti',
    category: 'Bread',
    price: 5,
    description: 'Fresh wheat bread',
    status: 'active',
    restaurant: 'Spice Garden'
  },
  {
    id: '2',
    name: 'Dal Tadka',
    category: 'Curry',
    price: 45,
    description: 'Yellow lentil curry with spices',
    status: 'active',
    restaurant: 'Spice Garden'
  },
  {
    id: '3',
    name: 'Butter Naan',
    category: 'Bread',
    price: 25,
    description: 'Leavened bread with butter',
    status: 'deactive',
    restaurant: 'Spice Garden'
  },
  {
    id: '4',
    name: 'Paneer Curry',
    category: 'Curry',
    price: 85,
    description: 'Cottage cheese in rich gravy',
    status: 'active',
    restaurant: 'Spice Garden'
  }
];

const categories = ['Bread', 'Curry', 'Rice', 'Vegetable', 'Snacks', 'Beverages'];

const MenuItems = () => {
  const [items] = useState(mockItems);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<typeof mockItems[0] | null>(null);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const isMobile = useIsMobile();

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const {
    currentPage,
    totalPages,
    paginatedData: paginatedItems,
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
    data: filteredItems,
    itemsPerPage
  });

  const handleStatusToggle = (itemId: string) => {
    console.log('Toggle status for item:', itemId);
  };

  const handleEditItem = (item: typeof mockItems[0]) => {
    setEditingItem(item);
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditingItem(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Menu Items</h1>
          <p className="text-muted-foreground">Manage restaurant menu items and pricing</p>
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="itemName">Item Name</Label>
                <Input 
                  id="itemName" 
                  placeholder="Enter item name" 
                  defaultValue={editingItem?.name || ''}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select defaultValue={editingItem?.category || ''}>
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
                <Label htmlFor="price">Price (₹)</Label>
                <Input 
                  id="price" 
                  type="number" 
                  placeholder="Enter price" 
                  defaultValue={editingItem?.price || ''}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Enter item description" 
                  defaultValue={editingItem?.description || ''}
                />
              </div>
              <div className="flex gap-2">
                <Button className="flex-1">
                  {editingItem ? 'Update Item' : 'Save Item'}
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
                <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold text-foreground">{items.length}</p>
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
                <p className="text-sm font-medium text-muted-foreground">Active Items</p>
                <p className="text-2xl font-bold text-primary">
                  {items.filter(item => item.status === 'active').length}
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
                <p className="text-sm font-medium text-muted-foreground">Categories</p>
                <p className="text-2xl font-bold text-foreground">
                  {new Set(items.map(item => item.category)).size}
                </p>
              </div>
              <div className="h-8 w-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <Filter className="h-4 w-4 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Price</p>
                <p className="text-2xl font-bold text-foreground">
                  ₹{Math.round(items.reduce((sum, item) => sum + item.price, 0) / items.length)}
                </p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                <IndianRupee className="h-4 w-4 text-green-600" />
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
                  placeholder="Search items..."
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
                <SelectItem value="deactive">Deactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>Menu Items ({filteredItems.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  {!isMobile && <TableHead>Category</TableHead>}
                  <TableHead>Price</TableHead>
                  {!isMobile && <TableHead>Description</TableHead>}
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.name}</div>
                        {isMobile && (
                          <div className="text-sm text-muted-foreground">
                            {item.category} • {item.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    {!isMobile && (
                      <TableCell>
                        <Badge variant="outline">{item.category}</Badge>
                      </TableCell>
                    )}
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <IndianRupee className="h-3 w-3" />
                        <span className="font-medium">{item.price}</span>
                      </div>
                    </TableCell>
                    {!isMobile && (
                      <TableCell>
                        <div className="max-w-xs truncate text-muted-foreground">
                          {item.description}
                        </div>
                      </TableCell>
                    )}
                    <TableCell>
                      <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1 sm:gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditItem(item)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusToggle(item.id)}
                        >
                          {item.status === 'active' ? (
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
    </div>
  );
};

export default MenuItems;