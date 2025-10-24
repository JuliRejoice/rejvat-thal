// src/app/orders/new/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Plus, ArrowLeft, ShoppingCart, CalendarIcon, X, Minus, CircleX, Trash2 } from 'lucide-react';
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
import { createTiffin } from '@/api/tiffin.api';
import { useNavigate } from 'react-router';
import { useSearchParams } from 'react-router-dom';



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
    const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
    const [addOns, setAddOns] = useState([]);
    const [addOnQuantities, setAddOnQuantities] = useState<Record<string, number>>({});
    const [addedItemIds, setAddedItemIds] = useState<Set<string>>(new Set());
    const [buildingState, setBuildingState] = useState('customer');
    const [mealType, setMealType] = useState([]);
    const [advancedPayment, setAdvancedPayment] = useState<number>(0);
    const debouncedSearchQuery = useDebounce(searchQuery, 300); // 300ms delay
    const [billingType, setBillingType] = useState<'fixed' | 'monthly'>('fixed');
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const customerId = searchParams.get('customerId');
    const queryClient = useQueryClient()


    useEffect(() => {
        const customerId = searchParams.get('customerId');


        if (customerId) {
            setBuildingState('meal');
            setActiveTab('meal-selection');
            // Fetch customer details
            getCustomer({
                page: 1,
                limit: 100,
                isActive: "true",
                restaurantId: user?.restaurantId?._id
            })
                .then(response => {
                    if (response?.payload) {
                        const foundCustomer = response.payload.customer.find(
                            (cust: any) => cust._id === customerId
                        )
                        setSelectedCustomer(foundCustomer);

                    }
                })
                .catch(error => {
                    console.error('Error fetching customer:', error);
                    toast({
                        title: 'Error',
                        description: 'Failed to load customer details',
                        variant: 'destructive'
                    });
                });
        }
    }, [searchParams]);


    const [dates, setDates] = useState({
        startDate: '',
        endDate: ''
    });
    const { user } = useAuth();

    useEffect(() => {
        if (selectedMealPlan) {
            setMealType(selectedMealPlan.type)
        }
    }, [selectedMealPlan])

    // Clear selectedMealPlan when buildingState changes to 'customer'
    useEffect(() => {
        if (buildingState === 'customer') {
            setSelectedMealPlan(null);
        }
    }, [buildingState]);

    console.log(mealType)

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setDates(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Custom debounce hook
    function useDebounce<T>(value: T, delay: number): T {
        const [debouncedValue, setDebouncedValue] = useState<T>(value);

        useEffect(() => {
            const timer = setTimeout(() => {
                setDebouncedValue(value);
            }, delay);

            return () => {
                clearTimeout(timer);
            };
        }, [value, delay]);

        return debouncedValue;
    }

    // Fetch customers
    const { data: customersData, isLoading: isLoadingCustomers, refetch: refetchCustomersList } = useQuery({
        queryKey: ['customers', debouncedSearchQuery],
        queryFn: () => getCustomer({
            searchTerm: debouncedSearchQuery,
            page: 1,
            limit: 100,
            isActive: "true",
            restaurantId: user?.restaurantId?._id
        }),
        enabled: activeTab === 'customer' && debouncedSearchQuery.length > 0
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

    const handleAddAddOn = (item: { id: string; _id: string; name: string; price: number; quantity?: number }) => {
        const itemId = item._id || item.id;
        const quantity = item.quantity || 1;

        setAddOns(prev => {
            // Check if item already exists in the cart
            const existingIndex = prev.findIndex(addOn => addOn._id === itemId);

            if (existingIndex >= 0) {
                // If item exists, update its quantity and check if we should re-enable the button
                const updatedAddOns = prev.map((addOn, index) =>
                    index === existingIndex
                        ? { ...addOn, quantity }
                        : addOn
                );

                // If quantity changed from previous value, remove from addedItemIds to re-enable the button
                if (prev[existingIndex].quantity !== quantity) {
                    setAddedItemIds(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(itemId);
                        return newSet;
                    });
                }

                return updatedAddOns;
            } else {
                // If item doesn't exist, add it and mark as added
                setAddedItemIds(prev => new Set(prev).add(itemId));

                return [
                    ...prev,
                    {
                        ...item,
                        _id: itemId,
                        id: item.id,
                        quantity: quantity
                    }
                ];
            }
        });

        // Reset the quantity input
        setAddOnQuantities(prev => ({
            ...prev,
            [itemId]: 1
        }));
    };

    const handleUpdateQuantity = (id: string, newQuantity: number) => {
        if (newQuantity < 0) return;

        setAddOns(prev =>
            prev.map(item =>
                item._id === id ? { ...item, quantity: Math.max(1, newQuantity) } : item
            )
        );
    };

    const handleRemoveAddOn = (indexToRemove: number) => {
        setAddOns(prev => prev.filter((_, index) => index !== indexToRemove));
    };


    const handleRemoveItem = (itemId: string) => {
        setSelectedItems(prev => prev.filter(item => item._id !== itemId));
    };

    const calculateTotal = () => {
        return selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    const handlePlaceOrder = async () => {
        try {
            if (!selectedMealPlan || !selectedCustomer) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Please select a meal plan and customer"
                });
                return;
            }

            // Create base order data
            // Validate dates
            if (!dates.startDate) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Please select start date"
                });
                return;
            }

            if (!dates.endDate && billingType === 'fixed') {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Please select end date"
                });
                return;
            }

            if (new Date(dates.endDate) < new Date(dates.startDate)) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "End date must be after start date"
                });
                return;
            }

            // Prepare meal items structure
            const mealItems = selectedMealPlan.items.map(item => ({
                menuId: item.itemId._id,
                quantity: item.qty,
                price: item.itemId.price
            }));

            // Prepare addOns items
            const addOnItems = addOns.map(addon => ({
                menuId: addon._id,
                quantity: addon.quantity,
                price: addon.price
            }));

            const totalAddonPrice = addOns.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const basePrice = selectedMealPlan.price;
            const mealFinalPrice = (selectedMealPlan.finalPrice || basePrice) + totalAddonPrice;

            // Create the order data structure
            const orderData: any = {
                customerId: selectedCustomer._id,
                restaurantId: selectedCustomer.restaurantId,
                startDate: dates.startDate,
                endDate: dates.endDate,
                deliveryIncluded: true,
                tiffinTotalPrice: 0,
                remark: "test",
                advancedPayment: advancedPayment.toString(),
                billingCycle: billingType,
            };

            // Add meal types to the order data
            if (mealType.includes('lunch')) {
                orderData.lunch = {
                    mealId: selectedMealPlan._id,
                    mealQuantity: 1,
                    mealPrice: basePrice,
                    mealItems: mealItems,
                    addOnItems: addOnItems,
                    totalAddonPrice: totalAddonPrice,
                    deliveryCharge: selectedCustomer?.area?.deliveryAmount || 0,
                    mealFinalPrice: mealFinalPrice
                };
                orderData.tiffinTotalPrice += mealFinalPrice;
            }

            if (mealType.includes('dinner')) {
                orderData.dinner = {
                    mealId: selectedMealPlan._id,
                    mealQuantity: 1,
                    mealPrice: basePrice,
                    mealItems: mealItems,
                    addOnItems: addOnItems,
                    totalAddonPrice: totalAddonPrice,
                    deliveryCharge: selectedCustomer?.area?.deliveryAmount || 0,
                    mealFinalPrice: mealFinalPrice
                };
                orderData.tiffinTotalPrice += mealFinalPrice;
            }

            if (mealType.includes('breakfast')) {
                orderData.breakfast = {
                    mealId: selectedMealPlan._id,
                    mealQuantity: 1,
                    mealPrice: basePrice,
                    mealItems: mealItems,
                    addOnItems: addOnItems,
                    totalAddonPrice: totalAddonPrice,
                    deliveryCharge: selectedCustomer?.area?.deliveryAmount || 0,
                    mealFinalPrice: mealFinalPrice,
                };
                orderData.tiffinTotalPrice += mealFinalPrice;

            }

            const response = await createTiffin(orderData);
            console.log(response, 'response')
            if (response) {
                console.log('Order Data:', JSON.stringify(orderData, null, 2));
                await queryClient.invalidateQueries({
                    queryKey: ['customers']
                });
                // Call your API here
                // await orderApi.createOrder(orderData);

                toast({
                    title: 'Success',
                    description: 'tiffin Created successfully!',
                });
                navigate('/customers');

            }


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
        setMealType(prev => {
            if (e.target.checked) {
                return [...prev, mealType];
            } else {
                return prev.filter(type => type !== mealType);
            }
        });
    }

    console.log(mealType, 'mealType')
    console.log(addOns, 'addOns')

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
    const totalPrice = (selectedMealPlan?.finalPrice || selectedMealPlan?.price) + addOnsTotal + (selectedCustomer?.area?.deliveryAmount || 0);

    console.log(selectedMealPlan, 'selectedMealPlan')

    return (
        <div className="">
            <div className="w-full mx-auto">
                <div className="flex gap-4 mb-6 items-center justify-between border-b border-gray-200 p-4">
                    <div className='flex items-center gap-2.5'>
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
                    <div>
                        <button
                            onClick={() => window.history.back()}
                            className="absolute right-4 top-4 p-2 hover:bg-muted rounded-lg z-10"
                            aria-label="Close"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div className='flex justify-center gap-4 w-full h-[calc(100dvh-120px)]'>
                    {/* Left Column - Customer/Meal Plan Selection */}
                    <>

                        {buildingState === 'customer' ? (
                            <Card className='h-[calc(100dvh-120px)] flex flex-col p-2.5 max-w-[500px] w-full overflow-y-auto'>
                                <div className="flex flex-col h-full">
                                    <CardHeader className='p-0'>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                placeholder="Search customer by name or phone"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="w-full pl-9 py-2 text-xl font-semibold text-black !ring-0 !ring-offset-0 focus:outline-1 focus:outline-blue-500"
                                            />
                                        </div>
                                        {/* <div className='p-3 border-b'>
                                            <p className='text-sm font-medium text-muted-foreground'>Search Result</p>
                                        </div> */}
                                    </CardHeader>
                                    <CardContent className="flex-1 overflow-y-auto p-0 my-2.5">
                                        {isLoadingCustomers ? (
                                            <div className="text-center py-4">Searching...</div>
                                        ) : customers?.length > 0 ? (
                                            <div className='flex flex-col gap-2.5'>
                                                {customers.map((customer) => (
                                                    <div
                                                        key={customer._id}
                                                        className="p-3 border hover:bg-muted/50 cursor-pointer rounded-md flex items-center gap-2.5"
                                                        onClick={() => {
                                                            setSelectedCustomer(customer);
                                                            setBuildingState('meal');
                                                        }}
                                                    >
                                                        <div>
                                                            <div className='w-10 h-10 rounded-full border border-primary bg-secondary flex justify-center items-center'>
                                                                <h1 className='text-xl font-bold text-primary'>{customer.name?.charAt(0).toUpperCase()}</h1>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="text-base font-semibold text-foreground">{customer.name}</div>
                                                            <div className="text-sm font-medium text-muted-foreground">{customer.phone}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center">
                                                <p className="text-muted-foreground">No customers found</p>
                                            </div>
                                        )}
                                    </CardContent>
                                    <div className='flex flex-col gap-2.5'>
                                        {/* <button
                                            className="w-full flex items-center gap-2.5 text-sm font-semibold text-primary p-3 border rounded-md hover:bg-muted/50 cursor-pointer"
                                            onClick={() => setIsCustomerDialogOpen(true)}
                                        >
                                            <Plus className="h-4 w-4 text-primary" />
                                            Walk-in customer
                                        </button> */}
                                        <button
                                            className="w-full flex items-center gap-2.5 text-sm font-semibold text-primary p-3 border rounded-md hover:bg-muted/50 cursor-pointer"
                                            onClick={() => setIsCustomerDialogOpen(true)}
                                        >
                                            <Plus className="h-4 w-4 text-primary" />
                                            Add New Customer
                                        </button>
                                    </div>
                                </div>
                            </Card>
                        ) : (buildingState === 'meal') ? (
                            <Card className='h-[calc(100dvh-120px)] flex flex-col p-2.5 max-w-[500px] w-full overflow-y-auto'>
                                <div className="flex flex-col h-full">
                                    <CardHeader className='p-3 border-b'>
                                        <CardTitle className='text-2xl font-semibold leading-none tracking-tight'>Select a Meal Plan</CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex-1 overflow-y-auto p-0">

                                        {isLoadingMealPlans ? (
                                            <div className="text-center py-4">Loading meal plans...</div>
                                        ) : mealPlans?.length > 0 ? (
                                            <div>
                                                <div className='border mt-3 pb-3 rounded-md'>
                                                    <Label>Meal Plan *</Label>
                                                    {mealPlans.map((plan, index) => (
                                                        <div
                                                            key={plan._id}
                                                            className={`p-3 ${index < mealPlans.length - 1 ? 'border-b' : ''}`}
                                                        >
                                                            <div className={`flex justify-between items-center ${plan._id === selectedMealPlan?._id ? 'pb-2.5' : ''}`}>
                                                                <span className='text-lg font-bold text-foreground'>
                                                                    {plan.name}
                                                                </span>
                                                                {selectedMealPlan?._id !== plan._id && (
                                                                    <Button
                                                                        size="sm"
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
                                                                        Add
                                                                    </Button>
                                                                )}
                                                            </div>
                                                            {selectedMealPlan?._id === plan?._id &&

                                                                selectedMealPlan?.items?.length > 0 && <div className='flex justify-between items-center py-2 pr-3 pl-10 gap-4 border-t'>
                                                                    <div className='w-[200px]'>
                                                                        <span className='text-sm font-medium text-muted-foreground'>Item</span>
                                                                    </div>
                                                                    <div className='flex items-center gap-5'>
                                                                        <span className='text-sm font-medium text-muted-foreground w-[60px]'>Quantity</span>
                                                                        <span className='text-sm font-medium text-muted-foreground w-[100px]'>Price</span>
                                                                        <span className='text-sm font-medium text-muted-foreground w-[60px] text-right'>Total</span>
                                                                    </div>
                                                                </div>}

                                                            {selectedMealPlan?._id === plan?._id && selectedMealPlan?.items?.map((item, index) => (
                                                                <div key={index} className='border-t'>
                                                                    <div className='flex justify-between items-center py-2 pr-3 pl-10 gap-4'>
                                                                        <div>
                                                                            <h2 className='text-sm text-muted-foreground'>
                                                                                {item.itemId?.name || 'Unnamed Item'}
                                                                            </h2>
                                                                        </div>
                                                                        <div className='flex items-center gap-5'>
                                                                            <Input
                                                                                type="number"
                                                                                value={item.qty || 1}
                                                                                min={1}
                                                                                onChange={(e) => {
                                                                                    const newQty = parseInt(e.target.value) || 1;
                                                                                    handleQuantityChange(index, newQty);
                                                                                }}
                                                                                className='w-[50px]'
                                                                            />
                                                                            <Input
                                                                                type="number"
                                                                                value={item.itemId?.price || 0}
                                                                                disabled
                                                                                className='w-[100px] bg-gray-100'
                                                                            />
                                                                            <span className='w-[50px] text-right'>
                                                                                ₹{(item.qty || 1) * (item.itemId?.price || 0)}
                                                                            </span>
                                                                        </div>
                                                                    </div>

                                                                </div>
                                                            ))}

                                                            {selectedMealPlan?._id === plan?._id &&
                                                                <div className="flex justify-end gap-2">
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => setBuildingState('menu')}
                                                                    >
                                                                        <Plus className="w-4 h-4 mr-1" />
                                                                        Add Items
                                                                    </Button>

                                                                </div>
                                                            }

                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                                                <div className="mb-4">
                                                    <ShoppingCart className="h-12 w-12 text-muted-foreground" />
                                                </div>
                                                <p className="text-muted-foreground mb-4">No meal plans available</p>
                                                <Button
                                                    onClick={() => window.location.href = '/meals'}
                                                    className="mt-2"
                                                >
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Create Meal Plan
                                                </Button>
                                            </div>
                                        )}
                                    </CardContent>
                                </div>
                            </Card>
                        ) : (
                            <Card className='h-[calc(100dvh-120px)] flex flex-col p-2.5 max-w-[500px] w-full overflow-y-auto'>
                                <CardHeader className='p-0'>
                                    <CardTitle className='mb-3'>Extra Addons</CardTitle>
                                </CardHeader>
                                <div className='p-3 flex flex-col gap-3 h-full overflow-y-auto'>
                                    {menuItems?.map(item => (
                                        <div
                                            key={item.id}
                                            className="flex flex-col gap-2 p-3 border rounded-md"
                                        >
                                            <div className='flex justify-between items-center'>
                                                <div className='flex items-center gap-2.5'>
                                                    <span className="text-base font-semibold text-foreground">{item.name}</span>
                                                    <span className="text-sm font-medium text-muted-foreground">₹{item.price}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        defaultValue="1"
                                                        className="w-20"
                                                        onChange={(e) => {

                                                            setAddOnQuantities(prev => ({
                                                                ...prev,
                                                                [item.id]: parseInt(e.target.value) || 1
                                                            }));
                                                        }}
                                                    />
                                                    <Button
                                                        size="sm"
                                                        onClick={() => {
                                                            const quantity = addOnQuantities[item.id] || 1;
                                                            handleAddAddOn({ ...item, quantity });
                                                        }}
                                                        disabled={addedItemIds.has(item._id || item.id) &&
                                                            addOns.find(a => (a._id === item._id || a.id === item.id))?.quantity === (addOnQuantities[item.id] || 1)}
                                                    >
                                                        {addedItemIds.has(item._id || item.id) ? 'Added' : 'Add'}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}

                    </>

                    {/* Right Column - Order Summary */}
                    {selectedMealPlan && (
                        <>
                            {/* <Card className="h-[90vh] flex flex-col">
                                <CardHeader>
                                    <CardTitle>Order Summary</CardTitle>
                                </CardHeader>
                                <CardContent className="flex-1 overflow-y-auto">
                                    {selectedCustomer && (
                                        <div className="mb-6">
                                            <h3 className="font-medium mb-2">Customer</h3>
                                            <div className="p-3 border rounded-lg">
                                                <div className="font-medium">{selectedCustomer.name}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {selectedCustomer.phone}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div className="mb-4">
                                            <label className="text-sm font-medium mb-2 block">Billing Type *</label>
                                            <select
                                                value={billingType}
                                                onChange={(e) => setBillingType(e.target.value as 'fixed' | 'monthly')}
                                                className="border rounded-lg p-2 w-[50%]"
                                            >
                                                <option value="fixed">Fixed</option>
                                                <option value="monthly">Monthly</option>
                                            </select>
                                        </div>

                                        <div className="grid grid-cols-2">

                                            <div className="space-y-2 w-50">
                                                <div className="text-sm font-medium mb-1">Start Date *</div>
                                                <Input
                                                    name="startDate"
                                                    type="date"
                                                    required
                                                    value={dates.startDate}
                                                    onChange={handleDateChange}
                                                    min={new Date().toISOString().split("T")[0]}
                                                    className="w-50"
                                                />
                                            </div>

                                            <div className="space-y-2 w-50">
                                                <div className="text-sm font-medium mb-1">End Date *</div>
                                                <Input
                                                    name="endDate"
                                                    type="date"
                                                    required={billingType === "fixed"}
                                                    value={dates.endDate}
                                                    onChange={handleDateChange}
                                                    min={dates.startDate || new Date().toISOString().split("T")[0]}
                                                    className="w-50"
                                                />
                                                {new Date(dates.endDate) < new Date(dates.startDate) && (
                                                    <p className="text-sm text-red-500">
                                                        End date must be after start date
                                                    </p>

                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 mb-5">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={mealType.includes("breakfast")}
                                                disabled={!selectedMealPlan?.type.includes("breakfast")}
                                                onChange={(e) => handleMealPlanTypeChange(e, "breakfast")}
                                            />
                                            <label
                                                className={
                                                    !selectedMealPlan?.type.includes("breakfast")
                                                        ? "text-muted-foreground"
                                                        : ""
                                                }
                                            >
                                                Breakfast
                                            </label>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={mealType.includes("lunch")}
                                                disabled={!selectedMealPlan?.type.includes("lunch")}
                                                onChange={(e) => handleMealPlanTypeChange(e, "lunch")}
                                            />
                                            <label
                                                className={
                                                    !selectedMealPlan?.type.includes("lunch")
                                                        ? "text-muted-foreground"
                                                        : ""
                                                }
                                            >
                                                Lunch
                                            </label>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={mealType.includes("dinner")}
                                                disabled={!selectedMealPlan?.type.includes("dinner")}
                                                onChange={(e) => handleMealPlanTypeChange(e, "dinner")}
                                            />
                                            <label
                                                className={
                                                    !selectedMealPlan?.type.includes("dinner")
                                                        ? "text-muted-foreground"
                                                        : ""
                                                }
                                            >
                                                Dinner
                                            </label>
                                        </div>
                                    </div>

                                    {selectedMealPlan && (
                                        <Card className="mb-4">
                                            <CardHeader className="p-4 pb-2">
                                                <CardTitle className="text-lg">{selectedMealPlan.name}</CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-4 pt-0">
                                                <p className="text-muted-foreground text-sm mb-4">{selectedMealPlan.description}</p>

                                                <div className="space-y-4">
                                                    <div className="space-y-2">
                                                        <div className="text-sm font-medium">Meal Plan Items:</div>
                                                        {selectedMealPlan.items?.map((item, index) => (
                                                            <div key={index} className="flex justify-between text-sm">
                                                                <span className="text-muted-foreground">
                                                                    {item.qty}x {item.itemId?.name || 'Item'}
                                                                </span>
                                                                <span>₹{(item.qty * (item.itemId?.price || 0)).toFixed(2)}</span>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {addOns.length > 0 && (
                                                        <div className="space-y-2">
                                                            <div className="text-sm font-medium">Add-ons:</div>
                                                            {addOns.map((item, index) => (
                                                                <div key={`addon-${index}`} className="flex justify-between text-sm">
                                                                    <span className="text-muted-foreground">
                                                                        {item.quantity}x {item.name}
                                                                    </span>
                                                                    <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    <div className="border-t pt-3">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <span className="font-medium">Meal Plan Price:</span>
                                                            <span>₹{totalPrice.toFixed(2)}</span>
                                                        </div>

                                                        <div className="my-4 flex justify-between items-center">
                                                            <label className="block text-xl font-medium mb-1">Final Price</label>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                value={selectedMealPlan.finalPrice ?? totalPrice}
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

                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => setBuildingState('menu')}
                                                            >
                                                                <Plus className="w-4 h-4 mr-1" />
                                                                Add Items
                                                            </Button>

                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}

                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-medium mb-2 block">Advanced Payment</label>
                                        <Input
                                            type="number"
                                            value={advancedPayment}
                                            onChange={(e) => setAdvancedPayment(Number(e.target.value) || 0)}
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>

                                    <div className="flex justify-end pt-4">
                                        <Button
                                            size="sm"
                                            onClick={handlePlaceOrder}
                                        >
                                            Add Tiffin
                                        </Button>
                                    </div>

                                </CardContent>
                            </Card> */}
                            <Card className='h-full border-gray-200 p-5 max-w-[574px] w-full overflow-y-auto'>
                                <CardHeader className='p-0'>
                                    <CardTitle className='mb-3'>Order Summary</CardTitle>
                                </CardHeader>
                                <div className='border rounded-md flex justify-between items-center p-3'>
                                    <div className="flex items-center gap-2.5" >
                                        <div>
                                            <div className='w-12 h-12 rounded-full border border-primary bg-secondary flex justify-center items-center'>
                                                <h1 className='text-2xl font-bold text-primary'>{selectedCustomer?.name?.charAt(0).toUpperCase()}</h1>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-base font-semibold text-foreground">
                                                {selectedCustomer?.name || 'Customer Name'}
                                            </div>
                                            {selectedCustomer?.phone && (
                                                <div className="text-sm font-medium text-muted-foreground">
                                                    {selectedCustomer.phone}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className='flex items-center gap-2.5'>
                                        {/* <div className='py-1 px-3 rounded-sm bg-green-100'><span className='text-sm font-medium text-green-700'>Bal $ 8774</span> </div>
                                        <div className='cursor-pointer'>
                                            <CircleX className='w-4 h-4 text-muted-foreground hover:text-black transition-all duration-300 ease-in-out' />
                                        </div> */}
                                    </div>
                                </div>
                                <div className='flex flex-col gap-2'>
                                    <div className='pt-2.5'>
                                        <div className='flex items-center gap-2.5 mt-2.5'>
                                            <h3 className='text-base font-bold text-foreground'>Meal</h3>
                                            <div className='bg-secondary text-black text-xs font-medium p-1 rounded-sm border'>1</div>
                                        </div>
                                        <div className='grid grid-cols-2 gap-2.5'>
                                            <div className='mb-2.5 col-span-2'>
                                                <label className="text-sm font-medium mb-2 block">Billing Type *</label>
                                                <select
                                                    value={billingType}
                                                    onChange={(e) => setBillingType(e.target.value as 'fixed' | 'monthly')}
                                                    className="border rounded-lg p-2 w-full"
                                                >
                                                    <option value="fixed">Fixed</option>
                                                    <option value="monthly">Monthly</option>
                                                </select>
                                            </div>
                                            <div className='mb-2.5'>
                                                <div className="text-sm font-medium mb-1">Start Date *</div>
                                                <Input
                                                    name="startDate"
                                                    type="date"
                                                    required
                                                    value={dates.startDate}
                                                    onChange={handleDateChange}
                                                    min={new Date().toISOString().split("T")[0]}
                                                    className="w-full"
                                                />
                                            </div>
                                            <div className='mb-2.5'>
                                                <div className="text-sm font-medium mb-1">End Date *</div>
                                                <Input
                                                    name="endDate"
                                                    type="date"
                                                    required={billingType === "fixed"}
                                                    value={dates.endDate}
                                                    onChange={handleDateChange}
                                                    min={dates.startDate || new Date().toISOString().split("T")[0]}
                                                    className="w-full"
                                                />
                                                {new Date(dates.endDate) < new Date(dates.startDate) && (
                                                    <p className="text-sm text-red-500">
                                                        End date must be after start date
                                                    </p>

                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className='flex items-center gap-2 mb-5'>
                                        <div className='flex items-center gap-2.5'>
                                            <input
                                                type="checkbox"
                                                checked={mealType.includes("breakfast")}
                                                disabled={!selectedMealPlan || !selectedMealPlan.type.includes("breakfast")}
                                                onChange={(e) => handleMealPlanTypeChange(e, "breakfast")}
                                                className={`w-4 h-4 ${!selectedMealPlan || !selectedMealPlan.type.includes("breakfast") ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                            />
                                            <label
                                                htmlFor="breakfast"
                                                className={`text-base font-semibold ${!selectedMealPlan || !selectedMealPlan.type.includes("breakfast") ? 'text-muted-foreground' : 'text-foreground'} cursor-pointer select-none`}
                                            >
                                                breakfast
                                            </label>
                                        </div>
                                        <div className='flex items-center gap-2.5'>
                                            <input
                                                type="checkbox"
                                                checked={mealType.includes("lunch")}
                                                disabled={!selectedMealPlan || !selectedMealPlan.type.includes("lunch")}
                                                onChange={(e) => handleMealPlanTypeChange(e, "lunch")}
                                                className={`w-4 h-4 ${!selectedMealPlan || !selectedMealPlan.type.includes("lunch") ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                            />
                                            <label
                                                htmlFor="lunch"
                                                className={`text-base font-semibold ${!selectedMealPlan || !selectedMealPlan.type.includes("lunch") ? 'text-muted-foreground' : 'text-foreground'} cursor-pointer select-none`}
                                            >
                                                lunch
                                            </label>
                                        </div>
                                        <div className='flex items-center gap-2.5'>
                                            <input
                                                type="checkbox"
                                                checked={mealType.includes("dinner")}
                                                disabled={!selectedMealPlan || !selectedMealPlan.type.includes("dinner")}
                                                onChange={(e) => handleMealPlanTypeChange(e, "dinner")}
                                                className={`w-4 h-4 ${!selectedMealPlan || !selectedMealPlan.type.includes("dinner") ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                            />
                                            <label
                                                htmlFor="dinner"
                                                className={`text-base font-semibold ${!selectedMealPlan || !selectedMealPlan.type.includes("dinner") ? 'text-muted-foreground' : 'text-foreground'} cursor-pointer select-none`}
                                            >
                                                dinner
                                            </label>
                                        </div>
                                    </div>
                                    {selectedMealPlan && (
                                        <Card className="mb-4">
                                            <CardHeader className="p-4 pb-2">
                                                <CardTitle className="text-lg">{selectedMealPlan.name}</CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-4 pt-0">
                                                {/* <p className="text-muted-foreground text-sm mb-4">{selectedMealPlan.description}</p>     */}

                                                <div className="space-y-4">
                                                    <div className="space-y-2">
                                                        <div className="text-sm font-medium">Meal Plan Items:</div>
                                                        {selectedMealPlan.items?.map((item, index) => (
                                                            <div key={index} className="flex justify-between text-sm">
                                                                <span className="text-muted-foreground">
                                                                    {item.qty}x {item.itemId?.name || 'Item'}
                                                                </span>
                                                                <span>₹{(item.qty * (item.itemId?.price || 0)).toFixed(2)}</span>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {
                                                        addOns.length > 0 && (
                                                            <div className="space-y-2">
                                                                <div className="text-sm font-medium">Add-Ons:</div>
                                                                {addOns.map((item, index) => (
                                                                    <div key={index} className="flex justify-between text-sm">
                                                                        <span className="text-muted-foreground">
                                                                            {item.quantity}x {item.name}
                                                                        </span>
                                                                        <span>₹{(item.quantity * item.price).toFixed(2)}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )
                                                    }
                                                    {selectedCustomer?.area?.deliveryAmount && (
                                                        <div className="flex justify-between items-center my-2">
                                                            <span className="text-muted-foreground text-sm">Delivery Charge:</span>
                                                            <span className="text-sm">₹{selectedCustomer.area.deliveryAmount.toFixed(2)}</span>
                                                        </div>
                                                    )}
                                                    <div className="border-t pt-3">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <span className="font-medium">Meal Plan Price:</span>
                                                            <span>₹{totalPrice.toFixed(2)}</span>
                                                        </div>

                                                        <div className="my-4 flex justify-between items-center">
                                                            <label className="block text-xl font-medium mb-1">Final Price</label>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                value={totalPrice}
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


                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-medium mb-2 block">Advanced Payment</label>
                                        <Input
                                            type="number"
                                            value={advancedPayment}
                                            onChange={(e) => setAdvancedPayment(Number(e.target.value) || 0)}
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                    <div className="flex justify-end pt-4">
                                        <Button
                                            size="sm"
                                            onClick={handlePlaceOrder}
                                        >
                                            Add Tiffin
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </>)
                        // meal menu
                    }

                    {/* {
                        (buildingState === 'menu') && (

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


                                    <div className="space-y-4 mt-6">
                                        <Card className="border rounded-lg ">
                                            <CardHeader className="p-4 pb-2">
                                                <CardTitle className="text-lg">Order Summary</CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-4 pt-0 space-y-4">
                                                <div className="space-y-2">
                                                    <div className="flex justify-between">
                                                        <span>Meal Plan : {selectedMealPlan?.name}</span>
                                                        <span>₹{selectedMealPlan?.finalPrice?.toFixed(2) || selectedMealPlan?.price?.toFixed(2)}</span>
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
                    } */}
                </div>



            </div >
            {isCustomerDialogOpen && <Dialog open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen}>

                <CustomerForm
                    open={isCustomerDialogOpen}
                    onClose={() => setIsCustomerDialogOpen(false)}
                    setBuildingState={setBuildingState}
                    refetch={refetchCustomers}
                    setRefetch={setRefetchCustomers}
                />

            </Dialog>
            }
        </div >
    );
}