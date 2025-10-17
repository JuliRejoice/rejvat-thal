import { useEffect, useState, useContext } from 'react';

import type { MenuItem, MenuStatistics } from '@/api/menu.api';
import { menuApi, type GetMenuItemsParams } from '@/api/menu.api';
import { getRestaurants } from '@/api/restaurant.api';
import { Plus, Search, Filter, Edit2, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { DataTablePagination } from '@/components/common/DataTablePagination';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { createMenuCategory, getAllMenuCategory } from '@/api/menuCategory.api';
import { Dirham } from '@/components/Svg';

const MenuItems = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [categories, setCategories] = useState<Array<{ _id: string, name: string }>>([]);
  const [restaurants, setRestaurants] = useState<Array<{ _id: string, name: string }>>([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<MenuItem> | null>(null);
  const [itemsPerPage, setItemsPerPage] = useState<number>(5);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [formData, setFormData] = useState<{
    name: string;
    categoryId: string;
    restaurantId: string;
    price: string;
    description: string;
  }>({
    name: '',
    categoryId: '',
    restaurantId: user?.role === 'manager' ? user.restaurantId?._id || '' : '',
    price: '',
    description: ''
  });
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    restaurantId: user?.role === 'manager' ? user.restaurantId?._id : ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statistics, setStatistics] = useState<MenuStatistics | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const isMobile = useIsMobile();


  const fetchMenuStatistics = async () => {
    try {
      setIsLoadingStats(true);
      const stats = await menuApi.getMenuStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Failed to fetch menu statistics:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load menu statistics.'
      });
    } finally {
      setIsLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchMenuStatistics();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categories = await menuApi.getAllCategories();
        setCategories(categories);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load categories.'
        });
      }
    };

    fetchCategories();
  }, []);
  
  const fetchMenuItems = async (page: number = currentPage, limit: number = itemsPerPage) => {
    try {
      setIsLoading(true);
      const params: GetMenuItemsParams = {
        page,
        limit,
      };

      if (filterCategory !== 'all') {
        params.categoryId = filterCategory;
      }

      if (filterStatus !== 'all') {
        params.isActive = filterStatus === 'active' ? 'true' : 'false';
      }

      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await menuApi.getMenuItems(params);
      const { items: fetchedItems = [], total = 0 } = response || {};

      const transformedItems = (fetchedItems || []).map((item: any) => ({
        ...item,
        status: item.isActive ? 'active' : 'inactive',
        category: item.categoryId?.name || 'Uncategorized'
      }));

      setItems(transformedItems);
      setTotalItems(Number(total) || 0);
    } catch (error) {
      console.error('Failed to fetch menu items:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load menu items. Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    setCurrentPage(1);
  }, [filterCategory, filterStatus, searchTerm, itemsPerPage]);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await getRestaurants({});
        console.log(response, 'response.data');
        if (response.success) {
          setRestaurants(response.payload.data.map((r: any) => ({ _id: r._id, name: r.name })));
        }
      } catch (error) {
        console.error('Error fetching restaurants:', error);
      }
    };

    fetchRestaurants();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        await fetchMenuItems(currentPage);
      } catch (error) {
        console.error('Error fetching menu items:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentPage, filterCategory, filterStatus, searchTerm, itemsPerPage]);

  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;
  const startIndex = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endIndex = totalItems > 0 ? Math.min(currentPage * itemsPerPage, totalItems) : 0;

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const nextPage = () => {
    if (hasNextPage) {
      setCurrentPage(prev => Math.min(prev + 1, totalPages));
    }
  };

  const previousPage = () => {
    if (hasPreviousPage) {
      setCurrentPage(prev => Math.max(prev - 1, 1));
    }
  };

  // const handleItemsPerPageChange = (value: string) => {
  //   const newItemsPerPage = parseInt(value, 10);
  //   if (!isNaN(newItemsPerPage) && newItemsPerPage > 0) {
  //     setItemsPerPage(newItemsPerPage);
  //     // Reset to first page when changing items per page
  //     setCurrentPage(1);
  //   }
  // };

  // Wrapper function to handle the number type expected by DataTablePagination
  const handleItemsPerPageNumberChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  const handleStatusToggle = async (editItem: MenuItem) => {
    try {
      const itemToUpdate = items.find(item => item._id === editItem._id);
      if (!itemToUpdate) return;

      const updatedItem = await menuApi.updateMenuItem({
        id: editItem._id,
        isActive: !itemToUpdate.isActive,
        categoryId: itemToUpdate.categoryId._id
      });
      console.log(updatedItem, 'updatedItem');
      // Update the items state with the updated item
      setItems(items.map(item =>
        item._id === editItem._id ? {
          ...editItem,
          status: updatedItem.isActive ? 'active' : 'inactive',
          isActive: updatedItem.isActive
        } : item
      ));

      toast({
        title: 'Success',
        description: `Item ${updatedItem.isActive ? 'activated' : 'deactivated'} successfully`,
        variant: 'default',
      });
    } catch (error: any) {
      console.error('Error toggling item status:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to update item status. Please try again.',
      });
    }
  };

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      categoryId: item.categoryId?._id || '',
      restaurantId: item.restaurantId?._id || '',
      price: item.price?.toString() || '',
      description: item.description || ''
    });
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      categoryId: '',
      restaurantId: '',
      price: '',
      description: ''
    });
    setIsAddModalOpen(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      handleCloseModal();
    } else {
      setIsAddModalOpen(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSelectChange = (value: string, id: string) => {
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      const payload = {
        name: formData.name.trim(),
        categoryId: formData.categoryId,
        restaurantId: formData.restaurantId,
        price: parseFloat(formData.price),
        description: formData.description.trim() || undefined
      };

      if (editingItem) {
        await menuApi.updateMenuItem({
          id: editingItem._id,
          ...payload
        });
        toast({
          title: 'Success',
          description: 'Menu item updated successfully',
          variant: 'default',
        });
      } else {
        await menuApi.createMenuItem(payload);
        toast({
          title: 'Success',
          description: 'Menu item created successfully',
          variant: 'default',
        });
      }

      // Refresh the menu items list
      const { items } = await menuApi.getMenuItems({
        categoryId: filterCategory !== 'all' ? filterCategory : undefined,
        isActive: filterStatus !== 'all' ? filterStatus : undefined,
        search: searchTerm || undefined,
      });

      setItems(items || []);
      handleCloseModal();
    } catch (error: any) {
      console.error('Error saving menu item:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to save menu item. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setCategoryForm(prev => ({
      ...prev,
      [id]: value
    }));
  };
  
  // Add this handler for category form submission
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      // Call your API to create category
      await createMenuCategory({
        name: categoryForm.name,
        description: categoryForm.description || undefined,
        restaurantId: categoryForm.restaurantId
      });
      toast({
        title: 'Success',
        description: 'Category created successfully',
        variant: 'default',
      });
      // Refresh categories
      const cats = await getAllMenuCategory();
      setCategories(cats);
      // Reset form and close dialog
      setCategoryForm({
        name: '',
        description: '',
        restaurantId: user?.role === 'manager' ? user.restaurantId?._id : ''
      });
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Error creating category:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to create category. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Menu Items</h1>
          <p className="text-muted-foreground">Manage restaurant menu items and pricing</p>
        </div>

        <div className='flex justify-end gap-4'>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Category</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCategorySubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Category Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter category name"
                    value={categoryForm.name}
                    onChange={handleCategoryChange}
                    required
                    minLength={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter category description"
                    value={categoryForm.description}
                    onChange={handleCategoryChange}
                    rows={3}
                  />
                </div>

                {user?.role === 'admin' ? (
                  <div className="space-y-2">
                    <Label htmlFor="restaurantId">Restaurant *</Label>
                    <Select
                      value={categoryForm.restaurantId}
                      onValueChange={(value) =>
                        setCategoryForm(prev => ({ ...prev, restaurantId: value }))
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select restaurant" />
                      </SelectTrigger>
                      <SelectContent>
                        {restaurants.map(restaurant => (
                          <SelectItem key={restaurant._id} value={restaurant._id}>
                            {restaurant.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>Restaurant</Label>
                    <Input
                      value={user?.restaurantId?.name || ''}
                      disabled
                    />
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddModalOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Creating...' : 'Create Category'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>



          <Dialog open={isAddModalOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md" onInteractOutside={handleCloseModal}>
              <DialogHeader>
                <DialogTitle>{editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4" key={editingItem?._id || 'new'}>
                <div className="space-y-2">
                  <Label htmlFor="name">Item Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter item name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    minLength={2}
                  />
                </div>
                <div className="space-y-2">
                  <div className={`grid gap-4 ${user?.role == 'admin' ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    <div className="space-y-2">
                      <Label htmlFor="categoryId">Category *</Label>
                      <Select
                        value={formData.categoryId}
                        onValueChange={(value) => handleSelectChange(value, 'categoryId')}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories?.map(category => (
                            <SelectItem key={category._id} value={category._id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {
                      user?.role === 'admin' ? (
                        <div className="space-y-2">
                          <Label htmlFor="restaurantId">Restaurant *</Label>
                          <Select
                            value={formData.restaurantId}
                            onValueChange={(value) => handleSelectChange(value, 'restaurantId')}
                            required
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select restaurant" />
                            </SelectTrigger>
                            <SelectContent>
                              {restaurants.map(restaurant => (
                                <SelectItem key={restaurant._id} value={restaurant._id}>
                                  {restaurant.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Label htmlFor="restaurantId">Restaurant</Label>
                          <Input
                            id="restaurantId"
                            value={user?.restaurantId?.name || 'Restaurant not assigned'}
                            disabled
                          />
                        </div>
                      )
                    }
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price (AED) *</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="Enter price"

                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    min="0.01"
                    step="0.01"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter item description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {editingItem ? 'Updating...' : 'Creating...'}
                      </>
                    ) : editingItem ? 'Update Item' : 'Create Item'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseModal}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold text-foreground">{statistics?.totalMenuItems}</p>
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
                  {statistics?.totalActiveItems}
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
                  {statistics?.totalUniqueCategories}
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
                <div className="flex items-center">
                  <Dirham size={18} className="mr-1" />
                  <span className="text-2xl font-bold text-foreground">
                    {Math.round(statistics?.averagePrice || 0)}
                  </span>
                </div>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Dirham size={16} className="text-green-600" />
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
                  }}
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={filterCategory}
              onValueChange={(value) => {
                setFilterCategory(value);
              }}
            >
              <SelectTrigger className={isMobile ? "w-full" : "w-48"}>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category._id} value={category._id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={(value) => { setFilterStatus(value); }}>
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
          <CardTitle>Menu Items ({items.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  // Skeleton loading state
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={`skeleton-${index}`}>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="h-9 w-9 mx-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : items.length > 0 ? (
                  items.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.categoryId?.name || 'N/A'}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Dirham size={12} className="mr-1" />
                          <span>{item.price}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">{item.description || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant={item.isActive ? 'default' : 'secondary'} className="capitalize">
                          {item.isActive ? 'Active' : 'Inactive'}
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
                            onClick={() => handleStatusToggle(item)}
                          >
                            {item.isActive ? (
                              <ToggleRight className="h-4 w-4 text-primary" />
                            ) : (
                              <ToggleLeft className="h-4 w-4 text-destructive" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      No menu items found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="border-t">
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
              onItemsPerPageChange={handleItemsPerPageNumberChange}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MenuItems;