import React, { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, CalendarIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CustomerSelect from "./InvoiceCustomerSelect";
import DiscountPopup from "./InvoiceDiscount";
import GSTInput from "./InvoiceAmountInput";
import AmountInput from "./InvoiceAmountInput";
import RoundingOff from "./InvoiceRoundingOff";
import { toast } from "sonner";
import InvoiceAdvanceAmount from "./InvoiceAdvanceAmount";

interface InvoiceItem {
  id: string;
  name: string;
  price: number;
  quantity: string;
}

interface InvoiceFormProps {
  selectedCustomer: {
    phone: any;
    id: string;
    name: string;
  };
  onCreateInvoice: any;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({
  selectedCustomer,
  onCreateInvoice,
}) => {
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([
    { id: Date.now().toString(), name: "", quantity: "", price: null },
  ]);
  const [discount, setDiscount] = useState(0);
  const [taxRate, setTaxRate] = useState(9);
  const [additionalAmount, setAdditionalAmount] = useState(0);
  const [invoiceDate, setInvoiceDate] = useState<Date>(new Date());
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [finalTotal, setFinalTotal] = useState(0);
  const [advanceAmount, setAdvanceAmount] = useState(0);

  // Add new item
  const handleAddItem = () => {
    setInvoiceItems([
      ...invoiceItems,
      { id: Date.now().toString(), name: "", quantity: "", price: null },
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
  const discountedPrice = subtotal - discount;
  const totalBeforeRounding = discountedPrice + taxAmount + additionalAmount;
  const roundingOff = Math.round(totalBeforeRounding) - totalBeforeRounding;
  const total = Math.round(totalBeforeRounding);

  useMemo(() => {
    const calcTotal =
      subtotal -
      discount +
      (subtotal * taxRate) / 100 +
      additionalAmount +
      advanceAmount;
    setFinalTotal(Math.round(calcTotal));
  }, [subtotal, discount, taxRate, additionalAmount, advanceAmount]);

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
      customerName: selectedCustomer.name,
      customerPhone: selectedCustomer.phone,
      date: invoiceDate,
      items: invoiceItems,
      subtotal,
      tax: taxAmount,
      discount,
      additionalAmount,
      roundingOff,
      total: finalTotal,
      paymentMethod,
      status: "paid",
      notes: "",
    };

    onCreateInvoice(newInvoice);
  };
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 ">
      {/* Left Column: Customer & Items */}
      <div className="space-y-4  p-4 shadow-xl">
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

        <Card>
          <CardHeader className="flex flex-row justify-between items-center ">
            <CardTitle className="text-lg">
              Items ({invoiceItems.length})
            </CardTitle>
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
                {/* Name Row */}
                <div className="flex justify-between items-center gap-4">
                  <Input
                    placeholder="Item Name"
                    value={item.name}
                    onChange={(e) =>
                      handleItemChange(item.id, "name", e.target.value)
                    }
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

                {/* Quantity & Price Row */}
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Quantity"
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(item.id, "quantity", e.target.value)
                    }
                  />
                  <Input
                    type="number"
                    placeholder="Price"
                    value={item.price === 0 ? "" : item.price}
                    onFocus={(e) => {
                      if (e.target.value === "0") {
                        handleItemChange(item.id, "price", 0);
                      }
                    }}
                    onChange={(e) => {
                      const cleanedValue = e.target.value.replace(
                        /^0+(?=\d)/,
                        ""
                      );
                      handleItemChange(
                        item.id,
                        "price",
                        parseFloat(cleanedValue) || 0
                      );
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
          <CardHeader>
            <CardTitle className="text-lg">Checkout Summary</CardTitle>
            <Separator />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-md font-semibold">
              <span>Subtotal</span>
              <span>₹ {subtotal.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between gap-4">
              <DiscountPopup
                subtotal={subtotal}
                discount={discount}
                setDiscount={setDiscount}
              />
              {discount > 0 && (
                <span className="font-semibold text-red-600 text-md">
                  - ₹ {discount.toFixed(2)}
                </span>
              )}
            </div>
            {/* <AmountInput
              label="Tax Rate (%)"
              value={taxRate}
              setValue={setTaxRate}
              subtotal={subtotal}
              isPercentage={true}
            /> */}
            <div className="flex justify-between text-md font-semibold">
              <span>Tax Rate (%)</span>
              <span>₹ {taxAmount.toFixed(2)}</span>
            </div>
            <AmountInput
              label="Additional Amount"
              value={additionalAmount}
              setValue={setAdditionalAmount}
            />

            <RoundingOff total={finalTotal} setTotal={setFinalTotal} />

            <InvoiceAdvanceAmount
              total={finalTotal}
              onSave={(amount, status) => {
                setAdvanceAmount(amount);
              }}
            />
            <Separator />

            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>₹ {finalTotal}</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none">
          <CardHeader className="pb-4 pt-0 mt-0">
            <CardTitle className="text-md p-0 pt-5">Payment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Separator />
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="upi">UPI</SelectItem>
                <SelectItem value="card">Card</SelectItem>
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
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
            <div className="flex justify-start items-center">
              <Input className="p-0 w-4 h-4 mr-2" type="checkbox" />
              Send invoice via SMS to customer
            </div>
            <Button onClick={handleCreateInvoice} className="w-full">
              Create Invoice
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InvoiceForm;
