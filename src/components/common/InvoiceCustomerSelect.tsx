import React, { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { UserPlus } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import { createNewCustomer } from "@/api/customer.api";
import { useToast } from "@/hooks/use-toast";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { setRestaurants } from "@/store/slices/restaurentSlice";
import { getRestaurants, RestaurantData } from "@/api/restaurant.api";
import { useQuery } from "@tanstack/react-query";
import { getAllArea } from "@/api/area.api";
import { getUser } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Customer } from "@/types/customer.types";
import { Textarea } from "../ui/textarea";
import { Skeleton } from "../ui/skeleton";


interface CustomerSelectProps {
  customers: Customer[];
  onSelectCustomer: (customer: Customer) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isLoadingCustomers: boolean;
}

interface CustomerErrors {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  restaurantId?: string;
  areaId?: string;
}

const CustomerSelect: React.FC<CustomerSelectProps> = ({
  customers,
  onSelectCustomer,
  searchQuery,
  setSearchQuery,
  isLoadingCustomers,
}) => {
  const { toast } = useToast();
  const dispatch = useDispatch<AppDispatch>();
  const userRole = getUser();
  const restaurants = useSelector((state: RootState) => state.restaurant);
  const { user } = useAuth();

  const [customerList, setCustomerList] = useState<Customer[]>(customers);
  const initialFormData = {
    name: "",
    phone: "",
    email: "",
    address: "",
    restaurantId: userRole?.role === "manager" ? userRole.restaurantId?._id : "",
    areaId: "",
  };

  useEffect(() => {
  setCustomerList(customers);
}, [customers])

  const [newCustomer, setNewCustomer] = useState<Customer>(initialFormData);
  const [errors, setErrors] = useState<CustomerErrors>({});
  const [isCreating, setIsCreating] = useState(false);

  const fetchedRef = React.useRef(false);

  // Fetch restaurants for admin
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const fetchRestaurants = async () => {
      const response = await getRestaurants({ page: 1, limit: 1000 });
      if (response?.success) {
        dispatch(setRestaurants(response?.payload));
      }
    };
    if (userRole?.role === "admin") fetchRestaurants();
  }, [dispatch, userRole]);

  // Fetch areas
  const { data: areasData } = useQuery({
    queryKey: ["get-all-area", { restaurantId: user?.restaurantId?._id, page: 1, limit: 100 }],
    queryFn: () =>
      getAllArea({
        restaurantId: user?.restaurantId?._id,
        page: 1,
        limit: 100,
        search: "",
      }),
  });
  const areas = areasData?.payload?.data || [];

  // // Filtered customers for search
  // const filteredCustomers = useMemo(
  //   () =>
  //     customerList.filter(
  //       (c) =>
  //         c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
  //         c.phone.includes(customerSearch)
  //     ),
  //   [customerSearch, customerList]
  // );

  const handleChange = (name: string, value: string) => {
    setNewCustomer((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = (formData: Customer): CustomerErrors => {
    const validationErrors: CustomerErrors = {};
    if (!formData.name.trim()) validationErrors.name = "Name is required";
    if (!formData.phone.trim()) validationErrors.phone = "Phone is required";
     if (!formData.email.trim()) validationErrors.email = "Email is required";
    if (formData.phone && formData.phone.length < 10)
      validationErrors.phone = "Phone number must be at least 10 digits";
    if (!formData.email?.includes("@") && formData.email)
      validationErrors.email = "Enter a valid email";
    if (!formData.address.trim()) validationErrors.address = "Address is required";
    if (userRole?.role === "admin" && !formData.restaurantId)
      validationErrors.restaurantId = "Restaurant is required";
    if (!formData.areaId) validationErrors.areaId = "Area is required";

    return validationErrors;
  };

  const handleAddNewCustomer = async () => {
    const validationErrors = validate(newCustomer);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const customerData: Customer = {
      ...newCustomer,
      restaurantId: userRole?.role === "manager" ? userRole?.restaurantId?._id : newCustomer.restaurantId,
    };

    try {
      setIsCreating(true);
      const response = await createNewCustomer(customerData);

      if (response && response.success) {
        toast({
          title: "Customer Created",
          description: "Customer created successfully",
          variant: "default",
        });
        const createdCustomer = response.payload;
        setCustomerList((prev) => [createdCustomer, ...prev]);
        onSelectCustomer(createdCustomer);
        setNewCustomer(initialFormData);
        setErrors({});
      } else {
        toast({
          title: "Failed",
          description: "Customer creation failed",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex flex-col justify-between space-y-4 h-full">
      {/* Search Customers */}
      <div className="space-y-2">
        <Label>Search Customer</Label>
        <Input
          placeholder="Search by name or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {
          isLoadingCustomers ? 
          <>
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          </>
          :
        customerList.length > 0 ? (
          <div className="max-h-[calc(100vh-300px)] overflow-y-auto border rounded-lg">
            <div className="divide-y">
              {customerList.map((customer) => (
                <button
                  key={customer._id}
                  onClick={() => onSelectCustomer(customer)}
                  className="w-full p-4 text-left hover:bg-accent transition-colors"
                >
                  <div className="font-medium">{customer.name}</div>
                  <div className="text-sm text-muted-foreground">{customer.phone}</div>
                  {customer.email && (
                    <div className="text-sm text-muted-foreground">{customer.email}</div>
                  )}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground border rounded-lg">
            No customers found
          </div>
        )}
      </div>

      {/* Add Customer Dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="w-full gap-2 text-blue-600 bg-sky-600/10 border-blue-500 hover:bg-blue-500 hover:text-white"
            onClick={() => {setErrors({});setNewCustomer(initialFormData);setIsCreating(false);}}
          >
            <UserPlus className="h-4 w-4" /> Add New Customer
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-lg">
          <DialogTitle>Add New Customer</DialogTitle>
          <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddNewCustomer();
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                value={newCustomer.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Enter customer name"
              />
              {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label>Phone *</Label>
              <Input
                type="number"
                value={newCustomer.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="Enter phone number"
              />
              {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
            </div>

            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                value={newCustomer.email || ""}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="Enter email"
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
            </div>

             <div className="space-y-2">
              <Label htmlFor="reference">Reference</Label>
              <Input id="reference" name="referenceName" placeholder="Referred by" onChange={(e) => handleChange("referenceName", e.target.value)} />
            </div>



            {userRole?.role === "admin" && (
              <div className="space-y-2">
                <Label>Restaurant *</Label>
                <Select
                  value={newCustomer.restaurantId || ""}
                  onValueChange={(value) => handleChange("restaurantId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select restaurant" />
                  </SelectTrigger>
                  <SelectContent>
                    {restaurants?.data?.map((rest: RestaurantData) => (
                      <SelectItem key={rest._id} value={rest._id}>
                        {rest.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.restaurantId && (
                  <p className="text-red-500 text-sm">{errors.restaurantId}</p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label>Area *</Label>
              <Select
                value={newCustomer.areaId || ""}
                onValueChange={(value) => handleChange("areaId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select area" />
                </SelectTrigger>
                <SelectContent>
                  {areas.map((area) => (
                    <SelectItem key={area._id} value={area._id}>
                      {area.name} ({area.deliveryType === "free" ? "Free" : `₹${area.deliveryAmount} delivery`})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.areaId && <p className="text-red-500 text-sm">{errors.areaId}</p>}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Address *</Label>
              <Textarea
                value={newCustomer.address || ""}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder="Enter address"
              />
              {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
            </div>

          </div>
          </form>
           <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" className="bg-gradient-primary" onClick={handleAddNewCustomer} disabled={isCreating}>
                {isCreating ? "Creating..." : "Add Customer & Continue"}
              </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerSelect;
