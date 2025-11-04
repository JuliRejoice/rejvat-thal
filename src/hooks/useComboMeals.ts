import { useEffect, useState } from "react";

// ---------- Types ----------
export interface Item {
  itemId: {
    _id: string;
    name: string;
    price: number;
  };
  qty: number;
  _id: string;
}
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
export interface MealPlan {
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

export interface CartItem {
  id: string;
  mealPlan: MealPlan;
  mealType: string[];
  quantity: number;
  totalPrice: number;
}

export interface ComboItem {
  mealPlan: MealPlan | null;
  type: string;
  comboQuantity?: number;
  quantity?: number;
  totalPrice: number;
  isCombo: boolean;
  isCustom?: boolean;
  name?: string;
  items?: {
    _id: string;
    name: string;
    price: number;
    quantity: number;
    mealTime: string;
  }[];
}

// ---------- Hook ----------
const useComboAndCustomMeals = (
  cartItems: CartItem[],
  addons: {
    _id: string;
    name: string;
    price: number;
    quantity: number;
    mealTime: string;
  }[]
): ComboItem[] => {
  const [comboState, setComboState] = useState<ComboItem[]>([]);

  useEffect(() => {
    const comboData: ComboItem[] = [];

    // -------- 1️⃣ Handle MealPlan Combos --------
    if (cartItems?.length) {
      const grouped: Record<string, CartItem[]> = cartItems.reduce(
        (acc, item) => {
          const id = item.mealPlan._id;
          if (!acc[id]) acc[id] = [];
          acc[id].push(item);
          return acc;
        },
        {} as Record<string, CartItem[]>
      );

      const newComboData: ComboItem[] = Object.values(grouped).flatMap(
        (group) => {
          const mealPlan = group[0].mealPlan;
          const typeQuantities: Record<string, number> = group.reduce(
            (acc, g) => {
              acc[g.mealType[0]] = g.quantity;
              return acc;
            },
            {} as Record<string, number>
          );

          const mealTypes = Object.keys(typeQuantities);
          const minQty = Math.min(...Object.values(typeQuantities));
          const result: ComboItem[] = [];

          if (mealTypes.length >= 2) {
            // Combo case
            result.push({
              mealPlan,
              type: mealTypes.join("+"),
              comboQuantity: minQty,
              totalPrice: mealPlan.doubleMealPrice * minQty,
              isCombo: true,
            });

            mealTypes.forEach((type) => {
              const remaining = typeQuantities[type] - minQty;
              if (remaining > 0) {
                result.push({
                  mealPlan,
                  type,
                  quantity: remaining,
                  totalPrice: mealPlan.singleMealPrice * remaining,
                  isCombo: false,
                });
              }
            });
          } else {
            // Single meal type
            mealTypes.forEach((type) => {
              const qty = typeQuantities[type];
              result.push({
                mealPlan,
                type,
                quantity: qty,
                totalPrice: mealPlan.singleMealPrice * qty,
                isCombo: false,
              });
            });
          }

          return result;
        }
      );

      comboData.push(...newComboData);
    }

    // -------- 2️⃣ Handle Custom Addons --------
    if (addons?.length) {
      const groupedAddons: Record<string, typeof addons> = addons.reduce(
        (acc, item) => {
          if (!acc[item.mealTime]) acc[item.mealTime] = [];
          acc[item.mealTime].push(item);
          return acc;
        },
        {} as Record<string, typeof addons>
      );

      Object.entries(groupedAddons).forEach(([mealTime, items]) => {
        const total = items.reduce(
          (sum, i) => sum + i.price * i.quantity,
          0
        );

        comboData.push({
          mealPlan: null,
          name: "Custom Plan",
          type: mealTime,
          totalPrice: total,
          isCombo: false,
          isCustom: true,
          items,
        });
      });
    }

    setComboState(comboData);
  }, [cartItems, addons]);

  return comboState;
};

export default useComboAndCustomMeals;
