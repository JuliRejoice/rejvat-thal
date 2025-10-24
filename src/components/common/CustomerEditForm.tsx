import { getRestaurants, RestaurantData } from "@/api/restaurant.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Save, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Customer, CustomerErrors, InputOrCustomEvent } from "@/types/customer.types";
import { updateCustomer } from "@/api/customer.api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store";
import { setRestaurants } from "../../store/slices/restaurentSlice";
import { getUser } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { getAllArea } from "@/api/area.api";

interface CustomerEditFormProps {
  open: boolean;
  onClose: () => void;
  initialData: Customer | null;
  onSuccess?: () => void;
}

export function CustomerEditForm({ 
  open, 
  onClose, 
  initialData,
  onSuccess,
}: CustomerEditFormProps) {
  const userRole = getUser();
  const dispatch = useDispatch<AppDispatch>();
  const restaurants = useSelector((state: RootState) => state.restaurant);
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<Customer>(initialData || {
    name: "",
    phone: "",
    email: "",
    address: "",
    restaurantId: "",
    areaId: "",
    referenceName: ""
  });
  
  const [errors, setErrors] = useState<CustomerErrors>({});
  const fetchedRef = useRef(false);
  const { user } = useAuth();

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validate(formData);
    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return;
    }

    try {
      if (!initialData?._id) {
        throw new Error("Invalid customer ID");
      }
      setIsSubmitting(true);
      const response = await updateCustomer(initialData._id, formData);
      
      if (response.success) {
        toast({
          variant: "default",
          title: "Success",
          description: "Customer updated successfully.",
        });
        onSuccess?.();
        onClose();
      } else {
        throw new Error(response.message || "Failed to update customer");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "An error occurred while updating the customer.",
      });
    }
    setIsSubmitting(false);
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
    setErrors({});
  };

  const { data: areasData } = useQuery({
    queryKey: ["get-all-area-edit", formData.restaurantId],
    queryFn: () =>
      getAllArea({
        restaurantId: formData.restaurantId,
        page: 1,
        limit: 100,
        search: ""
      }),
    enabled: !!formData.restaurantId
  });
  
  const areas = areasData?.payload?.data || [];

  if (!open) return null;

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Save className="h-5 w-5" />
          Edit Customer
        </DialogTitle>
        <DialogDescription>
          Update customer details
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <span className="mt-1 pl-3 text-xs text-red-500">{errors?.name ?? ""}</span>
            <Input 
              id="name" 
              name="name" 
              value={formData.name || ''}
              placeholder="Enter full name" 
              onChange={handleChange} 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <span className="mt-1 pl-3 text-xs text-red-500">{errors?.phone ?? ""}</span>
            <Input 
              id="phone" 
              name="phone" 
              value={formData.phone || ''}
              placeholder="+91 9876543210" 
              type="tel" 
              onChange={handleChange} 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <span className="mt-1 pl-3 text-xs text-red-500">{errors?.email ?? ""}</span>
            <Input 
              id="email" 
              name="email" 
              type="email" 
              value={formData.email || ''}
              placeholder="customer@email.com" 
              onChange={handleChange} 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reference">Reference</Label>
            <Input 
              id="reference" 
              name="referenceName" 
              value={formData.referenceName || ''}
              placeholder="Referred by" 
              onChange={handleChange} 
            />
          </div>

          {userRole?.role === "admin" && (
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="restaurant">Restaurant *</Label>
              <span className="mt-1 pl-3 text-xs text-red-500">{errors?.restaurantId ?? ""}</span>
              <Select 
                value={formData.restaurantId}
                onValueChange={(value) => handleChange({ target: { name: "restaurantId", value } })}
              >
                <SelectTrigger id="restaurant">
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
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="areaId">Area *</Label>
            <span className="mt-1 pl-3 text-xs text-red-500">{errors?.areaId ?? ""}</span>
            <Select
              value={formData.areaId}
              onValueChange={(value) => handleChange({ target: { name: "areaId", value } })}
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
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">Address *</Label>
            <span className="mt-1 pl-3 text-xs text-red-500">{errors?.address ?? ""}</span>
            <Textarea 
              id="address" 
              name="address" 
              value={formData.address || ''}
              placeholder="Complete delivery address" 
              onChange={handleChange} 
            />
          </div>
        </div>

        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleClose} 
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="bg-gradient-primary" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Update Customer
              </>
            )}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
