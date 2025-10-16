import React, { useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import CustomerSelect from "./InvoiceCustomerSelect";
import InvoiceForm from "./InvoiceForm";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { X } from "lucide-react";
import { getCustomer } from '@/api/customer.api';
import { useQuery } from '@tanstack/react-query';
import { Dialog } from "@radix-ui/react-dialog";


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
  paymentMethods,
  incomeCategories,
  isSubmitting,
  thresholdAmount,
}: {
  onClose: () => void;
  onCreateInvoice: (invoice: any) => void;
  paymentMethods: any;
  incomeCategories: any;
  isSubmitting: boolean;
  thresholdAmount: any;
}) => {
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: customersData, isLoading: isLoadingCustomers, refetch: refetchCustomersList } = useQuery({
    queryKey: ['customers', searchQuery],
    queryFn: () => getCustomer({ searchTerm: searchQuery, page: 1, limit: 100, isActive: "true" }),
  });
  const customers = customersData?.payload?.customer || [];

  console.log(selectedCustomer, "selectedCustomer1111");

  return (
    
    <Dialog>
    <div className="fixed bg-white inset-x-0 inset-y-0 z-50 ">
      <div className="w-full  overflow-y-auto p-6 relative">
        <div className="flex items-center gap-6 pb-6 mb-6 border-b border-gray-200">
          <Button variant="outline" onClick={onClose} className="">
            <X className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Add New Invoice</h1>
        </div>
          {!selectedCustomer ? (
          <div className="max-w-2xl mx-auto">
            <CustomerSelect
              customers={customers}
              onSelectCustomer={(c) => setSelectedCustomer(c)}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              isLoadingCustomers={isLoadingCustomers}
            />
          </div>
        ) : (
          <div className="max-w-5xl mx-auto">
            <InvoiceForm
              selectedCustomer={selectedCustomer}
              onCreateInvoice={onCreateInvoice}
              paymentMethods={paymentMethods}
              incomeCategories={incomeCategories}
              isSubmitting={isSubmitting}
              thresholdAmount={thresholdAmount}
            />
          </div>
        )}
    </div>
    </div>
    </Dialog>
  );
};

export default AddInvoiceModal;
