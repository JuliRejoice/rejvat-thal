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
  const isManager = user?.role === "manager";
  const { toast } = useToast();
  const [restaurantsOptions, setRestaurantsOptions] = useState<
    { id: string; name: string }[]
  >([]);

  const { data: getAllRestaurants } = useQuery({
    queryKey: ["get-all-restaurant"],
    queryFn: () => getRestaurants({}),
  });

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
      joiningDate: "",
      position: type,
      isUserType: type,
      file: null as File | null,
      ...defaultValues,
    },
    mode: "onSubmit",
  });

  useEffect(() => {
    register("restaurantId", {
      required: isManager ? false : "Select restaurant is required",
    });
    register("file", { required: "Profile Picture is required" });
  }, [register, isManager]);

  useEffect(() => {
    if (isManager && user?.restaurantId && !defaultValues?.restaurantId) {
      setValue("restaurantId", user.restaurantId, {
        shouldValidate: true,
        shouldTouch: true,
      });
    }
  }, [isManager, user?.restaurantId, setValue, defaultValues?.restaurantId]);

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
              <div className="flex gap-3 items-baseline">
                <Label htmlFor="name">Full Name *</Label>
                {errors.name && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.name.message as string}
                  </p>
                )}
              </div>
              <Input
                id="name"
                placeholder="Enter full name"
                {...register("name", { required: "Name is required" })}
                maxLength={40}
              />
            </div>
            {/* Email */}
            <div className="space-y-2">
              <div className="flex gap-3 items-baseline">
                <Label htmlFor="email">Email *</Label>
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.email.message as string}
                  </p>
                )}
              </div>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                readOnly={mode === "edit"}
                {...register("email", { required: "Email is required" })}
                maxLength={50}
              />
            </div>
            {/* Password */}
            {mode === "create" && (
              <div className="space-y-2">
                <div className="flex gap-3 items-baseline">
                  <Label htmlFor="password">Password *</Label>
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.password.message as string}
                    </p>
                  )}
                </div>
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
                        message: "Min 8 chars, upper, lower, number & special",
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
              </div>
            )}
            {/* Phone */}
            <div className="space-y-2">
              <div className="flex gap-3 items-baseline">
                <Label htmlFor="phone">Phone Number *</Label>
                {errors.phone && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.phone.message as string}
                  </p>
                )}
              </div>
              <Input
                id="phone"
                placeholder="Enter phone number"
                {...register("phone", { required: "Phone is required" })}
                maxLength={10}
              />
            </div>

            {/* Salary */}
            {type === "staff" && (
              <div className="space-y-2">
                <div className="flex gap-3 items-baseline">
                  <Label htmlFor="salary">Salary *</Label>
                  {errors.salary && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.salary.message as string}
                    </p>
                  )}
                </div>
                <Input
                  id="salary"
                  placeholder="Enter salary"
                  {...register("salary", { required: "Salary is required" })}
                  maxLength={8}
                />
              </div>
            )}

            {/* Joining Date */}
            <div className="space-y-2">
              <div className="flex gap-3 items-baseline">
                <Label htmlFor="restaurantId">Joining Date *</Label>
                {errors.joiningDate && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.joiningDate.message as string}
                  </p>
                )}
              </div>
              <Input
                type="date"
                id="joiningDate"
                max={new Date().toISOString().split("T")[0]}
                {...register("joiningDate", {
                  required: "Joining date is required",
                })}
              />
            </div>

            {/* Restaurant */}
            <div className={`${type === "staff" && "col-span-2"} space-y-2`}>
              <div className="flex gap-3 items-baseline">
                <Label htmlFor="restaurantId">Restaurant *</Label>
                {errors.restaurantId && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.restaurantId.message as string}
                  </p>
                )}
              </div>
              {isManager || mode === "edit" ? (
                <Input
                  id="restaurantId"
                  value={
                    restaurantsOptions.find(
                      (r) => r.id === watch("restaurantId")
                    )?.name || ""
                  }
                  readOnly
                  className="bg-gray-50"
                  placeholder="Loading restaurant..."
                />
              ) : (
                <SearchableDropDown
                  options={restaurantsOptions}
                  onSearch={handleSearch}
                  value={watch("restaurantId")}
                  onChange={(val) => {
                    setValue("restaurantId", val, {
                      shouldValidate: true,
                      shouldTouch: true,
                    });
                  }}
                />
              )}
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <div className="flex gap-3 items-baseline">
              <Label htmlFor="address">Address *</Label>
              {errors.address && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.address.message as string}
                </p>
              )}
            </div>
            <Textarea
              id="address"
              placeholder="Enter address"
              {...register("address", { required: "Address is required" })}
            />
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <div className="flex gap-3 items-baseline">
              <Label htmlFor="file">
                Upload Picture {mode === "create" ? "*" : "(optional)"}
              </Label>
              {errors.file && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.file.message as string}
                </p>
              )}
            </div>
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
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <Button className="rounded-xl" type="submit" disabled={isPending}>
              {isPending
                ? mode === "create"
                  ? "Saving..."
                  : "Updating..."
                : `${mode === "create" ? "Save" : "Update"} ${type === "manager" ? "Manager" : "Staff"
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
