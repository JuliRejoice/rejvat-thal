import {
  createVendor,
  getAllVendors,
  updateVendor,
  updateVendorStatus,
} from "@/api/vendor.api";
import { ConfirmationDialog } from "@/components/common/ConfirmationDialog";
import { DataTablePagination } from "@/components/common/DataTablePagination";
import { NoData } from "@/components/common/NoData";
import { Dirham } from "@/components/Svg";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Edit2,
  Eye,
  Filter,
  IndianRupee,
  Mail,
  Phone,
  Plus,
  Search,
  UserCheck,
  UserX,
  Users,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { VendorAddForm } from "./VendorAddForm";
import {
  VendorStatsCardsSkeleton,
  VendorTableSkeleton,
} from "./VendorSkeleton";

const VendorManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [vendorToUpdate, setVendorToUpdate] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const queryParams = {
    page,
    limit: itemsPerPage,
    search: searchTerm,
    ...(filterStatus !== "all" && { isActive: filterStatus === "active" }),
  };

  const {
    data: allVendors,
    isPending,
    refetch,
  } = useQuery({
    queryKey: ["get-all-vendors", queryParams],
    queryFn: () => getAllVendors(queryParams),
  });

  const vendors = allVendors?.payload?.data;
  const totalItems = allVendors?.payload?.count || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const { mutate: addVendor, isPending: isVendorAddPending } = useMutation({
    mutationKey: ["create-vendor"],
    mutationFn: createVendor,
    onSuccess: () => {
      toast({
        variant: "default",
        title: `Create Vendor`,
        description: `Created Vendor successfully`,
      });
      setIsAddModalOpen(false);
      refetch();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: `Vendor Creation failed`,
        description: `Create vendor failed. Try again later`,
      });
      console.error("Error creating vendor:", error);
    },
  });

  const { mutate: editVendor, isPending: isVendorUpdatePending } = useMutation({
    mutationKey: ["update-vendor"],
    mutationFn: ({ payload, id }: { payload: any; id: string | number }) =>
      updateVendor(payload, id),
    onSuccess: () => {
      toast({
        variant: "default",
        title: `Update Vendor`,
        description: `Updated Vendor successfully`,
      });
      setIsAddModalOpen(false);
      setEditingVendor(null);
      refetch()
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: `Vendor Update failed`,
        description: `Update vendor failed. Try again later`,
      });
      console.error("Error updating vendor:", error);
    },
  });

  const { mutate: updateStatus, isPending: isStatusUpdatePending } =
    useMutation({
      mutationKey: ["update-status-vendor"],
      mutationFn: ({ isActive, id }: any) => updateVendorStatus(isActive, id),
      onSuccess: () => {
        toast({
          variant: "default",
          title: "Updated the vendor status",
          description: "Updated the vendor status successfully.",
        });
        setIsConfirmOpen(false);
        refetch();
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Vendor status updation failed",
          description: "Unable to update vendor status. Please try again.",
        });
        console.error("Error creating vendor:", error);
      },
    });

  const addSubmit = (data: any) => {
    if (editingVendor?._id) {
      editVendor({ payload: data, id: editingVendor._id });
    } else {
      addVendor(data);
    }
  };

  const handleConfirmToggle = (vendor: any) => {
    setVendorToUpdate(vendor);
    setIsConfirmOpen(true);
  };

  const handleViewVendor = (vendor) => {
    setSelectedVendor(vendor);
    setIsViewModalOpen(true);
  };

  const handleEditVendor = (vendor) => {
    setEditingVendor(vendor);
    setIsAddModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Vendor Management
          </h1>
          <p className="text-muted-foreground">
            Manage suppliers and track payments
          </p>
        </div>
        <Dialog
          open={isAddModalOpen}
          onOpenChange={(open) => {
            setIsAddModalOpen(open);
            if (open) setEditingVendor(null);
          }}
        >
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Vendor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>
                {editingVendor ? "Edit Vendor" : "Add New Vendor"}
              </DialogTitle>
            </DialogHeader>
            <VendorAddForm
              onSubmit={addSubmit}
              isPending={
                editingVendor ? isVendorUpdatePending : isVendorAddPending
              }
              onCancel={() => {
                setIsAddModalOpen(false);
                setEditingVendor(null);
              }}
              mode={editingVendor ? "edit" : "create"}
              defaultValues={
                editingVendor
                  ? {
                      name: editingVendor.name,
                      contactPerson: editingVendor.contactPerson,
                      phone: editingVendor.phone,
                      email: editingVendor.email,
                      wallet: editingVendor.wallet,
                      description: editingVendor.description,
                      address: editingVendor.address,
                    }
                  : undefined
              }
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      {isPending ? (
        <VendorStatsCardsSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Vendors
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {totalItems || 0}
                  </p>
                </div>
                <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Plus className="h-4 w-4 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Active Vendors
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {allVendors?.payload?.activeVendor || 0}
                  </p>
                </div>
                <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <UserCheck className="h-4 w-4 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Deactive Vendors
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {allVendors?.payload?.deactiveVendor}
                  </p>
                </div>
                <div className="h-8 w-8 bg-amber-100 rounded-lg flex items-center justify-center">
                  <UserX className="h-4 w-4 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Due
                  </p>
                  <p className="text-2xl font-bold text-destructive">
                    {allVendors?.payload?.totalDuoAmount || 0}
                  </p>
                </div>
                <div className="h-8 w-8 bg-destructive/10 rounded-lg flex items-center justify-center">
                  <Dirham className="h-4 w-4 text-destructive" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search vendors..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                  }}
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={filterStatus}
              onValueChange={(value) => {
                setFilterStatus(value);
              }}
            >
              <SelectTrigger className={isMobile ? "w-full" : "w-48"}>
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="deactive">Deactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Vendors Table */}
      <Card>
        <CardHeader>
          <CardTitle>Vendors ({totalItems})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor</TableHead>
                  {!isMobile && <TableHead>Description</TableHead>}
                  {!isMobile && <TableHead>Contact</TableHead>}
                  {!isMobile && <TableHead>Total Paid</TableHead>}
                  <TableHead>Due Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isPending ? (
                  <VendorTableSkeleton />
                ) : vendors?.length <= 0 ? (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <NoData
                        icon={Users}
                        title="No vendor found"
                        description="Add new vendor to manage them here."
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  vendors?.map((vendor) => (
                    <TableRow key={vendor?._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>
                              {vendor?.name
                                ?.split(" ")
                                ?.map((n) => n[0])
                                ?.join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{vendor?.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {vendor?.contactPerson}
                            </div>
                            {isMobile && (
                              <div className="text-sm text-muted-foreground">
                                {vendor?.category} • {vendor?.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      {!isMobile && (
                        <TableCell className="max-w-[200px] truncate">
                          {vendor?.description}
                        </TableCell>
                      )}
                      {!isMobile && (
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-3 w-3" />
                              {vendor?.phone}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              {vendor?.email}
                            </div>
                          </div>
                        </TableCell>
                      )}
                      {!isMobile && (
                        <TableCell>
                          <div className="flex items-center gap-1 text-green-600">
                            <IndianRupee className="h-3 w-3" />
                            <span className="font-medium">
                              {vendor.totalAmount}
                            </span>
                          </div>
                        </TableCell>
                      )}
                      <TableCell>
                        <div className="flex items-center gap-1 text-destructive">
                          <IndianRupee className="h-3 w-3" />
                          <span className="font-medium">{vendor.wallet}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`${
                            vendor?.isActive
                              ? "bg-green-100 border border-green-300 text-green-400 hover:bg-green-200"
                              : "bg-red-100 border border-red-300 text-red-400 hover:bg-red-200"
                          }`}
                        >
                          {vendor?.isActive ? "Active" : "Deactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1 sm:gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewVendor(vendor)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditVendor(vendor)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            className={`${
                              vendor?.isActive
                                ? "bg-green-100 border border-green-300 hover:bg-green-200"
                                : "bg-red-100 border border-red-300 hover:bg-red-200"
                            }`}
                            onClick={() => handleConfirmToggle(vendor)}
                            size="sm"
                          >
                            {vendor?.isActive ? (
                              <UserCheck className="h-4 w-4 text-green-400" />
                            ) : (
                              <UserX className="h-4 w-4 text-red-400" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <DataTablePagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            startIndex={(page - 1) * itemsPerPage + 1}
            endIndex={Math.min(page * itemsPerPage, totalItems)}
            hasNextPage={page < totalPages}
            hasPreviousPage={page > 1}
            onPageChange={setPage}
            onNextPage={() => setPage((p) => p + 1)}
            onPreviousPage={() => setPage((p) => p - 1)}
            onItemsPerPageChange={setItemsPerPage}
          />
        </CardContent>
      </Card>

      {/* View Vendor Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Vendor Details</DialogTitle>
          </DialogHeader>
          {selectedVendor && (
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="info">Information</TabsTrigger>
                <TabsTrigger value="payments">Payment History</TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-lg">
                      {selectedVendor.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {selectedVendor.name}
                    </h3>
                    <p className="text-muted-foreground">
                      {selectedVendor.category}
                    </p>
                    <Badge
                      variant={
                        selectedVendor.status === "active"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {selectedVendor.status}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">
                      Contact Person
                    </label>
                    <p className="text-sm text-muted-foreground">
                      {selectedVendor.contactPerson}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Phone</label>
                    <p className="text-sm text-muted-foreground">
                      {selectedVendor.phone}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <p className="text-sm text-muted-foreground">
                      {selectedVendor.email}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Address</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedVendor.address}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      ₹{selectedVendor?.totalAmount}
                    </p>
                    <p className="text-sm text-muted-foreground">Total Paid</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-destructive">
                      ₹{selectedVendor?.wallet}
                    </p>
                    <p className="text-sm text-muted-foreground">Total Due</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="payments" className="space-y-4">
                <div className="space-y-2">
                  {selectedVendor?.transaction?.length <= 0 ?
                    <NoData 
                      icon={Wallet}
                      title="No Transaction found"
                      description={`Transaction is not available for ${selectedVendor?.contactPerson}`}
                    />
                  : selectedVendor?.transaction?.map((transaction) => (
                    <div
                      key={transaction?._id}
                      className="flex justify-between items-center p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          {transaction?.description}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(
                            new Date(transaction.createdAt),
                            "dd-MM-yy HH:mm"
                          )}
                          <Badge
                            variant="outline"
                            className={`ms-4 ${
                              transaction.type === "income"
                                ? "bg-green-100 border border-green-300 text-green-400 hover:bg-green-200"
                                : "bg-red-100 border border-red-300 text-red-400 hover:bg-red-200"
                            }`}
                          >
                            {transaction?.type?.charAt(0)?.toUpperCase() +
                              transaction?.type?.slice(1)}
                          </Badge>
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-medium ${
                            transaction?.incomeCategoryId
                              ? "text-green-600"
                              : "text-destructive"
                          }`}
                        >
                          {transaction?.incomeCategoryId ? "+" : "-"}₹
                          {transaction.amount.toLocaleString()}
                        </p>
                        <Badge variant="outline">{transaction.type}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
      <ConfirmationDialog
        open={isConfirmOpen}
        onOpenChange={(open) => {
          if (!isStatusUpdatePending) {
            setIsConfirmOpen(open);
          }
        }}
        title={`${vendorToUpdate?.isActive ? "Deactivate" : "Activate"} Vendor`}
        description={`Are you sure you want to ${
          vendorToUpdate?.isActive ? "deactivate" : "activate"
        } this Vendor member?`}
        confirmText={vendorToUpdate?.isActive ? "Deactivate" : "Activate"}
        confirmVariant={vendorToUpdate?.isActive ? "destructive" : "success"}
        isLoading={isStatusUpdatePending}
        onConfirm={() => {
          if (vendorToUpdate) {
            updateStatus({
              id: vendorToUpdate._id,
              isActive: !vendorToUpdate.isActive,
            });
          }
        }}
      />
    </div>
  );
};

export default VendorManagement;
