import React, { memo, Suspense, useEffect, useMemo, useRef, useState } from "react";
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
import { getCustomer, getCustomerDetails, getCustomerOverview, getCustomerPaymentList, receivePayment, ReceivePaymentPayload } from "@/api/customer.api";
import { Customer, CustomerResponse, GetCustomerParams, InputOrCustomEvent } from "@/types/customer.types";
// import { CustomerForm } from "../admin/CustomerForm";
import { CustomerEditForm } from "@/components/common/CustomerEditForm";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { RestaurantData } from "@/api/restaurant.api";
import { DataTablePagination } from "@/components/common/DataTablePagination";
import lodash from "lodash";
import { NoData } from "../common/NoData";
import { Dirham } from "../Svg";
import { dateFormate, formatDate, getUser } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { updateCustomer } from "@/api/customer.api";
import { toast } from "sonner";
import { Skeleton } from "../ui/skeleton";
import { ReceivePaymentForm } from "./ReceivePaymentForm";

const CustomerDetails = ({ customer, incomeCategories }: { customer: any, incomeCategories: any }) => {
  const [customerDetails, setCustomerDetails] = useState<any>(null);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const queryClient = useQueryClient();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const { mutate: updateCustomerMutation, isPending: isUpdatingCustomer } = useMutation({
    mutationFn: (data: { id: string; data: Partial<Customer> }) =>
      updateCustomer(data.id, data.data as Customer),
    onSuccess: () => {
      toast.success("Customer updated successfully!");
      setIsEditFormOpen(false);
      queryClient.invalidateQueries({ queryKey: ["get-customer-details", customer?._id] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update customer.");
    },
  });

  const handleUpdateCustomer = (formData: any) => {
    if (!customerDetails?._id) return;
    updateCustomerMutation({
      id: customerDetails._id,
      data: formData
    });
  };

  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);

  const { totalIncome, totalDeductions } = useMemo(() => {
    return paymentHistory.reduce(
      (totals, { type, amount }) => {
        if (type === "income") totals.totalIncome += amount || 0;
        else totals.totalDeductions += amount || 0;
        return totals;
      },
      { totalIncome: 0, totalDeductions: 0 }
    );
  }, [paymentHistory])

  // Fetch selected customer details
  const { data: customerDetailsData, isPending: isCustomerDetailsPending, refetch: refetchCustomerDetails } = useQuery({
    queryKey: ["get-customer-details", customer?._id],
    queryFn: () => getCustomerDetails(customer._id),
    enabled: !!customer?._id,
  });

  // Fetch payment history with refetch capability
  const {
    data: paymentData,
    isPending: isPaymentHistoryLoading,
    refetch: refetchPaymentHistory
  } = useQuery({
    queryKey: ["get-customer-payments", customer?._id],
    queryFn: () => getCustomerPaymentList(customer._id, {
      methodId: customer.paymentMethod?._id || "",
      page: 1,
      limit: 100
    }),
    enabled: !!customer?._id
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
    if (paymentData) {
      setPaymentHistory(paymentData?.payload?.payment || []);
    }
  }, [customerDetailsData, paymentData]);


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
              {isCustomerDetailsPending ? (
                // Shimmer effect while loading
                <>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <Skeleton className="h-4 w-64" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Skeleton className="h-5 w-24 mb-1" />
                      <Skeleton className="h-4 w-36" />
                    </div>
                    <div>
                      <Skeleton className="h-5 w-20 mb-1" />
                      <Skeleton className="h-4 w-40" />
                    </div>
                    <div className="flex items-center">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-5 w-20 ml-2" />
                    </div>
                  </div>
                </>
              ) : (
                // Actual content when loaded
                <>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{customerDetails?.phone || 'N/A'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{customerDetails?.email || 'N/A'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{customerDetails?.address || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <p>
                      <span className="font-medium">Reference:</span> {customerDetails?.referenceName || 'Not available'}
                    </p>
                    <p>
                      <span className="font-medium">Joined:</span> {customerDetails?.createdAt ? dateFormate(customerDetails.createdAt) : 'N/A'}
                    </p>
                    <p>
                      <span className="font-medium">Customer Status:</span>
                      <Badge variant={customerDetails?.isActive ? 'default' : 'destructive'} className="ml-2">
                        {customerDetails?.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tiffin Tab */}
        <TabsContent value="tiffin" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Current Tiffin Plan</CardTitle>
            </CardHeader>
            {isCustomerDetailsPending ? (
              // Shimmer effect for tiffin info
              <CardContent>
                <div className="space-y-4">
                  {/* Table header shimmer */}
                  <div className="grid grid-cols-5 gap-4 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-4 w-full" />
                    ))}
                  </div>

                  {/* Table rows */}
                  {['breakfast', 'lunch', 'dinner'].map((mealType, i) => (
                    <div key={i} className="grid grid-cols-5 gap-4 py-2">
                      <div>
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-3 w-16 mt-1" />
                      </div>
                      <Skeleton className="h-4 w-8 self-center" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  ))}

                  {/* Summary shimmer */}
                  <div className="mt-6 space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-5 w-40" />
                  </div>
                </div>
              </CardContent>
            ) : customerDetails?.tiffinData ? (
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Meal</TableHead>
                      <TableHead>Meal Quantity</TableHead>
                      <TableHead>Meal Items</TableHead>
                      <TableHead>Addons Items</TableHead>
                      <TableHead>Meal + Addons Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {['breakfast', 'lunch', 'dinner'].map((mealType) => {
                      const meal = customerDetails?.tiffinData?.[mealType];
                      if (!meal?.mealItems) return null;

                      return (
                        <TableRow key={mealType}>
                          <TableCell className="font-medium capitalize">{mealType}</TableCell>
                          <TableCell className="font-medium">{meal.mealQuantity || 1}</TableCell>
                          <TableCell>
                            {meal.mealItems?.map((item, i) => (
                              <div key={i}>
                                {item.quantity > 1 && `${item.quantity}x `}
                                {item.menuDetail?.name}
                                {item.price > 0 && `(₹${item.price})`}
                              </div>
                            ))}
                          </TableCell>
                          <TableCell>
                            {meal.addOnItems?.length > 0 ? (
                              meal.addOnItems.map((addon, i) => (
                                <div key={i}>
                                  {addon.quantity > 1 && `${addon.quantity}x `}
                                  {addon.menuDetail?.name}
                                  {addon.price > 0 && ` (₹${addon.price} each)`}
                                </div>
                              ))
                            ) : (
                              'None'
                            )}
                          </TableCell>
                          <TableCell>
                            ₹{meal.mealFinalPrice || 0}
                            {meal.deliveryCharge > 0 && (
                              <div className="text-xs text-muted-foreground">
                                (Includes delivery: ₹{meal.deliveryCharge})
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                  <p>
                    <span className="font-medium">Tiffin Price:</span> ₹{customerDetails?.tiffinData?.tiffinTotalPrice}/-
                  </p>
                  <p>
                    <span className="font-medium">Delivery Included: </span>
                    <Badge variant={customerDetails?.tiffinData?.deliveryIncluded ? "default" : "outline"}>
                      {customerDetails?.tiffinData?.deliveryIncluded ? "Yes" : "No"}
                    </Badge>
                  </p>
                </div>
              </CardContent>
            ) : (
              <CardContent>
                <p className="text-center text-muted-foreground">No tiffin plan found</p>
              </CardContent>
            )}
          </Card>
        </TabsContent>

        {/* Payment Tab */}
        <TabsContent value="payment" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Payment History</CardTitle>
                <div className="text-right">
                  {isPaymentHistoryLoading ? (
                    <Skeleton className="h-4 w-24 mb-2" />
                  ) : (
                    <>
                      <p className="text-sm font-medium text-success">Total Paid: ₹{totalIncome.toFixed(2)}</p>
                      <p className="text-sm font-medium text-danger">Pending Due: ₹{customerDetails?.wallet < 0 ? Math.abs(customerDetails?.wallet).toFixed(2) : '0.00'}</p>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {
                  isPaymentHistoryLoading ? (
                    // Loader skeletons
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full rounded-lg" />
                      ))}
                    </div>
                  ) :
                    paymentHistory.length > 0 ? (
                      paymentHistory.map((payment, index) => {
                        const incomeCategory = incomeCategories.find((category: any) => category._id === payment.incomeCategoryId);
                        return (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className={`p-2 rounded-lg ${payment.type === "income" ? "bg-metrics-income/10 text-metrics-income" : "bg-metrics-expense/10 text-metrics-expense"}`}>
                                <DollarSign className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="font-medium">{incomeCategory?.name || "N/A"}</p>
                                <p className="text-sm text-muted-foreground">
                                  {formatDate(payment.date, 'iso')} • {payment.method?.type}
                                </p>
                              </div>
                            </div>
                            <div className={`font-semibold ${payment.type === "income" ? "text-metrics-income" : "text-metrics-expense"}`}>
                              {payment.type === "income" ? "+" : "-"}₹{payment.amount}
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <p className="text-center text-muted-foreground">No payment history available</p>
                    )}
              </div>
              {!isPaymentHistoryLoading && customerDetails?.wallet < 0 && (
                <div className="mt-4">
                  <Button
                    className="w-full bg-gradient-primary"
                    onClick={() => setIsPaymentModalOpen(true)}
                  >

                    <DollarSign className="mr-2 h-4 w-4" />
                    Receive Due Payment

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

                {!isPaymentHistoryLoading && customerDetails?.wallet < 0 && <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => setIsPaymentModalOpen(true)}
                >
                  <DollarSign className="mr-2 h-4 w-4" />
                  Update Payment
                </Button>}
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => setIsEditFormOpen(true)}
                >
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

      {/* Edit Customer Dialog */}
      {customerDetails && (
        <CustomerEditForm
          open={isEditFormOpen}
          onClose={() => setIsEditFormOpen(false)}
          initialData={customerDetails}
          onSuccess={() => {
            // Refresh the customer details after successful update
            queryClient.invalidateQueries({ queryKey: ["get-customer-details", customer?._id] });
            queryClient.invalidateQueries({ queryKey: ["customers"] });
          }}
        />
      )}
      {customerDetails && (
        <ReceivePaymentForm
          open={isPaymentModalOpen}
          onOpenChange={setIsPaymentModalOpen}
          customerId={customerDetails?._id}
          customerName={customerDetails?.name}
          refetchCustomerData={refetchCustomerDetails}
          refetchPaymentHistory={refetchPaymentHistory}
        />
      )}
    </>
  );
};

export default memo(CustomerDetails);
