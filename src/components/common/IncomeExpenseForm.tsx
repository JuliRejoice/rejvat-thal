import { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchableDropDown } from "./SearchableDropDown";
import { useToast } from "@/hooks/use-toast";
import { useQueries } from "@tanstack/react-query";
import { getPaymentMethods } from "@/api/paymentMethod.api";
import { getAllExpenseCategory } from "@/api/expenseCategory.api";
import { getAllIncomeCategory } from "@/api/incomeCategories.api";
import { getAllVendors } from "@/api/vendor.api";
import { getThresholdAmont } from "@/api/settings.api";
import { useAuth } from "@/contexts/AuthContext";
type IncomeExpenseFormMode = "create" | "edit";
type IncomeExpenseType = "income" | "expense";

interface IncomeExpenseFormProps {
  defaultValues?: any;
  onSubmit: (data: any) => void;
  isPending?: boolean;
  type: IncomeExpenseType;
  onCancel?: () => void;
  mode?: IncomeExpenseFormMode;
  showRestaurantSelector?: boolean;
}

export function IncomeExpenseForm({
  defaultValues,
  onSubmit,
  isPending,
  type,
  onCancel,
  mode = "create",
}: IncomeExpenseFormProps) {
  const { toast } = useToast();
  const [expenseCategoriesOptions, setExpenseCategoriesOptions] = useState<
    { id: string; name: string }[]
  >([]);
  const [vendorOptions, setVendorOptions] = useState<
    { id: string; name: string }[]
  >([]);
  const [vendorExpense, setVendorExpense] = useState("");
  const [incomeCategoriesOptions, setIncomeCategoriesOptions] = useState<
    { id: string; name: string }[]
  >([]);
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    control,
  } = useForm({
    defaultValues: {
      expenseCategoryId: "",
      incomeCategoryId: "",
      vendorId: "",
      amount: "",
      method: "",
      restaurantId: "",
      description: "",
      file: null as File | null,
      date: "",
      type,
      ...defaultValues,
    },
    mode: "onSubmit",
    shouldUnregister: false,
  });

  const queriesResults = useQueries({
    queries: [
      {
        queryKey: ["payment-methods"],
        queryFn: () => getPaymentMethods(),
      },
      {
        queryKey: ["expense-categories"],
        queryFn: () => getAllExpenseCategory({}),
        enabled: type === "expense",
      },
      {
        queryKey: ["get-all-vendors"],
        queryFn: () => getAllVendors({}),
        enabled: type === "expense" && Boolean(vendorExpense),
      },
      {
        queryKey: ["income-categories"],
        queryFn: () => getAllIncomeCategory({restaurantId: user?.restaurantId?._id}),
        enabled: type === "income",
      },
      {
        queryKey: ["get-threshold-amount"],
        queryFn: () => getThresholdAmont(),
        enabled: type === "expense",
      },
    ],
  });

  const [
    paymentMethodsQuery,
    expenseCategoriesQuery,
    getVendorsQuery,
    incomeCategoriesQuery,
    thresholdQuery,
  ] = queriesResults;
  const paymentMethods = paymentMethodsQuery?.data?.payload?.data || [];
  const thresholdAmount =
    thresholdQuery?.data?.payload?.expenseThresholdAmount || 0;

  useEffect(() => {
    if (expenseCategoriesQuery.data?.payload?.data) {
      setExpenseCategoriesOptions(
        expenseCategoriesQuery.data.payload.data
          .filter((c: any) => c.name !== "Vendor expense")
          .map((c: any) => ({
            id: c._id,
            name: c.name,
          }))
      );
    }
  }, [expenseCategoriesQuery.data]);
  
  useEffect(() => {
    if (incomeCategoriesQuery.data?.payload?.data) {
      setIncomeCategoriesOptions(
        incomeCategoriesQuery.data.payload.data.map((c: any) => ({
          id: c._id,
          name: c.name,
        }))
      );
    }
  }, [incomeCategoriesQuery.data]);

  useEffect(() => {
    if (getVendorsQuery?.data?.payload?.data) {
      setVendorOptions(
        getVendorsQuery?.data?.payload?.data.map((c: any) => ({
          id: c._id,
          name: c.name + " " + `(${c.email})`,
        }))
      );
    }
  }, [getVendorsQuery?.data]);

  useEffect(() => {
    const amount = Number(watch("amount"));
    register("file", {
      required:
        mode === "create" && amount > thresholdAmount && type === "expense"
          ? "A receipt or bill is required because the amount you entered exceeds the threshold you have set"
          : false,
    });
  }, [mode, thresholdAmount, type, watch("amount"), register]);

  useEffect(() => {
    register("method", { required: "Payment method is required" });
    register("date", { required: "Date is required" });
    if (type === "expense") {
      register("expenseCategoryId", {
        required: "Expense category is required",
      });
      // Conditionally require vendor when the selected expense category matches the given id
      register("vendorId", {
        validate: (val) =>
          watch("expenseCategoryId") === "68bff6c834305c04a6926d1f"
            ? Boolean(val) || "Vendor is required"
            : true,
      });
    } else {
      register("incomeCategoryId", {
        required: "Income category is required",
      });
    }
  }, [register, type, mode]);

  const handleExpenseCategorySearch = async (query: string) => {
    const res = await getAllExpenseCategory({ search: query });
    setExpenseCategoriesOptions(
      res.payload.data.map((c: any) => ({ id: c._id, name: c.name }))
    );
  };

  const handleVendorSearch = async (query: string) => {
    const res = await getAllVendors({ search: query });
    setVendorOptions(
      res.payload.data.map((c: any) => ({
        id: c._id,
        name: c.name + " " + `(${c.email})`,
      }))
    );
  };

  const handleIncomeCategorySearch = async (query: string) => {
    const res = await getAllIncomeCategory({ search: query });
    setIncomeCategoriesOptions(
      res.payload.data.map((c: any) => ({ id: c._id, name: c.name }))
    );
  };

  const internalSubmit = (data: any) => {
    const payload = { ...data, type };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(internalSubmit)}>
      <Card className="shadow-none">
        <CardContent className="space-y-6 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {type === "expense" ? (
              <div className="space-y-2">
                <div className="flex gap-3 items-baseline">
                  <Label htmlFor="expenseCategoryId">Expense Category *</Label>
                  {errors.expenseCategoryId && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.expenseCategoryId.message as string}
                    </p>
                  )}
                </div>
                <SearchableDropDown
                  options={expenseCategoriesOptions}
                  onSearch={handleExpenseCategorySearch}
                  value={watch("expenseCategoryId")}
                  onChange={(val) => {
                    setValue("expenseCategoryId", val, {
                      shouldValidate: true,
                      shouldTouch: true,
                    });
                    setVendorExpense(val);
                  }}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-3 items-baseline">
                  <Label htmlFor="incomeCategoryId">Income Category *</Label>
                  {errors.incomeCategoryId && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.incomeCategoryId.message as string}
                    </p>
                  )}
                </div>
                <SearchableDropDown
                  options={incomeCategoriesOptions}
                  onSearch={handleIncomeCategorySearch}
                  value={watch("incomeCategoryId")}
                  onChange={(val) => {
                    setValue("incomeCategoryId", val, {
                      shouldValidate: true,
                      shouldTouch: true,
                    });
                  }}
                />
              </div>
            )}

            {type === "expense" &&
              watch("expenseCategoryId") === "68bff6c834305c04a6926d1f" && (
                <div className="space-y-2">
                  <div className="flex gap-3 items-baseline">
                    <Label htmlFor="vendorId">Vendor *</Label>
                    {errors.vendorId && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.vendorId.message as string}
                      </p>
                    )}
                  </div>
                  <SearchableDropDown
                    options={vendorOptions}
                    onSearch={handleVendorSearch}
                    value={watch("vendorId")}
                    onChange={(val) => {
                      setValue("vendorId", val, {
                        shouldValidate: true,
                        shouldTouch: true,
                      });
                    }}
                  />
                </div>
              )}

            <div className="space-y-2">
              <div className="flex gap-3 items-baseline">
                <Label htmlFor="amount">Amount (AED) *</Label>
                {errors.amount && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.amount.message as string}
                  </p>
                )}
              </div>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                {...register("amount", { required: "Amount is required" })}
              />
            </div>

            <div className="space-y-2">
              <div className="flex gap-3 items-baseline">
                <Label htmlFor="method">Payment Method *</Label>
                {errors.method && (
                  <p className="mt-1 text-xs text-red-500">
                    {String(errors.method.message)}
                  </p>
                )}
              </div>
              <Controller
                name="method"
                control={control}
                rules={{ required: "Payment method is required" }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((m: any) => (
                        <SelectItem key={m._id} value={m._id}>
                          {m.type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <div className="flex gap-3 items-baseline">
                <Label htmlFor="date">Date *</Label>
                {errors.date && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.date.message as string}
                  </p>
                )}
              </div>
              <Input
                id="date"
                type="date"
                max={new Date().toISOString().split("T")[0]}
                {...register("date", { required: "Date is required" })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex gap-3 items-baseline">
              <Label htmlFor="file">
                Upload Receipt/Bill
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
                  <span className="text-xs">Upload receipt/bill image</span>
                </label>
              );
            })()}
          </div>

          <div className="space-y-2">
            <div className="flex gap-3 items-baseline">
              <Label htmlFor="description">Notes *</Label>
              {errors.description && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.description.message as string}
                </p>
              )}
            </div>
            <Textarea
              id="description"
              rows={3}
              placeholder="Enter description or notes"
              {...register("description", {
                required: "Description is required",
              })}
            />
          </div>

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
                    type === "income" ? "Income" : "Expense"
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
