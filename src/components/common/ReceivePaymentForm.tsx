import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { getPaymentMethods } from "@/api/paymentMethod.api";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "../ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Config } from "@/utils/Config";
import { receivePayment } from "@/api/customer.api";

import { QueryObserverResult } from "@tanstack/react-query";

export interface ReceivePaymentFormProps {
  customerId: string;
  onSuccess?: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerName: string;
  refetchCustomerData: (options?: any) => Promise<QueryObserverResult<any, Error>>;
  refetchPaymentHistory: (options?: any) => Promise<QueryObserverResult<any, Error>>;
}

export function ReceivePaymentForm({
  customerId,
  onSuccess,
  open,
  onOpenChange,
  customerName,
  refetchCustomerData,
  refetchPaymentHistory,
}: ReceivePaymentFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<{
    amount: string;
    date: string;
    paymentMethodId: string;
    incomeCategoryId: string;
    customerId: string;
  }>({
    amount: "",
    date: new Date().toISOString().split('T')[0], // Format as YYYY-MM-DD for input[type="date"]
    paymentMethodId: "",
    incomeCategoryId: "",
    customerId: customerId,
  });

  // Reset form data when modal opens
  useEffect(() => {
    if (open) {
      setFormData({
        amount: "",
        date: new Date().toISOString().split('T')[0],
        paymentMethodId: "",
        incomeCategoryId: "",
        customerId: customerId,
      });
      setErrors({});
    }
  }, [open, customerId]);

  const validate = (data: typeof formData) => {
    const errors: Record<string, string> = {};

    if (!data.amount) {
      errors.amount = "Amount is required";
    } else if (isNaN(parseFloat(data.amount)) || parseFloat(data.amount) <= 0) {
      errors.amount = "Please enter a valid amount";
    }

    if (!data.paymentMethodId) {
      errors.paymentMethodId = "Payment method is required";
    }

    if (!data.date) {
      errors.date = "Date is required";
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validate(formData);
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length > 0) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const paymentData = {
        customerId: customerId,
        amount: Number(formData.amount),
        date: formData.date,
        method: formData.paymentMethodId,
        incomeCategoryId: Config.CUSTOMER_PAYMENTS
      };
      
      await receivePayment(paymentData);
      
      // Refresh customer data and payment history if refetch functions are provided
      if (refetchCustomerData && refetchPaymentHistory) {
        await Promise.all([
          refetchCustomerData(),
          refetchPaymentHistory()
        ]);
      }
      
      toast({
        title: "Success",
        description: "Payment received successfully",
      });
      
      onOpenChange(false);
      onSuccess?.();
      
      // Reset form
      setFormData({
        amount: "",
        date: new Date().toISOString().split('T')[0],
        paymentMethodId: "",
        incomeCategoryId: "",
        customerId: customerId,
      });
      
    } catch (error) {
      console.error("Error receiving payment:", error);
      let errorMessage = "Failed to record payment";
      
      if (error.response) {
        errorMessage = error.response.data?.message || errorMessage;
      } else if (error.request) {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  // Fetch payment methods
  const { data: paymentMethods, isLoading: isLoadingPaymentMethods } = useQuery({
    queryKey: ["payment-methods"],
    queryFn: getPaymentMethods,
    enabled: open,
  });


  try {
    return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            <DialogTitle>Receive Due Payment</DialogTitle>
          </div>
          <DialogDescription className="pt-1">
            Record payment from <span className="font-medium text-foreground">{customerName}</span>
          </DialogDescription>
        </DialogHeader>
        
        <Card className="border-0 shadow-none">
          <CardContent className="p-0 pt-2">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">

                {/* Amount */}
                <div className="space-y-1">
                  <Label htmlFor="amount" className="text-sm font-medium">
                    Amount <span>*</span>
                  </Label>
                  <span className="text-xs text-red-500">{errors?.amount ?? ''}</span>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      ₹
                    </span>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      className={`pl-8 ${errors.amount ? 'border-red-500' : ''}`}
                      value={formData.amount}
                      onChange={(e) => {
                        setFormData({ ...formData, amount: e.target.value });
                        if (errors.amount) {
                          setErrors(prev => ({ ...prev, amount: '' }));
                        }
                      }}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Date */}
                <div className="space-y-1">
                  <Label htmlFor="date" className="text-sm font-medium">
                    Date <span>*</span>
                  </Label>
                  <span className="text-xs text-red-500">{errors?.date ?? ''}</span>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => {
                      setFormData({ ...formData, date: e.target.value });
                      if (errors.date) {
                        setErrors(prev => ({ ...prev, date: '' }));
                      }
                    }}
                    className={`w-full ${errors.date ? 'border-red-500' : ''}`}
                  />
                </div>

                {/* Payment Method */}
                <div className="space-y-1">
                  <Label htmlFor="paymentMethodId" className="text-sm font-medium">
                    Payment Method <span>*</span>
                  </Label>
                  <span className="text-xs text-red-500">{errors?.paymentMethodId ?? ''}</span>
                  <Select
                    value={formData.paymentMethodId}
                    onValueChange={(value) => {
                      setFormData(prev => ({ ...prev, paymentMethodId: value }));
                      if (errors.paymentMethodId) {
                        setErrors(prev => ({ ...prev, paymentMethodId: '' }));
                      }
                    }}
                    disabled={isLoadingPaymentMethods}
                  >
                    <SelectTrigger className={errors.paymentMethodId ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods?.payload?.data?.map((method: { _id: string; type: string }) => (
                        <SelectItem key={method._id} value={method._id}>
                          {method.type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                  className="w-24"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-primary"
                  disabled={isSubmitting || isLoadingPaymentMethods}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Receive Payment'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
  } catch (error) {
    console.error("Error receiving payment:", error);
    return <></>
  }
  
}
