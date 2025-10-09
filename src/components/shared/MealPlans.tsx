import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { MealMenu, mealMenuApi, MealType, type CreateMealMenuPayload, type MealMenuStatistics } from '@/api/mealMenu.api';
import { getRestaurants } from '@/api/restaurant.api';
import { Plus, Search, Filter, Edit2, ToggleLeft, ToggleRight, IndianRupee, Eye, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { menuApi, type MenuItem } from '@/api/menu.api';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandInput,
  CommandEmpty,
} from "@/components/ui/command"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from '@/contexts/AuthContext';

const MealPlans = () => {
  const { toast } = useToast();
  const [meals, setMeals] = useState<MealMenu[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<MealMenu | null>(null);
  const [editingMeal, setEditingMeal] = useState<MealMenu | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoadingMenuItems, setIsLoadingMenuItems] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Array<{ _id: string, name: string, price: number, quantity: number }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [restaurants, setRestaurants] = useState<Array<{ _id: string, name: string }>>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState('');
  const [stats, setStats] = useState<MealMenuStatistics | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const {user}=useAuth();

  const [formData, setFormData] = useState<{
    name: string;
    type: MealType[];
    description: string;
    price: number;
    restaurantId: string;
  }>({
    name: '',
    type: ['lunch'],
    description: '',  
    price: 0,
    restaurantId: ''
  });

  // Fetch restaurants and menu items when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch restaurants

        const params: any = {
          page: 1,
          limit: 50,
        };

        if (filterStatus !== 'all') {
          params.isActive = filterStatus;
        }
        
        const [restaurantsResponse, mealMenusResponse] = await Promise.all([
          getRestaurants({}),
          mealMenuApi.getMealMenus(params)
        ]);

        // Handle restaurants response
        if (restaurantsResponse?.payload?.data) {
          setRestaurants(restaurantsResponse.payload.data);

          // Set restaurant based on user role
          if (user?.role === 'manager' && user?.restaurantId?._id) {
            // For managers, use their assigned restaurant
            const managerRestaurantId = user.restaurantId._id;
            setSelectedRestaurant(managerRestaurantId);
            setFormData(prev => ({
              ...prev,
              restaurantId: managerRestaurantId
            }));
            // Fetch menu items for the manager's restaurant
            fetchMenuItems(managerRestaurantId);
          } else if (user?.role === 'admin' && !selectedRestaurant) {
            // For admins, use the first restaurant if none selected
            const firstRestaurant = restaurantsResponse.payload.data[0]._id;
            setSelectedRestaurant(firstRestaurant);
            setFormData(prev => ({
              ...prev,
              restaurantId: firstRestaurant
            }));
            // Fetch menu items for the first restaurant
            fetchMenuItems(firstRestaurant);
          }
        }

        // Handle meal menus response
        if (mealMenusResponse?.items) {
          setMeals(mealMenusResponse.items);
        }

        // Fetch meal menu statistics
        try {
          setIsLoadingStats(true);
          const s = await mealMenuApi.getMealMenuStatistics();
          setStats(s);
        } catch (e) {
          console.error('Failed to load meal menu statistics', e);
        } finally {
          setIsLoadingStats(false);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load data',
          variant: 'destructive',
        });
      }
    };

    fetchData();
  }, [filterStatus]);


  // Function to fetch menu items for a restaurant
  const fetchMenuItems = React.useCallback(async (restaurantId: string) => {

    if (!restaurantId) {
      setMenuItems([]);
      return;
    }

    let isMounted = true;

    try {
      setIsLoadingMenuItems(true);

      const response = await menuApi.getMenuItems({
        restaurantId: restaurantId.trim(),
        limit: 100,
        isActive: 'active' // Only fetch active items
      });

   
      if (isMounted) {
        setMenuItems(response.items || []);
      }
    } catch (error) {
      console.error('Error fetching menu items:', error);
      if (isMounted) {
        toast({
          title: 'Error',
          description: 'Failed to load menu items',
          variant: 'destructive',
        });
        setMenuItems([]);
      }
    } finally {
      if (isMounted) {
        setIsLoadingMenuItems(false);
      }
    }

    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array as we don't use any external values

  // Fetch menu items when selected restaurant changes
  useEffect(() => {
    // Clear previous items when changing restaurants
    setMenuItems([]);

    if (selectedRestaurant) {
      fetchMenuItems(selectedRestaurant);
    } else {
      setMenuItems([]);
    }

    // Cleanup function
    return () => {
      console.log('Cleaning up restaurant change effect');
    };
  }, [selectedRestaurant]); // Add fetchMenuItems to dependencies

  const filteredMeals = meals;

  const handleViewMeal = (meal: MealMenu) => {
    setSelectedMeal(meal);
    setIsViewModalOpen(true);
  };

  const handleEditMeal = async (meal: MealMenu) => {
    setEditingMeal(meal);
    if (meal.restaurantId) {
      await fetchMenuItems(meal.restaurantId);
    }
    setFormData({
      name: meal.name,
      type: meal.type  as unknown as MealType[],
      description: meal.description,
      price: meal.price,
      restaurantId: meal.restaurantId || ''
    });

    // Map the meal items to the format expected by selectedItems
    const items = meal.items.map(item => {
      const menuItem = menuItems.find(mi => mi.name === item.itemId.name);
      return {
        _id: item.itemId?._id || '',
        name: item.itemId.name,
        price: item.itemId.price || 0,
        quantity: item.qty
      };
    });

    setSelectedItems(items);
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditingMeal(null);
    setSelectedItems([]);
    setFormData({
      name: '',
      type: [],
      description: '',
      price: 0,
      restaurantId: selectedRestaurant || ''
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: id === 'price' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSelectChange = (value: string, field: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.restaurantId) {
      toast({
        title: 'Error',
        description: 'Please select a restaurant',
        variant: 'destructive',
      });
      return;
    }

    if (selectedItems.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one menu item',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const payload: CreateMealMenuPayload = {
        name: formData.name,
        type: formData.type as unknown as MealType[],
        description: formData.description,
        price: formData.price,
        itemPrice: calculateTotalPrice(),
        restaurantId: formData.restaurantId, // Replace with actual restaurant ID
        items: selectedItems.map(item => ({
          itemId: item._id,
          qty: item.quantity
        }))
      };

      if (editingMeal) {
        // Update existing meal
        const updatedMeal = await mealMenuApi.updateMealMenu({
          id: editingMeal._id,
          ...payload
        });

        toast({
          title: 'Success',
          description: 'Meal plan updated successfully',
        });

        // Update local state
        setMeals(meals.map(m => m._id === editingMeal._id ? updatedMeal : m));
      } else {
        // Create new meal
        const newMeal = await mealMenuApi.createMealMenu(payload);

        toast({
          title: 'Success',
          description: 'Meal plan created successfully',
        });

        // Update local state
        setMeals([...meals, newMeal]);
      }

      handleCloseModal();
    } catch (error) {
      console.error('Error saving meal plan:', error);
      toast({
        title: 'Error',
        description: 'Failed to save meal plan. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateTotalPrice = () => {
    return selectedItems.reduce((total, item) => {
      return total + (item.price || 0) * item.quantity;
    }, 0);
  };

  const handleRestaurantChange = (value: string) => {
    setSelectedRestaurant(value);
    setFormData(prev => ({
      ...prev,
      restaurantId: value
    }));
  };

  const handleItemToggle = (itemId: string) => {
    setSelectedItems(prev => {
      const exists = prev.find(item => item._id === itemId);
      if (exists) {
        return prev.filter(item => item._id !== itemId);
      } else {
        const menuItem = menuItems.find(mi => mi._id === itemId);
        if (!menuItem) return prev; // Safety check

        const newItems = [
          ...prev,
          {
            _id: itemId,
            name: menuItem.name,
            price: menuItem.price,
            quantity: 1
          }
        ];

        // Update the price when items change
        const totalPrice = newItems.reduce((total, item) => {
          return total + item.price * item.quantity;
        }, 0);

        setFormData(prev => ({
          ...prev,
          price: totalPrice
        }));
        return newItems;
      }
    });
  };

  const handleQuantityChange = (itemId: string, quantity: number) => {
    setSelectedItems(prev => {
      const updated = prev.map(item =>
        item._id === itemId ? { ...item, quantity } : item
      );

      // Update the price when quantity changes
      const totalPrice = updated.reduce((total, item) => {
        const menuItem = menuItems.find(mi => mi._id === item._id);
        return total + (menuItem?.price || 0) * item.quantity;
      }, 0);

      setFormData(prev => ({
        ...prev,
        price: totalPrice
      }));

      return updated;
    });
  };

  const handleStatusToggle = async (meal: MealMenu) => {
    try {
      const mealToUpdate = meals.find(meal => meal._id === meal._id);
      if (!mealToUpdate) return;

      const items : { itemId: string; qty: number }[] = mealToUpdate.items.map(item => {         
        return { itemId: item.itemId._id, qty: item.qty } });

      const updatedMeal = await mealMenuApi.updateMealMenu({
        id: meal._id,
        isActive: !mealToUpdate.isActive,
        items : items,
      });

      // Update the meals state with the updated meal
      setMeals(meals.map(mea =>
        mea._id === meal._id ? {
          ...meal,
          status: updatedMeal.isActive ? 'active' : 'inactive',
          isActive: updatedMeal.isActive
        } : mea
      ));
    } catch (error) {
      console.error('Error updating meal status:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Meal Plans</h1>
          <p className="text-muted-foreground">Manage combination meals and thali options</p>
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Meal Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingMeal ? 'Edit Meal Plan' : 'Add New Meal Plan'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* <div className="space-y-2">
                  <Label htmlFor="restaurantId">Restaurant *</Label>
                  <Select
                    value={formData.restaurantId}
                    onValueChange={(value) => handleRestaurantChange(value)}
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
                </div> */}
                <div className="space-y-2">
                  <Label htmlFor="name">Meal Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter meal name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Meal Type *</Label>
               
  <Popover>
    <PopoverTrigger asChild>
      <Button
        variant="outline"
        role="combobox"
        className="w-full justify-between"
      >
        {formData.type && formData.type.length > 0
          ? Array.isArray(formData.type)
            ? formData.type.map((t) => t.charAt(0) + t.slice(1)).join(", ")
            :formData?.type
          : "Select meal type"}
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-[200px] p-0">
      <Command>
        <CommandInput placeholder="Search type..." />
        <CommandEmpty>No meal type found.</CommandEmpty>
        <CommandGroup>
          {["breakfast", "lunch", "dinner", "complete meal"].map((type) => (
            <CommandItem
              key={type}
              onSelect={() => {
                setFormData((prev:any) => {
                  const current = Array.isArray(prev.type)
                    ? [...prev.type]
                    : [prev.type].filter(Boolean)
                  const exists = current.includes(type)
                  const updated = exists
                    ? current.filter((t) => t !== type)
                    : [...current, type]
                  return { ...prev, type: updated }
                })
              }}
            >
              <div
                className={cn(
                  "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                  Array.isArray(formData.type) && formData.type.includes(type as MealType)
                    ? "bg-primary text-primary-foreground"
                    : "opacity-50"
                )}
              >
                {Array.isArray(formData.type) && formData.type.includes(type as MealType) && (
                  <Check className="h-3 w-3" />
                )}
              </div>
              {type.charAt(0) + type.slice(1)}
            </CommandItem>
          ))}
        </CommandGroup>
      </Command>
    </PopoverContent>
  </Popover>


                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter meal description"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-4">
                <Label>Select Menu Items</Label>
                <div className="border rounded-lg p-4 max-h-60 overflow-y-auto">
                  <div className="space-y-3">
                    {menuItems.map((item) => {
                      const selectedItem = selectedItems.find(si => si._id === item._id);
                      return (
                        <div key={item._id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              checked={!!selectedItem}
                              onCheckedChange={() => handleItemToggle(item._id)}
                            />
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-muted-foreground">₹{item.price}</p>
                            </div>
                          </div>
                     
                            <div className="flex items-center gap-2">
                              <Label htmlFor={`qty-${item._id}`} className="text-sm">Qty:</Label>
                              <Input
                                id={`qty-${item._id}`}
                                type="number"
                                min="1"
                                value={selectedItem?.quantity}
                                onChange={(e) => handleQuantityChange(item._id, parseInt(e.target.value) || 1)}
                                className="w-16"
                              />
                            </div>
                        
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                <span className="font-medium">Calculated Total:</span>
                <span className="text-lg font-bold">₹{calculateTotalPrice()}</span>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Final Price (₹) *</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="Enter final price"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : editingMeal ? 'Update Meal Plan' : 'Save Meal Plan'}
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Meals</p>
                <p className="text-2xl font-bold text-foreground">{stats?.totalMealMenus ?? meals.length}</p>
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
                <p className="text-sm font-medium text-muted-foreground">Active Meals</p>
                <p className="text-2xl font-bold text-primary">
                  {stats?.totalActiveMealMenus ?? meals.filter(meal => meal?.isActive).length}
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
                <p className="text-sm font-medium text-muted-foreground">Avg Price</p>
                <p className="text-2xl font-bold text-foreground">
                  ₹{Math.round((stats?.averagePrice ?? (meals.length ? meals.reduce((sum, meal) => sum + meal.price, 0) / meals.length : 0)))}
                </p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                <IndianRupee className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
          {/*
        <Card>
           <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Complete Meals</p>
                <p className="text-2xl font-bold text-foreground">
                </p>
              </div>
              <div className="h-8 w-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <Filter className="h-4 w-4 text-amber-600" />
              </div>
            </div>
          </CardContent> 
        </Card>
          */}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search meal plans..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={(value) => { setFilterStatus(value); }}>
              <SelectTrigger className="w-48">
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

      {/* Meals Table */}
      <Card>
        <CardHeader>
          <CardTitle>Meal Plans ({filteredMeals.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Meal Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Items Count</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMeals.map((meal) => (
                <TableRow key={meal.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{meal.name}</div>
                      <div className="text-sm text-muted-foreground max-w-xs truncate">
                        {meal.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{meal.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{meal.items.length} items</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <IndianRupee className="h-3 w-3" />
                      <span className="font-medium">{meal.price}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={meal.isActive ? 'default' : 'destructive'}>
                      {meal.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewMeal(meal)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditMeal(meal)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm"
                        onClick={() => handleStatusToggle(meal)}>
                        {meal.isActive ? (
                          <ToggleRight className="h-4 w-4 text-primary" />
                        ) : (
                          <ToggleLeft className="h-4 w-4 text-destructive" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Meal Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Meal Plan Details</DialogTitle>
          </DialogHeader>
          {selectedMeal && (
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{selectedMeal.name}</h3>
                  <Badge variant="outline">{selectedMeal.type}</Badge>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">₹{selectedMeal.price}</p>
                  <Badge variant={selectedMeal.isActive ? 'default' : 'destructive'}>
                    {selectedMeal.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">{selectedMeal.description}</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Included Items:</h4>
                <div className="space-y-2">
                  {selectedMeal.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                      <div>
                        <span className="font-medium">{item.itemId.name}</span>
                        <span className="text-muted-foreground"> x{item.qty}</span>
                      </div>
                      <span className="font-medium">₹{item.itemId.price * item.qty}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MealPlans;