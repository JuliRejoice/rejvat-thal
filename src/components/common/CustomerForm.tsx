import { getRestaurants, RestaurantData } from "@/api/restaurant.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { UserPlus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Customer, CustomerErrors, CustomerFormProps, InputOrCustomEvent } from "@/types/customer.types";
import { createNewCustomer } from "@/api/customer.api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { RootState, AppDispatch } from "./../../store";
import { setRestaurants } from "./../../store/slices/restaurentSlice";
import { getUser } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { getAllArea } from "@/api/area.api";

export function CustomerForm({ open, onClose, refetch, setRefetch }: CustomerFormProps) {
  const userRole = getUser();
  const dispatch = useDispatch<AppDispatch>();
  const restaurants = useSelector((state: RootState) => state.restaurant);
  const { toast } = useToast();
  const initialFormData = {
    name: "",
    phone: "",
    email: "",
    address: "",
    restaurantId: "",
    areaId: "",
  };
  const [formData, setFormData] = useState<Customer>(initialFormData);
  const [isOpen, setIsOpen] = useState(false);
  const [errors, setErrors] = useState<CustomerErrors>();
  const fetchedRef = useRef(false);
  const {user}= useAuth()

  const handleChange = (e: InputOrCustomEvent) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value, 
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };




  const validate = (formData: Customer): CustomerErrors => {
    const errors: CustomerErrors = {};

    if (!formData.name) {
      errors.name = "Name is required";
    }
    if (!formData.phone) {
      errors.phone = "Phone is required.";
    }
    if (!formData.email) {
      errors.email = "Email is required.";
    }
    if (!formData.address) {
      errors.address = "Address is required.";
    }
    if (!formData.restaurantId) {
      errors.restaurantId = "Restaurant is required.";
    }
    if (!formData.areaId) {
      errors.areaId = "Area is required.";
    }
    return errors;
  };

  const handleCreateCustomer = async (formData: Customer) => {
    if (userRole?.role === "manager") {
      formData.restaurantId = userRole?.restaurantId?._id;
    }
    const errors = validate(formData);
    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return;
    }


    const response = await createNewCustomer(formData);
    if (response.success) {
      toast({
        variant: "default",
        title: "Created",
        description: "Customer created successfully.",
      });

      onClose();

      if (setRefetch) {
        setRefetch(!refetch);
      }

      // refatch customer list
      handleClose();
    } else {
      toast({
        variant: "destructive",
        title: "Failed",
        description: "Customer creation failed.",
      });
    }
  };

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    const fetchRestaurants = async () => {
      const response = await getRestaurants({ page: 1, limit: 1000 });
      if (response?.success) {
        dispatch(setRestaurants(response?.payload));
      }
    };
    fetchRestaurants();
  }, [dispatch]);

  const handleClose = () => {
    onClose();
    setErrors(initialFormData);
    setFormData(initialFormData);
  };

   const { data: areasData, isLoading } = useQuery({
      queryKey: ["get-all-area", { 
        restaurantId: user?.restaurantId?._id,
        page: 1,
        limit: 10,
        search: ""
      }],
      queryFn: () =>
        getAllArea({
          restaurantId: user?.restaurantId?._id,
          page: 1,
          limit: 10,
          search: ""
        }),
    });
  
    
    const areas = areasData?.payload?.data || [];

  //   const handleDialogChange = (open: boolean) => {

  //     if (!open) {
  //       // Dialog is closing
  //       setFormData(initialFormData);
  //       setErrors(initialFormData);
  //     }
  //     setIsCreateModalOpen(open);
  //   };

  return (
    <>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add New Customer
          </DialogTitle>
          <DialogDescription>Create a new customer profile with their tiffin preferences</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCreateCustomer(formData);
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <span className="mt-1 pl-3 text-xs text-red-500">{errors?.name ?? ""}</span>
              <Input id="name" name="name" placeholder="Enter full name" onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <span className="mt-1 pl-3 text-xs text-red-500">{errors?.phone ?? ""}</span>
              <Input id="phone" name="phone" placeholder="+91 9876543210" type="number" onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <span className="mt-1 pl-3 text-xs text-red-500">{errors?.email ?? ""}</span>
              <Input id="email" name="email" type="email" placeholder="customer@email.com" onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reference">Reference</Label>
              <Input id="reference" name="referenceName" placeholder="Referred by" onChange={handleChange} />
            </div>


            {userRole?.role === "admin" && (
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="restaurant">Select Restaurant *</Label>
                <span className="mt-1 pl-3 text-xs text-red-500">{errors?.restaurantId ?? ""}</span>

                <Select name="restaurantId" onValueChange={(value) => handleChange({ target: { name: "restaurantId", value } })}>
                  <SelectTrigger id="restaurant">
                    <SelectValue placeholder="Choose a restaurant" />
                  </SelectTrigger>
                  <SelectContent>
                    {restaurants?.data?.map((rest: RestaurantData) => (
                      <SelectItem key={rest._id} value={rest._id}>
                        {rest.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}


            <div className="space-y-2">
              <Label htmlFor="areaId">Area *</Label>
              <Select
                onValueChange={(value) => handleChange({ target: { name: "areaId", value } })}
                value={formData.areaId}
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
              {/* {errors.areaId && <p className="text-sm text-red-500">{errors.areaId.message}</p>} */}
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Address *</Label>
              <span className="mt-1 pl-3 text-xs text-red-500">{errors?.address ?? ""}</span>
              <Textarea id="address" name="address" placeholder="Complete delivery address" onChange={handleChange} />
            </div>
          </div>

          {/* <EnhancedCustomerForm
            open={isOpen}
            onClose={() => setIsOpen(false)}
            refetch={refetch}
            setRefetch={setRefetch}
          /> */}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-primary">
              Create Customer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </>
  );
}
