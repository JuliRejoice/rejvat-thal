import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Dirham } from "@/components/Svg";
import { toast } from "sonner";

interface InvoiceAdvanceAmountProps {
  total: number;
  onSave: (
    amount: number,
    status: string,
    paymentMethod: string,
    description: string
  ) => void;
  advanceAmount: number;
  advancePaymentMethod?: string;
  paymentMethods?: any;
}

const InvoiceAdvanceAmount: React.FC<InvoiceAdvanceAmountProps> = ({
  total,
  onSave,
  advanceAmount,
  advancePaymentMethod,
  paymentMethods,
}) => {
  const [advanceAmountInput, setAdvanceAmountInput] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>();
  const [description, setDescription] = useState<string>("");
  const [savedAmount, setSavedAmount] = useState<number>(0);

  useEffect(() => {
    if (advanceAmount > 0) {
      setSavedAmount(advanceAmount);
      setAdvanceAmountInput(advanceAmount.toString());
      setPaymentMethod(advancePaymentMethod);
    }
  }, [advanceAmount, advancePaymentMethod]);

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
    onSave(numericValue, status, paymentMethod || "", description);
    toast.success("Advance amount saved!");
  };

  return (
    <div className="flex flex-col gap-3 border p-4 rounded-lg bg-muted/20">
      {/* Top Summary */}
      
      {/* Row 1: Amount + Method */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1 flex-1 min-w-[120px]">
          <Label className="text-xs">Pay Amount</Label>
          <Input
            type="number"
            placeholder="0"
            value={advanceAmountInput}
            onFocus={(e) => {
              if (e.target.value === "0") setAdvanceAmountInput("");
            }}
            onChange={(e) =>
              setAdvanceAmountInput(e.target.value.replace(/^0+(?=\d)/, ""))
            }
          />
        </div>

        <div className="flex flex-col gap-1 flex-1 min-w-[160px]">
          <Label className="text-xs">Payment Method</Label>
          <Select
            value={paymentMethod || undefined}
            onValueChange={(value) => setPaymentMethod(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select method" />
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
      </div>

      {/* Row 2: Description + Save button */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
          <Label className="text-xs">Description</Label>
          <Input
            type="text"
            placeholder="Advance description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <Button
          size="sm"
          className="h-9 mt-1"
          onClick={handleSave}
          disabled={numericValue > 0 && !paymentMethod}
        >
          {getButtonLabel()}
        </Button>
      </div>
      {/* {savedAmount > 0 && (
        <div className="flex items-center gap-1 text-blue-700 text-sm">
          <Dirham size={12} />
          <span>{savedAmount}</span>
          {paymentMethods?.find((m: any) => m._id === paymentMethod)?.type && (
            <span className="px-2 py-0.5 ml-1 rounded-full text-xs font-medium bg-success/10 text-success">
              {paymentMethods?.find((m: any) => m._id === paymentMethod)?.type}
            </span>
          )}
        </div>
      )} */}
  
    </div>
  );
};

export default InvoiceAdvanceAmount;
