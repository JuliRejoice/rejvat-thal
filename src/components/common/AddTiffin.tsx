// src/app/orders/new/page.tsx
'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Plus, ArrowLeft, ShoppingCart, CalendarIcon, X, Minus } from 'lucide-react';
import { mealMenuApi } from '@/api/mealMenu.api';
import { useToast } from '@/hooks/use-toast';
import { getCustomer } from '@/api/customer.api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CustomerForm } from './CustomerForm';
import { useAuth } from '@/contexts/AuthContext';
import { Label } from 'recharts';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { menuApi } from '@/api/menu.api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';


// Define types for better type safety
interface MealItem {
    _id: string;
    qty: number;
    itemId: {
        _id: string;
        name: string;
        price: number;
    };
}

interface MealPlan {
    _id: string;
    name: string;
    description?: string;
    price: number;
    type: string[];
    items: MealItem[];
    finalPrice?: number;
}

export default function NewOrderPage() {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState('customer');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [selectedMealPlan, setSelectedMealPlan] = useState<MealPlan | null>(null);
    const [isFinalPriceManuallySet, setIsFinalPriceManuallySet] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]);
    const [selectedMealType, setSelectedMealType] = useState('lunch');
    const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
    const [addOns, setAddOns] = useState([]);
    const [buildingState, setBuildingState] = useState('customer');
    const { user } = useAuth()

    // Fetch customers
    const { data: customersData, isLoading: isLoadingCustomers, refetch: refetchCustomersList } = useQuery({
        queryKey: ['customers', searchQuery],
        queryFn: () => getCustomer({ searchTerm: searchQuery, page: 1, limit: 100, isActive: "true" }),
        enabled: activeTab === 'customer' && searchQuery.length > 0
    });


    const customers = customersData?.payload?.customer || [];
    // Fetch meal plans
    const { data: mealPlansData, isLoading: isLoadingMealPlans } = useQuery({
        queryKey: ['meal-plans', user?.restaurantId?._id],  // Add restaurantId to query key
        queryFn: () => mealMenuApi.getMealMenus({
            isActive: true,
            restaurantId: user?.restaurantId?._id
        }),
        enabled: buildingState === 'meal' && !!user?.restaurantId?._id,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });


    const mealPlans = mealPlansData?.items || [];

    const { data: menuItemData, isLoading: menuItemLoading } = useQuery({
        queryKey: ['menu-items', user?.restaurantId?._id],
        queryFn: () => menuApi.getMenuItems({ restaurantId: user?.restaurantId?._id }),

    });

    const menuItems = menuItemData?.items || [];

    const handleCustomerSelect = (customer) => {
        setSelectedCustomer(customer);
        setActiveTab('meal-selection');
    };

    const handleMealPlanSelect = (mealPlan: MealPlan) => {
        setSelectedMealPlan({
            ...mealPlan,
            finalPrice: mealPlan.price // Initialize finalPrice with the original price
        });
        setIsFinalPriceManuallySet(false);
        setActiveTab('customize-meal');
    };

    const handleAddItem = (item: any) => {
        setSelectedItems(prev => [...prev, { ...item, quantity: 1 }]);
    };

    const handleQuantityChange = (index: number, newQty: number) => {
        if (!selectedMealPlan) return;

        const updatedItems = [...selectedMealPlan.items];
        updatedItems[index] = {
            ...updatedItems[index],
            qty: Math.max(1, newQty) // Ensure quantity is at least 1
        };

        const newTotal = updatedItems.reduce((sum, item) =>
            sum + (item.qty * (item.itemId?.price || 0)), 0);

        setSelectedMealPlan({
            ...selectedMealPlan,
            items: updatedItems,
            // Only update final price if it hasn't been manually set
            finalPrice: isFinalPriceManuallySet ? selectedMealPlan.finalPrice : newTotal
        });
    };

    const handlePriceChange = (index: number, newPrice: number) => {
        if (!selectedMealPlan) return;

        const updatedItems = [...selectedMealPlan.items];
        updatedItems[index] = {
            ...updatedItems[index],
            itemId: {
                ...updatedItems[index].itemId,
                price: Math.max(0, newPrice) // Ensure price is not negative
            }
        };

        const newTotal = updatedItems.reduce((sum, item) =>
            sum + (item.qty * (item.itemId?.price || 0)), 0);

        setSelectedMealPlan({
            ...selectedMealPlan,
            items: updatedItems,
            // Only update final price if it hasn't been manually set
            finalPrice: isFinalPriceManuallySet ? selectedMealPlan.finalPrice : newTotal
        });
    };

    const handleAddAddOn = (item: { id: string; name: string; price: number }) => {
        setAddOns(prev => [
            ...prev,
            { ...item, quantity: 1 }
        ]);
    };

    const handleUpdateQuantity = (id: string, newQuantity: number) => {
        if (newQuantity < 0) return;
    
        setAddOns(prev => 
            prev.map(item => 
                item._id === id ? { ...item, quantity: Math.max(1, newQuantity) } : item
            )
        );
    };

    const handleRemoveAddOn = (id: string) => {
        setAddOns(prev => prev.filter(item => item._id !== id));
    };


    const handleRemoveItem = (itemId: string) => {
        setSelectedItems(prev => prev.filter(item => item._id !== itemId));
    };

    const calculateTotal = () => {
        return selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    const handlePlaceOrder = async () => {
        try {
            // Format the order data
            const orderData = {
                customerId: selectedCustomer._id,
                restaurantId: selectedCustomer.restaurantId,
                [selectedMealType]: {
                    mealId: selectedMealPlan._id,
                    mealQuantity: 1,
                    mealPrice: selectedMealPlan.price,
                    mealItems: selectedItems.map(item => ({
                        menuId: item._id,
                        quantity: item.quantity,
                        price: item.price
                    })),
                    addOnItems: addOns,
                    totalAddonPrice: addOns.reduce((sum, item) => sum + (item.price * item.quantity), 0),
                    deliveryIncluded: true,
                    deliveryCharge: 50, // Adjust as needed
                    mealFinalPrice: calculateTotal() + 50 // Add delivery charge
                },
                startDate: new Date().toISOString().split('T')[0],
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                tiffinTotalPrice: selectedMealPlan?.finalPrice + calculateTotal() + 50
            };

        

            // Call your API here
            // await orderApi.createOrder(orderData);

            toast({
                title: 'Success',
                description: 'Order placed successfully!',
            });


        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to place order. Please try again.',
            });
        }
    };

    const [refetchCustomers, setRefetchCustomers] = useState(false);

    const handleMealPlanTypeChange = (e: React.ChangeEvent<HTMLInputElement>, mealType: string) => {
        if (!selectedMealPlan) return;
        
        const { checked } = e.target;
        let updatedTypes: string[] = [...selectedMealPlan.type];
        
        if (checked) {
            // Add the meal type if not already present
            if (!updatedTypes.includes(mealType)) {
                updatedTypes.push(mealType);
            }
        } else {
            // Remove the meal type if present
            updatedTypes = updatedTypes.filter(type => type !== mealType);
        }
        
        // Update the selected meal plan with the new types
        setSelectedMealPlan({
            ...selectedMealPlan,
            type: updatedTypes
        });
    }

    const handleCustomerAdded = () => {
        setRefetchCustomers(prev => !prev);
        setIsCustomerDialogOpen(false);
        toast({
            title: 'Success',
            description: 'Customer added successfully!',
        });
    }
    const basePrice = selectedMealPlan?.price || 0;
    const addOnsTotal = addOns.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalPrice = selectedMealPlan?.finalPrice + addOnsTotal;
    return (
        <div className="p-4">
            <div className="w-full mx-auto">
                <div className="flex gap-4 mb-6 items-center">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                            if (buildingState === 'meal') {
                                setBuildingState('customer');
                            } else if (buildingState === "menu") {
                                setBuildingState('meal');
                            }
                        }}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-2xl font-bold">
                        {buildingState === 'customer' ? 'Select Customer' : buildingState === 'meal' ? 'Select Meal Plan' : 'Select Add-Ons'}
                    </h1>
                </div>

                <div className='flex gap-4 w-full'>
                    {/* Left Column - Customer/Meal Plan Selection */}
                    <div className="w-1/2">
                        <Card className='h-[80vh] flex flex-col max-w-md'>
                            {buildingState === 'customer' ? (
                                // Customer Selection View
                                <div className="flex flex-col h-full">
                                    <CardHeader>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                placeholder="Search customer by name or phone"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="w-full pl-9"
                                            />
                                        </div>
                                    </CardHeader>
                                    <CardContent className="flex-1 overflow-y-auto">
                                        {isLoadingCustomers ? (
                                            <div className="text-center py-4">Searching...</div>
                                        ) : customers?.length > 0 ? (
                                            <div className="space-y-2">
                                                {customers.map((customer) => (
                                                    <div
                                                        key={customer._id}
                                                        className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                                                        onClick={() => {
                                                            setSelectedCustomer(customer);
                                                            setBuildingState('meal');
                                                        }}
                                                    >
                                                        <div className="font-medium">{customer.name}</div>
                                                        <div className="text-sm text-muted-foreground">{customer.phone}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center">
                                                <p className="text-muted-foreground">No customers found</p>
                                            </div>
                                        )}
                                    </CardContent>
                                    <div className="border-t p-4">
                                        <Button
                                            className="w-full"
                                            onClick={() => setIsCustomerDialogOpen(true)}
                                        >
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add New Customer
                                        </Button>
                                    </div>
                                </div>
                            ) : buildingState === 'meal' ? (
                                <div className="flex flex-col h-full">
                                    <CardHeader>
                                        <CardTitle>Select a Meal Plan</CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex-1 overflow-y-auto">
                                        {/* <div className="grid grid-cols-1 gap-4">
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
                                        </div> */}
                                        {isLoadingMealPlans ? (
                                            <div className="text-center py-4">Loading meal plans...</div>
                                        ) : mealPlans?.length > 0 ? (
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label>Meal Plan *</Label>

                                                    {mealPlans.map(plan => (
                                                        <div 
                                                            key={plan._id} 
                                                            className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer" 
                                                            onClick={() => {
                                                                const mealPlan: MealPlan = {
                                                                    ...plan,
                                                                    type: Array.isArray(plan.type) ? plan.type : [plan.type],
                                                                    items: (plan.items || []).map(item => ({
                                                                        ...item,
                                                                        _id: (item as any)._id || (item as any).itemId?._id || '',
                                                                        itemId: {
                                                                            _id: (item as any).itemId?._id || '',
                                                                            name: (item as any).itemId?.name || '',
                                                                            price: (item as any).itemId?.price || 0
                                                                        }
                                                                    }))
                                                                };
                                                                setSelectedMealPlan(mealPlan);
                                                            }}
                                                        >
                                                        {plan.name}
                                                    </div>
                                                    ))}

                                                    {/* {errors.mealPlanId && <p className="text-sm text-red-500">{errors.mealPlanId.message}</p>} */}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center">
                                                <p className="text-muted-foreground">No meal plans available</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </div>
                            ) : (

                                <div className='p-3 flex flex-col gap-3' >
                                    {menuItems?.map(item => (
                                        <Button
                                            key={item.id}
                                            type="button"
                                            variant="outline"
                                            className="flex justify-between h-auto p-3 text-left w-full"
                                            onClick={() => handleAddAddOn(item)}
                                        >
                                            <span className="font-medium">{item.name}</span>
                                            <span className="text-sm text-muted-foreground">₹{item.price}</span>
                                        </Button>
                                    ))}
                                </div>
                            )

                            }


                        </Card>
                    </div>

                    {/* Right Column - Order Summary */}
                    {buildingState === ('meal') && (
                        <div className="w-1/2">
                            <Card className='h-[80vh] flex flex-col'>
                                <CardHeader>
                                    <CardTitle>Order Summary</CardTitle>
                                </CardHeader>
                                <CardContent className="flex-1 overflow-y-auto">
                                    {selectedCustomer && (
                                        <div className="mb-6">
                                            <h3 className="font-medium mb-2">Customer</h3>
                                            <div className="p-3 border rounded-lg">
                                                <div className="font-medium">{selectedCustomer.name}</div>
                                                <div className="text-sm text-muted-foreground">{selectedCustomer.phone}</div>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 mb-5">
                                        <div className="flex items-center gap-2">
                                            <input 
                                                type="checkbox" 
                                                checked={selectedMealPlan?.type.includes('breakfast')} 
                                                disabled={!selectedMealPlan?.type.some(t => ['breakfast', 'lunch', 'dinner'].includes(t))}
                                                onChange={(e) => handleMealPlanTypeChange(e, 'breakfast')} 
                                            />
                                            <label className={!selectedMealPlan?.type.includes('breakfast') ? 'text-muted-foreground' : ''}>Breakfast</label>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input 
                                                type="checkbox" 
                                                checked={selectedMealPlan?.type.includes('lunch')} 
                                                disabled={!selectedMealPlan?.type.some(t => ['breakfast', 'lunch', 'dinner'].includes(t))}
                                                onChange={(e) => handleMealPlanTypeChange(e, 'lunch')} 
                                            />
                                            <label className={!selectedMealPlan?.type.includes('lunch') ? 'text-muted-foreground' : ''}>Lunch</label>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input 
                                                type="checkbox" 
                                                checked={selectedMealPlan?.type.includes('dinner')} 
                                                disabled={!selectedMealPlan?.type.some(t => ['breakfast', 'lunch', 'dinner'].includes(t))}
                                                onChange={(e) => handleMealPlanTypeChange(e, 'dinner')} 
                                            />
                                            <label className={!selectedMealPlan?.type.includes('dinner') ? 'text-muted-foreground' : ''}>Dinner</label>
                                        </div>
                                    </div>

                                    {selectedMealPlan && (
                                        <Card>
                                            <CardHeader className="p-4 pb-2">
                                                <CardTitle className="text-lg">{selectedMealPlan.name}</CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-4 pt-0">
                                                <p className="text-muted-foreground text-sm mb-3">{selectedMealPlan.description}</p>
                                                <div className="space-y-4">
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full">
                                                            <thead>
                                                                <tr className="text-left border-b">
                                                                    <th className="pb-2">Item</th>
                                                                    <th className="text-right pb-2">Qty</th>
                                                                    <th className="text-right pb-2">Price</th>
                                                                    <th className="text-right pb-2">Total</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {selectedMealPlan.items?.map((item, index) => (
                                                                    <tr key={index} className="border-b">
                                                                        <td className="py-2">{item.itemId?.name || 'Item'}</td>
                                                                        <td className="text-right">
                                                                            <input
                                                                                type="number"
                                                                                min="1"
                                                                                value={item.qty}
                                                                                onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 1)}
                                                                                className="w-16 p-1 border rounded text-right"
                                                                            />
                                                                        </td>
                                                                        <td className="text-right">
                                                                            <input
                                                                                type="number"
                                                                                min="0"
                                                                                step="0.01"
                                                                                value={item.itemId?.price || 0}
                                                                                onChange={(e) => handlePriceChange(index, parseFloat(e.target.value) || 0)}
                                                                                className="w-24 p-1 border rounded text-right"
                                                                            />
                                                                        </td>
                                                                        <td className="text-right">
                                                                            ₹{(item.qty * (item.itemId?.price || 0)).toFixed(2)}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                        <div className="flex justify-between mt-1">
                                                            <span>Total:</span>
                                                            <span className="text-lg">
                                                                ₹{selectedMealPlan.items?.reduce((sum, item) =>
                                                                    sum + (item.qty * (item.itemId?.price || 0)), 0).toFixed(2)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right font-medium pt-2">
                                                        <div className="my-4 flex justify-between items-center">
                                                            <label className="block text-xl font-medium mb-1">Final Price</label>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                value={selectedMealPlan.finalPrice ?? selectedMealPlan.price}
                                                                onChange={(e) => {
                                                                    const newPrice = parseFloat(e.target.value) || 0;
                                                                    setSelectedMealPlan({
                                                                        ...selectedMealPlan,
                                                                        finalPrice: newPrice
                                                                    });
                                                                }}
                                                                className="w-32 p-1 border rounded text-right text-lg font-medium"
                                                            />
                                                        </div>

                                                        <div>
                                                            <Button onClick={() => setBuildingState('menu')}>
                                                                Add-Ons
                                                            </Button>
                                                        </div>

                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}


                                </CardContent>
                            </Card>
                        </div>)
                    }

                    {
                        buildingState === 'menu' && (
                            
                            <Card className='h-[80vh] flex flex-col p-3 max-w-xl'>
                                <CardContent>
                            <div className="relative overflow-x-auto border rounded-lg">
                                <Table className="w-full">
                                    <TableHeader className="bg-muted/50">
                                        <TableRow>
                                            <TableHead>Item</TableHead>
                                            <TableHead className="text-right">Price</TableHead>
                                            <TableHead className="w-32">Qty</TableHead>
                                            <TableHead className="text-right">Total</TableHead>
                                            <TableHead className="w-10"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                </Table>
                                <div className="block ">
                                    <Table>
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
                                                                onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}
                                                            >
                                                                <Minus className="h-4 w-4" />
                                                            </Button>
                                                            <span className="w-8 text-center">{item.quantity}</span>
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="icon"
                                                                className="h-8 w-8"
                                                                onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
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
                            </div>


                                 <div className="space-y-4">
                                          <Card className="border rounded-lg max-h-[200px] overflow-y-scroll">
                                            <CardHeader className="p-4 pb-2">
                                              <CardTitle className="text-lg">Order Summary</CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-4 pt-0 space-y-4">
                                              <div className="space-y-2">
                                                <div className="flex justify-between">
                                                  <span>Meal Plan:</span>
                                                  <span>₹{selectedMealPlan?.finalPrice?.toFixed(2)}</span>
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
                                            </CardContent>
                                          </Card>
                                        </div>

                                        <Button 
                                        onClick={handlePlaceOrder}
                                        className="mt-4"
                                        >Place Order</Button>
                        </CardContent>
                        </Card>
                        )
                    }
                </div>
          


            </div>
            {isCustomerDialogOpen && <Dialog open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen}>

                <CustomerForm
                    open={isCustomerDialogOpen}
                    onClose={() => setIsCustomerDialogOpen(false)}
                    refetch={refetchCustomers}
                    setRefetch={setRefetchCustomers}
                />

            </Dialog>}
        </div>
    );
}