import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Dirham } from "@/components/Svg";

interface DiscountPopupProps {
  subtotal: number;
  discount: number;
  setDiscount: (value: number) => void;
  onSave: (discount: number, type: string, value: number) => void;
  discountType: string;
  setDiscountType: (value: string) => void;
  discountValue: number;
  setDiscountValue: (value: number) => void;

}

const DiscountPopup: React.FC<DiscountPopupProps> = ({
  subtotal,
  discount,
  setDiscount,
  onSave,
  discountType,
  setDiscountType,
  discountValue,
  setDiscountValue,
}) => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("rupees");
  const [inputValue, setInputValue] = useState<string>("");

  const handleApplyDiscount = () => {
    const numericValue = parseFloat(inputValue) || 0;

    let calculatedDiscount = 0;
    if (activeTab === "percent") {
      calculatedDiscount = (subtotal * numericValue) / 100;
    } else {
      calculatedDiscount = numericValue;
    }

    if (calculatedDiscount > subtotal) {
      toast?.error
        ? toast.error("Discount cannot be greater than total amount")
        : alert("Discount cannot be greater than total amount");
      return;
    }

    setDiscount(calculatedDiscount);
    onSave(calculatedDiscount, activeTab, numericValue);
    setOpen(false);
  };

   useEffect(() => {
      if (discount > 0) {
        setDiscount(discount);
        setInputValue(discountValue.toString());
        setDiscountType(discountType);
      }
    }, [discount, discountType]);

  return (
    <div className="flex items-center">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className="border-none p-0 text-blue-700 hover:bg-transparent hover:text-blue-700 text-md h-6"
      >
        Discount
      </Button>

      <Dialog open={open} onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (isOpen && discount > 0) {
          setInputValue(discountValue.toString());
          setDiscountType(discountType || "rupees");
        }
        if(!isOpen){
          setInputValue(discountValue.toString());
          setActiveTab(discountType || "rupees");
          setDiscountType(discountType || "rupees");
          setOpen(false);
        }
      }}>
        <DialogTrigger asChild></DialogTrigger>

        <DialogContent className="sm:max-w-sm">
          <DialogTitle>Apply Discount</DialogTitle>

          <Tabs
            value={activeTab}
            onValueChange={(value) =>
              setActiveTab(value as "rupees" | "percent")
            }
          >
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="rupees" className="flex items-center gap-1">
                <Dirham size={12} /> Dirhams
              </TabsTrigger>
              <TabsTrigger value="percent">%</TabsTrigger>
            </TabsList>

            {/* Rupees Input */}
            <TabsContent value="rupees">
              <Label>Discount Amount</Label>
              <Input
                type="number"
                value={inputValue}
                placeholder="Enter Cash Discount"
                onFocus={(e) => {
                  if (e.target.value === "0") setInputValue("");
                }}
                onChange={(e) =>
                  setInputValue(e.target.value.replace(/^0+(?=\d)/, ""))
                }
              />
            </TabsContent>

            {/* Percentage Input */}
            <TabsContent value="percent">
              <Label>Discount Percentage (%)</Label>
              <Input
                type="number"
                value={inputValue}
                placeholder="Enter Discount Percentage"
                onFocus={(e) => {
                  if (e.target.value === "0") setInputValue("");
                }}
                onChange={(e) =>
                  setInputValue(e.target.value.replace(/^0+(?=\d)/, ""))
                }
              />
              <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                <span>Will deduct</span>
                <span className="flex items-center gap-0.5 mt-1">
                  <Dirham size={12} />
                  {isNaN(parseFloat(inputValue))
                    ? 0
                    : ((subtotal * parseFloat(inputValue)) / 100).toFixed(2)}
                </span>
              </p>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 mt-4">
            <DialogClose asChild>
              <Button variant="outline" onClick={() => {
                setInputValue(discountValue.toString());
                setActiveTab(discountType || "rupees");
                setDiscountType(discountType || "rupees");
                setOpen(false);
              }}>Cancel</Button>
            </DialogClose>
            <Button onClick={handleApplyDiscount}>Apply</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DiscountPopup;
