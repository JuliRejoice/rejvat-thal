import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, Plus, Minus, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { createNewCustomer } from '@/api/customer.api';
import { mealMenuApi, type MealMenu } from '@/api/mealMenu.api';
import { getAllArea } from '@/api/area.api';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

// Types
type FormData = {
  // Customer Details
  name: string;
  phone: string;
  email: string;
  address: string;
  restaurantId: string;
  areaId: string;
  referenceName: string;

  
  // Meal Plan
  mealPlanId: string;
  startDate: Date;
  endDate: Date;
  
  // Add-ons
  addOns: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
};

type Area = {
  _id: string;
  name: string;
  deliveryType: 'free' | 'paid';
  deliveryAmount: number;
};

export function EnhancedCustomerForm({ open, onClose, refetch, setRefetch }) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('customer');
  const [mealPlans, setMealPlans] = useState<MealMenu[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [menuItems, setMenuItems] = useState<Array<{ id: string; name: string; price: number }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      addOns: [],
    },
  });

  const selectedMealPlanId = watch('mealPlanId');
  const selectedMealPlan = mealPlans.find(plan => plan._id === selectedMealPlanId);
  const addOns = watch('addOns') || [];
  
  // Calculate totals
  const basePrice = selectedMealPlan?.price || 0;
  const addOnsTotal = addOns.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalPrice = basePrice + addOnsTotal;

  // Fetch meal plans and areas on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch meal plans
        const { items: plans } = await mealMenuApi.getMealMenus({ isActive: true });
        setMealPlans(plans);
        
        // Fetch areas
        const areasData = await getAllArea({ 
          restaurantId: watch('restaurantId'),
          page: 1,
          limit: 100,
          search: ''
        });
        setAreas(areasData.payload?.data || []);
        
        // TODO: Fetch menu items for add-ons
        
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load required data. Please try again.',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [watch('restaurantId')]);

  const handleAddAddOn = (item: { id: string; name: string; price: number }) => {
    setValue('addOns', [
      ...addOns,
      { ...item, quantity: 1 }
    ]);
  };

  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 0) return;
    
    setValue('addOns', addOns.map(item => 
      item.id === id ? { ...item, quantity: newQuantity } : item
    ));
  };

  const handleRemoveAddOn = (id: string) => {
    setValue('addOns', addOns.filter(item => item.id !== id));
  };

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);
      
      // Prepare customer data
      const customerData = {
        name: data.name,
        phone: data.phone,
        email: data.email,
        address: data.address,
        areaId: data.areaId,
        referenceName: data.referenceName,
        restaurantId: user?.restaurantId._id,
        mealPlan: {
          mealPlanId: data.mealPlanId,
          startDate: format(data.startDate, 'yyyy-MM-dd'),
          endDate: format(data.endDate, 'yyyy-MM-dd'),
          addOns: data.addOns.map(item => ({
            itemId: item.id,
            quantity: item.quantity
          }))
        }
      };
      
      await createCustomer(customerData);
      
      toast({
        title: 'Success',
        description: 'Customer created successfully!',
      });
      
      setRefetch(!refetch);
      onClose();
      
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to create customer. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const { mutate: createCustomer, isPending } = useMutation({
    mutationKey: ["create-customer"],
    mutationFn: createNewCustomer,
    onSuccess: () => {
      toast({
        variant: "default",
        title: "Customer created",
        description: "Customer created successfully.",
      });
      // Reset form after successful submission
    
      onClose?.();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create customer. Try again.",
      });
      console.error("Error creating customer:", error);
    },
  });

  const handleCreateCustomer = () => {
    // Get all form values
    const formValues = watch();
    
    // Prepare customer data from the first tab
    const customerData = {
      name: formValues.name,
      phone: formValues.phone,
      email: formValues.email,
      address: formValues.address,
      areaId: formValues.areaId,
      referenceName: formValues.referenceName,
      restaurantId: user?.restaurantId._id,
      // Add other required fields from the first tab
    };
    
    // Call the mutation with the form data
    createCustomer(customerData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="customer">Customer Details</TabsTrigger>
          <TabsTrigger value="meal-plan" disabled={!watch('name') || !watch('phone')}>
            Meal Plan
          </TabsTrigger>
          <TabsTrigger 
            value="add-ons" 
            disabled={!selectedMealPlanId}
          >
            Add-ons {addOns.length > 0 && `(${addOns.length})`}
          </TabsTrigger>
        </TabsList>
        
        {/* Customer Details Tab */}
        <TabsContent value="customer" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input 
                id="name" 
                {...register('name', { required: 'Name is required' })} 
                placeholder="John Doe"
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input 
                id="phone" 
                {...register('phone', { 
                  required: 'Phone is required',
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: 'Please enter a valid 10-digit phone number'
                  }
                })} 
                placeholder="9876543210"
              />
              {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email"
                {...register('email')} 
                placeholder="john@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="referenceName">Reference Name</Label>
              <Input 
                id="referenceName" 
                {...register('referenceName')} 
                placeholder="Referred by"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="areaId">Area *</Label>
              <Select 
                onValueChange={(value) => setValue('areaId', value)}
                value={watch('areaId')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select area" />
                </SelectTrigger>
                <SelectContent>
                  {areas.map(area => (
                    <SelectItem key={area._id} value={area._id}>
                      {area.name} ({area.deliveryType === 'free' ? 'Free' : `₹${area.deliveryAmount} delivery`})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.areaId && <p className="text-sm text-red-500">{errors.areaId.message}</p>}
            </div>  
            
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Textarea 
                id="address" 
                {...register('address', { required: 'Address is required' })} 
                placeholder="Full address with landmark"
                rows={3}
              />
              {errors.address && <p className="text-sm text-red-500">{errors.address.message}</p>}
            </div>
          </div>
          
          <div className="flex justify-end pt-4">
            <Button 
              type="button"
              onClick={handleCreateCustomer}
              disabled={isPending}
            >
              {isPending ? 'Creating...' : 'Create Customer'}
            </Button>
            <Button 
              type="button" 
              onClick={() => setActiveTab('meal-plan')}
              disabled={!watch('name') || !watch('phone') || !watch('address') || !watch('areaId')}
            >
              Next: Select Meal Plan
            </Button>
          </div>
        </TabsContent>
        
        {/* Meal Plan Tab */}
        <TabsContent value="meal-plan" className="space-y-6">
          <div className="grid grid-cols-1  gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Meal Plan *</Label>
                <Select 
                  onValueChange={(value) => setValue('mealPlanId', value)}
                  value={watch('mealPlanId')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a meal plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {mealPlans.map(plan => (
                      <SelectItem key={plan._id} value={plan._id}>
                        {plan.name} (₹{plan.price} - {plan.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.mealPlanId && <p className="text-sm text-red-500">{errors.mealPlanId.message}</p>}
              </div>
              
              {selectedMealPlan && (
                <Card>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-lg">{selectedMealPlan.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-muted-foreground text-sm mb-3">{selectedMealPlan.description}</p>
                    <div className="space-y-2">
                      {selectedMealPlan.items?.map((item, index) => (
                        <div key={index} className="flex justify-between">
                          <span>{item.quantity}x {item.itemId?.name || 'Item'}</span>
                          <span>₹{item.itemId?.price * item.quantity}</span>
                        </div>
                      ))}
                      <div className="border-t pt-2 font-medium">
                        <div className="flex justify-between">
                          <span>Total:</span>
                          <span>₹{selectedMealPlan.price}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label>Start Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !watch('startDate') && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {watch('startDate') ? format(watch('startDate'), 'PPP') : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={watch('startDate')}
                        onSelect={(date) => date && setValue('startDate', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.startDate && <p className="text-sm text-red-500">{errors.startDate.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label>End Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !watch('endDate') && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {watch('endDate') ? format(watch('endDate'), 'PPP') : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={watch('endDate')}
                        onSelect={(date) => date && setValue('endDate', date)}
                        initialFocus
                        fromDate={watch('startDate') || new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.endDate && <p className="text-sm text-red-500">{errors.endDate.message}</p>}
                </div>
              </div>
              
              <div className="pt-4">
                <div className="flex items-center justify-between py-2">
                  <span className="font-medium">Meal Plan Price:</span>
                  <span>₹{basePrice.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex items-center justify-between font-medium">
                    <span>Total:</span>
                    <span className="text-lg">₹{totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between pt-4">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => setActiveTab('customer')}
            >
              Back
            </Button>
            <div className="space-x-2">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setActiveTab('add-ons')}
              >
                Skip Add-ons
              </Button>
              <Button 
                type="button" 
                onClick={() => setActiveTab('add-ons')}
                disabled={!selectedMealPlanId}
              >
                Next: Add-ons
              </Button>
            </div>
          </div>
        </TabsContent>
        
        {/* Add-ons Tab */}
        <TabsContent value="add-ons" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div className="space-y-2">
                <Label>Add Menu Items</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {menuItems.map(item => (
                    <Button
                      key={item.id}
                      type="button"
                      variant="outline"
                      className="flex flex-col items-start h-auto p-3 text-left"
                      onClick={() => handleAddAddOn(item)}
                    >
                      <span className="font-medium">{item.name}</span>
                      <span className="text-sm text-muted-foreground">₹{item.price}</span>
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Selected Add-ons</Label>
                {addOns.length > 0 ? (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item</TableHead>
                          <TableHead className="text-right">Price</TableHead>
                          <TableHead className="w-32">Qty</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                          <TableHead className="w-10"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {addOns.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.name}</TableCell>
                            <TableCell className="text-right">₹{item.price.toFixed(2)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button 
                                  type="button" 
                                  variant="outline" 
                                  size="icon" 
                                  className="h-8 w-8"
                                  onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span className="w-8 text-center">{item.quantity}</span>
                                <Button 
                                  type="button" 
                                  variant="outline" 
                                  size="icon" 
                                  className="h-8 w-8"
                                  onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">₹{(item.price * item.quantity).toFixed(2)}</TableCell>
                            <TableCell>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive"
                                onClick={() => handleRemoveAddOn(item.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="border rounded-lg p-8 text-center">
                    <p className="text-muted-foreground">No add-ons selected</p>
                    <p className="text-sm text-muted-foreground mt-1">Click on items above to add them</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-lg">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Meal Plan:</span>
                      <span>₹{basePrice.toFixed(2)}</span>
                    </div>
                    
                    {addOns.length > 0 && (
                      <div className="space-y-1">
                        <div className="text-sm font-medium">Add-ons:</div>
                        {addOns.map(item => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              {item.quantity}x {item.name}
                            </span>
                            <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="border-t pt-2">
                      <div className="flex justify-between font-medium">
                        <span>Total:</span>
                        <span className="text-lg">₹{totalPrice.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Creating...' : 'Create Customer'}
                  </Button>
                  
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setActiveTab('meal-plan')}
                  >
                    Back to Meal Plan
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </form>
  );
}
