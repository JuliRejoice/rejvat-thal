import React, { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, CalendarIcon, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import DiscountPopup from "./InvoiceDiscount";
import AmountInput from "./InvoiceAmountInput";
import RoundingOff from "./InvoiceRoundingOff";
import InvoiceAdvanceAmount from "./InvoiceAdvanceAmount";
import { toast } from "sonner";
import { Dirham } from "@/components/Svg";
import { useAuth } from "@/contexts/AuthContext";

interface InvoiceItem {
  id: string;
  name: string;
  price: number;
  qty: string;
}

interface InvoiceFormProps {
  selectedCustomer: {
    phone: any;
    _id: string;
    name: string;
    address: string;
    area: string;
    areaId: string;
    createdAt: string;
    email: string;
    isActive: boolean;
    profileImage: string;
    restaurantId: string;
    updatedAt: string;
    wallet: number;
  };
  onCreateInvoice: any;
  paymentMethods: any;
  incomeCategories: any;
  isSubmitting: boolean;
  thresholdAmount: any;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({
  selectedCustomer,
  onCreateInvoice,
  paymentMethods,
  incomeCategories,
  isSubmitting,
  thresholdAmount,
}) => {
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([
    { id: Date.now().toString(), name: "", qty: "", price: null },
  ]);

  const { user } = useAuth();
  const taxPercentage = useMemo(() => {
    return thresholdAmount?.find(
      (item: any) => item.restaurantId?._id === user?.restaurantId?._id
    )?.taxPercentage;
  }, [thresholdAmount]);

  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<string>("percent");
  const [discountValue, setDiscountValue] = useState(0);
  const [taxRate, setTaxRate] = useState(taxPercentage);
  const [additionalAmount, setAdditionalAmount] = useState(0);
  const [invoiceDate, setInvoiceDate] = useState<Date>(new Date());
  const [finalTotal, setFinalTotal] = useState(0);
  const [advanceAmount, setAdvanceAmount] = useState(0);
  const [advancePaymentMethod, setAdvancePaymentMethod] = useState('');
  const [roundingValue, setRoundingValue] = useState(0);
  const [description, setDescription] = useState('');

  // Add new item
  const handleAddItem = () => {
    setInvoiceItems([
      ...invoiceItems,
      { id: Date.now().toString(), name: "", qty: "", price: null },
    ]);
  };

  // Remove item
  const handleRemoveItem = (id: string) => {
    setInvoiceItems(invoiceItems.filter((item) => item.id !== id));
  };

  // Update item
  const handleItemChange = (id: string, key: string, value: any) => {
    setInvoiceItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [key]: value } : item))
    );
  };

  // Calculations
  const subtotal = useMemo(
    () => invoiceItems.reduce((sum, item) => sum + (item.price || 0), 0),
    [invoiceItems]
  );

  const taxAmount = useMemo(
    () => (subtotal * taxRate) / 100,
    [subtotal, taxRate]
  );

  const baseTotal = useMemo(
    () => subtotal - discount + taxAmount + additionalAmount,
    [subtotal, discount, taxAmount, additionalAmount]
  );

  useEffect(() => {
    setFinalTotal(Math.round(baseTotal + roundingValue));
  }, [baseTotal, roundingValue]);

  const dueAmount = useMemo(
    () => finalTotal - advanceAmount,
    [finalTotal, advanceAmount]
  );

  const handleCreateInvoice = () => {
    if (!selectedCustomer) {
      toast.error("Please select a customer");
      return;
    }

    if (invoiceItems.some((item) => !item.name || item.price <= 0)) {
      toast.error("Please fill in all item details");
      return;
    }

    const newInvoice: any = {
      id: Date.now().toString(),
      invoiceNumber: `INV-BSB-25-${String(Date.now()).slice(-4)}`,
      date: invoiceDate,
      items: invoiceItems,
      subTotal: subtotal,
      tax: taxAmount,
      discount,
      additionalAmount,
      roundOffAmount: roundingValue,
      finalAmmount: finalTotal,
      notes: "",
      restaurantId: user?.role === "manager" ? user.restaurantId?._id : null,
      customerId: selectedCustomer._id,
      advancePayment: advanceAmount,
      advanceDescription: description,
    };

    if (advanceAmount === 0) {
      newInvoice.invoiceStatus = "unpaid";
    } else if (advanceAmount > 0 && advanceAmount < finalTotal) {
      newInvoice.invoiceStatus = "part_paid";
    } else if (advanceAmount >= finalTotal) {
      newInvoice.invoiceStatus = "paid";
    }

    if (advanceAmount > 0) {
      newInvoice.method = advancePaymentMethod;
    }

    onCreateInvoice(newInvoice);
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-2 gap-6 ">
      {/* Left Column: Customer & Items */}
      <div className="space-y-4  p-4 shadow-xl">
        {/* Selected Customer */}
        <div className="border p-4 rounded-lg">
          <div className="flex flex-col gap-3">
            <span className="font-semibold">Selected Customer</span>
            <div className="flex  items-center gap-2">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-500 text-white font-bold text-lg">
                {selectedCustomer.name.charAt(0).toUpperCase()}
              </div>

              <div className="flex ">
                <div className="flex flex-col">
                  <span>{selectedCustomer.name}</span>
                  <span>{selectedCustomer.phone}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Items Card */}
        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle className="text-lg">Items ({invoiceItems.length})</CardTitle>
            <Button
              onClick={handleAddItem}
              size="sm"
              variant="outline"
              className="gap-1 h-8 text-xs"
            >
              <Plus className="h-3 w-3" /> Add
            </Button>
          </CardHeader>
          <CardContent className="space-y-3 overflow-y-auto h-[500px] scrollbar-hide">
            {invoiceItems.map((item) => (
              <div
                key={item.id}
                className="p-3 border rounded-lg bg-muted/30 space-y-2"
              >
                <div className="flex justify-between items-center gap-4">
                  <Input
                    placeholder="Item Name"
                    value={item.name}
                    onChange={(e) => handleItemChange(item.id, "name", e.target.value)}
                  />
                  {invoiceItems.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveItem(item.id)}
                      className="border border-red-400 bg-red-400/5 hover:bg-red-400/20"
                    >
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </Button>
                  )}
                </div>

                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Quantity"
                    value={item.qty || ""}
                    onChange={(e) => handleItemChange(item.id, "qty", e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Price"
                    value={item.price === 0 ? "" : item.price}
                    onChange={(e) => {
                      const cleanedValue = e.target.value.replace(/^0+(?=\d)/, "");
                      handleItemChange(item.id, "price", parseFloat(cleanedValue) || 0);
                    }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Checkout & Payment */}
      <div className="flex flex-col justify-between space-y-4 p-4 shadow-xl">
        <Card className="border-none">
          <CardHeader className="p-4">
            <div className="flex justify-between items-center w-full">
              <CardTitle className="text-lg m-0">Checkout Summary</CardTitle>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {invoiceDate.toDateString()}
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <DatePicker
                    selected={invoiceDate}
                    onChange={(date: Date) => setInvoiceDate(date)}
                    inline
                  />
                </PopoverContent>
              </Popover>
            </div>
            <Separator className="mt-4" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-md font-semibold">
              <span>Subtotal</span>
              <div className="flex items-center gap-1">
                <Dirham size={12} />
                <span>{subtotal.toFixed(2)}</span>
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between gap-4">
              <DiscountPopup
                subtotal={subtotal}
                discount={discount}
                setDiscount={setDiscount}
                discountType={discountType}
                setDiscountType={setDiscountType}
                discountValue={discountValue}
                setDiscountValue={setDiscountValue}
                onSave={(discount, type, value) => {
                  setDiscount(discount);
                  setDiscountType(type);
                  setDiscountValue(value);
                }}
              />
              {discount > 0 && (
                <div className="flex items-center gap-1 font-semibold text-red-600 text-md">
                  <span>-</span>
                  <Dirham size={12} />
                  <span>{discount.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between text-md font-semibold">
              <span>Tax Rate (%)</span>
              <div className="flex items-center gap-1">
                <Dirham size={12} />
                <span>{taxAmount.toFixed(2)}</span>
              </div>
            </div>

            <AmountInput
              label="Additional Amount"
              value={additionalAmount}
              setValue={setAdditionalAmount}
              onSave={(amount) => setAdditionalAmount(amount)}
            />

            <RoundingOff
              baseTotal={baseTotal}
              roundingValue={roundingValue}
              setRoundingValue={setRoundingValue}
              total={finalTotal}
            />


            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <div className="flex items-center gap-1">
                <Dirham size={14} />
                <span>{finalTotal}</span>
              </div>
            </div>
            
          </CardContent>
        </Card>

        <Card className="border-none">
          <CardContent className="space-y-4">
            <InvoiceAdvanceAmount
              total={finalTotal}
              advanceAmount={advanceAmount}
              advancePaymentMethod={advancePaymentMethod}
              onSave={(amount, status, paymentMethod, description) => {
                setAdvanceAmount(amount);
                setAdvancePaymentMethod(paymentMethod);
                setDescription(description);
              }}
              paymentMethods={paymentMethods}
            />

            {dueAmount > 0 && (
              <div className="flex justify-between text-md font-semibold text-red-600">
                <span>Due Amount</span>
                <div className="flex items-center gap-1">
                  <Dirham size={12} />
                  <span>{dueAmount.toFixed(2)}</span>
                </div>
              </div>
            )}
            <Separator />
            <Button
              onClick={handleCreateInvoice}
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Invoice"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InvoiceForm;
