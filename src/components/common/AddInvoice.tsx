import React, { useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import CustomerSelect from "./InvoiceCustomerSelect";
import InvoiceForm from "./InvoiceForm";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { X } from "lucide-react";

interface InvoiceItem {
  id: string;
  name: string;
  price: number;
  type: "service" | "product";
  provider?: string;
  quantity?: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerPhone?: string;
  date: Date;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  discount: number;
  additionalAmount: number;
  roundingOff: number;
  total: number;
  paymentMethod: string;
  status: string;
  notes?: string;
}

const AddInvoiceModal = ({
  onClose,
  onCreateInvoice,
}: {
  onClose: () => void;
  onCreateInvoice: (invoice: any) => void;
}) => {
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  const customers = [
    { id: "1", name: "John Doe", phone: "1234567890", email: "john@test.com" },
    { id: "2", name: "Jane Smith", phone: "9876543210" },
  ];

  return (
    <div className="fixed bg-white inset-x-0 inset-y-0 z-50 ">
      <div className="  w-full  overflow-y-auto p-6 relative">
        <div className="flex items-center gap-6 pb-6 mb-6 border-b border-gray-200">
          <Button variant="outline" onClick={onClose} className="">
            <X className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Add New Invoice</h1>
        </div>
        <div className="max-w-5xl mx-auto">
          {!selectedCustomer ? (
            <CustomerSelect
              customers={customers}
              onSelectCustomer={(c) => setSelectedCustomer(c)}
            />
          ) : (
            <InvoiceForm
              selectedCustomer={selectedCustomer}
              onCreateInvoice={onCreateInvoice}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AddInvoiceModal;
