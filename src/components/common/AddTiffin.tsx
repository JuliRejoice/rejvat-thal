// src/app/orders/new/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, ShoppingCart, X, Minus, Trash2, UtensilsCrossed, Package } from 'lucide-react';
import { mealMenuApi } from '@/api/mealMenu.api';
import { useToast } from '@/hooks/use-toast';
import { getCustomer } from '@/api/customer.api';
import { useAuth } from '@/contexts/AuthContext';
import { menuApi } from '@/api/menu.api';
import { createTiffin } from '@/api/tiffin.api';
import { getPaymentMethods } from "@/api/paymentMethod.api"
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from "@/components/ui/badge";
import { DialogDescription } from '@radix-ui/react-dialog';
import AddItemsModal from './AddItemsModal';
import useComboMeals from '../../hooks/useComboMeals';
import { Dirham } from '../Svg';
import DiscountPopup from './InvoiceDiscount';
import { getThresholdAmont } from "@/api/settings.api";
import AmountInput from "./InvoiceAmountInput";
import RoundingOff from "./InvoiceRoundingOff";
import { Checkbox } from "@/components/ui/checkbox";


// Single item inside a meal
interface MealItem {
    _id?: string;
    qty: number;
    itemId: {
        _id: string;
        name: string;
        price: number;
        originalQty?: number; // optional, for tracking customization
    };
}

// Full meal plan
interface MealPlan {
    _id: string;
    name: string;
    description?: string;
    type?: string[]; // 👈 make optional
    items: MealItem[];
    price?: number;
    singleMealPrice?: number;
    doubleMealPrice?: number;
    finalPrice?: number;
    isActive?: boolean;
    restaurantId?: string;
    createdAt?: string;
    updatedAt?: string;
}


// Cart item structure
interface CartItem {
    id: string;
    mealPlan: MealPlan;
    mealType: string[];
    quantity: number;
    totalPrice: number;
}

interface AddTiffinProps {
    customerId: string;
    onSuccess?: () => void;
    areas?: any[];
}

export default function NewOrderPage({ customerId, onSuccess, areas }: AddTiffinProps) {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState('customer');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [selectedMealPlan, setSelectedMealPlan] = useState<MealPlan | null>(null);

    const [savedAdvance, setSavedAdvance] = useState<{
        amount: number;
        paymentMethod: string;
        description: string;
        status: 'unpaid' | 'part_paid' | 'paid' | 'advance';
    } | null>(null)
    const [addOns, setAddOns] = useState<Array<{
        id: string;
        _id: string;
        name: string;
        price: number;
        quantity: number;
        mealTime: string;
    }>>([]);

    const [advancedPayment, setAdvancedPayment] = useState<number>(0);
    const [paymentMethod, setPaymentMethod] = useState<string>('');
    const [isSubmited, setIsSubmited] = useState(false);
    const [description, setDescription] = useState<string>('');
    // Discount related states
    const [discount, setDiscount] = useState(0);
    const [discountType, setDiscountType] = useState<string>('rupees');
    const [discountValue, setDiscountValue] = useState(0);
    const [finalTotal, setFinalTotal] = useState(0);
    const [additionalAmount, setAdditionalAmount] = useState(0);
    const [additionalAmountTitle, setAdditionalAmountTitle] = useState('');
    const [roundingValue, setRoundingValue] = useState(0);

    // Active tab state for the Add Items modal
    const [addItemsTab, setAddItemsTab] = useState<'tiffin' | 'custom'>('tiffin');
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [billingType, setBillingType] = useState<'fixed' | 'monthly'>('fixed');
    const [isAddOnModalOpen, setIsAddOnModalOpen] = useState(false);
    const [includeDelivery, setIncludeDelivery] = useState(false);
    const queryClient = useQueryClient()


    const comboState = useComboMeals(cartItems, addOns)
    const totalPrice = useMemo(() => {
        return comboState.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
    }, [comboState])
    useEffect(() => {
        if (customerId) {
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
    }, [customerId]);

    const getPaymentStatus = (amount: number, total: number) => {
        if (amount === 0) return 'unpaid';
        if (amount < total) return 'part_paid';
        if (amount > total) return 'advance';
        return 'paid';
    };

    const getButtonLabel = () => {

        const status = getPaymentStatus(Number(advancedPayment), Number(finalTotal));
        switch (status) {
            case 'unpaid': return "Save as Unpaid";
            case 'part_paid': return "Save as Part Paid";
            case 'paid': return "Save as Paid";
            case 'advance': return "Save with Advance";
            default: return "Save";
        }
    };

    const handleSaveAdvance = () => {
        // Convert to numbers to ensure proper comparison
        const payment = Number(advancedPayment);
        const total = Number(finalTotal);

        // Validate that advance is not greater than final total
        if (payment > total) {
            toast({
                title: "Error",
                description: "Advance amount cannot be greater than the total amount",
                variant: "destructive"
            });
            return;
        }

        const status = getPaymentStatus(payment, total);
        setSavedAdvance({
            amount: payment,
            paymentMethod: paymentMethod || '',
            description,
            status
        });

        toast({
            title: "Success",
            description: "Advance saved successfully",
            variant: "default"
        });
    };

    const [dates, setDates] = useState({
        startDate: '',
        endDate: ''
    });
    const { user } = useAuth();


    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setDates(prev => ({
            ...prev,
            [name]: value
        }));
    };


    // Fetch meal plans
    const { data: mealPlansData, isLoading: isLoadingMealPlans } = useQuery({
        queryKey: ['meal-plans', user?.restaurantId?._id],  // Add restaurantId to query key
        queryFn: () => mealMenuApi.getMealMenus({
            isActive: true,
            restaurantId: user?.restaurantId?._id
        }),
        enabled: !!user?.restaurantId?._id,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });


    const mealPlans = mealPlansData?.items || [];

    const { data: menuItemData, isLoading: menuItemLoading } = useQuery({
        queryKey: ['menu-items', user?.restaurantId?._id],
        queryFn: () => menuApi.getMenuItems({ restaurantId: user?.restaurantId?._id }),

    });
    const menuItems = menuItemData?.items || [];

    const queriesResults = useQueries({
        queries: [
            {
                queryKey: ["get-payment-methods"],
                queryFn: () => getPaymentMethods(),
            },
            {
                queryKey: ["get-threshold-amount"],
                queryFn: () => getThresholdAmont({}),
            },
        ],
    });

    const [
        getPaymentMethodsQuery,
        getThresholdAmountQuery
    ] = queriesResults;

    const { data: paymentMethods } = getPaymentMethodsQuery;
    const { data: thresholdAmount } = getThresholdAmountQuery;



    const handleAddAddOn = (item: {
        id: string;
        _id: string;
        name: string;
        price: number;
        quantity?: number;
        mealTime?: string;
    }) => {
        const itemId = item._id || item.id;
        const quantity = item.quantity || 1;
        const mealTime = item.mealTime || '';

        if (!mealTime) {
            toast({
                title: "Error",
                description: "Please select a mealtime first",
                variant: "destructive"
            });
            return;
        }

        setAddOns(prev => {
            // Check if item already exists for this meal time
            const existingIndex = prev.findIndex(addOn =>
                (addOn._id === itemId || addOn.id === itemId) &&
                addOn.mealTime === mealTime
            );

            if (existingIndex >= 0) {
                // Update existing add-on
                const updatedAddOns = prev.map((addOn, index) =>
                    index === existingIndex
                        ? { ...addOn, quantity: (addOn.quantity || 0) + quantity }
                        : addOn
                );

                return updatedAddOns;
            } else {


                return [
                    ...prev,
                    {
                        ...item,
                        _id: itemId,
                        id: item.id,
                        quantity: quantity,
                        mealTime: mealTime
                    }
                ];
            }
        });

        // Show success message
        toast({
            title: "Success",
            description: `${item.name} added to ${mealTime}`,
        });
    };


    const handlePlaceOrder = async () => {
        setIsSubmited(true);
        try {
            if (cartItems.length === 0 || !selectedCustomer) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Please add items to cart and select a customer",
                });
                setIsSubmited(false);
                return;
            }

            if (!dates.startDate) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Please select start date",
                });
                setIsSubmited(false);
                return;
            }

            if (!dates.endDate && billingType === "fixed") {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Please select end date",
                });
                setIsSubmited(false);
                return;
            }

            if (dates.endDate && new Date(dates.endDate) < new Date(dates.startDate)) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "End date must be after start date",
                });
                setIsSubmited(false);
                return;
            }

            // Group cart items by meal type (lunch, dinner, breakfast)
            const groupedItems = cartItems.reduce((acc, item) => {
                item.mealType.forEach((type) => {
                    if (!acc[type]) acc[type] = [];
                    acc[type].push(item);
                });
                return acc;
            }, {} as Record<string, typeof cartItems>);

            // Group addOns by mealTime
            const groupedAddOns = addOns?.reduce((acc, addon) => {
                const type = addon.mealTime;
                if (!acc[type]) acc[type] = [];
                acc[type].push(addon);
                return acc;
            }, {} as Record<string, any[]>) || {};

            // Base order data
            const orderData: any = {
                customerId: selectedCustomer._id,
                restaurantId: selectedCustomer.restaurantId?._id || selectedCustomer.restaurantId,
                startDate: dates.startDate,
                endDate: billingType === 'fixed' ? dates.endDate : undefined,
                deliveryIncluded: includeDelivery,
                billingCycle: billingType,
                remark: description || '',
                advancedPayment,
                paymentMethod,
                discountType: discountType === 'rupees' ? 'direct_amount' : 'percentage',
                discount: discountValue,
                additionalAmount: {
                    title: additionalAmountTitle || 'packaging fees',
                    price: additionalAmount
                },
                taxPercentage: taxPercentage || 0,
                taxAmount,
                roundOffAmount: roundingValue,
                tiffinTotalPrice: 0,
                totalDeliveryCharge: includeDelivery ? deliveryAmount : 0,
                subTotal: 0
            };

            const allMealTypes = Array.from(
                new Set([
                    ...Object.keys(groupedItems),
                    ...Object.keys(groupedAddOns),
                    'breakfast', 'lunch', 'dinner'
                ])
            );

            allMealTypes.forEach(mealType => {
                orderData[mealType] = {
                    meal: [],
                    addOnItems: [],
                    totalAddonPrice: 0,
                    deliveryCharge: 0,
                    mealFinalPrice: 0
                };
            });

            Object.entries(groupedItems).forEach(([mealType, items]) => {
                const meals = items.map((item) => {
                    const comboItem = comboState.find(combo =>
                        combo.mealPlan?._id === item.mealPlan._id &&
                        combo.type === mealType
                    );

                    const mealPrice = comboItem?.mealPlan?.price ||
                        item.mealPlan.singleMealPrice ||
                        item.mealPlan.doubleMealPrice ||
                        item.mealPlan.price || 0;

                    return {
                        mealId: item.mealPlan._id,
                        mealName: item.mealPlan.name,
                        menuName: item.mealPlan.name,
                        mealQuantity: item.quantity,
                        mealPrice: Number(mealPrice) || 0,
                        mealItems: item.mealPlan.items.map((m) => ({
                            menuId: m.itemId._id,
                            quantity: m.qty,
                            price: Number(m.itemId.price) || 0,
                        })),
                    };
                });

                const addOnItems = groupedAddOns[mealType]?.map((addon) => ({
                    menuId: addon._id || addon.id,
                    quantity: addon.quantity,
                    price: Number(addon.price) || 0,
                })) || [];

                const totalAddonPrice = addOnItems.reduce(
                    (sum, item) => sum + (item.price * item.quantity),
                    0
                );

                const totalMealPrice = items.reduce((sum, item) => {
                    const comboItem = comboState.find(combo =>
                        combo.mealPlan?._id === item.mealPlan._id &&
                        combo.type && combo.type.includes(mealType)
                    );

                    let itemPrice = 0;
                    if (comboItem) {
                        const mealTypesInCombo = comboItem.type.split('+');
                        const comboSize = mealTypesInCombo.length;
                        if (comboSize === 2) {
                            itemPrice = (item.mealPlan.doubleMealPrice || item.mealPlan.price * 2 || 0) / 2;
                        } else if (comboSize === 3) {
                            itemPrice = (item.mealPlan.doubleMealPrice || item.mealPlan.price * 3 || 0) / 3;
                        } else {
                            itemPrice = item.mealPlan.singleMealPrice || item.mealPlan.price || 0;
                        }
                    } else {
                        itemPrice = item.mealPlan.price || 0;
                    }

                    return sum + (Number(itemPrice) * item.quantity);
                }, 0);

                const deliveryCharge = includeDelivery ? (selectedCustomer?.area?.deliveryAmount || 0) : 0;
                const mealFinalPrice = Number(totalMealPrice) + Number(totalAddonPrice);

                orderData[mealType] = {
                    meal: meals,
                    addOnItems,
                    totalAddonPrice: Number(totalAddonPrice) || 0,
                    deliveryCharge: Number(deliveryCharge) || 0,
                    mealFinalPrice: Number(mealFinalPrice) || 0,
                };
            });

            Object.entries(groupedAddOns).forEach(([mealType, addons]) => {
                if (!orderData[mealType]?.meal?.length) {
                    const addOnItems = addons.map((addon) => ({
                        menuId: addon._id || addon.id,
                        quantity: addon.quantity,
                        price: Number(addon.price) || 0,
                    }));

                    const totalAddonPrice = addOnItems.reduce(
                        (sum, item) => sum + (item.price * item.quantity),
                        0
                    );

                    const deliveryCharge = includeDelivery ? (selectedCustomer?.area?.deliveryAmount || 0) : 0;

                    orderData[mealType] = {
                        meal: [],
                        addOnItems,
                        totalAddonPrice,
                        deliveryCharge,
                        mealFinalPrice: totalAddonPrice,
                    };
                }
            });

            orderData.subTotal = totalPrice;
            orderData.tiffinTotalPrice = finalTotal;

            // Remove empty meal types
            ['breakfast', 'lunch', 'dinner'].forEach(mealType => {
                if (!orderData[mealType].meal.length && !orderData[mealType].addOnItems.length) {
                    delete orderData[mealType];
                }
            });


            const response = await createTiffin(orderData);
            if (response) {
                await queryClient.invalidateQueries({ queryKey: ["customers"] });
                toast({
                    title: "Success",
                    description: "Tiffin Created successfully!",
                });
                setCartItems([]);
                setAddOns([]);
                setSelectedCustomer(null);
                setDiscount(0);
                setDiscountValue(0);
                setAdditionalAmount(0);
                setAdvancedPayment(0);
                setPaymentMethod('');
                setDescription('');
                setDates({ startDate: '', endDate: '' });

                if (onSuccess) {
                    onSuccess();
                }
            }

        } catch (error) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to place order. Please try again.",
            });
        }
        setIsSubmited(false);
    };

    const deliveryAmount = useMemo(() => {
        if (!includeDelivery || !selectedCustomer?.area?.deliveryAmount) return 0;

        // Recompute unique meal types from cart items and add-ons
        const activeMealTypes = new Set<string>();

        // Add meal types from cart items
        cartItems.forEach(item => {
            item.mealType.forEach(type => activeMealTypes.add(type));
        });

        // Add meal times from add-ons
        addOns.forEach(addOn => {
            if (addOn.mealTime) {
                activeMealTypes.add(addOn.mealTime);
            }
        });

        return selectedCustomer.area.deliveryAmount * activeMealTypes.size;
    }, [includeDelivery, selectedCustomer?.area?.deliveryAmount, cartItems, addOns]);


    const handleAddToCart = (mealPlan: MealPlan) => {
        if (!mealPlan) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "No tiffin data found to add to cart",
            });
            return;
        }

        // Get the meal times - either from the plan's type or use selectedMealTime
        const mealTimes = mealPlan.type

        if (!mealTimes || mealTimes.length === 0) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "No valid meal times found",
            });
            return;
        }

        setCartItems(prev => {
            let updatedCart = [...prev];

            mealTimes.forEach(mealTime => {
                // Check if this meal plan already exists in the cart for this meal time
                const existingItemIndex = updatedCart.findIndex(item =>
                    item.mealPlan._id === mealPlan._id &&
                    item.mealType.includes(mealTime)
                );

                // Calculate total price for custom tiffin
                const totalCustomPrice = mealPlan.price

                if (existingItemIndex !== -1) {
                    // Update quantity if item already exists
                    updatedCart[existingItemIndex] = {
                        ...updatedCart[existingItemIndex],
                        quantity: updatedCart[existingItemIndex].quantity + 1,
                        totalPrice: updatedCart[existingItemIndex].totalPrice + totalCustomPrice
                    };
                } else {
                    const newItem: CartItem = {
                        id: `${mealPlan._id}-${mealTime}-${Date.now()}`,
                        mealPlan: JSON.parse(JSON.stringify(mealPlan)),
                        mealType: [mealTime],
                        quantity: 1,
                        totalPrice: totalCustomPrice
                    };
                    updatedCart.push(newItem);
                }
            });

            return updatedCart
        });

        toast({
            title: "Success",
            description: `Meal updated in cart!`,
        });

        setSelectedMealPlan(null);
    };
    const handleRemoveFromCart = (itemId: string) => {
        setCartItems(prev => prev.filter(item => item.id !== itemId));
    };

    const handleRemoveAddOn = (addOnId: string, mealTime: string) => {
        setAddOns(prev => prev.filter(addOn => !(addOn.id === addOnId && addOn.mealTime === mealTime)));
    };

    const handleUpdateCartItemQuantity = (itemId: string, newQuantity: number) => {
        if (newQuantity < 1) return;

        setCartItems(prev => prev.map(item =>
            item.id === itemId
                ? {
                    ...item,
                    quantity: newQuantity,
                    totalPrice: (item.totalPrice / item.quantity) * newQuantity,
                }
                : item
        ));
    }

    const baseTotal = useMemo(
        () => totalPrice - discount + additionalAmount + deliveryAmount,
        [totalPrice, discount, additionalAmount, deliveryAmount]
    );


    // Set initial tax rate from threshold amount

    const taxPercentage = useMemo(() => {
        return thresholdAmount?.payload?.data?.find(
            (item: any) => item.restaurantId?._id === user?.restaurantId?._id
        )?.taxPercentage;
    }, [thresholdAmount]);

    // Calculate tax amount
    const taxAmount = useMemo(() => {
        return ((baseTotal) * (taxPercentage / 100)) || 0;
    }, [baseTotal, taxPercentage]);

    useEffect(() => {
        setFinalTotal(baseTotal + roundingValue + taxAmount);
    }, [baseTotal, roundingValue, taxAmount]);


    const taxableAmount = useMemo(() => {
        return baseTotal + taxAmount + deliveryAmount;
    }, [baseTotal, taxAmount, deliveryAmount]);


    return (
        <>
            <div className="flex flex-col h-full">
                <div className="flex-1 overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">

                        {
                            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 lg:p-6 overflow-y-auto">
                                <div className="h-full">
                                    <div className="flex flex-col gap-6">
                                        <div className="flex items-center justify-end">
                                            <Button
                                                variant="default"
                                                size="sm"
                                                className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white shadow-sm px-3 py-1.5 rounded-md w-fit"
                                                onClick={() => {

                                                    setIsAddOnModalOpen(true);
                                                    setAddItemsTab("tiffin");
                                                }}
                                            >
                                                <Plus className="h-4 w-4" />
                                                Add
                                            </Button>
                                        </div>
                                        {(cartItems.length > 0 || addOns.length > 0) && ["breakfast", "lunch", "dinner"].map((mealTime) => {
                                            const mealCartItems = cartItems.filter((item) =>
                                                item.mealType.includes(mealTime)
                                            );
                                            const mealAddOns = addOns.filter(
                                                (addOn) => addOn.mealTime === mealTime
                                            );
                                            return (
                                                <div
                                                    key={mealTime}
                                                    className="border border-gray-200 rounded-xl p-4 shadow-sm bg-white space-y-4"
                                                >
                                                    {/* Header Section */}
                                                    <div
                                                        className={`flex items-center justify-between ${mealCartItems.length > 0 || mealAddOns.length > 0 ? "border-b pb-3" : ""
                                                            }`}
                                                    >
                                                        <h3 className="text-lg font-semibold capitalize text-foreground flex items-center">
                                                            <span className="h-4 w-1.5 bg-primary rounded-full mr-3"></span>
                                                            {mealTime}
                                                        </h3>


                                                    </div>

                                                    {(mealCartItems.length > 0 || mealAddOns.length > 0) && (
                                                        <div className="space-y-3">
                                                            {mealCartItems.map((tiffinItem) => (
                                                                <div key={tiffinItem.id} className="rounded-lg border bg-muted/40">
                                                                    <div className="flex items-center justify-between px-3 py-2 border-b">
                                                                        <h4 className="text-sm font-semibold text-foreground flex items-center">
                                                                            <span className="h-3 w-1 bg-primary rounded-full mr-2"></span>
                                                                            {tiffinItem.mealPlan.name}
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                onClick={() => handleRemoveFromCart(tiffinItem.id)}
                                                                                className="h-6 ml-1 w-6 p-0 text-muted-foreground hover:text-destructive"
                                                                            >
                                                                                <Trash2 className="h-3 w-3" />
                                                                            </Button>
                                                                        </h4>

                                                                        <div className="flex items-center gap-3">
                                                                            <div className="flex items-center border rounded-md">
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    size="icon"
                                                                                    onClick={() =>
                                                                                        handleUpdateCartItemQuantity(
                                                                                            tiffinItem.id,
                                                                                            tiffinItem.quantity - 1
                                                                                        )
                                                                                    }
                                                                                    disabled={tiffinItem.quantity <= 1}
                                                                                    className="h-6 w-6 p-0"
                                                                                >
                                                                                    <Minus className="h-3 w-3" />
                                                                                </Button>
                                                                                <span className="w-6 text-center text-sm">
                                                                                    {tiffinItem.quantity}
                                                                                </span>
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    size="icon"
                                                                                    onClick={() =>
                                                                                        handleUpdateCartItemQuantity(
                                                                                            tiffinItem.id,
                                                                                            tiffinItem.quantity + 1
                                                                                        )
                                                                                    }
                                                                                    className="h-6 w-6 p-0"
                                                                                >
                                                                                    <Plus className="h-3 w-3" />
                                                                                </Button>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* Items list */}
                                                                    {tiffinItem.mealPlan.items?.length > 0 && (
                                                                        <div className="divide-y">
                                                                            {tiffinItem.mealPlan.items.map((item, i) => (
                                                                                <div
                                                                                    key={i}
                                                                                    className="flex justify-between px-3 py-2 text-sm"
                                                                                >
                                                                                    <span className="text-foreground">
                                                                                        {item.qty}× {item.itemId?.name}
                                                                                    </span>
                                                                                    {/* <span className="font-medium">
                                                                                        ₹{(item.qty * (item.itemId?.price || 0)).toFixed(2)}
                                                                                    </span> */}
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}

                                                            {/* Add-ons Section */}
                                                            {mealAddOns.length > 0 && (
                                                                <div className="rounded-lg border bg-muted/40 mt-3">
                                                                    <div className="flex items-center justify-between px-3 py-2 border-b">
                                                                        <h4 className="text-sm font-semibold text-foreground flex items-center">
                                                                            <span className="h-3 w-1 bg-primary rounded-full mr-2"></span>
                                                                            Customise Plan
                                                                        </h4>
                                                                        <span className="text-xs text-muted-foreground">
                                                                            {mealAddOns.length} items
                                                                        </span>
                                                                    </div>
                                                                    <div className="divide-y">
                                                                        {mealAddOns.map((item, i) => (
                                                                            <div
                                                                                key={i}
                                                                                className="flex justify-between items-center px-3 py-2 text-sm"
                                                                            >
                                                                                <div className="flex items-center gap-2">
                                                                                    <span className="text-foreground">
                                                                                        {item.quantity}× {item.name}
                                                                                    </span>
                                                                                    <Button
                                                                                        variant="ghost"
                                                                                        size="icon"
                                                                                        onClick={() => handleRemoveAddOn(item.id, item.mealTime)}
                                                                                        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                                                                                    >
                                                                                        <Trash2 className="h-3 w-3" />
                                                                                    </Button>
                                                                                </div>
                                                                                <span className="font-medium">
                                                                                    ₹{(item.quantity * item.price).toFixed(2)}
                                                                                </span>
                                                                            </div>
                                                                        ))}
                                                                    </div>

                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                            );
                                        })}
                                        {(cartItems.length === 0 && addOns.length === 0) && (
                                            <div className="flex items-center justify-center h-full">
                                                <p className="text-muted-foreground">No items in cart</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        }
                        {
                            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 lg:p-6 overflow-y-auto">
                                <div className="space-y-6">

                                    {/* Header Section */}
                                    <div className="flex items-center justify-between border-b pb-3">
                                        <div className="flex items-center gap-3">
                                            <h2 className="text-lg font-semibold text-foreground flex items-center">
                                                <span className="h-4 w-1.5 bg-primary rounded-full mr-2"></span>
                                                Meal Details
                                            </h2>

                                        </div>
                                    </div>
                                    <div className="space-y-1.5 mt-2">
                                        {comboState.map((item, index) => (
                                            <div
                                                key={index}
                                                className={`w-full rounded-md border p-2.5 transition-all hover:shadow-sm hover:-translate-y-0.5 flex justify-between items-center text-[13px]
                                                    ${item.isCustom
                                                        ? "border-orange-200 bg-orange-50"
                                                        : item.isCombo
                                                            ? "border-primary/25 bg-primary/5"
                                                            : "border-gray-200 bg-white"
                                                    }`}
                                            >
                                                {/* Left: Icon + Name + Tag + Type */}
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <div
                                                        className={`p-1 rounded ${item.isCustom ? "bg-orange-100" : "bg-primary/10"}`}
                                                    >
                                                        <UtensilsCrossed
                                                            className={`w-3.5 h-3.5 ${item.isCustom ? "text-orange-600" : "text-primary"}`}
                                                        />
                                                    </div>

                                                    <div className="flex items-center gap-1 truncate">
                                                        <h3 className="font-medium truncate max-w-[120px]">
                                                            {item.isCustom ? item.name || "Custom Plan" : item.mealPlan?.name}
                                                        </h3>

                                                        <span
                                                            className={`text-[9px] px-1 py-0.5 rounded font-medium shrink-0
                                                            ${item.isCustom
                                                                    ? "bg-orange-500 text-white"
                                                                    : item.isCombo
                                                                        ? "bg-primary text-white"
                                                                        : "bg-gray-100 text-gray-700"
                                                                }`}
                                                        >
                                                            {item.isCustom ? "Custom" : item.isCombo ? "Combo" : "Single"}
                                                        </span>

                                                        <span className="text-gray-500 text-[12px] ml-1">
                                                            {item.type.split("+").join(" + ")}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Right: Qty + Price in same line but aligned */}
                                                <div className="flex items-center gap-4 text-[12px]">
                                                    {!item.isCustom && (
                                                        <span className="text-gray-600">
                                                            <span className="font-medium text-gray-800">Qty:</span>{" "}
                                                            {item.comboQuantity || item.quantity}
                                                        </span>
                                                    )}
                                                    <span className="font-semibold text-primary text-[13px] leading-none">
                                                        ₹{item.totalPrice ?? 0}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* <div className="flex items-center justify-between">
                                        <span className="text-gray-600 text-[12px]">Total:</span>
                                        <span className="font-semibold text-primary text-[13px] leading-none">₹{totalPrice}</span>
                                    </div> */}
                                    <div className="bg-white rounded-lg border p-3 shadow-sm space-y-2.5 text-sm">
                                        {/* Subtotal */}
                                        <div className="flex justify-between font-medium">
                                            <span>Subtotal</span>
                                            <div className="flex items-center gap-1">
                                                <Dirham size={12} />
                                                <span>{totalPrice.toFixed(2)}</span>
                                            </div>
                                        </div>

                                        {/* Discount */}
                                        <div className="flex items-center justify-between">
                                            <DiscountPopup
                                                subtotal={totalPrice}
                                                discount={discount}
                                                setDiscount={setDiscount}
                                                onSave={(discount, type, value) => {
                                                    setDiscount(discount);
                                                    setDiscountType(type);
                                                    setDiscountValue(value);
                                                }}
                                                discountType={discountType}
                                                setDiscountType={setDiscountType}
                                                discountValue={discountValue}
                                                setDiscountValue={setDiscountValue}
                                            />
                                            {discount > 0 && (
                                                <div className="flex items-center gap-1 text-red-500 font-medium">
                                                    <span>-</span>
                                                    <Dirham size={12} />
                                                    <span>{discount.toFixed(2)}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Additional Amount */}
                                        <div className="space-y-2">
                                            <AmountInput
                                                label="Additional Amount"
                                                value={additionalAmount}
                                                setValue={setAdditionalAmount}
                                                title={additionalAmountTitle}
                                                setTitle={setAdditionalAmountTitle}
                                                onSave={(amount, title) => {
                                                    setAdditionalAmount(amount);
                                                    if (title) setAdditionalAmountTitle(title);
                                                }}
                                            />
                                        </div>

                                        {/* Delivery Charge */}
                                        <div className="flex items-center justify-between rounded-md ">
                                            <div className="flex items-center gap-2">
                                                <Checkbox
                                                    id="includeDelivery"
                                                    checked={includeDelivery}
                                                    onCheckedChange={(checked) => setIncludeDelivery(checked as boolean)}
                                                />
                                                <label
                                                    htmlFor="includeDelivery"
                                                    className="font-medium cursor-pointer"
                                                >
                                                    Delivery Charge
                                                </label>
                                            </div>

                                            <div className="flex items-center gap-1">
                                                <Dirham size={12} />
                                                <span>{deliveryAmount.toFixed(2)}</span>
                                            </div>
                                        </div>

                                        {/* Tax */}
                                        <div className="flex justify-between">
                                            <span>Tax ({taxPercentage}%)</span>
                                            <div className="flex items-center gap-1">
                                                <Dirham size={10} />
                                                <span>{taxAmount.toFixed(2)}</span>
                                            </div>
                                        </div>

                                        {/* Rounding Off */}
                                        <RoundingOff
                                            baseTotal={taxableAmount}
                                            roundingValue={roundingValue}
                                            setRoundingValue={setRoundingValue}
                                            total={finalTotal}
                                        />

                                        {/* Total */}
                                        <div className="flex justify-between items-center border-t pt-2 font-semibold">
                                            <span>Total</span>
                                            <div className="flex items-center gap-1 text-primary text-base">
                                                <Dirham size={14} />
                                                <span>{finalTotal}</span>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Form Section */}
                                    <div className="flex flex-col gap-4 border p-4 rounded-lg bg-muted/20">

                                        {/* Line 1: Billing Type + Dates */}
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            <div>
                                                <Label htmlFor="billingType">
                                                    Billing Type <span className="text-destructive">*</span>
                                                </Label>
                                                <Select
                                                    value={billingType}
                                                    onValueChange={(value) => setBillingType(value as "fixed" | "monthly")}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select billing type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="fixed">Fixed</SelectItem>
                                                        <SelectItem value="monthly">Monthly</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div>
                                                <Label>Start Date <span className="text-destructive">*</span></Label>
                                                <Input
                                                    name="startDate"
                                                    type="date"
                                                    required
                                                    value={dates.startDate}
                                                    onChange={handleDateChange}
                                                    min={new Date().toISOString().split("T")[0]}
                                                />
                                            </div>

                                            <div>
                                                <Label>End Date <span className="text-destructive">*</span></Label>
                                                <Input
                                                    name="endDate"
                                                    type="date"
                                                    required={billingType === "fixed"}
                                                    value={dates.endDate}
                                                    onChange={handleDateChange}
                                                    min={dates.startDate || new Date().toISOString().split("T")[0]}
                                                />
                                                {new Date(dates.endDate) < new Date(dates.startDate) && (
                                                    <p className="text-xs text-red-500 mt-1">End date must be after start date</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Line 2: Payment Info */}
                                    <div className="flex flex-col gap-4 border p-4 rounded-lg bg-muted/20">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <Label>Advanced Payment</Label>
                                                <Input
                                                    type="number"
                                                    placeholder="0"
                                                    value={advancedPayment === 0 ? "" : advancedPayment.toString()}
                                                    onChange={(e) =>
                                                        setAdvancedPayment(e.target.value === "" ? 0 : parseFloat(e.target.value))
                                                    }
                                                    min="0"
                                                    step="0.01"
                                                />
                                            </div>

                                            {
                                                advancedPayment > 0 && (
                                                    <div>
                                                        <Label>Payment Method</Label>
                                                        <Select
                                                            value={paymentMethod || undefined}
                                                            onValueChange={(value) => setPaymentMethod(value)}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select method" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {paymentMethods?.payload?.data?.map((method: any) => (
                                                                    <SelectItem key={method._id} value={method._id}>
                                                                        {method.type}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                )}
                                        </div>

                                        {
                                            advancedPayment > 0 && (
                                                <div className="flex flex-wrap items-end gap-3">
                                                    <div className="flex-1 min-w-[200px]">
                                                        <Label>Description</Label>
                                                        <Input
                                                            type="text"
                                                            placeholder="Advance description"
                                                            value={description}
                                                            onChange={(e) => setDescription(e.target.value)}
                                                        />
                                                    </div>

                                                    <Button
                                                        size="sm"
                                                        className="h-9"
                                                        disabled={advancedPayment > 0 && !paymentMethod}
                                                        onClick={handleSaveAdvance}
                                                    >
                                                        {getButtonLabel()}
                                                    </Button>
                                                </div>
                                            )}

                                    </div>

                                    <div className="flex justify-end pt-2">
                                        <Button
                                            size="sm"
                                            className="bg-primary hover:bg-primary/90 text-white px-4 py-2"
                                            onClick={handlePlaceOrder}
                                            disabled={isSubmited}
                                        >
                                            {isSubmited ? 'Adding...' : 'Add Tiffin'}
                                        </Button>
                                    </div>
                                </div>
                            </div>

                        }
                    </div>
                </div>
            </div>
            {/* Add On Items Modal */}
            <AddItemsModal
                isOpen={isAddOnModalOpen}
                onClose={() => setIsAddOnModalOpen(false)}
                groupedMealPlans={mealPlans}
                cartItems={cartItems}
                menuItems={menuItems}
                handleAddToCart={handleAddToCart}
                handleAddAddOn={handleAddAddOn}
                setAddOns={setAddOns}
                addOns={addOns}
                addItemsTab={addItemsTab}
                setAddItemsTab={setAddItemsTab}
                setCartItems={setCartItems}
                setSelectedMealPlan={setSelectedMealPlan}
            />

        </>
    );
}