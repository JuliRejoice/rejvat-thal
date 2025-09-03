import { getRestaurants, RestaurantData } from "@/api/restaurant.api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Eye, EyeOff, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { SearchableDropDown } from "./SearchableDropDown";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

interface StaffMangerFormProps {
  defaultValues?: any;
  onSubmit: (data: any) => void;
  isPending?: boolean;
  type?: "staff" | "manager";
  onCancel?: () => void;
  mode?: "create" | "edit";
}

export function StaffManagerForm({
  defaultValues,
  onSubmit,
  isPending,
  type = "staff",
  onCancel,
  mode = "create",
}: StaffMangerFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const [restaurantsOptions, setRestaurantsOptions] = useState<
    { id: string; name: string }[]
  >([]);

  const { data: getAllRestaurants } = useQuery({
    queryKey: ["get-all-restaurant"],
    queryFn: () => getRestaurants({}),
  });
  console.log("getAllRestaurants", getAllRestaurants);

  useEffect(() => {
    if (getAllRestaurants?.payload?.data) {
      setRestaurantsOptions(
        getAllRestaurants.payload.data.map((r: RestaurantData) => ({
          id: r._id,
          name: r.name,
        }))
      );
    }
  }, [getAllRestaurants]);

  const handleSearch = async (query: string) => {
    const res = await getRestaurants({ search: query });
    setRestaurantsOptions(
      res.payload.data.map((r: RestaurantData) => ({
        id: r._id,
        name: r.name,
      }))
    );
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      name: "",
      password: "",
      phone: "",
      address: "",
      restaurantId: "",
      position: type,
      isUserType: type,
      file: null as File | null,
      ...defaultValues,
    },
  });

  const internalSubmit = (data: any) => {
    if (mode === "create" && !data.file) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Profile picture is required.",
      });
      return;
    }
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(internalSubmit)}>
      <Card className="shadow-none">
        <CardContent className="space-y-6 pt-2">
          <div className="grid grid-cols-2 gap-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                placeholder="Enter full name"
                {...register("name", { required: "Name is required" })}
              />
              {errors.name && (
                <p className="text-sm text-red-500">
                  {errors.name.message as string}
                </p>
              )}
            </div>
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                {...register("email", { required: "Email is required" })}
              />
              {errors.email && (
                <p className="text-sm text-red-500">
                  {errors.email.message as string}
                </p>
              )}
            </div>
            {/* Password */}
            {mode === "create" && (
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="pl-10 pr-10"
                    disabled={isPending}
                    {...register("password", {
                      required: "Password is required",
                      pattern: {
                        value: passwordRegex,
                        message:
                          "Must be at least 8 chars, include upper, lower, number & special char",
                      },
                    })}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isPending}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500">
                    {errors.password.message as string}
                  </p>
                )}
              </div>
            )}
            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                placeholder="Enter phone number"
                {...register("phone", { required: "Phone is required" })}
              />
              {errors.phone && (
                <p className="text-sm text-red-500">
                  {errors.phone.message as string}
                </p>
              )}
            </div>
          </div>

          {/* Restaurant */}
          <div className="space-y-2">
            <Label htmlFor="restaurantId">Restaurant *</Label>
            <SearchableDropDown
              options={restaurantsOptions}
              onSearch={handleSearch}
              value={watch("restaurantId")}
              onChange={(val) => setValue("restaurantId", val)}
            />
            {errors.restaurantId && (
              <p className="text-sm text-red-500">
                {errors.restaurantId.message as string}
              </p>
            )}
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <Textarea
              id="address"
              placeholder="Enter address"
              {...register("address", { required: "Address is required" })}
            />
            {errors.address && (
              <p className="text-sm text-red-500">
                {errors.address.message as string}
              </p>
            )}
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file">
              Upload Picture {mode === "create" ? "*" : "(optional)"}
            </Label>
            <Input
              id="file"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) =>
                setValue("file", e.target.files?.[0] || null, {
                  shouldValidate: true,
                })
              }
            />
            {(function () {
              const fileVal = watch("file") as File | string | null;
              const preview =
                fileVal instanceof File
                  ? URL.createObjectURL(fileVal)
                  : typeof fileVal === "string" && fileVal
                  ? fileVal
                  : null;
              return preview ? (
                <div className="relative w-24 h-24">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-24 h-24 object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={() => setValue("file", null)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow hover:bg-red-600"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="file"
                  className="flex flex-col items-center justify-center h-24 border-2 border-dashed rounded-lg cursor-pointer text-muted-foreground hover:border-primary hover:text-primary transition w-full"
                >
                  <span className="text-xs">Upload Profile photo</span>
                </label>
              );
            })()}
            {errors.file && (
              <p className="text-sm text-red-500">
                {errors.file.message as string}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              className="flex-1 rounded-xl"
              type="submit"
              disabled={isPending}
            >
              {isPending
                ? mode === "create"
                  ? "Saving..."
                  : "Updating..."
                : `${mode === "create" ? "Save" : "Update"} ${
                    type === "manager" ? "Manager" : "Staff"
                  }`}
            </Button>
            {onCancel && (
              <Button
                variant="outline"
                type="button"
                className="rounded-xl"
                onClick={onCancel}
              >
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
