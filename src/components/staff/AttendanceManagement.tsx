import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import {
  Camera,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  User,
  MapPin,
  Smartphone,
  AlertCircle,
  UserCheck,
} from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createAttendance, getStaffAttendance, getMonthlyStaffAttendance } from "@/api/attendance.api";
import { Input } from "../ui/input";
import { useForm } from "react-hook-form";
import { useAuth } from "@/contexts/AuthContext";
import { format, parseISO } from "date-fns";
import {
  AttendanceRecordsSkeleton,
  MonthlyAttendanceSkeleton,
} from "./AttendanceSkeleton";
import { NoData } from "../common/NoData";
import { useToast } from "@/hooks/use-toast";

const NotesDisplay = ({ notes }: { notes: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxLength = 30;
  const shouldTruncate = notes.length > maxLength;

  const displayedText =
    isExpanded || !shouldTruncate ? notes : `${notes.slice(0, maxLength)}...`;

  return (
    <p className="text-sm text-muted-foreground">
      <b className="text-gray-800">Additional Notes</b>: {displayedText}
      {shouldTruncate && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="ml-2 text-blue-500 underline text-xs"
        >
          {isExpanded ? "Show less" : "Read more"}
        </button>
      )}
    </p>
  );
};

const AttendanceManagement = () => {
  const [isMarkingAttendance, setIsMarkingAttendance] = useState(false);
  const [isApplyingLeave, setIsApplyingLeave] = useState(false);
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString()
  );
  const [selectedMonth, setSelectedMonth] = useState(
    (new Date().getMonth() + 1).toString().padStart(2, "0")
  );
  const { user } = useAuth();
  const { toast } = useToast();

  // Generate year options (current year and 5 previous years)
  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 6; i++) {
      years.push((currentYear - i).toString());
    }
    return years;
  };

  // Generate month options with names
  const getMonthOptions = () => {
    return [
      { value: "01", label: "January" },
      { value: "02", label: "February" },
      { value: "03", label: "March" },
      { value: "04", label: "April" },
      { value: "05", label: "May" },
      { value: "06", label: "June" },
      { value: "07", label: "July" },
      { value: "08", label: "August" },
      { value: "09", label: "September" },
      { value: "10", label: "October" },
      { value: "11", label: "November" },
      { value: "12", label: "December" },
    ];
  };

  // Combine selected year and month for attendance data lookup
  const selectedYearMonth = `${selectedYear}-${selectedMonth}`;

  // Compute the start and end date for the selected month (formatted as yyyy-MM-dd)
  const { startDateOfMonth, endDateOfMonth } = React.useMemo(() => {
    const yearNum = Number(selectedYear);
    const monthNum = Number(selectedMonth); // 1-12
    const firstDay = new Date(yearNum, monthNum - 1, 1);
    const lastDay = new Date(yearNum, monthNum, 0);
    return {
      startDateOfMonth: format(firstDay, "yyyy-MM-dd"),
      endDateOfMonth: format(lastDay, "yyyy-MM-dd"),
    };
  }, [selectedYear, selectedMonth]);

  const {
    handleSubmit,
    setValue,
    watch,
    register,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      file: null as File | null,
      notes: "",
    },
  });

  useEffect(() => {
    register("file", { required: "Attendance Picture is required" });
  }, [register]);

  const { data: getAttenStafWise, isPending, refetch: refetchRecords } = useQuery({
    queryKey: [
      "get-attendance-by-staff",
      { startDate: startDateOfMonth, endDate: endDateOfMonth },
    ],
    queryFn: () =>
      getStaffAttendance({
        startDate: startDateOfMonth,
        endDate: endDateOfMonth,
      }),
  });
  const attendanceData = getAttenStafWise?.payload?.data;
  const hasMarkedToday = React.useMemo(() => {
    if (!attendanceData || attendanceData.length === 0) return false;
    const todayStr = new Date().toDateString();
    return attendanceData.some((rec: any) => {
      const d = rec?.checkInAt ? new Date(rec.checkInAt) : null;
      return d && d.toDateString() === todayStr && rec.status === "present";
    });
  }, [attendanceData]);

  const { data: todaySummary, refetch: refetchTodaySummary, isPending: isTodaySummaryPending } = useQuery({
    queryKey: [
      "get-monthly-staff-attendance",
      user?.restaurantId,
      startDateOfMonth,
      endDateOfMonth,
    ],
    queryFn: () =>
      getMonthlyStaffAttendance(
        user?.restaurantId,
        startDateOfMonth,
        endDateOfMonth
      ),
    enabled: Boolean(user?.restaurantId && startDateOfMonth && endDateOfMonth),
  });

  const { mutate: createAtten, isPending: isCreatePending } = useMutation({
    mutationKey: ["create-attendance"],
    mutationFn: createAttendance,
    onSuccess: () => {
      toast({
        variant: "default",
        title: "Attendance marked",
        description: "Your attendance has been recorded successfully.",
      });
      setIsMarkingAttendance(false);
      reset();
      // Refresh summary and records
      refetchTodaySummary();
      refetchRecords();
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to mark attendance",
        description: error?.message || "Please try again.",
      });
    },
  });

  const addAttendance = (data: any) => {
    const attendanceData = {
      ...data,
      restaurantId: user?.restaurantId,
      date: format(new Date(), "yyyy-MM-dd"),
      checkInAt: format(new Date(), "yyyy-MM-dd"),
      status: "present",
    };
    createAtten(attendanceData);
  };

  const AttendanceMarkModal = () => (
    <DialogContent
      className="max-w-2xl"
      onOpenAutoFocus={(e) => e.preventDefault()}
    >
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          Mark Your Attendance
        </DialogTitle>
        <DialogDescription>
          Take a selfie to mark your attendance for today
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit(addAttendance)}>
        <Card>
          <CardContent className="space-y-6 p-6">
            {/* File Upload */}
            <div className="space-y-2">
              <div className="flex gap-3 items-baseline">
                <Label htmlFor="file">Upload your picture *</Label>
                {errors.file && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.file.message as string}
                  </p>
                )}
              </div>
              <Input
                id="file"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) =>
                  setValue("file", e.target.files?.[0] || null, {
                    shouldValidate: true,
                  })
                }
              />
              {(function () {
                const fileVal = watch("file") as File | string | null;
                const preview =
                  fileVal instanceof File
                    ? URL.createObjectURL(fileVal)
                    : typeof fileVal === "string" && fileVal
                    ? fileVal
                    : null;
                return preview ? (
                  <div className="relative w-24 h-24">
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-24 h-24 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => setValue("file", null)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow hover:bg-red-600"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="file"
                    className="flex flex-col items-center justify-center h-24 border-2 border-dashed rounded-lg cursor-pointer text-muted-foreground hover:border-primary hover:text-primary transition w-full"
                  >
                    <span className="text-xs">Upload Profile photo</span>
                  </label>
                );
              })()}
            </div>
            <div className="space-y-2">
              <div className="flex gap-3 items-baseline">
                <Label htmlFor="address">Notes</Label>
              </div>
              <Textarea
                id="notes"
                placeholder="Enter notes"
                autoFocus={false}
                tabIndex={-1}
                {...register("notes")}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="submit" disabled={isCreatePending}>
                {isCreatePending && (
                  <span className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full inline-block animate-spin" />
                )}
                Mark Attendance
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsMarkingAttendance(false);
                  reset();
                }}
                disabled={isCreatePending}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </DialogContent>
  );

  const LeaveApplicationModal = () => (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Apply for Leave
        </DialogTitle>
        <DialogDescription>
          Submit your leave request with required details
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div>
          <Label htmlFor="leave-date">Leave Date</Label>
          <input
            id="leave-date"
            type="date"
            className="w-full p-2 border rounded-md"
            min={new Date().toISOString().split("T")[0]}
          />
        </div>

        <div>
          <Label htmlFor="leave-type">Leave Type</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select leave type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sick">Sick Leave</SelectItem>
              <SelectItem value="personal">Personal Leave</SelectItem>
              <SelectItem value="emergency">Emergency Leave</SelectItem>
              <SelectItem value="family">Family Function</SelectItem>
              <SelectItem value="medical">Medical Appointment</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="leave-reason">Reason for Leave</Label>
          <Textarea
            id="leave-reason"
            placeholder="Please provide detailed reason for your leave request..."
            rows={3}
          />
        </div>

        {/* Selfie Upload */}
        <div>
          <Label>Upload Selfie (Optional)</Label>
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
            <Camera className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-2">
              Take a selfie or upload photo
            </p>
            <Button variant="outline" size="sm">
              <Camera className="mr-2 h-4 w-4" />
              Take Photo
            </Button>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="p-3 bg-warning/5 border border-warning/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-4 w-4 text-warning" />
            <span className="text-sm font-medium">Emergency Contact</span>
          </div>
          <p className="text-xs text-muted-foreground">
            For urgent leaves, contact: Manager (+91 9876543210)
          </p>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={() => setIsApplyingLeave(false)}>
          Cancel
        </Button>
        <Button onClick={() => setIsApplyingLeave(false)}>
          <FileText className="mr-2 h-4 w-4" />
          Submit Request
        </Button>
      </DialogFooter>
    </DialogContent>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Attendance Management
          </h1>
          <p className="text-muted-foreground">
            Mark your attendance and manage leave requests
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Today</p>
          <p className="font-medium">
            {new Date()?.toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Today's Attendance Card */}
      <Card className="shadow-card border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Today's Attendance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              <Dialog
                open={isMarkingAttendance}
                onOpenChange={(open) => {
                  if (!open && isCreatePending) {
                    return; // Prevent closing when create is pending
                  }
                  setIsMarkingAttendance(open);
                }}
              >
                <DialogTrigger asChild>
                  <Button className="bg-gradient-primary" disabled={hasMarkedToday}>
                    Mark Attendance
                  </Button>
                </DialogTrigger>
                <AttendanceMarkModal />
              </Dialog>

              <Dialog open={isApplyingLeave} onOpenChange={setIsApplyingLeave}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <FileText className="mr-2 h-4 w-4" />
                    Apply Leave
                  </Button>
                </DialogTrigger>
                <LeaveApplicationModal />
              </Dialog>
            </div>
            {/* Removed right-side quick metrics per request */}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Attendance Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Monthly Attendance Summary
              </CardTitle>
              <div className="flex gap-2">
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getYearOptions().map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getMonthOptions().map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isTodaySummaryPending ? (
              <MonthlyAttendanceSkeleton />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                <div className="text-center p-4 bg-success/5 border border-success/20 rounded-lg">
                  <CheckCircle className="h-8 w-8 text-success mx-auto mb-2" />
                  <p className="text-2xl font-bold text-success">
                    {todaySummary?.payload?.attendance?.present ?? 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Present</p>
                </div>
                <div className="text-center p-4 bg-warning/5 border border-warning/20 rounded-lg">
                  <Calendar className="h-8 w-8 text-warning mx-auto mb-2" />
                  <p className="text-2xl font-bold text-warning">
                    {todaySummary?.payload?.attendance?.leave ?? 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Leave</p>
                </div>
                <div className="text-center p-4 bg-danger/5 border border-danger/20 rounded-lg">
                  <XCircle className="h-8 w-8 text-danger mx-auto mb-2" />
                  <p className="text-2xl font-bold text-danger">
                    {todaySummary?.payload?.attendance?.absent ?? 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Absent</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Attendance Records */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Recent Attendance Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {isPending ? (
              <AttendanceRecordsSkeleton />
            ) : attendanceData?.length <= 0 ? (
              <NoData
                icon={UserCheck}
                title="No Attendance Available"
                description="There is no attendance, mark your attendance"
              />
            ) : (
              attendanceData?.map((record) => (
                <div
                  key={record?._id}
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
                        {new Date(record.checkInAt).toLocaleDateString(
                          "en-IN",
                          {
                            day: "numeric",
                            month: "short",
                            weekday: "short",
                          }
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <b className="text-gray-800">Check-In Time</b>:{" "}
                        {record.status === "present" &&
                          record.checkInAt &&
                          new Date(record.checkInAt).toLocaleTimeString(
                            "en-US",
                            {
                              hour: "numeric",
                              minute: "numeric",
                              hour12: true,
                            }
                          )}
                      </p>
                      {record.notes && <NotesDisplay notes={record.notes} />}
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
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceManagement;
