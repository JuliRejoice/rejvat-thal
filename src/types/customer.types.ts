export type Customer = {
  name: string;
  phone: string;
  email: string;
  address: string;
  restaurantId: string;
  referenceName?: string;
};

export type CustomerResponse = {
  _id:string,
  name: string;
  phone: string;
  email: string;
  address: string;
  restaurantId: string;
  referenceName?: string;
  tiffinPauseToday?: boolean;
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
}


export type InputOrCustomEvent = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { name: string; value: string } };
