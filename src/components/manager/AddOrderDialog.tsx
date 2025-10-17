import { useState } from "react"
import { useForm, Controller, FormState } from "react-hook-form"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Package } from "lucide-react"
import { AddInventoryOrder } from "@/api/inventory.api"
import { useToast } from "@/hooks/use-toast";


interface FormValues {
  vendor: string
  orderItems: string
  amount: number
  orderDate: string
  orderImage?: File
  orderNotes: string
}

export default function AddOrderDialog({ vendors, isOpen, setIsOpen ,onSubmit}: { vendors: { _id: string; name: string }[], isOpen: boolean, setIsOpen: (open: boolean) => void ,onSubmit: (data: FormValues) => void}) {

  const { toast } = useToast()
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      vendor: "",
      orderItems: "",
      amount: undefined,
      orderDate: "",
      orderImage: undefined,
      orderNotes: "",
    },
  })



  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>


      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Vendor Order</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Select Vendor</Label>
            <Controller
              control={control}
              name="vendor"
              rules={{ required: "Vendor is required" }}
              render={({ field }) => {
                return (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange} 
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose vendor" />
                    </SelectTrigger>
                    <SelectContent>
                      {vendors?.map((vendor) => (
                        <SelectItem key={vendor._id} value={String(vendor._id)}>
                          {vendor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )
              }}
            />


            {errors.vendor && (
              <p className="text-sm text-red-500">{errors.vendor.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="orderItems">Order Items</Label>
            <Textarea
              id="orderItems"
              placeholder="e.g., Onions 10kg, Tomatoes 5kg"
              {...register("orderItems", { required: "Order items are required" })}
            />
            {errors.orderItems && (
              <p className="text-sm text-red-500">{errors.orderItems.message}</p>
            )}
          </div>

          {/* ✅ Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (AED)</Label>
            <Input
              id="amount"
              type="number"
              {...register("amount", {
                required: "Amount is required",
                valueAsNumber: true,
              })}
            />
            {errors.amount && (
              <p className="text-sm text-red-500">{errors.amount.message}</p>
            )}
          </div>

          {/* ✅ Order Date */}
          <div className="space-y-2">
            <Label htmlFor="orderDate">Order Date</Label>
            <Input
              id="orderDate"
              type="date"
              {...register("orderDate", { required: "Order date is required" })}
            />
            {errors.orderDate && (
              <p className="text-sm text-red-500">{errors.orderDate.message}</p>
            )}
          </div>

          {/* ✅ Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="orderImage">Upload Receipt/Image</Label>
            <Controller
              control={control}
              name="orderImage"
              render={({ field }) => (
                <Input
                  id="orderImage"
                  type="file"
                  accept="image/*"
                  onChange={(e) => field.onChange(e.target.files[0])}
                />
              )}
            />
          </div>

          {/* ✅ Notes */}
          <div className="space-y-2">
            <Label htmlFor="orderNotes">Notes</Label>
            <Textarea
              id="orderNotes"
              placeholder="Additional notes"
              {...register("orderNotes")}
            />
          </div>

          <div className="flex gap-2">
            <Button 
              type="submit" 
              className="flex-1" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Order"}
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
