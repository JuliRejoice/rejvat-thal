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
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { SearchableDropDown } from "./SearchableDropDown";
import { uploadImage } from "@/api/managerStaff.api";
import DatePicker from "react-datepicker";
import { getAllArea } from "@/api/area.api";

interface AreaData {
  _id: string;
  areaName?: string;
  name?: string;
  [key: string]: any;
}

interface AreasResponse {
  payload: {
    data: AreaData[];
  };
}

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

interface StaffMangerFormProps {
  defaultValues?: any;
  onSubmit: (data: any) => void;
  isPending?: boolean;
  isImagePending?: boolean;          // Add this
  setIsImagePending?: (value: boolean) => void; // Add this
  type?: "staff" | "manager";
  onCancel?: () => void;
  mode?: "create" | "edit";
}

const formatTime = (value: string) => {
  if (!value) return "";
  const [hours, minutes] = value.split(":").map(Number);
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
};

export function StaffManagerForm({
  defaultValues,
  onSubmit,
  isPending,
  type = "staff",
  onCancel,
  mode = "create",
}: StaffMangerFormProps) {
  const [isImagePending, setIsImagePending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { user } = useAuth();
  const isManager = user?.role === "manager";
  const { toast } = useToast();
  const [restaurantsOptions, setRestaurantsOptions] = useState<{ id: string; name: string }[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>(
    user?.role === 'admin' ? '' : user?.restaurantId?._id || ''
  );

  console.log('Current user:', user);
  console.log(defaultValues,'defaultValues')
  
  // Fetch all restaurants (only used for admin users)
  const { data: getAllRestaurants } = useQuery({
    queryKey: ["get-all-restaurant"],
    queryFn: () => getRestaurants({}),
    enabled: user?.role === 'admin', // Only fetch if user is admin
  });

  // Initialize selectedRestaurantId with default value from props or user context
 
  // Fetch areas based on selected restaurant (or user's restaurant if not admin)
  const { data: getAreas, isLoading: isLoadingAreas } = useQuery<AreasResponse>({
    queryKey: ["get-areas-by-restaurant", selectedRestaurantId],
    queryFn: async () => {
      if (!selectedRestaurantId) return { payload: { data: [] } };
      const response = await getAllArea({
        restaurantId: selectedRestaurantId,
        page: 1,
        limit: 100, // Get all areas
        search: ""
      });
      return response;
    },
    enabled: !!selectedRestaurantId, // Only run if we have a restaurant ID
  });

  // Handle side effects when areas data is loaded
  useEffect(() => {
    if (getAreas && mode === 'edit' && defaultValues?.areaId) {
      if (getAreas.payload?.data?.some((area) => area._id === defaultValues.areaId)) {
        setValue('areaId', defaultValues.areaId, { shouldValidate: true });
      }
    }
  }, [getAreas, mode, defaultValues]);

  const allAreaOptions = useMemo(() => {
    if (!getAreas?.payload?.data) return [];
    return getAreas.payload.data.map((area) => ({
      id: area._id,
      name: area.areaName || area.name || 'Unnamed Area'
    }));
  }, [getAreas]);

  // Set initial restaurant and area when defaultValues change (edit mode)
  useEffect(() => {
    if (mode === 'edit' && defaultValues) {
      // Set restaurant ID if not already set
      if (defaultValues.restaurantId && !selectedRestaurantId) {
        setSelectedRestaurantId(defaultValues.restaurantId);
      }
      // Set area ID if not already set
      if (defaultValues.areaId && !watch('areaId')) {
        setValue('areaId', defaultValues.areaId, { shouldValidate: true });
      }
    }
  }, [defaultValues, mode, selectedRestaurantId]);

  console.log("Area options:", allAreaOptions);

  
  const handleRestaurantChange = async (restaurantId: string) => {
    setSelectedRestaurantId(restaurantId);
    // Always reset area when restaurant changes
    setValue("restaurantId", restaurantId, { shouldValidate: true });
    setValue("areaId", "", { shouldValidate: false, shouldDirty: true });
    
    // Only validate if the field was previously touched
    if (touchedFields.areaId) {
      await trigger("areaId");
    }
  };
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

// Parse timing values from defaultValues if in edit mode
const parseTimingValues = (values: any) => {
  if (!values) return {};

  const parsed = { ...values };

  // Handle shift timing from shift object
  if (values.shift) {
    parsed.shiftStart = values.shift.startTime || "";
    parsed.shiftEnd = values.shift.endTime || "";
  } else if (values.timingShift) {
    // Backward compatibility with old format
    const [shiftStart, shiftEnd] = values.timingShift.split(" - ").map((t: string) => t.trim());
    parsed.shiftStart = shiftStart && shiftStart.includes(":") ? shiftStart : "";
    parsed.shiftEnd = shiftEnd && shiftEnd.includes(":") ? shiftEnd : "";
  } else {
    parsed.shiftStart = values.shiftStart || "";
    parsed.shiftEnd = values.shiftEnd || "";
  }

  // Handle lunch timing from lunch object
  if (values.lunch) {
    parsed.lunchStart = values.lunch.startTime || "";
    parsed.lunchEnd = values.lunch.endTime || "";
  } else if (values.lunchTime) {
    // Backward compatibility with old format
    const [lunchStart, lunchEnd] = values.lunchTime.split(" - ").map((t: string) => t.trim());
    parsed.lunchStart = lunchStart && lunchStart.includes(":") ? lunchStart : "";
    parsed.lunchEnd = lunchEnd && lunchEnd.includes(":") ? lunchEnd : "";
  } else {
    parsed.lunchStart = values.lunchStart || "";
    parsed.lunchEnd = values.lunchEnd || "";
  }

  return parsed;
};
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors, touchedFields },
    reset,
    trigger,
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
      position: "",
      isUserType: type,
      shiftStart: "",
      shiftEnd: "",
      lunchStart: "",
      lunchEnd: "",
      description: "",
      areaId: "",
      passport: null as File | null,
      visaId: null as File | null,
      otherDoc: null as File | null,
      file: null as File | null,
      ...(defaultValues ? parseTimingValues(defaultValues) : {}),
    },
    mode: "onSubmit",
  });

  // Register required fields with validation
  useEffect(() => {
    register("description", { required: "Description is required" });
    register("passport", { required: "Passport is required" });
    register("visaId", { required: "Visa ID is required" });
    register("shiftStart", { 
      required: "Shift start time is required",
      validate: value => value && value.includes(':') || "Invalid time format (HH:MM)"
    });
    register("shiftEnd", { 
      required: "Shift end time is required",
      validate: value => value && value.includes(':') || "Invalid time format (HH:MM)"
    });
    register("lunchStart", { 
      required: "Lunch start time is required",
      validate: value => value && value.includes(':') || "Invalid time format (HH:MM)"
    });
    register("lunchEnd", { 
      required: "Lunch end time is required",
      validate: value => value && value.includes(':') || "Invalid time format (HH:MM)"
    });
    register("restaurantId", {
      required: isManager ? false : "Select restaurant is required",
    });
    register("file", { required: "Profile Picture is required" });
    register("areaId", {
      required: isManager ? false : "Select area is required",
    });
    }, [register, isManager]);
  
  useEffect(() => {
    if (defaultValues) {
      reset(parseTimingValues(defaultValues));
    }
  }, [defaultValues, reset]);
  // Reset form when defaultValues change (for edit mode)
  useEffect(() => {
    if (defaultValues) {
      // First parse all timing values
      const parsedValues = parseTimingValues(defaultValues);
      
      // Set each field individually to ensure they're properly registered
      Object.entries(parsedValues).forEach(([key, value]) => {
        if (value !== undefined) {
          // For time fields, ensure they're in the correct format (HH:MM)
          if (['shiftStart', 'shiftEnd', 'lunchStart', 'lunchEnd'].includes(key)) {
            if (value && typeof value === 'string' && value.includes(':')) {
              // Ensure time is in 24-hour format (HH:MM)
              const [hours, minutes] = value.split(':');
              const formattedTime = `${hours.padStart(2, '0')}:${minutes || '00'}`;
              setValue(key as any, formattedTime, { shouldValidate: true });
            } else if (value) {
              setValue(key as any, value, { shouldValidate: true });
            }
          } else {
            setValue(key as any, value, { shouldValidate: true });
          }
        }
      });
      
      // Force UI update
      reset(parsedValues);
    }
  }, [defaultValues, reset, setValue]);



  // Other document is optional
  useEffect(() => {
    register("otherDoc");
  }, [register]);

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
      
      // Helper function to upload file if it's a File object
      const uploadIfFile = async (file: any) => {
        return file instanceof File ? await uploadImage(file) : file;
      };

      // Upload files only if they are File objects (new uploads)
      const [passportUrl, visaIdUrl, otherDocUrl] = await Promise.all([
        data.passport && data.passport instanceof File ? uploadIfFile(data.passport) : data.passport,
        data.visaId && data.visaId instanceof File ? uploadIfFile(data.visaId) : data.visaId,
        data.otherDoc && data.otherDoc instanceof File ? uploadIfFile(data.otherDoc) : data.otherDoc,
      ]);

      // Prepare the data to submit
      const formattedData = {
        ...data,
        phone: data.phone,
        address: data.address,
        restaurantId: data.restaurantId,
        salary: data.salary,
        joiningDate: data.joiningDate,
        position: data.position,
        isUserType: type,
        description: data.description,
        areaId: data.areaId,
        passport: passportUrl?.payload || passportUrl,
        visaId: visaIdUrl?.payload || visaIdUrl,
        otherDoc: otherDocUrl?.payload || otherDocUrl,
        file:  data.file,
        shift: {
          startTime: data.shiftStart,
          endTime: data.shiftEnd,
        },
        lunch: {
          startTime: data.lunchStart,
          endTime: data.lunchEnd,
        },
      };

      console.log("Formatted Data:", formattedData);
      onSubmit(formattedData);
    } catch (error: any) {
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
            {/* Restaurant Selection (Only for Admin) */}
            {user?.role === 'admin' && (
              <div className="space-y-2">
                <div className="flex gap-3 items-baseline">
                  <Label htmlFor="restaurantId">Restaurant *</Label>
                  {errors.restaurantId && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.restaurantId.message as string}
                    </p>
                  )}
                </div>
                <SearchableDropDown
                  options={[
                    { id: "", name: "Select a restaurant" },
                    ...(restaurantsOptions || [])
                  ]}
                  value={watch("restaurantId")}
                  onChange={handleRestaurantChange}
                />
              </div>
            )}

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
                <Label htmlFor="areaId">Area *</Label>
                {errors.areaId && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.areaId.message as string}
                  </p>
                )}
              </div>
              <SearchableDropDown
                options={[
                  { id: "", name: selectedRestaurantId ? "Select an area" : "Select a restaurant first" },
                  ...allAreaOptions
                ]}
                value={watch("areaId")}
                onChange={(value) => {
                  setValue("areaId", value, { 
                    shouldValidate: true,
                    shouldDirty: true 
                  });
                }}
                disabled={!selectedRestaurantId || isLoadingAreas}
                placeholder={
                  mode === 'edit' && defaultValues?.areaId && !watch('areaId')
                    ? allAreaOptions.find(a => a.id === defaultValues.areaId)?.name || 'Loading area...'
                    : 'Select an area'
                }
              />
              {isLoadingAreas && selectedRestaurantId ? (
                <p className="text-xs text-gray-500 mt-1">Loading areas...</p>
              ) : errors.areaId && touchedFields.areaId ? (
                <p className="text-xs text-red-500 mt-1">{errors.areaId.message as string}</p>
              ) : null}
            </div>

            {/* Restaurant selection for non-admin, non-manager users */}
            {user?.role !== 'admin' && user?.role !== 'manager' && (
              <div className="space-y-2">
                <div className="flex gap-3 items-baseline">
                  <Label htmlFor="restaurantId">Restaurant *</Label>
                  {errors.restaurantId && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.restaurantId.message as string}
                    </p>
                  )}
                </div>
                <SearchableDropDown
                  options={[
                    { id: "", name: "Select a restaurant" },
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
              </div>
            )}

          </div>



          {/* Timing Shift */}
          <div className="grid grid-cols-1 gap-6">
            {/* Joining Date */}
            <div className="grid grid-cols-2 gap-6">
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
              <div className="space-y-2">
                <Label htmlFor="position">Position *</Label>
                <Input
                  id="position"
                  placeholder="Enter position"
                  {...register("position", { required: "Position is required" })}
                  />
                  {errors.position && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.position.message as string}
                    </p>
                  )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                {/* Shift Timing */}
                <div className="space-y-2">
              <Label>Shift Time *</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="time"
                  {...register("shiftStart", { required: "Shift start is required" })}
                />
                <span className="text-muted-foreground">to</span>
                <Input
                  type="time"
                  {...register("shiftEnd", 
                  //   {
                  //   required: "Shift end is required",
                  //   validate: (value) =>
                  //     !watch("shiftStart") || value < watch("shiftStart") || "End must be after start",
                  // }
                )}
                />
              </div>
              {(errors.shiftStart || errors.shiftEnd) && (
                <p className="mt-1 text-xs text-red-500">
                  {(errors.shiftStart?.message as string) || (errors.shiftEnd?.message as string)}
                </p>
              )}
            </div>
              </div>
                {/* Lunch Time */}
                <div className="space-y-2">
                  <Label>Lunch Time *</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      {...register("lunchStart", {
                        required: "Lunch start is required",
                        validate: (value) =>
                          !watch("lunchEnd") || value < watch("lunchEnd") || "Start must be before end",
                      })}
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
                {(errors.shiftStart || errors.shiftEnd) && (
                  <p className="mt-1 text-xs text-red-500">
                    {(errors.shiftStart?.message as string) || (errors.shiftEnd?.message as string)}
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
    </form >
  );
}
