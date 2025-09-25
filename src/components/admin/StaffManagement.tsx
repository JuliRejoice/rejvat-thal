import React, { useCallback, useRef, useState } from "react";
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
  User,
  CheckCircle,
  XCircle,
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
import { StaffTableSkeleton, StatsCardsSkeleton } from "./SkeletonStaffManag";
import { NoData } from "../common/NoData";
import { getAttendanceAndLeaveByStaff, updateLeaveRequest } from "@/api/attendance.api";
import { AttendanceRecordsSkeleton } from "../staff/AttendanceSkeleton";
import { getRestaurants } from "@/api/restaurant.api";
import { SearchableDropDown } from "@/components/common/SearchableDropDown";

const mockAttendance = [];
const mockLeaveRequests = [];

const StaffManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterRestaurant, setFilterRestaurant] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEditStaff, setSelectedEditStaff] = useState<any>(null);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedUpdateStaff, setSelectedUpdateStaff] = useState<any>(null);
  const [searchRestaurant, setSearchRestaurant] = useState("");
  // Fetch selected staff's attendance and leave when View modal is open
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedOnSearch = useCallback((query: string) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
  
    debounceTimeoutRef.current = setTimeout(() => {
      setSearchRestaurant(query);
    }, 300); 
  }, []);

  const {
    data: staffAttLeave,
    isPending: isStaffAttLeavePending,
    refetch: refetchStaffAttLeave,
  } = useQuery({
    queryKey: [
      "get-staff-attendance-leave",
      selectedStaff?._id,
      Boolean(isViewModalOpen),
    ],
    queryFn: () => getAttendanceAndLeaveByStaff(selectedStaff._id),
    enabled: Boolean(isViewModalOpen && selectedStaff && selectedStaff._id),
  });

  const staffDetail = staffAttLeave?.payload?.data?.[0];
  const staffAttendance = staffDetail?.attendance || [];
  const staffLeaves = staffDetail?.leave || [];

  const isMobile = useIsMobile();
  const { toast } = useToast();

  const queryData = {
    type: "staff",
    search: searchTerm,
    page,
    limit: itemsPerPage,
    ...(filterStatus !== "all" && { status: filterStatus === "active" }),
  };

  const {
    data: getStaff,
    isPending: isGetStaffPending,
    refetch,
  } = useQuery({
    queryKey: ["get-all-staff", queryData],
    queryFn: () => getStaffManager(queryData),
  });

  const { mutate: updateStatus, isPending: isStatusUpdatePending } =
    useMutation({
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
        description: error?.message || `Failed to create staff. Try again.`,
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
  });

  const { mutate: updateLeaveStatus, isPending: isLeaveStatusUpdating } = useMutation({
    mutationKey: ["update-leave-request"],
    mutationFn: (payload: any) => updateLeaveRequest(payload),
    onSuccess: () => {
      toast({
        variant: "default",
        title: "Leave status updated",
        description: "Updated leave request status successfully.",
      });
      // Refresh the attendance/leave list
      refetchStaffAttLeave();
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to update leave status",
        description: error?.message || "Please try again.",
      });
      console.error("Error updating leave status:", error);
    },
  });

  const staff = getStaff?.payload?.data || [];
  const filteredStaff = staff.filter((member) => {
    const matchesStatus = filterStatus === "all" ||
      (filterStatus === "active" && member.isActive) ||
      (filterStatus === "deactive" && !member.isActive);
    const matchesRestaurant = filterRestaurant === "all" ||
      member.restaurantId?._id === filterRestaurant;
    return matchesStatus && matchesRestaurant;
  });
  const totalItems = filteredStaff.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const { data: restaurants } = useQuery({
    queryKey: ["get-all-restaurants",searchRestaurant],
    queryFn: () => getRestaurants({}),
  });

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
        {isGetStaffPending ? (
          <StatsCardsSkeleton />
        ) : (
          <>
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
          </>
        )}
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
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Staff Members ({filteredStaff.length})</CardTitle>
          <SearchableDropDown
            options={[
              { id: "all", name: "All Restaurants" },
              ...(restaurants?.payload?.data?.map((restaurant) => ({
                id: restaurant._id,
                name: restaurant.name,
              })) || []),
            ]}
            value={filterRestaurant}
            onSearch={(query) => {
              debouncedOnSearch(query);
            }}
            onClose={() => {
              setSearchRestaurant("");
            }}
            onChange={(value) => setFilterRestaurant(value)}
          />
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
                  <TableHead>Salary</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isGetStaffPending ? (
                  <StaffTableSkeleton />
                ) : filteredStaff.length <= 0 ? (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <NoData
                        icon={User}
                        title="No staff members found"
                        description="Add new staff members to manage them here."
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStaff.map((member) => (
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
                            <div
                              className={`text-sm font-medium ${
                                !member?.joiningDate && "text-gray-400"
                              }`}
                            >
                              {member?.joiningDate
                                ? new Intl.DateTimeFormat("en-GB", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                  }).format(new Date(member.joiningDate))
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
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-medium">
                            {member.salary ? member.salary : "-"}
                          </div>
                        </div>
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

      {/* View Staff Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-3xl rounded-2xl">
          <DialogHeader>
            <DialogTitle>Staff Details</DialogTitle>
          </DialogHeader>
          {selectedStaff && (
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-3 sticky top-0 z-10 bg-background">
                <TabsTrigger value="info">Information</TabsTrigger>
                <TabsTrigger value="attendance">Attendance</TabsTrigger>
                <TabsTrigger value="leaves">Leave Requests</TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-4">
                <Card className="shadow-card">
                  <CardHeader className="flex flex-row items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="text-lg">
                        {selectedStaff.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-semibold leading-tight">
                          {selectedStaff.name}
                        </h3>
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
                      <p className="text-muted-foreground text-sm">
                        {selectedStaff.position}
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Email</p>
                        <p className="text-sm text-foreground break-all">{selectedStaff.email}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Phone</p>
                        <p className="text-sm text-foreground">{selectedStaff.phone}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Restaurant</p>
                        <p className="text-sm text-foreground">{selectedStaff.restaurantId?.name}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Join Date</p>
                        <p
                          className={`text-sm ${
                            selectedStaff?.joiningDate
                              ? "text-foreground"
                              : "text-gray-400"
                          }`}
                        >
                          {selectedStaff?.joiningDate
                            ? new Date(selectedStaff?.joiningDate).toLocaleDateString("en-GB")
                            : "-"}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Salary</p>
                        <p className="text-sm text-foreground">{selectedStaff?.salary}</p>
                      </div>
                      {/* <div className="space-y-1">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Profile Image</p>
                        <div className="relative w-24 h-24 border rounded-lg overflow-hidden bg-muted/10 flex items-center justify-center">
                         
                          <span className="absolute top-1 left-1 text-[10px] text-muted-foreground">Preview</span>
                          {selectedStaff?.profileImage ? (
                            <img
                              src={selectedStaff.profileImage}
                              alt="Preview"
                              className="w-full h-full object-cover"
                              crossOrigin="anonymous"
                              referrerPolicy="no-referrer"
                              loading="lazy"
                              decoding="async"
                              onError={(e) => {
                       
                                (e.target as HTMLImageElement).className = "w-full h-full object-contain";
                              }}
                            />
                          ) : (
                            <span className="text-[11px] text-muted-foreground">No image</span>
                          )}
                        </div>
                      </div> */}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="attendance" className="space-y-4">
                <Card className="overflow-y-auto max-h-[350px]">
                  <CardHeader>
                    <CardTitle className="text-lg">Attendance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isStaffAttLeavePending ? (
                      <AttendanceRecordsSkeleton />
                    ) : staffAttendance.length ? (
                      <div className="space-y-3">
                        {staffAttendance.map((record: any) => (
                          <div
                            key={record._id}
                            className="grid grid-cols-3 p-3 border rounded-lg"
                          >
                            <div className="col-span-2 flex items-center space-x-3">
                              <div
                                className={`p-2 rounded-lg ${
                                  record.status === "present"
                                    ? "bg-success/10 text-success border-success"
                                    : record.status === "leave"
                                    ? "bg-warning/10 text-warning"
                                    : "bg-danger/10 text-danger"
                                }`}
                              >
                                {record.status === "present" ? (
                                  <CheckCircle className="h-4 w-4" />
                                ) : record.status === "leave" ? (
                                  <Calendar className="h-4 w-4" />
                                ) : (
                                  <XCircle className="h-4 w-4" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium">
                                  {new Date(
                                    record.date || record.checkInAt
                                  ).toLocaleDateString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                    weekday: "short",
                                  })}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  <b className="text-gray-800">Check-In Time</b>: {" "}
                                  {record.status === "present" && record.checkInAt &&
                                    new Date(record.checkInAt).toLocaleTimeString(
                                      "en-US",
                                      {
                                        hour: "numeric",
                                        minute: "numeric",
                                        hour12: true,
                                      }
                                    )}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-7 justify-end">
                              <Badge
                                variant="outline"
                                className={`${
                                  record?.status === "present"
                                    ? "bg-green-100 border border-green-300 hover:bg-green-200"
                                    : record.status === "leave"
                                    ? "bg-yellow-100 border border-yellow-300 hover:bg-yellow-200"
                                    : "bg-red-100 border border-red-300 hover:bg-red-200"
                                }`}
                              >
                                {record?.status?.charAt(0)?.toUpperCase() +
                                  record?.status?.slice(1)}
                              </Badge>
                              {record.selfieUrl && (
                                <img
                                  src={record.selfieUrl}
                                  alt="Attendance Snapshot"
                                  className="w-12 h-12 rounded-md object-cover"
                                />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <NoData
                        icon={User}
                        title="No Attendance"
                        description="No attendance records available for this staff"
                      />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="leaves" className="space-y-4">
                <Card className="overflow-y-auto max-h-[350px]">
                  <CardHeader>
                    <CardTitle className="text-lg">Leave Requests</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isStaffAttLeavePending ? (
                      <AttendanceRecordsSkeleton />
                    ) : staffLeaves.length ? (
                      <div className="space-y-3">
                        {staffLeaves.map((request: any) => (
                          <div key={request._id} className="p-3 border rounded-lg">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">
                                  {new Date(request.fromDate).toLocaleDateString(
                                    "en-IN",
                                    { day: "numeric", month: "short", weekday: "short" }
                                  )}
                                  {" "}-{" "}
                                  {new Date(request.toDate).toLocaleDateString(
                                    "en-IN",
                                    { day: "numeric", month: "short", weekday: "short" }
                                  )}
                                </p>
                                <p className="text-sm text-muted-foreground">{request.reason}</p>
                              </div>
                              <Select
                                value={request.status}
                                disabled={request.status === "approved" || request.status === "rejected"}
                                onValueChange={(value) => {
                                  updateLeaveStatus({
                                    id: request._id,
                                    restaurantId:
                                      request?.restaurantId?._id || request?.restaurantId || selectedStaff?.restaurantId?._id || "",
                                    fromDate: new Date(request.fromDate).toISOString().split("T")[0],
                                    toDate: new Date(request.toDate).toISOString().split("T")[0],
                                    reason: request.reason || "",
                                    status: value,
                                    file: undefined,
                                  });
                                }}
                              >
                                <SelectTrigger className="w-36">
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="approved">Approved</SelectItem>
                                  <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <NoData
                        icon={Calendar}
                        title="No Leave Requests"
                        description="No leave requests available for this staff"
                      />
                    )}
                  </CardContent>
                </Card>
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
                restaurantId: selectedEditStaff.restaurantId?._id || "",
                position: "staff",
                isUserType: "staff",
                joiningDate: selectedEditStaff.joiningDate
                  ? new Date(selectedEditStaff.joiningDate)
                      .toISOString()
                      .split("T")[0]
                  : "",
                salary: selectedEditStaff?.salary,
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
