import React, { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  Eye,
  ToggleLeft,
  ToggleRight,
  Calendar,
  Clock,
  FileText,
  UserCheck,
  UserX,
  Edit,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTablePagination } from "@/components/common/DataTablePagination";
import { useIsMobile } from "@/hooks/use-mobile";
import { useMutation, useQuery } from "@tanstack/react-query";
import { signUp } from "@/api/auth.api";
import { useToast } from "@/hooks/use-toast";
import { StaffManagerForm } from "../common/StaffManagerForm";
import {
  getStaffManager,
  updateStaffManager,
  updateStatusStaffManager,
} from "@/api/managerStaff.api";
import { ConfirmationDialog } from "../common/ConfirmationDialog";

const mockAttendance = [
  /* ... */
];
const mockLeaveRequests = [
  /* ... */
];

const StaffManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEditStaff, setSelectedEditStaff] = useState<any>(null);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedUpdateStaff, setSelectedUpdateStaff] = useState<any>(null);

  const isMobile = useIsMobile();
  const { toast } = useToast();

  const queryData = {
    type: "staff",
    search: searchTerm,
    page,
    limit: itemsPerPage,
    ...(filterStatus !== "all" && { status: filterStatus === "active" }),
  };

  const { data: getStaff, refetch } = useQuery({
    queryKey: ["get-all-staff", queryData],
    queryFn: () => getStaffManager(queryData),
  });

  const { mutate: updateStatus, isPending: isStatusUpdatePending } = useMutation({
    mutationKey: ["update-status-staff"],
    mutationFn: ({ id, isActive }: any) =>
      updateStatusStaffManager(id, isActive),
    onSuccess: () => {
      toast({
        variant: "default",
        title: "Updated the staff status",
        description: "Updated the staff status successfully.",
      });
      setIsConfirmOpen(false);
      refetch();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Staff status updation failed",
        description: "Unable to update staff status. Please try again.",
      });
      console.error("Error creating staff:", error);
    },
  });
  
  const { mutate: createStaff, isPending } = useMutation({
    mutationKey: ["sign-up"],
    mutationFn: signUp,
    onSuccess: () => {
      toast({
        variant: "default",
        title: "Success",
        description: "Staff member created.",
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

  const { mutate: updateStaff, isPending: isUpdatePending } = useMutation({
    mutationKey: ["update-staff"],
    mutationFn: ({ userData, id }: any) => updateStaffManager(userData, id),
    onSuccess: () => {
      toast({
        variant: "default",
        title: "Updated",
        description: "Staff member updated successfully.",
      });
      setIsEditModalOpen(false);
      setSelectedEditStaff(null);
      refetch();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "Unable to update staff. Please try again.",
      });
      console.error("Error updating staff:", error);
    },
  })

  const staff = getStaff?.payload?.data || [];
  const totalItems = getStaff?.payload?.count || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handleViewStaff = (staffMember: any) => {
    setSelectedStaff(staffMember);
    setIsViewModalOpen(true);
  };

  const handleConfirmToggle = (member: any) => {
    setSelectedUpdateStaff(member);
    setIsConfirmOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Staff Management
          </h1>
          <p className="text-muted-foreground">
            Manage restaurant staff and their activities
          </p>
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Staff
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl rounded-2xl shadow-lg">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                Add new staff member
              </DialogTitle>
            </DialogHeader>
            <StaffManagerForm
              onSubmit={createStaff}
              isPending={isPending}
              type="staff"
              onCancel={() => setIsAddModalOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Staff
                </p>
                <p className="text-2xl font-bold text-foreground">24</p>
              </div>
              <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Eye className="h-4 w-4 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Present Today
                </p>
                <p className="text-2xl font-bold text-primary">22</p>
              </div>
              <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Clock className="h-4 w-4 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  On Leave
                </p>
                <p className="text-2xl font-bold text-amber-600">2</p>
              </div>
              <div className="h-8 w-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-4 w-4 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Leave Requests
                </p>
                <p className="text-2xl font-bold text-destructive">3</p>
              </div>
              <div className="h-8 w-8 bg-destructive/10 rounded-lg flex items-center justify-center">
                <FileText className="h-4 w-4 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search staff..."
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

      {/* Staff Table */}
      <Card>
        <CardHeader>
          <CardTitle>Staff Members ({staff.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff Member</TableHead>
                  {/* {!isMobile && <TableHead>Position</TableHead>} */}
                  {!isMobile && <TableHead>Restaurant</TableHead>}
                  {!isMobile && <TableHead>Attendance</TableHead>}
                  {!isMobile && <TableHead>Join Date</TableHead>}
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staff.map((member) => (
                  <TableRow key={member._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {member.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{member.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {member.email}
                          </div>
                          {isMobile && (
                            <div className="text-sm text-muted-foreground">
                              {member.position} • {member.restaurant} •{" "}
                              {member.attendanceRate}%
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    {/* {!isMobile && (
                      <TableCell>
                        <Badge variant="outline">{member.position}</Badge>
                      </TableCell>
                    )} */}
                    {!isMobile && (
                      <TableCell
                        className={`${
                          !member.restaurantId?.name && "text-gray-400"
                        }`}
                      >
                        {member.restaurantId?.name || "N/A"}
                      </TableCell>
                    )}
                    {!isMobile && (
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-medium">
                            {member.attendanceRate}%
                          </div>
                          <div className="w-16 bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${member.attendanceRate}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                    )}
                    {!isMobile && (
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`text-sm font-medium ${!member.joiningDate && "text-gray-400"}`}>
                            {member.joiningDate
                              ? new Date(
                                  selectedStaff.joiningDate
                                ).toLocaleDateString("en-GB")
                              : "N/A"}
                          </div>
                        </div>
                      </TableCell>
                    )}
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`${
                          member.isActive
                            ? "bg-green-100 border border-green-300 hover:bg-green-200"
                            : "bg-red-100 border border-red-300 hover:bg-red-200"
                        }`}
                      >
                        {member.isActive ? "Active" : "Deactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1 sm:gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewStaff(member)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedEditStaff(member);
                            setIsEditModalOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          className={`${
                            member.isActive
                              ? "bg-green-100 border border-green-300 hover:bg-green-200"
                              : "bg-red-100 border border-red-300 hover:bg-red-200"
                          }`}
                          onClick={() => handleConfirmToggle(member)}
                          variant="outline"
                          size="sm"
                        >
                          {member.isActive ? (
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
            onNextPage={() => setPage((p) => p + 1)}
            onPreviousPage={() => setPage((p) => p - 1)}
            onItemsPerPageChange={setItemsPerPage}
          />
        </CardContent>
      </Card>

      {/* View Staff Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Staff Details</DialogTitle>
          </DialogHeader>
          {selectedStaff && (
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="info">Information</TabsTrigger>
                <TabsTrigger value="attendance">Attendance</TabsTrigger>
                <TabsTrigger value="leaves">Leave Requests</TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-lg">
                      {selectedStaff.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {selectedStaff.name}
                    </h3>
                    <p className="text-muted-foreground">
                      {selectedStaff.position}
                    </p>
                    <Badge
                      variant="outline"
                      className={`${
                        selectedStaff.isActive
                          ? "bg-green-100 border border-green-300 hover:bg-green-200"
                          : "bg-red-100 border border-red-300 hover:bg-red-200"
                      }`}
                    >
                      {selectedStaff.isActive ? "Active" : "Deactive"}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <p className="text-sm text-muted-foreground">
                      {selectedStaff.email}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Phone</label>
                    <p className="text-sm text-muted-foreground">
                      {selectedStaff.phone}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Restaurant</label>
                    <p className="text-sm text-muted-foreground">
                      {selectedStaff.restaurantId?.name}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Join Date</label>
                    <p className={`text-sm ${selectedStaff.joiningDate ? "text-muted-foreground": "text-gray-400"}`}>
                      {selectedStaff.joiningDate
                        ? new Date(
                            selectedStaff.joiningDate
                          ).toLocaleDateString("en-GB")
                        : "-"}
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="attendance" className="space-y-4">
                <div className="grid grid-cols-1 gap-2">
                  {mockAttendance.map((record, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{record.date}</p>
                        <Badge
                          variant={
                            record.status === "present"
                              ? "default"
                              : "destructive"
                          }
                        >
                          {record.status}
                        </Badge>
                      </div>
                      <div className="text-right">
                        {record.checkIn && (
                          <div className="text-sm">
                            <p>In: {record.checkIn}</p>
                            <p>Out: {record.checkOut}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="leaves" className="space-y-4">
                <div className="grid grid-cols-1 gap-2">
                  {mockLeaveRequests.map((request) => (
                    <div key={request.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{request.date}</p>
                          <p className="text-sm text-muted-foreground">
                            {request.reason}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Applied: {request.appliedOn}
                          </p>
                        </div>
                        <Badge
                          variant={
                            request.status === "approved"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {request.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Staff Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-3xl rounded-2xl shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Edit staff member
            </DialogTitle>
          </DialogHeader>
          {selectedEditStaff && (
            <StaffManagerForm
              defaultValues={{
                email: selectedEditStaff.email || "",
                name: selectedEditStaff.name || "",
                password: "",
                phone: selectedEditStaff.phone || "",
                address: selectedEditStaff.address || "",
                restaurantId: selectedEditStaff.restaurantId || "",
                position: "staff",
                isUserType: "staff",
                file: selectedEditStaff.profileImage || null,
              }}
              onSubmit={(data: any) =>
                updateStaff({ userData: data, id: selectedEditStaff._id })
              }
              isPending={isUpdatePending}
              type="staff"
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
          selectedUpdateStaff?.isActive ? "Deactivate" : "Activate"
        } Staff`}
        description={`Are you sure you want to ${
          selectedUpdateStaff?.isActive ? "deactivate" : "activate"
        } this staff member?`}
        confirmText={selectedUpdateStaff?.isActive ? "Deactivate" : "Activate"}
        confirmVariant={
          selectedUpdateStaff?.isActive ? "destructive" : "success"
        }
        isLoading={isStatusUpdatePending}
        onConfirm={() => {
          if (selectedUpdateStaff) {
            updateStatus({
              id: selectedUpdateStaff._id,
              isActive: !selectedUpdateStaff.isActive,
            });
          }
        }}
      />
    </div>
  );
};

export default StaffManagement;
