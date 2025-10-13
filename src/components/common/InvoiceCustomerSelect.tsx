import React, { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { UserPlus } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
}

interface CustomerSelectProps {
  customers: Customer[];
  onSelectCustomer: (customer: Customer) => void;
}

const CustomerSelect: React.FC<CustomerSelectProps> = ({
  customers,
  onSelectCustomer,
}) => {
  const [customerList, setCustomerList] = useState<Customer[]>(customers);
  const [customerSearch, setCustomerSearch] = useState("");
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  // 🔹 Validation states
  const [errors, setErrors] = useState({
    name: "",
    phone: "",
  });

  const filteredCustomers = useMemo(
    () =>
      customerList.filter(
        (c) =>
          c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
          c.phone.includes(customerSearch)
      ),
    [customerSearch, customerList]
  );

  const handleAddNewCustomer = () => {
    let hasError = false;
    const newErrors = { name: "", phone: "" };

    if (!newCustomer.name.trim()) {
      newErrors.name = "Name is required";
      hasError = true;
    }

    if (!newCustomer.phone.trim()) {
      newErrors.phone = "Phone number is required";
      hasError = true;
    } else if (newCustomer.phone.length < 10) {
      newErrors.phone = "Phone number must be at least 10 digits";
      hasError = true;
    }

    setErrors(newErrors);
    if (hasError) return;

    const createdCustomer: Customer = {
      id: Date.now().toString(),
      ...newCustomer,
    };

    setCustomerList((prev) => [createdCustomer, ...prev]);
    onSelectCustomer(createdCustomer);

    setNewCustomer({ name: "", phone: "", email: "", address: "" });
    setErrors({ name: "", phone: "" });
  };

  return (
    <div className="flex flex-col justify-between space-y-4 h-full">
      {/* Search */}
      <div className="space-y-2">
        <Label>Search Customer</Label>
        <Input
          placeholder="Search by name or phone..."
          value={customerSearch}
          onChange={(e) => setCustomerSearch(e.target.value)}
        />

        {/* List */}
        {filteredCustomers.length > 0 ? (
          <div className="max-h-64 overflow-y-auto border rounded-lg">
            <div className="divide-y">
              {filteredCustomers.map((customer) => (
                <button
                  key={customer.id}
                  onClick={() => onSelectCustomer(customer)}
                  className="w-full p-4 text-left hover:bg-accent transition-colors"
                >
                  <div className="font-medium">{customer.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {customer.phone}
                  </div>
                  {customer.email && (
                    <div className="text-sm text-muted-foreground">
                      {customer.email}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground border rounded-lg">
            No customers found
          </div>
        )}
      </div>

      {/* Add Customer Dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="w-full gap-2 text-blue-600 bg-sky-600/10 border-blue-500 hover:bg-blue-500 hover:text-white"
          >
            <UserPlus className="h-4 w-4" /> Add New Customer
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-lg">
          <DialogTitle>Add New Customer</DialogTitle>
          <DialogDescription className="space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                value={newCustomer.name}
                onChange={(e) => {
                  setNewCustomer({ ...newCustomer, name: e.target.value });
                  if (errors.name) setErrors({ ...errors, name: "" });
                }}
                placeholder="Enter customer name"
              />
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Phone *</Label>
              <Input
                type="number"
                value={newCustomer.phone}
                onChange={(e) => {
                  setNewCustomer({ ...newCustomer, phone: e.target.value });
                  if (errors.phone) setErrors({ ...errors, phone: "" });
                }}
                placeholder="Enter phone number"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm">{errors.phone}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                value={newCustomer.email}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, email: e.target.value })
                }
                placeholder="Enter email (optional)"
              />
            </div>

            <div className="space-y-2">
              <Label>Address</Label>
              <Input
                value={newCustomer.address}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, address: e.target.value })
                }
                placeholder="Enter address (optional)"
              />
            </div>

            <div className="flex gap-2 mt-4">
              <Button onClick={handleAddNewCustomer} className="flex-1">
                Add Customer & Continue
              </Button>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
            </div>
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerSelect;
