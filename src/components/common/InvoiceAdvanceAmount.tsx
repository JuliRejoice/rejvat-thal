import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Dirham } from "@/components/Svg";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface InvoiceAdvanceAmountProps {
  total: number;
  onSave: (amount: number, status: string, paymentMethod: string) => void;
  advanceAmount: number;
  advancePaymentMethod?: string; // optional, in case you pass saved method from parent
  paymentMethods?: any;
  incomeCategories?: any;
}

const InvoiceAdvanceAmount: React.FC<InvoiceAdvanceAmountProps> = ({
  total,
  onSave,
  advanceAmount,
  advancePaymentMethod,
  paymentMethods,
  incomeCategories,
}) => {
  const [open, setOpen] = useState(false);
  const [advanceAmountInput, setAdvanceAmountInput] = useState<string>("");
  const [savedAmount, setSavedAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>();

  // Initialize saved data from props
  useEffect(() => {
    if (advanceAmount > 0) {
      setSavedAmount(advanceAmount);
      setAdvanceAmountInput(advanceAmount.toString());
      setPaymentMethod(advancePaymentMethod);
    }
  }, [advanceAmount, advancePaymentMethod]);

  console.log(paymentMethod,advancePaymentMethod,'advancePaymentMethod')

  const numericValue = parseFloat(advanceAmountInput) || 0;

  const getButtonLabel = () => {
    if (numericValue === 0) return "Save Unpaid";
    if (numericValue < total) return "Save Part Paid";
    if (numericValue > total) return "Save Advance";
    return "Save Paid";
  };

  const handleSave = () => {
    if (numericValue > 0 && !paymentMethod) {
      toast.error("Please select a payment method");
      return;
    }

    const status =
      numericValue === 0
        ? "unpaid"
        : numericValue < total
        ? "part-paid"
        : numericValue > total
        ? "advance"
        : "paid";

    setSavedAmount(numericValue);
    onSave(numericValue, status, paymentMethod);
    setOpen(false);
  };

  return (
    <div className="flex items-center justify-between gap-3">
      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (isOpen && savedAmount > 0) {
            setAdvanceAmountInput(savedAmount.toString());
            setPaymentMethod(advancePaymentMethod); 
          }
          if(!isOpen){
            setAdvanceAmountInput(savedAmount > 0 ? savedAmount.toString() : "");
            setPaymentMethod(advancePaymentMethod);
            setOpen(false);
          }
        }}
      >
        <DialogTrigger asChild>
          <span className="font-medium text-blue-700 cursor-pointer">
            + Advance Amount
            {savedAmount > 0 && (
              <span className="px-2 py-1 ml-1 rounded-full text-xs font-medium bg-success/10 text-success">
                {paymentMethods?.find((method: any) => method._id === advancePaymentMethod)?.type}
              </span>
            )}
          </span>
        </DialogTrigger>

        <DialogContent className="sm:max-w-sm">
          <DialogTitle>Enter Advance Amount</DialogTitle>

          <div className="flex flex-col gap-3 mt-4">
            {/* Amount input */}
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={advanceAmountInput}
                onFocus={(e) => {
                  if (e.target.value === "0") setAdvanceAmountInput("");
                }}
                onChange={(e) =>
                  setAdvanceAmountInput(e.target.value.replace(/^0+(?=\d)/, ""))
                }
              />
            </div>

            {/* Payment method selection */}
            {numericValue > 0 && (
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods?.map((method: any) => (
                      <SelectItem key={method._id} value={method._id}>
                        {method.type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex justify-end gap-2 pt-2">
              <DialogClose asChild>
                <Button
                  variant="outline"
                  onClick={() => {
                    setAdvanceAmountInput(
                      savedAmount > 0 ? savedAmount.toString() : ""
                    );
                    setPaymentMethod(paymentMethod);
                  }}
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button onClick={handleSave} disabled={numericValue > 0 && !paymentMethod}>
                {getButtonLabel()}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Display saved amount */}
      {savedAmount > 0 && (
        <div className="flex items-center gap-1 font-medium text-blue-700">
          <Dirham size={12} />
          <span>{savedAmount}</span>
        </div>
      )}
    </div>
  );
};

export default InvoiceAdvanceAmount;
