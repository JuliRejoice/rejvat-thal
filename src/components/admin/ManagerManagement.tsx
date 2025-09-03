import { signUp } from "@/api/auth.api";
import { getStaffManager, updateStatusStaffManager, updateStaffManager } from "@/api/managerStaff.api";
import { DataTablePagination } from "@/components/common/DataTablePagination";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Edit2,
  Eye,
  Filter,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  UserCheck,
  UserX,
} from "lucide-react";
import { useState } from "react";
import { StaffManagerForm } from "../common/StaffManagerForm";
import { ConfirmationDialog } from "../common/ConfirmationDialog";

const ManagerManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedManager, setSelectedManager] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedUpdateManager, setSelectedUpdateManager] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEditManager, setSelectedEditManager] = useState<any>(null);
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const queryData = {
    type: "manager",
    search: searchTerm,
    page: page,
    limit: itemsPerPage,
    ...(filterStatus !== "all" && { status: filterStatus === "active" }),
  };
  const { data: getManagers, refetch } = useQuery({
    queryKey: ["get-all-managers", queryData],
    queryFn: () => getStaffManager(queryData),
  });

  const { mutate: updateStatus, isPending: isStatusUpdatePending } = useMutation({
    mutationKey: ["update-status-staff"],
    mutationFn: ({ id, isActive }: any) =>
      updateStatusStaffManager(id, isActive),
    onSuccess: () => {
      toast({
        variant: "default",
        title: "Updated the manager status",
        description: "Updated the manager status successfully.",
      });
      setIsConfirmOpen(false);
      refetch();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Manager status updation failed",
        description: "Unable to update manager status. Please try again.",
      });
      console.error("Error update status manager:", error);
    },
  });
  
  const { mutate: createManager, isPending } = useMutation({
    mutationKey: ["sign-up"],
    mutationFn: signUp,
    onSuccess: () => {
      toast({
        variant: "default",
        title: "Manger created",
        description: "Manger created successfully.",
      });
      setIsAddModalOpen(false);
      refetch();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create staff. Try again.",
      });
      console.error("Error creating staff:", error);
    },
  });

  const { mutate: updateManager, isPending: isUpdatePending } = useMutation({
    mutationKey: ["update-manager"],
    mutationFn: ({ userData, id }: any) => updateStaffManager(userData, id),
    onSuccess: () => {
      toast({
        variant: "default",
        title: "Updated",
        description: "Manager updated successfully.",
      });
      setIsEditModalOpen(false);
      setSelectedEditManager(null);
      refetch();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "Unable to update manager. Please try again.",
      });
      console.error("Error updating manager:", error);
    },
  });

  const managers = getManagers?.payload?.data || [];
  const totalItems = getManagers?.payload?.count || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPage(1);
  };

  const handleStatusFilter = (value: string) => {
    setFilterStatus(value);
    setPage(1);
  };

  const handleViewManager = (manager) => {
    setSelectedManager(manager);
    setIsViewModalOpen(true);
  };

  const handleConfirmToggle = (member: any) => {
    setSelectedUpdateManager(member);
    setIsConfirmOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Manager Management
          </h1>
          <p className="text-muted-foreground">
            Manage restaurant managers across all locations
          </p>
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Manager
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Add New Manager</DialogTitle>
            </DialogHeader>
            <StaffManagerForm
              onSubmit={createManager}
              isPending={isPending}
              type="manager"
              onCancel={() => setIsAddModalOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search managers..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={handleStatusFilter}>
              <SelectTrigger className={isMobile ? "w-full" : "w-48"}>
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Deactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Managers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Managers ({getManagers?.payload?.count})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Manager</TableHead>
                  {!isMobile && <TableHead>Restaurant</TableHead>}
                  {!isMobile && <TableHead>Contact</TableHead>}
                  {!isMobile && <TableHead>Join Date</TableHead>}
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {managers.map((manager) => (
                  <TableRow key={manager._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={manager.profileImage || ""} />
                          <AvatarFallback>
                            {manager.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{manager.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {manager.email}
                          </div>
                          {isMobile && (
                            <div className="text-sm text-muted-foreground">
                              {manager.restaurant} • {manager.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    {!isMobile && (
                      <TableCell>
                        <div className="font-medium">{manager.restaurant}</div>
                      </TableCell>
                    )}
                    {!isMobile && (
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-3 w-3" />
                            {manager.phone}
                          </div>
                        </div>
                      </TableCell>
                    )}
                    {!isMobile && (
                      <TableCell>
                        {manager.createdAt
                          ? new Date(manager.createdAt).toLocaleDateString(
                              "en-GB"
                            )
                          : "-"}
                      </TableCell>
                    )}
                    <TableCell>
                      <Badge
                        variant={manager.isActive ? "default" : "secondary"}
                      >
                        {manager.isActive ? "Active" : "Deactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1 sm:gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewManager(manager)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedEditManager(manager);
                            setIsEditModalOpen(true);
                          }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          className={`${
                            manager.isActive
                              ? "bg-green-100 border border-green-300 hover:bg-green-200"
                              : "bg-red-100 border border-red-300 hover:bg-red-200"
                          }`}
                          onClick={() => handleConfirmToggle(manager)}
                          variant="outline"
                          size="sm"
                        >
                          {manager.isActive ? (
                            <UserCheck className="text-green-500" />
                          ) : (
                            <UserX className="text-red-500" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
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
            onNextPage={() => setPage((p) => Math.min(p + 1, totalPages))}
            onPreviousPage={() => setPage((p) => Math.max(p - 1, 1))}
            onItemsPerPageChange={(val) => {
              setItemsPerPage(val);
              setPage(1);
            }}
          />
        </CardContent>
      </Card>

      {/* View Manager Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Manager Details</DialogTitle>
          </DialogHeader>
          {selectedManager && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedManager.avatar || ""} />
                  <AvatarFallback className="text-lg">
                    {selectedManager.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">
                    {selectedManager.name}
                  </h3>
                  <Badge
                    variant={
                      selectedManager.status === "active"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {selectedManager.status}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Email</span>
                  </div>
                  <p className="text-sm text-muted-foreground pl-6">
                    {selectedManager.email}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Phone</span>
                  </div>
                  <p className="text-sm text-muted-foreground pl-6">
                    {selectedManager.phone}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Address</span>
                  </div>
                  <p className="text-sm text-muted-foreground pl-6">
                    {selectedManager.address}
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-sm font-medium">Restaurant</span>
                  <p className="text-sm text-muted-foreground">
                    {selectedManager.restaurant}
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-sm font-medium">Join Date</span>
                  <p className="text-sm text-muted-foreground">
                    {selectedManager.joinDate}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Manager</DialogTitle>
          </DialogHeader>
          {selectedEditManager && (
            <StaffManagerForm
              defaultValues={{
                email: selectedEditManager.email || "",
                name: selectedEditManager.name || "",
                password: "",
                phone: selectedEditManager.phone || "",
                address: selectedEditManager.address || "",
                restaurantId: selectedEditManager.restaurantId || "",
                position: "manager",
                isUserType: "manager",
                file: selectedEditManager.profileImage || null,
              }}
              onSubmit={(data: any) =>
                updateManager({ userData: data, id: selectedEditManager._id })
              }
              isPending={isUpdatePending}
              type="manager"
              mode="edit"
              onCancel={() => setIsEditModalOpen(false)}
            />
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
        title={`${
          selectedUpdateManager?.isActive ? "Deactivate" : "Activate"
        } Staff`}
        description={`Are you sure you want to ${
          selectedUpdateManager?.isActive ? "deactivate" : "activate"
        } this staff member?`}
        confirmText={selectedUpdateManager?.isActive ? "Deactivate" : "Activate"}
        confirmVariant={selectedUpdateManager?.isActive ? "destructive" : "success"}
        isLoading={isStatusUpdatePending}
        onConfirm={() => {
          if (selectedUpdateManager) {
            updateStatus({
              id: selectedUpdateManager._id,
              isActive: !selectedUpdateManager.isActive,
            });
          }
        }}
      />
    </div>
  );
};

export default ManagerManagement;
