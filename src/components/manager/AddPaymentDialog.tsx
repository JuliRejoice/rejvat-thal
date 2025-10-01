import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { IndianRupee } from "lucide-react"
import { vendorPayment } from "@/api/paymentMethod.api"
import { getAllExpenseCategory } from "@/api/expenseCategory.api"
import { getPaymentMethods } from "@/api/paymentMethod.api"
import { useToast } from "@/hooks/use-toast"
import { useQuery } from "@tanstack/react-query"

interface FormValues {
  vendorId: string
  amount: number
  date: string
  method: string
  image?: File
  description: string
  expenseCategoryId: string
}

export default function AddPaymentDialog({
  vendors,
  isOpen,
  setIsOpen,
  onSubmit
}: {
  vendors: { _id: string; name: string }[]
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  onSubmit: (data: FormValues) => void
}) {
  const { toast } = useToast()

  // Fetch expense categories and payment methods
  const { data: expenseCategoriesData } = useQuery({
    queryKey: ['expenseCategories'],
    queryFn: () => getAllExpenseCategory({
      page: 1,
      limit: 100,
      status: true
    })
  })

  const { data: paymentMethodsData } = useQuery({
    queryKey: ['paymentMethods'],
    queryFn: getPaymentMethods
  })

  const expenseCategories = expenseCategoriesData?.payload?.data || []
  const paymentMethods = paymentMethodsData?.payload?.data || []

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      vendorId: "",
      amount: undefined,
      date: "",
      method: "",
      image: undefined,
      description: "",
      expenseCategoryId: "",
    },
  })

 
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Payment to Vendor</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vendorId">Select Vendor</Label>
            <Controller
              control={control}
              name="vendorId"
              rules={{ required: "Vendor is required" }}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    {vendors?.map((vendor) => (
                      <SelectItem key={vendor._id} value={vendor._id}>
                        {vendor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.vendorId && (
              <p className="text-sm text-red-500">{errors.vendorId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹)</Label>
            <Controller
              control={control}
              name="amount"
              rules={{
                required: "Amount is required",
                min: { value: 0.01, message: "Amount must be greater than 0" }
              }}
              render={({ field }) => (
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="Enter payment amount"
                  value={field.value || ""}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                />
              )}
            />
            {errors.amount && (
              <p className="text-sm text-red-500">{errors.amount.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Payment Date</Label>
            <Controller
              control={control}
              name="date"
              rules={{ required: "Payment date is required" }}
              render={({ field }) => (
                <Input
                  id="date"
                  type="date"
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            {errors.date && (
              <p className="text-sm text-red-500">{errors.date.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="method">Payment Method</Label>
            <Controller
              control={control}
              name="method"
              rules={{ required: "Payment method is required" }}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods?.map((method) => (
                      <SelectItem key={method._id} value={method._id}>
                        {method.type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.method && (
              <p className="text-sm text-red-500">{errors.method.message}</p>
            )}
          </div>

          {/* <div className="space-y-2">
            <Label htmlFor="expenseCategoryId">Expense Category</Label>
            <Controller
              control={control}
              name="expenseCategoryId"
              rules={{ required: "Expense category is required" }}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select expense category" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories?.map((category) => (
                      <SelectItem key={category._id} value={category._id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.expenseCategoryId && (
              <p className="text-sm text-red-500">{errors.expenseCategoryId.message}</p>
            )}
          </div> */}

          <div className="space-y-2">
            <Label htmlFor="image">Upload Receipt/Image</Label>
            <Controller
              control={control}
              name="image"
              render={({ field }) => (
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => field.onChange(e.target.files?.[0])}
                />
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Notes</Label>
            <Textarea
              id="description"
              placeholder="Payment notes"
              {...register("description")}
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Payment"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
