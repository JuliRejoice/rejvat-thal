export type Customer = {
  name: string;
  phone: string;
  email: string;
  address: string;
  restaurantId: string;
  referenceName?: string;
  _id?: string;
  areaId?: string;
};

export type TiffinItem = {
  menuId: string;
  quantity: number;
  price: number;
};

type MealDetails = {
  mealId?: {
    _id: string;
    name: string;
  };
  mealItems?: TiffinItem[];
  mealQuantity?: number;
  mealPrice?: number;
  addOnItems?: TiffinItem[];
  totalAddonPrice?: number;
  deliveryCharge?: number;
  mealFinalPrice?: number;
};

type Tiffin = {
  _id: string;
  customerId: string;
  restaurantId: string;
  lunch?: MealDetails;
  dinner?: MealDetails;
  breakfast?: MealDetails;
  deliveryIncluded: boolean;
  isServiceExpired: boolean;
  startDate: string;
  endDate: string | null;
  pauseDates: string[];
  tiffinTotalPrice: number;
  remark?: string;
  createdAt: string;
  updatedAt: string;
};

export type CustomerResponse = {
  _id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  restaurantId: string;
  referenceName?: string;
  tiffinPauseToday?: boolean;
  isActive?: boolean;
  tiffin?: Tiffin;
  areaId?: string;
  wallet?: number;
};

export type CustomerErrors = Partial<Record<keyof Customer, string>>;

export type getCustomerOverviewPayload = {
  restaurantId?:string,
};

export interface GetCustomerParams {
  restaurantId?: string;
  page: number;
  limit: number;
  searchTerm?: string;
  isActive: "all" | "true" | "false";
}

export interface CustomerFormProps {
  open: boolean;
  onClose?: () => void;
  refetch?: boolean;
  setRefetch?: (value: boolean) => void;
  setBuildingState?: (value: string) => void;
  initialData?: Customer;
  onSubmit?: (data: Customer) => void;
  isSubmitting?: boolean;
}

export type InputOrCustomEvent = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { name: string; value: string } };
