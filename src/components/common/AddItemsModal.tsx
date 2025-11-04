import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Dirham } from '../Svg';


interface AddItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupedMealPlans: any;
  cartItems: any[];
  menuItems: any[];
  handleAddToCart: (mealPlan: any) => void;
  handleAddAddOn: (item: any) => void;
  setAddOns: React.Dispatch<React.SetStateAction<any[]>>;
  addOns: any[];
  addItemsTab: string;
  setAddItemsTab: React.Dispatch<React.SetStateAction<string>>;
  setCartItems: React.Dispatch<React.SetStateAction<any[]>>;
  setSelectedMealPlan: React.Dispatch<React.SetStateAction<any>>;
}

interface MealPlan {
  _id: string;
  name: string;
  description?: string;
  type?: string[];
  items: MealItem[];
  price?: number;
}

interface MealItem {
  _id?: string;
  qty: number;
  itemId: {
    _id: string;
    name: string;
    price: number;
  };
}

export function AddItemsModal({
  isOpen,
  onClose,
  groupedMealPlans,
  cartItems,
  menuItems,
  handleAddToCart,
  handleAddAddOn,
  setAddOns,
  addOns,
  addItemsTab,
  setAddItemsTab,
  setCartItems,
  setSelectedMealPlan,
}: AddItemsModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showMealTimeDialog, setShowMealTimeDialog] = useState(false);
  const [selectedMealPlanState, setSelectedMealPlanState] = useState<MealPlan | null>(null);
  const [selectedMealTimes, setSelectedMealTimes] = useState<string[]>([]);
  const [selectedCustomItem, setSelectedCustomItem] = useState<any>(null);
  const [pendingAddOns, setPendingAddOns] = useState<Array<{ item: any, quantity: number }>>([]);
  const [showAddOnMealTimeDialog, setShowAddOnMealTimeDialog] = useState(false);
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({});




  const filteredMenuItems =
    menuItems?.filter((item: any) =>
      item.name.toLowerCase().includes(searchQuery)
    ) || [];


  const filteredTiffinItems =
    groupedMealPlans?.filter((item: any) =>
      item.name.toLowerCase().includes(searchQuery)
    ) || [];



  const handleAddToPending = (item: any) => {
    const itemId = item._id;
    const newQuantity = (itemQuantities[itemId] || 0) + 1;

    setPendingAddOns(prev => {
      const existing = prev.find(p => p.item._id === itemId);
      if (existing) {
        return prev.map(p =>
          p.item._id === itemId
            ? { ...p, quantity: newQuantity }
            : p
        );
      }
      return [...prev, { item, quantity: 1 }];
    });

    // Update the quantity in the local state
    setItemQuantities(prev => ({
      ...prev,
      [itemId]: newQuantity
    }));
  };

  const handleRemoveFromPending = (itemId: string) => {
    const newQuantity = Math.max(0, (itemQuantities[itemId] || 0) - 1);

    setPendingAddOns(prev => {
      if (newQuantity === 0) {
        return prev.filter(p => !(p.item._id === itemId));
      }

      return prev.map(p =>
        p.item._id === itemId
          ? { ...p, quantity: newQuantity }
          : p
      );
    });

    // Update the quantity in the local state
    setItemQuantities(prev => ({
      ...prev,
      [itemId]: newQuantity
    }));
  };

  // Reset pending add-ons when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setPendingAddOns([]);
      setItemQuantities({});
      setSelectedMealTimes([]);
    }
  }, [isOpen]);

  const handleSubmitAddOns = () => {
    if (pendingAddOns.length === 0) return;
    setShowAddOnMealTimeDialog(true);
  };

  const handleConfirmAddOns = (mealTime: string) => {
    pendingAddOns.forEach(({ item, quantity }) => {
      const existingAddOn = addOns.find(
        a => a._id === item._id && a.mealTime === mealTime
      );

      if (existingAddOn) {
        setAddOns(prev =>
          prev.map(a =>
            a._id === item._id && a.mealTime === mealTime
              ? {
                ...a,
                quantity: (a.quantity || 0) + (quantity || 1),
                itemId: {
                  _id: item._id,
                  name: item.name,
                  price: item.price || 0
                }
              }
              : a
          )
        );
      } else {
        const addOnItem = {
          _id: item._id,
          id: item._id,
          name: item.name,
          price: item.price || 0,
          quantity: quantity || 1,
          mealTime: mealTime,
          itemId: {
            _id: item._id,
            name: item.name,
            price: item.price || 0
          }
        };
        handleAddAddOn(addOnItem);
      }
    });

    setPendingAddOns([]);
    setItemQuantities({});
    setShowAddOnMealTimeDialog(false);
  };



  try {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) {
          setPendingAddOns([]);
          setItemQuantities({});
          setSelectedMealTimes([]);
        }
        onClose();
      }}>
        <DialogContent className="max-w-3xl w-full h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Add Items </DialogTitle>
          </DialogHeader>

          <div className="flex items-center justify-between border-b px-3">
            <div className="flex gap-2">
              <button
                className={`px-4 py-2 font-medium text-sm ${addItemsTab === "tiffin"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground"
                  }`}
                onClick={() => {
                  setAddItemsTab("tiffin");
                  setSearchQuery("");
                }}
              >
                Tiffin
              </button>
              <button
                className={`px-4 py-2 font-medium text-sm ${addItemsTab === "custom"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground"
                  }`}
                onClick={() => {
                  setAddItemsTab("custom");
                  setSearchQuery("");
                }}
              >
                Customise
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder={`Search ${addItemsTab === "tiffin" ? "tiffin plans" : "menu items"
                  }...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
                className="pl-10 w-56 my-2"
              />
            </div>
          </div>


          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto p-3">
            {addItemsTab === 'tiffin' ? (
              filteredTiffinItems.length > 0 ? (
                filteredTiffinItems.map((plan: any) => {

                  return (
                    <div
                      key={plan._id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between border rounded-xl p-4 bg-white shadow-sm hover:shadow-md hover:border-primary/40 transition-all mb-2"
                    >
                      <div className="flex flex-col gap-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-semibold text-gray-900 truncate">{plan.name}</h3>
                          <div className="flex flex-wrap gap-1">
                            {(Array.isArray(plan.type) ? plan.type : [plan.type]).map((type: any) => (
                              <span
                                key={type}
                                className="px-2 py-0.5 text-[10px] rounded-full bg-primary/10 text-primary font-medium"
                              >
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1 text-[11px] text-muted-foreground mt-1">
                          {(plan.items || [])
                            .slice(0, 4)
                            .map((i: any) => (
                              <span key={i._id} className="flex items-center gap-1">
                                <span className="text-gray-400">•</span>
                                <span className="truncate">{i.itemId?.name}</span>
                              </span>
                            ))}
                          {plan.items?.length > 4 && (
                            <span className="text-primary font-medium">+{plan.items.length - 4} more</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mt-3 sm:mt-0">
                        <div className="text-right">
                          <p className="text-xs text-gray-500">One Time</p>
                          <p className="text-sm font-semibold flex items-center justify-end gap-1 text-gray-800">
                            <Dirham size={12} className="text-gray-500" />
                            {plan.singleMealPrice?.toFixed(2) || "0.00"}
                          </p>
                        </div>

                        {plan.doubleMealPrice && (
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Two Times</p>
                            <p className="text-sm font-semibold flex items-center justify-end gap-1 text-primary">
                              <Dirham size={12} className="text-primary/80" />
                              {plan.doubleMealPrice?.toFixed(2) || "0.00"}
                            </p>
                          </div>
                        )}

                        <Button
                          size="sm"
                          variant="default"
                          className="h-8 px-3 text-xs shadow-sm hover:shadow-md"
                          onClick={(e) => {
                            e.stopPropagation();
                            const mealPlan: MealPlan = {
                              ...plan,
                              type: Array.isArray(plan.type) ? plan.type : [plan.type],
                              items: (plan.items || []).map((item: any) => ({
                                ...item,
                                _id: item._id || item.itemId?._id || "",
                                itemId: {
                                  _id: item.itemId?._id || "",
                                  name: item.itemId?.name || "",
                                  price: item.itemId?.price || 0,
                                },
                                qty: item.qty || 1,
                              })),
                            };
                            setSelectedMealPlanState(mealPlan);
                            setShowMealTimeDialog(true);
                          }}
                        >
                          Add
                        </Button>
                      </div>
                    </div>



                  );
                })
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {searchQuery
                    ? 'No matching meal plans found.'
                    : 'No meal plans available.'}
                </div>
              )
            ) : addItemsTab === 'custom' ? (
              filteredMenuItems.length > 0 ? (
                filteredMenuItems.map((item: any) => {
                  const itemId = item._id;

                  return (
                    <div
                      key={itemId}
                      className="flex flex-col gap-2 p-3 border rounded-md mb-2 bg-card hover:border-primary/40 hover:shadow-md transition-all"
                    >
                      <div className="flex justify-between items-center">
                        {/* Left: item name + price */}
                        <div className="flex items-center gap-2.5">
                          <span className="text-sm font-semibold text-foreground truncate">
                            {item.name}
                          </span>
                          <span className="text-sm font-semibold flex items-center justify-end gap-1 text-gray-500">
                            <Dirham size={12} className="text-gray-500" />
                            {item.price?.toFixed(2) || "0.00"}
                          </span>
                        </div>

                        {/* Right: quantity controls or Add button */}
                        <div className="flex items-center gap-2">
                          {itemQuantities[itemId] > 0 || pendingAddOns.some(p => p.item._id === itemId) ? (
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveFromPending(itemId);
                                }}
                              >
                                −
                              </Button>

                              <span className="w-5 text-center text-xs font-medium">
                                {itemQuantities[itemId] || 1}
                              </span>

                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddToPending(item);
                                }}
                              >
                                +
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              className="h-7 px-3 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddToPending(item);
                              }}
                            >
                              Add
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                  );
                })
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {searchQuery
                    ? 'No matching items found.'
                    : 'No menu items available.'}
                </div>
              )
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No items added yet.
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            {pendingAddOns.length > 0 && addItemsTab === "custom" && (
              <Button onClick={handleSubmitAddOns}>
                Add {pendingAddOns.length} item{pendingAddOns.length > 1 ? 's' : ''}
              </Button>
            )}
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </DialogContent>

        {/* Meal Time Selection Dialog */}
        <Dialog open={showMealTimeDialog} onOpenChange={setShowMealTimeDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedMealPlanState
                  ? `Add ${selectedMealPlanState.name}`
                  : `Add ${selectedCustomItem?.name || 'Item'}`}
              </DialogTitle>
              <DialogDescription>
                Choose when you'd like to receive these tiffin.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center gap-4 py-2">
              {(selectedMealPlanState?.type || ['breakfast', 'lunch', 'dinner']).map((time) => (
                <div key={time} className="flex items-center gap-1.5">
                  <Checkbox
                    id={`meal-time-${time}`}
                    checked={selectedMealTimes.includes(time)}
                    onCheckedChange={(checked) =>
                      setSelectedMealTimes(prev =>
                        checked ? [...prev, time] : prev.filter(t => t !== time)
                      )
                    }
                  />
                  <label htmlFor={`meal-time-${time}`} className="text-sm font-medium capitalize">
                    {time}
                  </label>
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowMealTimeDialog(false);
                  setSelectedMealPlanState(null);
                  setSelectedCustomItem(null);
                  setSelectedMealTimes([]);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (selectedMealPlanState && selectedMealTimes.length > 0) {
                    // Create a proper meal plan object with items
                    const mealPlan = {
                      ...selectedMealPlanState,
                      type: selectedMealTimes,
                      items: (selectedMealPlanState.items || []).map((item: any) => ({
                        ...item,
                        _id: item._id || item.itemId?._id || '',
                        itemId: {
                          _id: item.itemId?._id || '',
                          name: item.itemId?.name || '',
                          price: item.itemId?.price || 0,
                        },
                        qty: item.qty || 1,
                      })),
                    };
                    handleAddToCart(mealPlan);
                  }
                  setShowMealTimeDialog(false);
                  setSelectedMealPlanState(null);
                  setSelectedCustomItem(null);
                  setSelectedMealTimes([]);

                  // Close the main modal after adding to cart
                  onClose();
                }}
                disabled={selectedMealTimes.length === 0}
              >
                Add to Cart
              </Button>
            </DialogFooter>
          </DialogContent>

          <Dialog open={showAddOnMealTimeDialog} onOpenChange={(open) => {
            if (!open) {
              setSelectedMealTimes([]);
            }
            setShowAddOnMealTimeDialog(open);
          }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Select Meal Time</DialogTitle>
                <DialogDescription>
                  Choose when you'd like to receive these items.
                </DialogDescription>
              </DialogHeader>
              <div className="flex items-center gap-4 py-2">
                {['breakfast', 'lunch', 'dinner'].map((mealTime) => (
                  <div key={mealTime} className="flex items-center gap-1.5">
                    <Checkbox
                      id={`addon-meal-time-${mealTime}`}
                      checked={selectedMealTimes.includes(mealTime)}
                      onCheckedChange={(checked) =>
                        setSelectedMealTimes(prev =>
                          checked ? [...prev, mealTime] : prev.filter(t => t !== mealTime)
                        )
                      }
                    />
                    <label htmlFor={`addon-meal-time-${mealTime}`} className="text-sm font-medium capitalize">
                      {mealTime}
                    </label>
                  </div>
                ))}
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  onClick={() => {
                    if (selectedMealTimes.length > 0) {
                      selectedMealTimes.forEach(mealTime => handleConfirmAddOns(mealTime));
                      setSelectedMealTimes([]);
                      setShowAddOnMealTimeDialog(false);
                      onClose();
                    }
                  }}
                  disabled={selectedMealTimes.length === 0}
                >
                  Confirm
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

        </Dialog>
      </Dialog>
    );
  } catch (error) {
    return <></>
  }

}

export default AddItemsModal;
