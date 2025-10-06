import React, { memo, Suspense, useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, Search, Eye, Edit, MapPin, Phone, Mail, Calendar, DollarSign, Package, Clock, CheckCircle, XCircle, Pause, Play, User, Loader2 } from "lucide-react";
import { getCustomer, getCustomerDetails, getCustomerOverview, updateCustomer } from "@/api/customer.api";
import { Customer, CustomerResponse, GetCustomerParams, InputOrCustomEvent } from "@/types/customer.types";
// import { CustomerForm } from "../admin/CustomerForm";
import { CustomerForm } from "@/components/common/CustomerForm";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { RestaurantData } from "@/api/restaurant.api";
import { DataTablePagination } from "@/components/common/DataTablePagination";
import lodash from "lodash";
import { NoData } from "../common/NoData";
import { Dirham } from "../Svg";
import { dateFormate, getUser } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const CustomerDetails = ({ customer }: { customer: any }) => {
  console.log(customer.name, "------------------------------@");
  const [customerDetails, setCustomerDetails] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const paymentHistory = [
    { date: "2024-11-25", amount: 2500, type: "credit", method: "UPI", description: "Monthly plan payment" },
    { date: "2024-11-20", amount: 500, type: "debit", method: "Cash", description: "Delivery charges" },
    { date: "2024-11-15", amount: 1200, type: "credit", method: "Card", description: "Advance payment" },
    { date: "2024-11-10", amount: 300, type: "debit", method: "UPI", description: "Extra items" },
  ];

  const tiffinInfo = [
    { meal: "Breakfast", items: "2 Paratha, Sabji, Pickle", price: 80, days: "Mon-Sat" },
    { meal: "Lunch", items: "4 Roti, 2 Sabji, Dal, Rice, Salad", price: 150, days: "Mon-Sun" },
    { meal: "Dinner", items: "3 Roti, Sabji, Dal, Pickle", price: 120, days: "Mon-Sat" },
  ];

  const queryClient = useQueryClient();

  // Fetch selected customer details
  const { data: customerDetailsData, isPending: isCustomerDetailsPending } = useQuery({
    queryKey: [
      "get-customer-details",
      customer?._id,
      //   Boolean(isViewModalOpen),
    ],
    queryFn: () => getCustomerDetails(customer._id),
    // enabled: Boolean(isViewModalOpen && customer && customer._id),
  });

  // const { mutate: updateCustomerMutation, isPending: isUpdatingCustomer } = useMutation({
  //   mutationFn: updateCustomer,
  //   onSuccess: () => {
  //     toast.success("Customer updated successfully!");
  //     setIsEditDialogOpen(false);
  //     queryClient.invalidateQueries({ queryKey: ["get-customer-details", customer?._id] });
  //     queryClient.invalidateQueries({ queryKey: ["customers"] });
  //   },
  //   onError: (error: any) => {
  //     toast.error(error.message || "Failed to update customer.");
  //   },
  // });

  // const handleUpdateCustomer = (formData: Partial<Customer>) => {
  //   if (!customerDetails?._id) return;
  //   updateCustomerMutation({ id: customerDetails._id, data: formData });
  // };

  useEffect(() => {
    if (customerDetailsData) {
      setCustomerDetails(customerDetailsData.payload);
    }
  }, [customerDetailsData]);

  return (
    <>
      {/* <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto"> */}
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          {lodash.capitalize(customerDetails?.name ?? "")} - Customer Details
        </DialogTitle>
        <DialogDescription>Complete customer information, tiffin details, and payment history</DialogDescription>
      </DialogHeader>

      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="info">Customer Info</TabsTrigger>
          <TabsTrigger value="tiffin">Tiffin Info</TabsTrigger>
          <TabsTrigger value="payment">Payment History</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
        </TabsList>

        {/* Customer Info Tab */}
        <TabsContent value="info" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{customerDetails?.phone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{customerDetails?.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{customerDetails?.address}</span>
                </div>
              </div>
              <div className="space-y-3">
                <p>
                  <span className="font-medium">Reference:</span> {customerDetails?.referenceName ?? "Not available"}
                </p>
                <p>
                  <span className="font-medium">Joined:</span> {customerDetails?.createdAt ? dateFormate(customerDetails?.createdAt) : ""}
                </p>
                {/* <p>
                  <span className="font-medium">Total Orders:</span> {customer?.totalOrders}
                </p> */}
                <p>
                  <span className="font-medium">Customer Status:</span>
                  <Badge variant={customerDetails?.isActive == true ? "default" : "destructive"} className="ml-2">
                    {customerDetails?.isActive ? "Active" : "Inactive"}
                  </Badge>
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tiffin Tab */}
        <TabsContent value="tiffin" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Current Tiffin Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Meal</TableHead>
                    <TableHead>Meal Quantity</TableHead>
                    <TableHead>Meal Items</TableHead>
                    <TableHead>Addons Items</TableHead>
                    <TableHead>Meal + Addons Price</TableHead>
                    {/* <TableHead>Days</TableHead> */}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* {tiffinInfo.map((meal, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{meal.meal}</TableCell>
                      <TableCell>{meal.items}</TableCell>
                      <TableCell>₹{meal.price}</TableCell>
                      <TableCell>{meal.days}</TableCell>
                    </TableRow>
                  ))} */}
                  {customerDetails?.tiffinData?.breakfast && (
                    <TableRow>
                      <TableCell className="font-medium">{customerDetails?.tiffinData?.breakfast?.mealMenu?.name ?? ""}</TableCell>
                      <TableCell className="font-medium">{customerDetails?.tiffinData?.breakfast?.mealQuantity ?? ""} nos</TableCell>
                      <TableCell>{customerDetails?.tiffinData?.breakfast?.mealMenu?.breakfastMealIteams?.map((item) => item?.name).join(", ")}</TableCell>
                      <TableCell>{customerDetails?.tiffinData?.breakfast?.addOnItems?.map((item) => `${item?.menuDetail?.name} (x${item?.quantity})`).join(", ")}</TableCell>
                      <TableCell>₹{(customerDetails?.tiffinData?.breakfast?.mealPrice ?? 0) + customerDetails?.tiffinData?.breakfast?.addOnItems?.reduce((total, item) => total + (item?.price ?? 0) * item?.quantity, 0)}</TableCell>
                    </TableRow>
                  )}
                  {customerDetails?.tiffinData?.lunch && (
                    <TableRow>
                      <TableCell className="font-medium">{customerDetails?.tiffinData?.lunch?.mealMenu?.name ?? ""}</TableCell>
                      <TableCell className="font-medium">{customerDetails?.tiffinData?.lunch?.mealQuantity ?? ""} nos</TableCell>
                      <TableCell>{customerDetails?.tiffinData?.lunch?.mealMenu?.lunchMealIteams?.map((item) => item?.name).join(", ")}</TableCell>
                      <TableCell>{customerDetails?.tiffinData?.lunch?.addOnItems?.map((item) => `${item?.menuDetail?.name} (${item?.quantity})`).join(", ")}</TableCell>
                      <TableCell>₹{(customerDetails?.tiffinData?.lunch?.mealPrice ?? 0) + customerDetails?.tiffinData?.lunch?.addOnItems?.reduce((total, item) => total + (item?.price ?? 0) * item?.quantity, 0)}</TableCell>
                    </TableRow>
                  )}
                  {customerDetails?.tiffinData?.dinner && (
                    <TableRow>
                      <TableCell className="font-medium">{customerDetails?.tiffinData?.dinner?.mealMenu?.name ?? ""}</TableCell>
                      <TableCell className="font-medium">{customerDetails?.tiffinData?.dinner?.mealQuantity ?? ""} nos</TableCell>
                      <TableCell>{customerDetails?.tiffinData?.dinner?.mealMenu?.dinnerMealIteams?.map((item) => item?.name).join(", ")}</TableCell>
                      <TableCell>{customerDetails?.tiffinData?.dinner?.addOnItems?.map((item) => `${item?.menuDetail?.name} (${item?.quantity})`).join(", ")}</TableCell>
                      <TableCell>₹{(customerDetails?.tiffinData?.dinner?.mealPrice ?? 0) + customerDetails?.tiffinData?.dinner?.addOnItems?.reduce((total, item) => total + (item?.price ?? 0) * item?.quantity, 0)}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                <p>
                  <span className="font-medium">Tiffin Price:</span> ₹{customerDetails?.tiffinData?.totalPrice}/-
                </p>
                <p>
                  <span className="font-medium">Delivery Included: </span> <Badge variant={customerDetails?.tiffinData?.deliveryIncluded ? "default" : "outline"}>{customerDetails?.tiffinData?.deliveryIncluded ? "Yes" : "No"}</Badge>
                </p>
                {/* <p>
                  <span className="font-medium">Next Delivery:</span> {customerDetails?.nextDelivery}
                </p> */}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Tab */}
        <TabsContent value="payment" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Payment History</CardTitle>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total Paid: ₹{customerDetails?.totalPaid}</p>
                  <p className="text-sm font-medium text-danger">Pending Due: ₹{customerDetails?.pendingDue}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {paymentHistory.map((payment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${payment.type === "credit" ? "bg-metrics-income/10 text-metrics-income" : "bg-metrics-expense/10 text-metrics-expense"}`}>
                        <DollarSign className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">{payment.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {payment.date} • {payment.method}
                        </p>
                      </div>
                    </div>
                    <div className={`font-semibold ${payment.type === "credit" ? "text-metrics-income" : "text-metrics-expense"}`}>
                      {payment.type === "credit" ? "+" : "-"}₹{payment.amount}
                    </div>
                  </div>
                ))}
              </div>
              {customerDetails?.pendingDue > 0 && (
                <div className="mt-4">
                  <Button className="w-full bg-gradient-primary">
                    <DollarSign className="mr-2 h-4 w-4" />
                    Receive Due Payment - ₹{customerDetails?.pendingDue}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Action Tab */}
        <TabsContent value="actions" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="mr-2 h-4 w-4" />
                  Mark Pause Dates
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Package className="mr-2 h-4 w-4" />
                  Add/Edit Tiffin Plan
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <DollarSign className="mr-2 h-4 w-4" />
                  Update Payment
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Customer Info
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Status Control</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {customerDetails?.status === "active" ? (
                  <Button variant="destructive" className="w-full">
                    <Pause className="mr-2 h-4 w-4" />
                    Pause Service
                  </Button>
                ) : (
                  <Button variant="success" className="w-full">
                    <Play className="mr-2 h-4 w-4" />
                    Resume Service
                  </Button>
                )}
                <Button variant="outline" className="w-full">
                  <XCircle className="mr-2 h-4 w-4" />
                  Deactivate Customer
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      {/* </DialogContent> */}
    </>
  );
};
export default memo(CustomerDetails);
