import React, { useState } from 'react';
import { Plus, Search, Filter, Edit2, ToggleLeft, ToggleRight, IndianRupee, Eye } from 'lucide-react';
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

// Mock data
const mockMeals = [
  {
    id: '1',
    name: 'Punjabi Thali',
    type: 'Complete Meal',
    price: 120,
    description: 'Traditional Punjabi meal with variety of dishes',
    status: 'active',
    items: [
      { name: 'Roti', quantity: 5, price: 5 },
      { name: 'Dal Tadka', quantity: 1, price: 45 },
      { name: 'Paneer Curry', quantity: 1, price: 85 },
      { name: 'Rice', quantity: 1, price: 30 }
    ]
  },
  {
    id: '2',
    name: 'Gujarati Thali',
    type: 'Complete Meal',
    price: 100,
    description: 'Traditional Gujarati meal with sweet and savory items',
    status: 'active',
    items: [
      { name: 'Roti', quantity: 4, price: 5 },
      { name: 'Dal', quantity: 1, price: 40 },
      { name: 'Sabji', quantity: 2, price: 50 },
      { name: 'Rice', quantity: 1, price: 30 }
    ]
  },
  {
    id: '3',
    name: 'South Indian Meal',
    type: 'Complete Meal',
    price: 95,
    description: 'Authentic South Indian meal',
    status: 'inactive',
    items: [
      { name: 'Rice', quantity: 2, price: 30 },
      { name: 'Sambar', quantity: 1, price: 45 },
      { name: 'Rasam', quantity: 1, price: 35 }
    ]
  }
];

const mockMenuItems = [
  { id: '1', name: 'Roti', price: 5 },
  { id: '2', name: 'Dal Tadka', price: 45 },
  { id: '3', name: 'Paneer Curry', price: 85 },
  { id: '4', name: 'Rice', price: 30 },
  { id: '5', name: 'Sabji', price: 50 }
];

const MealPlans = () => {
  const [meals] = useState(mockMeals);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<typeof mockMeals[0] | null>(null);
  const [editingMeal, setEditingMeal] = useState<typeof mockMeals[0] | null>(null);
  const [selectedItems, setSelectedItems] = useState<Array<{id: string, quantity: number}>>([]);

  const filteredMeals = meals.filter(meal => {
    const matchesSearch = meal.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || meal.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleViewMeal = (meal: typeof mockMeals[0]) => {
    setSelectedMeal(meal);
    setIsViewModalOpen(true);
  };

  const handleEditMeal = (meal: typeof mockMeals[0]) => {
    setEditingMeal(meal);
    setSelectedItems(meal.items.map(item => ({ 
      id: mockMenuItems.find(mi => mi.name === item.name)?.id || '', 
      quantity: item.quantity 
    })));
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditingMeal(null);
    setSelectedItems([]);
  };

  const calculateTotalPrice = () => {
    return selectedItems.reduce((total, item) => {
      const menuItem = mockMenuItems.find(mi => mi.id === item.id);
      return total + (menuItem?.price || 0) * item.quantity;
    }, 0);
  };

  const handleItemToggle = (itemId: string) => {
    setSelectedItems(prev => {
      const exists = prev.find(item => item.id === itemId);
      if (exists) {
        return prev.filter(item => item.id !== itemId);
      } else {
        return [...prev, { id: itemId, quantity: 1 }];
      }
    });
  };

  const handleQuantityChange = (itemId: string, quantity: number) => {
    setSelectedItems(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      )
    );
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
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mealName">Meal Name</Label>
                  <Input 
                    id="mealName" 
                    placeholder="Enter meal name" 
                    defaultValue={editingMeal?.name || ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mealType">Meal Type</Label>
                  <Select defaultValue={editingMeal?.type || 'Complete Meal'}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select meal type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Complete Meal">Complete Meal</SelectItem>
                      <SelectItem value="Breakfast">Breakfast</SelectItem>
                      <SelectItem value="Lunch">Lunch</SelectItem>
                      <SelectItem value="Dinner">Dinner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Enter meal description" 
                  defaultValue={editingMeal?.description || ''}
                />
              </div>

              <div className="space-y-4">
                <Label>Select Menu Items</Label>
                <div className="border rounded-lg p-4 max-h-60 overflow-y-auto">
                  <div className="space-y-3">
                    {mockMenuItems.map((item) => {
                      const selectedItem = selectedItems.find(si => si.id === item.id);
                      return (
                        <div key={item.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              checked={!!selectedItem}
                              onCheckedChange={() => handleItemToggle(item.id)}
                            />
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-muted-foreground">₹{item.price}</p>
                            </div>
                          </div>
                          {selectedItem && (
                            <div className="flex items-center gap-2">
                              <Label htmlFor={`qty-${item.id}`} className="text-sm">Qty:</Label>
                              <Input
                                id={`qty-${item.id}`}
                                type="number"
                                min="1"
                                value={selectedItem.quantity}
                                onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                                className="w-16"
                              />
                            </div>
                          )}
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
                <Label htmlFor="finalPrice">Final Price (₹)</Label>
                <Input 
                  id="finalPrice" 
                  type="number" 
                  placeholder="Enter final price" 
                  defaultValue={editingMeal?.price || calculateTotalPrice()}
                />
              </div>

              <div className="flex gap-2">
                <Button className="flex-1">
                  {editingMeal ? 'Update Meal Plan' : 'Save Meal Plan'}
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
                <p className="text-sm font-medium text-muted-foreground">Total Meals</p>
                <p className="text-2xl font-bold text-foreground">{meals.length}</p>
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
                  {meals.filter(meal => meal.status === 'active').length}
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
                  ₹{Math.round(meals.reduce((sum, meal) => sum + meal.price, 0) / meals.length)}
                </p>
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
                <p className="text-sm font-medium text-muted-foreground">Complete Meals</p>
                <p className="text-2xl font-bold text-foreground">
                  {meals.filter(meal => meal.type === 'Complete Meal').length}
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
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
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
                    <Badge variant={meal.status === 'active' ? 'default' : 'secondary'}>
                      {meal.status}
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
                      <Button variant="outline" size="sm">
                        {meal.status === 'active' ? (
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
                  <Badge variant={selectedMeal.status === 'active' ? 'default' : 'secondary'}>
                    {selectedMeal.status}
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
                        <span className="font-medium">{item.name}</span>
                        <span className="text-muted-foreground"> x{item.quantity}</span>
                      </div>
                      <span className="font-medium">₹{item.price * item.quantity}</span>
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