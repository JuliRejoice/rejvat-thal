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
import { Controller, useForm } from "react-hook-form";
import { SearchableDropDown } from "./SearchableDropDown";
import { uploadImage } from "@/api/managerStaff.api";
import DatePicker from "react-datepicker";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

interface StaffMangerFormProps {
  defaultValues?: any;
  onSubmit: (data: any) => void;
  isPending?: boolean;
  type?: "staff" | "manager";
  onCancel?: () => void;
  setIsImagePending?: (pending: boolean) => void;
  isImagePending?: boolean;
  mode?: "create" | "edit";
}

export function StaffManagerForm({
  defaultValues,
  onSubmit,
  isPending,
  type = "staff",
  onCancel,
  setIsImagePending,
  isImagePending,
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
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      name: "",
      password: "",
      phone: "",
      address: "",
      restaurantId: "",
      salary: "",
      joiningDate: "",
      position: type,
      isUserType: type,
      shiftStart: "",
      shiftEnd: "",
      lunchStart: "",
      lunchEnd: "",
      description: "",
      passport: null as File | null,
      visaId: null as File | null,
      otherDoc: null as File | null,
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
    register("passport", { required: "Passport is required" });
    register("visaId", { required: "Visa ID is required" });
    register("otherDoc", { required: "Additional document is required" });
  }, [register, isManager]);

  useEffect(() => {
    if (isManager && user?.restaurantId && !defaultValues?.restaurantId) {
      setValue("restaurantId", user.restaurantId._id, {
        shouldValidate: true,
        shouldTouch: true,
      });
    }
  }, [isManager, user?.restaurantId, setValue, defaultValues?.restaurantId]);

  const internalSubmit = async (data: any) => {
    if (mode === "create" && !data.file) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Profile picture is required.",
      });
      return;
    }

    try {
      setIsImagePending(true);
      // Upload files sequentially
      let passportUrl = null;
      let visaIdUrl = null;
      let otherDocUrl = null;


      // Upload passport if it exists
      if (data.passport) {
        passportUrl = await uploadImage(data.passport);
      }

      // Upload visa ID if it exists
      if (data.visaId) {
        visaIdUrl = await uploadImage(data.visaId);
      }

      // Upload other document if it exists
      if (data.otherDoc) {
        otherDocUrl = await uploadImage(data.otherDoc);
      }

      const formattedData = {
        email: data.email,
        name: data.name,
        password: data.password,
        phone: data.phone,
        address: data.address,
        restaurantId: data.restaurantId,
        salary: data.salary,
        joiningDate: data.joiningDate,
        position: type,
        isUserType: type,
        description: data.description,
        passport: passportUrl.payload,
        visaId: visaIdUrl.payload,
        otherDoc: otherDocUrl.payload,
        file: data.file,
        timingShift: `${data.shiftStart} - ${data.shiftEnd}`,
        lunchTime: `${data.lunchStart} - ${data.lunchEnd}`,
      };

      console.log("Formatted Data:", formattedData);
      onSubmit(formattedData);
    } catch (error) {
      console.error("Error uploading files:", error);
      toast({
        variant: "destructive",
        title: "Upload Error",
        description: error.message || "Failed to upload files. Please try again.",
      });
    } finally {
      setIsImagePending(false);
      }
  };

  return (
    <form onSubmit={handleSubmit(internalSubmit)}>
      <Card className="shadow-none max-h-[calc(100vh-200px)] overflow-y-auto">
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
                maxLength={11}
              />
            </div>
          </div>

          {/* Salary */}
          <div className="grid grid-cols-2 gap-4">
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
                className="w-full"
              />
            </div>


            <div className="space-y-2">
              <div className="flex gap-3 items-baseline">
                <Label htmlFor="restaurantId">Restaurant *</Label>
                {errors.restaurantId && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.restaurantId.message as string}
                  </p>
                )}
              </div>
              {isManager && user?.restaurantId ? (
                // Show disabled input with manager's restaurant
                <Input
                  value={user.restaurantId.name}
                  disabled
                  className="bg-gray-100"
                />
              ) : (
                // Show dropdown for non-managers
                <SearchableDropDown
                  options={[
                    { id: "all", name: "All Restaurants" },
                    ...(restaurantsOptions.map((restaurant) => ({
                      id: restaurant.id,
                      name: restaurant.name,
                    })) || []),
                  ]}
                  value={watch("restaurantId")}
                  onChange={(value) => {
                    setValue("restaurantId", value, {
                      shouldValidate: true,
                      shouldTouch: true,
                    });
                  }}
                />
              )}
            </div>

          </div>



          {/* Timing Shift */}
          <div className="grid grid-cols-3 gap-6">
            {/* Joining Date */}
            <div className="space-y-2">
              {/* <div className="flex gap-3 items-baseline"> */}
              <Label htmlFor="restaurantId">Joining Date *</Label>
              {errors.joiningDate && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.joiningDate.message as string}
                </p>
              )}
              {/* </div> */}
              <Input
                type="date"
                id="joiningDate"
                max={new Date().toISOString().split("T")[0]}
                {...register("joiningDate", {
                  required: "Joining date is required",
                })}
              />
            </div>
            {/* Shift Timing */}
            <div className="space-y-2">
            <Controller
            control={control}
            name="shiftStart"
            rules={{ required: "Shift start is required" }}
            render={({ field }) => (
              <DatePicker
                selected={field.value}
                onChange={field.onChange}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={15} // 15 min step
                timeFormat="HH:mm" // force 24h format
                dateFormat="HH:mm"
                placeholderText="Start Time"
                className="border rounded-md px-3 py-2 w-[140px]"
              />
            )}
          />

          <span className="text-muted-foreground">to</span>

          {/* Shift End */}
          <Controller
            control={control}
            name="shiftEnd"
            rules={{
              required: "Shift end is required",
              validate: (value) =>
                !watch("shiftStart") ||
                value > watch("shiftStart") ||
                "End must be after start",
            }}
            render={({ field }) => (
              <DatePicker
                selected={field.value}
                onChange={field.onChange}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={15}
                timeFormat="HH:mm"
                dateFormat="HH:mm"
                placeholderText="End Time"
                className="border rounded-md px-3 py-2 w-[140px]"
              />
            )}
          />
            </div>

            {/* Lunch Time */}
            <div className="space-y-2">
              <Label>Lunch Time *</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="time"
                  {...register("lunchStart", { required: "Lunch start is required" })}
                />
                <span className="text-muted-foreground">to</span>
                <Input
                  type="time"
                  {...register("lunchEnd", {
                    required: "Lunch end is required",
                    validate: (value) =>
                      !watch("lunchStart") || value > watch("lunchStart") || "End must be after start",
                  })}
                />
              </div>
              {(errors.lunchStart || errors.lunchEnd) && (
                <p className="mt-1 text-xs text-red-500">
                  {(errors.lunchStart?.message as string) || (errors.lunchEnd?.message as string)}
                </p>
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


          {/* Description */}
          <div className="space-y-2 col-span-2">
            <div className="flex gap-3 items-baseline">
              <Label htmlFor="description">Description</Label>
              {errors.description && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.description.message as string}
                </p>
              )}
            </div>
            <Textarea
              id="description"
              placeholder="Enter any additional information"
              {...register("description")}
              rows={3}
            />
          </div>

          {/* Proof ID Section */}
          <div className="space-y-4 col-span-2 pt-4 border-t">
            <h4 className="text-lg font-medium">Identification Documents</h4>

            {/* Passport */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex gap-3 items-baseline">
                  <Label htmlFor="passport">Passport *</Label>
                  {errors.passport && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.passport.message as string}
                    </p>
                  )}
                </div>
                <Input
                  id="passport"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    setValue("passport", file || null, { shouldValidate: true });
                  }}
                />
              </div>

              {/* Visa ID */}
              <div className="space-y-2">
                <div className="flex gap-3 items-baseline">
                  <Label htmlFor="visaId">Visa ID *</Label>
                  {errors.visaId && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.visaId.message as string}
                    </p>
                  )}
                </div>
                <Input
                  id="visaId"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    setValue("visaId", file || null, { shouldValidate: true });
                  }}
                />

              </div>

              {/* Other Document */}
              <div className="space-y-2">
                <div className="flex gap-3 items-baseline">
                  <Label htmlFor="otherDoc">Other Document *</Label>
                  {errors.otherDoc && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.otherDoc.message as string}
                    </p>
                  )}
                </div>
                <Input
                  id="otherDoc"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    setValue("otherDoc", file || null, { shouldValidate: true });
                  }}
                />

              </div>
            </div>
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
            <Button className="rounded-xl" type="submit" disabled={isPending || isImagePending}>
              {isPending || isImagePending
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
